package com.VTT.V10.room;

import com.VTT.V10.room.dto.PermissionResponse;
import com.VTT.V10.room.dto.UpdatePermissionRequest;
import jakarta.validation.Valid;
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

    @GetMapping("/member/{memberId}")
    public ResponseEntity<PermissionResponse> getPermissions(
            @PathVariable UUID memberId,
            Authentication authentication
    ) {
        validateAuth(authentication);
        return ResponseEntity.ok(permissionService.getMemberPermissions(memberId));
    }

    @PutMapping
    public ResponseEntity<PermissionResponse> updatePermissions(
            @Valid @RequestBody UpdatePermissionRequest request,
            Authentication authentication
    ) {
        validateAuth(authentication);
        return ResponseEntity.ok(permissionService.updatePermissionsWithAuthCheck(request, authentication.getName()));
    }

    private void validateAuth(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "دسترسی غیرمجاز");
        }
    }
}