package com.VTT.V10.websocket.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TokenMoveEvent {
    // استفاده از String برای پشتیبانی همزمان از UUID دیتابیس و شناسه‌های موقت کلاینت
    private String tokenId;

    // موقعیت و ابعاد
    private Double x;
    private Double y;
    private Double rotation;
    private Double size;

    // مشخصات کاراکتر و آواتار
    private String name;
    private String label;
    private String avatarUrl;

    // ویژگی‌های سلامتی و زرهی
    private Integer hp;
    private Integer maxHp;
    private Integer ac;

    // یادداشت GM و وضعیت‌های اختصاصی
    private String gmNotes;
    private Boolean isHidden;
    private Boolean isLocked;
    private Boolean isDeleted;

    // ویژگی‌های اشیاء (Props)
    private Boolean isProp;
    private Integer goldValue;
    private Integer xpValue;
    private Boolean isLooted;

    // تاگل‌های کنترل نمایش روی بوم
    private Boolean showHp;
    private Boolean showName;
    private Boolean showAc;
    private Boolean showConditions;
    private Boolean showNotes;

    // لیست کاندیشن‌های فعال روی توکن
    private List<String> conditions;
}