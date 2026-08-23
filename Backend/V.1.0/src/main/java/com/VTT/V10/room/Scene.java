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
    private Boolean isActive = false;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "asset_id")
    private Asset backgroundAsset;

    // تنظیمات پیش‌فرض گرید
    @Column(name = "grid_size")
    private Integer gridSize = 50;

    @Column(name = "grid_color")
    private String gridColor = "#000000";

    @Column(name = "grid_opacity")
    private Double gridOpacity = 0.5;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}