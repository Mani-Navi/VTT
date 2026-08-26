package com.VTT.V10.asset.dto;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
public class AssetResponse {
    private UUID id;
    private String name;
    private String type;
    private String fileUrl;
    private Long fileSize;
    private String mimeType;
    private Integer width;
    private Integer height;
    private Integer dpi;
    private Integer gridColumns;
    private Integer gridRows;
    private Float rotation;
    private Boolean isVisible;
    private Boolean isLocked;
    private String folderName;
    private String collectionName;
    private String collectionColor;
    private String defaultText;
    private String textColor;
    private Integer fontSize;
    private String fontFamily;
    private String ownerUsername;
    private LocalDateTime createdAt;
}