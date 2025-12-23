/**
 * API Client
 * Centralized HTTP client for backend API communication
 */

import {
    ApiError,
    type ApiErrorResponse,
    type HealthCheckResponse,
    type LoginRequest,
    type LoginResponse,
    type LogoutResponse,
    UserType,
} from "./api-types";

// ============================================================================
// Configuration
// ============================================================================

interface ApiClientConfig {
    baseURL?: string;
    debug?: boolean;
}

// ============================================================================
// API Client Class
// ============================================================================

class ApiClient {
    private baseURL: string;
    private debug: boolean;

    constructor(config: ApiClientConfig = {}) {
        // In development, use empty string to leverage Next.js rewrites
        // In production or when explicitly set, use the provided baseURL
        this.baseURL = config.baseURL ?? "";
        this.debug = config.debug ?? false;
    }

    /**
     * Core request method with error handling and interceptors
     */
    private async request<T>(
        endpoint: string,
        options: RequestInit = {}
    ): Promise<T> {
        const url = `${this.baseURL}${endpoint}`;

        // Request interceptor - add default headers
        const headers: HeadersInit = {
            "Content-Type": "application/json",
            ...options.headers,
        };

        const config: RequestInit = {
            ...options,
            headers,
            credentials: "include", // Important for cookies
        };

        if (this.debug) {
            console.log(`[API Client] ${options.method || "GET"} ${url}`, config);
        }

        try {
            const response = await fetch(url, config);

            // Response interceptor - handle errors
            if (!response.ok) {
                const errorData: ApiErrorResponse = await response
                    .json()
                    .catch(() => ({}));
                const errorMessage =
                    errorData.error || errorData.message || `Request failed with status ${response.status}`;

                if (this.debug) {
                    console.error(`[API Client] Error:`, errorData);
                }

                throw new ApiError(errorMessage, response.status, errorData);
            }

            // Parse JSON response
            const data = await response.json();

            if (this.debug) {
                console.log(`[API Client] Response:`, data);
            }

            return data as T;
        } catch (error) {
            if (error instanceof ApiError) {
                throw error;
            }

            // Network or other errors
            if (this.debug) {
                console.error(`[API Client] Network error:`, error);
            }

            throw new ApiError(
                (error as Error).message || "Network error",
                0,
                {
                    error: (error as Error).message,
                }
            );
        }
    }

    /**
     * GET request
     */
    private async get<T>(endpoint: string): Promise<T> {
        return this.request<T>(endpoint, { method: "GET" });
    }

    /**
     * POST request
     */
    private async post<T>(endpoint: string, body?: unknown): Promise<T> {
        return this.request<T>(endpoint, {
            method: "POST",
            body: body ? JSON.stringify(body) : undefined,
        });
    }

    /**
     * PUT request
     */
    private async put<T>(endpoint: string, body?: unknown): Promise<T> {
        return this.request<T>(endpoint, {
            method: "PUT",
            body: body ? JSON.stringify(body) : undefined,
        });
    }

    /**
     * DELETE request
     */
    private async delete<T>(endpoint: string): Promise<T> {
        return this.request<T>(endpoint, { method: "DELETE" });
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
    // Future: Product Service (placeholder)
    // ==========================================================================

    public products = {
        // list: async () => { ... },
        // get: async (id: string) => { ... },
        // create: async (product: CreateProductRequest) => { ... },
    };

    // ==========================================================================
    // Future: Order Service (placeholder)
    // ==========================================================================

    public orders = {
        // list: async () => { ... },
        // get: async (id: string) => { ... },
        // create: async (order: CreateOrderRequest) => { ... },
    };

    // ==========================================================================
    // Future: Cart Service (placeholder)
    // ==========================================================================

    public cart = {
        // get: async () => { ... },
        // addItem: async (item: CartItem) => { ... },
        // removeItem: async (productId: string) => { ... },
    };
}

// ============================================================================
// Export singleton instance
// ============================================================================

// Check for environment variables (Next.js)
// NEXT_PUBLIC_* variables are available in the browser
const config: ApiClientConfig = {
    debug:
        typeof window !== "undefined" &&
        process.env.NEXT_PUBLIC_API_DEBUG === "true",
};

export const apiClient = new ApiClient(config);

// Also export the class for testing or custom instances
export { ApiClient };
