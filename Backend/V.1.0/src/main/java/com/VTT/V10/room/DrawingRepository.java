package com.VTT.V10.room;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Repository
public interface DrawingRepository extends JpaRepository<Drawing, UUID> {

    List<Drawing> findBySceneId(UUID sceneId);

    List<Drawing> findByClientDrawingId(String clientDrawingId);

    @Modifying
    @Transactional
    @Query("DELETE FROM Drawing d WHERE d.id = :id")
    int deleteByIdDirect(@Param("id") UUID id);

    @Modifying
    @Transactional
    @Query("DELETE FROM Drawing d WHERE d.clientDrawingId = :clientDrawingId")
    int deleteByClientDrawingIdDirect(@Param("clientDrawingId") String clientDrawingId);

    // کوئری بومی ۱۰۰٪ سازگار با PostgreSQL
    @Modifying
    @Transactional
    @Query(value = "DELETE FROM drawings WHERE client_drawing_id = :targetId OR CAST(id AS TEXT) = :targetId", nativeQuery = true)
    int deleteByAnyIdNative(@Param("targetId") String targetId);

    @Modifying
    @Transactional
    @Query("DELETE FROM Drawing d WHERE d.scene.id = :sceneId")
    void deleteBySceneId(@Param("sceneId") UUID sceneId);
}