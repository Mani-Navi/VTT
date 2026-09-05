package com.VTT.V10.voice;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class VoiceService {

    private final LiveKitConfig config;

    public String generateToken(UUID roomId, UUID userId, String username) {
        try {
            long nowSec = System.currentTimeMillis() / 1000L;
            long expSec = nowSec + (4L * 60L * 60L); // ۴ ساعت اعتبار

            String apiKey = (config.getApiKey() != null && !config.getApiKey().isBlank())
                    ? config.getApiKey()
                    : "devkey";

            String secret = (config.getApiSecret() != null && !config.getApiSecret().isBlank())
                    ? config.getApiSecret()
                    : "secret";

            String safeUserId = (userId != null) ? userId.toString() : UUID.randomUUID().toString();
            String safeUsername = (username != null && !username.isBlank())
                    ? username.replace("\"", "\\\"")
                    : "Player";
            String safeRoomId = (roomId != null) ? roomId.toString() : "default-room";

            // ۱. Header استاندارد JWT
            String headerJson = "{\"alg\":\"HS256\",\"typ\":\"JWT\"}";

            // ۲. Payload دقیق استاندارد LiveKit SFU
            String payloadJson = String.format(
                    "{\"iss\":\"%s\",\"sub\":\"%s\",\"name\":\"%s\",\"video\":{\"canPublish\":true,\"canSubscribe\":true,\"room\":\"%s\",\"roomJoin\":true},\"iat\":%d,\"nbf\":%d,\"exp\":%d}",
                    apiKey, safeUserId, safeUsername, safeRoomId, nowSec, nowSec, expSec
            );

            Base64.Encoder b64 = Base64.getUrlEncoder().withoutPadding();
            String encodedHeader = b64.encodeToString(headerJson.getBytes(StandardCharsets.UTF_8));
            String encodedPayload = b64.encodeToString(payloadJson.getBytes(StandardCharsets.UTF_8));
            String dataToSign = encodedHeader + "." + encodedPayload;

            // ۳. محاسبه امضای HMAC-SHA256 استاندارد
            Mac mac = Mac.getInstance("HmacSHA256");
            SecretKeySpec secretKeySpec = new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
            mac.init(secretKeySpec);

            byte[] signatureBytes = mac.doFinal(dataToSign.getBytes(StandardCharsets.UTF_8));
            String encodedSignature = b64.encodeToString(signatureBytes);

            return dataToSign + "." + encodedSignature;
        } catch (Exception e) {
            log.error("Error generating LiveKit token: ", e);
            throw new RuntimeException("خطا در تولید توکن صدا", e);
        }
    }
}