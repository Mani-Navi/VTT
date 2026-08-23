package com.VTT.V10.room;

import com.VTT.V10.room.dto.CreateSceneRequest;
import com.VTT.V10.room.dto.SceneResponse;
import com.VTT.V10.room.dto.SceneStateResponse; // این را ایمپورت کنید
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/scenes")
@RequiredArgsConstructor
public class SceneController {

    private final SceneService sceneService; // فقط این سرویس باید اینجا باشد

    @PostMapping
    public ResponseEntity<SceneResponse> createScene(@Valid @RequestBody CreateSceneRequest request) {
        return ResponseEntity.ok(sceneService.createScene(request));
    }

    // متد جدید برای دریافت وضعیت کامل سکانس
    @GetMapping("/{sceneId}/state")
    public ResponseEntity<SceneStateResponse> getSceneState(@PathVariable UUID sceneId) {
        // دیتا از طریق سرویس ساخته و برگردانده می‌شود
        return ResponseEntity.ok(sceneService.getFullSceneState(sceneId));
    }

    @GetMapping("/room/{roomId}")
    public ResponseEntity<List<SceneResponse>> getRoomScenes(@PathVariable UUID roomId) {
        return ResponseEntity.ok(sceneService.getRoomScenes(roomId));
    }
}