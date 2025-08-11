/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState, useCallback } from "react";
import {
  useIsoControlStore,
  isoControlStoreUtils,
} from "../store/isoControlStore";
import type { IsoControlListRequest } from "../types";

// Main hook for accessing ISO controls state and actions
export const useIsoControls = () => {
  const store = useIsoControlStore();
  return store;
};

// Hook for fetching controls with automatic loading on mount
export const useIsoControlsList = (params: IsoControlListRequest = {}) => {
  const { controls, isLoading, error, totalCount, fetchControls, clearError } =
    useIsoControlStore();

  useEffect(() => {
    fetchControls(params);
  }, [fetchControls, params.skip, params.limit, params.name_filter]);

  const refetch = useCallback(() => {
    fetchControls(params);
  }, [fetchControls, params]);

  return {
    controls,
    isLoading,
    error,
    totalCount,
    refetch,
    clearError,
  };
};

// Hook for fetching a specific control by ID
export const useIsoControl = (controlId?: string) => {
  const {
    currentControl,
    isLoading,
    error,
    fetchControlById,
    clearError,
    setCurrentControl,
  } = useIsoControlStore();

  useEffect(() => {
    if (controlId) {
      fetchControlById(controlId);
    } else {
      setCurrentControl(null);
    }
  }, [controlId, fetchControlById, setCurrentControl]);

  const refetch = useCallback(() => {
    if (controlId) {
      fetchControlById(controlId);
    }
  }, [controlId, fetchControlById]);

  return {
    control: currentControl,
    isLoading,
    error,
    refetch,
    clearError,
  };
};

// Hook for searching controls with debouncing
export const useIsoControlSearch = (debounceMs: number = 300) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const { controls, isLoading, error, clearError } = useIsoControlStore();

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [searchTerm, debounceMs]);

  // Perform search when debounced term changes
  useEffect(() => {
    if (debouncedSearchTerm) {
      isoControlStoreUtils.searchControls(debouncedSearchTerm);
    } else {
      // Load default controls when search is cleared
      isoControlStoreUtils.fetchControlsSafe();
    }
  }, [debouncedSearchTerm]);

  const search = useCallback((term: string) => {
    setSearchTerm(term);
  }, []);

  const clearSearch = useCallback(() => {
    setSearchTerm("");
    setDebouncedSearchTerm("");
  }, []);

  return {
    searchTerm,
    search,
    clearSearch,
    controls,
    isLoading,
    error,
    clearError,
  };
};

// Hook for pagination
export const useIsoControlsPagination = (initialLimit: number = 10) => {
  const [skip, setSkip] = useState(0);
  const [limit, setLimit] = useState(initialLimit);
  const [nameFilter, setNameFilter] = useState<string>("");

  const { controls, isLoading, error, totalCount, fetchControls, clearError } =
    useIsoControlStore();

  const params: IsoControlListRequest = {
    skip,
    limit,
    name_filter: nameFilter || undefined,
  };

  useEffect(() => {
    fetchControls(params);
  }, [skip, limit, nameFilter, fetchControls]);

  const nextPage = useCallback(() => {
    setSkip((prev) => prev + limit);
  }, [limit]);

  const prevPage = useCallback(() => {
    setSkip((prev) => Math.max(0, prev - limit));
  }, [limit]);

  const goToPage = useCallback(
    (page: number) => {
      setSkip(page * limit);
    },
    [limit]
  );

  const changeLimit = useCallback((newLimit: number) => {
    setLimit(newLimit);
    setSkip(0); // Reset to first page
  }, []);

  const currentPage = Math.floor(skip / limit);
  const hasNextPage = totalCount
    ? skip + limit < totalCount
    : controls.length === limit;
  const hasPrevPage = skip > 0;

  return {
    controls,
    isLoading,
    error,
    totalCount,
    currentPage,
    limit,
    nameFilter,
    hasNextPage,
    hasPrevPage,
    nextPage,
    prevPage,
    goToPage,
    changeLimit,
    setNameFilter,
    clearError,
  };
};

// Hook for control selection (useful for lists with selection)
export const useIsoControlSelection = () => {
  const [selectedControlIds, setSelectedControlIds] = useState<string[]>([]);
  const { controls } = useIsoControlStore();

  const selectedControls = controls.filter((control: { id: string }) =>
    selectedControlIds.includes(control.id)
  );

  const selectControl = useCallback((controlId: string) => {
    setSelectedControlIds((prev) => [...prev, controlId]);
  }, []);

  const deselectControl = useCallback((controlId: string) => {
    setSelectedControlIds((prev) => prev.filter((id) => id !== controlId));
  }, []);

  const toggleControl = useCallback((controlId: string) => {
    setSelectedControlIds((prev) =>
      prev.includes(controlId)
        ? prev.filter((id) => id !== controlId)
        : [...prev, controlId]
    );
  }, []);

  const selectAll = useCallback(() => {
    setSelectedControlIds(controls.map((control: { id: any }) => control.id));
  }, [controls]);

  const clearSelection = useCallback(() => {
    setSelectedControlIds([]);
  }, []);

  const isSelected = useCallback(
    (controlId: string) => {
      return selectedControlIds.includes(controlId);
    },
    [selectedControlIds]
  );

  return {
    selectedControlIds,
    selectedControls,
    selectControl,
    deselectControl,
    toggleControl,
    selectAll,
    clearSelection,
    isSelected,
    selectedCount: selectedControlIds.length,
  };
};
