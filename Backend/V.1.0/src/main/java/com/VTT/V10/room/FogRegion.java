package com.VTT.V10.room;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Entity @Table(name = "fog_regions")
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class FogRegion {
    @Id @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "scene_id")
    private Scene scene;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb", nullable = false)
    private List<Map<String, Double>> points; // نقاط چندضلعی مه

    @Enumerated(EnumType.STRING)
    private FogType type = FogType.HIDE; // HIDE (پوشاندن) یا REVEAL (آشکار کردن)

    public enum FogType { HIDE, REVEAL }
}