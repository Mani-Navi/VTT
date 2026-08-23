package com.VTT.V10.room;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface FogRegionRepository extends JpaRepository<FogRegion, UUID> {
    List<FogRegion> findBySceneId(UUID sceneId);
    void deleteBySceneId(UUID sceneId); // برای پاک کردن کل مه نقشه
}