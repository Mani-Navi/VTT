package com.VTT.V10.room;

import com.VTT.V10.user.User;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "rooms")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Room {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(unique = true, nullable = false)
    private String code;

    @Column(nullable = false)
    private String name;

    @Column(length = 500)
    private String description;

    private String password;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_id")
    private User owner;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private RoomType type = RoomType.STANDARD;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "template_id")
    private RoomTemplate template;

    @Builder.Default
    private Integer maxPlayers = 10;

    @Builder.Default
    private Integer expireDays = 30;

    private String musicUrl;

    // عناوین نمایشی نقش‌های اتاق (پایدار در دیتابیس)
    @Builder.Default
    @Column(name = "host_role_title")
    private String hostRoleTitle = "میزبان";

    @Builder.Default
    @Column(name = "player_role_title")
    private String playerRoleTitle = "بازیکن";

    @CreationTimestamp
    private LocalDateTime createdAt;

    private LocalDateTime lastActive;

    private LocalDateTime gmLastSeenAt;

    @Builder.Default
    private Boolean isActive = false;

    @Column(name = "expires_at", insertable = false, updatable = false)
    private LocalDateTime expiresAt;

    public enum RoomType { STANDARD, OFFICIAL }
}