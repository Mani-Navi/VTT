package com.VTT.V10.room;

import com.VTT.V10.room.dto.DrawingResponse;
import com.VTT.V10.room.dto.FogResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;


@RestController
@RequestMapping("/api/fog")
@RequiredArgsConstructor
public class FogController {
    private final FogService fogService;

    @GetMapping("/scene/{sceneId}")
    public ResponseEntity<List<FogResponse>> getFog(@PathVariable UUID sceneId) {
        return ResponseEntity.ok(fogService.getFogByScene(sceneId));
    }
}