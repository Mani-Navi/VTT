import React, { useMemo, memo } from "react";
import { Line, Shape, Group, Circle } from "react-konva";
import { GRID_TYPES } from "../../constants/tools";
import { getHexPoints } from "../../utils/grid";

const DOTTED_DASH_PATTERN = Object.freeze([4, 4]);

export const GridLayer = memo(({ grid, width, height }) => {
    if (
        !grid ||
        !grid.enabled ||
        grid.type === GRID_TYPES.NONE ||
        grid.type === "none" ||
        (grid.size || 50) <= 5
    ) {
        return null;
    }

    const {
        type = "square",
        size = 50,
        color = "#000000",
        opacity = 0.3,
        lineType = "solid",
        lineWidth = 1,
    } = grid;

    const dashPattern = useMemo(() => {
        if (lineType === "dotted") return DOTTED_DASH_PATTERN;
        return undefined;
    }, [lineType]);

    // مموایز کردن نقاط تقاطع برای سبک نقطه‌ای (Dots)
    const dots = useMemo(() => {
        if (lineType !== "dots" || (type !== "square" && type !== GRID_TYPES.SQUARE)) {
            return [];
        }
        const result = [];
        for (let x = 0; x <= width; x += size) {
            for (let y = 0; y <= height; y += size) {
                result.push({ x, y, key: `dot-${x}-${y}` });
            }
        }
        return result;
    }, [width, height, size, lineType, type]);

    // مموایز کردن مختصات خطوط عمودی و افقی گرید مربعی
    const lines = useMemo(() => {
        if (lineType === "dots" || (type !== "square" && type !== GRID_TYPES.SQUARE)) {
            return [];
        }
        const result = [];
        for (let x = 0; x <= width; x += size) {
            result.push({ points: [x, 0, x, height], key: `v-${x}` });
        }
        for (let y = 0; y <= height; y += size) {
            result.push({ points: [0, y, width, y], key: `h-${y}` });
        }
        return result;
    }, [width, height, size, lineType, type]);

    // ۱. رندر گرید مربعی
    if (type === "square" || type === GRID_TYPES.SQUARE) {
        if (lineType === "dots") {
            return (
                <Group listening={false} opacity={opacity}>
                    {dots.map((d) => (
                        <Circle
                            key={d.key}
                            x={d.x}
                            y={d.y}
                            radius={lineWidth * 1.5}
                            fill={color}
                            listening={false}
                        />
                    ))}
                </Group>
            );
        }

        return (
            <Group listening={false} opacity={opacity}>
                {lines.map((line) => (
                    <Line
                        key={line.key}
                        points={line.points}
                        stroke={color}
                        strokeWidth={lineWidth}
                        dash={dashPattern}
                        listening={false}
                    />
                ))}
            </Group>
        );
    }

    // ۲. رندر گرید ایزومتریک / لوزی
    if (type === "isometric" || type === "diamond" || type === GRID_TYPES.DIMETRIC) {
        return (
            <Shape
                listening={false}
                opacity={opacity}
                stroke={color}
                strokeWidth={lineWidth}
                dash={dashPattern}
                sceneFunc={(context, shape) => {
                    context.beginPath();
                    const step = size;
                    for (let d = -height; d <= width; d += step) {
                        context.moveTo(d, 0);
                        context.lineTo(d + height, height);
                        context.moveTo(d + height, 0);
                        context.lineTo(d, height);
                    }
                    context.fillStrokeShape(shape);
                }}
            />
        );
    }

    // ۳. رندر گرید شش‌ضلعی (Hexagonal H & V)
    if (
        type === "hex_h" ||
        type === "hex_v" ||
        type === GRID_TYPES.HEX_H ||
        type === GRID_TYPES.HEX_V
    ) {
        const isHorizontal = type === "hex_h" || type === GRID_TYPES.HEX_H;
        const radius = size / 2;
        const hexPoints = getHexPoints(radius, isHorizontal);

        return (
            <Shape
                listening={false}
                opacity={opacity}
                stroke={color}
                strokeWidth={lineWidth}
                dash={dashPattern}
                sceneFunc={(context, shape) => {
                    context.beginPath();
                    const colStep = isHorizontal ? size * 0.75 : size * 0.866;
                    const rowStep = isHorizontal ? size * 0.866 : size * 0.75;

                    for (let x = radius; x < width + radius; x += colStep) {
                        const colIndex = Math.floor(x / colStep);
                        const yOffset = (colIndex % 2) * (rowStep / 2);

                        for (let y = radius + yOffset; y < height + radius; y += rowStep) {
                            context.save();
                            context.translate(x, y);
                            context.moveTo(hexPoints[0], hexPoints[1]);
                            for (let i = 2; i < hexPoints.length; i += 2) {
                                context.lineTo(hexPoints[i], hexPoints[i + 1]);
                            }
                            context.closePath();
                            context.restore();
                        }
                    }

                    context.fillStrokeShape(shape);
                }}
            />
        );
    }

    return null;
});

GridLayer.displayName = "GridLayer";