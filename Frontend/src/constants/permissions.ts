export const ROLES = {
  GM: "GM",
  PLAYER: "PLAYER",
  SPECTATOR: "SPECTATOR",
} as const;

export type UserRole = (typeof ROLES)[keyof typeof ROLES];

export const PERMISSIONS = {
  CAN_MOVE_ALL_TOKENS: "can_move_all_tokens",
  CAN_EDIT_MAP: "can_edit_map",
  CAN_EDIT_GRID: "can_edit_grid",
  CAN_MANAGE_FOG: "can_manage_fog",
  CAN_DRAW_GM_LAYER: "can_draw_gm_layer",
  CAN_PING: "can_ping",
  CAN_ROLL_DICE: "can_roll_dice",
  CAN_MANAGE_INITIATIVE: "can_manage_initiative",
  CAN_KICK_PLAYERS: "can_kick_players",
} as const;

export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  [ROLES.GM]: [
    PERMISSIONS.CAN_MOVE_ALL_TOKENS,
    PERMISSIONS.CAN_EDIT_MAP,
    PERMISSIONS.CAN_EDIT_GRID,
    PERMISSIONS.CAN_MANAGE_FOG,
    PERMISSIONS.CAN_DRAW_GM_LAYER,
    PERMISSIONS.CAN_PING,
    PERMISSIONS.CAN_ROLL_DICE,
    PERMISSIONS.CAN_MANAGE_INITIATIVE,
    PERMISSIONS.CAN_KICK_PLAYERS,
  ],
  [ROLES.PLAYER]: [
    PERMISSIONS.CAN_PING,
    PERMISSIONS.CAN_ROLL_DICE,
  ],
  [ROLES.SPECTATOR]: [
    PERMISSIONS.CAN_ROLL_DICE,
  ],
};
