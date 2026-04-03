export const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const headers: Record<string, string> = { ...((init?.headers as Record<string, string>) ?? {}) };
  if (init?.body != null && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }
  const res = await fetch(`${API_BASE}${path}`, {
    credentials: "include",
    ...init,
    headers,
  });
  const data = (await res.json().catch(() => ({}))) as { error?: string };
  if (!res.ok) throw new Error(data.error ?? res.statusText);
  return data as T;
}

export async function uploadMaterial(courseId: number, file: File): Promise<{ material: { id: number; cid: string; name: string } }> {
  const fd = new FormData();
  fd.append("file", file);
  const res = await fetch(`${API_BASE}/v1/lecturer/courses/${courseId}/materials`, {
    method: "POST",
    credentials: "include",
    body: fd,
  });
  const data = (await res.json()) as { error?: string; material?: { id: number; cid: string; name: string } };
  if (!res.ok) throw new Error(data.error ?? res.statusText);
  return data as { material: { id: number; cid: string; name: string } };
}
