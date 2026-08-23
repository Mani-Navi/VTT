package com.VTT.V10.asset;

import com.VTT.V10.asset.dto.AssetResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@RestController
@RequestMapping("/api/assets")
@RequiredArgsConstructor
public class AssetController {
    private final AssetService assetService;

    @PostMapping("/upload")
    public ResponseEntity<AssetResponse> upload(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "name", required = false) String name,
            @RequestParam(value = "type", required = false, defaultValue = "TOKEN") String type,
            Authentication authentication
    ) throws IOException {
        AssetResponse response = assetService.uploadAsset(file, name, type, authentication.getName());
        return ResponseEntity.ok(response);
    }
}