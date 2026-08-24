package com.VTT.V10.user.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChangeEmailRequest {
    @NotBlank(message = "ایمیل جدید الزامی است")
    @Email(message = "فرمت ایمیل نامعتبر است")
    private String newEmail;

    @NotBlank(message = "رمز عبور فعلی جهت تایید هویت الزامی است")
    private String password;
}