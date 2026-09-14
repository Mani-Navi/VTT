package com.VTT.V10.voice;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;

@Slf4j
@Service
@RequiredArgsConstructor
public class VoiceService {

    private final LiveKitConfig config;
    private static final String HMAC_ALGORITHM = "HmacSHA256";

    @Async
    public CompletableFuture<String> generateTokenAsync(UUID roomId, UUID userId, String username) {
        return CompletableFuture.completedFuture(generateToken(roomId, userId, username));
    }

    public String generateToken(UUID roomId, UUID userId, String username) {
        if (roomId == null || userId == null) {
            throw new IllegalArgumentException("roomId and userId cannot be null");
        }

        try {
            long nowSec = System.currentTimeMillis() / 1000L;
            long expSec = nowSec + (4L * 60L * 60L); // ۴ ساعت اعتبار

            String safeUserId = userId.toString();
            String safeUsername = (username != null && !username.isBlank())
                    ? username.replace("\\", "\\\\").replace("\"", "\\\"")
                    : "Player";
            String safeRoomId = roomId.toString();

            // ۱. Header استاندارد JWT (دقیقاً بر اساس نیاز LiveKit SFU)
            String headerJson = "{\"alg\":\"HS256\",\"typ\":\"JWT\"}";

            // ۲. Payload دقیق استاندارد LiveKit RFC-7519
            String payloadJson = String.format(
                    "{\"iss\":\"%s\",\"sub\":\"%s\",\"name\":\"%s\",\"video\":{\"canPublish\":true,\"canSubscribe\":true,\"room\":\"%s\",\"roomJoin\":true},\"iat\":%d,\"nbf\":%d,\"exp\":%d}",
                    config.getApiKey(), safeUserId, safeUsername, safeRoomId, nowSec, nowSec, expSec
            );

            Base64.Encoder b64 = Base64.getUrlEncoder().withoutPadding();
            String encodedHeader = b64.encodeToString(headerJson.getBytes(StandardCharsets.UTF_8));
            String encodedPayload = b64.encodeToString(payloadJson.getBytes(StandardCharsets.UTF_8));
            String dataToSign = encodedHeader + "." + encodedPayload;

            // ۳. محاسبه امضای دیجیتال HMAC-SHA256 بدون SDK خارجی
            Mac mac = Mac.getInstance(HMAC_ALGORITHM);
            mac.init(config.getSecretKeySpec());

            byte[] signatureBytes = mac.doFinal(dataToSign.getBytes(StandardCharsets.UTF_8));
            String encodedSignature = b64.encodeToString(signatureBytes);

            if (log.isDebugEnabled()) {
                log.debug("LiveKit token issued successfully for user {} in room {}", userId, roomId);
            }

            return dataToSign + "." + encodedSignature;
        } catch (Exception e) {
            log.error("Failed to generate LiveKit voice token for room: {}", roomId);
            throw new IllegalStateException("خطا در تولید امضای دیجیتال صوتی", e);
        }
    }
}