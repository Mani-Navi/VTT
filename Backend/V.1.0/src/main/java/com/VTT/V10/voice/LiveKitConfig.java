package com.VTT.V10.voice;

import jakarta.annotation.PostConstruct;
import lombok.Getter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;

@Getter
@Configuration
public class LiveKitConfig {

    private static final String HMAC_SHA256 = "HmacSHA256";

    @Value("${livekit.url:ws://localhost:7880}")
    private String url;

    @Value("${livekit.api-key:devkey}")
    private String apiKey;

    @Value("${livekit.api-secret:secret}")
    private String apiSecret;

    private SecretKeySpec secretKeySpec;

    @PostConstruct
    public void validateConfiguration() {
        if (url == null || url.isBlank()) {
            throw new IllegalStateException("تنظیمات LiveKit ناقص است: livekit.url نباید خالی باشد");
        }
        if (apiKey == null || apiKey.isBlank()) {
            throw new IllegalStateException("تنظیمات LiveKit ناقص است: livekit.api-key نباید خالی باشد");
        }
        if (apiSecret == null || apiSecret.isBlank()) {
            throw new IllegalStateException("تنظیمات LiveKit ناقص است: livekit.api-secret نباید خالی باشد");
        }
        this.secretKeySpec = new SecretKeySpec(apiSecret.getBytes(StandardCharsets.UTF_8), HMAC_SHA256);
    }
}