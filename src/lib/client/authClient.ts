export type AuthUser = {
  id: string;
  email: string;
  name?: string;
};

async function parseJson(res: Response) {
  try {
    return await res.json();
  } catch {
    return null;
  }
}

export async function registerRequest(data: { email: string; password: string; name?: string }) {
  const res = await fetch("/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
    credentials: "include",
  });
  const body = await parseJson(res);
  if (!res.ok) {
    throw new Error(body?.error?.formErrors?.[0] ?? body?.error ?? "No se pudo crear la cuenta");
  }
  return body.user as AuthUser;
}

export async function loginRequest(data: { email: string; password: string }) {
  const res = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
    credentials: "include",
  });
  const body = await parseJson(res);
  if (!res.ok) {
    throw new Error(body?.error ?? "Credenciales inválidas");
  }
  return body.user as AuthUser;
}

export async function logoutRequest() {
  await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
}

export async function meRequest(): Promise<AuthUser | null> {
  const res = await fetch("/api/auth/me", { credentials: "include" });
  if (!res.ok) return null;
  const body = await parseJson(res);
  return body?.user ?? null;
}
