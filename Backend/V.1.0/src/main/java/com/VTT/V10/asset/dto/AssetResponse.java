package com.VTT.V10.asset.dto;

import lombok.Builder;
import lombok.Data;
import java.util.UUID;

@Data @Builder
public class AssetResponse {
    private UUID id;
    private String name;
    private String type;
    private String fileUrl;
    private Long fileSize;
    private String ownerUsername;
}