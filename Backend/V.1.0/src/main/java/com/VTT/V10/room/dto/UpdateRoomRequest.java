package com.VTT.V10.room.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateRoomRequest {

    @NotBlank(message = "نام اتاق الزامی است")
    @Size(min = 3, max = 40, message = "نام اتاق باید بین ۳ تا ۴۰ کاراکتر باشد")
    private String name;

    @Size(max = 200, message = "توضیحات اتاق حداکثر ۲۰۰ کاراکتر است")
    private String description;

    private String password;
}