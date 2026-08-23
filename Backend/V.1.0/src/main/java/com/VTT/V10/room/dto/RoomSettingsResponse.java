package com.VTT.V10.room.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RoomSettingsResponse {
    private UUID roomId;
    private Double zoomSensitivity;
    private String colorTheme;
    private Double gridSnapSensitivity;
    private Double lineWidth;
    private Double gmFogBlend;
    private String overlayEffect;
}