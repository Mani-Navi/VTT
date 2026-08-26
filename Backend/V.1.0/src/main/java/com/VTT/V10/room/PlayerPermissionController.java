package com.VTT.V10.room;

import com.VTT.V10.room.dto.PermissionResponse;
import com.VTT.V10.room.dto.UpdatePermissionRequest;
import com.VTT.V10.websocket.dto.SocketEvent;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.UUID;

@RestController
@RequestMapping("/api/permissions")
@RequiredArgsConstructor
public class PlayerPermissionController {
    private final PlayerPermissionService permissionService;
    private final RoomMemberRepository roomMemberRepository;
    private final PlayerPermissionRepository permissionRepository;
    private final SimpMessagingTemplate messagingTemplate;

    @GetMapping("/member/{memberId}")
    public ResponseEntity<PermissionResponse> getPermissions(@PathVariable UUID memberId) {
        return ResponseEntity.ok(permissionService.getMemberPermissions(memberId));
    }

    @PutMapping
    public ResponseEntity<PermissionResponse> updatePermissions(
            @RequestBody UpdatePermissionRequest request,
            Authentication authentication
    ) {
        PlayerPermission perm = permissionRepository.findByMemberId(request.getMemberId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "عضو یافت نشد"));

        UUID roomId = perm.getRoom().getId();

        RoomMember requester = roomMemberRepository.findByRoomIdAndUserEmail(roomId, authentication.getName())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.FORBIDDEN, "شما عضو این اتاق نیستید"));

        if (requester.getRole() != RoomMember.Role.ADMIN) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "تنها GM اتاق اجازه تغییر دسترسی بازیکنان را دارد");
        }

        PermissionResponse updated = permissionService.updatePermissions(request);

        // ارسال زنده رویداد تغییر پرمیشن به تمام اعضای اتاق
        messagingTemplate.convertAndSend("/topic/room/" + roomId,
                SocketEvent.<PermissionResponse>builder()
                        .roomId(roomId)
                        .action("PERMISSION_UPDATED")
                        .data(updated)
                        .build()
        );

        return ResponseEntity.ok(updated);
    }
}