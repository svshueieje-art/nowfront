// ========================================
// API Client — Axios Configuration
// ========================================

import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { config } from '@/lib/config';
import type { ApiErrorResponse } from '@/types';

/**
 * Configured Axios instance for all API communication.
 * Uses HTTP-only cookies for authentication.
 */
export const apiClient = axios.create({
  baseURL: config.apiBaseUrl,
  withCredentials: true,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Parsed API error for consistent error handling.
 */
export class ApiError extends Error {
  public readonly status: number;
  public readonly code?: string;
  public readonly errors?: Record<string, string[]>;
  public readonly isNetworkError: boolean;
  public readonly isAuthError: boolean;
  public readonly isValidationError: boolean;
  public readonly isRateLimited: boolean;

  constructor(
    message: string,
    status: number,
    options?: {
      code?: string;
      errors?: Record<string, string[]>;
      isNetworkError?: boolean;
    }
  ) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = options?.code;
    this.errors = options?.errors;
    this.isNetworkError = options?.isNetworkError ?? false;
    this.isAuthError = status === 401;
    this.isValidationError = status === 422 || status === 400;
    this.isRateLimited = status === 429;
  }
}

// Request interceptor — add any request-level modifications
apiClient.interceptors.request.use(
  (requestConfig: InternalAxiosRequestConfig) => {
    return requestConfig;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor — normalize errors
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiErrorResponse>) => {
    if (!error.response) {
      // Network error
      return Promise.reject(
        new ApiError(
          'Unable to connect to the server. Please check your internet connection.',
          0,
          { isNetworkError: true }
        )
      );
    }

    const { status, data } = error.response;
    let message = 'An unexpected error occurred. Please try again.';

    if (data?.message) {
      message = data.message;
    } else {
      switch (status) {
        case 400:
          message = 'Invalid request. Please check your input.';
          break;
        case 401:
          message = 'Your session has expired. Please log in again.';
          break;
        case 403:
          message = 'You do not have permission to perform this action.';
          break;
        case 404:
          message = 'The requested resource was not found.';
          break;
        case 409:
          message = 'This action conflicts with an existing operation.';
          break;
        case 422:
          message = 'Please check your input and try again.';
          break;
        case 429:
          message = 'Too many requests. Please wait a moment and try again.';
          break;
        case 500:
        case 502:
        case 503:
          message = 'The server is temporarily unavailable. Please try again later.';
          break;
      }
    }

    return Promise.reject(
      new ApiError(message, status, {
        code: data?.code,
        errors: data?.errors,
      })
    );
  }
);
