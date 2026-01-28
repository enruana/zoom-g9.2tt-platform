/**
 * Session types for Server/Client remote control architecture
 */

import type { Patch } from './patch';

/** User's operating mode */
export type SessionMode = 'standalone' | 'server' | 'client';

/** Session metadata stored in Firebase */
export interface SessionMeta {
  hostUserId: string;
  hostDisplayName: string;
  deviceName: string;
  createdAt: number;
  isActive: boolean;
}

/** Command types that can be sent from client to server */
export type CommandType =
  | 'paramChange'
  | 'patchSelect'
  | 'moduleToggle'
  | 'typeChange'
  | 'liveModeToggle';

/** Command from client to server */
export interface SessionCommand {
  type: CommandType;
  payload: ParameterChangePayload | PatchSelectPayload | ModuleTogglePayload | TypeChangePayload | LiveModeTogglePayload;
  clientId: string;
  timestamp: number;
}

/** Payload for parameter change command */
export interface ParameterChangePayload {
  moduleKey: string;
  paramIndex: number;
  midiParamId: number;
  value: number;
}

/** Payload for patch selection command */
export interface PatchSelectPayload {
  patchId: number;
}

/** Payload for module toggle command */
export interface ModuleTogglePayload {
  moduleKey: string;
  enabled: boolean;
}

/** Payload for module type change command */
export interface TypeChangePayload {
  moduleKey: string;
  typeId: number;
}

/** Payload for live mode toggle command */
export interface LiveModeTogglePayload {
  enabled: boolean;
}

/** Connected client info */
export interface SessionClient {
  userId: string;
  displayName: string;
  connectedAt: number;
}

/** Session state broadcast from server to clients */
export interface SessionState {
  currentPatchId: number;
  allPatches: Record<number, Patch>;
  lastUpdated: number;
  isLiveMode: boolean;
}

/** Session context state for React */
export interface SessionContextState {
  mode: SessionMode;
  sessionCode: string | null;
  sessionMeta: SessionMeta | null;
  clients: SessionClient[];
  isJoining: boolean;
  isCreating: boolean;
  error: string | null;
  mySessions: ActiveSessionInfo[];
  isLoadingMySessions: boolean;
  /** Server's live mode state - synced to all clients */
  serverLiveMode: boolean;
}

/** Session context actions */
export interface SessionActions {
  createSession: () => Promise<string>;
  joinSession: (code: string) => Promise<void>;
  leaveSession: () => Promise<void>;
  endSession: () => Promise<void>;
  sendCommand: (command: Omit<SessionCommand, 'clientId' | 'timestamp'>) => Promise<void>;
  clearError: () => void;
  fetchMySessions: () => Promise<void>;
  /** Update server's live mode state (server only - broadcasts to clients) */
  setServerLiveMode: (isLive: boolean) => void;
}

/** Active session info for displaying user's sessions */
export interface ActiveSessionInfo {
  sessionCode: string;
  meta: SessionMeta;
  clientCount: number;
}
