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
        RoomSettings settings = RoomSettings.builder()
                .roomId(roomId)
                .zoomSensitivity(1.0)
                .overlayEffect("GLASS")
                .gmFogBlend(0.5)
                .colorTheme("DARK")
                .inputMode("AUTO")
                .shapeSnapSensitivity(0.5)
                .gridSnapSensitivity(0.5)
                .gridType("square")
                .lineType("solid")
                .measurementType("dnd5e_5105")
                .gridSize(60)
                .gridOpacity(0.35)
                .lineWidth(1.5)
                .gridColor("#000000")
                .isGridSnapping(true)
                .build();

        return repository.save(settings);
    }

    @Transactional
    public RoomSettingsResponse updateSettings(UUID roomId, RoomSettingsResponse request) {
        RoomSettings settings = repository.findById(roomId)
                .orElseGet(() -> createDefaultSettings(roomId));

        if (request.getZoomSensitivity() != null) settings.setZoomSensitivity(request.getZoomSensitivity());
        if (request.getOverlayEffect() != null) settings.setOverlayEffect(request.getOverlayEffect());
        if (request.getGmFogBlend() != null) settings.setGmFogBlend(request.getGmFogBlend());
        if (request.getColorTheme() != null) settings.setColorTheme(request.getColorTheme());
        if (request.getInputMode() != null) settings.setInputMode(request.getInputMode());
        if (request.getShapeSnapSensitivity() != null) settings.setShapeSnapSensitivity(request.getShapeSnapSensitivity());
        if (request.getGridSnapSensitivity() != null) settings.setGridSnapSensitivity(request.getGridSnapSensitivity());

        if (request.getGridType() != null) settings.setGridType(request.getGridType());
        if (request.getLineType() != null) settings.setLineType(request.getLineType());
        if (request.getMeasurementType() != null) settings.setMeasurementType(request.getMeasurementType());
        if (request.getGridSize() != null) settings.setGridSize(request.getGridSize());
        if (request.getGridOpacity() != null) settings.setGridOpacity(request.getGridOpacity());
        if (request.getLineWidth() != null) settings.setLineWidth(request.getLineWidth());
        if (request.getGridColor() != null) settings.setGridColor(request.getGridColor());
        if (request.getIsGridSnapping() != null) settings.setIsGridSnapping(request.getIsGridSnapping());

        RoomSettings saved = repository.save(settings);
        return convertToResponse(saved);
    }

    @Transactional
    public RoomSettingsResponse resetToDefault(UUID roomId) {
        RoomSettings settings = RoomSettings.builder()
                .roomId(roomId)
                .zoomSensitivity(1.0)
                .overlayEffect("GLASS")
                .gmFogBlend(0.5)
                .colorTheme("DARK")
                .inputMode("AUTO")
                .shapeSnapSensitivity(0.5)
                .gridSnapSensitivity(0.5)
                .gridType("square")
                .lineType("solid")
                .measurementType("dnd5e_5105")
                .gridSize(60)
                .gridOpacity(0.35)
                .lineWidth(1.5)
                .gridColor("#000000")
                .isGridSnapping(true)
                .build();

        return convertToResponse(repository.save(settings));
    }

    private RoomSettingsResponse convertToResponse(RoomSettings s) {
        return RoomSettingsResponse.builder()
                .roomId(s.getRoomId())
                .zoomSensitivity(s.getZoomSensitivity())
                .overlayEffect(s.getOverlayEffect())
                .gmFogBlend(s.getGmFogBlend())
                .colorTheme(s.getColorTheme())
                .inputMode(s.getInputMode())
                .shapeSnapSensitivity(s.getShapeSnapSensitivity())
                .gridSnapSensitivity(s.getGridSnapSensitivity())
                .gridType(s.getGridType())
                .lineType(s.getLineType())
                .measurementType(s.getMeasurementType())
                .gridSize(s.getGridSize())
                .gridOpacity(s.getGridOpacity())
                .lineWidth(s.getLineWidth())
                .gridColor(s.getGridColor())
                .isGridSnapping(s.getIsGridSnapping())
                .build();
    }
}