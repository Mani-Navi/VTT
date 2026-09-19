package com.VTT.V10.asset;

import com.VTT.V10.asset.dto.AssetResponse;
import com.VTT.V10.asset.dto.UpdateAssetRequest;
import com.VTT.V10.user.User;
import com.VTT.V10.user.UserRepository;
import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.coobird.thumbnailator.Thumbnails;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class AssetService {

    private final AssetRepository assetRepository;
    private final UserRepository userRepository;
    private final EntityManager entityManager;

    private static final String UPLOAD_DIR = "uploads";

    private static final long MAX_MAP_SIZE = 15 * 1024 * 1024;   // 15 MB
    private static final long MAX_TOKEN_SIZE = 3 * 1024 * 1024;  // 3 MB
    private static final long MAX_PROP_SIZE = 4 * 1024 * 1024;   // 4 MB
    private static final long DEFAULT_MAX_SIZE = 5 * 1024 * 1024; // 5 MB

    private static final Set<String> ALLOWED_MIME_TYPES = Set.of(
            "image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml",
            "audio/mpeg", "audio/ogg", "audio/wav"
    );

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

        String contentType = file.getContentType();
        if (contentType != null && !ALLOWED_MIME_TYPES.contains(contentType.toLowerCase())) {
            throw new ResponseStatusException(HttpStatus.UNSUPPORTED_MEDIA_TYPE, "نوع فایل مجاز نیست");
        }

        Asset.AssetType assetType = parseAssetType(type);
        validateFileSize(file.getSize(), assetType);

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "کاربر یافت نشد"));

        Path uploadPath = Paths.get(UPLOAD_DIR).toAbsolutePath().normalize();
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        String rawOriginalFilename = file.getOriginalFilename() != null ? file.getOriginalFilename() : "asset";
        String cleanOriginalFilename = rawOriginalFilename.replaceAll("[^a-zA-Z0-9.\\-_]", "_");
        String uniqueFileName = UUID.randomUUID() + "_" + cleanOriginalFilename;

        Path targetLocation = uploadPath.resolve(uniqueFileName).normalize();
        if (!targetLocation.startsWith(uploadPath)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "نام فایل نامعتبر است");
        }

        // پردازش و بهینه‌سازی تصویر
        Integer width = null;
        Integer height = null;
        long finalFileSize = file.getSize();

        if (contentType != null && contentType.startsWith("image/") && !contentType.contains("svg") && !contentType.contains("gif")) {
            try {
                BufferedImage originalImage = ImageIO.read(file.getInputStream());
                if (originalImage != null) {
                    width = originalImage.getWidth();
                    height = originalImage.getHeight();

                    File destFile = targetLocation.toFile();

                    if (assetType == Asset.AssetType.MAP) {
                        // نقشه‌ها: حفظ حداکثر رزولوشن 4K با فشرده‌سازی بسیار باکیفیت
                        int maxDim = 3840;
                        if (width > maxDim || height > maxDim) {
                            Thumbnails.of(originalImage)
                                    .size(maxDim, maxDim)
                                    .outputQuality(0.85)
                                    .toFile(destFile);
                        } else {
                            Thumbnails.of(originalImage)
                                    .scale(1.0)
                                    .outputQuality(0.85)
                                    .toFile(destFile);
                        }
                    } else {
                        // توکن‌ها و اشیاء: رزولوشن حداکثر ۱۰۲۴ با حفظ کامل کانال آلفا
                        int maxDim = 1024;
                        if (width > maxDim || height > maxDim) {
                            Thumbnails.of(originalImage)
                                    .size(maxDim, maxDim)
                                    .outputQuality(0.90)
                                    .toFile(destFile);
                        } else {
                            Thumbnails.of(originalImage)
                                    .scale(1.0)
                                    .outputQuality(0.90)
                                    .toFile(destFile);
                        }
                    }

                    finalFileSize = Files.size(targetLocation);
                } else {
                    file.transferTo(targetLocation);
                }
            } catch (Exception e) {
                log.warn("Image compression failed, saving original stream: {}", e.getMessage());
                file.transferTo(targetLocation);
            }
        } else {
            file.transferTo(targetLocation);
        }

        String finalName = (name != null && !name.isBlank()) ? name : cleanOriginalFilename;
        String publicFileUrl = "/uploads/" + uniqueFileName;

        Asset asset = Asset.builder()
                .name(finalName)
                .type(assetType)
                .fileUrl(publicFileUrl)
                .fileSize(finalFileSize)
                .mimeType(contentType)
                .width(width)
                .height(height)
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

    @Transactional
    public AssetResponse createAssetFromUrl(
            String url,
            String name,
            String type,
            Integer dpi,
            Integer columns,
            Integer rows,
            String userEmail
    ) {
        if (url == null || url.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "آدرس لینک نمی‌تواند خالی باشد");
        }

        String cleanUrl = url.trim();
        if (!cleanUrl.startsWith("http://") && !cleanUrl.startsWith("https://")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "فرمت پروتکل لینک باید http یا https باشد");
        }

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "کاربر یافت نشد"));

        Asset.AssetType assetType = parseAssetType(type);
        String finalName = (name != null && !name.isBlank()) ? name : "منبع لینک‌شده";

        Asset asset = Asset.builder()
                .name(finalName)
                .type(assetType)
                .fileUrl(cleanUrl)
                .dpi(dpi != null ? dpi : 150)
                .gridColumns(columns != null ? columns : 1)
                .gridRows(rows != null ? rows : 1)
                .isVisible(true)
                .isLocked(false)
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
    public AssetResponse updateAsset(UUID assetId, UpdateAssetRequest updateData, String userEmail) {
        Asset asset = assetRepository.findById(assetId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "است مورد نظر یافت نشد"));

        if (!asset.getUser().getEmail().equalsIgnoreCase(userEmail)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "دسترسی غیرمجاز");
        }

        if (updateData != null) {
            if (updateData.getName() != null) asset.setName(updateData.getName());
            if (updateData.getDpi() != null) asset.setDpi(updateData.getDpi());
            if (updateData.getGridColumns() != null) asset.setGridColumns(updateData.getGridColumns());
            if (updateData.getGridRows() != null) asset.setGridRows(updateData.getGridRows());
            if (updateData.getRotation() != null) asset.setRotation(updateData.getRotation());
            if (updateData.getIsVisible() != null) asset.setIsVisible(updateData.getIsVisible());
            if (updateData.getIsLocked() != null) asset.setIsLocked(updateData.getIsLocked());
            if (updateData.getFolderName() != null) asset.setFolderName(updateData.getFolderName());
            if (updateData.getCollectionName() != null) asset.setCollectionName(updateData.getCollectionName());
            if (updateData.getCollectionColor() != null) asset.setCollectionColor(updateData.getCollectionColor());
            if (updateData.getDefaultText() != null) asset.setDefaultText(updateData.getDefaultText());
            if (updateData.getTextColor() != null) asset.setTextColor(updateData.getTextColor());
            if (updateData.getFontSize() != null) asset.setFontSize(updateData.getFontSize());
            if (updateData.getFontFamily() != null) asset.setFontFamily(updateData.getFontFamily());
        }

        assetRepository.save(asset);
        return mapToResponse(asset);
    }

    @Transactional
    public void deleteAsset(UUID assetId, String userEmail) {
        Asset asset = assetRepository.findById(assetId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "است مورد نظر یافت نشد"));

        if (!asset.getUser().getEmail().equalsIgnoreCase(userEmail)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "دسترسی غیرمجاز");
        }

        // ۱. پاک‌سازی ارجاعات خارجی با کوئری امن
        entityManager.createNativeQuery("UPDATE tokens SET asset_id = NULL WHERE asset_id = :assetId")
                .setParameter("assetId", assetId)
                .executeUpdate();

        entityManager.createNativeQuery("UPDATE scenes SET asset_id = NULL WHERE asset_id = :assetId")
                .setParameter("assetId", assetId)
                .executeUpdate();

        // ۲. حذف فیزیکی امن
        try {
            if (asset.getFileUrl() != null && asset.getFileUrl().startsWith("/uploads/")) {
                String subPath = asset.getFileUrl().substring("/uploads/".length());
                Path basePath = Paths.get(UPLOAD_DIR).toAbsolutePath().normalize();
                Path targetPath = basePath.resolve(subPath).normalize();

                if (targetPath.startsWith(basePath)) {
                    Files.deleteIfExists(targetPath);
                }
            }
        } catch (Exception e) {
            log.warn("Could not delete physical file for asset {}: {}", assetId, e.getMessage());
        }

        // ۳. حذف رکورد از دیتابیس
        assetRepository.delete(asset);
    }

    private void validateFileSize(long size, Asset.AssetType type) {
        long allowedSize = switch (type) {
            case MAP -> MAX_MAP_SIZE;
            case TOKEN -> MAX_TOKEN_SIZE;
            case PROP -> MAX_PROP_SIZE;
            default -> DEFAULT_MAX_SIZE;
        };

        if (size > allowedSize) {
            String limitLabel = (allowedSize / (1024 * 1024)) + " مگابایت";
            throw new ResponseStatusException(HttpStatus.PAYLOAD_TOO_LARGE,
                    "حجم فایل برای این نوع بیشتر از حد مجاز است (حداکثر " + limitLabel + ")");
        }
    }

    private Asset.AssetType parseAssetType(String type) {
        if (type != null && !type.isBlank()) {
            try {
                return Asset.AssetType.valueOf(type.trim().toUpperCase());
            } catch (IllegalArgumentException ignored) {
            }
        }
        return Asset.AssetType.TOKEN;
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