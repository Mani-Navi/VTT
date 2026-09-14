package com.VTT.V10.voice;

import com.VTT.V10.room.RoomService;
import com.VTT.V10.user.User;
import com.VTT.V10.user.UserService;
import com.VTT.V10.voice.dto.VoiceTokenResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.security.Principal;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

@Slf4j
@RestController
@RequestMapping("/api/voice")
@RequiredArgsConstructor
public class VoiceController {

    private final VoiceService voiceService;
    private final LiveKitConfig config;
    private final UserService userService;
    private final RoomService roomService;

    // Rate Limiting: حداکثر ۱۰ درخواست در دقیقه به ازای هر کاربر
    private static final int MAX_REQUESTS_PER_MINUTE = 10;
    private final Map<UUID, UserRateLimitWindow> rateLimiters = new ConcurrentHashMap<>();

    @GetMapping("/token")
    public CompletableFuture<ResponseEntity<VoiceTokenResponse>> getToken(
            @RequestParam(required = false) UUID roomId,
            Principal principal
    ) {
        if (principal == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "کاربر احراز هویت نشده است");
        }
        if (roomId == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "شناسه اتاق (roomId) الزامی است");
        }

        User user = userService.getByEmail(principal.getName());

        // ۱. اعتبارسنجی عضویت کاربر در اتاق
        if (!roomService.isUserMemberOfRoom(roomId, user.getId())) {
            log.warn("Security Alert: User {} attempted to access voice in unjoined room {}", user.getId(), roomId);
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "شما عضو این اتاق نیستید");
        }

        // ۲. اعمال Rate Limit به ازای هر کاربر
        checkRateLimit(user.getId());

        // ۳. صدور ناهمگام توکن صوتی
        return voiceService.generateTokenAsync(roomId, user.getId(), user.getUsername())
                .thenApply(token -> ResponseEntity.ok(new VoiceTokenResponse(token, config.getUrl())));
    }

    private void checkRateLimit(UUID userId) {
        long currentMinute = System.currentTimeMillis() / 60000L;
        UserRateLimitWindow window = rateLimiters.compute(userId, (k, existing) -> {
            if (existing == null || existing.minuteWindow != currentMinute) {
                return new UserRateLimitWindow(currentMinute, new AtomicInteger(1));
            }
            existing.counter.incrementAndGet();
            return existing;
        });

        if (window.counter.get() > MAX_REQUESTS_PER_MINUTE) {
            log.warn("Rate limit exceeded for user: {}", userId);
            throw new ResponseStatusException(HttpStatus.TOO_MANY_REQUESTS, "تعداد درخواست‌های بیش از حد مجاز (حداکثر ۱۰ درخواست در دقیقه)");
        }
    }

    private record UserRateLimitWindow(long minuteWindow, AtomicInteger counter) {}
}