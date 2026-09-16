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
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.security.SecureRandom;
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

    private GoogleIdTokenVerifier verifier;
    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    @PostConstruct
    public void initGoogleVerifier() {
        if (googleClientId != null && !googleClientId.isBlank()) {
            this.verifier = new GoogleIdTokenVerifier.Builder(
                    new NetHttpTransport(),
                    GsonFactory.getDefaultInstance()
            )
                    .setAudience(Collections.singletonList(googleClientId))
                    .build();
            log.info("Google Token Verifier initialized successfully with audience verification.");
        } else {
            log.warn("GOOGLE_CLIENT_ID is not configured. Google Sign-In will be disabled until set.");
        }
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        String email = request.getEmail().trim().toLowerCase();
        String username = request.getUsername().trim();

        if (userRepository.existsByEmail(email)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "این ایمیل قبلاً ثبت شده است");
        }
        if (userRepository.existsByUsername(username)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "این نام کاربری قبلاً انتخاب شده است");
        }

        User user = User.builder()
                .username(username)
                .email(email)
                .password(passwordEncoder.encode(request.getPassword()))
                .isEmailVerified(false)
                .isPremium(false)
                .build();

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

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        String email = request.getEmail().trim().toLowerCase();

        User user = userRepository.findByEmail(email)
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
        if (verifier == null) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "ورود با گوگل در حال حاضر فعال نیست (Client ID تنظیم نشده است)");
        }

        if (request.getIdToken() == null || request.getIdToken().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "توکن گوگل نمی‌تواند خالی باشد");
        }

        try {
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

                int attempts = 0;
                while (userRepository.existsByUsername(generatedUsername) && attempts < 5) {
                    generatedUsername = baseUsername + "_" + (100 + SECURE_RANDOM.nextInt(900));
                    attempts++;
                }

                if (userRepository.existsByUsername(generatedUsername)) {
                    generatedUsername = "user_" + UUID.randomUUID().toString().substring(0, 8);
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

            // اگر کاربر قبلاً آواتار نداشته و گوگل عکس دارد، آپدیت شود
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
            log.error("Google Auth verification failed: {}", e.getMessage());
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