package com.VTT.V10.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RegisterRequest {

    @NotBlank(message = "نام کاربری نباید خالی باشد")
    @Size(min = 3, max = 50, message = "نام کاربری باید بین ۳ تا ۵۰ کاراکتر باشد")
    @Pattern(regexp = "^[a-zA-Z0-9_]+$", message = "فقط حروف انگلیسی، عدد و _ مجاز است")
    private String username;

    @NotBlank(message = "ایمیل نباید خالی باشد")
    @Email(message = "فرمت ایمیل صحیح نیست")
    private String email;

    @NotBlank(message = "رمز عبور نباید خالی باشد")
    @Size(min = 8, max = 72, message = "رمز عبور باید حداقل ۸ کاراکتر باشد")
    private String password;
}