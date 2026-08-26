package com.VTT.V10.room;

import com.VTT.V10.room.dto.RoomSettingsResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.UUID;

@RestController
@RequestMapping("/api/rooms/{roomId}/settings")
@RequiredArgsConstructor
public class RoomSettingsController {

    private final RoomSettingsService settingsService;
    private final RoomMemberRepository roomMemberRepository;

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
        RoomMember member = roomMemberRepository.findByRoomIdAndUserEmail(roomId, authentication.getName())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.FORBIDDEN, "شما عضو این اتاق نیستید"));

        if (member.getRole() != RoomMember.Role.ADMIN) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "تنها سازنده اتاق (GM) اجازه تغییر تنظیمات را دارد");
        }

        return ResponseEntity.ok(settingsService.updateSettings(roomId, request));
    }

    @PostMapping("/reset")
    public ResponseEntity<RoomSettingsResponse> resetSettings(
            @PathVariable UUID roomId,
            Authentication authentication
    ) {
        RoomMember member = roomMemberRepository.findByRoomIdAndUserEmail(roomId, authentication.getName())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.FORBIDDEN, "شما عضو این اتاق نیستید"));

        if (member.getRole() != RoomMember.Role.ADMIN) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "تنها سازنده اتاق (GM) اجازه بازنشانی تنظیمات را دارد");
        }

        return ResponseEntity.ok(settingsService.resetToDefault(roomId));
    }
}