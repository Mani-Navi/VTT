import React, { useRef, useEffect, useCallback, memo } from "react";
import { Group, Shape, Line, Circle as KonvaCircle, Rect as KonvaRect, Transformer } from "react-konva";
import { useSceneStore } from "../../store/scene.store";
import { useCanvasStore } from "../../store/canvas.store";
import { usePermissions } from "../../hooks/usePermissions";
import { TOOLS } from "../../constants/tools";
import { wsService } from "../../services/websocket.service";
import { WS_EVENTS } from "../../constants/wsEvents.js";

const FOG_DASH_PATTERN = Object.freeze([8, 5]);
const TRANSFORMER_DASH_PATTERN = Object.freeze([5, 4]);
const TRANSFORMER_ANCHORS = Object.freeze([
    "top-left",
    "top-right",
    "bottom-left",
    "bottom-right",
    "middle-left",
    "middle-right",
    "top-center",
    "bottom-center",
]);

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

const getRegularPolygonPoints = (radius, sides) => {
    const points = [];
    for (let i = 0; i < sides; i++) {
        const angle = (i * 2 * Math.PI) / sides;
        points.push(radius * Math.cos(angle), radius * Math.sin(angle));
    }
    return points;
};

export const FogLayer = memo(
    ({ width = 2400, height = 1800, liveFog = null, polygonVertices = [] }) => {
        const currentScene = useSceneStore((state) => state.currentScene);
        const remoteLiveFog = useSceneStore((state) => state.remoteLiveFog);
        const updateFogShape = useSceneStore((state) => state.updateFogShape);

        const activeTool = useCanvasStore((state) => state.activeTool);
        const selectedFogId = useCanvasStore((state) => state.selectedFogId);
        const setSelectedFogId = useCanvasStore((state) => state.setSelectedFogId);
        const isFogRevealedGlobally = useCanvasStore((state) => state.isFogRevealedGlobally);
        const gmFogBlend = useCanvasStore((state) => state.gmFogBlend) ?? 0.45;

        const { isGM } = usePermissions();

        const transformerRef = useRef(null);
        const shapeRefs = useRef(new Map());
        const lastBroadcastTime = useRef(0);
        const draggingFogId = useRef(null);

        const isSelectMode = activeTool === TOOLS.SELECT && isGM;

        useEffect(() => {
            if (!transformerRef.current) return;
            if (selectedFogId && shapeRefs.current.has(selectedFogId)) {
                const node = shapeRefs.current.get(selectedFogId);
                transformerRef.current.nodes([node]);
                transformerRef.current.getLayer()?.batchDraw();
            } else {
                transformerRef.current.nodes([]);
                transformerRef.current.getLayer()?.batchDraw();
            }
        }, [selectedFogId, isSelectMode]);

        if (!currentScene || isFogRevealedGlobally) {
            return null;
        }

        const fogShapes = currentScene.fogShapes || currentScene.fogRegions || [];
        const isFilledByDefault = currentScene.fogFilled === true;
        const activeLiveFog = liveFog || remoteLiveFog;

        if (!isFilledByDefault && fogShapes.length === 0 && !activeLiveFog) {
            return null;
        }

        const fogOpacity = isGM ? Math.max(0.05, Math.min(1.0, gmFogBlend)) : 1.0;
        const fogColor = currentScene.fogColor || "#090a0f";

        const renderSingleShape = (context, fog) => {
            const shapeType = fog.type || (fog.radius ? "circle" : "rect");
            if (shapeType === "circle") {
                const rad = Math.max(5, fog.radius || 60);
                context.arc(fog.x || 0, fog.y || 0, rad, 0, Math.PI * 2, false);
            } else if (shapeType === "rect") {
                const w = fog.width || 100;
                const h = fog.height || 100;
                context.rect(fog.x || 0, fog.y || 0, w, h);
            } else if (shapeType === "triangle") {
                drawRegularPolygon(context, fog.x || 0, fog.y || 0, fog.radius || 60, 3);
            } else if (shapeType === "hexagon") {
                drawRegularPolygon(context, fog.x || 0, fog.y || 0, fog.radius || 60, 6);
            } else if (
                (shapeType === "polygon" || shapeType === "freehand" || shapeType === "slice") &&
                fog.points
            ) {
                drawPolygonPath(context, fog.points);
            }
        };

        const handleShapeDragStart = useCallback((fog) => {
            draggingFogId.current = String(fog.id);
        }, []);

        const handleShapeDragMove = useCallback(
            (e, fog) => {
                const node = e.target;
                const newX = Math.round(node.x());
                const newY = Math.round(node.y());

                const now = Date.now();
                if (now - lastBroadcastTime.current > 50) {
                    lastBroadcastTime.current = now;
                    wsService.send("FOG_LIVE", {
                        ...fog,
                        x: newX,
                        y: newY,
                        sceneId: currentScene.id,
                    });
                }
            },
            [currentScene?.id]
        );

        const handleShapeDragEnd = useCallback(
            (e, fog) => {
                draggingFogId.current = null;
                const node = e.target;
                const newX = Math.round(node.x());
                const newY = Math.round(node.y());

                const finalFog = {
                    ...fog,
                    id: String(fog.id),
                    x: newX,
                    y: newY,
                };

                updateFogShape(fog.id, { x: newX, y: newY });

                wsService.send(WS_EVENTS.FOG_UPDATED || "FOG_UPDATE", {
                    ...finalFog,
                    id: String(fog.id),
                    sceneId: currentScene.id,
                    type: finalFog.isCover ? "HIDE" : "REVEAL",
                    points: finalFog,
                });

                wsService.send("FOG_LIVE_END", { sceneId: currentScene.id });
            },
            [updateFogShape, currentScene?.id]
        );

        const handleShapeTransformEnd = useCallback(
            (e, fog) => {
                const node = e.target;
                const scaleX = node.scaleX();
                const scaleY = node.scaleY();

                node.scaleX(1);
                node.scaleY(1);

                let finalFog = {
                    ...fog,
                    id: String(fog.id),
                    x: Math.round(node.x()),
                    y: Math.round(node.y()),
                };

                if (fog.type === "rect") {
                    finalFog.width = Math.round(Math.max(20, (fog.width || 100) * scaleX));
                    finalFog.height = Math.round(Math.max(20, (fog.height || 100) * scaleY));
                } else if (fog.type === "circle" || fog.type === "triangle" || fog.type === "hexagon") {
                    finalFog.radius = Math.round(
                        Math.max(10, (fog.radius || 60) * Math.max(Math.abs(scaleX), Math.abs(scaleY)))
                    );
                }

                updateFogShape(fog.id, finalFog);

                wsService.send(WS_EVENTS.FOG_UPDATED || "FOG_UPDATE", {
                    ...finalFog,
                    id: String(fog.id),
                    sceneId: currentScene.id,
                    type: finalFog.isCover ? "HIDE" : "REVEAL",
                    points: finalFog,
                });

                wsService.send("FOG_LIVE_END", { sceneId: currentScene.id });
            },
            [updateFogShape, currentScene?.id]
        );

        return (
            <Group id="fog-main-layer">
                <Shape
                    listening={false}
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

                        if (activeLiveFog && !draggingFogId.current) {
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

                {isSelectMode && (
                    <Group id="fog-interactive-nodes">
                        {fogShapes.map((fog) => {
                            const shapeType = fog.type || (fog.radius ? "circle" : "rect");
                            const fogIdStr = String(fog.id);

                            const commonProps = {
                                key: `fog-node-${fogIdStr}`,
                                ref: (el) => {
                                    if (el) shapeRefs.current.set(fogIdStr, el);
                                    else shapeRefs.current.delete(fogIdStr);
                                },
                                x: fog.x || 0,
                                y: fog.y || 0,
                                draggable: isSelectMode,
                                fill: "rgba(0,0,0,0.001)",
                                stroke: "transparent",
                                hitStrokeWidth: 20,
                                onClick: (e) => {
                                    e.cancelBubble = true;
                                    setSelectedFogId(fogIdStr);
                                },
                                onDragStart: () => handleShapeDragStart(fog),
                                onDragMove: (e) => handleShapeDragMove(e, fog),
                                onDragEnd: (e) => handleShapeDragEnd(e, fog),
                                onTransformEnd: (e) => handleShapeTransformEnd(e, fog),
                            };

                            if (shapeType === "circle") {
                                return <KonvaCircle {...commonProps} radius={fog.radius || 60} />;
                            } else if (shapeType === "rect") {
                                return (
                                    <KonvaRect
                                        {...commonProps}
                                        width={fog.width || 100}
                                        height={fog.height || 100}
                                    />
                                );
                            } else if (shapeType === "triangle") {
                                return (
                                    <Line
                                        {...commonProps}
                                        points={getRegularPolygonPoints(fog.radius || 60, 3)}
                                        closed={true}
                                    />
                                );
                            } else if (shapeType === "hexagon") {
                                return (
                                    <Line
                                        {...commonProps}
                                        points={getRegularPolygonPoints(fog.radius || 60, 6)}
                                        closed={true}
                                    />
                                );
                            } else if (fog.points && fog.points.length >= 4) {
                                return <Line {...commonProps} points={fog.points} closed={true} />;
                            }

                            return null;
                        })}

                        <Transformer
                            ref={transformerRef}
                            borderStroke="#f59e0b"
                            borderStrokeWidth={1.5}
                            borderDash={TRANSFORMER_DASH_PATTERN}
                            anchorFill="#f59e0b"
                            anchorStroke="#090a0f"
                            anchorStrokeWidth={1.5}
                            anchorSize={9}
                            anchorCornerRadius={2}
                            rotateAnchorOffset={24}
                            rotateEnabled={true}
                            boundBoxFunc={(oldBox, newBox) => {
                                if (newBox.width < 20 || newBox.height < 20) return oldBox;
                                return newBox;
                            }}
                            enabledAnchors={TRANSFORMER_ANCHORS}
                        />
                    </Group>
                )}

                {polygonVertices && polygonVertices.length >= 2 && (
                    <Group id="fog-polygon-guidelines" listening={false}>
                        <Line
                            points={polygonVertices}
                            stroke="#f59e0b"
                            strokeWidth={2}
                            dash={FOG_DASH_PATTERN}
                            opacity={0.9}
                            lineCap="round"
                            lineJoin="round"
                        />

                        {Array.from({ length: polygonVertices.length / 2 }).map((_, idx) => {
                            const x = polygonVertices[idx * 2];
                            const y = polygonVertices[idx * 2 + 1];
                            const isStart = idx === 0;
                            return (
                                <KonvaCircle
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
    }
);

FogLayer.displayName = "FogLayer";