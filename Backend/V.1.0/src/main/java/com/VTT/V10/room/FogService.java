package com.VTT.V10.room;

import com.VTT.V10.room.dto.FogResponse;
import com.VTT.V10.websocket.dto.FogEvent;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
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
    private final ObjectMapper objectMapper;

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
            log.error("Async Fog update error: {}", e.getMessage(), e);
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
            sceneRepository.saveAndFlush(scene);
            return;
        }

        if ("FILL_ALL".equalsIgnoreCase(eventType) || "fill_all".equalsIgnoreCase(eventType)) {
            fogRepository.deleteBySceneId(event.getSceneId());
            scene.setFogFilled(true);
            sceneRepository.saveAndFlush(scene);
            return;
        }

        if (event.getPoints() == null) {
            return;
        }

        JsonNode pointsNode = null;
        if (event.getPoints() instanceof JsonNode jn) {
            pointsNode = jn;
        } else {
            try {
                pointsNode = objectMapper.valueToTree(event.getPoints());
            } catch (Exception ex) {
                log.warn("Could not convert fog points to JsonNode: {}", ex.getMessage());
            }
        }

        if (pointsNode == null) {
            return;
        }

        FogRegion.FogType fogType;
        try {
            fogType = FogRegion.FogType.valueOf(eventType.toUpperCase());
        } catch (IllegalArgumentException e) {
            fogType = FogRegion.FogType.HIDE;
        }

        String incomingId = null;
        if (pointsNode.has("id")) {
            incomingId = pointsNode.get("id").asText();
        }

        List<FogRegion> existingRegions = fogRepository.findBySceneId(event.getSceneId());
        FogRegion matchedRegion = null;

        if (incomingId != null && !incomingId.isBlank()) {
            for (FogRegion r : existingRegions) {
                if (r.getId() != null && r.getId().toString().equalsIgnoreCase(incomingId)) {
                    matchedRegion = r;
                    break;
                }
                if (r.getPoints() != null && r.getPoints().has("id")) {
                    String storedId = r.getPoints().get("id").asText();
                    if (storedId.equalsIgnoreCase(incomingId)) {
                        matchedRegion = r;
                        break;
                    }
                }
            }
        }

        if (matchedRegion != null) {
            matchedRegion.setPoints(pointsNode);
            matchedRegion.setType(fogType);
            fogRepository.saveAndFlush(matchedRegion);
            return;
        }

        FogRegion newRegion = FogRegion.builder()
                .scene(scene)
                .points(pointsNode)
                .type(fogType)
                .build();

        fogRepository.saveAndFlush(newRegion);
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