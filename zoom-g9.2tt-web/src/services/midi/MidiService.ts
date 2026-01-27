import type { MidiDeviceInfo } from '../../types/midi';
import type { Patch } from '../../types/patch';
import {
  buildIdentityRequest,
  parseIdentityResponse,
  isIdentityReply,
  buildReadPatchMessage,
  isPatchReadResponse,
  parsePatchResponse,
  buildParameterMessage,
  buildModuleTypeMessage,
  buildModuleToggleMessage,
  buildEnterEditMessage,
  buildExitEditMessage,
  buildPatchSelectMessage,
  buildWritePatchMessage,
  serializePatch,
} from './protocol';
import type { DeviceIdentity, RawPatchData } from './protocol';

// Throttle interval for parameter changes (30 msg/s = ~33ms)
const THROTTLE_INTERVAL_MS = 33;

/**
 * Service for interacting with MIDI devices via Web MIDI API.
 * Singleton pattern - use the exported `midiService` instance.
 */
class MidiService {
  private midiAccess: MIDIAccess | null = null;
  private inputPort: MIDIInput | null = null;
  private outputPort: MIDIOutput | null = null;
  private connectedDeviceId: string | null = null;
  private disconnectListeners: Set<() => void> = new Set();
  private stateChangeHandler: ((event: MIDIConnectionEvent) => void) | null = null;

  // Throttling for real-time parameter changes
  private lastSendTime: number = 0;
  private pendingMessage: Uint8Array | null = null;
  private throttleTimer: ReturnType<typeof setTimeout> | null = null;

  /**
   * Request access to Web MIDI API.
   * @returns MIDIAccess object if successful
   * @throws Error if Web MIDI is not supported or permission denied
   */
  async requestAccess(): Promise<MIDIAccess> {
    if (!navigator.requestMIDIAccess) {
      throw new Error('Web MIDI API is not supported in this browser');
    }

    try {
      // Request MIDI access with SysEx support (required for G9.2tt)
      this.midiAccess = await navigator.requestMIDIAccess({ sysex: true });
      return this.midiAccess;
    } catch (error) {
      throw new Error(
        `MIDI access denied: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Get list of available MIDI devices.
   * Pairs input and output ports by name.
   * @returns Array of available MIDI devices
   */
  getDevices(): MidiDeviceInfo[] {
    if (!this.midiAccess) {
      return [];
    }

    const devices: MidiDeviceInfo[] = [];
    const inputNames = new Map<string, MIDIInput>();
    const outputNames = new Map<string, MIDIOutput>();

    // Collect inputs
    this.midiAccess.inputs.forEach((input) => {
      if (input.name) {
        inputNames.set(input.name, input);
      }
    });

    // Collect outputs
    this.midiAccess.outputs.forEach((output) => {
      if (output.name) {
        outputNames.set(output.name, output);
      }
    });

    // Find matching pairs (devices that have both input and output)
    inputNames.forEach((input, name) => {
      const output = outputNames.get(name);
      if (output) {
        devices.push({
          id: input.id,
          name: name,
          manufacturer: input.manufacturer || undefined,
        });
      }
    });

    return devices;
  }

  /**
   * Connect to a MIDI device by ID.
   * @param deviceId The input port ID to connect to
   * @throws Error if device not found or connection fails
   */
  async connect(deviceId: string): Promise<void> {
    if (!this.midiAccess) {
      throw new Error('MIDI access not granted. Call requestAccess() first.');
    }

    // Find the input port
    const input = this.midiAccess.inputs.get(deviceId);
    if (!input) {
      throw new Error(`MIDI input device not found: ${deviceId}`);
    }

    // Find matching output port by name
    let matchingOutput: MIDIOutput | undefined;
    for (const output of this.midiAccess.outputs.values()) {
      if (output.name === input.name) {
        matchingOutput = output;
        break;
      }
    }

    if (!matchingOutput) {
      throw new Error(`No matching MIDI output found for device: ${input.name}`);
    }

    // Open ports
    await input.open();
    await matchingOutput.open();

    this.inputPort = input;
    this.outputPort = matchingOutput;
    this.connectedDeviceId = deviceId;

    // Listen for device disconnection
    this.stateChangeHandler = (event: MIDIConnectionEvent) => {
      const port = event.port;
      if (port && port.state === 'disconnected' &&
          (port.id === this.inputPort?.id || port.id === this.outputPort?.id)) {
        this.handleUnexpectedDisconnect();
      }
    };
    this.midiAccess.addEventListener('statechange', this.stateChangeHandler);
  }

  /**
   * Send an identity request and wait for the device to identify itself.
   * @param timeout Maximum time to wait for response in ms (default: 2000)
   * @returns Device identity or null if no response
   */
  async identify(timeout: number = 2000): Promise<DeviceIdentity | null> {
    if (!this.inputPort || !this.outputPort) {
      throw new Error('Not connected to a MIDI device');
    }

    const inputPort = this.inputPort;
    const outputPort = this.outputPort;

    return new Promise((resolve) => {
      let resolved = false;
      const timeoutRef = { id: 0 as ReturnType<typeof setTimeout> };

      const handleMessage = (event: MIDIMessageEvent) => {
        if (resolved) return;

        const data = event.data;
        if (data && isIdentityReply(data)) {
          resolved = true;
          clearTimeout(timeoutRef.id);
          inputPort.removeEventListener('midimessage', handleMessage);
          resolve(parseIdentityResponse(data));
        }
      };

      // Set up listener before sending request
      inputPort.addEventListener('midimessage', handleMessage);

      // Set timeout
      timeoutRef.id = setTimeout(() => {
        if (!resolved) {
          resolved = true;
          inputPort.removeEventListener('midimessage', handleMessage);
          resolve(null);
        }
      }, timeout);

      // Send identity request
      const request = buildIdentityRequest();
      outputPort.send(Array.from(request));
    });
  }

  /**
   * Read a single patch from the device.
   * @param patchId Patch number (0-99)
   * @param timeout Maximum time to wait in ms (default: 2000)
   * @returns Parsed Patch object or null if timeout/error
   */
  async readPatch(patchId: number, timeout: number = 2000): Promise<Patch | null> {
    if (!this.inputPort || !this.outputPort) {
      throw new Error('Not connected to a MIDI device');
    }

    const inputPort = this.inputPort;
    const outputPort = this.outputPort;

    return new Promise((resolve) => {
      let resolved = false;
      const timeoutRef = { id: 0 as ReturnType<typeof setTimeout> };

      const handleMessage = (event: MIDIMessageEvent) => {
        if (resolved) return;

        const data = event.data;
        if (data && isPatchReadResponse(data)) {
          const rawPatch = parsePatchResponse(data);
          if (rawPatch && rawPatch.patchId === patchId) {
            resolved = true;
            clearTimeout(timeoutRef.id);
            inputPort.removeEventListener('midimessage', handleMessage);
            resolve(this.convertRawToPatch(rawPatch));
          }
        }
      };

      inputPort.addEventListener('midimessage', handleMessage);

      timeoutRef.id = setTimeout(() => {
        if (!resolved) {
          resolved = true;
          inputPort.removeEventListener('midimessage', handleMessage);
          resolve(null);
        }
      }, timeout);

      const request = buildReadPatchMessage(patchId);
      outputPort.send(Array.from(request));
    });
  }

  /**
   * Read all 100 patches from the device.
   * @param onProgress Optional callback for progress updates (0-100)
   * @returns Array of 100 patches or partial array if errors occurred
   */
  async readAllPatches(
    onProgress?: (progress: number, current: number) => void
  ): Promise<Patch[]> {
    const patches: Patch[] = [];

    for (let i = 0; i < 100; i++) {
      try {
        const patch = await this.readPatch(i, 3000);
        if (patch) {
          patches.push(patch);
        } else {
          // Create placeholder for failed reads
          patches.push(this.createEmptyPatch(i, `Patch ${String(i).padStart(2, '0')} (Error)`));
        }
      } catch (error) {
        console.error(`Failed to read patch ${i}:`, error);
        patches.push(this.createEmptyPatch(i, `Patch ${String(i).padStart(2, '0')} (Error)`));
      }

      const progress = Math.round(((i + 1) / 100) * 100);
      onProgress?.(progress, i);

      // Small delay between reads to avoid overwhelming the device
      await new Promise(r => setTimeout(r, 50));
    }

    return patches;
  }

  /**
   * Convert raw patch data from device to Patch object.
   */
  private convertRawToPatch(raw: RawPatchData): Patch {
    return {
      id: raw.patchId,
      name: raw.name,
      level: raw.level,
      modules: {
        amp: {
          enabled: raw.modules.amp.enabled,
          type: raw.modules.amp.type,
          params: raw.modules.amp.params,
        },
        comp: {
          enabled: raw.modules.cmp.enabled,
          type: raw.modules.cmp.type,
          params: raw.modules.cmp.params,
        },
        wah: {
          enabled: raw.modules.wah.enabled,
          type: raw.modules.wah.type,
          params: raw.modules.wah.params,
        },
        ext: {
          enabled: raw.modules.ext.enabled,
          type: 0,
          params: raw.modules.ext.params,
        },
        znr: {
          enabled: raw.modules.znr.enabled,
          type: raw.modules.znr.type,
          params: raw.modules.znr.params,
        },
        eq: {
          enabled: raw.modules.eq.enabled,
          type: 0,
          params: raw.modules.eq.params,
        },
        cab: {
          enabled: raw.modules.cab.enabled,
          type: 0,
          params: raw.modules.cab.params,
        },
        mod: {
          enabled: raw.modules.mod.enabled,
          type: raw.modules.mod.type,
          params: raw.modules.mod.params,
        },
        dly: {
          enabled: raw.modules.dly.enabled,
          type: raw.modules.dly.type,
          params: raw.modules.dly.params,
        },
        rev: {
          enabled: raw.modules.rev.enabled,
          type: raw.modules.rev.type,
          params: raw.modules.rev.params,
        },
      },
    };
  }

  /**
   * Create an empty patch placeholder.
   */
  private createEmptyPatch(id: number, name: string): Patch {
    const defaultModule = { enabled: false, type: 0, params: [0, 0, 0, 0] };
    return {
      id,
      name,
      level: 80,
      modules: {
        amp: { ...defaultModule },
        comp: { ...defaultModule },
        wah: { ...defaultModule },
        ext: { ...defaultModule, params: [0, 0, 0] },
        znr: { ...defaultModule, params: [0] },
        eq: { ...defaultModule, params: [16, 16, 16, 16, 16, 16] },
        cab: { ...defaultModule, params: [0, 0, 0] },
        mod: { ...defaultModule },
        dly: { ...defaultModule },
        rev: { ...defaultModule },
      },
    };
  }

  /**
   * Handle unexpected device disconnection.
   */
  private handleUnexpectedDisconnect(): void {
    this.inputPort = null;
    this.outputPort = null;
    this.connectedDeviceId = null;

    // Remove state change handler
    if (this.midiAccess && this.stateChangeHandler) {
      this.midiAccess.removeEventListener('statechange', this.stateChangeHandler);
      this.stateChangeHandler = null;
    }

    // Notify all disconnect listeners
    this.disconnectListeners.forEach(listener => listener());
  }

  /**
   * Disconnect from the current MIDI device.
   */
  disconnect(): void {
    // Remove state change handler
    if (this.midiAccess && this.stateChangeHandler) {
      this.midiAccess.removeEventListener('statechange', this.stateChangeHandler);
      this.stateChangeHandler = null;
    }

    // Reset edit mode state
    this.isInEditMode = false;
    this.currentPreviewPatchId = null;

    // Clear throttle state
    if (this.throttleTimer) {
      clearTimeout(this.throttleTimer);
      this.throttleTimer = null;
    }
    this.pendingMessage = null;

    if (this.inputPort) {
      this.inputPort.close();
      this.inputPort = null;
    }
    if (this.outputPort) {
      this.outputPort.close();
      this.outputPort = null;
    }
    this.connectedDeviceId = null;
  }

  /**
   * Check if currently connected to a device.
   */
  get isConnected(): boolean {
    return this.inputPort !== null && this.outputPort !== null;
  }

  /**
   * Get the currently connected device ID.
   */
  get deviceId(): string | null {
    return this.connectedDeviceId;
  }

  /**
   * Get the input port (for receiving MIDI messages).
   */
  get input(): MIDIInput | null {
    return this.inputPort;
  }

  /**
   * Get the output port (for sending MIDI messages).
   */
  get output(): MIDIOutput | null {
    return this.outputPort;
  }

  /**
   * Send a MIDI message to the connected device.
   * @param data The MIDI message bytes
   * @throws Error if not connected
   */
  send(data: number[] | Uint8Array): void {
    if (!this.outputPort) {
      throw new Error('Not connected to a MIDI device');
    }
    this.outputPort.send(data instanceof Uint8Array ? Array.from(data) : data);
  }

  /**
   * Add a listener for incoming MIDI messages.
   * @param callback Function to call when a message is received
   * @returns Function to remove the listener
   */
  onMessage(callback: (event: MIDIMessageEvent) => void): () => void {
    if (!this.inputPort) {
      throw new Error('Not connected to a MIDI device');
    }

    this.inputPort.addEventListener('midimessage', callback);
    return () => {
      this.inputPort?.removeEventListener('midimessage', callback);
    };
  }

  /**
   * Add a listener for unexpected device disconnection.
   * @param callback Function to call when device disconnects unexpectedly
   * @returns Function to remove the listener
   */
  onDisconnect(callback: () => void): () => void {
    this.disconnectListeners.add(callback);
    return () => {
      this.disconnectListeners.delete(callback);
    };
  }

  // ============================================
  // Real-Time Parameter Control
  // ============================================

  /**
   * Send a throttled MIDI message.
   * Ensures max 30 messages/second to avoid overwhelming the device.
   * @param message The MIDI message to send
   */
  private sendThrottled(message: Uint8Array): void {
    if (!this.outputPort) {
      console.warn('[MIDI] Cannot send: not connected');
      return;
    }

    const now = Date.now();
    const timeSinceLastSend = now - this.lastSendTime;
    const hexMsg = Array.from(message).map(b => b.toString(16).padStart(2, '0')).join(' ');

    // If enough time has passed, send immediately
    if (timeSinceLastSend >= THROTTLE_INTERVAL_MS) {
      console.log('[MIDI] Sending:', hexMsg);
      try {
        // Send with timestamp 0 for immediate delivery
        this.outputPort.send(Array.from(message), 0);
        console.log('[MIDI] Send successful');
      } catch (error) {
        console.error('[MIDI] Send failed:', error);
      }
      this.lastSendTime = now;
      this.pendingMessage = null;

      // Clear any pending timer
      if (this.throttleTimer) {
        clearTimeout(this.throttleTimer);
        this.throttleTimer = null;
      }
    } else {
      // Store message and schedule for later
      console.log('[MIDI] Throttling (will send in', THROTTLE_INTERVAL_MS - timeSinceLastSend, 'ms):', hexMsg);
      this.pendingMessage = message;

      // Only set timer if not already set
      if (!this.throttleTimer) {
        const delay = THROTTLE_INTERVAL_MS - timeSinceLastSend;
        this.throttleTimer = setTimeout(() => {
          if (this.pendingMessage && this.outputPort) {
            const delayedHex = Array.from(this.pendingMessage).map(b => b.toString(16).padStart(2, '0')).join(' ');
            console.log('[MIDI] Sending (delayed):', delayedHex);
            try {
              this.outputPort.send(Array.from(this.pendingMessage), 0);
              console.log('[MIDI] Send successful (delayed)');
            } catch (error) {
              console.error('[MIDI] Send failed (delayed):', error);
            }
            this.lastSendTime = Date.now();
            this.pendingMessage = null;
          }
          this.throttleTimer = null;
        }, delay);
      }
    }
  }

  /**
   * Send a parameter change to the device in real-time.
   * @param moduleKey Module name (amp, comp, etc.)
   * @param paramIndex Parameter index in the params array
   * @param value Parameter value
   */
  sendParameter(moduleKey: string, paramIndex: number, value: number): void {
    console.log(`[MidiService] sendParameter called: module=${moduleKey} paramIndex=${paramIndex} value=${value}`);

    if (!this.outputPort) {
      console.warn('[MidiService] Cannot sendParameter: outputPort is null');
      return;
    }

    try {
      const message = buildParameterMessage(moduleKey, paramIndex, value);
      console.log('[MidiService] Built message, sending via throttle...');
      this.sendThrottled(message);
    } catch (error) {
      console.error('[MidiService] Failed to build parameter message:', error);
    }
  }

  /**
   * Send a module type change to the device in real-time.
   * @param moduleKey Module name (amp, comp, etc.)
   * @param typeId Effect type ID
   */
  sendModuleType(moduleKey: string, typeId: number): void {
    console.log(`[MidiService] sendModuleType called: module=${moduleKey} typeId=${typeId}`);
    try {
      const message = buildModuleTypeMessage(moduleKey, typeId);
      this.sendThrottled(message);
    } catch (error) {
      console.error('[MidiService] Failed to build type message:', error);
    }
  }

  /**
   * Send a module on/off toggle to the device in real-time.
   * @param moduleKey Module name (amp, comp, etc.)
   * @param enabled Whether the module should be enabled
   */
  sendModuleToggle(moduleKey: string, enabled: boolean): void {
    console.log(`[MidiService] sendModuleToggle called: module=${moduleKey} enabled=${enabled}`);
    try {
      const message = buildModuleToggleMessage(moduleKey, enabled);
      this.sendThrottled(message);
    } catch (error) {
      console.error('[MidiService] Failed to build toggle message:', error);
    }
  }

  // ============================================
  // Online/Preview Mode
  // ============================================

  private isInEditMode: boolean = false;
  private currentPreviewPatchId: number | null = null;

  /**
   * Enter edit mode on the device.
   * Required for online/preview mode and write operations.
   * Sends: F0 52 00 42 12 F7
   */
  async enterEditMode(): Promise<void> {
    if (!this.outputPort) {
      throw new Error('Not connected to a MIDI device');
    }

    if (this.isInEditMode) {
      console.log('[MIDI] Already in edit mode');
      return; // Already in edit mode
    }

    const enterEdit = buildEnterEditMessage();
    console.log('[MIDI] Sending ENTER_EDIT:', Array.from(enterEdit).map(b => b.toString(16).padStart(2, '0')).join(' '));
    this.outputPort.send(Array.from(enterEdit));
    this.isInEditMode = true;

    // Small delay for device to process
    await new Promise(resolve => setTimeout(resolve, 100));
    console.log('[MIDI] Edit mode entered');
  }

  /**
   * Exit edit mode on the device.
   * Changes made during edit mode are discarded unless confirmed.
   * Sends: F0 52 00 42 1F F7
   */
  async exitEditMode(): Promise<void> {
    if (!this.outputPort) {
      console.log('[MIDI] Cannot exit edit mode: not connected');
      return;
    }

    if (!this.isInEditMode) {
      console.log('[MIDI] Not in edit mode, nothing to exit');
      return; // Not in edit mode
    }

    const exitEdit = buildExitEditMessage();
    console.log('[MIDI] Sending EXIT_EDIT:', Array.from(exitEdit).map(b => b.toString(16).padStart(2, '0')).join(' '));
    this.outputPort.send(Array.from(exitEdit));
    this.isInEditMode = false;
    this.currentPreviewPatchId = null;

    // Small delay for device to process
    await new Promise(resolve => setTimeout(resolve, 100));
    console.log('[MIDI] Edit mode exited');
  }

  /**
   * Select a patch for preview (makes it the active patch on the device).
   * @param patchId Patch number (0-99)
   */
  async selectPatchForPreview(patchId: number): Promise<void> {
    if (!this.outputPort) {
      throw new Error('Not connected to a MIDI device');
    }

    if (patchId < 0 || patchId > 99) {
      throw new Error(`Invalid patch ID: ${patchId}. Must be 0-99.`);
    }

    // Enter edit mode if not already
    if (!this.isInEditMode) {
      await this.enterEditMode();
    }

    // Select patch with preview mode (0x02)
    const selectPatch = buildPatchSelectMessage(patchId, 0x02);
    this.outputPort.send(Array.from(selectPatch));
    this.currentPreviewPatchId = patchId;

    // Small delay for device to process
    await new Promise(resolve => setTimeout(resolve, 50));
  }

  /**
   * Send a patch to the device for preview (hear changes without saving).
   * The patch data is sent via 0x28 command.
   * @param patch The Patch object to preview
   */
  async previewPatch(patch: Patch): Promise<void> {
    if (!this.outputPort) {
      throw new Error('Not connected to a MIDI device');
    }

    // Enter edit mode and select patch if needed
    if (!this.isInEditMode || this.currentPreviewPatchId !== patch.id) {
      await this.selectPatchForPreview(patch.id);
    }

    // Serialize and send patch data for preview
    const rawData = serializePatch(patch);
    const writeData = buildWritePatchMessage(rawData);
    this.outputPort.send(Array.from(writeData));
  }

  /**
   * Check if currently in edit/preview mode.
   */
  get inEditMode(): boolean {
    return this.isInEditMode;
  }

  /**
   * Get the currently previewing patch ID.
   */
  get previewingPatchId(): number | null {
    return this.currentPreviewPatchId;
  }

  /**
   * Send a patch change command to switch the active patch on the device.
   * Uses MIDI Program Change message (not SysEx) for immediate switching.
   * @param patchId Patch number (0-99)
   */
  sendPatchChange(patchId: number): void {
    if (!this.outputPort) {
      console.warn('Cannot send patch change: not connected');
      return;
    }

    if (patchId < 0 || patchId > 99) {
      console.error(`Invalid patch ID: ${patchId}`);
      return;
    }

    // Use MIDI Program Change message (0xC0 + program number)
    // Format: [0xC0, patchId] - Channel 1 Program Change
    const programChange = [0xC0, patchId];
    console.log('[MIDI] Sending Program Change:', programChange.map(b => b.toString(16).padStart(2, '0')).join(' '));
    this.outputPort.send(programChange);
  }

  // ============================================
  // Patch Writing
  // ============================================

  /**
   * Write a patch to the device.
   *
   * Write flow:
   * 1. Enter edit mode (0x12)
   * 2. Select patch (0x31 with mode 0x02 for preview)
   * 3. Send patch data (0x28 with 7-bit encoded 147 bytes)
   * 4. Confirm write (0x31 with mode 0x09)
   * 5. Exit edit mode (0x1F)
   *
   * @param patchId Patch number (0-99)
   * @param patch The Patch object to write
   * @throws Error if write fails
   */
  async writePatch(patchId: number, patch: Patch): Promise<void> {
    if (!this.outputPort) {
      throw new Error('Not connected to a MIDI device');
    }

    if (patchId < 0 || patchId > 99) {
      throw new Error(`Invalid patch ID: ${patchId}. Must be 0-99.`);
    }

    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

    try {
      // Step 1: Enter edit mode
      const enterEdit = buildEnterEditMessage();
      this.outputPort.send(Array.from(enterEdit));
      await delay(100);

      // Step 2: Select the patch for preview
      const selectPatch = buildPatchSelectMessage(patchId, 0x02);
      this.outputPort.send(Array.from(selectPatch));
      await delay(100);

      // Step 3: Serialize and send patch data
      const rawData = serializePatch(patch);
      const writeData = buildWritePatchMessage(rawData);
      this.outputPort.send(Array.from(writeData));
      await delay(200);

      // Step 4: Confirm the write
      const confirmWrite = buildPatchSelectMessage(patchId, 0x09);
      this.outputPort.send(Array.from(confirmWrite));
      await delay(100);

      // Step 5: Exit edit mode
      const exitEdit = buildExitEditMessage();
      this.outputPort.send(Array.from(exitEdit));
      await delay(100);

      // Re-read to verify the write (optional but good for confirmation)
      // The device should now have the updated patch

    } catch (error) {
      // Try to exit edit mode even if something failed
      try {
        const exitEdit = buildExitEditMessage();
        this.outputPort?.send(Array.from(exitEdit));
      } catch {
        // Ignore exit error
      }

      throw new Error(
        `Failed to write patch ${patchId}: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  // ============================================
  // Debug/Test Methods
  // ============================================

  /**
   * Send a test parameter change to verify MIDI communication.
   * This sends AMP Gain = 50 (a safe, audible test).
   */
  testParameterChange(): void {
    console.log('[MidiService] === TEST PARAMETER CHANGE ===');

    if (!this.outputPort) {
      console.error('[MidiService] TEST FAILED: outputPort is null');
      return;
    }

    // Send AMP Gain = 50
    // F0 52 00 42 31 05 02 32 00 F7
    const testMessage = new Uint8Array([
      0xF0, 0x52, 0x00, 0x42,  // Header
      0x31,                     // CMD_PARAMETER_CHANGE
      0x05,                     // Effect ID: AMP
      0x02,                     // Param ID: Gain
      0x32,                     // Value: 50 (0x32)
      0x00,                     // Padding
      0xF7,                     // End
    ]);

    const hexMsg = Array.from(testMessage).map(b => b.toString(16).padStart(2, '0')).join(' ');
    console.log('[MidiService] Test message:', hexMsg);

    try {
      this.outputPort.send(Array.from(testMessage));
      console.log('[MidiService] TEST: Message sent successfully!');
      console.log('[MidiService] If the pedal has AMP enabled, you should hear the gain change.');
    } catch (error) {
      console.error('[MidiService] TEST FAILED: Send error:', error);
    }
  }

  /**
   * Send a raw SysEx message for debugging.
   * @param bytes Array of bytes (including F0 and F7)
   */
  sendRawSysEx(bytes: number[]): void {
    console.log('[MidiService] sendRawSysEx:', bytes.map(b => b.toString(16).padStart(2, '0')).join(' '));

    if (!this.outputPort) {
      console.error('[MidiService] Cannot send: not connected');
      return;
    }

    try {
      this.outputPort.send(bytes);
      console.log('[MidiService] Raw SysEx sent successfully');
    } catch (error) {
      console.error('[MidiService] Send error:', error);
    }
  }
}

// Export singleton instance
export const midiService = new MidiService();
