package com.VTT.V10.room;

import com.VTT.V10.room.dto.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/rooms")
@RequiredArgsConstructor
public class RoomController {

    private final RoomService roomService;

    @GetMapping
    public ResponseEntity<List<RoomResponse>> getRooms(Authentication authentication) {
        return ResponseEntity.ok(roomService.getUserRooms(authentication.getName()));
    }

    @GetMapping("/templates")
    public ResponseEntity<List<RoomTemplateResponse>> getTemplates() {
        return ResponseEntity.ok(roomService.getAvailableTemplates());
    }

    @GetMapping("/{roomId}")
    public ResponseEntity<RoomResponse> getRoom(
            @PathVariable UUID roomId,
            Authentication authentication
    ) {
        return ResponseEntity.ok(roomService.getRoomById(roomId, authentication.getName()));
    }

    @PostMapping
    public ResponseEntity<RoomResponse> createRoom(
            @RequestBody CreateRoomRequest request,
            Authentication authentication
    ) {
        return ResponseEntity.ok(roomService.createRoom(request, authentication.getName()));
    }

    @PutMapping("/{roomId}")
    public ResponseEntity<RoomResponse> updateRoom(
            @PathVariable UUID roomId,
            @RequestBody UpdateRoomRequest request,
            Authentication authentication
    ) {
        return ResponseEntity.ok(roomService.updateRoom(roomId, request, authentication.getName()));
    }

    @PostMapping("/join")
    public ResponseEntity<RoomResponse> joinRoom(
            @RequestBody JoinRoomRequest request,
            Authentication authentication
    ) {
        return ResponseEntity.ok(roomService.joinRoom(request, authentication.getName()));
    }

    @PostMapping("/{roomId}/close")
    public ResponseEntity<Void> closeRoom(
            @PathVariable UUID roomId,
            Authentication authentication
    ) {
        roomService.closeRoom(roomId, authentication.getName());
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{roomId}/members")
    public ResponseEntity<List<RoomMemberResponse>> getRoomMembers(
            @PathVariable UUID roomId,
            Authentication authentication
    ) {
        return ResponseEntity.ok(roomService.getRoomMembers(roomId, authentication.getName()));
    }

    @PostMapping("/{roomId}/members/{memberId}/kick")
    public ResponseEntity<Void> kickMember(
            @PathVariable UUID roomId,
            @PathVariable UUID memberId,
            Authentication authentication
    ) {
        roomService.kickMember(roomId, memberId, authentication.getName());
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{roomId}/members/{memberId}/ban")
    public ResponseEntity<Void> banMember(
            @PathVariable UUID roomId,
            @PathVariable UUID memberId,
            Authentication authentication
    ) {
        roomService.banMember(roomId, memberId, authentication.getName());
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{roomId}/members/{memberId}/mute")
    public ResponseEntity<RoomMemberResponse> muteMember(
            @PathVariable UUID roomId,
            @PathVariable UUID memberId,
            Authentication authentication
    ) {
        return ResponseEntity.ok(roomService.toggleMuteMember(roomId, memberId, authentication.getName()));
    }

    @PatchMapping("/{roomId}/members/{memberId}/role")
    public ResponseEntity<RoomMemberResponse> changeMemberRole(
            @PathVariable UUID roomId,
            @PathVariable UUID memberId,
            @RequestBody Map<String, String> body,
            Authentication authentication
    ) {
        String newRole = body.getOrDefault("role", "Player");
        return ResponseEntity.ok(roomService.changeMemberRole(roomId, memberId, newRole, authentication.getName()));
    }

    @PostMapping("/{roomId}/leave")
    public ResponseEntity<Void> leaveRoom(
            @PathVariable UUID roomId,
            Authentication authentication
    ) {
        roomService.leaveRoom(roomId, authentication.getName());
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{roomId}")
    public ResponseEntity<Void> deleteRoom(
            @PathVariable UUID roomId,
            Authentication authentication
    ) {
        roomService.deleteRoom(roomId, authentication.getName());
        return ResponseEntity.noContent().build();
    }
}