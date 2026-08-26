package com.VTT.V10.room;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import java.util.UUID;

@Entity
@Table(name = "drawings")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Drawing {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "scene_id", nullable = false)
    private Scene scene;

    private String type; // marker, brush, line, rectangle, circle, triangle, hexagon, text
    private String tool;

    private String stroke; // رنگ خط
    private String color;
    private Double strokeWidth; // ضخامت خط
    private Double lineWidth;
    private String fill; // رنگ پس‌زمینه

    private Double x;
    private Double y;
    private Double width;
    private Double height;
    private Double radius;
    private String text;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    private Object points; // آرایه نقاط [x1, y1, x2, y2, ...]

    @Builder.Default
    private Boolean isGMLayer = false;

    @Builder.Default
    private Boolean isVisible = true;
}