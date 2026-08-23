package com.VTT.V10.room.dto;

import lombok.Builder;
import lombok.Data;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Data @Builder
public class FogResponse {
    private UUID id;
    private String type;
    private List<Map<String, Double>> points;
}