// frontend/src/store/dataStore.ts
/**
 * Data Store (Zustand)
 * Global state for customer data and datasets
 */

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

export interface Customer {
  customerId: string;
  name?: string;
  tenure: number;
  monthlyCharges: number;
  totalCharges: number;
  contractType: string;
  paymentMethod: string;
  internetService: string;
  techSupport: string;
  onlineSecurity: string;
  churnProbability?: number;
  churnLabel?: 0 | 1;
  riskLevel?: 'low' | 'medium' | 'high';
}

export interface Dataset {
  id: string;
  name: string;
  data: Customer[];
  uploadedAt: Date;
  fileSize: number;
  rowCount: number;
  columnCount: number;
}

interface DataState {
  // Current dataset
  currentDataset: Dataset | null;
  
  // All datasets
  datasets: Dataset[];
  
  // Selected customers
  selectedCustomers: string[];
  
  // Filters
  filters: {
    search: string;
    contractType: string[];
    riskLevel: string[];
    minTenure: number;
    maxTenure: number;
  };
  
  // Sorting
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  
  // Pagination
  currentPage: number;
  pageSize: number;
  
  // Loading states
  loading: boolean;
  error: string | null;
}

interface DataActions {
  // Dataset actions
  setCurrentDataset: (dataset: Dataset | null) => void;
  addDataset: (dataset: Dataset) => void;
  removeDataset: (id: string) => void;
  updateDataset: (id: string, updates: Partial<Dataset>) => void;
  
  // Customer actions
  addCustomer: (customer: Customer) => void;
  updateCustomer: (customerId: string, updates: Partial<Customer>) => void;
  removeCustomer: (customerId: string) => void;
  
  // Selection actions
  selectCustomer: (customerId: string) => void;
  deselectCustomer: (customerId: string) => void;
  selectAll: () => void;
  deselectAll: () => void;
  toggleCustomer: (customerId: string) => void;
  
  // Filter actions
  setSearch: (search: string) => void;
  setContractTypeFilter: (types: string[]) => void;
  setRiskLevelFilter: (levels: string[]) => void;
  setTenureRange: (min: number, max: number) => void;
  clearFilters: () => void;
  
  // Sort actions
  setSorting: (field: string, order: 'asc' | 'desc') => void;
  
  // Pagination actions
  setPage: (page: number) => void;
  setPageSize: (size: number) => void;
  
  // Loading actions
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  
  // Computed
  getFilteredCustomers: () => Customer[];
  getPaginatedCustomers: () => Customer[];
  getCustomerById: (id: string) => Customer | undefined;
  getSelectedCustomers: () => Customer[];
  
  // Reset
  reset: () => void;
}

type DataStore = DataState & DataActions;

const initialState: DataState = {
  currentDataset: null,
  datasets: [],
  selectedCustomers: [],
  filters: {
    search: '',
    contractType: [],
    riskLevel: [],
    minTenure: 0,
    maxTenure: 120
  },
  sortBy: 'customerId',
  sortOrder: 'asc',
  currentPage: 1,
  pageSize: 25,
  loading: false,
  error: null
};

export const useDataStore = create<DataStore>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,

        // Dataset actions
        setCurrentDataset: (dataset) => set({ currentDataset: dataset }),

        addDataset: (dataset) => 
          set((state) => ({
            datasets: [...state.datasets, dataset],
            currentDataset: dataset
          })),

        removeDataset: (id) =>
          set((state) => ({
            datasets: state.datasets.filter(d => d.id !== id),
            currentDataset: state.currentDataset?.id === id ? null : state.currentDataset
          })),

        updateDataset: (id, updates) =>
          set((state) => ({
            datasets: state.datasets.map(d => 
              d.id === id ? { ...d, ...updates } : d
            ),
            currentDataset: state.currentDataset?.id === id 
              ? { ...state.currentDataset, ...updates }
              : state.currentDataset
          })),

        // Customer actions
        addCustomer: (customer) =>
          set((state) => {
            if (!state.currentDataset) return state;
            
            return {
              currentDataset: {
                ...state.currentDataset,
                data: [...state.currentDataset.data, customer],
                rowCount: state.currentDataset.rowCount + 1
              }
            };
          }),

        updateCustomer: (customerId, updates) =>
          set((state) => {
            if (!state.currentDataset) return state;
            
            return {
              currentDataset: {
                ...state.currentDataset,
                data: state.currentDataset.data.map(c =>
                  c.customerId === customerId ? { ...c, ...updates } : c
                )
              }
            };
          }),

        removeCustomer: (customerId) =>
          set((state) => {
            if (!state.currentDataset) return state;
            
            return {
              currentDataset: {
                ...state.currentDataset,
                data: state.currentDataset.data.filter(c => c.customerId !== customerId),
                rowCount: state.currentDataset.rowCount - 1
              },
              selectedCustomers: state.selectedCustomers.filter(id => id !== customerId)
            };
          }),

        // Selection actions
        selectCustomer: (customerId) =>
          set((state) => ({
            selectedCustomers: [...state.selectedCustomers, customerId]
          })),

        deselectCustomer: (customerId) =>
          set((state) => ({
            selectedCustomers: state.selectedCustomers.filter(id => id !== customerId)
          })),

        selectAll: () =>
          set((state) => ({
            selectedCustomers: state.currentDataset?.data.map(c => c.customerId) || []
          })),

        deselectAll: () => set({ selectedCustomers: [] }),

        toggleCustomer: (customerId) =>
          set((state) => ({
            selectedCustomers: state.selectedCustomers.includes(customerId)
              ? state.selectedCustomers.filter(id => id !== customerId)
              : [...state.selectedCustomers, customerId]
          })),

        // Filter actions
        setSearch: (search) => set({ filters: { ...get().filters, search } }),

        setContractTypeFilter: (types) => 
          set({ filters: { ...get().filters, contractType: types } }),

        setRiskLevelFilter: (levels) =>
          set({ filters: { ...get().filters, riskLevel: levels } }),

        setTenureRange: (min, max) =>
          set({ filters: { ...get().filters, minTenure: min, maxTenure: max } }),

        clearFilters: () =>
          set({
            filters: {
              search: '',
              contractType: [],
              riskLevel: [],
              minTenure: 0,
              maxTenure: 120
            }
          }),

        // Sort actions
        setSorting: (field, order) => set({ sortBy: field, sortOrder: order }),

        // Pagination actions
        setPage: (page) => set({ currentPage: page }),

        setPageSize: (size) => set({ pageSize: size, currentPage: 1 }),

        // Loading actions
        setLoading: (loading) => set({ loading }),

        setError: (error) => set({ error }),

        // Computed
        getFilteredCustomers: () => {
          const state = get();
          if (!state.currentDataset) return [];

          let customers = state.currentDataset.data;

          // Apply search filter
          if (state.filters.search) {
            const search = state.filters.search.toLowerCase();
            customers = customers.filter(c =>
              c.customerId.toLowerCase().includes(search) ||
              c.name?.toLowerCase().includes(search)
            );
          }

          // Apply contract type filter
          if (state.filters.contractType.length > 0) {
            customers = customers.filter(c =>
              state.filters.contractType.includes(c.contractType)
            );
          }

          // Apply risk level filter
          if (state.filters.riskLevel.length > 0) {
            customers = customers.filter(c =>
              c.riskLevel && state.filters.riskLevel.includes(c.riskLevel)
            );
          }

          // Apply tenure range filter
          customers = customers.filter(c =>
            c.tenure >= state.filters.minTenure &&
            c.tenure <= state.filters.maxTenure
          );

          // Apply sorting
          customers.sort((a, b) => {
            const aVal = a[state.sortBy as keyof Customer];
            const bVal = b[state.sortBy as keyof Customer];

            if (aVal < bVal) return state.sortOrder === 'asc' ? -1 : 1;
            if (aVal > bVal) return state.sortOrder === 'asc' ? 1 : -1;
            return 0;
          });

          return customers;
        },

        getPaginatedCustomers: () => {
          const filtered = get().getFilteredCustomers();
          const { currentPage, pageSize } = get();
          const start = (currentPage - 1) * pageSize;
          const end = start + pageSize;
          return filtered.slice(start, end);
        },

        getCustomerById: (id) => {
          return get().currentDataset?.data.find(c => c.customerId === id);
        },

        getSelectedCustomers: () => {
          const { currentDataset, selectedCustomers } = get();
          if (!currentDataset) return [];
          
          return currentDataset.data.filter(c =>
            selectedCustomers.includes(c.customerId)
          );
        },

        // Reset
        reset: () => set(initialState)
      }),
      {
        name: 'data-store',
        partialize: (state) => ({
          datasets: state.datasets,
          currentDataset: state.currentDataset
        })
      }
    ),
    { name: 'DataStore' }
  )
);

export default useDataStore;
