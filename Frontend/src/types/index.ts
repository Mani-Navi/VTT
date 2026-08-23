import { UserRole } from "../constants/permissions";
import { GridType, ToolType, DrawShapeType, FogModeType } from "../constants/tools";
import { MeasurementType, MeasurementUnit } from "../constants/measurementTypes";

export interface User {
  id: string;
  username: string;
  email?: string;
  displayName: string;
  role: UserRole;
  avatarUrl: string;
  isGuest?: boolean;
}

export interface Room {
  id: string;
  code: string;
  name: string;
  description?: string;
  gmId: string;
  gmName?: string;
  maxPlayers: number;
  isLocked: boolean;
  password?: string;
  createdAt: string;
  updatedAt: string;
  activeSceneId?: string;
}

export interface Player {
  id: string;
  userId: string;
  username: string;
  displayName: string;
  role: UserRole;
  avatarUrl: string;
  color: string;
  isOnline: boolean;
  isSpeaking?: boolean;
  ping?: number;
}

export interface GridConfig {
  enabled: boolean;
  type: GridType;
  size: number; // pixels per cell, e.g. 70
  color: string;
  opacity: number;
  snapToGrid: boolean;
  scaleValue: number; // e.g. 5
  scaleUnit: MeasurementUnit; // e.g. "ft"
}

export type TokenHpVisibility = "all" | "owner" | "gm_only" | "none";
export type TokenHpStyle = "bar" | "bar_numbers" | "pips";

export interface Token {
  id: string;
  name: string;
  nameFa?: string;
  avatarUrl: string;
  x: number;
  y: number;
  size: number; // 1 = 1x1 cell, 2 = 2x2 cells, 3 = 3x3, etc.
  rotation: number;
  elevation: number; // height in ft/m
  hp?: number;
  maxHp?: number;
  tempHp?: number;
  showHpBar?: boolean;
  hpVisibility?: TokenHpVisibility;
  hpStyle?: TokenHpStyle;
  ac?: number;
  speed?: number;
  isHidden?: boolean; // GM hidden stealth
  isLocked?: boolean;
  conditions: string[]; // e.g. ["blinded", "poisoned", "blessed"]
  controlledBy?: string[]; // user IDs with permission
  tintColor?: string;
  notes?: string;
}

export interface DrawingShape {
  id: string;
  type: DrawShapeType;
  points: number[];
  x: number;
  y: number;
  width?: number;
  height?: number;
  radius?: number;
  stroke: string;
  strokeWidth: number;
  fill?: string;
  text?: string;
  fontSize?: number;
  isGMLayer?: boolean;
  createdBy?: string;
}

export interface FogShape {
  id: string;
  type: "rect" | "polygon" | "brush" | "circle";
  points?: number[];
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  radius?: number;
  isCover: boolean; // true = add fog, false = reveal fog
}

export interface Scene {
  id: string;
  roomId: string;
  name: string;
  nameFa?: string;
  mapUrl: string;
  mapWidth: number;
  mapHeight: number;
  grid: GridConfig;
  fogEnabled: boolean;
  fogColor: string;
  fogOpacity: number;
  tokens: Token[];
  drawings: DrawingShape[];
  fogShapes: FogShape[];
}

export interface Waypoint {
  x: number;
  y: number;
}

export interface MeasurementState {
  active: boolean;
  type: MeasurementType;
  unit: MeasurementUnit;
  scaleValue: number;
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
  waypoints: Waypoint[];
  distance: number;
}

export interface PingState {
  id: string;
  userId: string;
  userName: string;
  userColor: string;
  x: number;
  y: number;
  timestamp: number;
}

export interface LaserState {
  userId: string;
  userName: string;
  userColor: string;
  x: number;
  y: number;
  active: boolean;
}

export interface SingleDieResult {
  sides: number;
  result: number;
  dropped?: boolean;
}

export interface DiceRoll {
  id: string;
  userId: string;
  userName: string;
  userColor: string;
  formula: string;
  dice: SingleDieResult[];
  modifier: number;
  total: number;
  isCriticalHit: boolean;
  isCriticalFail: boolean;
  timestamp: string;
  label?: string;
}

export interface InitiativeItem {
  id: string;
  tokenId?: string;
  name: string;
  nameFa?: string;
  score: number;
  hp?: number;
  maxHp?: number;
  ac?: number;
  conditions: string[];
  isCurrent: boolean;
  avatarUrl?: string;
  isNpc?: boolean;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderColor: string;
  isGM?: boolean;
  content: string;
  isSecret?: boolean;
  diceRoll?: DiceRoll;
  timestamp: string;
}
