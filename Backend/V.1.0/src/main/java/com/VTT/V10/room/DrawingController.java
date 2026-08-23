package com.VTT.V10.room;

import com.VTT.V10.room.dto.DrawingResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/drawings")
@RequiredArgsConstructor
public class DrawingController {
    private final DrawingService drawingService;

    @GetMapping("/scene/{sceneId}")
    public ResponseEntity<List<DrawingResponse>> getSceneDrawings(@PathVariable UUID sceneId) {
        List<DrawingResponse> responses = drawingService.getByScene(sceneId);
        return ResponseEntity.ok(responses);
    }
}