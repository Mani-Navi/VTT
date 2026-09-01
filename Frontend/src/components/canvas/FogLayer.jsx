import React from "react";
import { Group, Shape, Line, Circle } from "react-konva";
import { useSceneStore } from "../../store/scene.store";
import { useCanvasStore } from "../../store/canvas.store";
import { usePermissions } from "../../hooks/usePermissions";

const drawPolygonPath = (context, points) => {
    if (!points || points.length < 4) return;
    context.moveTo(points[0], points[1]);
    for (let i = 2; i < points.length; i += 2) {
        context.lineTo(points[i], points[i + 1]);
    }
    context.closePath();
};

const drawRegularPolygon = (context, x, y, radius, sides) => {
    if (radius <= 0 || sides < 3) return;
    context.moveTo(x + radius * Math.cos(0), y + radius * Math.sin(0));
    for (let i = 1; i <= sides; i++) {
        const angle = (i * 2 * Math.PI) / sides;
        context.lineTo(x + radius * Math.cos(angle), y + radius * Math.sin(angle));
    }
    context.closePath();
};

export const FogLayer = ({ width = 2400, height = 1800, liveFog = null, polygonVertices = [] }) => {
    const currentScene = useSceneStore((state) => state.currentScene);
    const remoteLiveFog = useSceneStore((state) => state.remoteLiveFog);
    const isFogRevealedGlobally = useCanvasStore((state) => state.isFogRevealedGlobally);
    const { isGM } = usePermissions();

    if (!currentScene) {
        return null;
    }

    // اگر آشکارساز سراسری فعال شده باشد، مه موقتاً رندر نمی‌شود
    if (isFogRevealedGlobally) {
        return null;
    }

    const fogShapes = currentScene.fogShapes || currentScene.fogRegions || [];
    const isFilledByDefault = currentScene.fogFilled === true;
    const activeLiveFog = liveFog || remoteLiveFog;

    // اگر کل صفحه پر نیست و شکلی هم وجود ندارد، رندر نشود
    if (!isFilledByDefault && fogShapes.length === 0 && !activeLiveFog) {
        return null;
    }

    const fogOpacity = isGM ? 0.45 : 1.0;
    const fogColor = currentScene.fogColor || "#090a0f";

    const renderSingleShape = (context, fog) => {
        const shapeType = fog.type || (fog.radius ? "circle" : "rect");
        if (shapeType === "circle") {
            const rad = Math.max(5, fog.radius || 60);
            context.arc(fog.x, fog.y, rad, 0, Math.PI * 2, false);
        } else if (shapeType === "rect") {
            const w = fog.width || 100;
            const h = fog.height || 100;
            context.rect(fog.x, fog.y, w, h);
        } else if (shapeType === "triangle") {
            drawRegularPolygon(context, fog.x, fog.y, fog.radius || 60, 3);
        } else if (shapeType === "hexagon") {
            drawRegularPolygon(context, fog.x, fog.y, fog.radius || 60, 6);
        } else if ((shapeType === "polygon" || shapeType === "freehand" || shapeType === "slice") && fog.points) {
            drawPolygonPath(context, fog.points);
        }
    };

    return (
        <Group listening={false} id="fog-main-layer">
            <Shape
                opacity={fogOpacity}
                sceneFunc={(context, shape) => {
                    context.save();

                    if (isFilledByDefault) {
                        context.globalCompositeOperation = "source-over";
                        context.fillStyle = fogColor;
                        context.beginPath();
                        context.rect(0, 0, width, height);
                        context.fill();
                    }

                    fogShapes.forEach((fog) => {
                        const isCut =
                            fog.isCover === false ||
                            String(fog.type).toUpperCase() === "REVEAL" ||
                            fog.mode === "reveal" ||
                            fog.mode === "slice";

                        context.beginPath();
                        renderSingleShape(context, fog);

                        if (isCut) {
                            context.globalCompositeOperation = "destination-out";
                            context.fillStyle = "rgba(0,0,0,1)";
                        } else {
                            context.globalCompositeOperation = "source-over";
                            context.fillStyle = fogColor;
                        }

                        context.fill();
                    });

                    if (activeLiveFog) {
                        const isCutLive =
                            activeLiveFog.isCover === false ||
                            activeLiveFog.mode === "reveal" ||
                            activeLiveFog.mode === "slice";

                        context.beginPath();
                        renderSingleShape(context, activeLiveFog);

                        if (isCutLive) {
                            context.globalCompositeOperation = "destination-out";
                            context.fillStyle = "rgba(0,0,0,1)";
                        } else {
                            context.globalCompositeOperation = "source-over";
                            context.fillStyle = fogColor;
                        }

                        context.fill();
                    }

                    context.restore();
                }}
            />

            {polygonVertices && polygonVertices.length >= 2 && (
                <Group id="fog-polygon-guidelines">
                    <Line
                        points={polygonVertices}
                        stroke="#f59e0b"
                        strokeWidth={2}
                        dash={[8, 5]}
                        opacity={0.9}
                        lineCap="round"
                        lineJoin="round"
                    />

                    {Array.from({ length: polygonVertices.length / 2 }).map((_, idx) => {
                        const x = polygonVertices[idx * 2];
                        const y = polygonVertices[idx * 2 + 1];
                        const isStart = idx === 0;
                        return (
                            <Circle
                                key={`fog-node-${idx}`}
                                x={x}
                                y={y}
                                radius={isStart ? 6 : 4}
                                fill={isStart ? "#10b981" : "#f59e0b"}
                                stroke="#090a0f"
                                strokeWidth={1.5}
                                shadowColor="#f59e0b"
                                shadowBlur={isStart ? 8 : 4}
                            />
                        );
                    })}
                </Group>
            )}
        </Group>
    );
};