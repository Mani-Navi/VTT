package com.VTT.V10.room;

import com.VTT.V10.room.dto.DrawingResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/drawings")
@RequiredArgsConstructor
public class DrawingController {

    private final DrawingService drawingService;

    @GetMapping("/scene/{sceneId}")
    public ResponseEntity<List<DrawingResponse>> getSceneDrawings(
            @PathVariable UUID sceneId,
            Authentication authentication
    ) {
        validateAuth(authentication);
        List<DrawingResponse> responses = drawingService.getByScene(sceneId);
        return ResponseEntity.ok(responses);
    }

    @DeleteMapping("/{drawingId}")
    public ResponseEntity<Void> deleteDrawing(
            @PathVariable String drawingId,
            @RequestParam(required = false) UUID sceneId,
            Authentication authentication
    ) {
        validateAuth(authentication);
        drawingService.deleteDrawing(sceneId, drawingId);
        return ResponseEntity.noContent().build();
    }

    private void validateAuth(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "دسترسی غیرمجاز");
        }
    }
}