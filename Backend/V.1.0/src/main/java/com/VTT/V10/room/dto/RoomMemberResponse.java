package com.VTT.V10.room.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RoomMemberResponse {
    private UUID id; // memberId
    private UUID userId;
    private String username;
    private String email;
    private String role; // "GM" یا "Player"
    private String roleTitle; // عنوان نمایشی رول (مانند: میزبان، دانجن‌مستر، ماجراجو)
    private Boolean isOwner;
    private Boolean isMuted;
    private Boolean isBanned;
    private Boolean isOnline; // وضعیت آنلاین لحظه‌ای
    private PermissionResponse permissions;
}