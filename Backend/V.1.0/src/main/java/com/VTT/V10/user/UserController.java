package com.VTT.V10.user;

import com.VTT.V10.auth.dto.AuthResponse;
import com.VTT.V10.auth.dto.UserDto;
import com.VTT.V10.user.dto.ChangeEmailRequest;
import com.VTT.V10.user.dto.ChangePasswordRequest;
import com.VTT.V10.user.dto.UpdateProfileRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
public class UserController {
    private final UserService userService;

    @GetMapping("/profile")
    public ResponseEntity<UserDto> getProfile(Authentication auth) {
        return ResponseEntity.ok(userService.getProfile(auth.getName()));
    }

    @PutMapping("/profile")
    public ResponseEntity<UserDto> updateProfile(
            Authentication auth,
            @Valid @RequestBody UpdateProfileRequest request
    ) {
        return ResponseEntity.ok(userService.updateProfile(auth.getName(), request));
    }

    @PostMapping("/change-password")
    public ResponseEntity<Void> changePassword(
            Authentication auth,
            @Valid @RequestBody ChangePasswordRequest request
    ) {
        userService.changePassword(auth.getName(), request);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/change-email")
    public ResponseEntity<AuthResponse> changeEmail(
            Authentication auth,
            @Valid @RequestBody ChangeEmailRequest request
    ) {
        return ResponseEntity.ok(userService.changeEmail(auth.getName(), request));
    }

    @PostMapping("/send-verification-code")
    public ResponseEntity<Void> sendVerificationCode(Authentication auth) {
        userService.sendVerificationCode(auth.getName());
        return ResponseEntity.ok().build();
    }

    @PostMapping("/verify-code")
    public ResponseEntity<UserDto> verifyCode(
            Authentication auth,
            @RequestBody Map<String, String> body
    ) {
        String code = body.get("code");
        return ResponseEntity.ok(userService.verifyCode(auth.getName(), code));
    }
}