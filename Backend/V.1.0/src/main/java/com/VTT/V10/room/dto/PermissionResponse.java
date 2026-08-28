package com.VTT.V10.room.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PermissionResponse {
    private UUID memberId;
    private String username;
    private String role; // "GM" یا "Player"
    private Boolean canAssets;
    private Boolean canText;
    private Boolean canFog;
    private Boolean canDrawing;
    private Boolean canScene;

    @JsonProperty("canMap")
    public Boolean getCanMap() {
        return this.canScene;
    }

    private Boolean canRuler;
    private Boolean canEditToken;
}