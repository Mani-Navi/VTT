package com.VTT.V10.room.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SceneStateResponse {
    private SceneResponse scene;
    private List<TokenResponse> tokens;
    private List<DrawingResponse> drawings;
    private List<FogResponse> fogRegions;
}