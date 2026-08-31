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

    @Column(name = "client_drawing_id")
    private String clientDrawingId; // شناسه یکتای سمت فرانت‌اند جهت جلوگیری از ایجاد رکوردهای تکراری

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "scene_id", nullable = false)
    private Scene scene;

    private String type;
    private String tool;

    private String stroke;
    private String color;
    private Double strokeWidth;
    private Double lineWidth;
    private String fill;

    private Double x;
    private Double y;
    private Double width;
    private Double height;
    private Double radius;
    private String text;

    @Builder.Default
    private Double scaleX = 1.0;

    @Builder.Default
    private Double scaleY = 1.0;

    @Builder.Default
    private Double rotation = 0.0;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    private Object points;

    @Builder.Default
    private Boolean isGMLayer = false;

    @Builder.Default
    private Boolean isVisible = true;
}