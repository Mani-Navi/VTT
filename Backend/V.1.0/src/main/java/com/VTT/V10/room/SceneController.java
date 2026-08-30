package com.VTT.V10.room;

import com.VTT.V10.room.dto.CreateSceneRequest;
import com.VTT.V10.room.dto.SceneResponse;
import com.VTT.V10.room.dto.SceneStateResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/scenes")
@RequiredArgsConstructor
public class SceneController {

    private final SceneService sceneService;

    @PostMapping
    public ResponseEntity<SceneResponse> createScene(@Valid @RequestBody CreateSceneRequest request) {
        return ResponseEntity.ok(sceneService.createScene(request));
    }

    @PutMapping("/{sceneId}/rename")
    public ResponseEntity<SceneResponse> renameScene(
            @PathVariable UUID sceneId,
            @RequestBody Map<String, String> payload
    ) {
        String name = payload.getOrDefault("name", "");
        return ResponseEntity.ok(sceneService.renameScene(sceneId, name));
    }

    @PutMapping("/{sceneId}/map")
    public ResponseEntity<SceneResponse> updateSceneMap(
            @PathVariable UUID sceneId,
            @RequestBody Map<String, Object> payload
    ) {
        return ResponseEntity.ok(sceneService.updateSceneMap(sceneId, payload));
    }

    @PostMapping("/{sceneId}/activate")
    public ResponseEntity<SceneResponse> activateScene(@PathVariable UUID sceneId) {
        return ResponseEntity.ok(sceneService.activateScene(sceneId));
    }

    @GetMapping("/{sceneId}/state")
    public ResponseEntity<SceneStateResponse> getSceneState(@PathVariable UUID sceneId) {
        return ResponseEntity.ok(sceneService.getFullSceneState(sceneId));
    }

    @GetMapping("/room/{roomId}")
    public ResponseEntity<List<SceneResponse>> getRoomScenes(@PathVariable UUID roomId) {
        return ResponseEntity.ok(sceneService.getRoomScenes(roomId));
    }

    @DeleteMapping("/{sceneId}")
    public ResponseEntity<Void> deleteScene(@PathVariable UUID sceneId) {
        sceneService.deleteScene(sceneId);
        return ResponseEntity.noContent().build();
    }
}