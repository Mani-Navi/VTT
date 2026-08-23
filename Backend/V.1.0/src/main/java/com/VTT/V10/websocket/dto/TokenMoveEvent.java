package com.VTT.V10.websocket.dto;

import lombok.Data;
import java.util.UUID;

@Data
public class TokenMoveEvent {
    private UUID tokenId;
    private Double x;
    private Double y;
    private Double rotation;
}