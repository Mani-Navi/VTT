package com.VTT.V10.room.dto;

import lombok.Builder;
import lombok.Data;
import java.util.List;

@Data @Builder
public class SceneStateResponse {
    private SceneResponse scene;
    private List<TokenResponse> tokens;
    private List<DrawingResponse> drawings;
    private List<FogResponse> fogRegions;
}