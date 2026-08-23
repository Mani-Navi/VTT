package com.VTT.V10.room;

import jakarta.persistence.*;
import lombok.*;
import java.util.UUID;

@Entity @Table(name = "player_permissions")
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class PlayerPermission {
    @Id @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "room_id")
    private Room room;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "member_id")
    private RoomMember member;

    private Boolean canAssets = false;
    private Boolean canText = true;
    private Boolean canFog = false;
    private Boolean canDrawing = true;
    @Column(name = "can_scene") // هماهنگ با دیتابیس شما
    private Boolean canScene = false;
    private Boolean canRuler = true;
}