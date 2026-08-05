"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { loginRequest } from "@/lib/client/authClient";

export default function LoginPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    const form = new FormData(event.currentTarget);
    try {
      await loginRequest({
        email: String(form.get("email") ?? ""),
        password: String(form.get("password") ?? ""),
      });
      await queryClient.invalidateQueries({ queryKey: ["session"] });
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Credenciales inválidas");
      setLoading(false);
    }
  }

  return (
    <div className="space-y-8">
      <div className="space-y-1">
        <p className="text-sm font-medium text-primary">ZenCash</p>
        <h1 className="text-2xl font-semibold tracking-tight">Bienvenido de vuelta</h1>
        <p className="text-sm text-muted-foreground">Inicia sesión para ver tus finanzas.</p>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <Input label="Correo" type="email" name="email" placeholder="tu@correo.com" required />
        <Input label="Contraseña" type="password" name="password" placeholder="••••••••" required />
        {error && <p className="text-sm text-expense">{error}</p>}
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Entrando…" : "Entrar"}
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        ¿No tienes cuenta?{" "}
        <Link href="/register" className="font-medium text-primary">
          Regístrate
        </Link>
      </p>
    </div>
  );
}
