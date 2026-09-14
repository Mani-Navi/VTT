package com.VTT.V10.room;

import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Table(name = "player_permissions")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@ToString(exclude = {"room", "member"})
@EqualsAndHashCode(of = "id")
public class PlayerPermission {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "room_id", nullable = false)
    private Room room;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "member_id", nullable = false)
    private RoomMember member;

    @Builder.Default
    @Column(name = "can_assets", nullable = false)
    private Boolean canAssets = false;

    @Builder.Default
    @Column(name = "can_text", nullable = false)
    private Boolean canText = false;

    @Builder.Default
    @Column(name = "can_fog", nullable = false)
    private Boolean canFog = false;

    @Builder.Default
    @Column(name = "can_drawing", nullable = false)
    private Boolean canDrawing = false;

    @Builder.Default
    @Column(name = "can_scene", nullable = false)
    private Boolean canScene = false;

    @Builder.Default
    @Column(name = "can_ruler", nullable = false)
    private Boolean canRuler = true;

    @Builder.Default
    @Column(name = "can_edit_token")
    private Boolean canEditToken = false;
}