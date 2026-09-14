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
public class FogEvent {
    private UUID sceneId;
    private String type; // HIDE, REVEAL, CLEAR_ALL
    private Object points;
}