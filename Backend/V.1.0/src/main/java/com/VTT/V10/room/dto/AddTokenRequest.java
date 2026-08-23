package com.VTT.V10.room.dto;

import lombok.Data;
import java.util.UUID;

@Data
public class AddTokenRequest {
    private UUID sceneId;
    private UUID assetId;
    private String label;
    private Double x;
    private Double y;
}