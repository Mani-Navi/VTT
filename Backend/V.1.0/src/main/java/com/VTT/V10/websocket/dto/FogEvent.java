package com.VTT.V10.websocket.dto;

import lombok.Data;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Data
public class FogEvent {
    private UUID sceneId;
    private String type; // HIDE, REVEAL, CLEAR_ALL
    private List<Map<String, Double>> points;
}