package com.VTT.V10.user;

import com.VTT.V10.auth.JwtService;
import com.VTT.V10.auth.dto.AuthResponse;
import com.VTT.V10.auth.dto.UserDto;
import com.VTT.V10.mail.EmailService;
import com.VTT.V10.room.RoomMemberRepository;
import com.VTT.V10.user.dto.ChangeEmailRequest;
import com.VTT.V10.user.dto.ChangePasswordRequest;
import com.VTT.V10.user.dto.UpdateProfileRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.Random;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final RoomMemberRepository roomMemberRepository;
    private final JwtService jwtService;
    private final EmailService emailService;

    public UserDto getProfile(String userEmail) {
        User user = getUserByEmail(userEmail);
        return toDto(user);
    }

    @Transactional
    public UserDto updateProfile(String userEmail, UpdateProfileRequest request) {
        User user = getUserByEmail(userEmail);

        if (request.getUsername() != null && !request.getUsername().isBlank()
                && !request.getUsername().equals(user.getUsername())) {
            if (userRepository.existsByUsername(request.getUsername().trim())) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "این نام کاربری قبلاً انتخاب شده است");
            }
            user.setUsername(request.getUsername().trim());
        }

        if (request.getAvatarUrl() != null && !request.getAvatarUrl().isBlank()) {
            user.setAvatarUrl(request.getAvatarUrl().trim());
        }

        user = userRepository.save(user);
        return toDto(user);
    }

    @Transactional
    public void changePassword(String userEmail, ChangePasswordRequest request) {
        User user = getUserByEmail(userEmail);

        if (user.getPassword() == null || !passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "رمز عبور فعلی نادرست است");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }

    @Transactional
    public AuthResponse changeEmail(String userEmail, ChangeEmailRequest request) {
        User user = getUserByEmail(userEmail);

        if (user.getPassword() == null || !passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "رمز عبور نادرست است");
        }

        String targetEmail = request.getNewEmail().trim().toLowerCase();
        if (userRepository.existsByEmail(targetEmail)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "این ایمیل قبلاً ثبت شده است");
        }

        user.setEmail(targetEmail);
        user.setEmailVerified(false);
        user.setVerificationCode(null);
        user.setVerificationExpiry(null);
        user = userRepository.save(user);

        // تولید توکن جدید با شناسه و ایمیل به‌روزرسانی شده
        String newToken = jwtService.generateToken(user);
        UserDto userDto = toDto(user);

        return AuthResponse.builder()
                .token(newToken)
                .userId(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .user(userDto)
                .build();
    }

    @Transactional
    public void sendVerificationCode(String userEmail) {
        User user = getUserByEmail(userEmail);

        String code = String.format("%06d", new Random().nextInt(999999));
        user.setVerificationCode(code);
        user.setVerificationExpiry(LocalDateTime.now().plusMinutes(2));
        userRepository.save(user);

        log.info("📧 [Titipool Console OTP] Email: {} | Code: {}", user.getEmail(), code);

        // ارسال ایمیل واقعی
        emailService.sendOtpCode(user.getEmail(), code);
    }

    @Transactional
    public UserDto verifyCode(String userEmail, String code) {
        User user = getUserByEmail(userEmail);

        if (user.getVerificationCode() == null || user.getVerificationExpiry() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "کد تاییدی ارسال نشده است");
        }

        if (LocalDateTime.now().isAfter(user.getVerificationExpiry())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "کد تایید منقضی شده است. لطفاً کد جدید دریافت کنید");
        }

        if (!user.getVerificationCode().equals(code.trim())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "کد وارد شده اشتباه است");
        }

        user.setEmailVerified(true);
        user.setVerificationCode(null);
        user.setVerificationExpiry(null);
        user = userRepository.save(user);

        return toDto(user);
    }

    private User getUserByEmail(String email) {
        return userRepository.findByEmail(email.trim().toLowerCase())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "کاربر یافت نشد"));
    }

    private UserDto toDto(User user) {
        long rooms = roomMemberRepository.countByUserId(user.getId());

        return UserDto.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .avatarUrl(user.getAvatarUrl())
                .isEmailVerified(user.isEmailVerified())
                .isPremium(user.isPremium())
                .roomsCount(rooms)
                .createdAt(user.getCreatedAt())
                .build();
    }
}