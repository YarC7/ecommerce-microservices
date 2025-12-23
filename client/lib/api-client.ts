/**
 * Enhanced API Client
 * Production-ready HTTP client with retry, caching, token refresh,  and cancellation
 */

import {
    ApiError,
    type ApiErrorResponse,
    type HealthCheckResponse,
    type LoginRequest,
    type LoginResponse,
    type LogoutResponse,
    type RetryConfig,
    type CacheConfig,
    type RequestConfig,
    type CachedResponse,
    UserType,
} from "./api-types";

// ============================================================================
// Configuration
// ============================================================================

interface ApiClientConfig {
    baseURL?: string;
    debug?: boolean;
    retry?: Partial<RetryConfig>;
    cache?: Partial<CacheConfig>;
}

// Default configurations
const DEFAULT_RETRY_CONFIG: RetryConfig = {
    maxAttempts: 3,
    initialDelayMs: 1000,
    maxDelayMs: 8000,
    exponentialBackoff: true,
    retryableStatusCodes: [429, 503, 504],
};

const DEFAULT_CACHE_CONFIG: CacheConfig = {
    enabled: false,
    ttlMs: 60000, // 1 minute
};

// ============================================================================
// API Client Class
// ============================================================================

class ApiClient {
    private baseURL: string;
    private debug: boolean;
    private retryConfig: RetryConfig;
    private cacheConfig: CacheConfig;
    private responseCache: Map<string, CachedResponse<unknown>>;
    private pendingRefresh: Promise<void> | null = null;

    constructor(config: ApiClientConfig = {}) {
        this.baseURL = config.baseURL ?? "";
        this.debug = config.debug ?? false;
        this.retryConfig = { ...DEFAULT_RETRY_CONFIG, ...config.retry };
        this.cacheConfig = { ...DEFAULT_CACHE_CONFIG, ...config.cache };
        this.responseCache = new Map();
    }

    /**
     * Sleep utility for retry delays
     */
    private sleep(ms: number): Promise<void> {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

    /**
     * Calculate retry delay with exponential backoff
     */
    private getRetryDelay(attempt: number): number {
        if (!this.retryConfig.exponentialBackoff) {
            return this.retryConfig.initialDelayMs;
        }

        const delay = this.retryConfig.initialDelayMs * Math.pow(2, attempt);
        return Math.min(delay, this.retryConfig.maxDelayMs);
    }

    /**
     * Check if error is retryable
     */
    private isRetryableError(error: unknown, attempt: number): boolean {
        if (attempt >= this.retryConfig.maxAttempts) return false;

        if (error instanceof ApiError) {
            // Retry on specific status codes
            if (this.retryConfig.retryableStatusCodes.includes(error.status)) {
                return true;
            }
            // Don't retry 4xx errors (client errors) except 429
            if (error.status >= 400 && error.status < 500) {
                return false;
            }
        }

        // Retry network errors
        if (
            error instanceof Error &&
            (error.message.includes("Network") ||
                error.message.includes("fetch") ||
                error.message.includes("timeout"))
        ) {
            return true;
        }

        return false;
    }

    /**
     * Generate cache key from endpoint and options
     */
    private getCacheKey(endpoint: string, options: RequestInit): string {
        const method = options.method || "GET";
        const body = options.body ? JSON.stringify(options.body) : "";
        return `${method}:${endpoint}:${body}`;
    }

    /**
     * Get cached response if available and valid
     */
    private getCachedResponse<T>(cacheKey: string): T | null {
        const cached = this.responseCache.get(cacheKey) as
            | CachedResponse<T>
            | undefined;

        if (!cached) return null;

        const now = Date.now();
        const age = now - cached.timestamp;

        if (age > cached.ttl) {
            // Cache expired
            this.responseCache.delete(cacheKey);
            return null;
        }

        if (this.debug) {
            console.log(`[API Client] Cache HIT: ${cacheKey}`);
        }

        return cached.data;
    }

    /**
     * Store response in cache
     */
    private setCachedResponse<T>(
        cacheKey: string,
        data: T,
        ttl: number
    ): void {
        const cached: CachedResponse<T> = {
            data,
            timestamp: Date.now(),
            ttl,
        };

        this.responseCache.set(cacheKey, cached as CachedResponse<unknown>);

        if (this.debug) {
            console.log(`[API Client] Cache SET: ${cacheKey} (TTL: ${ttl}ms)`);
        }
    }

    /**
     * Clear cache (all or specific key)
     */
    public clearCache(cacheKey?: string): void {
        if (cacheKey) {
            this.responseCache.delete(cacheKey);
        } else {
            this.responseCache.clear();
        }
    }

    /**
     * Refresh authentication token
     */
    private async refreshToken(): Promise<void> {
        if (this.pendingRefresh) {
            // Wait for existing refresh operation
            return this.pendingRefresh;
        }

        this.pendingRefresh = (async () => {
            try {
                if (this.debug) {
                    console.log("[API Client] Refreshing token...");
                }

                // Call refresh endpoint
                await this.post("/api/v1/auth/refresh");

                if (this.debug) {
                    console.log("[API Client] Token refreshed successfully");
                }
            } catch (error) {
                if (this.debug) {
                    console.error("[API Client] Token refresh failed:", error);
                }
                // Redirect to login on refresh failure
                if (typeof window !== "undefined") {
                    window.location.href = "/login";
                }
                throw error;
            } finally {
                this.pendingRefresh = null;
            }
        })();

        return this.pendingRefresh;
    }

    /**
     * Core request method with retry, caching, and token refresh
     */
    private async request<T>(
        endpoint: string,
        options: RequestInit & RequestConfig = {},
        attempt: number = 0
    ): Promise<T> {
        const url = `${this.baseURL}${endpoint}`;

        // Check cache for GET requests
        const retryConfig = { ...this.retryConfig, ...options.retry };
        const cacheConfig = { ...this.cacheConfig, ...options.caching };

        if (
            cacheConfig.enabled &&
            (!options.method || options.method === "GET")
        ) {
            const cacheKey =
                cacheConfig.cacheKey || this.getCacheKey(endpoint, options);
            const cached = this.getCachedResponse<T>(cacheKey);
            if (cached) return cached;
        }

        // Request interceptor
        const headers: HeadersInit = {
            "Content-Type": "application/json",
            ...options.headers,
        };

        const config: RequestInit = {
            ...options,
            headers,
            credentials: "include",
            signal: options.cancelToken,
        };

        if (this.debug) {
            console.log(
                `[API Client] ${options.method || "GET"} ${url} (attempt ${attempt + 1}/${retryConfig.maxAttempts})`,
                config
            );
        }

        try {
            const response = await fetch(url, config);

            // Handle 401 - Token refresh
            if (response.status === 401 && endpoint !== "/api/v1/auth/refresh") {
                if (this.debug) {
                    console.log("[API Client] 401 Unauthorized - attempting token refresh");
                }

                await this.refreshToken();

                // Retry original request
                return this.request<T>(endpoint, options, attempt);
            }

            // Response interceptor - handle errors
            if (!response.ok) {
                const errorData: ApiErrorResponse = await response
                    .json()
                    .catch(() => ({}));
                const errorMessage =
                    errorData.error ||
                    errorData.message ||
                    `Request failed with status ${response.status}`;

                if (this.debug) {
                    console.error(`[API Client] Error:`, errorData);
                }

                const apiError = new ApiError(
                    errorMessage,
                    response.status,
                    errorData
                );

                // Retry logic
                if (this.isRetryableError(apiError, attempt)) {
                    const delay = this.getRetryDelay(attempt);
                    if (this.debug) {
                        console.log(
                            `[API Client] Retrying after ${delay}ms (attempt ${attempt + 1}/${retryConfig.maxAttempts})`
                        );
                    }
                    await this.sleep(delay);
                    return this.request<T>(endpoint, options, attempt + 1);
                }

                throw apiError;
            }

            // Parse JSON response
            const data = await response.json();

            if (this.debug) {
                console.log(`[API Client] Response:`, data);
            }

            // Cache successful GET responses
            if (
                cacheConfig.enabled &&
                (!options.method || options.method === "GET")
            ) {
                const cacheKey =
                    cacheConfig.cacheKey || this.getCacheKey(endpoint, options);
                this.setCachedResponse(cacheKey, data, cacheConfig.ttlMs);
            }

            return data as T;
        } catch (error) {
            if (error instanceof ApiError) {
                throw error;
            }

            // Handle AbortError (request cancelled)
            if (error instanceof Error && error.name === "AbortError") {
                if (this.debug) {
                    console.log(`[API Client] Request cancelled: ${url}`);
                }
                throw new ApiError("Request cancelled", 0, {
                    error: "Request was cancelled",
                });
            }

            // Network or other errors
            if (this.debug) {
                console.error(`[API Client] Network error:`, error);
            }

            const networkError = new ApiError(
                (error as Error).message || "Network error",
                0,
                {
                    error: (error as Error).message,
                }
            );

            // Retry on network errors
            if (this.isRetryableError(networkError, attempt)) {
                const delay = this.getRetryDelay(attempt);
                if (this.debug) {
                    console.log(
                        `[API Client] Retrying after ${delay}ms (attempt ${attempt + 1}/${retryConfig.maxAttempts})`
                    );
                }
                await this.sleep(delay);
                return this.request<T>(endpoint, options, attempt + 1);
            }

            throw networkError;
        }
    }

    /**
     * GET request
     */
    private async get<T>(
        endpoint: string,
        config?: RequestConfig
    ): Promise<T> {
        return this.request<T>(endpoint, { method: "GET", ...config });
    }

    /**
     * POST request
     */
    private async post<T>(
        endpoint: string,
        body?: unknown,
        config?: RequestConfig
    ): Promise<T> {
        return this.request<T>(endpoint, {
            method: "POST",
            body: body ? JSON.stringify(body) : undefined,
            ...config,
        });
    }

    /**
     * PUT request
     */
    private async put<T>(
        endpoint: string,
        body?: unknown,
        config?: RequestConfig
    ): Promise<T> {
        return this.request<T>(endpoint, {
            method: "PUT",
            body: body ? JSON.stringify(body) : undefined,
            ...config,
        });
    }

    /**
     * PATCH request
     */
    private async patch<T>(
        endpoint: string,
        body?: unknown,
        config?: RequestConfig
    ): Promise<T> {
        return this.request<T>(endpoint, {
            method: "PATCH",
            body: body ? JSON.stringify(body) : undefined,
            ...config,
        });
    }

    /**
     * DELETE request
     */
    private async delete<T>(
        endpoint: string,
        config?: RequestConfig
    ): Promise<T> {
        return this.request<T>(endpoint, { method: "DELETE", ...config });
    }

    // ==========================================================================
    // Auth Service
    // ==========================================================================

    public auth = {
        /**
         * Login user (customer, admin, or vendor)
         */
        login: async (
            email: string,
            password: string,
            type: UserType
        ): Promise<LoginResponse> => {
            const request: LoginRequest = { email, password, type };
            return this.post<LoginResponse>("/api/v1/auth/login", request);
        },

        /**
         * Logout current user
         */
        logout: async (): Promise<LogoutResponse> => {
            return this.post<LogoutResponse>("/api/v1/auth/logout");
        },

        /**
         * Refresh authentication token
         */
        refresh: async (): Promise<void> => {
            return this.refreshToken();
        },
    };

    // ==========================================================================
    // Health Check
    // ==========================================================================

    /**
     * Health check endpoint
     */
    public health = async (): Promise<HealthCheckResponse> => {
        return this.get<HealthCheckResponse>("/health");
    };

    // ==========================================================================
    // Product Service
    // ==========================================================================

    public products = {
        list: async (params?: {
            page?: number;
            limit?: number;
            category?: string;
        }): Promise<unknown> => {
            const query = new URLSearchParams(params as Record<string, string>);
            return this.get(`/api/v1/products?${query}`, {
                caching: { enabled: true, ttlMs: 30000 },
            });
        },

        get: async (id: string): Promise<unknown> => {
            return this.get(`/api/v1/products/${id}`, {
                caching: { enabled: true, ttlMs: 60000 },
            });
        },

        create: async (data: unknown): Promise<unknown> => {
            return this.post("/api/v1/products", data);
        },

        update: async (id: string, data: unknown): Promise<unknown> => {
            return this.put(`/api/v1/products/${id}`, data);
        },

        delete: async (id: string): Promise<unknown> => {
            return this.delete(`/api/v1/products/${id}`);
        },

        search: async (query: string): Promise<unknown> => {
            return this.get(`/api/v1/products/search?q=${encodeURIComponent(query)}`);
        },
    };

    // ==========================================================================
    // Order Service
    // ==========================================================================

    public orders = {
        list: async (): Promise<unknown> => {
            return this.get("/api/v1/orders");
        },

        get: async (id: string): Promise<unknown> => {
            return this.get(`/api/v1/orders/${id}`);
        },

        create: async (data: unknown): Promise<unknown> => {
            return this.post("/api/v1/orders", data);
        },

        cancel: async (id: string): Promise<unknown> => {
            return this.post(`/api/v1/orders/${id}/cancel`);
        },

        updateStatus: async (id: string, status: string): Promise<unknown> => {
            return this.patch(`/api/v1/orders/${id}`, { status });
        },
    };

    // ==========================================================================
    // Cart Service
    // ==========================================================================

    public cart = {
        get: async (): Promise<unknown> => {
            return this.get("/api/v1/cart");
        },

        addItem: async (productId: string, quantity: number): Promise<unknown> => {
            return this.post("/api/v1/cart/items", { productId, quantity });
        },

        updateItem: async (itemId: string, quantity: number): Promise<unknown> => {
            return this.put(`/api/v1/cart/items/${itemId}`, { quantity });
        },

        removeItem: async (itemId: string): Promise<unknown> => {
            return this.delete(`/api/v1/cart/items/${itemId}`);
        },

        clear: async (): Promise<unknown> => {
            return this.delete("/api/v1/cart");
        },
    };

    // ==========================================================================
    // Inventory Service
    // ==========================================================================

    public inventory = {
        check: async (productId: string): Promise<unknown> => {
            return this.get(`/api/v1/inventory/${productId}`);
        },

        reserve: async (
            productId: string,
            quantity: number
        ): Promise<unknown> => {
            return this.post(`/api/v1/inventory/${productId}/reserve`, { quantity });
        },
    };

    // ==========================================================================
    // Review Service
    // ==========================================================================

    public reviews = {
        list: async (productId: string): Promise<unknown> => {
            return this.get(`/api/v1/reviews?productId=${productId}`, {
                caching: { enabled: true, ttlMs: 60000 },
            });
        },

        create: async (productId: string, data: unknown): Promise<unknown> => {
            return this.post("/api/v1/reviews", { productId, ...(data as Record<string, unknown>) });
        },

        update: async (id: string, data: unknown): Promise<unknown> => {
            return this.put(`/api/v1/reviews/${id}`, data);
        },

        delete: async (id: string): Promise<unknown> => {
            return this.delete(`/api/v1/reviews/${id}`);
        },
    };
}

// ============================================================================
// Export singleton instance
// ============================================================================

const config: ApiClientConfig = {
    debug:
        typeof window !== "undefined" &&
        process.env.NEXT_PUBLIC_API_DEBUG === "true",
    retry: {
        maxAttempts: 3,
        initialDelayMs: 1000,
    },
    cache: {
        enabled: true,
        ttlMs: 60000,
    },
};

export const apiClient = new ApiClient(config);

// Also export the class for testing or custom instances
export { ApiClient };
