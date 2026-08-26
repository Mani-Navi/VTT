import { useAuthStore } from "../store/auth.store";
import { ROLES, PERMISSIONS } from "../constants/permissions.js";

export function usePermissions(roomData) {
  const user = useAuthStore((state) => state.user);

  // تشخیص قطعی نقش GM بر اساس فیلدهای دریافتی از سرور
  const isGM = Boolean(
      roomData?.is_owner === true ||
      roomData?.isOwner === true ||
      roomData?.role === "GM" ||
      (user?.username && roomData?.ownerUsername && user.username === roomData.ownerUsername)
  );

  const currentRole = isGM ? ROLES.GM : ROLES.PLAYER;

  // دسترسی‌های فعال کاربر جاری
  const rawPermissions = roomData?.permissions || {};

  const permissions = {
    canAssets: isGM ? true : Boolean(rawPermissions.canAssets),
    canText: isGM ? true : Boolean(rawPermissions.canText),
    canFog: isGM ? true : Boolean(rawPermissions.canFog),
    canDrawing: isGM ? true : Boolean(rawPermissions.canDrawing),
    canScene: isGM ? true : Boolean(rawPermissions.canScene || rawPermissions.canMap),
    canMap: isGM ? true : Boolean(rawPermissions.canMap || rawPermissions.canScene),
    canRuler: isGM ? true : (rawPermissions.canRuler !== undefined ? Boolean(rawPermissions.canRuler) : true),
  };

  const hasPermission = (permissionKey) => {
    if (isGM) return true;
    return Boolean(permissions[permissionKey]);
  };

  // کنترل جابجایی توکن: GM به همه توکن‌ها دسترسی دارد، بازیکن فقط به توکن منتسب به خودش
  const canMoveToken = (controlledBy) => {
    if (isGM) return true;
    if (!user) return false;
    if (Array.isArray(controlledBy)) {
      return controlledBy.includes(user.id) || controlledBy.includes(user.username);
    }
    return controlledBy === user.id || controlledBy === user.username;
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
  };
}