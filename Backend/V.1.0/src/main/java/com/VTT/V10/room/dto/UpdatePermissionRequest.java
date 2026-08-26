package com.VTT.V10.room.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdatePermissionRequest {
    @NotNull(message = "شناسه عضو الزامی است")
    private UUID memberId;

    private Boolean canAssets;
    private Boolean canText;
    private Boolean canFog;
    private Boolean canDrawing;

    @JsonAlias({"canScene", "canMap"})
    private Boolean canScene;

    private Boolean canRuler;
}