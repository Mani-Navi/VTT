package com.VTT.V10.room;

import com.VTT.V10.room.dto.FogResponse;
import com.VTT.V10.websocket.dto.FogEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class FogService {

    private final FogRegionRepository fogRepository;
    private final SceneRepository sceneRepository;

    @Async
    @Transactional
    public void asyncHandleFogUpdate(UUID roomId, FogEvent event) {
        try {
            if (event.getSceneId() == null) {
                var activeScene = sceneRepository.findByRoomIdAndIsActiveTrue(roomId);
                activeScene.ifPresent(scene -> event.setSceneId(scene.getId()));
            }
            handleFogUpdate(event);
        } catch (Exception e) {
            log.warn("Async Fog update warning: {}", e.getMessage());
        }
    }

    @Transactional
    public void updateGlobalReveal(UUID roomId, Map<String, Object> data) {
        try {
            Boolean isRevealed = (Boolean) data.get("isRevealed");
            String sceneIdStr = (String) data.get("sceneId");

            if (sceneIdStr != null && isRevealed != null) {
                UUID sceneId = UUID.fromString(sceneIdStr);
                sceneRepository.findById(sceneId).ifPresent(scene -> {
                    scene.setIsFogRevealed(isRevealed);
                    sceneRepository.save(scene);
                });
            }
        } catch (Exception e) {
            log.warn("Error saving global reveal in DB: {}", e.getMessage());
        }
    }

    @Transactional
    public void handleFogUpdate(FogEvent event) {
        if (event == null || event.getType() == null) return;

        Scene scene = sceneRepository.findById(event.getSceneId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "صحنه یافت نشد"));

        String eventType = event.getType().trim();

        if ("CLEAR_ALL".equalsIgnoreCase(eventType)) {
            fogRepository.deleteBySceneId(event.getSceneId());
            scene.setFogFilled(false);
            sceneRepository.save(scene);
            return;
        }

        if ("FILL_ALL".equalsIgnoreCase(eventType) || "fill_all".equalsIgnoreCase(eventType)) {
            fogRepository.deleteBySceneId(event.getSceneId());
            scene.setFogFilled(true);
            sceneRepository.save(scene);
            return;
        }

        if (event.getPoints() == null) {
            return;
        }

        FogRegion.FogType fogType;
        try {
            fogType = FogRegion.FogType.valueOf(eventType.toUpperCase());
        } catch (IllegalArgumentException e) {
            fogType = FogRegion.FogType.HIDE;
        }

        String incomingId = null;
        if (event.getPoints() instanceof Map) {
            Object rawId = ((Map<?, ?>) event.getPoints()).get("id");
            if (rawId != null) {
                incomingId = rawId.toString().trim();
            }
        }

        List<FogRegion> existingRegions = fogRepository.findBySceneId(event.getSceneId());
        FogRegion matchedRegion = null;

        if (incomingId != null && !incomingId.isBlank()) {
            for (FogRegion r : existingRegions) {
                if (r.getId() != null && r.getId().toString().equalsIgnoreCase(incomingId)) {
                    matchedRegion = r;
                    break;
                }
                if (r.getPoints() instanceof Map) {
                    Object storedId = ((Map<?, ?>) r.getPoints()).get("id");
                    if (storedId != null && storedId.toString().trim().equalsIgnoreCase(incomingId)) {
                        matchedRegion = r;
                        break;
                    }
                }
            }
        }

        if (matchedRegion != null) {
            matchedRegion.setPoints(event.getPoints());
            matchedRegion.setType(fogType);
            fogRepository.save(matchedRegion);
            return;
        }

        FogRegion newRegion = FogRegion.builder()
                .scene(scene)
                .points(event.getPoints())
                .type(fogType)
                .build();

        fogRepository.save(newRegion);
    }

    @Transactional(readOnly = true)
    public List<FogResponse> getFogByScene(UUID sceneId) {
        return fogRepository.findBySceneId(sceneId).stream()
                .map(region -> FogResponse.builder()
                        .id(region.getId())
                        .type(region.getType().name())
                        .points(region.getPoints())
                        .build())
                .collect(Collectors.toList());
    }
}