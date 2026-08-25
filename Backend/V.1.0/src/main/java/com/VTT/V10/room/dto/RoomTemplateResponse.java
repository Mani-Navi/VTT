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
public class RoomTemplateResponse {
    private UUID id;
    private String title;
    private String description;
    private Integer maxPlayers;
    private Integer expireDays;
    private String baseMapUrl;
    private String musicUrl;
}