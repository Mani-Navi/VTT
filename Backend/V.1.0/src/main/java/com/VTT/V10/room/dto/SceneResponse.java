package com.VTT.V10.room.dto;

import lombok.Builder;
import lombok.Data;
import java.util.UUID;

@Data
@Builder
public class SceneResponse {
    private UUID id;
    private String name;
    private Boolean isActive;
    private UUID assetId;
    private String assetUrl;
    private Integer gridSize;
    private String gridColor;
}