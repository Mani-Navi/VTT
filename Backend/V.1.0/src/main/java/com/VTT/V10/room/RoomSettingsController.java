package com.VTT.V10.room;

import com.VTT.V10.room.dto.RoomSettingsResponse;
import com.VTT.V10.user.User;
import com.VTT.V10.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/rooms/{roomId}/settings")
@RequiredArgsConstructor
public class RoomSettingsController {

    private final RoomSettingsService settingsService;
    private final RoomMemberRepository roomMemberRepository;
    private final RoomRepository roomRepository;
    private final UserRepository userRepository;

    @GetMapping
    public ResponseEntity<RoomSettingsResponse> getSettings(@PathVariable UUID roomId) {
        return ResponseEntity.ok(settingsService.getSettings(roomId));
    }

    @PutMapping
    public ResponseEntity<RoomSettingsResponse> updateSettings(
            @PathVariable UUID roomId,
            @RequestBody RoomSettingsResponse request,
            Authentication authentication
    ) {
        if (!isAuthorizedGM(roomId, authentication.getName())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "تنها سازنده اتاق (GM) اجازه تغییر تنظیمات را دارد");
        }

        return ResponseEntity.ok(settingsService.updateSettings(roomId, request));
    }

    @PostMapping("/reset")
    public ResponseEntity<RoomSettingsResponse> resetSettings(
            @PathVariable UUID roomId,
            Authentication authentication
    ) {
        if (!isAuthorizedGM(roomId, authentication.getName())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "تنها سازنده اتاق (GM) اجازه بازنشانی تنظیمات را دارد");
        }

        return ResponseEntity.ok(settingsService.resetToDefault(roomId));
    }

    private boolean isAuthorizedGM(UUID roomId, String email) {
        try {
            // ۱. بررسی مالکیت اصلی اتاق
            Optional<User> userOpt = userRepository.findByEmail(email);
            Optional<Room> roomOpt = roomRepository.findById(roomId);
            if (userOpt.isPresent() && roomOpt.isPresent()) {
                Room room = roomOpt.get();
                if (room.getOwner() != null && userOpt.get().getId() != null) {
                    if (room.getOwner().getId().equals(userOpt.get().getId())) {
                        return true;
                    }
                }
            }

            // ۲. بررسی نقش ادمین در اعضا
            var memberOpt = roomMemberRepository.findByRoomIdAndUserEmail(roomId, email);
            return memberOpt.isPresent() && memberOpt.get().getRole() == RoomMember.Role.ADMIN;
        } catch (Exception e) {
            return false;
        }
    }
}