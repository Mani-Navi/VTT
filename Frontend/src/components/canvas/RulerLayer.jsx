import React, { useEffect } from "react";
import { Group, Line, Circle, Rect, Text } from "react-konva";
import { useCanvasStore } from "../../store/canvas.store";
import { useSceneStore } from "../../store/scene.store";
import { useAuthStore } from "../../store/auth.store";
import { calculateTotalDistance } from "../../utils/measurement";

export const RulerLayer = () => {
    const measurement = useCanvasStore((state) => state.measurement);
    const remoteMeasurements = useCanvasStore((state) => state.remoteMeasurements) || {};
    const clearRemoteMeasurement = useCanvasStore((state) => state.clearRemoteMeasurement);
    const rulerType = useCanvasStore((state) => state.rulerType) || "dnd5e_5105";
    const rulerUnit = useCanvasStore((state) => state.rulerUnit) || "ft";

    const currentScene = useSceneStore((state) => state.currentScene);
    const currentUser = useAuthStore((state) => state.user);
    const currentUserId = String(currentUser?.id || currentUser?.userId || currentUser?.username || "");

    const gridSize = currentScene?.grid?.size || 60;
    const scaleValue = 5;

    // پاکسازی خودکار خط‌کش‌های رهاشده بعد از ۳ ثانیه
    useEffect(() => {
        const interval = setInterval(() => {
            const now = Date.now();
            Object.values(remoteMeasurements).forEach((m) => {
                if (now - (m.timestamp || 0) > 3500) {
                    clearRemoteMeasurement(m.userId);
                }
            });
        }, 1500);
        return () => clearInterval(interval);
    }, [remoteMeasurements, clearRemoteMeasurement]);

    const renderRulerVisual = (meas, isLocal = false, color = "#f59e0b", name = "") => {
        if (!meas || meas.startX === undefined || meas.currentX === undefined) return null;

        const start = { x: meas.startX, y: meas.startY };
        const current = { x: meas.currentX, y: meas.currentY };
        const waypoints = meas.waypoints || [];

        const result = calculateTotalDistance(
            start,
            current,
            waypoints,
            gridSize,
            scaleValue,
            rulerUnit,
            meas.rulerType || rulerType
        );

        const allPoints = [start.x, start.y];
        waypoints.forEach((wp) => {
            allPoints.push(wp.x, wp.y);
        });
        allPoints.push(current.x, current.y);

        const bubbleX = current.x + 16;
        const bubbleY = current.y - 32;

        return (
            <Group key={isLocal ? "local-ruler" : `ruler-${meas.userId || name}`} listening={false}>
                {/* هاله ضخیم پس‌زمینه خط */}
                <Line
                    points={allPoints}
                    stroke={color}
                    strokeWidth={8}
                    opacity={0.25}
                    lineCap="round"
                    lineJoin="round"
                />

                {/* خط خط‌چین اصلی */}
                <Line
                    points={allPoints}
                    stroke={color}
                    strokeWidth={3}
                    dash={[8, 5]}
                    lineCap="round"
                    lineJoin="round"
                />

                {/* نقطه شروع */}
                <Circle
                    x={start.x}
                    y={start.y}
                    radius={7}
                    fill={color}
                    stroke="#090a0f"
                    strokeWidth={2}
                />

                {/* ایستگاه‌های میانی (Waypoints) */}
                {waypoints.map((wp, i) => (
                    <Circle
                        key={`wp-${i}`}
                        x={wp.x}
                        y={wp.y}
                        radius={5.5}
                        fill="#3b82f6"
                        stroke="#090a0f"
                        strokeWidth={1.5}
                    />
                ))}

                {/* نقطه انتهایی متحرک */}
                <Circle
                    x={current.x}
                    y={current.y}
                    radius={7.5}
                    fill="#10b981"
                    stroke="#090a0f"
                    strokeWidth={2}
                />

                {/* حباب معلق نمایش مسافت و تعداد خانه‌ها */}
                <Group x={bubbleX} y={bubbleY}>
                    <Rect
                        width={120}
                        height={32}
                        fill="rgba(9, 10, 15, 0.95)"
                        cornerRadius={7}
                        stroke={color}
                        strokeWidth={1.5}
                        shadowColor="#000000"
                        shadowBlur={10}
                    />
                    <Text
                        x={8}
                        y={5}
                        text={result.formattedText}
                        fontSize={12}
                        fontStyle="bold"
                        fontFamily="Vazirmatn"
                        fill="#fbbf24"
                    />
                    <Text
                        x={8}
                        y={18}
                        text={`${result.gridUnits} خانه ${name ? `(${name})` : ""}`}
                        fontSize={9}
                        fontFamily="Vazirmatn"
                        fill="#a1a1aa"
                    />
                </Group>
            </Group>
        );
    };

    return (
        <Group listening={false}>
            {/* خط‌کش کاربر محلی */}
            {measurement && renderRulerVisual(measurement, true, "#f59e0b", "شما")}

            {/* خط‌کش‌های سایر بازیکنان به صورت زنده */}
            {Object.values(remoteMeasurements).map((meas) => {
                if (String(meas.userId).toLowerCase() === currentUserId.toLowerCase() && measurement) {
                    return null;
                }
                return renderRulerVisual(meas, false, meas.userColor || "#38bdf8", meas.userName || "بازیکن");
            })}
        </Group>
    );
};