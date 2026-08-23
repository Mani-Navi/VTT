import { useAuthStore } from "../store/auth.store";
import { ROLES, ROLE_PERMISSIONS, PERMISSIONS } from "../constants/permissions";

export function usePermissions() {
  const user = useAuthStore((state) => state.user);
  const currentRole = user?.role || ROLES.PLAYER;

  const permissions = ROLE_PERMISSIONS[currentRole] || [];

  const hasPermission = (permission: string) => {
    return permissions.includes(permission);
  };

  const isGM = currentRole === ROLES.GM;
  const isPlayer = currentRole === ROLES.PLAYER;
  const isSpectator = currentRole === ROLES.SPECTATOR;

  const canMoveToken = (controlledBy?: string[]) => {
    if (isGM) return true;
    if (!user) return false;
    if (controlledBy && controlledBy.includes(user.id)) return true;
    return false;
  };

  const canEditMap = isGM;
  const canManageFog = isGM;
  const canDrawGMLayer = isGM;
  const canKickPlayers = isGM;

  return {
    currentRole,
    isGM,
    isPlayer,
    isSpectator,
    hasPermission,
    canMoveToken,
    canEditMap,
    canManageFog,
    canDrawGMLayer,
    canKickPlayers,
  };
}
