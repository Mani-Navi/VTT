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

const drawPolygonPath = (context, points, offsetX = 0, offsetY = 0) => {
    if (!points || points.length < 4) return;
    context.moveTo(points[0] + offsetX, points[1] + offsetY);
    for (let i = 2; i < points.length; i += 2) {
        context.lineTo(points[i] + offsetX, points[i + 1] + offsetY);
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

        const isSelectMode = (activeTool === TOOLS.SELECT || activeTool === TOOLS.FOG) && isGM;

        // مدیریت ایمن Transformer برای جلوگیری از کرش هنگام فعال شدن آشکارساز
        useEffect(() => {
            const tr = transformerRef.current;
            if (!tr) return;

            // اگر آشکارساز فعال است یا در حالت انتخاب نیستیم، نودها سریعاً جدا شوند
            if (isFogRevealedGlobally || !isSelectMode) {
                try {
                    tr.nodes([]);
                    tr.getLayer()?.batchDraw();
                } catch (e) {}
                return;
            }

            if (selectedFogId && shapeRefs.current.has(selectedFogId)) {
                const node = shapeRefs.current.get(selectedFogId);
                if (node && node.getStage()) {
                    try {
                        tr.nodes([node]);
                        tr.getLayer()?.batchDraw();
                    } catch (e) {}
                } else {
                    try {
                        tr.nodes([]);
                    } catch (e) {}
                }
            } else {
                try {
                    tr.nodes([]);
                    tr.getLayer()?.batchDraw();
                } catch (e) {}
            }

            return () => {
                try {
                    if (tr && tr.getStage()) {
                        tr.nodes([]);
                    }
                } catch (e) {}
            };
        }, [selectedFogId, isSelectMode, isFogRevealedGlobally]);

        if (!currentScene) {
            return null;
        }

        const fogShapes = currentScene.fogShapes || currentScene.fogRegions || [];
        const isFilledByDefault = currentScene.fogFilled === true;
        const activeLiveFog = liveFog || remoteLiveFog;

        const hasContent = isFilledByDefault || fogShapes.length > 0 || Boolean(activeLiveFog);
        // به جای بازگرداندن null، وضعیت نمایان بودن لایه با visible در کانواس کنترل می‌شود
        const isLayerVisible = !isFogRevealedGlobally && hasContent;

        const fogOpacity = isGM ? Math.max(0.05, Math.min(1.0, gmFogBlend)) : 1.0;
        const fogColor = currentScene.fogColor || "#090a0f";
        const mapW = currentScene.mapWidth || width;
        const mapH = currentScene.mapHeight || height;

        const renderSingleShape = (context, fog) => {
            if (!fog) return;
            const shapeType = String(fog.type || (fog.radius ? "circle" : "rect")).toLowerCase();
            const offsetX = fog.x || 0;
            const offsetY = fog.y || 0;

            if (shapeType === "circle") {
                const rad = Math.max(5, fog.radius || 60);
                context.arc(offsetX, offsetY, rad, 0, Math.PI * 2, false);
            } else if (shapeType === "rect") {
                const w = fog.width || 100;
                const h = fog.height || 100;
                context.rect(offsetX, offsetY, w, h);
            } else if (shapeType === "triangle") {
                drawRegularPolygon(context, offsetX, offsetY, fog.radius || 60, 3);
            } else if (shapeType === "hexagon") {
                drawRegularPolygon(context, offsetX, offsetY, fog.radius || 60, 6);
            } else if (
                (shapeType === "polygon" || shapeType === "freehand" || shapeType === "slice") &&
                fog.points
            ) {
                drawPolygonPath(context, fog.points, offsetX, offsetY);
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

                const shapeType = String(fog.type || "").toLowerCase();

                if (shapeType === "rect") {
                    finalFog.width = Math.round(Math.max(20, (fog.width || 100) * scaleX));
                    finalFog.height = Math.round(Math.max(20, (fog.height || 100) * scaleY));
                } else if (shapeType === "circle" || shapeType === "triangle" || shapeType === "hexagon") {
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
            <Group id="fog-main-layer" visible={isLayerVisible} listening={isLayerVisible}>
                <Shape
                    listening={false}
                    opacity={fogOpacity}
                    sceneFunc={(context) => {
                        if (!isLayerVisible) return;
                        context.save();

                        if (isFilledByDefault) {
                            context.globalCompositeOperation = "source-over";
                            context.fillStyle = fogColor;
                            context.beginPath();
                            context.rect(0, 0, mapW, mapH);
                            context.fill();
                        }

                        fogShapes.forEach((fog) => {
                            if (!fog) return;
                            const isCut =
                                fog.isCover === false ||
                                String(fog.type).toUpperCase() === "REVEAL" ||
                                fog.mode === "reveal" ||
                                fog.mode === "slice";

                            const isOverlay = fog.mode === "overlay";

                            context.beginPath();
                            renderSingleShape(context, fog);

                            if (isCut) {
                                context.globalCompositeOperation = "destination-out";
                                context.fillStyle = "rgba(0,0,0,1)";
                            } else if (isOverlay) {
                                context.globalCompositeOperation = "source-over";
                                context.fillStyle = "rgba(15, 23, 42, 0.45)";
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

                {isSelectMode && isLayerVisible && (
                    <Group id="fog-interactive-nodes">
                        {fogShapes.map((fog) => {
                            if (!fog) return null;
                            const shapeType = String(fog.type || (fog.radius ? "circle" : "rect")).toLowerCase();
                            const fogIdStr = String(fog.id);
                            const isSelected = selectedFogId === fogIdStr;

                            const commonProps = {
                                key: `fog-node-${fogIdStr}`,
                                ref: (el) => {
                                    if (el) shapeRefs.current.set(fogIdStr, el);
                                    else shapeRefs.current.delete(fogIdStr);
                                },
                                x: fog.x || 0,
                                y: fog.y || 0,
                                draggable: isSelectMode,
                                fill: isSelected ? "rgba(245, 158, 11, 0.12)" : "rgba(255, 255, 255, 0.02)",
                                stroke: isSelected ? "#f59e0b" : "rgba(245, 158, 11, 0.4)",
                                strokeWidth: isSelected ? 2 : 1,
                                dash: isSelected ? [4, 4] : undefined,
                                hitStrokeWidth: 25,
                                onClick: (e) => {
                                    e.cancelBubble = true;
                                    setSelectedFogId(fogIdStr);
                                },
                                onTap: (e) => {
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
                                return (
                                    <Line
                                        {...commonProps}
                                        points={fog.points}
                                        closed={true}
                                        fillEnabled={true}
                                    />
                                );
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

                {polygonVertices && polygonVertices.length >= 2 && isLayerVisible && (
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