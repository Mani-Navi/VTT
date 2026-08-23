package com.VTT.V10.room.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateRoomRequest {

    @NotBlank(message = "نام اتاق الزامی است")
    @Size(min = 2, max = 100, message = "نام اتاق باید بین ۲ تا ۱۰۰ کاراکتر باشد")
    private String name;

    // پشتیبانی همزمان از expire_days و expireDays
    @JsonProperty("expire_days")
    @JsonAlias({"expireDays", "expire_days"})
    @Min(value = 1, message = "مدت اعتبار حداقل ۱ روز است")
    @Max(value = 365, message = "مدت اعتبار حداکثر ۳۶۵ روز است")
    private Integer expireDays;

    // برای انتخاب سناریو (اتاق رسمی)
    // اگر null باشد، اتاق به صورت STANDARD ساخته می‌شود
    private UUID templateId;
}