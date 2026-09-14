package com.VTT.V10.room.dto;

import jakarta.validation.constraints.NotBlank;
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
public class CreateSceneRequest {

    @NotNull(message = "شناسه اتاق الزامی است")
    private UUID roomId;

    @NotBlank(message = "نام صحنه نباید خالی باشد")
    private String name;

    private UUID assetId;
    private String mapUrl;

    @Builder.Default
    private Boolean isActive = true;
}