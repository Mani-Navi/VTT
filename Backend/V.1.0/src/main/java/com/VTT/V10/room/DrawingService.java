package com.VTT.V10.room;

import com.VTT.V10.room.dto.DrawingResponse;
import com.VTT.V10.websocket.dto.DrawingEvent;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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
        Scene scene = sceneRepository.findById(sceneId)
                .orElseThrow(() -> new RuntimeException("سکانس یافت نشد"));

        Drawing drawing = Drawing.builder()
                .scene(scene)
                .tool(event.getTool())
                .color(event.getColor())
                .lineWidth(event.getLineWidth())
                .points(event.getPoints())
                .isVisible(true)
                .build();

        drawingRepository.save(drawing);
    }

    public List<DrawingResponse> getByScene(UUID sceneId) {
        return drawingRepository.findBySceneId(sceneId).stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    private DrawingResponse convertToResponse(Drawing drawing) {
        return DrawingResponse.builder()
                .id(drawing.getId())
                .tool(drawing.getTool())
                .color(drawing.getColor())
                .lineWidth(drawing.getLineWidth())
                .fill(drawing.getFill())
                .points(drawing.getPoints())
                .isVisible(drawing.getIsVisible())
                .build();
    }
}