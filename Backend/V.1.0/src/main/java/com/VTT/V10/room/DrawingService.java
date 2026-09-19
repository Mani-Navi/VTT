package com.VTT.V10.room;

import com.VTT.V10.room.dto.DrawingResponse;
import com.VTT.V10.websocket.dto.DrawingEvent;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class DrawingService {

    private final DrawingRepository drawingRepository;
    private final SceneRepository sceneRepository;
    private final ObjectMapper objectMapper;

    @Async
    @Transactional
    public void asyncSaveOrUpdateDrawing(UUID roomId, DrawingEvent event) {
        try {
            UUID sceneId = event.getSceneId();
            if (sceneId == null) {
                var activeScene = sceneRepository.findByRoomIdAndIsActiveTrue(roomId);
                if (activeScene.isPresent()) {
                    sceneId = activeScene.get().getId();
                } else {
                    var scenes = sceneRepository.findByRoomId(roomId);
                    if (!scenes.isEmpty()) {
                        sceneId = scenes.get(0).getId();
                    }
                }
            }
            if (sceneId != null) {
                saveOrUpdateDrawing(sceneId, event);
            }
        } catch (Exception e) {
            log.error("Async Drawing save error: {}", e.getMessage(), e);
        }
    }

    @Async
    @Transactional
    public void asyncDeleteDrawing(UUID roomId, DrawingEvent event) {
        try {
            String targetId = event.getClientDrawingId() != null
                    ? event.getClientDrawingId()
                    : (event.getId() != null ? event.getId() : event.getDrawingId());

            UUID sceneId = event.getSceneId();
            if (sceneId == null) {
                var activeScene = sceneRepository.findByRoomIdAndIsActiveTrue(roomId);
                if (activeScene.isPresent()) {
                    sceneId = activeScene.get().getId();
                }
            }
            deleteDrawing(sceneId, targetId);
        } catch (Exception e) {
            log.warn("Async Drawing delete warning: {}", e.getMessage());
        }
    }

    @Transactional
    public void saveOrUpdateDrawing(UUID sceneId, DrawingEvent event) {
        if (sceneId == null && event.getSceneId() != null) {
            sceneId = event.getSceneId();
        }
        if (sceneId == null) return;

        Scene scene = sceneRepository.findById(sceneId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "صحنه یافت نشد"));

        String stringId = event.getClientDrawingId() != null
                ? event.getClientDrawingId()
                : (event.getId() != null ? event.getId() : event.getDrawingId());

        Optional<Drawing> existingOpt = Optional.empty();

        if (stringId != null && !stringId.isBlank()) {
            List<Drawing> byClient = drawingRepository.findByClientDrawingId(stringId.trim());
            if (!byClient.isEmpty()) {
                existingOpt = Optional.of(byClient.get(0));
            } else {
                try {
                    UUID parsedUuid = UUID.fromString(stringId.trim());
                    existingOpt = drawingRepository.findById(parsedUuid);
                } catch (IllegalArgumentException ignored) {}
            }
        }

        String finalType = event.getType() != null ? event.getType() : event.getTool();
        String finalStroke = event.getStroke() != null ? event.getStroke() : event.getColor();
        Double finalStrokeWidth = event.getStrokeWidth() != null ? event.getStrokeWidth() : event.getLineWidth();

        // تبدیل ایمن Object points به JsonNode
        JsonNode pointsNode = null;
        if (event.getPoints() != null) {
            if (event.getPoints() instanceof JsonNode jn) {
                pointsNode = jn;
            } else {
                try {
                    pointsNode = objectMapper.valueToTree(event.getPoints());
                } catch (Exception ex) {
                    log.warn("Could not convert points to JsonNode: {}", ex.getMessage());
                }
            }
        }

        Drawing drawing;
        if (existingOpt.isPresent()) {
            drawing = existingOpt.get();
            if (finalType != null) {
                drawing.setType(finalType);
                drawing.setTool(finalType);
            }
            if (finalStroke != null) {
                drawing.setStroke(finalStroke);
                drawing.setColor(finalStroke);
            }
            if (finalStrokeWidth != null) {
                drawing.setStrokeWidth(finalStrokeWidth);
                drawing.setLineWidth(finalStrokeWidth);
            }
            if (event.getFill() != null) drawing.setFill(event.getFill());
            if (event.getX() != null) drawing.setX(event.getX());
            if (event.getY() != null) drawing.setY(event.getY());
            if (event.getWidth() != null) drawing.setWidth(event.getWidth());
            if (event.getHeight() != null) drawing.setHeight(event.getHeight());
            if (event.getRadius() != null) drawing.setRadius(event.getRadius());

            if (event.getText() != null) drawing.setText(event.getText());
            if (event.getFontFamily() != null) drawing.setFontFamily(event.getFontFamily());
            if (event.getFontStyle() != null) drawing.setFontStyle(event.getFontStyle());
            if (event.getFontSize() != null) drawing.setFontSize(event.getFontSize());

            if (event.getScaleX() != null) drawing.setScaleX(event.getScaleX());
            if (event.getScaleY() != null) drawing.setScaleY(event.getScaleY());
            if (event.getRotation() != null) drawing.setRotation(event.getRotation());
            if (pointsNode != null) drawing.setPoints(pointsNode);
            if (event.getIsGMLayer() != null) drawing.setIsGMLayer(event.getIsGMLayer());
        } else {
            drawing = Drawing.builder()
                    .scene(scene)
                    .clientDrawingId(stringId)
                    .type(finalType)
                    .tool(finalType)
                    .stroke(finalStroke)
                    .color(finalStroke)
                    .strokeWidth(finalStrokeWidth != null ? finalStrokeWidth : 4.0)
                    .lineWidth(finalStrokeWidth != null ? finalStrokeWidth : 4.0)
                    .fill(event.getFill())
                    .x(event.getX() != null ? event.getX() : 0.0)
                    .y(event.getY() != null ? event.getY() : 0.0)
                    .width(event.getWidth())
                    .height(event.getHeight())
                    .radius(event.getRadius())
                    .text(event.getText())
                    .fontFamily(event.getFontFamily())
                    .fontStyle(event.getFontStyle())
                    .fontSize(event.getFontSize())
                    .scaleX(event.getScaleX() != null ? event.getScaleX() : 1.0)
                    .scaleY(event.getScaleY() != null ? event.getScaleY() : 1.0)
                    .rotation(event.getRotation() != null ? event.getRotation() : 0.0)
                    .points(pointsNode)
                    .isGMLayer(Boolean.TRUE.equals(event.getIsGMLayer()))
                    .isVisible(true)
                    .build();
        }

        drawingRepository.saveAndFlush(drawing);
    }

    @Transactional
    public void deleteDrawing(UUID sceneId, String drawingIdStr) {
        if (drawingIdStr == null || drawingIdStr.isBlank()) return;
        String cleanId = drawingIdStr.trim();

        try {
            UUID uuid = UUID.fromString(cleanId);
            int count = drawingRepository.deleteByIdDirect(uuid);
            if (count > 0) {
                drawingRepository.flush();
                return;
            }
        } catch (IllegalArgumentException ignored) {}

        int clientCount = drawingRepository.deleteByClientDrawingIdDirect(cleanId);
        if (clientCount > 0) {
            drawingRepository.flush();
            return;
        }

        try {
            drawingRepository.deleteByAnyIdNative(cleanId);
            drawingRepository.flush();
        } catch (Exception e) {
            log.warn("Native query delete fallback error: {}", e.getMessage());
        }
    }

    @Transactional(readOnly = true)
    public List<DrawingResponse> getByScene(UUID sceneId) {
        return drawingRepository.findBySceneId(sceneId).stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    private DrawingResponse convertToResponse(Drawing d) {
        String effectiveId = d.getClientDrawingId() != null && !d.getClientDrawingId().isBlank()
                ? d.getClientDrawingId()
                : String.valueOf(d.getId());

        return DrawingResponse.builder()
                .id(d.getId())
                .clientDrawingId(effectiveId)
                .type(d.getType())
                .tool(d.getType())
                .stroke(d.getStroke() != null ? d.getStroke() : d.getColor())
                .color(d.getColor() != null ? d.getColor() : d.getStroke())
                .strokeWidth(d.getStrokeWidth() != null ? d.getStrokeWidth() : d.getLineWidth())
                .lineWidth(d.getLineWidth() != null ? d.getLineWidth() : d.getStrokeWidth())
                .fill(d.getFill())
                .x(d.getX())
                .y(d.getY())
                .width(d.getWidth())
                .height(d.getHeight())
                .radius(d.getRadius())
                .scaleX(d.getScaleX() != null ? d.getScaleX() : 1.0)
                .scaleY(d.getScaleY() != null ? d.getScaleY() : 1.0)
                .rotation(d.getRotation() != null ? d.getRotation() : 0.0)
                .text(d.getText())
                .fontFamily(d.getFontFamily())
                .fontStyle(d.getFontStyle())
                .fontSize(d.getFontSize())
                .points(d.getPoints())
                .isGMLayer(d.getIsGMLayer())
                .isVisible(d.getIsVisible())
                .build();
    }
}