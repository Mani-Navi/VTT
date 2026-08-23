package com.VTT.V10.asset;

import com.VTT.V10.asset.dto.AssetResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/assets")
@RequiredArgsConstructor
public class AssetController {
    private final AssetService assetService;

    @PostMapping("/upload")
    public ResponseEntity<AssetResponse> upload(
            @RequestParam("file") MultipartFile file,
            @RequestParam("name") String name,
            @RequestParam("type") String type,
            Authentication authentication
    ) {
        try {
            AssetResponse response = assetService.uploadAsset(file, name, type, authentication.getName());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            // در دنیای واقعی بهتر است از GlobalExceptionHandler استفاده شود
            throw new RuntimeException("خطا در آپلود فایل: " + e.getMessage());
        }
    }
}