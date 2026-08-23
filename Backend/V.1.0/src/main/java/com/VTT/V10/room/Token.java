package com.VTT.V10.room;

import com.VTT.V10.asset.Asset;
import jakarta.persistence.*;
import lombok.*;
import java.util.UUID;

@Entity @Table(name = "tokens")
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class Token {
    @Id @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "scene_id")
    private Scene scene;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "asset_id")
    private Asset asset;

    private String label;
    private Double x;
    private Double y;
    private Double rotation;

    private Integer hp;
    private Integer maxHp;
}