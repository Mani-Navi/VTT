import React from "react";
import { Group, Line, Circle, Rect, Text } from "react-konva";
import { useCanvasStore } from "../../store/canvas.store";
import { useSceneStore } from "../../store/scene.store";
import { calculateTotalDistance } from "../../utils/measurement";

export const RulerLayer = () => {
    const isMeasuring = useCanvasStore((state) => state.isMeasuring);
    const measureStart = useCanvasStore((state) => state.measureStart);
    const measureCurrent = useCanvasStore((state) => state.measureCurrent);
    const measureWaypoints = useCanvasStore((state) => state.measureWaypoints) || [];
    const rulerType = useCanvasStore((state) => state.rulerType);
    const rulerUnit = useCanvasStore((state) => state.rulerUnit);

    const currentScene = useSceneStore((state) => state.currentScene);

    if (!isMeasuring || !measureStart || !measureCurrent) {
        return null;
    }

    const gridSize = currentScene?.grid?.size || 50;
    const scaleValue = currentScene?.grid?.scaleValue || 5;

    const result = calculateTotalDistance(
        measureStart,
        measureCurrent,
        measureWaypoints,
        gridSize,
        scaleValue,
        rulerUnit,
        rulerType
    );

    const allPoints = [measureStart.x, measureStart.y];
    measureWaypoints.forEach((wp) => {
        allPoints.push(wp.x, wp.y);
    });
    allPoints.push(measureCurrent.x, measureCurrent.y);

    const bubbleX = measureCurrent.x + 15;
    const bubbleY = measureCurrent.y - 25;

    return (
        <Group listening={false}>
            <Line
                points={allPoints}
                stroke="#f59e0b"
                strokeWidth={6}
                opacity={0.3}
                lineCap="round"
                lineJoin="round"
            />
            <Line
                points={allPoints}
                stroke="#fbbf24"
                strokeWidth={3}
                dash={[8, 4]}
                lineCap="round"
                lineJoin="round"
            />

            <Circle
                x={measureStart.x}
                y={measureStart.y}
                radius={7}
                fill="#f59e0b"
                stroke="#18181b"
                strokeWidth={2}
            />

            {measureWaypoints.map((wp, i) => (
                <Circle
                    key={i}
                    x={wp.x}
                    y={wp.y}
                    radius={5}
                    fill="#3b82f6"
                    stroke="#18181b"
                    strokeWidth={1.5}
                />
            ))}

            <Circle
                x={measureCurrent.x}
                y={measureCurrent.y}
                radius={7}
                fill="#10b981"
                stroke="#18181b"
                strokeWidth={2}
            />

            {/* حباب نمایش مسافت */}
            <Group x={bubbleX} y={bubbleY}>
                <Rect
                    width={130}
                    height={32}
                    fill="rgba(9, 9, 11, 0.95)"
                    cornerRadius={6}
                    stroke="#f59e0b"
                    strokeWidth={1.5}
                    shadowColor="#000000"
                    shadowBlur={8}
                />
                <Text
                    x={8}
                    y={6}
                    text={result.formattedText}
                    fontSize={13}
                    fontStyle="bold"
                    fill="#fbbf24"
                />
                <Text
                    x={8}
                    y={19}
                    text={`${result.gridUnits} خانه`}
                    fontSize={9}
                    fill="#a1a1aa"
                />
            </Group>
        </Group>
    );
};