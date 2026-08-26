package com.VTT.V10.asset;

import com.VTT.V10.user.User;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "assets")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Asset {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    @JsonIgnore
    private User user;

    @Column(nullable = false)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AssetType type; // MAP, TOKEN, PROP, ATTACHMENT, TEXT

    @Column(nullable = false, length = 1000)
    private String fileUrl;

    private Long fileSize;
    private String mimeType;

    // متادیتاهای تصویری و اسپرایت (UCS-03)
    private Integer width;
    private Integer height;

    @Builder.Default
    private Integer dpi = 150;

    @Builder.Default
    private Integer gridColumns = 1;

    @Builder.Default
    private Integer gridRows = 1;

    @Builder.Default
    private Float rotation = 0f;

    @Builder.Default
    private Boolean isVisible = true;

    @Builder.Default
    private Boolean isLocked = false;

    // دسته‌بندی و کالکشن
    private String folderName;
    private String collectionName;
    private String collectionColor;

    // تنظیمات متنی (Text Asset)
    private String defaultText;
    private String textColor;
    private Integer fontSize;
    private String fontFamily;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false, nullable = true)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = true)
    private LocalDateTime updatedAt;

    public enum AssetType {
        MAP,
        TOKEN,
        PROP,
        ATTACHMENT,
        TEXT
    }
}