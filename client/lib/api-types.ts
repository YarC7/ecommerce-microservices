/**
 * API Types and Interfaces
 * Centralized type definitions for API requests and responses
 */

// ============================================================================
// Enums
// ============================================================================

export enum UserType {
    CUSTOMER = "customer",
    ADMIN = "admin",
    VENDOR = "vendor",
}

// ============================================================================
// Auth Types
// ============================================================================

export interface LoginRequest {
    email: string;
    password: string;
    type: UserType;
}

export interface LoginResponse {
    token?: string;
    user?: {
        id: string;
        email: string;
        type: UserType;
        name?: string;
    };
    message?: string;
}

export interface LogoutRequest {
    // Backend may not require any payload
}

export interface LogoutResponse {
    message?: string;
}

// ============================================================================
// Error Types
// ============================================================================

export interface ApiErrorResponse {
    error?: string;
    message?: string;
    status?: number;
    details?: Record<string, unknown>;
}

export class ApiError extends Error {
    status: number;
    response?: ApiErrorResponse;

    constructor(message: string, status: number, response?: ApiErrorResponse) {
        super(message);
        this.name = "ApiError";
        this.status = status;
        this.response = response;
    }
}

// ============================================================================
// Health Check Types
// ============================================================================

export interface HealthCheckResponse {
    status: string;
}

// ============================================================================
// Future: Product Types (placeholder for expansion)
// ============================================================================

export interface Product {
    id: string;
    name: string;
    description?: string;
    price: number;
    // Add more fields as needed
}

// ============================================================================
// Future: Order Types (placeholder for expansion)
// ============================================================================

export interface Order {
    id: string;
    userId: string;
    items: OrderItem[];
    total: number;
    // Add more fields as needed
}

export interface OrderItem {
    productId: string;
    quantity: number;
    price: number;
}

// ============================================================================
// Future: Cart Types (placeholder for expansion)
// ============================================================================

export interface Cart {
    id: string;
    userId: string;
    items: CartItem[];
    // Add more fields as needed
}

export interface CartItem {
    productId: string;
    quantity: number;
}
