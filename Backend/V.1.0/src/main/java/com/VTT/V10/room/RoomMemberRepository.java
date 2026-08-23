package com.VTT.V10.room;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.UUID;

public interface RoomMemberRepository extends JpaRepository<RoomMember, UUID> {
    Optional<RoomMember> findByRoomIdAndUserEmail(UUID roomId, String email);
    boolean existsByRoomIdAndUserId(UUID roomId, UUID userId);
}