package com.VTT.V10.room.dto;

import lombok.Builder;
import lombok.Data;
import java.util.UUID;

@Data @Builder
public class TokenResponse {
    private UUID id;
    private String label;
    private Double x;
    private Double y;
    private Double rotation;
    private String assetUrl;
    private Integer hp;
    private Integer maxHp;
}