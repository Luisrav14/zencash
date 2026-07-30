"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { registerRequest } from "@/lib/client/authClient";

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    const form = new FormData(event.currentTarget);
    try {
      await registerRequest({
        name: String(form.get("name") ?? "") || undefined,
        email: String(form.get("email") ?? ""),
        password: String(form.get("password") ?? ""),
      });
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo crear la cuenta");
      setLoading(false);
    }
  }

  return (
    <div className="space-y-8">
      <div className="space-y-1">
        <p className="text-sm font-medium text-primary">ZenCash</p>
        <h1 className="text-2xl font-semibold tracking-tight">Crea tu cuenta</h1>
        <p className="text-sm text-muted-foreground">Gratis, sin anuncios y funciona sin conexión.</p>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <Input label="Nombre" type="text" name="name" placeholder="Tu nombre" />
        <Input label="Correo" type="email" name="email" placeholder="tu@correo.com" required />
        <Input label="Contraseña" type="password" name="password" placeholder="Mínimo 8 caracteres" minLength={8} required />
        {error && <p className="text-sm text-expense">{error}</p>}
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Creando cuenta…" : "Crear cuenta"}
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        ¿Ya tienes cuenta?{" "}
        <Link href="/login" className="font-medium text-primary">
          Inicia sesión
        </Link>
      </p>
    </div>
  );
}
