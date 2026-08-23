package com.VTT.V10.room;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PlayerPermissionRepository extends JpaRepository<PlayerPermission, UUID> {

    // پیدا کردن پرمیشن بر اساس آیدی عضو (member_id)
    Optional<PlayerPermission> findByMemberId(UUID memberId);

    Optional<PlayerPermission> findByRoomIdAndMemberId(UUID roomId, UUID memberId);
}