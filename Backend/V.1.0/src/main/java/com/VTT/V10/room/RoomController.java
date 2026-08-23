package com.VTT.V10.room;

import com.VTT.V10.room.dto.CreateRoomRequest;
import com.VTT.V10.room.dto.RoomResponse;
import com.VTT.V10.room.dto.JoinRoomRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/rooms")
@RequiredArgsConstructor
public class RoomController {
    private final RoomService roomService;

    // دریافت اتاق‌ها جهت داشبورد (حل خطای GET)
    @GetMapping
    public ResponseEntity<List<RoomResponse>> getRooms(Authentication authentication) {
        return ResponseEntity.ok(roomService.getUserRooms(authentication.getName()));
    }

    @PostMapping
    public ResponseEntity<RoomResponse> createRoom(
            @Valid @RequestBody CreateRoomRequest request,
            Authentication authentication
    ) {
        return ResponseEntity.ok(roomService.createRoom(request, authentication.getName()));
    }

    @PostMapping("/join")
    public ResponseEntity<RoomResponse> joinRoom(
            @Valid @RequestBody JoinRoomRequest request,
            Authentication authentication
    ) {
        return ResponseEntity.ok(roomService.joinRoom(request.getRoomCode(), authentication.getName()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRoom(
            @PathVariable UUID id,
            Authentication authentication
    ) {
        roomService.deleteRoom(id, authentication.getName());
        return ResponseEntity.noContent().build();
    }
}