// src/data/api.ts
export const API_BASE = import.meta.env.VITE_API_BASE ?? '/api';

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export async function api<T>(
    path: string,
    method: HttpMethod = 'GET',
    body?: unknown,
    signal?: AbortSignal
): Promise<T> {
    const res = await fetch(`${API_BASE}${path}`, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: body ? JSON.stringify(body) : undefined,
        signal,
        credentials: 'include',
    });
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
    return res.json() as Promise<T>;
}