import React from "react";
import { Group, Circle, Text, Line } from "react-konva";
import { useSceneStore } from "../../store/scene.store";
import { useCanvasStore } from "../../store/canvas.store";

export const PingLayer: React.FC = () => {
  const pings = useSceneStore((state) => state.pings);
  const isLaserActive = useCanvasStore((state) => state.isLaserActive);
  const laserPosition = useCanvasStore((state) => state.laserPosition);

  return (
    <Group listening={false}>
      {/* Pings */}
      {pings.map((ping) => (
        <Group key={ping.id} x={ping.x} y={ping.y}>
          {/* Animated radar rings */}
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

          {/* User Name Tag */}
          <Text
            text={ping.userName}
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

      {/* Laser Pointer */}
      {isLaserActive && laserPosition && (
        <Group x={laserPosition.x} y={laserPosition.y}>
          <Circle
            radius={18}
            fill="rgba(239, 68, 68, 0.25)"
            stroke="#ef4444"
            strokeWidth={2}
          />
          <Circle
            radius={6}
            fill="#ef4444"
            shadowColor="#ef4444"
            shadowBlur={15}
          />
          <Line
            points={[-12, 0, 12, 0]}
            stroke="#ffffff"
            strokeWidth={2}
          />
          <Line
            points={[0, -12, 0, 12]}
            stroke="#ffffff"
            strokeWidth={2}
          />
        </Group>
      )}
    </Group>
  );
};
