package com.VTT.V10.auth;

import com.VTT.V10.auth.dto.AuthResponse;
import com.VTT.V10.auth.dto.LoginRequest;
import com.VTT.V10.auth.dto.RegisterRequest;
import com.VTT.V10.user.User;
import com.VTT.V10.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("این ایمیل قبلاً ثبت شده است");
        }
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("این نام کاربری قبلاً انتخاب شده است");
        }

        User user = User.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .build();

        userRepository.save(user);
        String token = jwtService.generateToken(user);

        return AuthResponse.builder()
                .token(token)
                .userId(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .build();
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("کاربری با این مشخصات یافت نشد"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("رمز عبور اشتباه است");
        }

        String token = jwtService.generateToken(user);

        return AuthResponse.builder()
                .token(token)
                .userId(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .build();
    }
}