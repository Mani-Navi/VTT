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
public class SocketEvent<T> {
    private UUID roomId;
    private String action; // MOVE, ADD, DELETE, UPDATE
    private T data;
}