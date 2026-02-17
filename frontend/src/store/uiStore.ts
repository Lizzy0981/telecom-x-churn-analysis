// frontend/src/store/uiStore.ts
/**
 * UI Store (Zustand)
 * State management for UI preferences and settings
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { devtools } from 'zustand/middleware';

export type Theme = 'light' | 'dark' | 'auto';
export type Language = 'en' | 'es' | 'pt' | 'fr' | 'ar' | 'he' | 'zh' | 'ru' | 'tr' | 'ko' | 'ja';
export type Timezone = string;
export type Currency = 'USD' | 'EUR' | 'GBP' | 'JPY' | 'CNY' | 'DOP' | 'BRL' | 'MXN';

interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
}

interface Modal {
  id: string;
  isOpen: boolean;
  content?: any;
  props?: any;
}

interface UIState {
  // Theme & Display
  theme: Theme;
  sidebarCollapsed: boolean;
  sidebarOpen: boolean;
  compactMode: boolean;
  
  // Language & Localization
  language: Language;
  timezone: Timezone;
  currency: Currency;
  dateFormat: 'ISO' | 'US' | 'EU';
  
  // Notifications
  notifications: Notification[];
  notificationCount: number;
  showNotifications: boolean;
  
  // Modals
  modals: Modal[];
  
  // Loading states
  globalLoading: boolean;
  loadingMessage: string;
  
  // Tour & Help
  showTour: boolean;
  tourStep: number;
  showHelp: boolean;
  
  // Layout
  chartLayout: 'grid' | 'list';
  tablePageSize: number;
  
  // Actions
  setTheme: (theme: Theme) => void;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setSidebarOpen: (open: boolean) => void;
  toggleCompactMode: () => void;
  
  // Language & Localization
  setLanguage: (language: Language) => void;
  setTimezone: (timezone: Timezone) => void;
  setCurrency: (currency: Currency) => void;
  setDateFormat: (format: 'ISO' | 'US' | 'EU') => void;
  
  // Notifications
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  removeNotification: (id: string) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  clearNotifications: () => void;
  toggleNotifications: () => void;
  
  // Modals
  openModal: (id: string, content?: any, props?: any) => void;
  closeModal: (id: string) => void;
  closeAllModals: () => void;
  
  // Loading
  setGlobalLoading: (loading: boolean, message?: string) => void;
  
  // Tour
  startTour: () => void;
  nextTourStep: () => void;
  prevTourStep: () => void;
  endTour: () => void;
  toggleHelp: () => void;
  
  // Layout
  setChartLayout: (layout: 'grid' | 'list') => void;
  setTablePageSize: (size: number) => void;
  
  // Reset
  reset: () => void;
}

const initialState = {
  theme: 'auto' as Theme,
  sidebarCollapsed: false,
  sidebarOpen: true,
  compactMode: false,
  language: 'en' as Language,
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  currency: 'USD' as Currency,
  dateFormat: 'ISO' as const,
  notifications: [],
  notificationCount: 0,
  showNotifications: false,
  modals: [],
  globalLoading: false,
  loadingMessage: '',
  showTour: false,
  tourStep: 0,
  showHelp: false,
  chartLayout: 'grid' as const,
  tablePageSize: 25
};

export const useUIStore = create<UIState>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,

        // Theme
        setTheme: (theme) => {
          set({ theme });
          
          // Apply theme to document
          if (theme === 'auto') {
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            document.documentElement.classList.toggle('dark', prefersDark);
          } else {
            document.documentElement.classList.toggle('dark', theme === 'dark');
          }
        },

        // Sidebar
        toggleSidebar: () => {
          set({ sidebarCollapsed: !get().sidebarCollapsed });
        },

        setSidebarCollapsed: (collapsed) => {
          set({ sidebarCollapsed: collapsed });
        },

        setSidebarOpen: (open) => {
          set({ sidebarOpen: open });
        },

        // Compact mode
        toggleCompactMode: () => {
          set({ compactMode: !get().compactMode });
        },

        // Language & Localization
        setLanguage: (language) => {
          set({ language });
          document.documentElement.lang = language;
        },

        setTimezone: (timezone) => set({ timezone }),

        setCurrency: (currency) => set({ currency }),

        setDateFormat: (format) => set({ dateFormat: format }),

        // Notifications
        addNotification: (notification) => {
          const newNotification: Notification = {
            ...notification,
            id: `notif-${Date.now()}-${Math.random()}`,
            timestamp: new Date(),
            read: false
          };

          const notifications = [newNotification, ...get().notifications].slice(0, 50); // Keep last 50
          const notificationCount = notifications.filter(n => !n.read).length;

          set({ notifications, notificationCount });

          // Auto-remove after 5 seconds for non-error notifications
          if (notification.type !== 'error') {
            setTimeout(() => {
              get().removeNotification(newNotification.id);
            }, 5000);
          }
        },

        removeNotification: (id) => {
          const notifications = get().notifications.filter(n => n.id !== id);
          const notificationCount = notifications.filter(n => !n.read).length;
          set({ notifications, notificationCount });
        },

        markNotificationRead: (id) => {
          const notifications = get().notifications.map(n =>
            n.id === id ? { ...n, read: true } : n
          );
          const notificationCount = notifications.filter(n => !n.read).length;
          set({ notifications, notificationCount });
        },

        markAllNotificationsRead: () => {
          const notifications = get().notifications.map(n => ({ ...n, read: true }));
          set({ notifications, notificationCount: 0 });
        },

        clearNotifications: () => {
          set({ notifications: [], notificationCount: 0 });
        },

        toggleNotifications: () => {
          set({ showNotifications: !get().showNotifications });
        },

        // Modals
        openModal: (id, content, props) => {
          const modals = [...get().modals, { id, isOpen: true, content, props }];
          set({ modals });
        },

        closeModal: (id) => {
          const modals = get().modals.filter(m => m.id !== id);
          set({ modals });
        },

        closeAllModals: () => {
          set({ modals: [] });
        },

        // Loading
        setGlobalLoading: (loading, message = '') => {
          set({ globalLoading: loading, loadingMessage: message });
        },

        // Tour
        startTour: () => {
          set({ showTour: true, tourStep: 0 });
        },

        nextTourStep: () => {
          set({ tourStep: get().tourStep + 1 });
        },

        prevTourStep: () => {
          const step = Math.max(0, get().tourStep - 1);
          set({ tourStep: step });
        },

        endTour: () => {
          set({ showTour: false, tourStep: 0 });
        },

        toggleHelp: () => {
          set({ showHelp: !get().showHelp });
        },

        // Layout
        setChartLayout: (layout) => set({ chartLayout: layout }),

        setTablePageSize: (size) => set({ tablePageSize: size }),

        // Reset
        reset: () => set(initialState)
      }),
      {
        name: 'ui-storage',
        storage: createJSONStorage(() => localStorage),
        partialize: (state) => ({
          theme: state.theme,
          sidebarCollapsed: state.sidebarCollapsed,
          compactMode: state.compactMode,
          language: state.language,
          timezone: state.timezone,
          currency: state.currency,
          dateFormat: state.dateFormat,
          chartLayout: state.chartLayout,
          tablePageSize: state.tablePageSize
        })
      }
    ),
    { name: 'UIStore' }
  )
);

// Selectors
export const selectTheme = (state: UIState) => state.theme;
export const selectLanguage = (state: UIState) => state.language;
export const selectNotifications = (state: UIState) => state.notifications;
export const selectUnreadCount = (state: UIState) => state.notificationCount;
export const selectModals = (state: UIState) => state.modals;
export const selectSidebarState = (state: UIState) => ({
  collapsed: state.sidebarCollapsed,
  open: state.sidebarOpen
});

export default useUIStore;
