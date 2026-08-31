package com.VTT.V10.room;

import com.VTT.V10.room.dto.PermissionResponse;
import com.VTT.V10.room.dto.UpdatePermissionRequest;
import com.VTT.V10.user.User;
import com.VTT.V10.user.UserRepository;
import com.VTT.V10.websocket.dto.SocketEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.Optional;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/permissions")
@RequiredArgsConstructor
public class PlayerPermissionController {
    private final PlayerPermissionService permissionService;
    private final RoomMemberRepository roomMemberRepository;
    private final RoomRepository roomRepository;
    private final UserRepository userRepository;
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
        if (request == null || request.getMemberId() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "شناسه عضو الزامی است");
        }

        RoomMember targetMember = roomMemberRepository.findById(request.getMemberId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "عضو مورد نظر یافت نشد"));

        UUID roomId = targetMember.getRoom().getId();
        String userEmail = authentication.getName();

        // بررسی اینکه آیا درخواست‌دهنده GM یا مالک اتاق است
        boolean isOwner = false;
        Optional<User> userOpt = userRepository.findByEmail(userEmail);
        Optional<Room> roomOpt = roomRepository.findById(roomId);
        if (userOpt.isPresent() && roomOpt.isPresent() && roomOpt.get().getOwner() != null) {
            isOwner = roomOpt.get().getOwner().getId().equals(userOpt.get().getId());
        }

        Optional<RoomMember> requesterOpt = roomMemberRepository.findByRoomIdAndUserEmail(roomId, userEmail);
        boolean isAdmin = requesterOpt.isPresent() && requesterOpt.get().getRole() == RoomMember.Role.ADMIN;

        if (!isOwner && !isAdmin) {
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