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
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AssetService {
    private final AssetRepository assetRepository;
    private final UserRepository userRepository;

    private static final String UPLOAD_DIR = "uploads/";

    @Transactional
    public AssetResponse uploadAsset(MultipartFile file, String name, String type, String userEmail) throws IOException {
        if (file == null || file.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "فایل ارسالی خالی است");
        }

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "کاربر یافت نشد"));

        // اطمینان از وجود دایرکتوری uploads
        File directory = new File(UPLOAD_DIR);
        if (!directory.exists()) {
            directory.mkdirs();
        }

        // پاکسازی نام فایل و تولید نام یکتا
        String originalFilename = file.getOriginalFilename() != null ? file.getOriginalFilename().replaceAll("[^a-zA-Z0-9.\\-_]", "_") : "asset";
        String uniqueFileName = UUID.randomUUID() + "_" + originalFilename;
        Path targetLocation = Paths.get(UPLOAD_DIR).resolve(uniqueFileName);

        // ذخیره فیزیکی فایل
        Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

        // تعیین نوع است
        Asset.AssetType assetType = Asset.AssetType.TOKEN;
        if (type != null && !type.isBlank()) {
            try {
                assetType = Asset.AssetType.valueOf(type.trim().toUpperCase());
            } catch (IllegalArgumentException ignored) {
                assetType = Asset.AssetType.TOKEN;
            }
        }

        String finalName = (name != null && !name.isBlank()) ? name : originalFilename;
        // آدرس وب جهت فراخوانی مستقیم در تگ img یا Canvas
        String publicFileUrl = "/uploads/" + uniqueFileName;

        Asset asset = Asset.builder()
                .name(finalName)
                .type(assetType)
                .fileUrl(publicFileUrl)
                .fileSize(file.getSize())
                .mimeType(file.getContentType())
                .user(user)
                .build();

        assetRepository.save(asset);

        return AssetResponse.builder()
                .id(asset.getId())
                .name(asset.getName())
                .type(asset.getType().name())
                .fileUrl(asset.getFileUrl())
                .fileSize(asset.getFileSize())
                .ownerUsername(user.getUsername())
                .build();
    }
}