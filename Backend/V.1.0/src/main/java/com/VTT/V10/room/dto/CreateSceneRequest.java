package com.VTT.V10.room.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.util.UUID;

@Data
public class CreateSceneRequest {
    @NotNull(message = "ID اتاق الزامی است")
    private UUID roomId;

    @NotNull(message = "ID فایل نقشه الزامی است")
    private UUID assetId;

    @NotBlank(message = "نام سکانس نباید خالی باشد")
    private String name;

    private Boolean isActive = false;
}