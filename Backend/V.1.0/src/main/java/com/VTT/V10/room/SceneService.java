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

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SceneService {

    private final SceneRepository sceneRepository;
    private final RoomRepository roomRepository;
    private final RoomMemberRepository roomMemberRepository;
    private final AssetRepository assetRepository;
    private final TokenService tokenService;
    private final TokenRepository tokenRepository;
    private final DrawingService drawingService;
    private final DrawingRepository drawingRepository;
    private final FogService fogService;
    private final FogRegionRepository fogRegionRepository;

    @Transactional
    public SceneResponse createScene(CreateSceneRequest request, String userEmail) {
        Room room = roomRepository.findById(request.getRoomId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "اتاق یافت نشد"));

        validateGMRole(room.getId(), userEmail);

        Asset asset = null;
        if (request.getAssetId() != null) {
            asset = assetRepository.findById(request.getAssetId()).orElse(null);
        }

        String mapUrl = request.getMapUrl();
        if ((mapUrl == null || mapUrl.isBlank()) && asset != null) {
            mapUrl = asset.getFileUrl();
        }

        long sceneCount = sceneRepository.countByRoomId(room.getId());
        boolean shouldBeActive = sceneCount == 0 || Boolean.TRUE.equals(request.getIsActive());

        if (shouldBeActive) {
            sceneRepository.deactivateAllScenesInRoom(room.getId());
        }

        Scene scene = Scene.builder()
                .room(room)
                .backgroundAsset(asset)
                .mapUrl(mapUrl)
                .name(request.getName().trim())
                .isActive(shouldBeActive)
                .mapWidth(2000)
                .mapHeight(1500)
                .gridSize(60)
                .gridColor("#000000")
                .gridOpacity(0.35)
                .availableConditions(new ArrayList<>())
                .isFogRevealed(false)
                .fogFilled(false)
                .build();

        sceneRepository.save(scene);
        return convertToResponse(scene);
    }

    @Transactional
    public SceneResponse renameScene(UUID sceneId, String newName, String userEmail) {
        Scene scene = sceneRepository.findById(sceneId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "صحنه یافت نشد"));

        validateGMRole(scene.getRoom().getId(), userEmail);

        if (newName != null && !newName.trim().isEmpty()) {
            scene.setName(newName.trim());
            sceneRepository.save(scene);
        }
        return convertToResponse(scene);
    }

    @Transactional
    public SceneResponse updateSceneMap(UUID sceneId, Map<String, Object> payload, String userEmail) {
        Scene scene = sceneRepository.findById(sceneId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "صحنه یافت نشد"));

        validateGMRole(scene.getRoom().getId(), userEmail);

        if (payload != null) {
            if (payload.containsKey("mapUrl") && payload.get("mapUrl") != null) {
                scene.setMapUrl(payload.get("mapUrl").toString());
            }

            if (payload.containsKey("assetId") && payload.get("assetId") != null) {
                try {
                    UUID assetId = UUID.fromString(payload.get("assetId").toString());
                    assetRepository.findById(assetId).ifPresent(scene::setBackgroundAsset);
                } catch (Exception ignored) {}
            }

            if (payload.containsKey("name") && payload.get("name") != null) {
                String nameStr = payload.get("name").toString().trim();
                if (!nameStr.isEmpty()) {
                    scene.setName(nameStr);
                }
            }
        }

        sceneRepository.save(scene);
        return convertToResponse(scene);
    }

    @Transactional
    public SceneResponse activateScene(UUID sceneId, String userEmail) {
        Scene scene = sceneRepository.findById(sceneId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "صحنه یافت نشد"));

        validateGMRole(scene.getRoom().getId(), userEmail);

        sceneRepository.deactivateAllScenesInRoom(scene.getRoom().getId());
        scene.setIsActive(true);
        sceneRepository.save(scene);

        return convertToResponse(scene);
    }

    @Transactional(readOnly = true)
    public List<SceneResponse> getRoomScenes(UUID roomId, String userEmail) {
        validateMembership(roomId, userEmail);
        return sceneRepository.findByRoomId(roomId).stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public SceneStateResponse getFullSceneState(UUID sceneId, String userEmail) {
        Scene scene = sceneRepository.findById(sceneId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "صحنه یافت نشد"));

        validateMembership(scene.getRoom().getId(), userEmail);

        return SceneStateResponse.builder()
                .scene(convertToResponse(scene))
                .tokens(tokenService.getTokensByScene(sceneId))
                .drawings(drawingService.getByScene(sceneId))
                .fogRegions(fogService.getFogByScene(sceneId))
                .build();
    }

    @Transactional
    public void deleteScene(UUID sceneId, String userEmail) {
        Scene scene = sceneRepository.findById(sceneId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "صحنه یافت نشد"));

        UUID roomId = scene.getRoom().getId();
        validateGMRole(roomId, userEmail);

        tokenRepository.deleteBySceneId(sceneId);
        fogRegionRepository.deleteBySceneId(sceneId);

        List<Drawing> drawings = drawingRepository.findBySceneId(sceneId);
        if (drawings != null && !drawings.isEmpty()) {
            drawingRepository.deleteAll(drawings);
        }

        sceneRepository.delete(scene);

        if (Boolean.TRUE.equals(scene.getIsActive())) {
            List<Scene> remaining = sceneRepository.findByRoomId(roomId);
            if (!remaining.isEmpty()) {
                Scene newActive = remaining.get(0);
                newActive.setIsActive(true);
                sceneRepository.save(newActive);
            }
        }
    }

    private void validateMembership(UUID roomId, String email) {
        boolean isMember = roomMemberRepository.findByRoomIdAndUserEmail(roomId, email).isPresent() ||
                roomRepository.findById(roomId).filter(r -> r.getOwner() != null && r.getOwner().getEmail().equalsIgnoreCase(email)).isPresent();

        if (!isMember) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "شما عضو این اتاق نیستید");
        }
    }

    private void validateGMRole(UUID roomId, String email) {
        boolean isOwner = roomRepository.findById(roomId)
                .filter(r -> r.getOwner() != null && r.getOwner().getEmail().equalsIgnoreCase(email))
                .isPresent();

        boolean isAdmin = roomMemberRepository.findByRoomIdAndUserEmail(roomId, email)
                .filter(m -> m.getRole() == RoomMember.Role.ADMIN)
                .isPresent();

        if (!isOwner && !isAdmin) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "تنها دانجن‌مستر (GM) اجازه این عملیات را دارد");
        }
    }

    private SceneResponse convertToResponse(Scene scene) {
        UUID assetId = (scene.getBackgroundAsset() != null) ? scene.getBackgroundAsset().getId() : null;
        String finalUrl = (scene.getMapUrl() != null && !scene.getMapUrl().isBlank())
                ? scene.getMapUrl()
                : (scene.getBackgroundAsset() != null ? scene.getBackgroundAsset().getFileUrl() : "");

        return SceneResponse.builder()
                .id(scene.getId())
                .name(scene.getName())
                .isActive(scene.getIsActive())
                .assetId(assetId)
                .assetUrl(finalUrl)
                .mapUrl(finalUrl)
                .mapWidth(scene.getMapWidth() != null ? scene.getMapWidth() : 2000)
                .mapHeight(scene.getMapHeight() != null ? scene.getMapHeight() : 1500)
                .gridSize(scene.getGridSize())
                .gridColor(scene.getGridColor())
                .gridOpacity(scene.getGridOpacity())
                .availableConditions(scene.getAvailableConditions() != null ? scene.getAvailableConditions() : new ArrayList<>())
                .isFogRevealed(scene.getIsFogRevealed() != null ? scene.getIsFogRevealed() : false)
                .fogFilled(scene.getFogFilled() != null ? scene.getFogFilled() : false)
                .build();
    }
}