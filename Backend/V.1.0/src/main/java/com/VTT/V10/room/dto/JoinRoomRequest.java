package com.VTT.V10.room.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class JoinRoomRequest {

    @JsonProperty("roomCode")
    @JsonAlias({"code", "roomCode"})
    @NotBlank(message = "کد اتاق الزامی است")
    private String roomCode;

    private String password;
}