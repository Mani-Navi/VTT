package com.VTT.V10.room.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateRoomRequest {
    @NotBlank(message = "نام اتاق الزامی است")
    private String name;

    // این فیلد جدید برای انتخاب سناریو (اتاق رسمی) اضافه شده است
    // اگر null باشد، اتاق به صورت STANDARD ساخته می‌شود
    private UUID templateId;
}