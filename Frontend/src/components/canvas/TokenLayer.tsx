import React, { useEffect, useState } from "react";
import { Group, Circle, Text, Rect } from "react-konva";
import { Token } from "../../types";
import { useCanvasStore } from "../../store/canvas.store";
import { useSceneStore } from "../../store/scene.store";
import { usePermissions } from "../../hooks/usePermissions";
import { wsService } from "../../services/websocket.service";
import { CONDITION_MAP, STATUS_CONDITIONS } from "../../constants/conditions";

interface TokenItemProps {
  token: Token;
  gridSize: number;
  isSelected: boolean;
  canControl: boolean;
  isGM: boolean;
  onSelect: (e: any) => void;
  onOpenEditor: () => void;
}

const SingleToken: React.FC<TokenItemProps> = ({
  token,
  gridSize,
  isSelected,
  canControl,
  isGM,
  onSelect,
  onOpenEditor,
}) => {
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [showQuickConditions, setShowQuickConditions] = useState(false);
  const moveToken = useSceneStore((state) => state.moveToken);
  const updateToken = useSceneStore((state) => state.updateToken);

  const tokenPixelSize = (token.size || 1) * gridSize;
  const radius = Math.max(12, tokenPixelSize / 2);

  useEffect(() => {
    if (!token.avatarUrl) {
      setImage(null);
      return;
    }
    let isMounted = true;
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.src = token.avatarUrl;
    img.onload = () => {
      if (isMounted) setImage(img);
    };
    img.onerror = () => {
      if (isMounted) setImage(null);
    };
    return () => {
      isMounted = false;
    };
  }, [token.avatarUrl]);

  // If token is GM stealth/hidden and viewer is not GM, do not render
  if (token.isHidden && !isGM) {
    return null;
  }

  // --- Health Bar Dynamic Visibility & Values ---
  const isHpBarEnabled =
    token.showHpBar !== false && typeof token.maxHp === "number" && token.maxHp > 0;
  const visibility = token.hpVisibility || "all";
  const canSeeHp =
    isGM || visibility === "all" || (visibility === "owner" && canControl);
  const showHp = isHpBarEnabled && canSeeHp;

  const currentHp = token.hp ?? token.maxHp ?? 0;
  const maxHp = token.maxHp ?? 1;
  const tempHp = token.tempHp ?? 0;
  const hpRatio = Math.max(0, Math.min(1, currentHp / maxHp));
  const hpStyle = token.hpStyle || "bar_numbers";

  // Dynamic HP Bar Color
  const getHpColor = (ratio: number, current: number) => {
    if (current <= 0) return "#7f1d1d";
    if (ratio > 0.5) return "#10b981"; // Emerald green
    if (ratio > 0.25) return "#f59e0b"; // Amber yellow
    return "#ef4444"; // Fiery red
  };

  const hpBarColor = getHpColor(hpRatio, currentHp);
  const barWidth = Math.max(radius * 2.2, 56);
  const barHeight = hpStyle === "bar_numbers" ? 11 : 7;
  const barY = radius + 6;

  // Active conditions lookup
  const tokenConditions = token.conditions || [];
  const activeConditionDefs = tokenConditions
    .map((cId) => CONDITION_MAP[cId])
    .filter(Boolean);

  const isInvisible = tokenConditions.includes("invisible");
  const isProne = tokenConditions.includes("prone");
  const isIncapacitated = tokenConditions.includes("incapacitated");
  const isUnconscious = tokenConditions.includes("unconscious");
  const isPoisoned = tokenConditions.includes("poisoned");
  const isBurning = tokenConditions.includes("burning");
  const isBlessed = tokenConditions.includes("blessed");

  // Quick HP Modifier Handler
  const handleQuickHpChange = (delta: number, e: any) => {
    e.cancelBubble = true;
    const newHp = Math.max(0, Math.min(maxHp, currentHp + delta));
    updateToken(token.id, { hp: newHp });
    wsService.send("TOKEN_UPDATE", { tokenId: token.id, hp: newHp });
  };

  // Quick Condition Toggle Handler
  const handleToggleCondition = (condId: string, e: any) => {
    e.cancelBubble = true;
    const exists = tokenConditions.includes(condId);
    const newConditions = exists
      ? tokenConditions.filter((c) => c !== condId)
      : [...tokenConditions, condId];

    updateToken(token.id, { conditions: newConditions });
    wsService.send("TOKEN_UPDATE", { tokenId: token.id, conditions: newConditions });
  };

  return (
    <Group
      x={token.x}
      y={token.y}
      draggable={canControl && !token.isLocked}
      opacity={token.isHidden ? 0.55 : isInvisible ? 0.5 : 1}
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
      {/* Selection Glow Ring */}
      {isSelected ? (
        <Circle
          radius={radius + 6}
          stroke="#f59e0b"
          strokeWidth={3}
          dash={[6, 4]}
          shadowColor="#f59e0b"
          shadowBlur={12}
        />
      ) : null}

      {/* Special Condition Aura Rings */}
      {isInvisible ? (
        <Circle
          radius={radius + 4}
          stroke="#38bdf8"
          strokeWidth={2}
          dash={[4, 4]}
          shadowColor="#0284c7"
          shadowBlur={8}
        />
      ) : isProne ? (
        <Circle
          radius={radius + 4}
          stroke="#ea580c"
          strokeWidth={2.5}
          shadowColor="#ea580c"
          shadowBlur={6}
        />
      ) : isIncapacitated ? (
        <Circle
          radius={radius + 4}
          stroke="#a855f7"
          strokeWidth={2.5}
          shadowColor="#9333ea"
          shadowBlur={6}
        />
      ) : isPoisoned ? (
        <Circle
          radius={radius + 4}
          stroke="#10b981"
          strokeWidth={2}
          shadowColor="#059669"
          shadowBlur={6}
        />
      ) : isBurning ? (
        <Circle
          radius={radius + 4}
          stroke="#ef4444"
          strokeWidth={2.5}
          shadowColor="#dc2626"
          shadowBlur={8}
        />
      ) : isBlessed ? (
        <Circle
          radius={radius + 4}
          stroke="#fbbf24"
          strokeWidth={2}
          shadowColor="#f59e0b"
          shadowBlur={8}
        />
      ) : null}

      {/* Base Token Circle Background */}
      <Circle
        radius={radius}
        fill={token.tintColor || "#3f3f46"}
        stroke={isSelected ? "#f59e0b" : "#18181b"}
        strokeWidth={3}
        shadowColor="#000000"
        shadowBlur={6}
        shadowOpacity={0.6}
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
            ? {
                x: image.width / 2,
                y: image.height / 2,
              }
            : undefined
        }
      />

      {/* Fallback Initials if image not loaded */}
      {!image ? (
        <Text
          text={token.name ? token.name.slice(0, 2).toUpperCase() : "??"}
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
      ) : null}

      {/* Unconscious or 0 HP Downed Skull Overlay */}
      {isUnconscious || (currentHp <= 0 && isHpBarEnabled) ? (
        <Group listening={false}>
          <Circle radius={radius} fill="rgba(127, 29, 29, 0.65)" />
          <Text
            text={isUnconscious ? "💤" : "💀"}
            fontSize={radius * 0.85}
            align="center"
            verticalAlign="middle"
            x={-radius}
            y={-radius}
            width={radius * 2}
            height={radius * 2}
          />
        </Group>
      ) : null}

      {/* ========================================================================= */}
      {/* STATUS EFFECT BADGES ATTACHED DIRECTLY ON TOKEN HEALTH BAR COMPONENT */}
      {/* ========================================================================= */}
      {activeConditionDefs.length > 0 ? (
        <Group y={showHp ? barY - 14 : barY - 4} listening={false}>
          {(() => {
            const badgeCount = Math.min(activeConditionDefs.length, 5);
            const badgeW = 16;
            const gap = 3;
            const totalRowW = badgeCount * badgeW + (badgeCount - 1) * gap;
            const startX = -totalRowW / 2;

            return activeConditionDefs.slice(0, 5).map((cond, idx) => {
              const xPos = startX + idx * (badgeW + gap);
              return (
                <Group key={cond.id} x={xPos}>
                  {/* Badge Capsule */}
                  <Rect
                    x={0}
                    y={0}
                    width={badgeW}
                    height={13}
                    fill={cond.badgeColor}
                    cornerRadius={6.5}
                    stroke="rgba(0,0,0,0.8)"
                    strokeWidth={1}
                    shadowColor="#000000"
                    shadowBlur={3}
                    shadowOpacity={0.6}
                  />
                  {/* Condition Icon / Emoji */}
                  <Text
                    text={cond.icon}
                    fontSize={8.5}
                    align="center"
                    verticalAlign="middle"
                    x={0}
                    y={1}
                    width={badgeW}
                    height={11}
                  />
                </Group>
              );
            });
          })()}

          {/* Plus overflow badge if more than 5 conditions */}
          {activeConditionDefs.length > 5 ? (
            <Group x={barWidth / 2 - 4} y={0}>
              <Circle radius={6} fill="#3f3f46" stroke="#18181b" strokeWidth={1} />
              <Text
                text={`+${activeConditionDefs.length - 5}`}
                fontSize={7}
                fontStyle="bold"
                fill="#ffffff"
                align="center"
                x={-5}
                y={-3.5}
                width={10}
              />
            </Group>
          ) : null}
        </Group>
      ) : null}

      {/* Dynamic Health Bar Component */}
      {showHp ? (
        <Group y={barY} listening={false}>
          {/* Outer Border & Track Background */}
          <Rect
            x={-barWidth / 2}
            y={0}
            width={barWidth}
            height={barHeight}
            fill="#09090b"
            cornerRadius={barHeight / 2}
            stroke="#27272a"
            strokeWidth={1}
            shadowColor="#000000"
            shadowBlur={4}
            shadowOpacity={0.6}
          />

          {/* Regular HP Fill */}
          <Rect
            x={-barWidth / 2 + 1}
            y={1}
            width={Math.max(0, (barWidth - 2) * hpRatio)}
            height={barHeight - 2}
            fill={hpBarColor}
            cornerRadius={(barHeight - 2) / 2}
          />

          {/* Temporary HP Cyan Overlay */}
          {tempHp > 0 ? (
            <Rect
              x={-barWidth / 2 + 1}
              y={1}
              width={Math.min(
                barWidth - 2,
                Math.max(4, ((barWidth - 2) * tempHp) / maxHp)
              )}
              height={barHeight - 2}
              fill="rgba(6, 182, 212, 0.85)"
              cornerRadius={(barHeight - 2) / 2}
              stroke="#22d3ee"
              strokeWidth={0.5}
            />
          ) : null}

          {/* Exact Numeric HP Overlay */}
          {hpStyle === "bar_numbers" ? (
            <Text
              text={`${currentHp}${tempHp > 0 ? `+${tempHp}` : ""}/${maxHp}`}
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
              shadowColor="#000000"
              shadowBlur={3}
              shadowOffset={{ x: 0, y: 1 }}
            />
          ) : null}

          {/* Pips Style */}
          {hpStyle === "pips" ? (
            <Group>
              {Array.from({ length: Math.min(maxHp, 10) }).map((_, i) => {
                const pipActive = (i + 1) / Math.min(maxHp, 10) <= hpRatio;
                const pipX =
                  -barWidth / 2 +
                  4 +
                  (i * (barWidth - 8)) / Math.max(1, Math.min(maxHp, 10) - 1);
                return (
                  <Circle
                    key={i}
                    x={pipX}
                    y={barHeight / 2}
                    radius={2}
                    fill={pipActive ? hpBarColor : "#3f3f46"}
                  />
                );
              })}
            </Group>
          ) : null}

          {/* GM Secret Visibility Indicator Badge */}
          {isGM && visibility === "gm_only" ? (
            <Group x={barWidth / 2 + 5} y={barHeight / 2}>
              <Circle radius={4.5} fill="#a855f7" stroke="#6b21a8" strokeWidth={1} />
              <Text
                text="GM"
                fontSize={5}
                fontStyle="bold"
                fill="#ffffff"
                x={-3}
                y={-2.5}
              />
            </Group>
          ) : null}
        </Group>
      ) : null}

      {/* Nameplate Tag */}
      <Group
        y={barY + (showHp ? barHeight + 3 : 2)}
        listening={false}
      >
        <Rect
          x={-radius * 1.35}
          y={0}
          width={radius * 2.7}
          height={15}
          fill="rgba(9, 9, 11, 0.88)"
          cornerRadius={4}
          stroke="rgba(63, 63, 70, 0.65)"
          strokeWidth={1}
          shadowColor="#000000"
          shadowBlur={3}
        />
        <Text
          text={token.name || ""}
          fontSize={10.5}
          fill="#f4f4f5"
          align="center"
          x={-radius * 1.35}
          y={1.5}
          width={radius * 2.7}
          ellipsis={true}
        />
      </Group>

      {/* ========================================================================= */}
      {/* QUICK IN-CANVAS CONTROLS: HP ADJUSTMENT & STATUS CONDITION TOGGLER */}
      {/* ========================================================================= */}
      {isSelected && (canControl || isGM) ? (
        <Group y={barY + (showHp ? barHeight + 20 : 19)}>
          {/* Row 1: Quick HP Modifier Buttons */}
          {isHpBarEnabled ? (
            <Group y={0}>
              <Rect
                x={-60}
                y={0}
                width={120}
                height={20}
                fill="rgba(9, 9, 11, 0.95)"
                cornerRadius={10}
                stroke="rgba(245, 158, 11, 0.75)"
                strokeWidth={1.2}
                shadowColor="#000000"
                shadowBlur={6}
              />
              {/* -5 HP */}
              <Group x={-46} y={10} onClick={(e) => handleQuickHpChange(-5, e)} onTap={(e) => handleQuickHpChange(-5, e)}>
                <Circle radius={7} fill="#e11d48" />
                <Text text="-5" fontSize={7.5} fontStyle="bold" fill="#ffffff" align="center" x={-6} y={-3.5} width={12} />
              </Group>
              {/* -1 HP */}
              <Group x={-24} y={10} onClick={(e) => handleQuickHpChange(-1, e)} onTap={(e) => handleQuickHpChange(-1, e)}>
                <Circle radius={7} fill="#f43f5e" />
                <Text text="-1" fontSize={7.5} fontStyle="bold" fill="#ffffff" align="center" x={-6} y={-3.5} width={12} />
              </Group>
              {/* Status Effects Toggle Trigger Icon */}
              <Group
                x={0}
                y={10}
                onClick={(e) => {
                  e.cancelBubble = true;
                  setShowQuickConditions(!showQuickConditions);
                }}
                onTap={(e) => {
                  e.cancelBubble = true;
                  setShowQuickConditions(!showQuickConditions);
                }}
              >
                <Circle radius={7.5} fill={showQuickConditions ? "#f59e0b" : "#27272a"} stroke="#52525b" strokeWidth={0.8} />
                <Text text="⚡" fontSize={8} align="center" x={-5} y={-4.5} width={10} />
              </Group>
              {/* +1 HP */}
              <Group x={24} y={10} onClick={(e) => handleQuickHpChange(1, e)} onTap={(e) => handleQuickHpChange(1, e)}>
                <Circle radius={7} fill="#10b981" />
                <Text text="+1" fontSize={7.5} fontStyle="bold" fill="#ffffff" align="center" x={-6} y={-3.5} width={12} />
              </Group>
              {/* +5 HP */}
              <Group x={46} y={10} onClick={(e) => handleQuickHpChange(5, e)} onTap={(e) => handleQuickHpChange(5, e)}>
                <Circle radius={7} fill="#059669" />
                <Text text="+5" fontSize={7.5} fontStyle="bold" fill="#ffffff" align="center" x={-6} y={-3.5} width={12} />
              </Group>
            </Group>
          ) : null}

          {/* Row 2: In-Canvas Quick Status Effect Toggler (Prone, Incapacitated, Invisible, Unconscious, Poisoned, Blessed) */}
          <Group y={isHpBarEnabled ? 23 : 0}>
            <Rect
              x={-80}
              y={0}
              width={160}
              height={22}
              fill="rgba(9, 9, 11, 0.95)"
              cornerRadius={11}
              stroke="rgba(147, 51, 234, 0.75)"
              strokeWidth={1.2}
              shadowColor="#000000"
              shadowBlur={6}
            />

            {[
              { id: "prone", icon: "🧎", color: "#ea580c" },
              { id: "incapacitated", icon: "💫", color: "#9333ea" },
              { id: "invisible", icon: "👻", color: "#0284c7" },
              { id: "unconscious", icon: "💤", color: "#be123c" },
              { id: "poisoned", icon: "🧪", color: "#059669" },
              { id: "blessed", icon: "✨", color: "#f59e0b" },
            ].map((cond, idx) => {
              const isActive = tokenConditions.includes(cond.id);
              const xPos = -66 + idx * 23;
              return (
                <Group
                  key={cond.id}
                  x={xPos}
                  y={11}
                  onClick={(e) => handleToggleCondition(cond.id, e)}
                  onTap={(e) => handleToggleCondition(cond.id, e)}
                >
                  <Circle
                    radius={8.5}
                    fill={isActive ? cond.color : "rgba(39, 39, 42, 0.8)"}
                    stroke={isActive ? "#ffffff" : "rgba(82, 82, 91, 0.5)"}
                    strokeWidth={isActive ? 1.2 : 0.8}
                  />
                  <Text
                    text={cond.icon}
                    fontSize={9}
                    align="center"
                    x={-6}
                    y={-5}
                    width={12}
                  />
                </Group>
              );
            })}

            {/* Quick Button to Open Full Editor */}
            <Group
              x={71}
              y={11}
              onClick={(e) => {
                e.cancelBubble = true;
                onOpenEditor();
              }}
              onTap={(e) => {
                e.cancelBubble = true;
                onOpenEditor();
              }}
            >
              <Circle radius={7} fill="#27272a" stroke="#71717a" strokeWidth={0.8} />
              <Text text="✏️" fontSize={7} align="center" x={-5} y={-4.5} width={10} />
            </Group>
          </Group>
        </Group>
      ) : null}

      {/* Elevation Badge */}
      {typeof token.elevation === "number" && token.elevation !== 0 ? (
        <Group x={radius - 6} y={-radius + 6} listening={false}>
          <Circle radius={9} fill="#3b82f6" stroke="#1d4ed8" strokeWidth={1} />
          <Text
            text={`+${token.elevation}`}
            fontSize={8.5}
            fontStyle="bold"
            fill="#ffffff"
            align="center"
            x={-9}
            y={-4.5}
            width={18}
          />
        </Group>
      ) : null}

      {/* AC Shield Badge */}
      {typeof token.ac === "number" && token.ac > 0 ? (
        <Group x={-radius + 6} y={-radius + 6} listening={false}>
          <Circle radius={9} fill="#2563eb" stroke="#1d4ed8" strokeWidth={1} />
          <Text
            text={`${token.ac}`}
            fontSize={8.5}
            fontStyle="bold"
            fill="#ffffff"
            align="center"
            x={-9}
            y={-4.5}
            width={18}
          />
        </Group>
      ) : null}
    </Group>
  );
};

export const TokenLayer: React.FC<{ gridSize: number }> = ({ gridSize }) => {
  const currentScene = useSceneStore((state) => state.currentScene);
  const selectedTokenIds = useCanvasStore((state) => state.selectedTokenIds);
  const toggleTokenSelection = useCanvasStore((state) => state.toggleTokenSelection);
  const openTokenEditor = useCanvasStore((state) => state.openTokenEditor);
  const { isGM, canMoveToken } = usePermissions();

  if (!currentScene || !currentScene.tokens) {
    return null;
  }

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
            toggleTokenSelection(token.id, e.evt.shiftKey || e.evt.ctrlKey);
          }}
          onOpenEditor={() => openTokenEditor(token.id)}
        />
      ))}
    </Group>
  );
};
