package com.VTT.V10.room.dto;

import lombok.Builder;
import lombok.Data;
import java.util.UUID;

@Data @Builder
public class RoomResponse {
    private UUID id;
    private String code;
    private String name;
    private String type; // STANDARD یا OFFICIAL
    private String ownerUsername;
}