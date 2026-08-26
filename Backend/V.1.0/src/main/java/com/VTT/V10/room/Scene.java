package com.VTT.V10.room;

import com.VTT.V10.asset.Asset;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "scenes")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Scene {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "room_id", nullable = false)
    private Room room;

    @Column(nullable = false)
    private String name;

    @Column(name = "is_active")
    @Builder.Default
    private Boolean isActive = true;

    @Column(name = "map_url", length = 1000)
    private String mapUrl;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "asset_id")
    private Asset backgroundAsset;

    // ابعاد نقشه
    @Builder.Default
    @Column(name = "map_width")
    private Integer mapWidth = 2000;

    @Builder.Default
    @Column(name = "map_height")
    private Integer mapHeight = 1500;

    // تنظیمات پیش‌فرض گرید
    @Builder.Default
    @Column(name = "grid_size")
    private Integer gridSize = 60;

    @Builder.Default
    @Column(name = "grid_color")
    private String gridColor = "#000000";

    @Builder.Default
    @Column(name = "grid_opacity")
    private Double gridOpacity = 0.35;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}