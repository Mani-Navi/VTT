import { useAuthStore } from "../store/auth.store";
import { ROLES, ROLE_PERMISSIONS } from "../constants/permissions.js";

export function usePermissions(roomData) {
  const user = useAuthStore((state) => state.user);

  // تشخیص GM بودن بر اساس سازنده اتاق یا فیلد نقش دریافتی از سرور
  const isGM =
      roomData?.role === "GM" ||
      roomData?.ownerUsername === user?.username ||
      user?.role === (ROLES?.GM || "GM");

  const currentRole = isGM ? (ROLES?.GM || "GM") : (ROLES?.PLAYER || "PLAYER");
  const permissions = ROLE_PERMISSIONS ? ROLE_PERMISSIONS[currentRole] || [] : [];

  const hasPermission = (permission) => {
    if (isGM) return true;
    return permissions.includes(permission);
  };

  const canMoveToken = (controlledBy) => {
    if (isGM) return true;
    if (!user) return false;
    if (Array.isArray(controlledBy) && controlledBy.includes(user.id)) return true;
    return false;
  };

  const canEditMap = isGM;
  const canManageFog = isGM;
  const canDrawGMLayer = isGM;
  const canKickPlayers = isGM;

  return {
    currentRole,
    isGM,
    isPlayer: !isGM,
    hasPermission,
    canMoveToken,
    canEditMap,
    canManageFog,
    canDrawGMLayer,
    canKickPlayers,
  };
}