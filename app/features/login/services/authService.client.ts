import type { LoginApiResponse, LoginRequestBody } from "../types";

export async function loginService(payload: LoginRequestBody): Promise<LoginApiResponse> {
  const res = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  let data: any = null;
  try {
    data = await res.json();
  } catch {
    // ignore
  }

  if (!data || typeof data !== "object" || typeof data.ok !== "boolean") {
    return { ok: false, message: "Login gagal (response tidak valid)." };
  }

  return data as LoginApiResponse;
}
