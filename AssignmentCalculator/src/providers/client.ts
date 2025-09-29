// src/data/client.ts
export const API_BASE = import.meta.env.VITE_API_BASE ?? '/api';

export async function http<T>(path: string, init?: RequestInit): Promise<T> {
    const res = await fetch(`${API_BASE}${path}`, {
        credentials: 'include',
        headers: {'Content-Type': 'application/json'},
        ...init,
    });
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
    return res.json() as Promise<T>;
}