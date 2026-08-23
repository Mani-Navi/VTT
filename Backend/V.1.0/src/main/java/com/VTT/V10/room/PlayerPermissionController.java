package com.VTT.V10.room;

import com.VTT.V10.room.dto.PermissionResponse;
import com.VTT.V10.room.dto.UpdatePermissionRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
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

    @GetMapping("/member/{memberId}")
    public ResponseEntity<PermissionResponse> getPermissions(@PathVariable UUID memberId) {
        return ResponseEntity.ok(permissionService.getMemberPermissions(memberId));
    }

    @PutMapping
    public ResponseEntity<PermissionResponse> updatePermissions(
            @RequestBody UpdatePermissionRequest request,
            Authentication authentication
    ) {
        // ۱. پیدا کردن دسترسی و اتاق مربوطه
        PlayerPermission perm = permissionRepository.findByMemberId(request.getMemberId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "عضو یافت نشد"));

        // ۲. بررسی اینکه درخواست‌دهنده حتما ADMIN (GM) اتاق باشد
        RoomMember requester = roomMemberRepository.findByRoomIdAndUserEmail(perm.getRoom().getId(), authentication.getName())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.FORBIDDEN, "شما عضو این اتاق نیستید"));

        if (requester.getRole() != RoomMember.Role.ADMIN) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "تنها GM اتاق اجازه تغییر دسترسی بازیکنان را دارد");
        }

        return ResponseEntity.ok(permissionService.updatePermissions(request));
    }
}