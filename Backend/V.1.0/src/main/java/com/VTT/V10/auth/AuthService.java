package com.VTT.V10.auth;

import com.VTT.V10.auth.dto.AuthResponse;
import com.VTT.V10.auth.dto.GoogleAuthRequest;
import com.VTT.V10.auth.dto.LoginRequest;
import com.VTT.V10.auth.dto.RegisterRequest;
import com.VTT.V10.auth.dto.UserDto;
import com.VTT.V10.user.User;
import com.VTT.V10.user.UserRepository;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.Collections;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    @Value("${google.client-id:}")
    private String googleClientId;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail().trim().toLowerCase())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "این ایمیل قبلاً ثبت شده است");
        }
        if (userRepository.existsByUsername(request.getUsername().trim())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "این نام کاربری قبلاً انتخاب شده است");
        }

        User user = User.builder()
                .username(request.getUsername().trim())
                .email(request.getEmail().trim().toLowerCase())
                .password(passwordEncoder.encode(request.getPassword()))
                .isEmailVerified(false)
                .isPremium(false)
                .build();

        // دریافت موجودیت پایدارشده با ID تولیدی معتبر
        user = userRepository.save(user);

        String token = jwtService.generateToken(user);
        UserDto userDto = buildUserDto(user);

        return AuthResponse.builder()
                .token(token)
                .userId(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .user(userDto)
                .build();
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail().trim().toLowerCase())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "ایمیل یا رمز عبور اشتباه است"));

        if (user.getPassword() == null || !passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "ایمیل یا رمز عبور اشتباه است");
        }

        String token = jwtService.generateToken(user);
        UserDto userDto = buildUserDto(user);

        return AuthResponse.builder()
                .token(token)
                .userId(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .user(userDto)
                .build();
    }

    @Transactional
    public AuthResponse loginWithGoogle(GoogleAuthRequest request) {
        try {
            GoogleIdTokenVerifier.Builder verifierBuilder = new GoogleIdTokenVerifier.Builder(
                    new NetHttpTransport(),
                    GsonFactory.getDefaultInstance()
            );

            if (googleClientId != null && !googleClientId.isBlank()) {
                verifierBuilder.setAudience(Collections.singletonList(googleClientId));
            }

            GoogleIdTokenVerifier verifier = verifierBuilder.build();
            GoogleIdToken idToken = verifier.verify(request.getIdToken());

            if (idToken == null) {
                throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "توکن گوگل نامعتبر یا منقضی شده است");
            }

            GoogleIdToken.Payload payload = idToken.getPayload();
            String email = payload.getEmail().trim().toLowerCase();
            String name = (String) payload.get("name");
            String pictureUrl = (String) payload.get("picture");
            String googleSub = payload.getSubject();

            User user = userRepository.findByEmail(email).orElseGet(() -> {
                String baseUsername = (name != null ? name.replaceAll("\\s+", "_").toLowerCase() : email.split("@")[0]);
                String generatedUsername = baseUsername;
                int counter = 1;
                while (userRepository.existsByUsername(generatedUsername)) {
                    generatedUsername = baseUsername + counter++;
                }

                User newUser = User.builder()
                        .email(email)
                        .username(generatedUsername)
                        .avatarUrl(pictureUrl)
                        .googleId(googleSub)
                        .isEmailVerified(true)
                        .isPremium(false)
                        .password(passwordEncoder.encode(UUID.randomUUID().toString()))
                        .build();

                return userRepository.save(newUser);
            });

            if (user.getAvatarUrl() == null && pictureUrl != null) {
                user.setAvatarUrl(pictureUrl);
                user = userRepository.save(user);
            }

            String token = jwtService.generateToken(user);
            UserDto userDto = buildUserDto(user);

            return AuthResponse.builder()
                    .token(token)
                    .userId(user.getId())
                    .username(user.getUsername())
                    .email(user.getEmail())
                    .user(userDto)
                    .build();

        } catch (ResponseStatusException e) {
            throw e;
        } catch (Exception e) {
            log.error("Google Auth verification failed: ", e);
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "اعتبارسنجی حساب گوگل ناموفق بود");
        }
    }

    private UserDto buildUserDto(User user) {
        return UserDto.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .avatarUrl(user.getAvatarUrl())
                .isEmailVerified(user.isEmailVerified())
                .isPremium(user.isPremium())
                .createdAt(user.getCreatedAt())
                .build();
    }
}