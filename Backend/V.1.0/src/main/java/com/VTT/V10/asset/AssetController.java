package com.VTT.V10.asset;

import com.VTT.V10.asset.dto.AssetResponse;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.UUID;

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
            @RequestParam(value = "dpi", required = false) Integer dpi,
            @RequestParam(value = "columns", required = false) Integer columns,
            @RequestParam(value = "rows", required = false) Integer rows,
            @RequestParam(value = "rotation", required = false) Float rotation,
            @RequestParam(value = "isVisible", required = false) Boolean isVisible,
            @RequestParam(value = "isLocked", required = false) Boolean isLocked,
            @RequestParam(value = "defaultText", required = false) String defaultText,
            @RequestParam(value = "textColor", required = false) String textColor,
            @RequestParam(value = "fontSize", required = false) Integer fontSize,
            @RequestParam(value = "fontFamily", required = false) String fontFamily,
            Authentication authentication
    ) throws IOException {
        AssetResponse response = assetService.uploadAsset(
                file, name, type, dpi, columns, rows, rotation, isVisible, isLocked,
                defaultText, textColor, fontSize, fontFamily, authentication.getName()
        );
        return ResponseEntity.ok(response);
    }

    @PostMapping("/from-url")
    public ResponseEntity<AssetResponse> createFromUrl(
            @RequestBody UrlAssetRequest request,
            Authentication authentication
    ) {
        AssetResponse response = assetService.createAssetFromUrl(
                request.getUrl(),
                request.getName(),
                request.getType(),
                request.getDpi(),
                request.getColumns(),
                request.getRows(),
                authentication.getName()
        );
        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<List<AssetResponse>> getAssets(
            @RequestParam(value = "type", required = false) String type,
            Authentication authentication
    ) {
        List<AssetResponse> assets = assetService.getUserAssets(authentication.getName(), type);
        return ResponseEntity.ok(assets);
    }

    @PatchMapping("/{assetId}")
    public ResponseEntity<AssetResponse> updateAsset(
            @PathVariable UUID assetId,
            @RequestBody Asset updateData,
            Authentication authentication
    ) {
        AssetResponse response = assetService.updateAsset(assetId, updateData, authentication.getName());
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{assetId}")
    public ResponseEntity<Void> deleteAsset(
            @PathVariable UUID assetId,
            Authentication authentication
    ) {
        assetService.deleteAsset(assetId, authentication.getName());
        return ResponseEntity.noContent().build();
    }

    @Data
    public static class UrlAssetRequest {
        private String url;
        private String name;
        private String type;
        private Integer dpi;
        private Integer columns;
        private Integer rows;
    }
}