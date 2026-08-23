package com.VTT.V10.asset;

import com.VTT.V10.asset.dto.AssetResponse;
import com.VTT.V10.user.User;
import com.VTT.V10.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AssetService {
    private final AssetRepository assetRepository;
    private final UserRepository userRepository;

    private final String UPLOAD_DIR = "uploads/";

    @Transactional
    public AssetResponse uploadAsset(MultipartFile file, String name, String type, String userEmail) throws Exception {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("کاربر یافت نشد"));

        File directory = new File(UPLOAD_DIR);
        if (!directory.exists()) directory.mkdirs();

        String fileName = UUID.randomUUID() + "_" + file.getOriginalFilename();
        Path path = Paths.get(UPLOAD_DIR + fileName);
        Files.write(path, file.getBytes());

        Asset asset = Asset.builder()
                .name(name)
                .type(Asset.AssetType.valueOf(type.toUpperCase()))
                .fileUrl(path.toString())
                .fileSize(file.getSize())
                .mimeType(file.getContentType())
                .user(user)
                .build();

        assetRepository.save(asset);

        // تبدیل Entity به DTO برای امنیت بیشتر
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