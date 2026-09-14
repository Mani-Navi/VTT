package com.VTT.V10.asset.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateAssetRequest {
    private String name;
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
}