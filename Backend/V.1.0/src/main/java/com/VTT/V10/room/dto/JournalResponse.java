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
public class JournalResponse {
    private UUID id;

    // عنوان کتاب یا نوت (مثلاً: قوانین بازی، راهنمای طبقه اول)
    private String title;

    // متن اصلی که می‌تواند شامل سناریو یا دستورالعمل باشد
    private String content;

    // مشخص می‌کند که آیا این نوت فقط برای مدیر (ADMIN) است یا خیر
    private Boolean isAdminOnly;
}