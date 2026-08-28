package com.VTT.V10.room.dto;

import lombok.Data;
import java.util.List;
import java.util.UUID;

@Data
public class AddTokenRequest {
    private UUID sceneId;
    private UUID assetId;
    private String label;
    private String avatarUrl;
    private Double x;
    private Double y;
    private Double size;
    private Integer hp;
    private Integer maxHp;
    private Integer ac;
    private String controlledBy;
    private String gmNotes;
    private Boolean isProp;
    private Integer goldValue;
    private Integer xpValue;
    private Boolean showHp;
    private Boolean showName;
    private Boolean showAc;
    private Boolean showConditions;
    private Boolean showNotes;
    private List<String> conditions;
}