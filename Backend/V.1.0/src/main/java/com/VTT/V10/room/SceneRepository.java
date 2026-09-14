package com.VTT.V10.room;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface SceneRepository extends JpaRepository<Scene, UUID> {

    List<Scene> findByRoomId(UUID roomId);

    Optional<Scene> findByRoomIdAndIsActiveTrue(UUID roomId);

    long countByRoomId(UUID roomId);

    @Modifying
    @Query("UPDATE Scene s SET s.isActive = false WHERE s.room.id = :roomId")
    void deactivateAllScenesInRoom(@Param("roomId") UUID roomId);
}