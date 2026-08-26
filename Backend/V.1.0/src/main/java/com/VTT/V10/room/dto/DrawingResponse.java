package com.VTT.V10.room.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DrawingResponse {
    private UUID id;
    private String type;
    private String tool;
    private String stroke;
    private String color;
    private Double strokeWidth;
    private Double lineWidth;
    private String fill;
    private Double x;
    private Double y;
    private Double width;
    private Double height;
    private Double radius;
    private String text;
    private Object points;
    private Boolean isGMLayer;
    private Boolean isVisible;
}