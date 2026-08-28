import React, { useEffect, useState } from "react";
import { Group, Circle, Text, Rect, Image as KonvaImage } from "react-konva";
import { useCanvasStore } from "../../store/canvas.store";
import { useSceneStore } from "../../store/scene.store";
import { usePermissions } from "../../hooks/usePermissions";
import { wsService } from "../../services/websocket.service";
import { CONDITION_MAP } from "../../constants/conditions";
import { getAssetUrl } from "../../api/asset.api";
import { useAuthStore } from "../../store/auth.store";
import { useRoomStore } from "../../store/room.store";
import { TOOLS } from "../../constants/tools";

const SingleToken = ({
                         token,
                         gridSize,
                         isSelected,
                         canControl,
                         isGM,
                         onSelect,
                         onOpenEditor,
                     }) => {
    const [imageObj, setImageObj] = useState(null);
    const moveToken = useSceneStore((state) => state.moveToken);
    const activeTool = useCanvasStore((state) => state.activeTool);

    const tokenPixelSize = (token.size || 1) * gridSize;
    const radius = Math.max(14, tokenPixelSize / 2);

    useEffect(() => {
        const rawUrl = token.avatarUrl || token.assetUrl;
        if (!rawUrl) {
            setImageObj(null);
            return;
        }

        let isMounted = true;
        const img = new window.Image();
        img.crossOrigin = "anonymous";
        img.src = getAssetUrl(rawUrl);

        img.onload = () => {
            if (isMounted) setImageObj(img);
        };
        img.onerror = () => {
            const fallbackImg = new window.Image();
            fallbackImg.src = getAssetUrl(rawUrl);
            fallbackImg.onload = () => {
                if (isMounted) setImageObj(fallbackImg);
            };
            fallbackImg.onerror = () => {
                if (isMounted) setImageObj(null);
            };
        };

        return () => {
            isMounted = false;
        };
    }, [token.avatarUrl, token.assetUrl]);

    if (token.isHidden && !isGM) return null;

    const isProp = Boolean(token.isProp);
    const showHp = token.showHp !== false && !isProp;
    const showName = token.showName !== false;
    const showAc = Boolean(token.showAc) && !isProp && token.ac;
    const showConditions = token.showConditions !== false && !isProp;
    const showNotes = Boolean(token.showNotes) && Boolean(token.gmNotes);

    const currentHp = token.hp ?? token.maxHp ?? 10;
    const maxHp = token.maxHp ?? 10;
    const hpRatio = Math.max(0, Math.min(1, currentHp / maxHp));
    const hpBarColor = hpRatio > 0.5 ? "#10b981" : hpRatio > 0.25 ? "#f59e0b" : "#ef4444";
    const barWidth = Math.max(radius * 2.2, 56);
    const barHeight = 10;

    const tokenConditions = token.conditions || [];
    const activeConditions = tokenConditions
        .map((cId) => (typeof cId === "object" ? cId : CONDITION_MAP?.[cId]))
        .filter(Boolean)
        .slice(0, 3);

    const isDraggable = Boolean(canControl) && !token.isLocked && (activeTool === TOOLS.SELECT || !activeTool);

    return (
        <Group
            x={token.x || 0}
            y={token.y || 0}
            draggable={isDraggable}
            opacity={token.isHidden ? 0.55 : 1}
            onClick={onSelect}
            onTap={onSelect}
            onContextMenu={(e) => {
                e.evt.preventDefault();
                e.cancelBubble = true;
                if (canControl) {
                    onOpenEditor();
                }
            }}
            onDblClick={(e) => {
                e.cancelBubble = true;
                if (canControl) onOpenEditor();
            }}
            onDblTap={(e) => {
                e.cancelBubble = true;
                if (canControl) onOpenEditor();
            }}
            onDragEnd={(e) => {
                const newX = e.target.x();
                const newY = e.target.y();
                moveToken(token.id, newX, newY);
                wsService.send("TOKEN_MOVE", { tokenId: String(token.id), x: newX, y: newY });
            }}
        >
            {isSelected && (
                <Circle
                    radius={radius + 6}
                    stroke="#f59e0b"
                    strokeWidth={3}
                    dash={[6, 4]}
                    shadowColor="#f59e0b"
                    shadowBlur={12}
                    listening={false}
                />
            )}

            {showConditions && activeConditions.length > 0 && (
                <Group y={-radius - 14} listening={false}>
                    <Rect
                        x={-(activeConditions.length * 18 + 8) / 2}
                        y={0}
                        width={activeConditions.length * 18 + 8}
                        height={18}
                        fill="rgba(9, 10, 15, 0.9)"
                        cornerRadius={9}
                        stroke="rgba(245, 158, 11, 0.4)"
                        strokeWidth={1}
                    />
                    <Text
                        text={activeConditions.map((c) => c.icon || "⚡").join(" ")}
                        fontSize={11}
                        align="center"
                        verticalAlign="middle"
                        x={-(activeConditions.length * 18 + 8) / 2}
                        y={2}
                        width={activeConditions.length * 18 + 8}
                        height={16}
                    />
                </Group>
            )}

            {isProp ? (
                <Group
                    clipFunc={(ctx) => {
                        ctx.beginPath();
                        ctx.roundRect(-radius, -radius, radius * 2, radius * 2, 8);
                        ctx.closePath();
                    }}
                >
                    <Rect
                        x={-radius}
                        y={-radius}
                        width={radius * 2}
                        height={radius * 2}
                        fill={token.tintColor || "#27272a"}
                    />
                    {imageObj && (
                        <KonvaImage
                            image={imageObj}
                            x={-radius}
                            y={-radius}
                            width={radius * 2}
                            height={radius * 2}
                        />
                    )}
                </Group>
            ) : (
                <Group
                    clipFunc={(ctx) => {
                        ctx.beginPath();
                        ctx.arc(0, 0, radius, 0, Math.PI * 2, false);
                        ctx.closePath();
                    }}
                >
                    <Circle radius={radius} fill={token.tintColor || "#3f3f46"} />
                    {imageObj && (
                        <KonvaImage
                            image={imageObj}
                            x={-radius}
                            y={-radius}
                            width={radius * 2}
                            height={radius * 2}
                        />
                    )}
                </Group>
            )}

            {isProp ? (
                <Rect
                    x={-radius}
                    y={-radius}
                    width={radius * 2}
                    height={radius * 2}
                    cornerRadius={8}
                    stroke={isSelected ? "#f59e0b" : "#3f3f46"}
                    strokeWidth={2.5}
                    listening={false}
                />
            ) : (
                <Circle
                    radius={radius}
                    stroke={isSelected ? "#f59e0b" : "#18181b"}
                    strokeWidth={3}
                    shadowColor="#000000"
                    shadowBlur={6}
                    listening={false}
                />
            )}

            {!imageObj && (
                <Text
                    text={
                        token.label || token.name
                            ? (token.label || token.name).slice(0, 2).toUpperCase()
                            : isProp
                                ? "OBJ"
                                : "??"
                    }
                    fontSize={radius * 0.65}
                    fontStyle="bold"
                    fill="#ffffff"
                    align="center"
                    verticalAlign="middle"
                    x={-radius}
                    y={-radius + 2}
                    width={radius * 2}
                    height={radius * 2}
                    listening={false}
                />
            )}

            {showAc && (
                <Group x={radius - 6} y={-radius + 6} listening={false}>
                    <Circle radius={9} fill="#1e3a8a" stroke="#60a5fa" strokeWidth={1.5} />
                    <Text
                        text={String(token.ac)}
                        fontSize={9}
                        fontStyle="bold"
                        fill="#ffffff"
                        align="center"
                        verticalAlign="middle"
                        x={-9}
                        y={-8}
                        width={18}
                        height={18}
                    />
                </Group>
            )}

            {showHp && (
                <Group y={radius + 6} listening={false}>
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
                        fontSize={8}
                        fontStyle="bold"
                        fontFamily="monospace"
                        fill="#ffffff"
                        align="center"
                        verticalAlign="middle"
                        x={-barWidth / 2}
                        y={0}
                        width={barWidth}
                        height={barHeight}
                    />
                </Group>
            )}

            {isProp && (token.goldValue || token.xpValue) && (
                <Group y={radius + 6} listening={false}>
                    <Rect
                        x={-radius * 1.3}
                        y={0}
                        width={radius * 2.6}
                        height={14}
                        fill="rgba(15, 23, 42, 0.9)"
                        cornerRadius={4}
                        stroke="#eab308"
                        strokeWidth={1}
                    />
                    <Text
                        text={[
                            token.goldValue ? `${token.goldValue} GP` : null,
                            token.xpValue ? `${token.xpValue} XP` : null,
                        ]
                            .filter(Boolean)
                            .join(" | ")}
                        fontSize={8.5}
                        fontStyle="bold"
                        fill="#facc15"
                        align="center"
                        x={-radius * 1.3}
                        y={1.5}
                        width={radius * 2.6}
                    />
                </Group>
            )}

            {showName && (
                <Group
                    y={
                        showHp || (isProp && (token.goldValue || token.xpValue))
                            ? radius + 6 + barHeight + 3
                            : radius + 6
                    }
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
                    />
                    <Text
                        text={token.label || token.name || ""}
                        fontSize={10}
                        fill="#f4f4f5"
                        align="center"
                        x={-radius * 1.35}
                        y={1.5}
                        width={radius * 2.7}
                        ellipsis={true}
                    />
                </Group>
            )}

            {showNotes && isGM && (
                <Group y={radius + 6 + barHeight + 20} listening={false}>
                    <Rect
                        x={-radius * 1.5}
                        y={0}
                        width={radius * 3}
                        height={16}
                        fill="rgba(39, 39, 42, 0.95)"
                        cornerRadius={4}
                        stroke="#f59e0b"
                        strokeWidth={1}
                    />
                    <Text
                        text={`📝 ${token.gmNotes}`}
                        fontSize={8.5}
                        fill="#fef08a"
                        align="center"
                        x={-radius * 1.5}
                        y={2}
                        width={radius * 3}
                        ellipsis={true}
                    />
                </Group>
            )}
        </Group>
    );
};

export const TokenLayer = ({ gridSize = 50, isGM: propIsGM }) => {
    const currentScene = useSceneStore((state) => state.currentScene);
    const selectedTokenIds = useCanvasStore((state) => state.selectedTokenIds);
    const toggleTokenSelection = useCanvasStore((state) => state.toggleTokenSelection);
    const openTokenEditor = useCanvasStore((state) => state.openTokenEditor);

    const { isGM: hookIsGM } = usePermissions();
    const currentUser = useAuthStore((state) => state.user);
    const currentRoom = useRoomStore((state) => state.currentRoom);

    const isRoomHost = currentRoom?.creatorId && currentUser?.id && String(currentRoom.creatorId) === String(currentUser.id);
    const isGM = Boolean(propIsGM || hookIsGM || isRoomHost || currentUser?.role === "GM" || currentUser?.role === "ADMIN");

    if (!currentScene || !currentScene.tokens) return null;

    return (
        <Group id="tokens-layer-group">
            {currentScene.tokens.map((token) => {
                // مقایسه رشته‌ای ایمن جهت جلوگیری از عدم تطابق نوع تایپ
                const isOwner = token.controlledBy && String(token.controlledBy) === String(currentUser?.id);
                const canControl = Boolean(isGM) || Boolean(isOwner);

                return (
                    <SingleToken
                        key={token.id}
                        token={token}
                        gridSize={gridSize}
                        isSelected={selectedTokenIds.includes(token.id)}
                        canControl={canControl}
                        isGM={isGM}
                        onSelect={(e) => {
                            e.cancelBubble = true;
                            toggleTokenSelection(token.id, e.evt?.shiftKey || e.evt?.ctrlKey);
                        }}
                        onOpenEditor={() => {
                            if (canControl) {
                                openTokenEditor(token.id);
                            }
                        }}
                    />
                );
            })}
        </Group>
    );
};