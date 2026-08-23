package com.VTT.V10.room;

import com.VTT.V10.asset.Asset;
import com.VTT.V10.asset.AssetRepository;
import com.VTT.V10.room.dto.CreateSceneRequest;
import com.VTT.V10.room.dto.SceneResponse;
import com.VTT.V10.room.dto.SceneStateResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SceneService {
    private final SceneRepository sceneRepository;
    private final RoomRepository roomRepository;
    private final AssetRepository assetRepository;
    private final TokenService tokenService;
    private final DrawingService drawingService;
    private final FogService fogService;

    @Transactional
    public SceneResponse createScene(CreateSceneRequest request) {
        Room room = roomRepository.findById(request.getRoomId())
                .orElseThrow(() -> new RuntimeException("اتاق یافت نشد"));

        Asset asset = assetRepository.findById(request.getAssetId())
                .orElseThrow(() -> new RuntimeException("فایل نقشه یافت نشد"));

        // اگر سکانس جدید قرار است فعال باشد، بقیه را غیرفعال کن
        if (Boolean.TRUE.equals(request.getIsActive())) {
            sceneRepository.deactivateAllScenesInRoom(room.getId());
        }

        Scene scene = Scene.builder()
                .room(room)
                .backgroundAsset(asset)
                .name(request.getName())
                .isActive(request.getIsActive())
                .gridSize(50) // مقادیر پیش‌فرض
                .gridColor("#000000")
                .gridOpacity(0.5)
                .build();

        sceneRepository.save(scene);
        return convertToResponse(scene);
    }

    public List<SceneResponse> getRoomScenes(UUID roomId) {
        return sceneRepository.findByRoomId(roomId).stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    private SceneResponse convertToResponse(Scene scene) {
        return SceneResponse.builder()
                .id(scene.getId())
                .name(scene.getName())
                .isActive(scene.getIsActive())
                .assetId(scene.getBackgroundAsset().getId())
                .assetUrl(scene.getBackgroundAsset().getFileUrl())
                .gridSize(scene.getGridSize())
                .gridColor(scene.getGridColor())
                .build();
    }

    public SceneStateResponse getFullSceneState(UUID sceneId) {
        Scene scene = sceneRepository.findById(sceneId)
                .orElseThrow(() -> new RuntimeException("سکانس یافت نشد"));

        // ساختن آبجکت DTO با استفاده از Builder
        return SceneStateResponse.builder()
                .scene(convertToResponse(scene))
                .tokens(tokenService.getTokensByScene(sceneId))
                .drawings(drawingService.getByScene(sceneId))
                .fogRegions(fogService.getFogByScene(sceneId))
                .build();
    }
}