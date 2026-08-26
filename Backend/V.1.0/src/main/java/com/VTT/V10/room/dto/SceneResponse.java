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
public class SceneResponse {
    private UUID id;
    private String name;
    private Boolean isActive;
    private UUID assetId;
    private String assetUrl;
    private String mapUrl;
    private Integer mapWidth;
    private Integer mapHeight;
    private Integer gridSize;
    private String gridColor;
    private Double gridOpacity;
}