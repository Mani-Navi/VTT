package com.VTT.V10.room;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface DrawingRepository extends JpaRepository<Drawing, UUID> {
    List<Drawing> findBySceneId(UUID sceneId);
}