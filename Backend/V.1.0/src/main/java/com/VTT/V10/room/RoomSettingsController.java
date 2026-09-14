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

    @GetMapping
    public ResponseEntity<RoomSettingsResponse> getSettings(
            @PathVariable UUID roomId,
            Authentication authentication
    ) {
        validateAuth(authentication);
        return ResponseEntity.ok(settingsService.getSettings(roomId, authentication.getName()));
    }

    @PutMapping
    public ResponseEntity<RoomSettingsResponse> updateSettings(
            @PathVariable UUID roomId,
            @RequestBody RoomSettingsResponse request,
            Authentication authentication
    ) {
        validateAuth(authentication);
        return ResponseEntity.ok(settingsService.updateSettings(roomId, request, authentication.getName()));
    }

    @PostMapping("/reset")
    public ResponseEntity<RoomSettingsResponse> resetSettings(
            @PathVariable UUID roomId,
            Authentication authentication
    ) {
        validateAuth(authentication);
        return ResponseEntity.ok(settingsService.resetToDefault(roomId, authentication.getName()));
    }

    private void validateAuth(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "احراز هویت الزامی است");
        }
    }
}