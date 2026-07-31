"use client";

import { TopBar } from "@/components/layout/TopBar";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { formatCurrency } from "@/lib/utils";
import { useAccounts } from "@/hooks/useAccounts";
import { useTransactions } from "@/hooks/useTransactions";
import { useBudgets } from "@/hooks/useBudgets";
import { useUpcomingPayments } from "@/hooks/useUpcomingPayments";
import { useSession } from "@/lib/client/useSession";

export default function DashboardPage() {
  const { data: accounts } = useAccounts();
  const { data: transactions } = useTransactions();
  const { data: budgets } = useBudgets();
  const { data: upcomingPayments } = useUpcomingPayments();
  const { user } = useSession();

  const initialBalance = (accounts ?? []).reduce((sum, a) => sum + a.initialBalance, 0);
  const income = (transactions ?? []).filter((t) => t.type === "income").reduce((sum, t) => sum + t.amount, 0);
  const expense = (transactions ?? []).filter((t) => t.type === "expense").reduce((sum, t) => sum + t.amount, 0);
  const balance = initialBalance + income - expense;

  const pendingPayments = (upcomingPayments ?? []).filter((p) => !p.paid);
  const pendingTotal = pendingPayments.reduce((sum, p) => sum + p.amount, 0);

  const userName = user?.name ?? "";

  return (
    <>
      <TopBar title={`Hola ${userName} ${" 👋 "}`} subtitle="Este es tu resumen de hoy" />

      <section className="space-y-4 px-5 pt-5">
        <Card className="bg-primary text-primary-foreground">
          <p className="text-sm opacity-80">Saldo total</p>
          <p className="mt-1 text-3xl font-semibold tracking-tight">{formatCurrency(balance)}</p>
          <div className="mt-4 flex gap-4 text-sm">
            <span className="opacity-90 text-green-800">↑ Ingresos {formatCurrency(income)}</span>
            <span className="opacity-90 text-red-600">↓ Gastos {formatCurrency(expense)}</span>
          </div>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Próximos pagos</CardTitle>
          </CardHeader>
          {pendingPayments.length === 0 ? (
            <p className="text-sm text-muted-foreground">Aún no tienes pagos pendientes registrados en el limbo.</p>
          ) : (
            <>
              <p className="text-sm text-muted-foreground">
                {pendingPayments.length} pago{pendingPayments.length > 1 ? "s" : ""} pendiente
                {pendingPayments.length > 1 ? "s" : ""} · {formatCurrency(pendingTotal)}
              </p>
              <div className="mt-2 space-y-1">
                {pendingPayments.slice(0, 3).map((payment) => (
                  <div key={payment.id} className="flex justify-between text-sm">
                    <span>{payment.note || "Pago próximo"}</span>
                    <span className="font-medium">{formatCurrency(payment.amount)}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sobres del mes</CardTitle>
          </CardHeader>
          {(budgets ?? []).length === 0 ? (
            <p className="text-sm text-muted-foreground">Crea tu primer presupuesto por categoría para ver el avance aquí.</p>
          ) : (
            <p className="text-sm text-muted-foreground">
              Tienes {budgets?.length} sobre{(budgets?.length ?? 0) > 1 ? "s" : ""} activo
              {(budgets?.length ?? 0) > 1 ? "s" : ""}.
            </p>
          )}
        </Card>
      </section>
    </>
  );
}
