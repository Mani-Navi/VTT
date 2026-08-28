import { useAuthStore } from "../store/auth.store";
import { useRoomStore } from "../store/room.store";
import { ROLES } from "../constants/permissions.js";

export function usePermissions(roomData) {
  const user = useAuthStore((state) => state.user);
  const currentRoom = useRoomStore((state) => state.rooms?.find((r) => r.id === roomData?.id)) || roomData;

  const isGM = Boolean(
      currentRoom?.is_owner === true ||
      currentRoom?.isOwner === true ||
      currentRoom?.role === "GM" ||
      (user?.username && currentRoom?.ownerUsername && user.username === currentRoom.ownerUsername) ||
      user?.role === "GM" ||
      user?.role === "ADMIN"
  );

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
    return String(controlledBy) === String(user.id) || String(controlledBy) === String(user.username);
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