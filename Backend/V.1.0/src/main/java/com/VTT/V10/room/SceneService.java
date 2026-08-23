package com.VTT.V10.room;

import com.VTT.V10.asset.Asset;
import com.VTT.V10.asset.AssetRepository;
import com.VTT.V10.room.dto.CreateSceneRequest;
import com.VTT.V10.room.dto.SceneResponse;
import com.VTT.V10.room.dto.SceneStateResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

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
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "اتاق یافت نشد"));

        Asset asset = null;
        if (request.getAssetId() != null) {
            asset = assetRepository.findById(request.getAssetId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "فایل نقشه یافت نشد"));
        }

        // اگر سکانس جدید قرار است فعال باشد، بقیه را غیرفعال کن
        if (Boolean.TRUE.equals(request.getIsActive())) {
            sceneRepository.deactivateAllScenesInRoom(room.getId());
        }

        Scene scene = Scene.builder()
                .room(room)
                .backgroundAsset(asset)
                .name(request.getName())
                .isActive(Boolean.TRUE.equals(request.getIsActive()))
                .gridSize(50) // مقادیر پیش‌فرض
                .gridColor("#000000")
                .gridOpacity(0.5)
                .build();

        sceneRepository.save(scene);
        return convertToResponse(scene);
    }

    @Transactional(readOnly = true)
    public List<SceneResponse> getRoomScenes(UUID roomId) {
        return sceneRepository.findByRoomId(roomId).stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public SceneStateResponse getFullSceneState(UUID sceneId) {
        Scene scene = sceneRepository.findById(sceneId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "سکانس یافت نشد"));

        return SceneStateResponse.builder()
                .scene(convertToResponse(scene))
                .tokens(tokenService.getTokensByScene(sceneId))
                .drawings(drawingService.getByScene(sceneId))
                .fogRegions(fogService.getFogByScene(sceneId))
                .build();
    }

    private SceneResponse convertToResponse(Scene scene) {
        UUID assetId = (scene.getBackgroundAsset() != null) ? scene.getBackgroundAsset().getId() : null;
        String assetUrl = (scene.getBackgroundAsset() != null) ? scene.getBackgroundAsset().getFileUrl() : "";

        return SceneResponse.builder()
                .id(scene.getId())
                .name(scene.getName())
                .isActive(scene.getIsActive())
                .assetId(assetId)
                .assetUrl(assetUrl)
                .gridSize(scene.getGridSize())
                .gridColor(scene.getGridColor())
                .build();
    }
}