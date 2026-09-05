package com.VTT.V10.voice;

import lombok.Getter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

@Getter
@Configuration
public class LiveKitConfig {

    @Value("${livekit.url:ws://localhost:7880}")
    private String url;

    @Value("${livekit.api-key:devkey}")
    private String apiKey;

    @Value("${livekit.api-secret:vtt-api-secret-min-32-chars-long!!}")
    private String apiSecret;
}