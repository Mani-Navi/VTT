package com.VTT.V10.room;

import com.VTT.V10.user.User;
import jakarta.persistence.*;
import lombok.*;
import java.util.UUID;

@Entity @Table(name = "room_members")
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class RoomMember {
    @Id @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "room_id")
    private Room room;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @Enumerated(EnumType.STRING)
    private Role role;

    public enum Role { ADMIN, PLAYER } // ADMIN به جای GM
}