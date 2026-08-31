package com.VTT.V10.websocket.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DrawingEvent {
    private String drawingId;
    private UUID sceneId;
    private String id;
    private String clientDrawingId;
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

    // فیلدهای متن اضافه شدند
    private String text;
    private String fontFamily;
    private String fontStyle;
    private Double fontSize;

    private Double scaleX;
    private Double scaleY;
    private Double rotation;
    private Object points;
    private Boolean isGMLayer;
}