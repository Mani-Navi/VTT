package com.VTT.V10.asset;

import com.VTT.V10.asset.dto.AssetResponse;
import com.VTT.V10.user.User;
import com.VTT.V10.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AssetService {
    private final AssetRepository assetRepository;
    private final UserRepository userRepository;

    private static final String UPLOAD_DIR = "uploads/";
    private static final long MAX_FILE_SIZE = 25 * 1024 * 1024; // ۲۵ مگابایت

    @Transactional
    public AssetResponse uploadAsset(
            MultipartFile file,
            String name,
            String type,
            Integer dpi,
            Integer columns,
            Integer rows,
            Float rotation,
            Boolean isVisible,
            Boolean isLocked,
            String defaultText,
            String textColor,
            Integer fontSize,
            String fontFamily,
            String userEmail
    ) throws IOException {
        if (file == null || file.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "فایل ارسالی خالی است");
        }

        if (file.getSize() > MAX_FILE_SIZE) {
            throw new ResponseStatusException(HttpStatus.PAYLOAD_TOO_LARGE, "حجم فایل بیش از حد مجاز است (حداکثر ۲۵ مگابایت)");
        }

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "کاربر یافت نشد"));

        File directory = new File(UPLOAD_DIR);
        if (!directory.exists()) {
            directory.mkdirs();
        }

        String originalFilename = file.getOriginalFilename() != null
                ? file.getOriginalFilename().replaceAll("[^a-zA-Z0-9.\\-_]", "_")
                : "asset";
        String uniqueFileName = UUID.randomUUID() + "_" + originalFilename;
        Path targetLocation = Paths.get(UPLOAD_DIR).resolve(uniqueFileName);

        Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

        Asset.AssetType assetType = Asset.AssetType.TOKEN;
        if (type != null && !type.isBlank()) {
            try {
                assetType = Asset.AssetType.valueOf(type.trim().toUpperCase());
            } catch (IllegalArgumentException ignored) {
                assetType = Asset.AssetType.TOKEN;
            }
        }

        String finalName = (name != null && !name.isBlank()) ? name : originalFilename;
        String publicFileUrl = "/uploads/" + uniqueFileName;

        Asset asset = Asset.builder()
                .name(finalName)
                .type(assetType)
                .fileUrl(publicFileUrl)
                .fileSize(file.getSize())
                .mimeType(file.getContentType())
                .dpi(dpi != null ? dpi : 150)
                .gridColumns(columns != null ? columns : 1)
                .gridRows(rows != null ? rows : 1)
                .rotation(rotation != null ? rotation : 0f)
                .isVisible(isVisible != null ? isVisible : true)
                .isLocked(isLocked != null ? isLocked : false)
                .defaultText(defaultText)
                .textColor(textColor)
                .fontSize(fontSize)
                .fontFamily(fontFamily)
                .user(user)
                .build();

        assetRepository.save(asset);

        return mapToResponse(asset);
    }

    @Transactional(readOnly = true)
    public List<AssetResponse> getUserAssets(String userEmail, String type) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "کاربر یافت نشد"));

        List<Asset> assets;
        if (type != null && !type.isBlank()) {
            try {
                Asset.AssetType assetType = Asset.AssetType.valueOf(type.trim().toUpperCase());
                assets = assetRepository.findAllByUserAndTypeOrderByCreatedAtDesc(user, assetType);
            } catch (IllegalArgumentException e) {
                assets = assetRepository.findAllByUserOrderByCreatedAtDesc(user);
            }
        } else {
            assets = assetRepository.findAllByUserOrderByCreatedAtDesc(user);
        }

        return assets.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Transactional
    public AssetResponse updateAsset(UUID assetId, Asset updateData, String userEmail) {
        Asset asset = assetRepository.findById(assetId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "است مورد نظر یافت نشد"));

        if (!asset.getUser().getEmail().equals(userEmail)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "دسترسی غیرمجاز");
        }

        if (updateData.getName() != null) asset.setName(updateData.getName());
        if (updateData.getDpi() != null) asset.setDpi(updateData.getDpi());
        if (updateData.getGridColumns() != null) asset.setGridColumns(updateData.getGridColumns());
        if (updateData.getGridRows() != null) asset.setGridRows(updateData.getGridRows());
        if (updateData.getRotation() != null) asset.setRotation(updateData.getRotation());
        if (updateData.getIsVisible() != null) asset.setIsVisible(updateData.getIsVisible());
        if (updateData.getIsLocked() != null) asset.setIsLocked(updateData.getIsLocked());
        if (updateData.getDefaultText() != null) asset.setDefaultText(updateData.getDefaultText());
        if (updateData.getTextColor() != null) asset.setTextColor(updateData.getTextColor());
        if (updateData.getFontSize() != null) asset.setFontSize(updateData.getFontSize());
        if (updateData.getFontFamily() != null) asset.setFontFamily(updateData.getFontFamily());

        assetRepository.save(asset);
        return mapToResponse(asset);
    }

    @Transactional
    public void deleteAsset(UUID assetId, String userEmail) {
        Asset asset = assetRepository.findById(assetId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "است مورد نظر یافت نشد"));

        if (!asset.getUser().getEmail().equals(userEmail)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "دسترسی غیرمجاز");
        }

        try {
            if (asset.getFileUrl() != null && asset.getFileUrl().startsWith("/uploads/")) {
                Path filePath = Paths.get(asset.getFileUrl().substring(1));
                Files.deleteIfExists(filePath);
            }
        } catch (Exception ignored) {}

        assetRepository.delete(asset);
    }

    public AssetResponse mapToResponse(Asset asset) {
        return AssetResponse.builder()
                .id(asset.getId())
                .name(asset.getName())
                .type(asset.getType().name())
                .fileUrl(asset.getFileUrl())
                .fileSize(asset.getFileSize())
                .mimeType(asset.getMimeType())
                .width(asset.getWidth())
                .height(asset.getHeight())
                .dpi(asset.getDpi())
                .gridColumns(asset.getGridColumns())
                .gridRows(asset.getGridRows())
                .rotation(asset.getRotation())
                .isVisible(asset.getIsVisible())
                .isLocked(asset.getIsLocked())
                .folderName(asset.getFolderName())
                .collectionName(asset.getCollectionName())
                .collectionColor(asset.getCollectionColor())
                .defaultText(asset.getDefaultText())
                .textColor(asset.getTextColor())
                .fontSize(asset.getFontSize())
                .fontFamily(asset.getFontFamily())
                .ownerUsername(asset.getUser() != null ? asset.getUser().getUsername() : null)
                .createdAt(asset.getCreatedAt())
                .build();
    }
}