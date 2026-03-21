const API_BASE = (import.meta.env.VITE_API_URL || '').trim().replace(/\/$/, '');
const API_KEY = (import.meta.env.VITE_API_KEY || '').trim();
const API_KEY_HEADER = (import.meta.env.VITE_API_KEY_HEADER || 'x-api-key').trim();

const API_PATH_PREFIXES = ['/api/', '/auth/', '/restaurants/', '/explore/', '/experiences/', '/reservations/', '/notifications/', '/reviews/'];

function isApiRequest(input: RequestInfo | URL): boolean {
  const raw = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url;

  if (API_BASE && raw.startsWith(API_BASE)) return true;

  try {
    const parsed = new URL(raw, window.location.origin);
    return API_PATH_PREFIXES.some((prefix) => parsed.pathname.startsWith(prefix));
  } catch {
    return API_PATH_PREFIXES.some((prefix) => raw.startsWith(prefix));
  }
}

export function setupApiKeyFetch() {
  const scopedWindow = window as Window & { __tukulaApiKeyFetchInstalled?: boolean };
  if (scopedWindow.__tukulaApiKeyFetchInstalled) return;

  const originalFetch = window.fetch.bind(window);

  window.fetch = async (input: RequestInfo | URL, init: RequestInit = {}) => {
    if (!isApiRequest(input)) {
      return originalFetch(input, init);
    }

    if (!API_KEY) {
      throw new Error('API key nao configurada. Defina VITE_API_KEY no ficheiro .env.');
    }

    const headers = new Headers(input instanceof Request ? input.headers : undefined);
    const initHeaders = new Headers(init.headers || {});

    initHeaders.forEach((value, key) => {
      headers.set(key, value);
    });

    headers.set(API_KEY_HEADER, API_KEY);

    return originalFetch(input, {
      ...init,
      headers,
    });
  };

  scopedWindow.__tukulaApiKeyFetchInstalled = true;
}
