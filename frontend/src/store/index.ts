// frontend/src/store/index.ts
/**
 * Store Index
 * Central exports for all Zustand stores
 */

// FIX: Use explicit imports instead of re-export-only syntax.
//
// The original code used:
//   export { useDataStore } from './dataStore'
//
// That syntax is a "re-export" — it passes the binding through to importers
// but does NOT create a local variable named useDataStore in this module.
// Any code in this same file that references useDataStore (e.g. in resetAllStores
// or the default export object) gets ReferenceError: useDataStore is not defined.
//
// The fix: import first (creates a local variable), then re-export.

// Data Store
import useDataStore from './dataStore';
export type { Customer, Dataset } from './dataStore';
export { useDataStore };

// ML Store
import useMLStore from './mlStore';
export type { MLPrediction, ModelInfo } from './mlStore';
export { useMLStore };

// UI Store
import useUIStore from './uiStore';
export type { Theme, Language, Timezone, Currency } from './uiStore';
export { useUIStore };

// Auth Store
import useAuthStore from './authStore';
export type { User, AuthTokens } from './authStore';
export { useAuthStore };

// Store reset utility
export const resetAllStores = () => {
  useDataStore.getState().reset();
  useMLStore.getState().reset();
  useUIStore.getState().reset();
  useAuthStore.getState().reset();
};

// Store initialization
export const initializeStores = () => {
  // Check auth session
  const authStore = useAuthStore.getState();
  if (authStore.isAuthenticated) {
    authStore.checkSession();
  }

  // Apply theme
  const uiStore = useUIStore.getState();
  uiStore.setTheme(uiStore.theme);

  console.log('Stores initialized');
};

// Default export with all stores
export default {
  useDataStore,
  useMLStore,
  useUIStore,
  useAuthStore,
  resetAllStores,
  initializeStores
};
