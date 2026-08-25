package com.VTT.V10.room;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface RoomMemberRepository extends JpaRepository<RoomMember, UUID> {
    Optional<RoomMember> findByRoomIdAndUserEmail(UUID roomId, String email);
    boolean existsByRoomIdAndUserId(UUID roomId, UUID userId);
    List<RoomMember> findAllByUserId(UUID userId);
    long countByUserId(UUID userId);
    void deleteByRoomId(UUID roomId);
    void deleteByRoomIdAndUserId(UUID roomId, UUID userId);
}