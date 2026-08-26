package com.VTT.V10.room;

import com.VTT.V10.room.dto.DrawingResponse;
import com.VTT.V10.websocket.dto.DrawingEvent;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DrawingService {
    private final DrawingRepository drawingRepository;
    private final SceneRepository sceneRepository;

    @Transactional
    public void saveDrawing(UUID sceneId, DrawingEvent event) {
        if (sceneId == null && event.getSceneId() != null) {
            sceneId = event.getSceneId();
        }

        if (sceneId == null) return;

        Scene scene = sceneRepository.findById(sceneId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "صحنه یافت نشد"));

        String finalType = event.getType() != null ? event.getType() : event.getTool();
        String finalStroke = event.getStroke() != null ? event.getStroke() : event.getColor();
        Double finalStrokeWidth = event.getStrokeWidth() != null ? event.getStrokeWidth() : event.getLineWidth();

        Drawing drawing = Drawing.builder()
                .scene(scene)
                .type(finalType)
                .tool(finalType)
                .stroke(finalStroke)
                .color(finalStroke)
                .strokeWidth(finalStrokeWidth != null ? finalStrokeWidth : 4.0)
                .lineWidth(finalStrokeWidth != null ? finalStrokeWidth : 4.0)
                .fill(event.getFill())
                .x(event.getX())
                .y(event.getY())
                .width(event.getWidth())
                .height(event.getHeight())
                .radius(event.getRadius())
                .text(event.getText())
                .points(event.getPoints())
                .isGMLayer(Boolean.TRUE.equals(event.getIsGMLayer()))
                .isVisible(true)
                .build();

        drawingRepository.save(drawing);
    }

    @Transactional(readOnly = true)
    public List<DrawingResponse> getByScene(UUID sceneId) {
        return drawingRepository.findBySceneId(sceneId).stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    private DrawingResponse convertToResponse(Drawing d) {
        return DrawingResponse.builder()
                .id(d.getId())
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
                .text(d.getText())
                .points(d.getPoints())
                .isGMLayer(d.getIsGMLayer())
                .isVisible(d.getIsVisible())
                .build();
    }
}