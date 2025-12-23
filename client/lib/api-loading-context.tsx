"use client";

/**
 * API Loading State Context
 * Global loading state management for API requests
 */

import React, { createContext, useContext, useState, useCallback } from "react";

// ============================================================================
// Types
// ============================================================================

interface LoadingState {
    [requestId: string]: boolean;
}

interface ApiLoadingContextType {
    loadingStates: LoadingState;
    isLoading: (requestId?: string) => boolean;
    isAnyLoading: () => boolean;
    setLoading: (requestId: string, loading: boolean) => void;
    startLoading: (requestId: string) => void;
    stopLoading: (requestId: string) => void;
}

// ============================================================================
// Context
// ============================================================================

const ApiLoadingContext = createContext<ApiLoadingContextType | undefined>(
    undefined
);

// ============================================================================
// Provider Component
// ============================================================================

export function ApiLoadingProvider({ children }: { children: React.ReactNode }) {
    const [loadingStates, setLoadingStates] = useState<LoadingState>({});

    const setLoading = useCallback((requestId: string, loading: boolean) => {
        setLoadingStates((prev) => {
            if (loading) {
                return { ...prev, [requestId]: true };
            } else {
                const { [requestId]: _, ...rest } = prev;
                return rest;
            }
        });
    }, []);

    const startLoading = useCallback(
        (requestId: string) => {
            setLoading(requestId, true);
        },
        [setLoading]
    );

    const stopLoading = useCallback(
        (requestId: string) => {
            setLoading(requestId, false);
        },
        [setLoading]
    );

    const isLoading = useCallback(
        (requestId?: string) => {
            if (!requestId) return false;
            return loadingStates[requestId] === true;
        },
        [loadingStates]
    );

    const isAnyLoading = useCallback(() => {
        return Object.values(loadingStates).some((loading) => loading);
    }, [loadingStates]);

    const value: ApiLoadingContextType = {
        loadingStates,
        isLoading,
        isAnyLoading,
        setLoading,
        startLoading,
        stopLoading,
    };

    return (
        <ApiLoadingContext.Provider value={value}>
            {children}
        </ApiLoadingContext.Provider>
    );
}

// ============================================================================
// Hook
// ============================================================================

export function useApiLoading() {
    const context = useContext(ApiLoadingContext);
    if (!context) {
        throw new Error("useApiLoading must be used within ApiLoadingProvider");
    }
    return context;
}

// ============================================================================
// Global Loading Indicator Component
// ============================================================================

export function GlobalLoadingIndicator() {
    const { isAnyLoading } = useApiLoading();

    if (!isAnyLoading()) return null;

    return (
        <div className="fixed top-0 left-0 right-0 z-50">
            <div className="h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 animate-pulse" />
        </div>
    );
}
