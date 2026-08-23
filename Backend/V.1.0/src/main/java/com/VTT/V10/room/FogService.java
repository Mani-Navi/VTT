package com.VTT.V10.room;

import com.VTT.V10.room.dto.FogResponse;
import com.VTT.V10.websocket.dto.FogEvent;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FogService {
    private final FogRegionRepository fogRepository;
    private final SceneRepository sceneRepository;

    @Transactional
    public void handleFogUpdate(FogEvent event) {
        if ("CLEAR_ALL".equals(event.getType())) {
            fogRepository.deleteBySceneId(event.getSceneId());
            return;
        }

        Scene scene = sceneRepository.findById(event.getSceneId()).orElseThrow();

        FogRegion region = FogRegion.builder()
                .scene(scene)
                .points(event.getPoints())
                .type(FogRegion.FogType.valueOf(event.getType()))
                .build();

        fogRepository.save(region);
    }

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