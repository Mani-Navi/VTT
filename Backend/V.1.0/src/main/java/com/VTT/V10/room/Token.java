package com.VTT.V10.room;

import com.VTT.V10.asset.Asset;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "tokens")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@ToString(exclude = {"scene", "asset"})
@EqualsAndHashCode(of = "id")
public class Token {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "scene_id")
    private Scene scene;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "asset_id")
    private Asset asset;

    private String label;

    @Column(columnDefinition = "TEXT")
    private String avatarUrl;

    private Double x;
    private Double y;
    private Double rotation;
    private Double size;

    private Integer hp;
    private Integer maxHp;
    private Integer ac;
    private Integer elevation;
    private Boolean isHidden;
    private Boolean isLocked;

    private String controlledBy;

    @Column(columnDefinition = "TEXT")
    private String gmNotes;

    @Builder.Default
    private Boolean isProp = false;
    private Integer goldValue;
    private Integer xpValue;
    private Boolean isLooted;

    @Builder.Default
    private Boolean showHp = true;
    @Builder.Default
    private Boolean showName = true;
    @Builder.Default
    private Boolean showAc = true;
    @Builder.Default
    private Boolean showConditions = true;
    @Builder.Default
    private Boolean showNotes = false;

    @Builder.Default
    private Boolean allowPlayerHp = true;
    @Builder.Default
    private Boolean allowPlayerConditions = true;
    @Builder.Default
    private Boolean allowPlayerAc = true;
    @Builder.Default
    private Boolean allowPlayerSize = true;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    @Builder.Default
    private List<String> conditions = new ArrayList<>();
}