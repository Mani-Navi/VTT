package com.VTT.V10.room.dto;

import lombok.Data;
import java.util.UUID;

@Data
public class UpdatePermissionRequest {
    private UUID memberId;
    private Boolean canAssets;
    private Boolean canText;
    private Boolean canFog;
    private Boolean canDrawing;
    private Boolean canScene;
    private Boolean canRuler;
}