import React, { useEffect, useState } from "react";
import { Group, Circle, Text, Rect } from "react-konva";
import { useCanvasStore } from "../../store/canvas.store";
import { useSceneStore } from "../../store/scene.store";
import { usePermissions } from "../../hooks/usePermissions";
import { wsService } from "../../services/websocket.service";
import { CONDITION_MAP } from "../../constants/conditions";

const SingleToken = ({
                       token,
                       gridSize,
                       isSelected,
                       canControl,
                       isGM,
                       onSelect,
                       onOpenEditor,
                     }) => {
  const [image, setImage] = useState(null);
  const moveToken = useSceneStore((state) => state.moveToken);
  const updateToken = useSceneStore((state) => state.updateToken);

  const tokenPixelSize = (token.size || 1) * gridSize;
  const radius = Math.max(12, tokenPixelSize / 2);

  useEffect(() => {
    if (!token.avatarUrl && !token.assetUrl) {
      setImage(null);
      return;
    }
    let isMounted = true;
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.src = token.avatarUrl || token.assetUrl;
    img.onload = () => {
      if (isMounted) setImage(img);
    };
    img.onerror = () => {
      if (isMounted) setImage(null);
    };
    return () => {
      isMounted = false;
    };
  }, [token.avatarUrl, token.assetUrl]);

  if (token.isHidden && !isGM) return null;

  const currentHp = token.hp ?? token.maxHp ?? 10;
  const maxHp = token.maxHp ?? 10;
  const hpRatio = Math.max(0, Math.min(1, currentHp / maxHp));
  const hpBarColor = hpRatio > 0.5 ? "#10b981" : hpRatio > 0.25 ? "#f59e0b" : "#ef4444";
  const barWidth = Math.max(radius * 2.2, 56);
  const barHeight = 11;
  const barY = radius + 6;

  const tokenConditions = token.conditions || [];
  const activeConditionDefs = tokenConditions.map((cId) => CONDITION_MAP?.[cId]).filter(Boolean);

  const handleQuickHpChange = (delta, e) => {
    e.cancelBubble = true;
    const newHp = Math.max(0, Math.min(maxHp, currentHp + delta));
    updateToken(token.id, { hp: newHp });
    wsService.send("TOKEN_MOVE", { tokenId: token.id, hp: newHp });
  };

  return (
      <Group
          x={token.x || 0}
          y={token.y || 0}
          draggable={canControl && !token.isLocked}
          opacity={token.isHidden ? 0.55 : 1}
          onClick={onSelect}
          onTap={onSelect}
          onDblClick={onOpenEditor}
          onDblTap={onOpenEditor}
          onDragEnd={(e) => {
            const newX = e.target.x();
            const newY = e.target.y();
            moveToken(token.id, newX, newY);
            wsService.send("TOKEN_MOVE", { tokenId: token.id, x: newX, y: newY });
          }}
      >
        {/* حلقه انتخاب نئونی */}
        {isSelected && (
            <Circle
                radius={radius + 6}
                stroke="#f59e0b"
                strokeWidth={3}
                dash={[6, 4]}
                shadowColor="#f59e0b"
                shadowBlur={12}
            />
        )}

        {/* بدنه گرد توکن */}
        <Circle
            radius={radius}
            fill={token.tintColor || "#3f3f46"}
            stroke={isSelected ? "#f59e0b" : "#18181b"}
            strokeWidth={3}
            shadowColor="#000000"
            shadowBlur={6}
            fillPatternImage={image || undefined}
            fillPatternScale={
              image && image.width > 0 && image.height > 0
                  ? {
                    x: ((radius - 2) * 2) / image.width,
                    y: ((radius - 2) * 2) / image.height,
                  }
                  : undefined
            }
            fillPatternOffset={
              image && image.width > 0 && image.height > 0
                  ? { x: image.width / 2, y: image.height / 2 }
                  : undefined
            }
        />

        {/* متن جایگزین اگر عکس لود نشود */}
        {!image && (
            <Text
                text={token.label || token.name ? (token.label || token.name).slice(0, 2).toUpperCase() : "??"}
                fontSize={radius * 0.7}
                fontStyle="bold"
                fill="#ffffff"
                align="center"
                verticalAlign="middle"
                x={-radius}
                y={-radius + 4}
                width={radius * 2}
                height={radius * 2}
                listening={false}
            />
        )}

        {/* نوار جان (HP Bar) */}
        <Group y={barY} listening={false}>
          <Rect
              x={-barWidth / 2}
              y={0}
              width={barWidth}
              height={barHeight}
              fill="#09090b"
              cornerRadius={barHeight / 2}
              stroke="#27272a"
              strokeWidth={1}
          />
          <Rect
              x={-barWidth / 2 + 1}
              y={1}
              width={Math.max(0, (barWidth - 2) * hpRatio)}
              height={barHeight - 2}
              fill={hpBarColor}
              cornerRadius={(barHeight - 2) / 2}
          />
          <Text
              text={`${currentHp}/${maxHp}`}
              fontSize={8.5}
              fontStyle="bold"
              fontFamily="monospace"
              fill="#ffffff"
              align="center"
              verticalAlign="middle"
              x={-barWidth / 2}
              y={0.5}
              width={barWidth}
              height={barHeight}
          />
        </Group>

        {/* نام کاراکتر */}
        <Group y={barY + barHeight + 3} listening={false}>
          <Rect
              x={-radius * 1.35}
              y={0}
              width={radius * 2.7}
              height={15}
              fill="rgba(9, 9, 11, 0.88)"
              cornerRadius={4}
              stroke="rgba(63, 63, 70, 0.65)"
              strokeWidth={1}
          />
          <Text
              text={token.label || token.name || ""}
              fontSize={10.5}
              fill="#f4f4f5"
              align="center"
              x={-radius * 1.35}
              y={1.5}
              width={radius * 2.7}
              ellipsis={true}
          />
        </Group>
      </Group>
  );
};

export const TokenLayer = ({ gridSize = 50 }) => {
  const currentScene = useSceneStore((state) => state.currentScene);
  const selectedTokenIds = useCanvasStore((state) => state.selectedTokenIds);
  const toggleTokenSelection = useCanvasStore((state) => state.toggleTokenSelection);
  const openTokenEditor = useCanvasStore((state) => state.openTokenEditor);
  const { isGM, canMoveToken } = usePermissions();

  if (!currentScene || !currentScene.tokens) return null;

  return (
      <Group id="tokens-layer-group">
        {currentScene.tokens.map((token) => (
            <SingleToken
                key={token.id}
                token={token}
                gridSize={gridSize}
                isSelected={selectedTokenIds.includes(token.id)}
                canControl={canMoveToken(token.controlledBy)}
                isGM={isGM}
                onSelect={(e) => {
                  e.cancelBubble = true;
                  toggleTokenSelection(token.id, e.evt?.shiftKey || e.evt?.ctrlKey);
                }}
                onOpenEditor={() => openTokenEditor(token.id)}
            />
        ))}
      </Group>
  );
};