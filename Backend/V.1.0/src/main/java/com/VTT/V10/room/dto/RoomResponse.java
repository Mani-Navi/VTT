package com.VTT.V10.room.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RoomResponse {
    private UUID id;
    private String code;
    private String name;
    private String type; // STANDARD یا OFFICIAL
    private String ownerUsername;
    private String role; // "GM" یا "Player"

    @JsonProperty("is_active")
    @Builder.Default
    private Boolean isActive = true;

    @JsonProperty("player_count")
    @Builder.Default
    private Integer playerCount = 1;

    @JsonProperty("expires_at")
    private LocalDateTime expiresAt;

    // متد کمکی برای فرانت‌اند تا هر دو فرمت res.id و res.roomId کار کنند
    @JsonProperty("roomId")
    public UUID getRoomId() {
        return this.id;
    }
}