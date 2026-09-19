package com.VTT.V10.websocket.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TokenMoveEvent {
    private String tokenId;

    private Double x;
    private Double y;
    private Double rotation;
    private Double size;

    private String name;
    private String label;
    private String avatarUrl;

    private Integer hp;
    private Integer maxHp;
    private Integer ac;

    private String controlledBy;
    private String gmNotes;
    private Boolean isHidden;
    private Boolean isLocked;
    private Boolean isDeleted;

    private Boolean isProp;
    private Integer goldValue;
    private Integer xpValue;
    private Boolean isLooted;

    // Canvas presentation flags
    private Boolean showHp;
    private Boolean showName;
    private Boolean showAc;
    private Boolean showConditions;
    private Boolean showNotes;

    // Player permissions
    private Boolean allowPlayerHp;
    private Boolean allowPlayerConditions;
    private Boolean allowPlayerAc;
    private Boolean allowPlayerSize;

    private List<String> conditions;
}