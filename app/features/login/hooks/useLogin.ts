"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { loginService } from "@/app/features/login/services/authService.client";
import type { LoginRequestBody } from "../types";

export function useLogin() {
  const router = useRouter();

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const canSubmit = useMemo(() => {
    return identifier.trim().length > 0 && password.length > 0 && !loading;
  }, [identifier, password, loading]);

  const submit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setError("");

    const payload: LoginRequestBody = { identifier: identifier.trim(), password };

    if (!payload.identifier || !payload.password) {
      setError("Identifier dan password wajib diisi.");
      return;
    }

    try {
      setLoading(true);
      const data = await loginService(payload);

      if (!data.ok) {
        setError(data.message || "Login gagal.");
        return;
      }

      router.replace(data.redirectTo);
    } catch (err: any) {
      setError(err?.message ?? "Terjadi error.");
    } finally {
      setLoading(false);
    }
  };

  return {
    identifier,
    setIdentifier,
    password,
    setPassword,
    loading,
    error,
    canSubmit,
    submit,
  };
}
