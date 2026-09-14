package com.VTT.V10.user;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "users")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@ToString(exclude = {"password", "verificationCode"})
@EqualsAndHashCode(of = "id")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(unique = true, nullable = false, length = 50)
    private String username;

    @Column(unique = true, nullable = false, length = 150)
    private String email;

    @Column(name = "password_hash")
    private String password;

    @Column(name = "avatar_url", length = 500)
    private String avatarUrl;

    @Column(name = "google_id", length = 100)
    private String googleId;

    @Column(name = "is_email_verified", nullable = false)
    @Builder.Default
    private boolean isEmailVerified = false;

    @Column(name = "is_premium", nullable = false)
    @Builder.Default
    private boolean isPremium = false;

    @Column(name = "verification_code", length = 6)
    private String verificationCode;

    @Column(name = "verification_expiry")
    private LocalDateTime verificationExpiry;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "last_seen_at")
    private LocalDateTime lastSeenAt;
}