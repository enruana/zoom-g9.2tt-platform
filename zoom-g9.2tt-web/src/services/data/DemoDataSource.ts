import type { DataSource, Patch, ModuleName } from '../../types/patch';
import { demoPatches, getDemoPatch } from '../../data/demoPatches';

/**
 * Demo mode data source.
 * Provides mock data for exploring the app without a connected device.
 * All operations work on local state only.
 */
class DemoDataSourceImpl implements DataSource {
  /** Local copy of patches for modification */
  private patches: Patch[];

  constructor() {
    // Deep clone demo patches so we can modify them
    this.patches = JSON.parse(JSON.stringify(demoPatches)) as Patch[];
  }

  async readPatch(id: number): Promise<Patch> {
    // Simulate network delay
    await this.simulateDelay(50);

    const patch = this.patches[id];
    if (!patch) {
      throw new Error(`Patch ${id} not found`);
    }
    return { ...patch };
  }

  async writePatch(id: number, patch: Patch): Promise<void> {
    // Simulate network delay
    await this.simulateDelay(100);

    if (id < 0 || id >= 100) {
      throw new Error(`Invalid patch ID: ${id}`);
    }

    // Update local state
    this.patches[id] = { ...patch, id };

    // Log for demo mode visibility
    console.log(`[Demo Mode] Patch ${id} saved locally (not written to device)`);
  }

  sendParameter(module: ModuleName, paramIndex: number, value: number): void {
    // In demo mode, parameter changes are logged but not sent anywhere
    console.log(`[Demo Mode] Parameter change: ${module}[${paramIndex}] = ${value}`);
  }

  async readAllPatches(): Promise<Patch[]> {
    // Simulate reading all patches with progress
    await this.simulateDelay(200);
    return this.patches.map(p => ({ ...p }));
  }

  /** Reset demo data to initial state */
  reset(): void {
    this.patches = JSON.parse(JSON.stringify(demoPatches)) as Patch[];
  }

  /** Get a preview patch without async (for initial load) */
  getPatchSync(id: number): Patch | undefined {
    return getDemoPatch(id);
  }

  private simulateDelay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/** Singleton instance */
export const demoDataSource = new DemoDataSourceImpl();
