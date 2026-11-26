import type { RequestOptions } from '../types/api.types';

export type { RequestOptions };

/**
 * Custom API Error containing HTTP status code and typed response payload.
 */
export class ApiError<T = unknown> extends Error {
  public readonly status: number;
  public readonly data: T;

  constructor(message: string, status: number, data: T) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

/**
 * Builds the fully qualified URL with query parameters.
 */
function buildUrl(
  endpoint: string,
  params?: Record<string, string | number | boolean | undefined | null>
): string {
  const baseUrl = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api').replace(/\/+$/, '');
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const isAbsolute = /^https?:\/\//i.test(endpoint);

  const fallbackOrigin =
    typeof window !== 'undefined' && window.location.origin
      ? window.location.origin
      : 'http://localhost';

  const url = isAbsolute
    ? new URL(endpoint)
    : new URL(`${baseUrl}${cleanEndpoint}`, baseUrl.startsWith('http') ? undefined : fallbackOrigin);

  if (params) {
    for (const [key, val] of Object.entries(params)) {
      if (val !== undefined && val !== null) {
        url.searchParams.append(key, String(val));
      }
    }
  }

  return url.toString();
}

/**
 * Reusable backend-ready API client built on native fetch.
 * Automatically handles token injection, 401 redirection, and safe 204 parsing.
 */
export async function apiClient<T>(endpoint: string, options?: RequestOptions): Promise<T> {
  const url = buildUrl(endpoint, options?.params);
  const headers = new Headers(options?.headers);

  // Auto-inject Authorization Bearer token when requiresAuth !== false
  if (options?.requiresAuth !== false) {
    const token = typeof window !== 'undefined' ? localStorage.getItem('tealedger_token') : null;
    if (token && !headers.has('Authorization')) {
      headers.set('Authorization', `Bearer ${token}`);
    }
  }

  // Format request body
  let body: BodyInit | null | undefined = undefined;
  if (options?.body !== undefined) {
    if (
      typeof options.body === 'string' ||
      options.body instanceof Blob ||
      options.body instanceof FormData ||
      options.body instanceof URLSearchParams ||
      options.body instanceof ArrayBuffer
    ) {
      body = options.body;
    } else {
      body = JSON.stringify(options.body);
      if (!headers.has('Content-Type')) {
        headers.set('Content-Type', 'application/json');
      }
    }
  }

  if (!headers.has('Accept')) {
    headers.set('Accept', 'application/json, text/plain, */*');
  }

  const response = await fetch(url, {
    ...options,
    headers,
    body,
  });

  // Automatically catch 401 Unauthorized: clear storage and redirect to /login
  if (response.status === 401) {
    try {
      localStorage.removeItem('tealedger_token');
      localStorage.removeItem('tealedger_user');
      localStorage.removeItem('tealedger_auth_token');
      localStorage.removeItem('tealedger_auth_user');
    } catch {
      // In sandbox/strict storage environments, ignore errors
    }

    if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
      window.location.href = '/login';
    }
  }

  // Handle non-2xx HTTP errors
  if (!response.ok) {
    let errorData: unknown;
    const contentType = response.headers.get('content-type');

    if (contentType && contentType.includes('application/json')) {
      try {
        errorData = await response.json();
      } catch {
        errorData = null;
      }
    } else {
      try {
        errorData = await response.text();
      } catch {
        errorData = null;
      }
    }

    let message = `Request failed with status ${response.status}`;
    if (errorData && typeof errorData === 'object') {
      const payload = errorData as Record<string, unknown>;
      if (typeof payload.message === 'string' && payload.message) {
        message = payload.message;
      } else if (typeof payload.error === 'string' && payload.error) {
        message = payload.error;
      } else if (typeof payload.title === 'string' && payload.title) {
        message = payload.title;
      }
    } else if (typeof errorData === 'string' && errorData.trim()) {
      message = errorData;
    } else if (response.statusText) {
      message = response.statusText;
    }

    throw new ApiError(message, response.status, errorData);
  }

  // Support 204 No Content responses safely
  if (response.status === 204) {
    return undefined as T;
  }

  const contentLength = response.headers.get('content-length');
  if (contentLength === '0') {
    return undefined as T;
  }

  // Parse JSON response body safely
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    const text = await response.text();
    if (!text || !text.trim()) {
      return undefined as T;
    }
    return JSON.parse(text) as T;
  }

  const textContent = await response.text();
  return (textContent ? (textContent as unknown as T) : (undefined as T));
}

// Convenience HTTP method helpers
apiClient.get = function <T>(endpoint: string, options?: Omit<RequestOptions, 'method'>): Promise<T> {
  return apiClient<T>(endpoint, { ...options, method: 'GET' });
};

apiClient.post = function <T>(
  endpoint: string,
  body?: unknown,
  options?: Omit<RequestOptions, 'method' | 'body'>
): Promise<T> {
  return apiClient<T>(endpoint, { ...options, method: 'POST', body });
};

apiClient.put = function <T>(
  endpoint: string,
  body?: unknown,
  options?: Omit<RequestOptions, 'method' | 'body'>
): Promise<T> {
  return apiClient<T>(endpoint, { ...options, method: 'PUT', body });
};

apiClient.patch = function <T>(
  endpoint: string,
  body?: unknown,
  options?: Omit<RequestOptions, 'method' | 'body'>
): Promise<T> {
  return apiClient<T>(endpoint, { ...options, method: 'PATCH', body });
};

apiClient.delete = function <T>(endpoint: string, options?: Omit<RequestOptions, 'method'>): Promise<T> {
  return apiClient<T>(endpoint, { ...options, method: 'DELETE' });
};

// Aliased export for compatibility
export const api = apiClient;
export default apiClient;
