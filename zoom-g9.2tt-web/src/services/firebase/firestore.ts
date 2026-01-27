/**
 * Firestore Patch Storage Service
 *
 * Stores user patches in Firestore with the structure:
 * users/{userId}/patches/{patchId}
 */

import {
  getFirestore,
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  writeBatch,
  type Firestore,
} from 'firebase/firestore';
import { firebaseApp } from './config';
import type { Patch } from '../../types/patch';

let db: Firestore | null = null;

/**
 * Initialize Firestore.
 * Returns null if Firebase is not configured.
 */
function initFirestore(): Firestore | null {
  if (!firebaseApp) {
    console.warn('[Firestore] Firebase not configured, Firestore disabled');
    return null;
  }

  if (!db) {
    db = getFirestore(firebaseApp);
  }

  return db;
}

/**
 * Get the patches collection reference for a user.
 */
function getPatchesCollection(userId: string) {
  const firestore = initFirestore();
  if (!firestore) return null;
  return collection(firestore, 'users', userId, 'patches');
}

/**
 * Convert Patch to Firestore-safe object.
 * Firestore doesn't support certain types, so we ensure clean JSON.
 */
function patchToFirestore(patch: Patch): Record<string, unknown> {
  return {
    id: patch.id,
    name: patch.name,
    level: patch.level,
    modules: {
      amp: { enabled: patch.modules.amp.enabled, type: patch.modules.amp.type, params: [...patch.modules.amp.params] },
      comp: { enabled: patch.modules.comp.enabled, type: patch.modules.comp.type, params: [...patch.modules.comp.params] },
      wah: { enabled: patch.modules.wah.enabled, type: patch.modules.wah.type, params: [...patch.modules.wah.params] },
      ext: { enabled: patch.modules.ext.enabled, type: patch.modules.ext.type, params: [...patch.modules.ext.params] },
      znr: { enabled: patch.modules.znr.enabled, type: patch.modules.znr.type, params: [...patch.modules.znr.params] },
      eq: { enabled: patch.modules.eq.enabled, type: patch.modules.eq.type, params: [...patch.modules.eq.params] },
      cab: { enabled: patch.modules.cab.enabled, type: patch.modules.cab.type, params: [...patch.modules.cab.params] },
      mod: { enabled: patch.modules.mod.enabled, type: patch.modules.mod.type, params: [...patch.modules.mod.params] },
      dly: { enabled: patch.modules.dly.enabled, type: patch.modules.dly.type, params: [...patch.modules.dly.params] },
      rev: { enabled: patch.modules.rev.enabled, type: patch.modules.rev.type, params: [...patch.modules.rev.params] },
    },
    updatedAt: Date.now(),
  };
}

/**
 * Convert Firestore document to Patch.
 */
function firestoreToPatch(data: Record<string, unknown>): Patch {
  const modules = data.modules as Record<string, { enabled: boolean; type: number; params: number[] }> | undefined;

  // Helper to safely get module data
  const getModule = (name: string) => {
    const mod = modules?.[name];
    return {
      enabled: mod?.enabled ?? false,
      type: mod?.type ?? 0,
      params: mod?.params ?? [],
    };
  };

  return {
    id: data.id as number,
    name: data.name as string,
    level: data.level as number,
    modules: {
      amp: getModule('amp'),
      comp: getModule('comp'),
      wah: getModule('wah'),
      ext: getModule('ext'),
      znr: getModule('znr'),
      eq: getModule('eq'),
      cab: getModule('cab'),
      mod: getModule('mod'),
      dly: getModule('dly'),
      rev: getModule('rev'),
    },
  };
}

/**
 * Load a single patch for a user.
 * @param userId The authenticated user's ID
 * @param patchId The patch number (0-99)
 * @returns The patch, or null if not found
 */
export async function loadPatch(userId: string, patchId: number): Promise<Patch | null> {
  const patchesCollection = getPatchesCollection(userId);
  if (!patchesCollection) return null;

  try {
    const docRef = doc(patchesCollection, String(patchId));
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return firestoreToPatch(docSnap.data());
    }
    return null;
  } catch (error) {
    console.error('[Firestore] Failed to load patch:', error);
    throw new Error('Failed to load patch from cloud');
  }
}

/**
 * Load all patches for a user.
 * @param userId The authenticated user's ID
 * @returns Array of patches (may be sparse - only patches that exist)
 */
export async function loadPatches(userId: string): Promise<Patch[]> {
  const patchesCollection = getPatchesCollection(userId);
  if (!patchesCollection) return [];

  try {
    const querySnapshot = await getDocs(patchesCollection);
    const patches: Patch[] = [];

    querySnapshot.forEach((docSnap) => {
      patches.push(firestoreToPatch(docSnap.data()));
    });

    // Sort by ID
    patches.sort((a, b) => a.id - b.id);

    return patches;
  } catch (error) {
    console.error('[Firestore] Failed to load patches:', error);
    throw new Error('Failed to load patches from cloud');
  }
}

/**
 * Save a single patch for a user.
 * @param userId The authenticated user's ID
 * @param patchId The patch number (0-99)
 * @param patch The patch data to save
 */
export async function savePatch(userId: string, patchId: number, patch: Patch): Promise<void> {
  const patchesCollection = getPatchesCollection(userId);
  if (!patchesCollection) {
    throw new Error('Firestore not configured');
  }

  try {
    const docRef = doc(patchesCollection, String(patchId));
    await setDoc(docRef, patchToFirestore(patch));
  } catch (error) {
    console.error('[Firestore] Failed to save patch:', error);
    throw new Error('Failed to save patch to cloud');
  }
}

/**
 * Save all patches for a user (batch operation).
 * @param userId The authenticated user's ID
 * @param patches Array of all 100 patches
 */
export async function saveAllPatches(userId: string, patches: Patch[]): Promise<void> {
  const firestore = initFirestore();
  if (!firestore) {
    throw new Error('Firestore not configured');
  }

  const patchesCollection = getPatchesCollection(userId);
  if (!patchesCollection) {
    throw new Error('Firestore not configured');
  }

  try {
    // Firestore batch writes are limited to 500 operations
    // We have 100 patches, so one batch is enough
    const batch = writeBatch(firestore);

    for (const patch of patches) {
      const docRef = doc(patchesCollection, String(patch.id));
      batch.set(docRef, patchToFirestore(patch));
    }

    await batch.commit();
  } catch (error) {
    console.error('[Firestore] Failed to save all patches:', error);
    throw new Error('Failed to save patches to cloud');
  }
}

/**
 * Check if Firestore is available/configured.
 */
export function isFirestoreAvailable(): boolean {
  return firebaseApp !== null;
}
