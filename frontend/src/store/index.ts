// frontend/src/store/index.ts
/**
 * Store Index
 * Central exports for all Zustand stores
 */

// Data Store
export { useDataStore } from './dataStore';
export type { Customer, Dataset } from './dataStore';
export {
  selectCustomers,
  selectFilteredCustomers,
  selectSelectedCustomers,
  selectHighRiskCustomers,
  selectDatasets,
  selectActiveDataset,
  selectStatistics
} from './dataStore';

// ML Store
export { useMLStore } from './mlStore';
export type { MLPrediction, ModelInfo } from './mlStore';

// UI Store
export { useUIStore } from './uiStore';
export type { Theme, Language, Timezone, Currency } from './uiStore';
export {
  selectTheme,
  selectLanguage,
  selectNotifications,
  selectUnreadCount,
  selectModals,
  selectSidebarState
} from './uiStore';

// Auth Store
export { useAuthStore } from './authStore';
export type { User, AuthTokens } from './authStore';
export {
  selectUser,
  selectIsAuthenticated,
  selectUserRole,
  selectIsAdmin,
  selectAuthLoading,
  selectAuthError,
  hasPermission
} from './authStore';

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
