package com.VTT.V10.room;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface FogRegionRepository extends JpaRepository<FogRegion, UUID> {
    List<FogRegion> findBySceneId(UUID sceneId);
    void deleteBySceneId(UUID sceneId);
}