import { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useDevice, getStoredDeviceInfo, clearStoredDeviceInfo } from '../contexts/DeviceContext';
import { usePatch } from '../contexts/PatchContext';
import { useHistory } from '../contexts/HistoryContext';
import { useSync } from '../contexts/SyncContext';
import { useAuth } from '../contexts/AuthContext';
import { useSession } from '../contexts/SessionContext';
import { demoDataSource } from '../services/data/DemoDataSource';
import { midiService } from '../services/midi/MidiService';
import { toast } from '../components/common/Toast';
import { SessionBadge, ClientBadge, CreateSessionDialog } from '../components/session';
import { Pedalboard } from '../components/pedalboard/Pedalboard';
import { ModulePanel } from '../components/pedalboard/ModulePanel';
import { ParameterModal } from '../components/parameter/ParameterModal';
import { TypeSelector } from '../components/parameter/TypeSelector';
import { SaveConfirmDialog } from '../components/dialogs/SaveConfirmDialog';
import { DuplicatePatchDialog } from '../components/dialogs/DuplicatePatchDialog';
import { RenamePatchDialog } from '../components/dialogs/RenamePatchDialog';
import { BulkSendDialog } from '../components/dialogs/BulkSendDialog';
import { UserMenu } from '../components/common/UserMenu';
import { SyncStatus } from '../components/common/SyncStatus';
import { getEditableParameters } from '../data/parameterMaps';
import { MODULE_INFO, hasMultipleTypes } from '../data/effectTypes';
import { MODULE_COLORS } from '../data/moduleColors';
import { Button, IconButton, ToggleButton } from '../components/common/Button';
import type { ModuleName } from '../types/patch';

// localStorage key for Online Mode persistence
const ONLINE_MODE_STORAGE_KEY = 'g9tt_online_mode';

function loadOnlineModePreference(): boolean {
  try {
    return localStorage.getItem(ONLINE_MODE_STORAGE_KEY) === 'true';
  } catch {
    return false;
  }
}

function saveOnlineModePreference(enabled: boolean): void {
  try {
    localStorage.setItem(ONLINE_MODE_STORAGE_KEY, enabled ? 'true' : 'false');
  } catch {
    // Ignore storage errors
  }
}

export function Editor() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const midiDeviceIdFromUrl = searchParams.get('midi');
  const sessionCodeFromUrl = searchParams.get('session');
  const { state: authState } = useAuth();
  const { state: deviceState, actions: deviceActions } = useDevice();
  const { state: patchState, currentPatch, actions: patchActions } = usePatch();
  const { state: sessionState, actions: sessionActions } = useSession();
  const { actions: historyActions, canUndo, canRedo, hasUnsavedChanges } = useHistory();
  const { actions: syncActions } = useSync();
  const [selectedModule, setSelectedModule] = useState<ModuleName | null>(null);
  const [selectedParamIndex, setSelectedParamIndex] = useState<number | null>(null);
  const [showTypeSelector, setShowTypeSelector] = useState(false);
  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showDuplicateDialog, setShowDuplicateDialog] = useState(false);
  const [isDuplicating, setIsDuplicating] = useState(false);
  const [showRenameDialog, setShowRenameDialog] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [isOnlineMode, setIsOnlineMode] = useState(false);
  const shouldAutoEnableOnlineMode = useRef(loadOnlineModePreference());
  const [showSyncMenu, setShowSyncMenu] = useState(false);
  const [isSyncingFromPedal, setIsSyncingFromPedal] = useState(false);
  const [isSyncingToPedal, setIsSyncingToPedal] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0);
  const [showBulkSendDialog, setShowBulkSendDialog] = useState(false);
  const lastProgressUpdateRef = useRef(0);
  const pendingNavigationRef = useRef<string | null>(null);

  const isDemo = deviceState.status === 'demo';
  const isConnected = deviceState.status === 'connected';
  const [showCreateSessionDialog, setShowCreateSessionDialog] = useState(false);

  // Session mode helpers
  const isServer = sessionState.mode === 'server';
  const isClient = sessionState.mode === 'client';
  const isInSession = isServer || isClient;

  const handleModuleSelect = useCallback((moduleKey: ModuleName) => {
    setSelectedModule(prev => prev === moduleKey ? null : moduleKey);
  }, []);

  // Redirect to splash if:
  // - User is not authenticated
  // - No patches loaded AND device is disconnected/error AND not joining/in a session
  useEffect(() => {
    // Wait for auth to finish loading
    if (authState.isLoading) return;

    // Not authenticated → go to splash
    if (!authState.user) {
      navigate('/');
      return;
    }

    // If we have patches (from localStorage), stay in editor even if disconnected
    if (patchState.patches.length > 0) {
      return;
    }

    // If we're in a session (client or server), don't redirect
    if (isInSession) {
      return;
    }

    // If we're trying to join a session (URL has session code), don't redirect
    if (sessionCodeFromUrl) {
      return;
    }

    // If we're in the process of joining a session, don't redirect
    if (sessionState.isJoining) {
      return;
    }

    // No patches and device is disconnected/error → go to splash
    if (deviceState.status === 'disconnected' || deviceState.status === 'error') {
      navigate('/');
    }
  }, [authState.isLoading, authState.user, deviceState.status, patchState.patches.length, navigate, isInSession, sessionCodeFromUrl, sessionState.isJoining]);

  // Auto-reconnect to MIDI device using URL param or stored device info
  const [isReconnecting, setIsReconnecting] = useState(false);
  const reconnectAttemptedRef = useRef(false);

  useEffect(() => {
    // Only attempt reconnection if:
    // - Device is disconnected (not demo, not connecting, not connected)
    // - We're not already reconnecting
    // - User is authenticated
    // - We haven't already attempted (to avoid infinite loops)
    if (deviceState.status !== 'disconnected') return;
    if (isReconnecting) return;
    if (!authState.user) return;
    if (reconnectAttemptedRef.current) return;

    // Need either URL param or stored device info
    const storedDevice = getStoredDeviceInfo();
    if (!midiDeviceIdFromUrl && !storedDevice) return;

    // Attempt auto-reconnection
    async function attemptReconnect() {
      reconnectAttemptedRef.current = true;
      setIsReconnecting(true);
      console.log('[Editor] Attempting auto-reconnect, URL param:', midiDeviceIdFromUrl);

      try {
        // Request MIDI access
        await midiService.requestAccess();
        const availableDevices = midiService.getDevices();

        let matchingDevice = null;

        // First, try to find by URL param ID
        if (midiDeviceIdFromUrl) {
          matchingDevice = availableDevices.find(d => d.id === midiDeviceIdFromUrl);
          if (matchingDevice) {
            console.log('[Editor] Found device by URL param ID:', matchingDevice.id);
          }
        }

        // If not found by ID, try by stored device name
        if (!matchingDevice && storedDevice) {
          matchingDevice = availableDevices.find(d => d.name === storedDevice.deviceName);
          if (matchingDevice) {
            console.log('[Editor] Found device by stored name:', matchingDevice.name);
          }
        }

        if (!matchingDevice) {
          console.warn('[Editor] Device not found');
          throw new Error('MIDI device not found');
        }

        // Connect using the device ID
        await midiService.connect(matchingDevice.id);

        // Verify it's a G9.2tt
        const identity = await midiService.identify();
        if (!identity?.isG9TT) {
          throw new Error('Device is not a Zoom G9.2tt');
        }

        // Success! Update device context
        deviceActions.setConnected(
          matchingDevice.id,
          matchingDevice.name,
          identity.manufacturerName,
          `G9.2tt v${identity.version.join('.')}`
        );

        // Auto-enable Online Mode if it was enabled before disconnect
        if (shouldAutoEnableOnlineMode.current) {
          console.log('[Editor] Auto-enabling Online Mode after reconnect');
          try {
            await midiService.enterEditMode();
            if (patchState.selectedPatchId !== null) {
              midiService.sendPatchChange(patchState.selectedPatchId);
            }
            setIsOnlineMode(true);
            toast.success(`Reconnected to ${matchingDevice.name} (Live Mode)`);
          } catch (err) {
            console.warn('[Editor] Failed to auto-enable Online Mode:', err);
            toast.success(`Reconnected to ${matchingDevice.name}`);
          }
        } else {
          toast.success(`Reconnected to ${matchingDevice.name}`);
        }
      } catch (error) {
        console.warn('[Editor] Auto-reconnect failed:', error);
        // Clear stored device so we don't keep trying
        clearStoredDeviceInfo();
        // Show info toast (not error - user can still work offline)
        toast.info('Working offline - connect pedal to sync');
      } finally {
        setIsReconnecting(false);
      }
    }

    attemptReconnect();
  }, [deviceState.status, isReconnecting, authState.user, deviceActions, midiDeviceIdFromUrl, patchState.selectedPatchId]);

  useEffect(() => {
    if (deviceState.status !== 'connected') return;

    const unsubscribe = midiService.onDisconnect(() => {
      toast.error('Device disconnected unexpectedly');
      deviceActions.disconnect();
      // Don't clear patches or navigate - let user work offline
      // patchActions.clearPatches();
      // navigate('/');
    });

    return unsubscribe;
  }, [deviceState.status, deviceActions]);

  // Auto-join session from URL query param
  const sessionJoinAttemptedRef = useRef(false);
  useEffect(() => {
    // Only attempt if:
    // - We have a session code in URL
    // - User is authenticated
    // - Not already in a session
    // - Haven't already attempted
    if (!sessionCodeFromUrl) return;
    if (!authState.user) return;
    if (sessionState.mode !== 'standalone') return;
    if (sessionJoinAttemptedRef.current) return;
    if (sessionState.isJoining) return;

    // Capture the code so TypeScript knows it's not null inside async function
    const code = sessionCodeFromUrl;
    sessionJoinAttemptedRef.current = true;

    async function attemptJoinSession() {
      console.log('[Editor] Attempting auto-join session:', code);
      try {
        await sessionActions.joinSession(code);
        toast.success(`Joined session ${code}`);
      } catch (error) {
        console.warn('[Editor] Auto-join session failed:', error);
        toast.error('Failed to join session');
        // Remove the session param from URL since it failed
        setSearchParams((prev) => {
          prev.delete('session');
          return prev;
        });
      }
    }

    attemptJoinSession();
  }, [sessionCodeFromUrl, authState.user, sessionState.mode, sessionState.isJoining, sessionActions, setSearchParams]);

  // Sync URL with session state
  // - Add session param when we join a session
  // - Remove session param only when we explicitly leave (handled in handleLeaveSession)
  useEffect(() => {
    if (isClient && sessionState.sessionCode) {
      // Add session param to URL if not already there
      if (searchParams.get('session') !== sessionState.sessionCode) {
        setSearchParams((prev) => {
          prev.set('session', sessionState.sessionCode!);
          // Remove midi param since we're in client mode
          prev.delete('midi');
          return prev;
        }, { replace: true });
      }
    }
  }, [isClient, sessionState.sessionCode, searchParams, setSearchParams]);

  useEffect(() => {
    async function loadPatches() {
      patchActions.setLoading(true, 0);
      try {
        let allPatches;

        if (isDemo) {
          allPatches = await demoDataSource.readAllPatches();
        } else if (deviceState.status === 'connected') {
          allPatches = await midiService.readAllPatches((progress) => {
            patchActions.setLoading(true, progress);
          });
        }

        if (allPatches && allPatches.length > 0) {
          patchActions.setPatches(allPatches);
          patchActions.selectPatch(0);
        }
      } catch (error) {
        console.error('Failed to load patches:', error);
        patchActions.setError('Failed to load patches');
      }
    }

    if ((deviceState.status === 'demo' || deviceState.status === 'connected') &&
        patchState.patches.length === 0) {
      loadPatches();
    }
  }, [deviceState.status, isDemo, patchState.patches.length, patchActions]);

  const handlePatchSelect = useCallback((id: number) => {
    // Client mode with online: Send command to server
    if (isClient && isOnlineMode) {
      sessionActions.sendCommand({
        type: 'patchSelect',
        payload: { patchId: id },
      });
      return;
    }

    // Client offline, Server, or Standalone mode: Update local state
    patchActions.selectPatch(id);
    if (isOnlineMode && isConnected && !isClient) {
      midiService.sendPatchChange(id);
    }
  }, [patchActions, isOnlineMode, isConnected, isClient, sessionActions]);

  useEffect(() => {
    historyActions.setCurrentPatch(patchState.selectedPatchId);
  }, [patchState.selectedPatchId, historyActions]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (patchState.patches.length === 0) return;

    const currentId = patchState.selectedPatchId ?? 0;
    let newId: number | null = null;

    switch (e.key) {
      case 'ArrowUp':
      case 'k':
        e.preventDefault();
        newId = Math.max(0, currentId - 1);
        break;
      case 'ArrowDown':
      case 'j':
        e.preventDefault();
        newId = Math.min(99, currentId + 1);
        break;
      case 'Home':
        e.preventDefault();
        newId = 0;
        break;
      case 'End':
        e.preventDefault();
        newId = 99;
        break;
      case 'PageUp':
        e.preventDefault();
        newId = Math.max(0, currentId - 10);
        break;
      case 'PageDown':
        e.preventDefault();
        newId = Math.min(99, currentId + 10);
        break;
    }

    if (newId !== null && newId !== currentId) {
      patchActions.selectPatch(newId);
    }
  };

  const selectedModuleState = currentPatch && selectedModule
    ? currentPatch.modules[selectedModule]
    : null;

  const handleClosePanel = useCallback(() => {
    setSelectedModule(null);
    setSelectedParamIndex(null);
  }, []);

  const handleParameterClick = useCallback((paramIndex: number) => {
    setSelectedParamIndex(paramIndex);
  }, []);

  const handleCloseParamModal = useCallback(() => {
    setSelectedParamIndex(null);
  }, []);

  const selectedParamDef = useMemo(() => {
    if (!selectedModule || !selectedModuleState || selectedParamIndex === null) {
      return null;
    }
    const params = getEditableParameters(selectedModule, selectedModuleState.type);
    return params[selectedParamIndex] ?? null;
  }, [selectedModule, selectedModuleState, selectedParamIndex]);

  const selectedParamValue = useMemo(() => {
    if (!selectedModuleState || selectedParamIndex === null || !selectedParamDef) {
      return 0;
    }
    return selectedModuleState.params[selectedParamIndex] ?? selectedParamDef.defaultValue ?? selectedParamDef.min;
  }, [selectedModuleState, selectedParamIndex, selectedParamDef]);

  const oldValueRef = useRef<number | null>(null);

  useEffect(() => {
    if (selectedParamIndex !== null && selectedModuleState) {
      oldValueRef.current = selectedModuleState.params[selectedParamIndex] ?? 0;
    } else {
      oldValueRef.current = null;
    }
  }, [selectedParamIndex, selectedModuleState]);

  const handleParameterChange = useCallback((newValue: number) => {
    if (!selectedModule || selectedParamIndex === null || !selectedParamDef || patchState.selectedPatchId === null) return;

    const oldValue = oldValueRef.current ?? 0;

    if (oldValue !== newValue) {
      historyActions.pushChange({
        patchId: patchState.selectedPatchId,
        module: selectedModule,
        paramIndex: selectedParamIndex,
        midiParamId: selectedParamDef.id,
        oldValue,
        newValue,
      });
      oldValueRef.current = newValue;
    }

    // Client mode with online: Send command to server via session
    if (isClient && isOnlineMode) {
      sessionActions.sendCommand({
        type: 'paramChange',
        payload: {
          moduleKey: selectedModule,
          paramIndex: selectedParamIndex,
          midiParamId: selectedParamDef.id,
          value: newValue,
        },
      });
      return;
    }

    // Client offline, Server, or Standalone mode: Update locally
    patchActions.updateParameter(selectedModule, selectedParamIndex, newValue);

    if (isOnlineMode && isConnected && !isClient) {
      midiService.sendParameter(selectedModule, selectedParamDef.id, newValue);
    }
  }, [selectedModule, selectedParamIndex, selectedParamDef, patchState.selectedPatchId, patchActions, isOnlineMode, isConnected, historyActions, isClient, sessionActions]);

  const handleToggleEnabled = useCallback(() => {
    if (!selectedModule || !selectedModuleState) return;

    const newEnabled = !selectedModuleState.enabled;

    // Client mode with online: Send command to server
    if (isClient && isOnlineMode) {
      sessionActions.sendCommand({
        type: 'moduleToggle',
        payload: { moduleKey: selectedModule, enabled: newEnabled },
      });
      return;
    }

    // Client offline, Server, or Standalone mode
    patchActions.toggleModuleEnabled(selectedModule);
    if (isOnlineMode && isConnected && !isClient) {
      midiService.sendModuleToggle(selectedModule, newEnabled);
    }
  }, [selectedModule, selectedModuleState, patchActions, isOnlineMode, isConnected, isClient, sessionActions]);

  const handleModuleToggle = useCallback((moduleKey: ModuleName, enabled: boolean) => {
    if (!currentPatch) return;

    // Client mode with online: Send command to server
    if (isClient && isOnlineMode) {
      sessionActions.sendCommand({
        type: 'moduleToggle',
        payload: { moduleKey, enabled },
      });
      return;
    }

    // Client offline, Server, or Standalone mode
    patchActions.setModuleEnabled(moduleKey, enabled);
    if (isOnlineMode && isConnected && !isClient) {
      midiService.sendModuleToggle(moduleKey, enabled);
    }
  }, [currentPatch, patchActions, isOnlineMode, isConnected, isClient, sessionActions]);

  const handleTypeSelect = useCallback(() => {
    if (!selectedModule || !hasMultipleTypes(selectedModule)) return;
    setShowTypeSelector(true);
  }, [selectedModule]);

  const handleCloseTypeSelector = useCallback(() => {
    setShowTypeSelector(false);
  }, []);

  const handleTypeChange = useCallback((typeId: number) => {
    if (!selectedModule) return;

    // Client mode with online: Send command to server
    if (isClient && isOnlineMode) {
      sessionActions.sendCommand({
        type: 'typeChange',
        payload: { moduleKey: selectedModule, typeId },
      });
      return;
    }

    // Client offline, Server, or Standalone mode
    patchActions.updateModuleType(selectedModule, typeId);
    if (isOnlineMode && isConnected && !isClient) {
      midiService.sendModuleType(selectedModule, typeId);
    }
  }, [selectedModule, patchActions, isOnlineMode, isConnected, isClient, sessionActions]);

  const handleUndo = useCallback(() => {
    const entry = historyActions.undo();
    if (!entry) return;
    patchActions.updateParameter(entry.module, entry.paramIndex, entry.oldValue);
    if (isOnlineMode && isConnected) {
      midiService.sendParameter(entry.module, entry.midiParamId, entry.oldValue);
    }
  }, [historyActions, patchActions, isOnlineMode, isConnected]);

  const handleRedo = useCallback(() => {
    const entry = historyActions.redo();
    if (!entry) return;
    patchActions.updateParameter(entry.module, entry.paramIndex, entry.newValue);
    if (isOnlineMode && isConnected) {
      midiService.sendParameter(entry.module, entry.midiParamId, entry.newValue);
    }
  }, [historyActions, patchActions, isOnlineMode, isConnected]);

  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
        return;
      }
      if ((e.ctrlKey && e.key === 'y') || (e.metaKey && e.shiftKey && e.key === 'z')) {
        e.preventDefault();
        handleRedo();
        return;
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [handleUndo, handleRedo]);

  const handleDisconnectWithCheck = useCallback(() => {
    if (hasUnsavedChanges) {
      pendingNavigationRef.current = '/';
      setShowUnsavedDialog(true);
    } else {
      // Clear stored device to prevent auto-reconnect
      clearStoredDeviceInfo();
      deviceActions.disconnect();
      patchActions.clearPatches();
      historyActions.clearHistory();
      navigate('/');
    }
  }, [hasUnsavedChanges, deviceActions, patchActions, historyActions, navigate]);

  const handleDiscardChanges = useCallback(() => {
    setShowUnsavedDialog(false);
    historyActions.clearHistory();
    // Clear stored device to prevent auto-reconnect
    clearStoredDeviceInfo();
    deviceActions.disconnect();
    patchActions.clearPatches();
    if (pendingNavigationRef.current) {
      navigate(pendingNavigationRef.current);
      pendingNavigationRef.current = null;
    }
  }, [historyActions, deviceActions, patchActions, navigate]);

  // Handle leaving a client session
  const handleLeaveSession = useCallback(async () => {
    await sessionActions.leaveSession();
    // Clear the session param from URL
    setSearchParams((prev) => {
      prev.delete('session');
      return prev;
    }, { replace: true });
    // Clear patches since they came from the session
    patchActions.clearPatches();
    // Navigate to splash
    navigate('/');
  }, [sessionActions, setSearchParams, patchActions, navigate]);

  const handleCancelNavigation = useCallback(() => {
    setShowUnsavedDialog(false);
    pendingNavigationRef.current = null;
  }, []);

  const handleSaveClick = useCallback(() => {
    if (!currentPatch || isDemo || !hasUnsavedChanges) return;
    setShowSaveDialog(true);
  }, [currentPatch, isDemo, hasUnsavedChanges]);

  const handleConfirmSave = useCallback(async () => {
    if (!currentPatch || isSaving) return;

    setIsSaving(true);
    try {
      await midiService.writePatch(currentPatch.id, currentPatch);
      toast.success(`Patch ${String(currentPatch.id).padStart(2, '0')} saved`);
      historyActions.clearHistory();
      setShowSaveDialog(false);

      // Also sync to cloud (fire and forget - errors handled by SyncContext)
      syncActions.savePatchToCloud(currentPatch.id);
    } catch (error) {
      console.error('Failed to save patch:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to save patch');
    } finally {
      setIsSaving(false);
    }
  }, [currentPatch, isSaving, historyActions, syncActions]);

  const handleCancelSave = useCallback(() => {
    if (isSaving) return;
    setShowSaveDialog(false);
  }, [isSaving]);

  useEffect(() => {
    const handleSaveShortcut = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        if (currentPatch && !isDemo && hasUnsavedChanges) {
          setShowSaveDialog(true);
        }
      }
    };

    window.addEventListener('keydown', handleSaveShortcut);
    return () => window.removeEventListener('keydown', handleSaveShortcut);
  }, [currentPatch, isDemo, hasUnsavedChanges]);

  const handleDuplicateClick = useCallback(() => {
    if (!currentPatch) return;
    setShowDuplicateDialog(true);
  }, [currentPatch]);

  const handleConfirmDuplicate = useCallback(async (destinationId: number) => {
    if (!currentPatch || isDuplicating) return;

    setIsDuplicating(true);
    try {
      patchActions.duplicatePatch(currentPatch.id, destinationId);
      const duplicatedPatch = { ...currentPatch, id: destinationId };
      if (deviceState.status === 'connected') {
        await midiService.writePatch(destinationId, duplicatedPatch);
      }
      toast.success(`Patch duplicated to ${String(destinationId).padStart(2, '0')}`);
      setShowDuplicateDialog(false);
    } catch (error) {
      console.error('Failed to duplicate patch:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to duplicate patch');
    } finally {
      setIsDuplicating(false);
    }
  }, [currentPatch, isDuplicating, patchActions, deviceState.status]);

  const handleCancelDuplicate = useCallback(() => {
    if (isDuplicating) return;
    setShowDuplicateDialog(false);
  }, [isDuplicating]);

  const handleRenameClick = useCallback(() => {
    if (!currentPatch) return;
    setShowRenameDialog(true);
  }, [currentPatch]);

  const handleConfirmRename = useCallback(async (newName: string) => {
    if (!currentPatch || isRenaming) return;

    setIsRenaming(true);
    try {
      patchActions.renamePatch(currentPatch.id, newName);
      const renamedPatch = { ...currentPatch, name: newName };
      if (deviceState.status === 'connected') {
        await midiService.writePatch(currentPatch.id, renamedPatch);
      }
      toast.success('Patch renamed');
      setShowRenameDialog(false);
    } catch (error) {
      console.error('Failed to rename patch:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to rename patch');
    } finally {
      setIsRenaming(false);
    }
  }, [currentPatch, isRenaming, patchActions, deviceState.status]);

  const handleCancelRename = useCallback(() => {
    if (isRenaming) return;
    setShowRenameDialog(false);
  }, [isRenaming]);

  const handleToggleOnlineMode = useCallback(async () => {
    // For client mode, just toggle the state
    if (isClient) {
      if (isOnlineMode) {
        setIsOnlineMode(false);
        toast.show('Local mode - changes not sent to server');
      } else {
        setIsOnlineMode(true);
        toast.show('Live mode - changes sync to server');
      }
      return;
    }

    // For MIDI mode, need to be connected
    if (!isConnected) return;

    if (isOnlineMode) {
      try {
        await midiService.exitEditMode();
      } catch (err) {
        console.warn('[Editor] Failed to exit edit mode:', err);
      }
      setIsOnlineMode(false);
      saveOnlineModePreference(false);
      shouldAutoEnableOnlineMode.current = false;
      toast.show('Online mode disabled');
    } else {
      try {
        await midiService.enterEditMode();
        if (patchState.selectedPatchId !== null) {
          midiService.sendPatchChange(patchState.selectedPatchId);
        }
        setIsOnlineMode(true);
        saveOnlineModePreference(true);
        shouldAutoEnableOnlineMode.current = true;
        toast.show('Online mode enabled - changes sync to pedal');
      } catch (err) {
        console.error('[Editor] Failed to enter online mode:', err);
        toast.show('Failed to enable online mode');
      }
    }
  }, [isConnected, isOnlineMode, patchState.selectedPatchId, isClient]);

  // Reset online mode when MIDI disconnects (but not for client mode)
  useEffect(() => {
    if (!isConnected && !isClient && isOnlineMode) {
      setIsOnlineMode(false);
    }
  }, [isConnected, isClient, isOnlineMode]);

  // Auto-enable online mode when client joins a session
  useEffect(() => {
    if (isClient && !isOnlineMode) {
      setIsOnlineMode(true);
    }
  }, [isClient]); // Only run when isClient changes, not isOnlineMode

  // Receive all patches from pedal (overwrite local)
  const handleReceiveFromPedal = useCallback(async () => {
    if (!isConnected || isSyncingFromPedal || isSyncingToPedal) return;

    setIsSyncingFromPedal(true);
    setSyncProgress(0);
    setShowSyncMenu(false);
    lastProgressUpdateRef.current = 0;

    try {
      const allPatches = await midiService.readAllPatches((progress) => {
        // Throttle progress updates to reduce re-renders (update every 250ms or at 100%)
        const now = Date.now();
        const timeSinceLastUpdate = now - lastProgressUpdateRef.current;
        if (progress === 100 || timeSinceLastUpdate >= 250) {
          lastProgressUpdateRef.current = now;
          setSyncProgress(progress);
        }
      });

      if (allPatches && allPatches.length > 0) {
        patchActions.setPatches(allPatches);
        toast.success('Patches received from pedal');
      }
    } catch (error) {
      console.error('Failed to receive patches:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to receive patches');
    } finally {
      setIsSyncingFromPedal(false);
      setSyncProgress(0);
    }
  }, [isConnected, isSyncingFromPedal, isSyncingToPedal, patchActions]);

  // Show bulk send dialog (user needs to put pedal in BulkDumpRx mode first)
  const handleSendToPedal = useCallback(() => {
    if (!isConnected || isSyncingFromPedal || isSyncingToPedal) return;

    if (patchState.patches.length !== 100) {
      toast.error('Cannot send: Not all patches are loaded');
      return;
    }

    setShowSyncMenu(false);
    setShowBulkSendDialog(true);
  }, [isConnected, isSyncingFromPedal, isSyncingToPedal, patchState.patches.length]);

  // Actually start the bulk transfer (called from BulkSendDialog)
  const handleStartBulkSend = useCallback(async () => {
    if (!isConnected || isSyncingToPedal) return;

    setIsSyncingToPedal(true);
    setSyncProgress(0);
    lastProgressUpdateRef.current = 0;

    try {
      await midiService.writeAllPatches(patchState.patches, (progress) => {
        // Throttle progress updates to reduce re-renders (update every 250ms or at 100%)
        const now = Date.now();
        const timeSinceLastUpdate = now - lastProgressUpdateRef.current;
        if (progress === 100 || timeSinceLastUpdate >= 250) {
          lastProgressUpdateRef.current = now;
          setSyncProgress(progress);
        }
      });

      setShowBulkSendDialog(false);
      toast.success('All patches sent to pedal');
      historyActions.clearHistory();
    } catch (error) {
      console.error('Failed to send patches:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to send patches');
    } finally {
      setIsSyncingToPedal(false);
      setSyncProgress(0);
    }
  }, [isConnected, isSyncingToPedal, patchState.patches, historyActions]);

  // Cancel bulk send dialog
  const handleCancelBulkSend = useCallback(() => {
    if (isSyncingToPedal) return; // Don't cancel while transfer is in progress
    setShowBulkSendDialog(false);
  }, [isSyncingToPedal]);

  const isSyncing = isSyncingFromPedal || isSyncingToPedal;
  const [showMobilePatches, setShowMobilePatches] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  return (
    <div className="h-screen bg-black text-white flex flex-col overflow-hidden">
      {/* Header */}
      <header className="bg-neutral-900 border-b border-neutral-800 px-3 md:px-4 py-2 md:py-3 shrink-0">
        {/* Mobile Header */}
        <div className="flex md:hidden items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/zoomlogo.png" alt="ZOOM" className="h-4 opacity-80" />
            {/* Live Mode Toggle - for connected MIDI or client mode */}
            {(isConnected || isClient) ? (
              <button
                onClick={handleToggleOnlineMode}
                className={`flex items-center gap-1.5 px-2 py-1 rounded-lg transition-colors ${
                  isOnlineMode
                    ? 'bg-green-500/20 active:bg-green-500/30'
                    : 'bg-neutral-800/50 active:bg-neutral-700/50'
                }`}
              >
                <div
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    isOnlineMode
                      ? 'bg-green-500 shadow-[0_0_6px_rgba(34,197,94,0.6)] animate-pulse'
                      : 'bg-neutral-600'
                  }`}
                />
                <span className={`text-[10px] font-medium ${
                  isOnlineMode ? 'text-green-400' : 'text-neutral-500'
                }`}>
                  {isOnlineMode
                    ? 'LIVE'
                    : (isClient ? 'LOCAL' : 'OFFLINE')
                  }
                </span>
              </button>
            ) : (
              /* Static status for demo/disconnected/reconnecting */
              <div className="flex items-center gap-1.5 px-2 py-1 bg-neutral-800/50 rounded-lg">
                <div
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    isReconnecting
                      ? 'bg-orange-500 shadow-[0_0_6px_rgba(249,115,22,0.6)] animate-pulse'
                      : isDemo
                        ? 'bg-purple-500 shadow-[0_0_6px_rgba(168,85,247,0.6)]'
                        : 'bg-neutral-600'
                  }`}
                />
                <span className={`text-[10px] font-medium ${
                  isReconnecting
                    ? 'text-orange-400'
                    : isDemo
                      ? 'text-purple-400'
                      : 'text-neutral-500'
                }`}>
                  {isReconnecting
                    ? 'CONNECTING'
                    : isDemo
                      ? 'DEMO'
                      : 'OFFLINE'}
                </span>
              </div>
            )}
            {/* Unsaved indicator */}
            {hasUnsavedChanges && (
              <span className="w-2 h-2 rounded-full bg-amber-500" title="Unsaved changes" />
            )}
          </div>
          <div className="flex items-center gap-1">
            {/* Undo/Redo compact */}
            <button
              onClick={handleUndo}
              disabled={!canUndo}
              className={`p-2 rounded ${canUndo ? 'text-neutral-400' : 'text-neutral-700'}`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
              </svg>
            </button>
            <button
              onClick={handleRedo}
              disabled={!canRedo}
              className={`p-2 rounded ${canRedo ? 'text-neutral-400' : 'text-neutral-700'}`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10h-10a8 8 0 00-8 8v2M21 10l-6 6m6-6l-6-6" />
              </svg>
            </button>
            {/* Save */}
            <button
              onClick={handleSaveClick}
              disabled={isDemo || !hasUnsavedChanges || isSaving}
              className={`p-2 rounded ${!isDemo && hasUnsavedChanges ? 'text-blue-400' : 'text-neutral-700'}`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
              </svg>
            </button>
            {/* Menu */}
            <button
              onClick={() => setShowMobileMenu(true)}
              className="p-2 text-neutral-400"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Desktop Header */}
        <div className="hidden md:flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img src="/zoomlogo.png" alt="ZOOM" className="h-8 opacity-80" />
            <div className="w-px h-6 bg-neutral-700" />
            <h1 className="text-lg font-semibold text-neutral-200">G9.2tt Editor</h1>

            {/* Status Badges */}
            <div className="flex items-center gap-2">
              {/* MIDI Connection LED */}
              <div className="flex items-center gap-2 px-2.5 py-1 bg-neutral-800/50 rounded-lg border border-neutral-700/50">
                <div
                  className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                    isConnected
                      ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]'
                      : isReconnecting
                        ? 'bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.6)] animate-pulse'
                        : isDemo
                          ? 'bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.6)]'
                          : 'bg-neutral-600'
                  }`}
                />
                <span className={`text-xs font-medium ${
                  isConnected
                    ? 'text-green-400'
                    : isReconnecting
                      ? 'text-orange-400'
                      : isDemo
                        ? 'text-purple-400'
                        : 'text-neutral-500'
                }`}>
                  {isConnected
                    ? 'MIDI'
                    : isReconnecting
                      ? 'CONNECTING'
                      : isDemo
                        ? 'DEMO'
                        : 'OFFLINE'}
                </span>
              </div>

              {/* Device name badge (when connected) */}
              {isConnected && deviceState.deviceName && (
                <span className="px-2 py-0.5 bg-neutral-800/50 text-neutral-300 text-xs font-medium rounded border border-neutral-700/50">
                  {deviceState.deviceName}
                </span>
              )}

              {/* Unsaved changes indicator */}
              {hasUnsavedChanges && (
                <span className="px-2 py-0.5 bg-amber-500/20 text-amber-400 text-xs font-medium rounded border border-amber-500/30">
                  Unsaved
                </span>
              )}

              {/* Session Badges */}
              {isServer && sessionState.sessionCode && (
                <SessionBadge
                  code={sessionState.sessionCode}
                  clientCount={sessionState.clients.length}
                  onEndSession={sessionActions.endSession}
                />
              )}
              {isClient && sessionState.sessionMeta && sessionState.sessionCode && (
                <ClientBadge
                  hostName={sessionState.sessionMeta.hostDisplayName}
                  sessionCode={sessionState.sessionCode}
                  onLeave={handleLeaveSession}
                />
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Share Session Button (when connected but not in session) */}
            {isConnected && !isInSession && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowCreateSessionDialog(true)}
                className="text-green-400 hover:bg-green-500/10"
              >
                <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
                Share
              </Button>
            )}

            {/* Online Mode Toggle - for MIDI connected OR client mode */}
            {(isConnected || isClient) && (
              <ToggleButton
                isOn={isOnlineMode}
                onLabel={isClient ? "LIVE" : "LIVE"}
                offLabel={isClient ? "LOCAL" : "OFFLINE"}
                onClick={handleToggleOnlineMode}
                size="sm"
              />
            )}

            <div className="w-px h-6 bg-neutral-700" />

            {/* Undo/Redo */}
            <div className="flex items-center gap-1">
              <IconButton
                onClick={handleUndo}
                disabled={!canUndo}
                size="sm"
                title="Undo (Ctrl+Z)"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                </svg>
              </IconButton>
              <IconButton
                onClick={handleRedo}
                disabled={!canRedo}
                size="sm"
                title="Redo (Ctrl+Y)"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10h-10a8 8 0 00-8 8v2M21 10l-6 6m6-6l-6-6" />
                </svg>
              </IconButton>
            </div>

            {/* Sync Menu (only when MIDI connected and not client) */}
            {isConnected && !isClient && (
              <div className="relative">
                <Button
                  onClick={() => setShowSyncMenu(!showSyncMenu)}
                  disabled={isSyncing}
                  variant={isSyncing ? 'primary' : 'secondary'}
                  size="sm"
                  loading={isSyncing}
                  icon={!isSyncing ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  ) : undefined}
                  title="Sync with pedal"
                >
                  {isSyncing ? `${syncProgress}%` : 'Sync'}
                </Button>

                {showSyncMenu && !isSyncing && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowSyncMenu(false)} />
                    <div className="absolute right-0 mt-2 w-64 bg-gradient-to-b from-neutral-800 to-neutral-900 rounded-xl shadow-2xl border border-neutral-700/50 z-50 overflow-hidden">
                      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500" />
                      <button
                        onClick={handleReceiveFromPedal}
                        className="w-full p-4 text-left text-sm text-neutral-300 hover:bg-neutral-700/50 flex items-center gap-3 transition-all group"
                      >
                        <div className="w-10 h-10 rounded-lg bg-green-500/10 group-hover:bg-green-500/20 flex items-center justify-center transition-colors">
                          <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                        </div>
                        <div>
                          <div className="font-medium text-white">Receive from Pedal</div>
                          <div className="text-xs text-neutral-500">Load all patches from device</div>
                        </div>
                      </button>
                      <div className="border-t border-neutral-700/50 mx-4" />
                      <button
                        onClick={handleSendToPedal}
                        className="w-full p-4 text-left text-sm text-neutral-300 hover:bg-neutral-700/50 flex items-center gap-3 transition-all group"
                      >
                        <div className="w-10 h-10 rounded-lg bg-blue-500/10 group-hover:bg-blue-500/20 flex items-center justify-center transition-colors">
                          <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                          </svg>
                        </div>
                        <div>
                          <div className="font-medium text-white">Send to Pedal</div>
                          <div className="text-xs text-neutral-500">Write all patches to device</div>
                        </div>
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Save Button */}
            <Button
              onClick={handleSaveClick}
              disabled={isDemo || !hasUnsavedChanges || isSaving}
              variant={!isDemo && hasUnsavedChanges ? 'primary' : 'secondary'}
              size="sm"
              loading={isSaving}
              icon={!isSaving ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                </svg>
              ) : undefined}
              title={isDemo ? 'Save disabled in demo mode' : 'Save (Ctrl+S)'}
            >
              Save
            </Button>

            <div className="w-px h-6 bg-neutral-700" />

            <Button
              onClick={handleDisconnectWithCheck}
              variant="ghost"
              size="sm"
            >
              Disconnect
            </Button>

            <div className="w-px h-6 bg-neutral-700" />

            <SyncStatus showLabel />

            <UserMenu />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex min-h-0">
        {/* Patch List Sidebar - Desktop only */}
        <aside
          className="hidden md:flex w-56 min-w-[14rem] bg-neutral-900/50 border-r border-neutral-800 flex-col min-h-0"
          tabIndex={0}
          onKeyDown={handleKeyDown}
        >
          <div className="p-3 border-b border-neutral-800 shrink-0">
            <h2 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
              Patches
            </h2>
          </div>
          <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar">
            {patchState.isLoading ? (
              <div className="flex flex-col items-center justify-center h-32 gap-2">
                <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                {patchState.loadingProgress > 0 && (
                  <span className="text-xs text-neutral-500">{patchState.loadingProgress}%</span>
                )}
              </div>
            ) : patchState.error ? (
              <div className="p-4 text-red-400 text-sm">{patchState.error}</div>
            ) : (
              <ul className="py-1">
                {patchState.patches.map((patch) => (
                  <li key={patch.id}>
                    <button
                      onClick={() => handlePatchSelect(patch.id)}
                      className={`w-full px-3 py-2 text-left text-sm transition-all ${
                        patchState.selectedPatchId === patch.id
                          ? 'bg-blue-600 text-white'
                          : 'text-neutral-400 hover:bg-neutral-800 hover:text-white'
                      }`}
                    >
                      <span className={`mr-2 font-mono ${patchState.selectedPatchId === patch.id ? 'text-blue-200' : 'text-neutral-600'}`}>
                        {String(patch.id).padStart(2, '0')}
                      </span>
                      {patch.name.trim() || '(empty)'}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </aside>

        {/* Patch Editor Area */}
        <main className="flex-1 min-h-0 overflow-y-auto custom-scrollbar bg-gradient-to-b from-neutral-900 to-black">
          {currentPatch ? (
            <div className="p-4 md:p-6 lg:p-8 w-full">
              {/* Patch Header */}
              <div className="mb-4 md:mb-6">
                {/* Mobile: Patch selector button */}
                <button
                  onClick={() => setShowMobilePatches(true)}
                  className="md:hidden w-full flex items-center justify-between p-3 bg-neutral-800 rounded-lg mb-4"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-blue-400 font-mono text-sm">
                      {String(currentPatch.id).padStart(2, '0')}
                    </span>
                    <span className="text-white font-medium truncate">
                      {currentPatch.name.trim() || '(Unnamed)'}
                    </span>
                  </div>
                  <svg className="w-5 h-5 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Desktop: Full header */}
                <div className="hidden md:flex items-start justify-between">
                  <div>
                    <button
                      onClick={handleRenameClick}
                      className="group flex items-center gap-2 text-3xl font-bold text-white hover:text-blue-400 transition-colors"
                      title="Click to rename"
                    >
                      {currentPatch.name.trim() || '(Unnamed)'}
                      <svg className="w-5 h-5 opacity-0 group-hover:opacity-50 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>
                    <p className="text-neutral-500 mt-1">
                      Patch {String(currentPatch.id).padStart(2, '0')} &bull; Level: {currentPatch.level}
                    </p>
                  </div>
                  <button
                    onClick={handleDuplicateClick}
                    className="px-3 py-2 text-sm text-neutral-400 hover:text-white bg-neutral-800 hover:bg-neutral-700 rounded transition-colors flex items-center gap-2"
                    title="Duplicate patch"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    Duplicate
                  </button>
                </div>
              </div>

              {/* Pedalboard */}
              <div className="mb-4 md:mb-6">
                <Pedalboard
                  patch={currentPatch}
                  selectedModule={selectedModule}
                  onModuleSelect={handleModuleSelect}
                  onModuleToggle={handleModuleToggle}
                />
              </div>

              {/* Demo Mode Notice */}
              {isDemo && (
                <div className="p-3 md:p-4 bg-purple-500/10 border border-purple-500/30 rounded-lg">
                  <p className="text-purple-300 text-xs md:text-sm">
                    <strong>Demo Mode:</strong> Changes are stored locally. Connect a Zoom G9.2tt to edit real patches.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-neutral-600">
              Select a patch from the list
            </div>
          )}
        </main>
      </div>

      {/* Mobile Patches Drawer */}
      {showMobilePatches && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/70" onClick={() => setShowMobilePatches(false)} />
          <div className="absolute inset-x-0 bottom-0 bg-neutral-900 rounded-t-2xl max-h-[70vh] flex flex-col animate-slide-up">
            <div className="flex items-center justify-between p-4 border-b border-neutral-800">
              <h2 className="text-lg font-semibold text-white">Select Patch</h2>
              <button
                onClick={() => setShowMobilePatches(false)}
                className="p-2 text-neutral-500"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              {patchState.isLoading ? (
                <div className="flex flex-col items-center justify-center h-32 gap-2">
                  <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                  {patchState.loadingProgress > 0 && (
                    <span className="text-xs text-neutral-500">{patchState.loadingProgress}%</span>
                  )}
                </div>
              ) : (
                <ul className="py-2">
                  {patchState.patches.map((patch) => (
                    <li key={patch.id}>
                      <button
                        onClick={() => {
                          handlePatchSelect(patch.id);
                          setShowMobilePatches(false);
                        }}
                        className={`w-full px-4 py-3 text-left flex items-center gap-3 transition-all ${
                          patchState.selectedPatchId === patch.id
                            ? 'bg-blue-600 text-white'
                            : 'text-neutral-300 active:bg-neutral-800'
                        }`}
                      >
                        <span className={`font-mono text-sm ${patchState.selectedPatchId === patch.id ? 'text-blue-200' : 'text-neutral-500'}`}>
                          {String(patch.id).padStart(2, '0')}
                        </span>
                        <span className="truncate">{patch.name.trim() || '(empty)'}</span>
                        {patchState.selectedPatchId === patch.id && (
                          <svg className="w-5 h-5 ml-auto" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Mobile Menu Drawer */}
      {showMobileMenu && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/70" onClick={() => setShowMobileMenu(false)} />
          <div className="absolute inset-y-0 right-0 w-72 bg-neutral-900 flex flex-col animate-slide-left">
            <div className="flex items-center justify-between p-4 border-b border-neutral-800">
              <h2 className="text-lg font-semibold text-white">Menu</h2>
              <button
                onClick={() => setShowMobileMenu(false)}
                className="p-2 text-neutral-500"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-2">
              {/* Online Mode - for MIDI connected OR client mode */}
              {(isConnected || isClient) && (
                <button
                  onClick={() => {
                    handleToggleOnlineMode();
                    setShowMobileMenu(false);
                  }}
                  className={`w-full p-3 rounded-lg flex items-center gap-3 ${
                    isOnlineMode ? 'bg-green-500/20 text-green-400' : 'bg-neutral-800 text-neutral-300'
                  }`}
                >
                  <span className={`w-3 h-3 rounded-full ${isOnlineMode ? 'bg-green-500 animate-pulse' : 'bg-neutral-600'}`} />
                  {isOnlineMode
                    ? (isClient ? 'Live Mode ON (Remote)' : 'Live Mode ON')
                    : (isClient ? 'Local Mode (Changes not sent)' : 'Live Mode OFF')
                  }
                </button>
              )}

              {/* Sync options - only for MIDI connected, not client */}
              {isConnected && !isClient && (
                <>
                  <button
                    onClick={() => {
                      handleReceiveFromPedal();
                      setShowMobileMenu(false);
                    }}
                    disabled={isSyncing}
                    className="w-full p-3 rounded-lg bg-neutral-800 text-neutral-300 flex items-center gap-3"
                  >
                    <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Receive from Pedal
                  </button>
                  <button
                    onClick={() => {
                      handleSendToPedal();
                      setShowMobileMenu(false);
                    }}
                    disabled={isSyncing}
                    className="w-full p-3 rounded-lg bg-neutral-800 text-neutral-300 flex items-center gap-3"
                  >
                    <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                    Send to Pedal
                  </button>
                </>
              )}

              {/* Patch actions */}
              {currentPatch && (
                <>
                  <div className="border-t border-neutral-800 my-2" />
                  <button
                    onClick={() => {
                      handleRenameClick();
                      setShowMobileMenu(false);
                    }}
                    className="w-full p-3 rounded-lg bg-neutral-800 text-neutral-300 flex items-center gap-3"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                    Rename Patch
                  </button>
                  <button
                    onClick={() => {
                      handleDuplicateClick();
                      setShowMobileMenu(false);
                    }}
                    className="w-full p-3 rounded-lg bg-neutral-800 text-neutral-300 flex items-center gap-3"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    Duplicate Patch
                  </button>
                </>
              )}

              <div className="border-t border-neutral-800 my-2" />

              {/* Cloud sync status */}
              <div className="p-3 rounded-lg bg-neutral-800/50">
                <SyncStatus showLabel />
              </div>

              {/* User menu */}
              <div className="p-3 rounded-lg bg-neutral-800/50">
                <UserMenu />
              </div>

              <div className="border-t border-neutral-800 my-2" />

              {/* Disconnect */}
              <button
                onClick={() => {
                  handleDisconnectWithCheck();
                  setShowMobileMenu(false);
                }}
                className="w-full p-3 rounded-lg bg-red-500/10 text-red-400 flex items-center gap-3"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Disconnect
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Animation and scrollbar styles */}
      <style>{`
        @keyframes slide-up {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        @keyframes slide-left {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        .animate-slide-up {
          animation: slide-up 0.25s ease-out;
        }
        .animate-slide-left {
          animation: slide-left 0.25s ease-out;
        }

        /* Custom scrollbar styles */
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #404040;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #525252;
        }
        /* Firefox */
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: #404040 transparent;
        }
      `}</style>

      {/* Module Panel */}
      {selectedModule && selectedModuleState && (
        <ModulePanel
          moduleKey={selectedModule}
          module={selectedModuleState}
          onClose={handleClosePanel}
          onParameterClick={handleParameterClick}
          onToggleEnabled={handleToggleEnabled}
          onTypeSelect={handleTypeSelect}
        />
      )}

      {/* Parameter Modal */}
      {selectedModule && selectedParamDef && (
        <ParameterModal
          parameter={selectedParamDef}
          value={selectedParamValue}
          onChange={handleParameterChange}
          onClose={handleCloseParamModal}
          moduleName={MODULE_INFO[selectedModule].fullName}
          accentColor={MODULE_COLORS[selectedModule].accent}
        />
      )}

      {/* Type Selector */}
      {selectedModule && selectedModuleState && showTypeSelector && (
        <TypeSelector
          moduleKey={selectedModule}
          currentTypeId={selectedModuleState.type}
          onSelect={handleTypeChange}
          onClose={handleCloseTypeSelector}
        />
      )}

      {/* Dialogs */}
      {showUnsavedDialog && (
        <div className="fixed inset-0 z-80 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/70" onClick={handleCancelNavigation} />
          <div className="relative bg-neutral-900 rounded-lg shadow-xl p-6 max-w-md w-full mx-4 border border-neutral-700">
            <h3 className="text-lg font-semibold text-white mb-2">Unsaved Changes</h3>
            <p className="text-neutral-400 mb-6">You have unsaved changes. What would you like to do?</p>
            <div className="flex gap-3 justify-end">
              <button onClick={handleCancelNavigation} className="px-4 py-2 text-sm text-neutral-400 hover:text-white hover:bg-neutral-800 rounded transition-colors">
                Cancel
              </button>
              <button onClick={handleDiscardChanges} className="px-4 py-2 text-sm bg-red-600 text-white rounded hover:bg-red-500 transition-colors">
                Discard
              </button>
            </div>
          </div>
        </div>
      )}

      {showSaveDialog && currentPatch && (
        <SaveConfirmDialog
          patchId={currentPatch.id}
          patchName={currentPatch.name}
          isSaving={isSaving}
          onConfirm={handleConfirmSave}
          onCancel={handleCancelSave}
        />
      )}

      {showDuplicateDialog && currentPatch && (
        <DuplicatePatchDialog
          sourcePatch={currentPatch}
          patches={patchState.patches}
          isDuplicating={isDuplicating}
          onConfirm={handleConfirmDuplicate}
          onCancel={handleCancelDuplicate}
        />
      )}

      {showRenameDialog && currentPatch && (
        <RenamePatchDialog
          patchId={currentPatch.id}
          currentName={currentPatch.name}
          isRenaming={isRenaming}
          onConfirm={handleConfirmRename}
          onCancel={handleCancelRename}
        />
      )}

      {/* Bulk Send Dialog */}
      <BulkSendDialog
        isOpen={showBulkSendDialog}
        isSending={isSyncingToPedal}
        progress={syncProgress}
        onStartSend={handleStartBulkSend}
        onCancel={handleCancelBulkSend}
      />

      {/* Create Session Dialog */}
      <CreateSessionDialog
        isOpen={showCreateSessionDialog}
        isCreating={sessionState.isCreating}
        sessionCode={sessionState.sessionCode}
        error={sessionState.error}
        onClose={() => setShowCreateSessionDialog(false)}
        onCreate={async () => {
          await sessionActions.createSession();
        }}
      />
    </div>
  );
}
