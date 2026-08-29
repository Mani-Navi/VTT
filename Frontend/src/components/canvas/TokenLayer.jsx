import React, { useEffect, useState, useRef } from "react";
import { Group, Circle, Text, Rect, Image as KonvaImage } from "react-konva";
import { useCanvasStore } from "../../store/canvas.store";
import { useSceneStore } from "../../store/scene.store";
import { usePermissions } from "../../hooks/usePermissions";
import { wsService } from "../../services/websocket.service";
import { CONDITION_MAP } from "../../constants/conditions";
import { getAssetUrl } from "../../api/asset.api";
import { useAuthStore } from "../../store/auth.store";
import { useRoomStore } from "../../store/room.store";

const tokenImageCache = new Map();

// نگاشت سریع ایموجی‌های D&D 5e
const DND_CONDITION_EMOJIS = {
    blinded: "🙈",
    charmed: "💖",
    deafened: "🙉",
    frightened: "😨",
    grappled: "🤼",
    incapacitated: "💫",
    invisible: "👻",
    paralyzed: "⚡",
    petrified: "🗿",
    poisoned: "🤢",
    prone: "🛌",
    restrained: "⛓️",
    stunned: "😵",
    unconscious: "💤",
    exhaustion: "😫",
    bleeding: "🩸",
};

const snapToCellCenter = (rawX, rawY, gridSize = 60, tokenSize = 1) => {
    const S = Number(gridSize) || 60;
    const size = Number(tokenSize) || 1;

    if (size % 2 === 1) {
        const cellX = Math.floor(rawX / S);
        const cellY = Math.floor(rawY / S);
        return {
            x: cellX * S + S / 2,
            y: cellY * S + S / 2,
        };
    } else {
        const snappedX = Math.round(rawX / S) * S;
        const snappedY = Math.round(rawY / S) * S;
        return {
            x: snappedX,
            y: snappedY,
        };
    }
};

const SingleToken = ({
                         token,
                         gridSize,
                         isSelected,
                         canControl,
                         canEdit,
                         isGM,
                         fallbackUsername = "",
                         onSelect,
                         onOpenEditor,
                     }) => {
    const [imageObj, setImageObj] = useState(null);
    const moveToken = useSceneStore((state) => state.moveToken);
    const groupRef = useRef(null);

    const rawUrl = token.avatarUrl || token.assetUrl || "";
    const tokenPixelSize = (token.size || 1) * gridSize;
    const radius = Math.max(16, tokenPixelSize / 2);

    useEffect(() => {
        if (!rawUrl || rawUrl.trim() === "" || rawUrl.length < 4) {
            setImageObj(null);
            return;
        }

        const fullUrl = getAssetUrl(rawUrl);

        if (tokenImageCache.has(fullUrl)) {
            setImageObj(tokenImageCache.get(fullUrl));
            return;
        }

        let isMounted = true;
        const img = new window.Image();
        if (!fullUrl.startsWith("data:") && !fullUrl.startsWith("blob:")) {
            img.crossOrigin = "anonymous";
        }
        img.src = fullUrl;

        img.onload = () => {
            tokenImageCache.set(fullUrl, img);
            if (isMounted) setImageObj(img);
        };
        img.onerror = () => {
            if (isMounted) setImageObj(null);
        };

        return () => {
            isMounted = false;
        };
    }, [rawUrl]);

    if (token.isHidden && !isGM) return null;

    const isProp = Boolean(token.isProp);
    const showHp = token.showHp !== false && !isProp;
    const showAc = Boolean(token.showAc) && !isProp && Boolean(token.ac);
    const showConditions = token.showConditions !== false && !isProp;
    const showNotes = Boolean(token.showNotes) && Boolean(token.gmNotes);

    const currentHp = Number(token.hp !== undefined ? token.hp : (token.maxHp || 20));
    const maxHp = Number(token.maxHp || 20);
    const hpRatio = Math.max(0, Math.min(1, currentHp / maxHp));
    const hpBarColor = hpRatio > 0.5 ? "#10b981" : hpRatio > 0.25 ? "#f59e0b" : "#ef4444";

    const barWidth = Math.max(radius * 2, 54);
    const barHeight = 12;

    const tokenConditions = token.conditions || [];
    const activeConditions = tokenConditions
        .map((c) => {
            if (typeof c === "object" && c.icon) return c.icon;
            if (typeof c === "string") return DND_CONDITION_EMOJIS[c] || CONDITION_MAP?.[c]?.icon || "⚡";
            return "⚡";
        })
        .filter(Boolean)
        .slice(0, 3);

    const isDraggable = Boolean(canControl) && !token.isLocked;

    let rawName = token.label || token.name;
    if (!rawName || rawName === "کاراکتر" || rawName === "توکن" || rawName === "توکن جدید") {
        rawName = fallbackUsername || "قهرمان";
    }

    const displayName = rawName.trim();
    const initials = displayName ? displayName.slice(0, 2).toUpperCase() : "TK";

    const handleOpenEdit = (e) => {
        if (e) {
            if (e.evt) e.evt.preventDefault();
            e.cancelBubble = true;
        }
        if (canEdit || canControl || isGM) {
            onOpenEditor();
        }
    };

    const handleDragEnd = (e) => {
        e.cancelBubble = true;
        const rawX = e.target.x();
        const rawY = e.target.y();

        const { x: snappedX, y: snappedY } = snapToCellCenter(rawX, rawY, gridSize, token.size || 1);

        if (groupRef.current) {
            groupRef.current.position({ x: snappedX, y: snappedY });
        }

        moveToken(token.id, snappedX, snappedY);

        wsService.send("TOKEN_MOVE", {
            tokenId: String(token.id),
            id: String(token.id),
            label: displayName,
            name: displayName,
            avatarUrl: rawUrl,
            controlledBy: token.controlledBy,
            x: snappedX,
            y: snappedY,
        });
    };

    // محاسبه فواصل دایره‌های وضعیت
    const conditionBadgeRadius = 10;
    const conditionSpacing = 22;
    const totalConditionsWidth = (activeConditions.length - 1) * conditionSpacing;
    const startConditionX = -totalConditionsWidth / 2;

    return (
        <Group
            ref={groupRef}
            x={Number(token.x || 0)}
            y={Number(token.y || 0)}
            draggable={isDraggable}
            opacity={token.isHidden ? 0.55 : 1}
            onClick={(e) => {
                e.cancelBubble = true;
                onSelect(e);
            }}
            onTap={(e) => {
                e.cancelBubble = true;
                onSelect(e);
            }}
            onContextMenu={handleOpenEdit}
            onDblClick={handleOpenEdit}
            onDblTap={handleOpenEdit}
            onDragStart={(e) => {
                e.cancelBubble = true;
            }}
            onDragEnd={handleDragEnd}
        >
            {/* هاله انتخاب */}
            {isSelected && (
                <Circle
                    radius={radius + 5}
                    stroke="#f59e0b"
                    strokeWidth={3}
                    dash={[6, 4]}
                    shadowColor="#f59e0b"
                    shadowBlur={10}
                    listening={false}
                />
            )}

            {/* وضعیت‌های کاندیشن (دایره‌های مستقل مشابه نشان AC) */}
            {showConditions && activeConditions.length > 0 && (
                <Group y={-radius - 12} listening={false}>
                    {activeConditions.map((emoji, idx) => {
                        const posX = startConditionX + idx * conditionSpacing;
                        return (
                            <Group key={`cond-${idx}`} x={posX} y={0}>
                                <Circle
                                    radius={conditionBadgeRadius}
                                    fill="#090a0f"
                                    stroke="#f59e0b"
                                    strokeWidth={1.5}
                                    shadowColor="#000000"
                                    shadowBlur={4}
                                />
                                <Text
                                    text={emoji}
                                    fontSize={11}
                                    align="center"
                                    verticalAlign="middle"
                                    x={-conditionBadgeRadius}
                                    y={-conditionBadgeRadius + 0.5}
                                    width={conditionBadgeRadius * 2}
                                    height={conditionBadgeRadius * 2}
                                />
                            </Group>
                        );
                    })}
                </Group>
            )}

            {/* بدنه و تصویر اصلی توکن */}
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
                    <Circle radius={radius} fill={token.tintColor || "#1e293b"} />
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

            {/* کادر دور توکن */}
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
                    stroke={isSelected ? "#f59e0b" : "#f59e0b"}
                    strokeWidth={isSelected ? 3 : 2}
                    shadowColor="#000000"
                    shadowBlur={6}
                    listening={false}
                />
            )}

            {/* حروف اول نام در صورت نبود عکس */}
            {!imageObj && (
                <Text
                    text={initials}
                    fontSize={Math.max(11, radius * 0.65)}
                    fontStyle="bold"
                    fill="#f8fafc"
                    align="center"
                    verticalAlign="middle"
                    x={-radius}
                    y={-radius + 1}
                    width={radius * 2}
                    height={radius * 2}
                    listening={false}
                />
            )}

            {/* نشان AC */}
            {showAc && (
                <Group x={radius - 4} y={-radius + 4} listening={false}>
                    <Circle radius={9.5} fill="#1e3a8a" stroke="#60a5fa" strokeWidth={1.5} shadowColor="#000000" shadowBlur={4} />
                    <Text
                        text={String(token.ac)}
                        fontSize={9.5}
                        fontStyle="bold"
                        fill="#ffffff"
                        align="center"
                        verticalAlign="middle"
                        x={-9.5}
                        y={-8.5}
                        width={19}
                        height={19}
                    />
                </Group>
            )}

            {/* نوار سلامتی (HP Bar) */}
            {showHp && (
                <Group y={radius + 4} listening={false}>
                    <Rect
                        x={-barWidth / 2}
                        y={0}
                        width={barWidth}
                        height={barHeight}
                        fill="#090a0f"
                        cornerRadius={barHeight / 2}
                        stroke="#27272a"
                        strokeWidth={1.5}
                    />
                    <Rect
                        x={-barWidth / 2 + 1.5}
                        y={1.5}
                        width={Math.max(0, (barWidth - 3) * hpRatio)}
                        height={barHeight - 3}
                        fill={hpBarColor}
                        cornerRadius={(barHeight - 3) / 2}
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
                        y={1}
                        width={barWidth}
                        height={barHeight - 1}
                    />
                </Group>
            )}

            {/* پاداش شیء */}
            {isProp && (token.goldValue || token.xpValue) && (
                <Group y={radius + 4} listening={false}>
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

            {/* برچسب نام کاراکتر */}
            <Group
                y={
                    showHp || (isProp && (token.goldValue || token.xpValue))
                        ? radius + 4 + barHeight + 3
                        : radius + 4
                }
                listening={false}
            >
                <Rect
                    x={-Math.max(radius * 1.4, 42)}
                    y={0}
                    width={Math.max(radius * 2.8, 84)}
                    height={16}
                    fill="rgba(9, 10, 15, 0.95)"
                    cornerRadius={5}
                    stroke="rgba(245, 158, 11, 0.4)"
                    strokeWidth={1}
                />
                <Text
                    text={displayName}
                    fontSize={10}
                    fontStyle="bold"
                    fill="#fef08a"
                    align="center"
                    verticalAlign="middle"
                    x={-Math.max(radius * 1.4, 42)}
                    y={1.5}
                    width={Math.max(radius * 2.8, 84)}
                    height={13}
                    ellipsis={true}
                />
            </Group>

            {/* یادداشت GM */}
            {showNotes && isGM && (
                <Group y={radius + 4 + barHeight + 22} listening={false}>
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
                        verticalAlign="middle"
                        x={-radius * 1.5}
                        y={1.5}
                        width={radius * 3}
                        height={13}
                        ellipsis={true}
                    />
                </Group>
            )}
        </Group>
    );
};

export const TokenLayer = ({ gridSize = 60, isGM: propIsGM }) => {
    const currentScene = useSceneStore((state) => state.currentScene);
    const selectedTokenIds = useCanvasStore((state) => state.selectedTokenIds);
    const toggleTokenSelection = useCanvasStore((state) => state.toggleTokenSelection);
    const openTokenEditor = useCanvasStore((state) => state.openTokenEditor);

    const { isGM: hookIsGM, permissions } = usePermissions();
    const currentUser = useAuthStore((state) => state.user);
    const currentRoom = useRoomStore((state) => state.currentRoom);

    const isRoomHost =
        currentRoom?.creatorId &&
        currentUser?.id &&
        String(currentRoom.creatorId) === String(currentUser.id);

    const isGM = Boolean(
        propIsGM ||
        hookIsGM ||
        isRoomHost ||
        currentUser?.role === "GM" ||
        currentUser?.role === "ADMIN"
    );

    if (!currentScene || !currentScene.tokens) return null;

    const userTokens = currentScene.tokens;

    return (
        <Group id="tokens-layer-group">
            {userTokens.map((token, index) => {
                const tokenOwner = token.controlledBy ? String(token.controlledBy).toLowerCase() : "";
                const userId = currentUser?.id ? String(currentUser.id).toLowerCase() : "";
                const userName = currentUser?.username ? String(currentUser.username).toLowerCase() : "";
                const userEmail = currentUser?.email ? String(currentUser.email).toLowerCase() : "";

                const isOwner = Boolean(
                    !isGM
                        ? (tokenOwner && (tokenOwner === userId || tokenOwner === userName || tokenOwner === userEmail)) ||
                        userTokens.length === 1 ||
                        index === 0
                        : true
                );

                const canControl = Boolean(isGM || isOwner);
                const canEdit = Boolean(isGM || isOwner || permissions?.canEditToken);

                return (
                    <SingleToken
                        key={token.id}
                        token={token}
                        gridSize={gridSize}
                        isSelected={selectedTokenIds.includes(token.id)}
                        canControl={canControl}
                        canEdit={canEdit}
                        isGM={isGM}
                        fallbackUsername={currentUser?.username || "بازیکن"}
                        onSelect={(e) => {
                            toggleTokenSelection(token.id, e.evt?.shiftKey || e.evt?.ctrlKey);
                        }}
                        onOpenEditor={() => {
                            openTokenEditor(token.id);
                        }}
                    />
                );
            })}
        </Group>
    );
};