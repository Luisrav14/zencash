"use client";

import { useState, type FormEvent } from "react";
import { TopBar } from "@/components/layout/TopBar";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { formatCurrency, cn } from "@/lib/utils";
import { useAccounts } from "@/hooks/useAccounts";
import { useCategories } from "@/hooks/useCategories";
import { useCreateTransaction, useDeleteTransaction, useTransactions } from "@/hooks/useTransactions";

export default function TransactionsPage() {
  const { data: transactions, isLoading } = useTransactions();
  const { data: accounts } = useAccounts();
  const { data: categories } = useCategories();
  const createTransaction = useCreateTransaction();
  const deleteTransaction = useDeleteTransaction();

  const [type, setType] = useState<"income" | "expense">("expense");
  const [error, setError] = useState<string | null>(null);

  const filteredCategories = (categories ?? []).filter((c) => c.type === type);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const form = new FormData(event.currentTarget);

    try {
      await createTransaction.mutateAsync({
        amount: Number(form.get("amount")),
        type,
        date: new Date(String(form.get("date"))).toISOString(),
        categoryId: String(form.get("categoryId")),
        accountId: String(form.get("accountId")),
        note: String(form.get("note") ?? "") || undefined,
      });
      (event.target as HTMLFormElement).reset();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo registrar el movimiento");
    }
  }

  return (
    <>
      <TopBar title="Movimientos" subtitle="Ingresos y gastos" />

      <section className="space-y-4 px-5 pt-5">
        <Card>
          <CardHeader>
            <CardTitle>Nuevo movimiento</CardTitle>
          </CardHeader>

          <div className="mb-4 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setType("expense")}
              className={cn(
                "h-10 rounded-xl text-sm font-medium transition-colors",
                type === "expense" ? "bg-expense/15 text-expense" : "bg-surface-muted text-muted-foreground",
              )}
            >
              Gasto
            </button>
            <button
              type="button"
              onClick={() => setType("income")}
              className={cn(
                "h-10 rounded-xl text-sm font-medium transition-colors",
                type === "income" ? "bg-income/15 text-income" : "bg-surface-muted text-muted-foreground",
              )}
            >
              Ingreso
            </button>
          </div>

          <form className="space-y-3" onSubmit={handleSubmit}>
            <Input label="Monto" name="amount" type="number" step="0.01" min="0" required />
            <Select label="Cuenta" name="accountId" required defaultValue="">
              <option value="" disabled>
                Selecciona una cuenta
              </option>
              {accounts?.map((account) => (
                <option key={account.id} value={account.id}>
                  {account.name}
                </option>
              ))}
            </Select>
            <Select label="Categoría" name="categoryId" required defaultValue="">
              <option value="" disabled>
                Selecciona una categoría
              </option>
              {filteredCategories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.icon ? `${category.icon} ` : ""}
                  {category.name}
                </option>
              ))}
            </Select>
            <Input label="Fecha" name="date" type="date" defaultValue={new Date().toISOString().slice(0, 10)} required />
            <Input label="Nota (opcional)" name="note" type="text" placeholder="Ej. Súper del mes" />
            {error && <p className="text-sm text-expense">{error}</p>}
            <Button type="submit" className="w-full" disabled={createTransaction.isPending}>
              {createTransaction.isPending ? "Guardando…" : "Agregar movimiento"}
            </Button>
          </form>
        </Card>

        <div className="space-y-2">
          {isLoading && <p className="text-sm text-muted-foreground">Cargando movimientos…</p>}
          {!isLoading && transactions?.length === 0 && (
            <Card>
              <p className="text-sm text-muted-foreground">Aún no tienes movimientos registrados.</p>
            </Card>
          )}
          {transactions?.map((transaction) => (
            <Card key={transaction.id} className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">
                  {transaction.category?.icon ? `${transaction.category.icon} ` : ""}
                  {transaction.category?.name ?? "Sin categoría"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {transaction.account?.name} · {new Date(transaction.date).toLocaleDateString("es-MX")}
                </p>
                {transaction.note && <p className="text-xs text-muted-foreground">{transaction.note}</p>}
              </div>
              <div className="flex items-center gap-3">
                <span className={cn("text-sm font-semibold", transaction.type === "income" ? "text-income" : "text-expense")}>
                  {transaction.type === "income" ? "+" : "-"}
                  {formatCurrency(transaction.amount)}
                </span>
                <button type="button" onClick={() => deleteTransaction.mutate(transaction.id)} className="text-xs text-muted-foreground underline">
                  Eliminar
                </button>
              </div>
            </Card>
          ))}
        </div>
      </section>
    </>
  );
}
