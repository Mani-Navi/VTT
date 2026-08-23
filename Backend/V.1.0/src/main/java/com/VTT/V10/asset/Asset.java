package com.VTT.V10.asset;

import com.VTT.V10.user.User;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity @Table(name = "assets")
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class Asset {
    @Id @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @Column(nullable = false)
    private String name;

    @Enumerated(EnumType.STRING)
    private AssetType type; // MAP, TOKEN, PROP, etc.

    private String fileUrl;
    private Long fileSize;
    private String mimeType;

    private Integer width;
    private Integer height;

    @CreationTimestamp
    private LocalDateTime createdAt;

    public enum AssetType { MAP, TOKEN, PROP, ATTACHMENT, TEXT }
}