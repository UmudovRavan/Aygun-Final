import { API_CONFIG } from './config';

export const TOKEN_KEY = 'readlingo_access_token';
export const REFRESH_TOKEN_KEY = 'readlingo_refresh_token';

export function getAccessToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function setTokens(accessToken: string, refreshToken?: string): void {
  localStorage.setItem(TOKEN_KEY, accessToken);
  if (refreshToken) {
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  }
}

export function clearTokens(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem('user');
  localStorage.removeItem('user_role');
  sessionStorage.removeItem('adminAuth');
}

// ── Token expiry helpers ───────────────────────────────────────────────
function parseJwtExpiry(token: string): number | null {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return typeof payload.exp === 'number' ? payload.exp * 1000 : null;
  } catch {
    return null;
  }
}

export function isTokenExpired(token: string): boolean {
  const expiry = parseJwtExpiry(token);
  if (!expiry) return false; // can't parse → assume valid
  return Date.now() >= expiry - 30_000; // 30-second buffer
}

// ── Auth redirect helper ──────────────────────────────────────────────
function redirectToLogin(): void {
  clearTokens();
  const isAdmin =
    window.location.pathname.startsWith('/admin');
  window.location.href = isAdmin ? '/admin-login' : '/login';
}

// ── Refresh flow (singleton promise to avoid duplicate calls) ─────────
let refreshPromise: Promise<string | null> | null = null;

export async function tryRefreshToken(): Promise<string | null> {
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    const accessToken = getAccessToken();
    const refreshToken = getRefreshToken();
    if (!refreshToken) return null;

    try {
      const res = await fetch(`${API_CONFIG.baseUrl}/auth/refresh-token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accessToken: accessToken || '',
          refreshToken: refreshToken,
        }),
      });

      if (!res.ok) return null;

      let data: any;
      try { data = await res.json(); } catch { return null; }

      // unwrap Result wrapper: data?.data or data?.value or data?.Value
      const authData = data?.data || data?.value || data?.Value || data;

      const newAccess = authData?.accessToken;
      const newRefresh = authData?.refreshToken;
      if (!newAccess) return null;

      setTokens(newAccess, newRefresh || undefined);

      // Preserve admin role and session if present
      if (authData?.roles?.includes('Admin') || localStorage.getItem('user_role') === 'admin') {
        sessionStorage.setItem('adminAuth', 'true');
        localStorage.setItem('user_role', 'admin');
      }

      return newAccess;
    } catch {
      return null;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

// ── Request builder ───────────────────────────────────────────────────
function getHeaders(customHeaders: Record<string, string> = {}): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...customHeaders,
  };
  const token = getAccessToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

// ── Core response handler with auto-refresh ───────────────────────────
async function handleResponse<T>(
  res: Response,
  retry?: () => Promise<Response>
): Promise<T> {
  if (res.status === 401 && retry) {
    // Attempt token refresh once
    const newToken = await tryRefreshToken();
    if (newToken) {
      const retried = await retry();
      return handleResponse<T>(retried); // no retry this time
    }
    // Refresh failed → redirect
    redirectToLogin();
    throw new Error('Session expired. Please log in again.');
  }

  if (res.status === 401) {
    redirectToLogin();
    throw new Error('Session expired. Please log in again.');
  }

  let data: any;
  const contentType = res.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    data = await res.json();
  } else {
    data = await res.text();
  }

  if (!res.ok) {
    const errorMsg = data?.error || data?.message || data?.title || `API Error (${res.status})`;
    throw new Error(typeof errorMsg === 'string' ? errorMsg : JSON.stringify(errorMsg));
  }

  // Unwrap Result<T> wrapper
  if (data && typeof data === 'object') {
    if ('isSuccess' in data && data.isSuccess === false) {
      throw new Error(data.error || data.message || 'Operation failed');
    }
    if ('value' in data && data.value !== undefined) return data.value as T;
    if ('Value' in data && data.Value !== undefined) return data.Value as T;
  }

  return data as T;
}

// ── Pre-request token check ───────────────────────────────────────────
async function ensureFreshToken(): Promise<void> {
  const token = getAccessToken();
  if (token && isTokenExpired(token)) {
    const newToken = await tryRefreshToken();
    if (!newToken) {
      redirectToLogin();
      throw new Error('Session expired. Please log in again.');
    }
  }
}

// ── Public API helpers ────────────────────────────────────────────────
export async function apiGet<T>(path: string, customHeaders?: Record<string, string>): Promise<T> {
  await ensureFreshToken();
  const makeReq = () =>
    fetch(`${API_CONFIG.baseUrl}${path}`, { method: 'GET', headers: getHeaders(customHeaders) });
  const res = await makeReq();
  return handleResponse<T>(res, makeReq);
}

export async function apiPost<T>(path: string, body?: unknown, customHeaders?: Record<string, string>): Promise<T> {
  await ensureFreshToken();
  const makeReq = () =>
    fetch(`${API_CONFIG.baseUrl}${path}`, {
      method: 'POST',
      headers: getHeaders(customHeaders),
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  const res = await makeReq();
  return handleResponse<T>(res, makeReq);
}

export async function apiPut<T>(path: string, body?: unknown, customHeaders?: Record<string, string>): Promise<T> {
  await ensureFreshToken();
  const makeReq = () =>
    fetch(`${API_CONFIG.baseUrl}${path}`, {
      method: 'PUT',
      headers: getHeaders(customHeaders),
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  const res = await makeReq();
  return handleResponse<T>(res, makeReq);
}

export async function apiPatch<T>(path: string, body?: unknown, customHeaders?: Record<string, string>): Promise<T> {
  await ensureFreshToken();
  const makeReq = () =>
    fetch(`${API_CONFIG.baseUrl}${path}`, {
      method: 'PATCH',
      headers: getHeaders(customHeaders),
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  const res = await makeReq();
  return handleResponse<T>(res, makeReq);
}

export async function apiDelete<T>(path: string, customHeaders?: Record<string, string>): Promise<T> {
  await ensureFreshToken();
  const makeReq = () =>
    fetch(`${API_CONFIG.baseUrl}${path}`, { method: 'DELETE', headers: getHeaders(customHeaders) });
  const res = await makeReq();
  return handleResponse<T>(res, makeReq);
}

export async function apiUploadFile<T>(path: string, formData: FormData): Promise<T> {
  await ensureFreshToken();
  const token = getAccessToken();
  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const makeReq = () =>
    fetch(`${API_CONFIG.baseUrl}${path}`, { method: 'POST', headers, body: formData });
  const res = await makeReq();
  return handleResponse<T>(res, makeReq);
}

export function getMediaUrl(path?: string): string {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) {
    return path;
  }
  const origin = API_CONFIG.baseUrl.replace(/\/api\/v[0-9.]+\/?$/, '');
  return `${origin}${path.startsWith('/') ? '' : '/'}${path}`;
}
