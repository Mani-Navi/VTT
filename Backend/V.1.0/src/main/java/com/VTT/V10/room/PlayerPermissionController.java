package com.VTT.V10.room;

import com.VTT.V10.room.dto.PermissionResponse;
import com.VTT.V10.room.dto.UpdatePermissionRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.UUID;

@RestController
@RequestMapping("/api/permissions")
@RequiredArgsConstructor
public class PlayerPermissionController {
    private final PlayerPermissionService permissionService;

    @GetMapping("/member/{memberId}")
    public ResponseEntity<PermissionResponse> getPermissions(@PathVariable UUID memberId) {
        return ResponseEntity.ok(permissionService.getMemberPermissions(memberId));
    }

    @PutMapping
    public ResponseEntity<PermissionResponse> updatePermissions(@RequestBody UpdatePermissionRequest request) {
        // نکته: در اینجا باید چک شود که درخواست‌دهنده حتما GM اتاق باشد
        return ResponseEntity.ok(permissionService.updatePermissions(request));
    }
}