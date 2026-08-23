package com.VTT.V10.room;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;

@Repository
public interface JournalRepository extends JpaRepository<Journal, UUID> {
    List<Journal> findByRoomId(UUID roomId);
}