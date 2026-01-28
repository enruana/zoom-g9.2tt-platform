/**
 * SessionService - Core service for Server/Client remote control
 *
 * Manages session lifecycle, state synchronization, and command routing
 * via Firebase Realtime Database.
 */

import {
  ref,
  set,
  get,
  push,
  remove,
  onValue,
  onChildAdded,
  onDisconnect,
} from 'firebase/database';
import type { Database, Unsubscribe } from 'firebase/database';

import { getRealtimeDatabase, isRealtimeDatabaseAvailable } from '../firebase/config';
import { generateSessionCode, normalizeSessionCode, validateSessionCode } from './codeGenerator';
import type {
  SessionMode,
  SessionMeta,
  SessionState,
  SessionCommand,
  SessionClient,
  CommandType,
  ActiveSessionInfo,
} from '../../types/session';
import type { Patch } from '../../types/patch';

// localStorage key for server session persistence
const SERVER_SESSION_STORAGE_KEY = 'g9tt_server_session';

interface StoredServerSession {
  sessionCode: string;
  userId: string;
  displayName: string;
  deviceName: string;
  createdAt: number;
}

function saveServerSession(session: StoredServerSession): void {
  try {
    localStorage.setItem(SERVER_SESSION_STORAGE_KEY, JSON.stringify(session));
  } catch (e) {
    console.warn('[SessionService] Failed to save server session:', e);
  }
}

function loadServerSession(): StoredServerSession | null {
  try {
    const stored = localStorage.getItem(SERVER_SESSION_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.warn('[SessionService] Failed to load server session:', e);
  }
  return null;
}

function clearServerSession(): void {
  try {
    localStorage.removeItem(SERVER_SESSION_STORAGE_KEY);
  } catch (e) {
    console.warn('[SessionService] Failed to clear server session:', e);
  }
}

/**
 * SessionService singleton for managing remote control sessions.
 */
class SessionService {
  private db: Database | null = null;
  private _mode: SessionMode = 'standalone';
  private _sessionCode: string | null = null;
  private _userId: string | null = null;

  // Firebase listeners
  private stateUnsubscribe: Unsubscribe | null = null;
  private commandsUnsubscribe: Unsubscribe | null = null;
  private clientsUnsubscribe: Unsubscribe | null = null;

  // Local listeners
  private stateListeners: Set<(state: SessionState) => void> = new Set();
  private commandListeners: Set<(command: SessionCommand) => void> = new Set();
  private clientListeners: Set<(clients: SessionClient[]) => void> = new Set();

  // Track processed commands to avoid duplicates
  private processedCommandIds: Set<string> = new Set();

  constructor() {
    this.db = getRealtimeDatabase();
  }

  // ============================================
  // Getters
  // ============================================

  get mode(): SessionMode {
    return this._mode;
  }

  get sessionCode(): string | null {
    return this._sessionCode;
  }

  get isServer(): boolean {
    return this._mode === 'server';
  }

  get isClient(): boolean {
    return this._mode === 'client';
  }

  get isInSession(): boolean {
    return this._mode !== 'standalone' && this._sessionCode !== null;
  }

  // ============================================
  // Server Mode Methods
  // ============================================

  /**
   * Create a new session as the host/server.
   * @param userId Firebase user ID of the host
   * @param displayName Display name of the host
   * @param deviceName Name of the connected MIDI device
   * @returns The generated session code
   */
  async createSession(userId: string, displayName: string, deviceName: string): Promise<string> {
    if (!this.db) {
      throw new Error('Realtime Database not available');
    }

    if (this._mode !== 'standalone') {
      throw new Error('Already in a session');
    }

    // Generate unique session code
    let sessionCode = generateSessionCode();
    let attempts = 0;
    const maxAttempts = 5;

    // Check for code collision
    while (attempts < maxAttempts) {
      const sessionRef = ref(this.db, `sessions/${sessionCode}/meta`);
      const snapshot = await get(sessionRef);

      if (!snapshot.exists()) {
        break; // Code is available
      }

      sessionCode = generateSessionCode();
      attempts++;
    }

    if (attempts >= maxAttempts) {
      throw new Error('Failed to generate unique session code');
    }

    // Create session metadata
    const meta: SessionMeta = {
      hostUserId: userId,
      hostDisplayName: displayName,
      deviceName: deviceName,
      createdAt: Date.now(),
      isActive: true,
    };

    console.log('[SessionService] Creating session with meta:', {
      sessionCode,
      userId,
      displayName,
      deviceName,
      meta,
    });

    // Write session to Firebase
    await set(ref(this.db, `sessions/${sessionCode}/meta`), meta);
    console.log('[SessionService] Session written to Firebase successfully');

    // Also store reference in user's active sessions for easy lookup
    await set(ref(this.db, `users/${userId}/activeSessions/${sessionCode}`), {
      deviceName,
      createdAt: meta.createdAt,
    });
    console.log('[SessionService] Session reference added to user activeSessions');

    // Set up presence/disconnect cleanup
    const metaRef = ref(this.db, `sessions/${sessionCode}/meta/isActive`);
    onDisconnect(metaRef).set(false);

    // Store session info
    this._mode = 'server';
    this._sessionCode = sessionCode;
    this._userId = userId;

    // Persist to localStorage for reconnection after reload
    saveServerSession({
      sessionCode,
      userId,
      displayName,
      deviceName,
      createdAt: meta.createdAt,
    });

    // Start listening for client connections and commands
    this.subscribeToClients();
    this.subscribeToCommands();

    console.log(`[SessionService] Created session: ${sessionCode}`);
    return sessionCode;
  }

  /**
   * Broadcast current state to all clients.
   * @param patches All patches (Record<number, Patch>)
   * @param currentPatchId Currently selected patch ID
   */
  async broadcastState(patches: Patch[], currentPatchId: number): Promise<void> {
    if (!this.db || !this._sessionCode || this._mode !== 'server') {
      return;
    }

    // Convert patches array to record for Firebase
    const allPatches: Record<number, Patch> = {};
    patches.forEach((patch, index) => {
      allPatches[index] = patch;
    });

    const state: SessionState = {
      currentPatchId,
      allPatches,
      lastUpdated: Date.now(),
    };

    const stateRef = ref(this.db, `sessions/${this._sessionCode}/state`);
    await set(stateRef, state);
  }

  /**
   * End the current session (server only).
   */
  async endSession(): Promise<void> {
    if (!this.db || !this._sessionCode || this._mode !== 'server') {
      return;
    }

    // Remove session from Firebase
    const sessionRef = ref(this.db, `sessions/${this._sessionCode}`);
    await remove(sessionRef);

    // Also remove from user's activeSessions
    if (this._userId) {
      const userSessionRef = ref(this.db, `users/${this._userId}/activeSessions/${this._sessionCode}`);
      await remove(userSessionRef);
    }

    // Clear persisted session
    clearServerSession();

    // Clean up
    this.cleanup();
    console.log('[SessionService] Session ended');
  }

  /**
   * Subscribe to commands from clients.
   * @param callback Function to call when a command is received
   * @returns Unsubscribe function
   */
  onCommand(callback: (command: SessionCommand) => void): () => void {
    this.commandListeners.add(callback);
    return () => {
      this.commandListeners.delete(callback);
    };
  }

  // ============================================
  // Client Mode Methods
  // ============================================

  /**
   * Join an existing session as a client.
   * @param code Session code to join
   * @param userId Firebase user ID
   * @param displayName Display name
   * @returns Session metadata
   */
  async joinSession(code: string, userId: string, displayName: string): Promise<SessionMeta> {
    if (!this.db) {
      throw new Error('Realtime Database not available');
    }

    if (this._mode !== 'standalone') {
      throw new Error('Already in a session');
    }

    const normalizedCode = normalizeSessionCode(code);

    if (!validateSessionCode(normalizedCode)) {
      throw new Error('Invalid session code format');
    }

    // Check if session exists and is active
    const metaRef = ref(this.db, `sessions/${normalizedCode}/meta`);
    const snapshot = await get(metaRef);

    if (!snapshot.exists()) {
      throw new Error('Session not found');
    }

    const meta = snapshot.val() as SessionMeta;

    if (!meta.isActive) {
      throw new Error('Session is no longer active');
    }

    // Register as client
    const clientRef = ref(this.db, `sessions/${normalizedCode}/clients/${userId}`);
    const clientData: SessionClient = {
      userId,
      displayName,
      connectedAt: Date.now(),
    };
    await set(clientRef, clientData);

    // Set up disconnect cleanup
    onDisconnect(clientRef).remove();

    // Store session info
    this._mode = 'client';
    this._sessionCode = normalizedCode;
    this._userId = userId;

    // Subscribe to state updates
    this.subscribeToState();

    console.log(`[SessionService] Joined session: ${normalizedCode}`);
    return meta;
  }

  /**
   * Send a command to the server.
   * @param type Command type
   * @param payload Command payload
   */
  async sendCommand(type: CommandType, payload: unknown): Promise<void> {
    if (!this.db || !this._sessionCode || this._mode !== 'client' || !this._userId) {
      console.warn('[SessionService] Cannot send command: not in client mode');
      return;
    }

    const command: SessionCommand = {
      type,
      payload: payload as SessionCommand['payload'],
      clientId: this._userId,
      timestamp: Date.now(),
    };

    const commandsRef = ref(this.db, `sessions/${this._sessionCode}/commands`);
    await push(commandsRef, command);
  }

  /**
   * Leave the current session (client only).
   */
  async leaveSession(): Promise<void> {
    if (!this.db || !this._sessionCode || this._mode !== 'client' || !this._userId) {
      return;
    }

    // Remove client registration
    const clientRef = ref(this.db, `sessions/${this._sessionCode}/clients/${this._userId}`);
    await remove(clientRef);

    // Clean up
    this.cleanup();
    console.log('[SessionService] Left session');
  }

  /**
   * Subscribe to state updates from server.
   * @param callback Function to call when state changes
   * @returns Unsubscribe function
   */
  onStateChange(callback: (state: SessionState) => void): () => void {
    this.stateListeners.add(callback);
    return () => {
      this.stateListeners.delete(callback);
    };
  }

  // ============================================
  // Shared Methods
  // ============================================

  /**
   * Subscribe to client list updates.
   * @param callback Function to call when client list changes
   * @returns Unsubscribe function
   */
  onClientsChange(callback: (clients: SessionClient[]) => void): () => void {
    this.clientListeners.add(callback);
    return () => {
      this.clientListeners.delete(callback);
    };
  }

  /**
   * Check if the service is available (database configured).
   */
  isAvailable(): boolean {
    return isRealtimeDatabaseAvailable();
  }

  /**
   * Reset to standalone mode (used on disconnect or error).
   */
  reset(): void {
    this.cleanup();
  }

  /**
   * Get stored server session info (if any).
   * Used to check if we should try to resume a session.
   */
  getStoredServerSession(): StoredServerSession | null {
    return loadServerSession();
  }

  /**
   * Resume an existing server session after page reload.
   * Verifies the session still exists and is active in Firebase.
   * @param userId Current user ID (must match stored session)
   * @returns Session metadata if resumed successfully
   */
  async resumeServerSession(userId: string): Promise<SessionMeta | null> {
    if (!this.db) {
      throw new Error('Realtime Database not available');
    }

    if (this._mode !== 'standalone') {
      throw new Error('Already in a session');
    }

    const stored = loadServerSession();
    if (!stored) {
      return null;
    }

    // Verify the user ID matches
    if (stored.userId !== userId) {
      console.warn('[SessionService] Stored session belongs to different user');
      clearServerSession();
      return null;
    }

    // Check if session still exists and is active in Firebase
    const metaRef = ref(this.db, `sessions/${stored.sessionCode}/meta`);
    const snapshot = await get(metaRef);

    if (!snapshot.exists()) {
      console.warn('[SessionService] Stored session no longer exists');
      clearServerSession();
      return null;
    }

    const meta = snapshot.val() as SessionMeta;

    // Verify we are still the host
    if (meta.hostUserId !== userId) {
      console.warn('[SessionService] Session host mismatch');
      clearServerSession();
      return null;
    }

    // Re-activate the session if it was marked inactive
    if (!meta.isActive) {
      await set(ref(this.db, `sessions/${stored.sessionCode}/meta/isActive`), true);
      meta.isActive = true;
    }

    // Ensure user's activeSessions reference exists
    await set(ref(this.db, `users/${userId}/activeSessions/${stored.sessionCode}`), {
      deviceName: stored.deviceName,
      createdAt: stored.createdAt,
    });

    // Set up presence/disconnect cleanup again
    const activeRef = ref(this.db, `sessions/${stored.sessionCode}/meta/isActive`);
    onDisconnect(activeRef).set(false);

    // Restore session state
    this._mode = 'server';
    this._sessionCode = stored.sessionCode;
    this._userId = userId;

    // Start listening for client connections and commands
    this.subscribeToClients();
    this.subscribeToCommands();

    console.log(`[SessionService] Resumed session: ${stored.sessionCode}`);
    return meta;
  }

  /**
   * Clear stored server session without ending it in Firebase.
   * Used when explicitly logging out or switching modes.
   */
  clearStoredSession(): void {
    clearServerSession();
  }

  /**
   * Get all active sessions owned by a user.
   * Scans all sessions and filters by hostUserId.
   * @param userId Firebase user ID
   * @returns Array of active sessions with their codes and metadata
   */
  async getActiveSessionsForUser(userId: string): Promise<ActiveSessionInfo[]> {
    console.log('[SessionService] getActiveSessionsForUser called with userId:', userId);

    if (!this.db) {
      console.warn('[SessionService] Database not available');
      return [];
    }

    try {
      // First, get the user's active session codes from their own path
      const userSessionsRef = ref(this.db, `users/${userId}/activeSessions`);
      console.log('[SessionService] Fetching user activeSessions from:', `users/${userId}/activeSessions`);
      const userSessionsSnapshot = await get(userSessionsRef);

      if (!userSessionsSnapshot.exists()) {
        console.log('[SessionService] No active sessions found for user');
        return [];
      }

      const sessionCodes: string[] = [];
      userSessionsSnapshot.forEach((child) => {
        if (child.key) {
          sessionCodes.push(child.key);
        }
      });

      console.log('[SessionService] Found session codes:', sessionCodes);

      // Now fetch each session's details
      const activeSessions: ActiveSessionInfo[] = [];

      for (const sessionCode of sessionCodes) {
        try {
          const sessionRef = ref(this.db, `sessions/${sessionCode}`);
          const sessionSnapshot = await get(sessionRef);

          if (!sessionSnapshot.exists()) {
            console.log(`[SessionService] Session ${sessionCode} no longer exists, cleaning up`);
            // Clean up stale reference
            await remove(ref(this.db, `users/${userId}/activeSessions/${sessionCode}`));
            continue;
          }

          const sessionData = sessionSnapshot.val();
          const meta = sessionData?.meta as SessionMeta | undefined;

          if (!meta) {
            console.log(`[SessionService] Session ${sessionCode} has no meta, skipping`);
            continue;
          }

          console.log(`[SessionService] Session ${sessionCode} meta:`, {
            hostUserId: meta.hostUserId,
            isActive: meta.isActive,
          });

          // Only include if still active
          if (meta.isActive) {
            const clients = sessionData.clients || {};
            const clientCount = Object.keys(clients).length;

            activeSessions.push({
              sessionCode,
              meta,
              clientCount,
            });
            console.log(`[SessionService] Added session ${sessionCode} to active sessions`);
          } else {
            console.log(`[SessionService] Session ${sessionCode} is not active, cleaning up`);
            // Clean up inactive session reference
            await remove(ref(this.db, `users/${userId}/activeSessions/${sessionCode}`));
          }
        } catch (error) {
          console.warn(`[SessionService] Failed to fetch session ${sessionCode}:`, error);
        }
      }

      // Sort by creation date (newest first)
      activeSessions.sort((a, b) => b.meta.createdAt - a.meta.createdAt);

      console.log(`[SessionService] Found ${activeSessions.length} active sessions for user ${userId}`);
      return activeSessions;
    } catch (error) {
      console.error('[SessionService] Failed to fetch active sessions:', error);
      return [];
    }
  }

  // ============================================
  // Private Methods
  // ============================================

  private subscribeToState(): void {
    if (!this.db || !this._sessionCode) return;

    const stateRef = ref(this.db, `sessions/${this._sessionCode}/state`);

    this.stateUnsubscribe = onValue(stateRef, (snapshot) => {
      if (snapshot.exists()) {
        const state = snapshot.val() as SessionState;
        this.stateListeners.forEach((listener) => listener(state));
      }
    });
  }

  private subscribeToCommands(): void {
    if (!this.db || !this._sessionCode) return;

    const commandsRef = ref(this.db, `sessions/${this._sessionCode}/commands`);

    // Listen for new commands
    this.commandsUnsubscribe = onChildAdded(commandsRef, (snapshot) => {
      const commandId = snapshot.key;
      if (!commandId || this.processedCommandIds.has(commandId)) return;

      const command = snapshot.val() as SessionCommand;
      this.processedCommandIds.add(commandId);

      // Notify listeners
      this.commandListeners.forEach((listener) => listener(command));

      // Remove processed command from Firebase
      remove(snapshot.ref);
    });
  }

  private subscribeToClients(): void {
    if (!this.db || !this._sessionCode) return;

    const clientsRef = ref(this.db, `sessions/${this._sessionCode}/clients`);

    this.clientsUnsubscribe = onValue(clientsRef, (snapshot) => {
      const clients: SessionClient[] = [];

      if (snapshot.exists()) {
        snapshot.forEach((child) => {
          clients.push(child.val() as SessionClient);
        });
      }

      this.clientListeners.forEach((listener) => listener(clients));
    });
  }

  private cleanup(): void {
    // Unsubscribe from Firebase listeners
    if (this.stateUnsubscribe) {
      this.stateUnsubscribe();
      this.stateUnsubscribe = null;
    }

    if (this.commandsUnsubscribe) {
      this.commandsUnsubscribe();
      this.commandsUnsubscribe = null;
    }

    if (this.clientsUnsubscribe) {
      this.clientsUnsubscribe();
      this.clientsUnsubscribe = null;
    }

    // Clear local state
    this._mode = 'standalone';
    this._sessionCode = null;
    this._userId = null;
    this.processedCommandIds.clear();
  }
}

// Export singleton instance
export const sessionService = new SessionService();
