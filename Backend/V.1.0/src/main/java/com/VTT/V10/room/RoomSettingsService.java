package com.VTT.V10.room;

import com.VTT.V10.room.dto.RoomSettingsResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RoomSettingsService {
    private final RoomSettingsRepository repository;
    private final RoomRepository roomRepository;

    @Transactional
    public RoomSettingsResponse getSettings(UUID roomId) {
        RoomSettings settings = repository.findById(roomId)
                .orElseGet(() -> createDefaultSettings(roomId));
        return convertToResponse(settings);
    }

    @Transactional
    public RoomSettings createDefaultSettings(UUID roomId) {
        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new RuntimeException("اتاق یافت نشد"));

        RoomSettings settings = new RoomSettings();
        settings.setRoom(room); // برای حل مشکل شناسه‌ی تهی (Null ID)
        settings.setZoomSensitivity(1.0);
        settings.setColorTheme("DARK");
        settings.setLineWidth(2.0);
        settings.setGridSnapSensitivity(0.5);
        settings.setGmFogBlend(0.5);
        settings.setOverlayEffect("GLASS");

        return repository.save(settings);
    }

    // متدی که در کنترلر شما قرمز بود:
    @Transactional
    public RoomSettingsResponse updateSettings(UUID roomId, RoomSettingsResponse request) {
        // ۱. پیدا کردن تنظیمات فعلی یا ساخت تنظیمات جدید اگر وجود نداشت
        RoomSettings settings = repository.findById(roomId)
                .orElseGet(() -> createDefaultSettings(roomId));

        // ۲. آپدیت فیلدها (فقط اگر در درخواست مقدار فرستاده شده باشد)
        if (request.getZoomSensitivity() != null) settings.setZoomSensitivity(request.getZoomSensitivity());
        if (request.getColorTheme() != null) settings.setColorTheme(request.getColorTheme());
        if (request.getLineWidth() != null) settings.setLineWidth(request.getLineWidth());
        if (request.getGridSnapSensitivity() != null) settings.setGridSnapSensitivity(request.getGridSnapSensitivity());
        if (request.getGmFogBlend() != null) settings.setGmFogBlend(request.getGmFogBlend());
        if (request.getOverlayEffect() != null) settings.setOverlayEffect(request.getOverlayEffect());

        // ۳. ذخیره در دیتابیس
        RoomSettings savedSettings = repository.save(settings);

        // ۴. برگرداندن پاسخ به صورت DTO
        return convertToResponse(savedSettings);
    }

    private RoomSettingsResponse convertToResponse(RoomSettings s) {
        return RoomSettingsResponse.builder()
                .roomId(s.getRoomId())
                .zoomSensitivity(s.getZoomSensitivity())
                .colorTheme(s.getColorTheme())
                .gridSnapSensitivity(s.getGridSnapSensitivity())
                .lineWidth(s.getLineWidth())
                .gmFogBlend(s.getGmFogBlend())
                .overlayEffect(s.getOverlayEffect())
                .build();
    }
}