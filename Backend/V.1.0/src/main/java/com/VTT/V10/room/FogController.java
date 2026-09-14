package com.VTT.V10.room;

import com.VTT.V10.room.dto.FogResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/fog")
@RequiredArgsConstructor
public class FogController {

    private final FogService fogService;

    @GetMapping("/scene/{sceneId}")
    public ResponseEntity<List<FogResponse>> getFog(
            @PathVariable UUID sceneId,
            Authentication authentication
    ) {
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "دسترسی غیرمجاز");
        }
        return ResponseEntity.ok(fogService.getFogByScene(sceneId));
    }
}