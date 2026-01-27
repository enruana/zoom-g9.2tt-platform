import { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDevice } from '../contexts/DeviceContext';
import { usePatch } from '../contexts/PatchContext';
import { useHistory } from '../contexts/HistoryContext';
import { demoDataSource } from '../services/data/DemoDataSource';
import { midiService } from '../services/midi/MidiService';
import { toast } from '../components/common/Toast';
import { Pedalboard } from '../components/pedalboard/Pedalboard';
import { ModulePanel } from '../components/pedalboard/ModulePanel';
import { ParameterModal } from '../components/parameter/ParameterModal';
import { TypeSelector } from '../components/parameter/TypeSelector';
import { SaveConfirmDialog } from '../components/dialogs/SaveConfirmDialog';
import { DuplicatePatchDialog } from '../components/dialogs/DuplicatePatchDialog';
import { RenamePatchDialog } from '../components/dialogs/RenamePatchDialog';
import { getEditableParameters } from '../data/parameterMaps';
import { MODULE_INFO, hasMultipleTypes } from '../data/effectTypes';
import type { ModuleName } from '../types/patch';

export function Editor() {
  const navigate = useNavigate();
  const { state: deviceState, actions: deviceActions } = useDevice();
  const { state: patchState, currentPatch, actions: patchActions } = usePatch();
  const { actions: historyActions, canUndo, canRedo, hasUnsavedChanges } = useHistory();
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
  const pendingNavigationRef = useRef<string | null>(null);

  const isDemo = deviceState.status === 'demo';
  const isConnected = deviceState.status === 'connected';

  // Handle module selection
  const handleModuleSelect = useCallback((moduleKey: ModuleName) => {
    setSelectedModule(prev => prev === moduleKey ? null : moduleKey);
  }, []);

  // Redirect to splash if not connected
  useEffect(() => {
    if (deviceState.status === 'disconnected' || deviceState.status === 'error') {
      navigate('/');
    }
  }, [deviceState.status, navigate]);

  // Handle unexpected device disconnect
  useEffect(() => {
    if (deviceState.status !== 'connected') return;

    const unsubscribe = midiService.onDisconnect(() => {
      toast.error('Device disconnected unexpectedly');
      deviceActions.disconnect();
      patchActions.clearPatches();
      navigate('/');
    });

    return unsubscribe;
  }, [deviceState.status, deviceActions, patchActions, navigate]);

  // Load patches on mount
  useEffect(() => {
    async function loadPatches() {
      patchActions.setLoading(true, 0);
      try {
        let allPatches;

        if (isDemo) {
          allPatches = await demoDataSource.readAllPatches();
        } else if (deviceState.status === 'connected') {
          // Read from real device
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
    patchActions.selectPatch(id);

    // Send patch change to device if in online mode
    if (isOnlineMode && isConnected) {
      midiService.sendPatchChange(id);
    }
  }, [patchActions, isOnlineMode, isConnected]);

  // Sync history context with current patch
  useEffect(() => {
    historyActions.setCurrentPatch(patchState.selectedPatchId);
  }, [patchState.selectedPatchId, historyActions]);

  // Keyboard navigation for patch list
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


  // Get selected module state
  const selectedModuleState = currentPatch && selectedModule
    ? currentPatch.modules[selectedModule]
    : null;

  // Handle closing the module panel
  const handleClosePanel = useCallback(() => {
    setSelectedModule(null);
    setSelectedParamIndex(null);
  }, []);

  // Handle parameter click - open the parameter modal
  const handleParameterClick = useCallback((paramIndex: number) => {
    setSelectedParamIndex(paramIndex);
  }, []);

  // Handle closing the parameter modal
  const handleCloseParamModal = useCallback(() => {
    setSelectedParamIndex(null);
  }, []);

  // Get selected parameter definition
  const selectedParamDef = useMemo(() => {
    if (!selectedModule || !selectedModuleState || selectedParamIndex === null) {
      return null;
    }
    const params = getEditableParameters(selectedModule, selectedModuleState.type);
    return params[selectedParamIndex] ?? null;
  }, [selectedModule, selectedModuleState, selectedParamIndex]);

  // Get current parameter value
  const selectedParamValue = useMemo(() => {
    if (!selectedModuleState || selectedParamIndex === null || !selectedParamDef) {
      return 0;
    }
    return selectedModuleState.params[selectedParamIndex] ?? selectedParamDef.defaultValue ?? selectedParamDef.min;
  }, [selectedModuleState, selectedParamIndex, selectedParamDef]);

  // Track old value for history
  const oldValueRef = useRef<number | null>(null);

  // Capture old value when parameter modal opens
  useEffect(() => {
    if (selectedParamIndex !== null && selectedModuleState) {
      oldValueRef.current = selectedModuleState.params[selectedParamIndex] ?? 0;
    } else {
      oldValueRef.current = null;
    }
  }, [selectedParamIndex, selectedModuleState]);

  // Handle parameter value change
  const handleParameterChange = useCallback((newValue: number) => {
    if (!selectedModule || selectedParamIndex === null || patchState.selectedPatchId === null) return;

    const oldValue = oldValueRef.current ?? 0;

    // Only track in history if value actually changed
    if (oldValue !== newValue) {
      historyActions.pushChange({
        patchId: patchState.selectedPatchId,
        module: selectedModule,
        paramIndex: selectedParamIndex,
        oldValue,
        newValue,
      });
      // Update ref for next change
      oldValueRef.current = newValue;
    }

    // Update local state optimistically
    patchActions.updateParameter(selectedModule, selectedParamIndex, newValue);

    // Send to device if connected and in online mode
    if (isOnlineMode && isConnected) {
      console.log('[Editor] Sending parameter:', selectedModule, selectedParamIndex, newValue);
      midiService.sendParameter(selectedModule, selectedParamIndex, newValue);
    } else {
      console.log('[Editor] NOT sending parameter - online:', isOnlineMode, 'connected:', isConnected);
    }
  }, [selectedModule, selectedParamIndex, patchState.selectedPatchId, patchActions, isOnlineMode, isConnected, historyActions]);

  // Handle toggle module enabled (from ModulePanel)
  const handleToggleEnabled = useCallback(() => {
    if (!selectedModule || !selectedModuleState) return;

    // Toggle in local state
    patchActions.toggleModuleEnabled(selectedModule);

    // Send to device if connected and in online mode
    if (isOnlineMode && isConnected) {
      // Send the new state (opposite of current)
      console.log('[Editor] Sending toggle:', selectedModule, !selectedModuleState.enabled);
      midiService.sendModuleToggle(selectedModule, !selectedModuleState.enabled);
    } else {
      console.log('[Editor] NOT sending toggle - online:', isOnlineMode, 'connected:', isConnected);
    }
  }, [selectedModule, selectedModuleState, patchActions, isOnlineMode, isConnected]);

  // Handle toggle module from pedalboard footswitch
  const handleModuleToggle = useCallback((moduleKey: ModuleName, enabled: boolean) => {
    if (!currentPatch) return;

    // Set specific enabled state
    patchActions.setModuleEnabled(moduleKey, enabled);

    // Send to device if connected and in online mode
    if (isOnlineMode && isConnected) {
      console.log('[Editor] Sending footswitch toggle:', moduleKey, enabled);
      midiService.sendModuleToggle(moduleKey, enabled);
    } else {
      console.log('[Editor] NOT sending footswitch - online:', isOnlineMode, 'connected:', isConnected);
    }
  }, [currentPatch, patchActions, isOnlineMode, isConnected]);

  // Handle type selector - open TypeSelector modal
  const handleTypeSelect = useCallback(() => {
    if (!selectedModule || !hasMultipleTypes(selectedModule)) return;
    setShowTypeSelector(true);
  }, [selectedModule]);

  // Handle closing type selector
  const handleCloseTypeSelector = useCallback(() => {
    setShowTypeSelector(false);
  }, []);

  // Handle type change
  const handleTypeChange = useCallback((typeId: number) => {
    if (!selectedModule) return;

    // Update local state optimistically
    patchActions.updateModuleType(selectedModule, typeId);

    // Send to device if connected and in online mode
    if (isOnlineMode && isConnected) {
      midiService.sendModuleType(selectedModule, typeId);
    }
  }, [selectedModule, patchActions, isOnlineMode, isConnected]);

  // Handle undo
  const handleUndo = useCallback(() => {
    const entry = historyActions.undo();
    if (!entry) return;

    // Apply the old value
    patchActions.updateParameter(entry.module, entry.paramIndex, entry.oldValue);

    // Send to device if connected and in online mode
    if (isOnlineMode && isConnected) {
      midiService.sendParameter(entry.module, entry.paramIndex, entry.oldValue);
    }
  }, [historyActions, patchActions, isOnlineMode, isConnected]);

  // Handle redo
  const handleRedo = useCallback(() => {
    const entry = historyActions.redo();
    if (!entry) return;

    // Apply the new value
    patchActions.updateParameter(entry.module, entry.paramIndex, entry.newValue);

    // Send to device if connected and in online mode
    if (isOnlineMode && isConnected) {
      midiService.sendParameter(entry.module, entry.paramIndex, entry.newValue);
    }
  }, [historyActions, patchActions, isOnlineMode, isConnected]);

  // Keyboard shortcuts for undo/redo
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // Check for undo: Ctrl+Z (Windows/Linux) or Cmd+Z (Mac)
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
        return;
      }

      // Check for redo: Ctrl+Y (Windows/Linux) or Cmd+Shift+Z (Mac)
      if ((e.ctrlKey && e.key === 'y') || (e.metaKey && e.shiftKey && e.key === 'z')) {
        e.preventDefault();
        handleRedo();
        return;
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [handleUndo, handleRedo]);

  // Handle disconnect with unsaved changes check
  const handleDisconnectWithCheck = useCallback(() => {
    if (hasUnsavedChanges) {
      pendingNavigationRef.current = '/';
      setShowUnsavedDialog(true);
    } else {
      deviceActions.disconnect();
      patchActions.clearPatches();
      historyActions.clearHistory();
      navigate('/');
    }
  }, [hasUnsavedChanges, deviceActions, patchActions, historyActions, navigate]);

  // Discard changes and navigate
  const handleDiscardChanges = useCallback(() => {
    setShowUnsavedDialog(false);
    historyActions.clearHistory();
    deviceActions.disconnect();
    patchActions.clearPatches();
    if (pendingNavigationRef.current) {
      navigate(pendingNavigationRef.current);
      pendingNavigationRef.current = null;
    }
  }, [historyActions, deviceActions, patchActions, navigate]);

  // Cancel navigation
  const handleCancelNavigation = useCallback(() => {
    setShowUnsavedDialog(false);
    pendingNavigationRef.current = null;
  }, []);

  // Open save confirmation dialog
  const handleSaveClick = useCallback(() => {
    if (!currentPatch || isDemo || !hasUnsavedChanges) return;
    setShowSaveDialog(true);
  }, [currentPatch, isDemo, hasUnsavedChanges]);

  // Confirm and execute save
  const handleConfirmSave = useCallback(async () => {
    if (!currentPatch || isSaving) return;

    setIsSaving(true);
    try {
      await midiService.writePatch(currentPatch.id, currentPatch);
      toast.success(`Patch ${String(currentPatch.id).padStart(2, '0')} saved`);
      historyActions.clearHistory();
      setShowSaveDialog(false);
    } catch (error) {
      console.error('Failed to save patch:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to save patch');
    } finally {
      setIsSaving(false);
    }
  }, [currentPatch, isSaving, historyActions]);

  // Cancel save dialog
  const handleCancelSave = useCallback(() => {
    if (isSaving) return;
    setShowSaveDialog(false);
  }, [isSaving]);

  // Keyboard shortcut for save (Ctrl+S / Cmd+S)
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

  // Open duplicate dialog
  const handleDuplicateClick = useCallback(() => {
    if (!currentPatch) return;
    setShowDuplicateDialog(true);
  }, [currentPatch]);

  // Confirm and execute duplicate
  const handleConfirmDuplicate = useCallback(async (destinationId: number) => {
    if (!currentPatch || isDuplicating) return;

    setIsDuplicating(true);
    try {
      // Update context first
      patchActions.duplicatePatch(currentPatch.id, destinationId);

      // Get the duplicated patch (it's a copy of currentPatch with new ID)
      const duplicatedPatch = { ...currentPatch, id: destinationId };

      // Write to device if connected
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

  // Cancel duplicate dialog
  const handleCancelDuplicate = useCallback(() => {
    if (isDuplicating) return;
    setShowDuplicateDialog(false);
  }, [isDuplicating]);

  // Open rename dialog
  const handleRenameClick = useCallback(() => {
    if (!currentPatch) return;
    setShowRenameDialog(true);
  }, [currentPatch]);

  // Confirm and execute rename
  const handleConfirmRename = useCallback(async (newName: string) => {
    if (!currentPatch || isRenaming) return;

    setIsRenaming(true);
    try {
      // Update context first
      patchActions.renamePatch(currentPatch.id, newName);

      // Create updated patch for writing
      const renamedPatch = { ...currentPatch, name: newName };

      // Write to device if connected
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

  // Cancel rename dialog
  const handleCancelRename = useCallback(() => {
    if (isRenaming) return;
    setShowRenameDialog(false);
  }, [isRenaming]);

  // Toggle online/preview mode
  // Online mode enables real-time parameter sync via 0x31 commands
  // IMPORTANT: Must enter edit mode (0x12) first for 0x31 commands to work
  const handleToggleOnlineMode = useCallback(async () => {
    if (!isConnected) return;

    if (isOnlineMode) {
      // Exit edit mode when disabling online mode
      try {
        await midiService.exitEditMode();
      } catch (err) {
        console.warn('[Editor] Failed to exit edit mode:', err);
      }
      setIsOnlineMode(false);
      toast.show('Online mode disabled');
    } else {
      try {
        // Enter edit mode first - REQUIRED for 0x31 parameter changes to work
        console.log('[Editor] Enabling Online Mode - entering edit mode');
        await midiService.enterEditMode();

        // Sync the currently selected patch to the pedal
        if (patchState.selectedPatchId !== null) {
          console.log('[Editor] Syncing patch:', patchState.selectedPatchId);
          midiService.sendPatchChange(patchState.selectedPatchId);
          // Small delay to let the pedal process the patch change
          await new Promise(resolve => setTimeout(resolve, 100));
        }

        setIsOnlineMode(true);
        toast.show('Online mode enabled - changes sync to pedal');
      } catch (err) {
        console.error('[Editor] Failed to enter online mode:', err);
        toast.show('Failed to enable online mode');
      }
    }
  }, [isConnected, isOnlineMode, patchState.selectedPatchId]);

  // Exit online mode on disconnect
  useEffect(() => {
    if (!isConnected && isOnlineMode) {
      setIsOnlineMode(false);
    }
  }, [isConnected, isOnlineMode]);

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold">G9.2tt Editor</h1>
          {isDemo && (
            <span className="px-2 py-1 bg-purple-600 text-purple-100 text-xs font-medium rounded">
              DEMO MODE
            </span>
          )}
          {deviceState.status === 'connected' && (
            <span className="px-2 py-1 bg-green-600 text-green-100 text-xs font-medium rounded">
              {deviceState.deviceName}
            </span>
          )}
          {hasUnsavedChanges && (
            <span className="px-2 py-1 bg-yellow-600 text-yellow-100 text-xs font-medium rounded">
              Unsaved
            </span>
          )}
          {/* Online Mode Toggle */}
          {isConnected && (
            <button
              onClick={handleToggleOnlineMode}
              className={`px-3 py-1.5 text-xs font-medium rounded-full transition-all flex items-center gap-1.5 ${
                isOnlineMode
                  ? 'bg-green-600 text-white shadow-lg shadow-green-500/30'
                  : 'bg-gray-700 text-gray-400 hover:bg-gray-600 hover:text-gray-200'
              }`}
              title={isOnlineMode ? 'Click to disable live sync' : 'Click to enable live sync to pedal'}
            >
              <span className={`w-2 h-2 rounded-full ${isOnlineMode ? 'bg-white animate-pulse' : 'bg-gray-500'}`} />
              {isOnlineMode ? 'ONLINE' : 'OFFLINE'}
            </button>
          )}
        </div>
        <div className="flex items-center gap-2">
          {/* Undo/Redo Buttons */}
          <button
            onClick={handleUndo}
            disabled={!canUndo}
            className={`px-3 py-1 text-sm rounded transition-colors ${
              canUndo
                ? 'text-gray-300 hover:text-white hover:bg-gray-700'
                : 'text-gray-600 cursor-not-allowed'
            }`}
            title="Undo (Ctrl+Z)"
            aria-label="Undo"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
            </svg>
          </button>
          <button
            onClick={handleRedo}
            disabled={!canRedo}
            className={`px-3 py-1 text-sm rounded transition-colors ${
              canRedo
                ? 'text-gray-300 hover:text-white hover:bg-gray-700'
                : 'text-gray-600 cursor-not-allowed'
            }`}
            title="Redo (Ctrl+Y)"
            aria-label="Redo"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10h-10a8 8 0 00-8 8v2M21 10l-6 6m6-6l-6-6" />
            </svg>
          </button>
          <div className="w-px h-6 bg-gray-600 mx-1" />
          {/* Save Button */}
          <button
            onClick={handleSaveClick}
            disabled={isDemo || !hasUnsavedChanges || isSaving}
            className={`px-3 py-1.5 text-sm rounded transition-colors flex items-center gap-1.5 ${
              !isDemo && hasUnsavedChanges && !isSaving
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-700 text-gray-500 cursor-not-allowed'
            }`}
            title={isDemo ? 'Save disabled in demo mode' : 'Save (Ctrl+S)'}
            aria-label="Save"
          >
            {isSaving ? (
              <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
              </svg>
            )}
            Save
          </button>
          <div className="w-px h-6 bg-gray-600 mx-1" />
          <button
            onClick={handleDisconnectWithCheck}
            className="px-3 py-1 text-sm text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
          >
            Disconnect
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Patch List Sidebar */}
        <aside
          className="w-64 bg-gray-850 border-r border-gray-700 flex flex-col focus:outline-none"
          tabIndex={0}
          onKeyDown={handleKeyDown}
        >
          <div className="p-3 border-b border-gray-700">
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
              Patches
            </h2>
          </div>
          <div className="flex-1 overflow-y-auto">
            {patchState.isLoading ? (
              <div className="flex flex-col items-center justify-center h-32 gap-2">
                <div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full" />
                {patchState.loadingProgress > 0 && (
                  <span className="text-xs text-gray-500">
                    {patchState.loadingProgress}%
                  </span>
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
                      className={`w-full px-3 py-2 text-left text-sm transition-colors ${
                        patchState.selectedPatchId === patch.id
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-300 hover:bg-gray-700'
                      }`}
                    >
                      <span className="text-gray-500 mr-2">
                        {String(patch.id).padStart(2, '0')}
                      </span>
                      {patch.name.trim()}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </aside>

        {/* Patch Editor Area */}
        <main className="flex-1 p-6">
          {currentPatch ? (
            <div>
              {/* Patch Header */}
              <div className="mb-6 flex items-start justify-between">
                <div>
                  <button
                    onClick={handleRenameClick}
                    className="text-2xl font-bold mb-1 hover:text-blue-400 transition-colors text-left"
                    title="Click to rename"
                  >
                    {currentPatch.name.trim()}
                    <svg className="w-4 h-4 inline-block ml-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>
                  <p className="text-gray-400 text-sm">
                    Patch {String(currentPatch.id).padStart(2, '0')} • Level: {currentPatch.level}
                  </p>
                </div>
                <button
                  onClick={handleDuplicateClick}
                  className="px-3 py-1.5 text-sm text-gray-300 hover:text-white hover:bg-gray-700 rounded transition-colors flex items-center gap-1.5"
                  title="Duplicate patch to another slot"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Duplicate
                </button>
              </div>

              {/* Pedalboard Module Grid */}
              <div className="mb-6">
                <Pedalboard
                  patch={currentPatch}
                  selectedModule={selectedModule}
                  onModuleSelect={handleModuleSelect}
                  onModuleToggle={handleModuleToggle}
                />
              </div>

              {/* Demo Mode Notice */}
              {isDemo && (
                <div className="p-4 bg-purple-900/30 border border-purple-500/50 rounded-lg">
                  <p className="text-purple-200 text-sm">
                    <strong>Demo Mode:</strong> Changes are stored locally and won't be sent to a device.
                    Connect a Zoom G9.2tt to edit real patches.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              Select a patch from the list
            </div>
          )}
        </main>
      </div>

      {/* Module Panel (slides up from bottom) */}
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

      {/* Parameter Modal (appears over everything) */}
      {selectedModule && selectedParamDef && (
        <ParameterModal
          parameter={selectedParamDef}
          value={selectedParamValue}
          onChange={handleParameterChange}
          onClose={handleCloseParamModal}
          moduleName={MODULE_INFO[selectedModule].fullName}
        />
      )}

      {/* Type Selector Modal */}
      {selectedModule && selectedModuleState && showTypeSelector && (
        <TypeSelector
          moduleKey={selectedModule}
          currentTypeId={selectedModuleState.type}
          onSelect={handleTypeChange}
          onClose={handleCloseTypeSelector}
        />
      )}

      {/* Unsaved Changes Dialog */}
      {showUnsavedDialog && (
        <div className="fixed inset-0 z-80 flex items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/70"
            onClick={handleCancelNavigation}
          />
          {/* Dialog */}
          <div className="relative bg-gray-800 rounded-lg shadow-xl p-6 max-w-md w-full mx-4 border border-gray-600">
            <h3 className="text-lg font-semibold text-white mb-2">Unsaved Changes</h3>
            <p className="text-gray-300 mb-6">
              You have unsaved parameter changes. What would you like to do?
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={handleCancelNavigation}
                className="px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-700 rounded transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDiscardChanges}
                className="px-4 py-2 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
              >
                Discard
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Save Confirmation Dialog */}
      {showSaveDialog && currentPatch && (
        <SaveConfirmDialog
          patchId={currentPatch.id}
          patchName={currentPatch.name}
          isSaving={isSaving}
          onConfirm={handleConfirmSave}
          onCancel={handleCancelSave}
        />
      )}

      {/* Duplicate Patch Dialog */}
      {showDuplicateDialog && currentPatch && (
        <DuplicatePatchDialog
          sourcePatch={currentPatch}
          patches={patchState.patches}
          isDuplicating={isDuplicating}
          onConfirm={handleConfirmDuplicate}
          onCancel={handleCancelDuplicate}
        />
      )}

      {/* Rename Patch Dialog */}
      {showRenameDialog && currentPatch && (
        <RenamePatchDialog
          patchId={currentPatch.id}
          currentName={currentPatch.name}
          isRenaming={isRenaming}
          onConfirm={handleConfirmRename}
          onCancel={handleCancelRename}
        />
      )}
    </div>
  );
}
