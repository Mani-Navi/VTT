package com.VTT.V10.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class RegisterRequest {
    @NotBlank(message = "نام کاربری نباید خالی باشد")
    @Size(min = 3, max = 50)
    private String username;

    @NotBlank(message = "ایمیل نباید خالی باشد")
    @Email(message = "فرمت ایمیل صحیح نیست")
    private String email;

    @NotBlank(message = "رمز عبور نباید خالی باشد")
    @Size(min = 6, message = "رمز عبور باید حداقل ۶ کاراکتر باشد")
    private String password;
}