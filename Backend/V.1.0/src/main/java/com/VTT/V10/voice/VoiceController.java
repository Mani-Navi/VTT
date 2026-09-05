package com.VTT.V10.voice;

import com.VTT.V10.user.User;
import com.VTT.V10.user.UserRepository;
import com.VTT.V10.voice.dto.VoiceTokenResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.security.Principal;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/voice")
@RequiredArgsConstructor
public class VoiceController {

    private final VoiceService voiceService;
    private final LiveKitConfig config;
    private final UserRepository userRepository;

    @GetMapping("/token")
    public ResponseEntity<VoiceTokenResponse> getToken(
            @RequestParam UUID roomId,
            Principal principal
    ) {
        if (principal == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "کاربر احراز هویت نشده است");
        }

        User user = userRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "کاربر یافت نشد"));

        String liveKitToken = voiceService.generateToken(roomId, user.getId(), user.getUsername());

        return ResponseEntity.ok(new VoiceTokenResponse(liveKitToken, config.getUrl()));
    }
}