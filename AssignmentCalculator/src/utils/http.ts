// Unified HTTP client for all backend API calls
// Replaces duplicate implementations in client.ts and plan.ts

export interface HttpOptions extends RequestInit {
  timeout?: number;
  retries?: number;
}

export const API_BASE = import.meta.env.VITE_API_BASE ?? '/api';

export class HttpError extends Error {
  public status: number;
  public statusText: string;
  public detail?: string;

  constructor(status: number, statusText: string, detail?: string) {
    super(`HTTP ${status} ${statusText}${detail ? `: ${detail}` : ''}`);
    this.name = 'HttpError';
    this.status = status;
    this.statusText = statusText;
    this.detail = detail;
  }
}

/**
 * Unified HTTP client with:
 * - Automatic timeout handling (default 30s)
 * - Comprehensive error detail extraction
 * - Credential handling for session management
 * - Support for JSON, Blob, and No Content responses
 */
export async function http<T>(
  path: string,
  options: HttpOptions = {}
): Promise<T> {
  const { timeout = 30000, retries = 0, ...init } = options;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const res = await fetch(`${API_BASE}${path}`, {
      credentials: 'include',
      headers: { 'Content-Type': 'application/json', ...init.headers },
      signal: controller.signal,
      ...init,
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      let detail = '';
      try {
        const data = await res.json();
        detail = data?.error || data?.message || JSON.stringify(data);
      } catch {
        detail = await res.text().catch(() => '');
      }
      throw new HttpError(res.status, res.statusText, detail);
    }

    // Handle No Content responses
    if (res.status === 204) return undefined as unknown as T;

    return (await res.json()) as Promise<T>;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof HttpError) throw error;
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error(`Request timeout after ${timeout}ms`);
    }
    throw error;
  }
}

/**
 * HTTP client for binary responses (PDF, ICS files)
 */
export async function httpBlob(
  path: string,
  options: HttpOptions = {}
): Promise<Blob> {
  const { timeout = 30000, ...init } = options;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const res = await fetch(`${API_BASE}${path}`, {
      credentials: 'include',
      signal: controller.signal,
      ...init,
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      const txt = await res.text().catch(() => '');
      throw new HttpError(res.status, res.statusText, txt);
    }

    return await res.blob();
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof HttpError) throw error;
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error(`Request timeout after ${timeout}ms`);
    }
    throw error;
  }
}

/**
 * Trigger browser download for a blob
 */
export function triggerDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
