package com.VTT.V10.room.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DrawingResponse {
    private UUID id;
    private String tool;
    private String color;
    private Double lineWidth;
    private String fill;
    private List<Map<String, Double>> points;
    private Boolean isVisible;
}