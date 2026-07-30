"use client";

import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { useState, type FormEvent } from "react";
import { formatCurrency, cn } from "@/lib/utils";
import { TopBar } from "@/components/layout/TopBar";
import { useCategories } from "@/hooks/useCategories";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { useCreateUpcomingPayment, useDeleteUpcomingPayment, useMarkUpcomingPaymentPaid, useUpcomingPayments } from "@/hooks/useUpcomingPayments";

export default function UpcomingPaymentsPage() {
  const { data: payments, isLoading } = useUpcomingPayments();
  const { data: categories } = useCategories();
  const createPayment = useCreateUpcomingPayment();
  const markPaid = useMarkUpcomingPaymentPaid();
  const deletePayment = useDeleteUpcomingPayment();
  const [error, setError] = useState<string | null>(null);

  const pending = (payments ?? []).filter((p) => !p.paid);
  const paid = (payments ?? []).filter((p) => p.paid);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const form = new FormData(event.currentTarget);

    try {
      await createPayment.mutateAsync({
        amount: Number(form.get("amount")),
        dueDate: new Date(String(form.get("dueDate"))).toISOString(),
        note: String(form.get("note") ?? "") || undefined,
        categoryId: String(form.get("categoryId") ?? "") || undefined,
      });
      (event.target as HTMLFormElement).reset();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo registrar el pago");
    }
  }

  return (
    <>
      <TopBar title="Próximos pagos" subtitle="El limbo: aún no afectan tu balance" />

      <section className="space-y-4 px-5 pt-5">
        <Card>
          <CardHeader>
            <CardTitle>Nuevo pago próximo</CardTitle>
          </CardHeader>
          <form className="space-y-3" onSubmit={handleSubmit}>
            <Input label="Monto" name="amount" type="number" step="0.01" min="0" required />
            <Input label="Fecha límite" name="dueDate" type="date" required />
            <Select label="Categoría (opcional)" name="categoryId" defaultValue="">
              <option value="">Sin categoría</option>
              {categories?.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.icon ? `${category.icon} ` : ""}
                  {category.name}
                </option>
              ))}
            </Select>
            <Input label="Nota (opcional)" name="note" type="text" placeholder="Ej. Renta de agosto" />
            {error && <p className="text-sm text-expense">{error}</p>}
            <Button type="submit" className="w-full" disabled={createPayment.isPending}>
              {createPayment.isPending ? "Guardando…" : "Agregar pago"}
            </Button>
          </form>
        </Card>

        <div className="space-y-2">
          {isLoading && <p className="text-sm text-muted-foreground">Cargando pagos…</p>}
          {!isLoading && pending.length === 0 && (
            <Card>
              <p className="text-sm text-muted-foreground">No tienes pagos pendientes en el limbo.</p>
            </Card>
          )}
          {pending.map((payment) => (
            <Card key={payment.id} className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">{payment.note || "Pago próximo"}</p>
                <p className="text-xs text-muted-foreground">Vence {new Date(payment.dueDate).toLocaleDateString("es-MX")}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold">{formatCurrency(payment.amount)}</span>
                <button type="button" onClick={() => markPaid.mutate(payment.id)} className="text-xs font-medium text-primary underline">
                  Marcar pagado
                </button>
                <button type="button" onClick={() => deletePayment.mutate(payment.id)} className="text-xs text-muted-foreground underline">
                  Eliminar
                </button>
              </div>
            </Card>
          ))}
        </div>

        {paid.length > 0 && (
          <div className="space-y-2 pb-4">
            <p className="text-xs font-medium text-muted-foreground">Pagados</p>
            {paid.map((payment) => (
              <Card key={payment.id} className="flex items-center justify-between opacity-60">
                <div>
                  <p className={cn("text-sm font-medium line-through")}>{payment.note || "Pago próximo"}</p>
                  <p className="text-xs text-muted-foreground">Vencía {new Date(payment.dueDate).toLocaleDateString("es-MX")}</p>
                </div>
                <span className="text-sm font-semibold">{formatCurrency(payment.amount)}</span>
              </Card>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
