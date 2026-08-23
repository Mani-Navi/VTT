package com.VTT.V10.room;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Entity @Table(name = "drawings")
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class Drawing {
    @Id @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "scene_id")
    private Scene scene;

    private String tool; // pencil, brush, rectangle, circle
    private String color;
    private Double lineWidth;
    private String fill; // برای اشکال پر شده

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    private List<Map<String, Double>> points; // لیست نقاط [{x:1, y:1}, {x:2, y:2}]

    private Boolean isVisible = true;
}