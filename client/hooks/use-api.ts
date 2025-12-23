"use client";

/**
 * useApi Hook
 * Custom hook for making API calls with automatic loading state management
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { useApiLoading } from "@/lib/api-loading-context";

interface UseApiOptions<T> {
    onSuccess?: (data: T) => void;
    onError?: (error: Error) => void;
    immediate?: boolean; // If true, execute immediately on mount
    requestId?: string; // Optional custom request ID
}

interface UseApiReturn<T> {
    data: T | null;
    error: Error | null;
    loading: boolean;
    execute: () => Promise<void>;
    reset: () => void;
}

let requestCounter = 0;

export function useApi<T>(
    apiCall: () => Promise<T>,
    options: UseApiOptions<T> = {}
): UseApiReturn<T> {
    const { onSuccess, onError, immediate = false, requestId: customRequestId } = options;

    // Generate unique request ID
    const requestIdRef = useRef(
        customRequestId || `api-request-${++requestCounter}`
    );
    const requestId = requestIdRef.current;

    const [data, setData] = useState<T | null>(null);
    const [error, setError] = useState<Error | null>(null);
    const [localLoading, setLocalLoading] = useState(false);

    const { startLoading, stopLoading, isLoading } = useApiLoading();
    const loading = isLoading(requestId) || localLoading;

    // Abort controller for request cancellation
    const abortControllerRef = useRef<AbortController | null>(null);

    const execute = useCallback(async () => {
        // Cancel any pending request
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }

        abortControllerRef.current = new AbortController();

        setError(null);
        setLocalLoading(true);
        startLoading(requestId);

        try {
            const result = await apiCall();
            setData(result);
            if (onSuccess) {
                onSuccess(result);
            }
        } catch (err) {
            const error = err as Error;
            setError(error);
            if (onError) {
                onError(error);
            }
        } finally {
            setLocalLoading(false);
            stopLoading(requestId);
        }
    }, [apiCall, onSuccess, onError, requestId, startLoading, stopLoading]);

    const reset = useCallback(() => {
        setData(null);
        setError(null);
        setLocalLoading(false);
        stopLoading(requestId);
    }, [requestId, stopLoading]);

    // Execute immediately if requested
    useEffect(() => {
        if (immediate) {
            execute();
        }

        // Cleanup: cancel request on unmount
        return () => {
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
            stopLoading(requestId);
        };
    }, [immediate, execute, requestId, stopLoading]);

    return {
        data,
        error,
        loading,
        execute,
        reset,
    };
}

/**
 * useApiMutation Hook
 * Similar to useApi but designed for mutations (POST, PUT, DELETE)
 * Does not execute immediately
 */
export function useApiMutation<TData, TVariables = void>(
    apiCall: (variables: TVariables) => Promise<TData>,
    options: Omit<UseApiOptions<TData>, "immediate"> = {}
) {
    const { onSuccess, onError, requestId: customRequestId } = options;

    const requestIdRef = useRef(
        customRequestId || `api-mutation-${++requestCounter}`
    );
    const requestId = requestIdRef.current;

    const [data, setData] = useState<TData | null>(null);
    const [error, setError] = useState<Error | null>(null);
    const [localLoading, setLocalLoading] = useState(false);

    const { startLoading, stopLoading, isLoading } = useApiLoading();
    const loading = isLoading(requestId) || localLoading;

    const mutate = useCallback(
        async (variables: TVariables) => {
            setError(null);
            setLocalLoading(true);
            startLoading(requestId);

            try {
                const result = await apiCall(variables);
                setData(result);
                if (onSuccess) {
                    onSuccess(result);
                }
                return result;
            } catch (err) {
                const error = err as Error;
                setError(error);
                if (onError) {
                    onError(error);
                }
                throw error;
            } finally {
                setLocalLoading(false);
                stopLoading(requestId);
            }
        },
        [apiCall, onSuccess, onError, requestId, startLoading, stopLoading]
    );

    const reset = useCallback(() => {
        setData(null);
        setError(null);
        setLocalLoading(false);
        stopLoading(requestId);
    }, [requestId, stopLoading]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            stopLoading(requestId);
        };
    }, [requestId, stopLoading]);

    return {
        data,
        error,
        loading,
        mutate,
        reset,
    };
}
