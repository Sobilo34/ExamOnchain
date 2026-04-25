/**
 * Browser: same-origin `/api/v1/...` (rewritten to Fastify in next.config).
 * Server: direct BACKEND_URL / NEXT_PUBLIC_API_URL.
 */
export function apiBase(): string {
  if (typeof window !== "undefined") {
    return "/api";
  }
  return process.env.BACKEND_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:4000";
}

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const base = apiBase();
  const url = `${base}${path.startsWith("/") ? path : `/${path}`}`;
  const headers: Record<string, string> = { ...((init?.headers as Record<string, string>) ?? {}) };
  if (init?.body != null && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }
  const res = await fetch(url, {
    credentials: "include",
    ...init,
    headers,
  });
  const data = (await res.json().catch(() => ({}))) as { error?: string };
  if (!res.ok) throw new Error(data.error ?? res.statusText);
  return data as T;
}

export async function uploadMaterial(courseId: number, file: File): Promise<{ material: { id: number; cid: string; name: string } }> {
  const base = apiBase();
  const fd = new FormData();
  fd.append("file", file);
  const res = await fetch(`${base}/v1/lecturer/courses/${courseId}/materials`, {
    method: "POST",
    credentials: "include",
    body: fd,
  });
  const data = (await res.json()) as { error?: string; material?: { id: number; cid: string; name: string } };
  if (!res.ok) throw new Error(data.error ?? res.statusText);
  return data as { material: { id: number; cid: string; name: string } };
}
