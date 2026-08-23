package com.VTT.V10.room;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface TokenRepository extends JpaRepository<Token, UUID> {
    // پیدا کردن تمام توکن‌های یک سکانس خاص
    List<Token> findBySceneId(UUID sceneId);

    // حذف تمام توکن‌های یک سکانس (مثلاً وقتی سکانس کلاً پاک می‌شود)
    void deleteBySceneId(UUID sceneId);
}