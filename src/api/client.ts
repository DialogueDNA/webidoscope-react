export const API_BASE = import.meta.env.VITE_API_BASE?.replace(/\/$/, "") ?? "/api";


async function handle(res: Response) {
if (!res.ok) {
const text = await res.text().catch(() => "");
throw new Error(`HTTP ${res.status}: ${text || res.statusText}`);
}
return res;
}


export async function getJson<T>(path: string, init?: RequestInit): Promise<T> {
const res = await handle(await fetch(`${API_BASE}${path}`, {
...init,
headers: { 'Accept': 'application/json', ...(init?.headers ?? {}) }
}));
return res.json() as Promise<T>;
}


export async function getBlob(path: string, init?: RequestInit): Promise<Blob> {
const res = await handle(await fetch(`${API_BASE}${path}`, init));
return res.blob();
}


// Fetch from presigned URL (sas_url). We do not send credentials.
export async function getPresigned(url: string, init?: RequestInit): Promise<Response> {
return handle(await fetch(url, { method: 'GET', ...init }));
}