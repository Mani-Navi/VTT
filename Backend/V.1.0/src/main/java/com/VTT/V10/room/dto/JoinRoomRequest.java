package com.VTT.V10.room.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class JoinRoomRequest {
    @NotBlank(message = "کد اتاق الزامی است")
    private String roomCode;
}