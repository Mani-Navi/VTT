package com.VTT.V10.auth.dto;

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
public class LoginRequest {

    @NotBlank(message = "ایمیل الزامی است")
    @Email(message = "فرمت ایمیل نامعتبر است")
    private String email;

    @NotBlank(message = "رمز عبور الزامی است")
    private String password;
}