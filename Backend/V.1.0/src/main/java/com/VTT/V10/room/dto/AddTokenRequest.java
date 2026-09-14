package com.VTT.V10.room.dto;

import jakarta.validation.constraints.NotNull;
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
public class AddTokenRequest {

    @NotNull(message = "شناسه صحنه الزامی است")
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

    // نمایش روی بوم
    private Boolean showHp;
    private Boolean showName;
    private Boolean showAc;
    private Boolean showConditions;
    private Boolean showNotes;

    // پرمیشن پلیر
    private Boolean allowPlayerHp;
    private Boolean allowPlayerConditions;
    private Boolean allowPlayerAc;
    private Boolean allowPlayerSize;

    private List<String> conditions;
}