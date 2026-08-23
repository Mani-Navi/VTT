package com.VTT.V10.room;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface SceneRepository extends JpaRepository<Scene, UUID> {
    List<Scene> findByRoomId(UUID roomId);

    Optional<Scene> findByRoomIdAndIsActiveTrue(UUID roomId);

    // متدی برای غیرفعال کردن تمام سکانس‌های یک اتاق (وقتی یک سکانس جدید فعال می‌شود)
    @Modifying
    @Query("UPDATE Scene s SET s.isActive = false WHERE s.room.id = :roomId")
    void deactivateAllScenesInRoom(UUID roomId);
}