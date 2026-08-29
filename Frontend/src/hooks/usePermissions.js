import { useAuthStore } from "../store/auth.store";
import { useRoomStore } from "../store/room.store";
import { ROLES } from "../constants/permissions.js";

export function usePermissions(roomData) {
  const user = useAuthStore((state) => state.user);
  const storeRoom = useRoomStore((state) => state.currentRoom || state.room || state.activeRoom);
  const roomsList = useRoomStore((state) => state.rooms || []);

  // پیدا کردن اتاق از تمام منابع ممکن استور
  const currentRoom =
      roomData ||
      storeRoom ||
      (roomData?.id ? roomsList.find((r) => r.id === roomData.id) : null) ||
      roomsList[0] ||
      null;

  const currentUserId = String(user?.id || user?.userId || "").toLowerCase();
  const currentUsername = String(user?.username || "").toLowerCase();
  const currentUserEmail = String(user?.email || "").toLowerCase();

  // بررسی جامع نقش GM از روی انواع متغیرهای ارسالی بک‌اند
  const isOwnerByRoom = Boolean(
      currentRoom &&
      (currentRoom.is_owner === true ||
          currentRoom.isOwner === true ||
          (currentRoom.ownerUsername && String(currentRoom.ownerUsername).toLowerCase() === currentUsername) ||
          (currentRoom.ownerId && String(currentRoom.ownerId).toLowerCase() === currentUserId) ||
          (currentRoom.creatorId && String(currentRoom.creatorId).toLowerCase() === currentUserId))
  );

  const isRoleGM = Boolean(
      (currentRoom?.role && (currentRoom.role === "GM" || currentRoom.role === "ADMIN")) ||
      (user?.role && (user.role === "GM" || user.role === "ADMIN"))
  );

  // بررسی در لیست ممبرهای اتاق
  const isMemberGM = Boolean(
      currentRoom?.members?.some((m) => {
        const mUid = String(m.user?.id || m.userId || m.id || "").toLowerCase();
        const mUname = String(m.user?.username || m.username || "").toLowerCase();
        const isMe = (mUid && mUid === currentUserId) || (mUname && mUname === currentUsername);
        return isMe && (m.role === "ADMIN" || m.role === "GM");
      })
  );

  const isGM = Boolean(isOwnerByRoom || isRoleGM || isMemberGM);
  const currentRole = isGM ? ROLES.GM : ROLES.PLAYER;

  const rawPermissions = currentRoom?.permissions || {};

  const permissions = {
    canAssets: isGM ? true : Boolean(rawPermissions.canAssets),
    canText: isGM ? true : Boolean(rawPermissions.canText),
    canFog: isGM ? true : Boolean(rawPermissions.canFog),
    canDrawing: isGM ? true : Boolean(rawPermissions.canDrawing),
    canScene: isGM ? true : Boolean(rawPermissions.canScene || rawPermissions.canMap),
    canMap: isGM ? true : Boolean(rawPermissions.canMap || rawPermissions.canScene),
    canRuler: isGM ? true : (rawPermissions.canRuler !== undefined ? Boolean(rawPermissions.canRuler) : true),
    canEditToken: isGM ? true : Boolean(rawPermissions.canEditToken),
  };

  const hasPermission = (permissionKey) => {
    if (isGM) return true;
    return Boolean(permissions[permissionKey]);
  };

  // کنترل تکان دادن: GM به همه، بازیکن فقط به توکن خودش
  const canMoveToken = (controlledBy) => {
    if (isGM) return true;
    if (!user || !controlledBy) return false;
    const cb = String(controlledBy).toLowerCase();
    return cb === currentUserId || cb === currentUsername || cb === currentUserEmail;
  };

  return {
    currentRole,
    isGM,
    isPlayer: !isGM,
    permissions,
    hasPermission,
    canMoveToken,
    canEditMap: isGM || permissions.canMap,
    canManageFog: isGM || permissions.canFog,
    canDraw: isGM || permissions.canDrawing,
    canUseText: isGM || permissions.canText,
    canUseAssets: isGM || permissions.canAssets,
    canUseRuler: isGM || permissions.canRuler,
    canEditToken: isGM || permissions.canEditToken,
  };
}