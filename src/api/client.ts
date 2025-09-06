import {supabase} from "@/integrations/supabase/client.ts";

export const API_BASE = import.meta.env.VITE_API_BASE?.replace(/\/$/, "") ?? "/api";

async function getAccessToken(): Promise<string | undefined> {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token;
}

async function handle(res: Response) {
    if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`HTTP ${res.status}: ${text || res.statusText}`);
    }
    return res;
}

export async function getJson<T>(path: string, init?: RequestInit): Promise<T> {
    const token = await getAccessToken();

    const headers = new Headers(init?.headers as HeadersInit | undefined);
    headers.set('Context-Type', 'application/json');
    if (token) headers.set('Authorization', `Bearer ${token}`);

    const res = await handle(await fetch(`${API_BASE}${path}`, {
        ...init,
        method: 'GET',
        headers,
    }));
    return res.json() as Promise<T>;
}

export async function postFormData<T>(path: string, init?: RequestInit): Promise<T> {
    const token = await getAccessToken();

    const headers = new Headers(init?.headers as HeadersInit | undefined);
    if (token) headers.set('Authorization', `Bearer ${token}`);

    const res = await handle(await fetch(`${API_BASE}${path}`, {
        ...init,
        method: 'POST',
        headers,
    }));
    return res.json() as Promise<T>;
}

export async function deleteJson(path: string, init?: RequestInit): Promise<void> {
    const token = await getAccessToken();

    const headers = new Headers(init?.headers as HeadersInit | undefined);
    headers.set('Context-Type', 'application/json');
    if (token) headers.set('Authorization', `Bearer ${token}`);

    await handle(await fetch(`${API_BASE}${path}`, {
        ...init,
        method: 'DELETE',
        headers,
    }));
}

export async function getBlob(path: string, init?: RequestInit): Promise<Blob> {
    const res = await handle(await fetch(`${API_BASE}${path}`, {
        ...init,
        method: 'GET',
    }));
    return res.blob();
}

// Fetch from presigned URL (sas_url). We do not send credentials.
export async function getPresigned(url: string, init?: RequestInit): Promise<Response> {
    return handle(await fetch(url, {
        ...init,
        method: 'GET',
    }));
}