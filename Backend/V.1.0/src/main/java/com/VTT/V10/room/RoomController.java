package com.VTT.V10.room;

import com.VTT.V10.room.dto.CreateRoomRequest;
import com.VTT.V10.room.dto.RoomResponse;
import com.VTT.V10.room.dto.JoinRoomRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/rooms")
@RequiredArgsConstructor
public class RoomController {
    private final RoomService roomService;

    @PostMapping
    public ResponseEntity<RoomResponse> createRoom(
            @Valid @RequestBody CreateRoomRequest request,
            Authentication authentication // گرفتن اطلاعات کاربر از توکن JWT
    ) {
        String email = authentication.getName();
        return ResponseEntity.ok(roomService.createRoom(request, email));
    }

    @PostMapping("/join")
    public ResponseEntity<RoomResponse> joinRoom(
            @Valid @RequestBody JoinRoomRequest request,
            Authentication authentication
    ) {
        return ResponseEntity.ok(roomService.joinRoom(request.getRoomCode(), authentication.getName()));
    }
}