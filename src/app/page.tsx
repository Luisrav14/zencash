import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function Home() {
  return (
    <div className="mx-auto flex min-h-svh w-full max-w-md flex-col justify-between px-6 py-10">
      <div className="pt-16 text-center">
        <p className="text-sm font-medium text-primary">ZenCash</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">Tus finanzas, sin fricción.</h1>
        <p className="mt-3 text-balance text-sm text-muted-foreground">
          Ingresos, gastos, presupuesto por sobres y próximos pagos en una PWA que funciona sin conexión.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <Link href="/register">
          <Button className="w-full" size="lg">
            Crear cuenta gratis
          </Button>
        </Link>
        <Link href="/login">
          <Button className="w-full" size="lg" variant="secondary">
            Ya tengo cuenta
          </Button>
        </Link>
      </div>
    </div>
  );
}
