package com.VTT.V10.room;

import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Table(name = "room_settings")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(of = "roomId")
@ToString(exclude = "room")
public class RoomSettings {

    @Id
    @Column(name = "room_id", nullable = false)
    private UUID roomId;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "room_id", insertable = false, updatable = false)
    private Room room;

    // تنظیمات عمومی
    @Builder.Default
    private Double zoomSensitivity = 1.0;

    @Builder.Default
    private String overlayEffect = "GLASS";

    @Builder.Default
    private Double gmFogBlend = 0.5;

    @Builder.Default
    private String colorTheme = "DARK";

    @Builder.Default
    private String inputMode = "AUTO";

    @Builder.Default
    private Double shapeSnapSensitivity = 0.5;

    @Builder.Default
    private Double gridSnapSensitivity = 0.5;

    // تنظیمات گرید تاکتیکال
    @Builder.Default
    private String gridType = "square";

    @Builder.Default
    private String lineType = "solid";

    @Builder.Default
    private String measurementType = "dnd5e_5105";

    @Builder.Default
    private Integer gridSize = 60;

    @Builder.Default
    private Double gridOpacity = 0.35;

    @Builder.Default
    private Double lineWidth = 1.5;

    @Builder.Default
    private String gridColor = "#000000";

    @Builder.Default
    private Boolean isGridSnapping = true;
}