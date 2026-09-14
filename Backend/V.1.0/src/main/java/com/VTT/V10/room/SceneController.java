package com.VTT.V10.room;

import com.VTT.V10.room.dto.CreateSceneRequest;
import com.VTT.V10.room.dto.SceneResponse;
import com.VTT.V10.room.dto.SceneStateResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/scenes")
@RequiredArgsConstructor
public class SceneController {

    private final SceneService sceneService;

    @PostMapping
    public ResponseEntity<SceneResponse> createScene(
            @Valid @RequestBody CreateSceneRequest request,
            Authentication authentication
    ) {
        validateAuth(authentication);
        return ResponseEntity.ok(sceneService.createScene(request, authentication.getName()));
    }

    @PutMapping("/{sceneId}/rename")
    public ResponseEntity<SceneResponse> renameScene(
            @PathVariable UUID sceneId,
            @RequestBody Map<String, String> payload,
            Authentication authentication
    ) {
        validateAuth(authentication);
        String name = payload != null ? payload.getOrDefault("name", "") : "";
        return ResponseEntity.ok(sceneService.renameScene(sceneId, name, authentication.getName()));
    }

    @PutMapping("/{sceneId}/map")
    public ResponseEntity<SceneResponse> updateSceneMap(
            @PathVariable UUID sceneId,
            @RequestBody Map<String, Object> payload,
            Authentication authentication
    ) {
        validateAuth(authentication);
        return ResponseEntity.ok(sceneService.updateSceneMap(sceneId, payload, authentication.getName()));
    }

    @PostMapping("/{sceneId}/activate")
    public ResponseEntity<SceneResponse> activateScene(
            @PathVariable UUID sceneId,
            Authentication authentication
    ) {
        validateAuth(authentication);
        return ResponseEntity.ok(sceneService.activateScene(sceneId, authentication.getName()));
    }

    @GetMapping("/{sceneId}/state")
    public ResponseEntity<SceneStateResponse> getSceneState(
            @PathVariable UUID sceneId,
            Authentication authentication
    ) {
        validateAuth(authentication);
        return ResponseEntity.ok(sceneService.getFullSceneState(sceneId, authentication.getName()));
    }

    @GetMapping("/room/{roomId}")
    public ResponseEntity<List<SceneResponse>> getRoomScenes(
            @PathVariable UUID roomId,
            Authentication authentication
    ) {
        validateAuth(authentication);
        return ResponseEntity.ok(sceneService.getRoomScenes(roomId, authentication.getName()));
    }

    @DeleteMapping("/{sceneId}")
    public ResponseEntity<Void> deleteScene(
            @PathVariable UUID sceneId,
            Authentication authentication
    ) {
        validateAuth(authentication);
        sceneService.deleteScene(sceneId, authentication.getName());
        return ResponseEntity.noContent().build();
    }

    private void validateAuth(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "دسترسی غیرمجاز");
        }
    }
}