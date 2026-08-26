import React from "react";
import { Group, Shape } from "react-konva";
import { useSceneStore } from "../../store/scene.store";
import { usePermissions } from "../../hooks/usePermissions";

export const FogLayer = ({ width = 2400, height = 1800 }) => {
    const currentScene = useSceneStore((state) => state.currentScene);
    const { isGM } = usePermissions();

    // مه جنگ فقط در صورتی رندر می‌شود که صریحاً فعال شده باشد
    if (!currentScene || !currentScene.fogEnabled) {
        return null;
    }

    const fogShapes = currentScene.fogShapes || [];
    const isFilledByDefault = currentScene.fogFilled === true;

    if (!isFilledByDefault && fogShapes.length === 0) {
        return null;
    }

    const fogOpacity = isGM ? 0.45 : 1.0;
    const fogColor = currentScene.fogColor || "#090a0f";

    return (
        <Group listening={false} id="fog-main-layer">
            <Shape
                opacity={fogOpacity}
                fill={fogColor}
                sceneFunc={(context, shape) => {
                    context.beginPath();

                    if (isFilledByDefault) {
                        // ۱. پوشاندن کل صفحه
                        context.rect(0, 0, width, height);

                        // ۲. برش دادن بخش‌های آشکارشده (Reveal)
                        fogShapes.forEach((fog) => {
                            if (!fog.isCover) {
                                if (fog.type === "circle" || (!fog.type && fog.radius)) {
                                    context.moveTo(fog.x + (fog.radius || 60), fog.y);
                                    context.arc(fog.x, fog.y, fog.radius || 60, 0, Math.PI * 2, true);
                                } else if (fog.type === "rect") {
                                    const w = fog.width || 120;
                                    const h = fog.height || 120;
                                    context.rect(fog.x + w, fog.y, -w, h);
                                } else if (fog.type === "freehand" && fog.points && fog.points.length >= 4) {
                                    context.moveTo(fog.points[0], fog.points[1]);
                                    for (let i = 2; i < fog.points.length; i += 2) {
                                        context.lineTo(fog.points[i], fog.points[i + 1]);
                                    }
                                    context.closePath();
                                }
                            }
                        });
                    }

                    context.fillStrokeShape(shape);

                    // ۳. اضافه کردن بخش‌های مجدداً پوشانده شده (Hide / Cover)
                    fogShapes.forEach((fog) => {
                        if (fog.isCover) {
                            context.beginPath();
                            if (fog.type === "circle") {
                                context.arc(fog.x, fog.y, fog.radius || 60, 0, Math.PI * 2, false);
                            } else if (fog.type === "rect") {
                                context.rect(fog.x, fog.y, fog.width || 120, fog.height || 120);
                            } else if (fog.type === "freehand" && fog.points && fog.points.length >= 4) {
                                context.moveTo(fog.points[0], fog.points[1]);
                                for (let i = 2; i < fog.points.length; i += 2) {
                                    context.lineTo(fog.points[i], fog.points[i + 1]);
                                }
                                context.closePath();
                            }
                            context.fillStyle = fogColor;
                            context.fill();
                        }
                    });
                }}
            />
        </Group>
    );
};