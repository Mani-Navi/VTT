package com.VTT.V10.room;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.UUID;

@Repository
public interface RoomSettingsRepository extends JpaRepository<RoomSettings, UUID> {
}