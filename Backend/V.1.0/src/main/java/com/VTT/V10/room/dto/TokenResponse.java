package com.VTT.V10.room.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TokenResponse {
    private UUID id;
    private String label;
    private Double x;
    private Double y;
    private Double rotation;
    private Double size;
    private String assetUrl;
    private Integer hp;
    private Integer maxHp;
    private Integer ac;
    private Integer elevation;
    private Boolean isHidden;
    private Boolean isLocked;
    private String controlledBy;
    private String gmNotes;
    private Boolean isProp;
    private Integer goldValue;
    private Integer xpValue;
    private Boolean isLooted;

    // نمایش روی بوم
    private Boolean showHp;
    private Boolean showName;
    private Boolean showAc;
    private Boolean showConditions;
    private Boolean showNotes;

    // پرمیشن دسترسی پلیر
    private Boolean allowPlayerHp;
    private Boolean allowPlayerConditions;
    private Boolean allowPlayerAc;
    private Boolean allowPlayerSize;

    private List<String> conditions;
}