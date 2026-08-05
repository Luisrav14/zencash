"use client";

import { useState, type FormEvent } from "react";
import { TopBar } from "@/components/layout/TopBar";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { formatCurrency } from "@/lib/utils";
import { useCategories } from "@/hooks/useCategories";
import { useTransactions } from "@/hooks/useTransactions";
import { useBudgets, useCreateBudget, useDeleteBudget } from "@/hooks/useBudgets";
import { AddToggleButton } from "@/components/ui/AddToggleButton";

export default function BudgetsPage() {
  const { data: budgets, isLoading } = useBudgets();
  const { data: categories } = useCategories();
  const { data: transactions } = useTransactions();
  const createBudget = useCreateBudget();
  const deleteBudget = useDeleteBudget();

  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const expenseCategories = (categories ?? []).filter((c) => c.type === "expense");

  const now = new Date();
  const spentByCategory = (transactions ?? []).reduce<Record<string, number>>((acc, t) => {
    const date = new Date(t.date);
    if (t.type !== "expense" || date.getMonth() !== now.getMonth() || date.getFullYear() !== now.getFullYear()) {
      return acc;
    }
    acc[t.categoryId] = (acc[t.categoryId] ?? 0) + t.amount;
    return acc;
  }, {});

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const form = new FormData(event.currentTarget);

    try {
      await createBudget.mutateAsync({
        categoryId: String(form.get("categoryId")),
        amount: Number(form.get("amount")),
        period: "monthly",
      });
      (event.target as HTMLFormElement).reset();
      setShowForm(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo crear el sobre");
    }
  }

  return (
    <>
      <TopBar title="Sobres" subtitle="Presupuesto mensual por categoría" />

      <section className="space-y-4 px-5 pt-5">
        <Card>
          <CardHeader>
            <CardTitle>Nuevo sobre</CardTitle>
            <AddToggleButton open={showForm} onClick={() => setShowForm((v) => !v)} label="Agregar sobre" />
          </CardHeader>
          {showForm && (
            <form className="space-y-3" onSubmit={handleSubmit}>
              <Select label="Categoría" name="categoryId" required defaultValue="">
                <option value="" disabled>
                  Selecciona una categoría
                </option>
                {expenseCategories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.icon ? `${category.icon} ` : ""}
                    {category.name}
                  </option>
                ))}
              </Select>
              <Input label="Monto mensual" name="amount" type="number" step="0.01" min="0" required />
              {error && <p className="text-sm text-expense">{error}</p>}
              <Button type="submit" className="w-full" disabled={createBudget.isPending}>
                {createBudget.isPending ? "Guardando…" : "Crear sobre"}
              </Button>
            </form>
          )}
        </Card>

        <div className="space-y-2">
          {isLoading && <p className="text-sm text-muted-foreground">Cargando sobres…</p>}
          {!isLoading && budgets?.length === 0 && (
            <Card>
              <p className="text-sm text-muted-foreground">Aún no tienes sobres. Crea el primero arriba.</p>
            </Card>
          )}
          {budgets?.map((budget) => {
            const spent = spentByCategory[budget.categoryId] ?? 0;
            const percentage = Math.min(100, Math.round((spent / budget.amount) * 100));
            return (
              <Card key={budget.id}>
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">
                    {budget.category?.icon ? `${budget.category.icon} ` : ""}
                    {budget.category?.name ?? "Categoría"}
                  </p>
                  <button type="button" onClick={() => deleteBudget.mutate(budget.id)} className="text-xs text-muted-foreground underline">
                    Eliminar
                  </button>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {formatCurrency(spent)} de {formatCurrency(budget.amount)}
                </p>
                <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-surface-muted">
                  <div className={percentage >= 100 ? "h-full bg-expense" : "h-full bg-primary"} style={{ width: `${percentage}%` }} />
                </div>
              </Card>
            );
          })}
        </div>
      </section>
    </>
  );
}
