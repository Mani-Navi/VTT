import React, { useEffect } from "react";
import { Group, Circle, Text, Rect } from "react-konva";
import { useSceneStore } from "../../store/scene.store";
import { useCanvasStore } from "../../store/canvas.store";
import { useAuthStore } from "../../store/auth.store";
import { TOOLS } from "../../constants/tools";

export const PingLayer = () => {
  const pings = useSceneStore((state) => state.pings) || [];
  const activeTool = useCanvasStore((state) => state.activeTool);
  const laserPosition = useCanvasStore((state) => state.laserPosition);
  const remoteLasers = useCanvasStore((state) => state.remoteLasers) || {};
  const clearRemoteLaser = useCanvasStore((state) => state.clearRemoteLaser);

  const currentUser = useAuthStore((state) => state.user);
  const currentUserId = String(currentUser?.id || currentUser?.userId || "");

  const isLocalLaserActive = activeTool === TOOLS.LASER && Boolean(laserPosition);

  // پاکسازی خودکار لیزرهای غیرفعال بعد از ۳ ثانیه
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      Object.values(remoteLasers).forEach((laser) => {
        if (now - (laser.timestamp || 0) > 3000) {
          clearRemoteLaser(laser.userId);
        }
      });
    }, 1500);
    return () => clearInterval(interval);
  }, [remoteLasers, clearRemoteLaser]);

  const renderLaserDot = (x, y, name = "", color = "#ef4444", isLocal = false) => {
    return (
        <Group key={isLocal ? "local-laser" : `laser-${name}-${x}-${y}`} x={x} y={y} listening={false}>
          {/* هاله نئونی بیرونی */}
          <Circle
              radius={16}
              fill="rgba(239, 68, 68, 0.2)"
              stroke="#ef4444"
              strokeWidth={1.5}
          />
          {/* نقطه مرکزی درخشان */}
          <Circle
              radius={6}
              fill="#ef4444"
              shadowColor="#ef4444"
              shadowBlur={15}
              shadowOpacity={1}
          />
          {/* نقطه روشن سفید در مرکز */}
          <Circle radius={2.5} fill="#ffffff" />

          {/* تگ نام بازیکن */}
          {name && (
              <Group y={-24}>
                <Rect
                    x={-Math.max(name.length * 4 + 10, 24)}
                    y={0}
                    width={Math.max(name.length * 8 + 20, 48)}
                    height={16}
                    fill="rgba(9, 10, 15, 0.9)"
                    cornerRadius={4}
                    stroke="#ef4444"
                    strokeWidth={1}
                />
                <Text
                    text={name}
                    x={-Math.max(name.length * 4 + 10, 24)}
                    y={2}
                    width={Math.max(name.length * 8 + 20, 48)}
                    align="center"
                    fontSize={10}
                    fontStyle="bold"
                    fontFamily="Vazirmatn"
                    fill="#fecaca"
                />
              </Group>
          )}
        </Group>
    );
  };

  return (
      <Group listening={false}>
        {/* رادار پینگ‌ها */}
        {pings.map((ping) => (
            <Group key={ping.id} x={ping.x} y={ping.y}>
              <Circle
                  radius={25}
                  stroke={ping.userColor || "#f59e0b"}
                  strokeWidth={3}
                  opacity={0.8}
              />
              <Circle
                  radius={45}
                  stroke={ping.userColor || "#f59e0b"}
                  strokeWidth={2}
                  opacity={0.4}
                  dash={[4, 4]}
              />
              <Circle
                  radius={8}
                  fill={ping.userColor || "#f59e0b"}
                  shadowColor={ping.userColor || "#f59e0b"}
                  shadowBlur={12}
              />
              <Text
                  text={ping.userName || "بازیکن"}
                  x={-50}
                  y={12}
                  width={100}
                  align="center"
                  fontSize={11}
                  fontStyle="bold"
                  fill="#ffffff"
                  shadowColor="#000000"
                  shadowBlur={4}
              />
            </Group>
        ))}

        {/* لیزر کاربر جاری */}
        {isLocalLaserActive &&
            renderLaserDot(laserPosition.x, laserPosition.y, currentUser?.username || "شما", "#ef4444", true)}

        {/* لیزر سایر بازیکنان در اتاق */}
        {Object.values(remoteLasers).map((laser) => {
          if (String(laser.userId) === currentUserId) return null;
          return renderLaserDot(laser.x, laser.y, laser.userName || "بازیکن", laser.color || "#ef4444", false);
        })}
      </Group>
  );
};