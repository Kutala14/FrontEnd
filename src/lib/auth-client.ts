import { UserRole, UserSession } from '../types/session';

const API_BASE = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

function getEndpoint(path: string) {
  if (!API_BASE) return path;
  return `${API_BASE}${path}`;
}

export class ApiError extends Error {
  status: number;
  payload: unknown;

  constructor(message: string, status: number, payload: unknown) {
    super(message);
    this.status = status;
    this.payload = payload;
  }
}

interface RequestOptions extends RequestInit {
  skipJson?: boolean;
}

async function request<TResponse>(path: string, options: RequestOptions = {}): Promise<TResponse> {
  let response: Response;

  try {
    response = await fetch(getEndpoint(path), {
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...options.headers,
      },
      ...options,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro de conexão com o servidor';
    throw new ApiError(message, 0, null);
  }

  if (!response.ok) {
    let errorPayload: unknown = null;
    try {
      errorPayload = await response.json();
    } catch {
      // ignore
    }
    throw new ApiError(response.statusText || 'Request failed', response.status, errorPayload);
  }

  if (options.skipJson) {
    return undefined as unknown as TResponse;
  }

  return response.json() as Promise<TResponse>;
}

export interface LoginResponse {
  accessToken: string;
  expiresIn: number;
  user: UserSession;
}

export interface SessionResponse {
  accessToken: string;
  expiresIn: number;
  user: UserSession;
}

interface BackendUser {
  id: string;
  email: string;
  name: string;
  type: UserRole;
  restaurant_id?: number;
}

interface BackendAuthResponse {
  accessToken?: string;
  access_token?: string;
  expiresIn?: number;
  user: BackendUser;
}

function mapUser(user: BackendUser): UserSession {
  return {
    userId: user.id,
    email: user.email,
    name: user.name,
    type: user.type,
    restaurantId: user.restaurant_id,
  };
}

function mapAuthResponse(payload: BackendAuthResponse): LoginResponse {
  return {
    accessToken: payload.accessToken || payload.access_token || '',
    expiresIn: payload.expiresIn ?? 86400,
    user: mapUser(payload.user),
  };
}

export const authClient = {
  login: async (payload: { email: string; password: string; type: UserRole }) => {
    const result = await request<BackendAuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return mapAuthResponse(result);
  },
  googleAuth: async (payload: {
    credential: string;
    type: UserRole;
    name?: string;
    phone?: string;
    location?: string;
    cuisine_id?: number;
  }) => {
    const result = await request<BackendAuthResponse>('/auth/google', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return mapAuthResponse(result);
  },
  refresh: async () => ({ accessToken: '' }),
  logout: async () => undefined,
  session: async (token?: string) => {
    const result = await request<{ user: BackendUser }>('/auth/session', {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });
    return {
      accessToken: token || '',
      expiresIn: 0,
      user: mapUser(result.user),
    } as SessionResponse;
  },
};

export async function fetchWithAccessToken(input: RequestInfo | URL, init: RequestInit = {}, token?: string) {
  if (!token) {
    return fetch(input, init);
  }

  const headers = new Headers(init.headers || {});
  headers.set('Authorization', `Bearer ${token}`);

  return fetch(input, {
    ...init,
    headers,
  });
}
