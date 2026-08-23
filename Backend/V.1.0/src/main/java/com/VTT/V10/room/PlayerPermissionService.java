package com.VTT.V10.room;

import com.VTT.V10.room.dto.PermissionResponse;
import com.VTT.V10.room.dto.UpdatePermissionRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PlayerPermissionService {
    private final PlayerPermissionRepository permissionRepository;

    @Transactional
    public void createDefaultPermissions(Room room, RoomMember member) {
        PlayerPermission permission = PlayerPermission.builder()
                .room(room)
                .member(member)
                .canAssets(false)
                .canText(true)
                .canFog(false)
                .canDrawing(true)
                .canScene(false)
                .canRuler(true)
                .build();
        permissionRepository.save(permission);
    }

    @Transactional
    public PermissionResponse updatePermissions(UpdatePermissionRequest request) {
        PlayerPermission perm = permissionRepository.findByMemberId(request.getMemberId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "دسترسی برای این عضو یافت نشد"));

        if (request.getCanAssets() != null) perm.setCanAssets(request.getCanAssets());
        if (request.getCanFog() != null) perm.setCanFog(request.getCanFog());
        if (request.getCanDrawing() != null) perm.setCanDrawing(request.getCanDrawing());
        if (request.getCanScene() != null) perm.setCanScene(request.getCanScene());
        if (request.getCanText() != null) perm.setCanText(request.getCanText());
        if (request.getCanRuler() != null) perm.setCanRuler(request.getCanRuler());

        permissionRepository.save(perm);
        return convertToResponse(perm);
    }

    @Transactional(readOnly = true)
    public PermissionResponse getMemberPermissions(UUID memberId) {
        PlayerPermission perm = permissionRepository.findByMemberId(memberId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "دسترسی برای این عضو یافت نشد"));
        return convertToResponse(perm);
    }

    private PermissionResponse convertToResponse(PlayerPermission p) {
        return PermissionResponse.builder()
                .memberId(p.getMember().getId())
                .username(p.getMember().getUser().getUsername())
                .canAssets(p.getCanAssets())
                .canDrawing(p.getCanDrawing())
                .canFog(p.getCanFog())
                .canScene(p.getCanScene())
                .canText(p.getCanText())
                .canRuler(p.getCanRuler())
                .build();
    }
}