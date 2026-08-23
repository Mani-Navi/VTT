package com.VTT.V10.room;

import com.VTT.V10.room.dto.RoomSettingsResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/rooms/{roomId}/settings")
@RequiredArgsConstructor
public class RoomSettingsController {
    private final RoomSettingsService settingsService;

    @GetMapping
    public ResponseEntity<RoomSettingsResponse> getSettings(@PathVariable UUID roomId) {
        return ResponseEntity.ok(settingsService.getSettings(roomId));
    }

    @PutMapping
    public ResponseEntity<RoomSettingsResponse> updateSettings(
            @PathVariable UUID roomId,
            @RequestBody RoomSettingsResponse request
    ) {
        // نکته: در اینجا GM بودن کاربر باید چک شود
        return ResponseEntity.ok(settingsService.updateSettings(roomId, request));
    }
}