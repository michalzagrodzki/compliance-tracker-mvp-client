/* eslint-disable @typescript-eslint/no-explicit-any */
import { create } from "zustand";
import { isoControlService } from "../services/isoControlService";
import type {
  IsoControl,
  IsoControlListRequest,
  IsoControlState,
  IsoControlActions,
} from "../types";

interface IsoControlStore extends IsoControlState, IsoControlActions {}

export const useIsoControlStore = create<IsoControlStore>((set, get) => ({
  // State
  controls: [],
  currentControl: null,
  isLoading: false,
  error: null,
  totalCount: undefined,

  // Basic setters
  setLoading: (loading: boolean) => set({ isLoading: loading }),
  clearError: () => set({ error: null }),
  clearControls: () => set({ controls: [], totalCount: undefined }),
  setCurrentControl: (control: IsoControl | null) =>
    set({ currentControl: control }),

  // Fetch all controls with pagination and filtering
  fetchControls: async (params: IsoControlListRequest = {}) => {
    set({ isLoading: true, error: null });

    try {
      const controls = await isoControlService.getControls(params);
      set({
        controls,
        isLoading: false,
        // Note: API doesn't return total count, so we estimate based on result size
        totalCount:
          controls.length === (params.limit || 10)
            ? undefined
            : controls.length,
      });
    } catch (error: any) {
      set({
        error: error.response?.data?.detail || "Failed to fetch ISO controls",
        isLoading: false,
      });
    }
  },

  // Fetch a specific control by ID
  fetchControlById: async (controlId: string) => {
    set({ isLoading: true, error: null });

    try {
      const control = await isoControlService.getControlById(controlId);
      set({
        currentControl: control,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        error: error.response?.data?.detail || "Failed to fetch ISO control",
        isLoading: false,
      });
    }
  },

  // Fetch a specific control by name
  fetchControlByName: async (name: string) => {
    set({ isLoading: true, error: null });

    try {
      const control = await isoControlService.getControlByName(name);
      set({
        currentControl: control,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        error:
          error.response?.data?.detail || "Failed to fetch ISO control by name",
        isLoading: false,
      });
    }
  },
}));

// Export utility functions for direct store access
export const isoControlStoreUtils = {
  getState: () => useIsoControlStore.getState(),
  setState: useIsoControlStore.setState,

  // Safe control fetching that won't cause loops
  fetchControlsSafe: async (params: IsoControlListRequest = {}) => {
    try {
      const controls = await isoControlService.getControls(params);
      useIsoControlStore.setState({
        controls,
        isLoading: false,
        error: null,
        totalCount:
          controls.length === (params.limit || 10)
            ? undefined
            : controls.length,
      });
      return controls;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.detail || "Failed to fetch ISO controls";
      useIsoControlStore.setState({
        error: errorMessage,
        isLoading: false,
        controls: [],
      });
      throw new Error(errorMessage);
    }
  },

  // Search controls with debouncing support
  searchControls: async (
    searchTerm: string,
    skip: number = 0,
    limit: number = 10
  ) => {
    try {
      const controls = await isoControlService.searchControls(
        searchTerm,
        skip,
        limit
      );
      useIsoControlStore.setState({
        controls,
        isLoading: false,
        error: null,
      });
      return controls;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.detail || "Failed to search ISO controls";
      useIsoControlStore.setState({
        error: errorMessage,
        isLoading: false,
        controls: [],
      });
      throw new Error(errorMessage);
    }
  },
};

// Initialize function to load initial controls
export const initializeIsoControls = (params: IsoControlListRequest = {}) => {
  const store = useIsoControlStore.getState();
  store.fetchControls(params);
};
