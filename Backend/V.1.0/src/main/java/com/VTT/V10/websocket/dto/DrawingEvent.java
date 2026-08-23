package com.VTT.V10.websocket.dto;

import lombok.Data;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Data
public class DrawingEvent {
    private UUID drawingId; // در صورت آپدیت یا حذف
    private UUID sceneId;
    private String tool;
    private String color;
    private Double lineWidth;
    private List<Map<String, Double>> points;
}