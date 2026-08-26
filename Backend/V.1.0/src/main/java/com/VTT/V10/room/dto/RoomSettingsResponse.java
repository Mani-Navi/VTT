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
    private String overlayEffect;
    private Double gmFogBlend;
    private String colorTheme;
    private String inputMode;
    private Double shapeSnapSensitivity;
    private Double gridSnapSensitivity;

    // Grid Settings
    private String gridType;
    private String lineType;
    private String measurementType;
    private Integer gridSize;
    private Double gridOpacity;
    private Double lineWidth;
    private String gridColor;
    private Boolean isGridSnapping;
}