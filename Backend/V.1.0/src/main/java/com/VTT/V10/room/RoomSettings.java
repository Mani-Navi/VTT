package com.VTT.V10.room;

import jakarta.persistence.*;
import lombok.*;
import java.util.UUID;

@Entity @Table(name = "room_settings")
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class RoomSettings {
    @Id
    private UUID roomId;

    @OneToOne(fetch = FetchType.LAZY)
    @MapsId
    @JoinColumn(name = "room_id")
    private Room room;

    @Builder.Default private Double zoomSensitivity = 1.0;
    @Builder.Default private String overlayEffect = "GLASS";
    @Builder.Default private Double gmFogBlend = 0.5;
    @Builder.Default private String colorTheme = "DARK";
    @Builder.Default private Double gridSnapSensitivity = 0.5;
    @Builder.Default private Double lineWidth = 2.0;
}