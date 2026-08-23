package com.VTT.V10.room.dto;

import lombok.Builder;
import lombok.Data;
import java.util.UUID;

@Data @Builder
public class PermissionResponse {
    private UUID memberId;
    private String username;
    private Boolean canAssets;
    private Boolean canText;
    private Boolean canFog;
    private Boolean canDrawing;
    private Boolean canScene;
    private Boolean canRuler;
}