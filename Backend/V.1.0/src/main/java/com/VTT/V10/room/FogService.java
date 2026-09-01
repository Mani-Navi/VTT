package com.VTT.V10.room;

import com.VTT.V10.room.dto.FogResponse;
import com.VTT.V10.websocket.dto.FogEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class FogService {
    private final FogRegionRepository fogRepository;
    private final SceneRepository sceneRepository;

    @Transactional
    public void handleFogUpdate(FogEvent event) {
        if (event == null || event.getType() == null) return;

        Scene scene = sceneRepository.findById(event.getSceneId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "صحنه یافت نشد"));

        String eventType = event.getType().trim();

        // ۱. پاک‌کردن کل مه (CLEAR_ALL)
        if ("CLEAR_ALL".equalsIgnoreCase(eventType)) {
            fogRepository.deleteBySceneId(event.getSceneId());
            scene.setFogFilled(false);
            sceneRepository.save(scene);
            return;
        }

        // ۲. پر کردن کل نقشه (FILL_ALL یا fill_all)
        if ("FILL_ALL".equalsIgnoreCase(eventType) || "fill_all".equalsIgnoreCase(eventType)) {
            fogRepository.deleteBySceneId(event.getSceneId());
            scene.setFogFilled(true);
            sceneRepository.save(scene);
            return;
        }

        // اگر پوینت‌ها نال باشد و نوع دستور شکل خاصی نباشد، ثبت نشود تا دیتابیس ارور ندهد
        if (event.getPoints() == null) {
            return;
        }

        FogRegion.FogType fogType;
        try {
            fogType = FogRegion.FogType.valueOf(eventType.toUpperCase());
        } catch (IllegalArgumentException e) {
            fogType = FogRegion.FogType.HIDE;
        }

        UUID targetId = null;
        if (event.getPoints() instanceof Map) {
            Object rawId = ((Map<?, ?>) event.getPoints()).get("id");
            if (rawId != null) {
                try {
                    targetId = UUID.fromString(rawId.toString().trim());
                } catch (Exception ignored) {}
            }
        }

        FogRegion region = null;
        if (targetId != null) {
            Optional<FogRegion> existing = fogRepository.findById(targetId);
            if (existing.isPresent()) {
                region = existing.get();
                region.setPoints(event.getPoints());
                region.setType(fogType);
            }
        }

        if (region == null) {
            region = FogRegion.builder()
                    .scene(scene)
                    .points(event.getPoints())
                    .type(fogType)
                    .build();
        }

        fogRepository.save(region);
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