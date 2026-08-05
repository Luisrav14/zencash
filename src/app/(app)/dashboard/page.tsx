"use client";

import { TopBar } from "@/components/layout/TopBar";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { formatCurrency } from "@/lib/utils";
import { useAccounts } from "@/hooks/useAccounts";
import { useTransactions } from "@/hooks/useTransactions";
import { useBudgets } from "@/hooks/useBudgets";
import { useCategories } from "@/hooks/useCategories";
import { useUpcomingPayments } from "@/hooks/useUpcomingPayments";
import { useSession } from "@/lib/client/useSession";

export default function DashboardPage() {
  const { data: accounts } = useAccounts();
  const { data: transactions } = useTransactions();
  const { data: budgets } = useBudgets();
  const { data: categories } = useCategories();
  const { data: upcomingPayments } = useUpcomingPayments();
  const { user } = useSession();

  const initialBalance = (accounts ?? []).reduce((sum, a) => sum + a.initialBalance, 0);
  const income = (transactions ?? []).filter((t) => t.type === "income").reduce((sum, t) => sum + t.amount, 0);
  const expense = (transactions ?? []).filter((t) => t.type === "expense").reduce((sum, t) => sum + t.amount, 0);
  const balance = initialBalance + income - expense;

  const now = new Date();
  const monthTransactions = (transactions ?? []).filter((t) => {
    const date = new Date(t.date);
    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
  });
  const monthIncome = monthTransactions.filter((t) => t.type === "income").reduce((sum, t) => sum + t.amount, 0);
  const monthExpense = monthTransactions.filter((t) => t.type === "expense").reduce((sum, t) => sum + t.amount, 0);

  const accountBalances = (accounts ?? []).map((account) => {
    const accountTransactions = (transactions ?? []).filter((t) => t.accountId === account.id);
    const accIncome = accountTransactions.filter((t) => t.type === "income").reduce((sum, t) => sum + t.amount, 0);
    const accExpense = accountTransactions.filter((t) => t.type === "expense").reduce((sum, t) => sum + t.amount, 0);
    return { ...account, balance: account.initialBalance + accIncome - accExpense };
  });

  const expenseByCategory = monthTransactions
    .filter((t) => t.type === "expense")
    .reduce<Record<string, number>>((acc, t) => {
      acc[t.categoryId] = (acc[t.categoryId] ?? 0) + t.amount;
      return acc;
    }, {});
  const topCategories = Object.entries(expenseByCategory)
    .map(([categoryId, amount]) => ({ category: categories?.find((c) => c.id === categoryId), amount }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 3);

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

        <div className="grid grid-cols-2 gap-3">
          <Card>
            <p className="text-xs text-muted-foreground">Ingresos del mes</p>
            <p className="mt-1 text-lg font-semibold text-income">{formatCurrency(monthIncome)}</p>
          </Card>
          <Card>
            <p className="text-xs text-muted-foreground">Gastos del mes</p>
            <p className="mt-1 text-lg font-semibold text-expense">{formatCurrency(monthExpense)}</p>
          </Card>
        </div>

        {accountBalances.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Tus cuentas</CardTitle>
            </CardHeader>
            <div className="space-y-2">
              {accountBalances.map((account) => (
                <div key={account.id} className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    {account.color && <span className="h-2 w-2 rounded-full" style={{ backgroundColor: account.color }} />}
                    {account.name}
                  </span>
                  <span className="font-medium">{formatCurrency(account.balance)}</span>
                </div>
              ))}
            </div>
          </Card>
        )}

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

        {topCategories.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Mayores gastos del mes</CardTitle>
            </CardHeader>
            <div className="space-y-2">
              {topCategories.map(({ category, amount }) => (
                <div key={category?.id ?? "sin-categoria"} className="flex items-center justify-between text-sm">
                  <span>
                    {category?.icon ? `${category.icon} ` : ""}
                    {category?.name ?? "Sin categoría"}
                  </span>
                  <span className="font-medium text-expense">{formatCurrency(amount)}</span>
                </div>
              ))}
            </div>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Sobres del mes</CardTitle>
          </CardHeader>
          {(budgets ?? []).length === 0 ? (
            <p className="text-sm text-muted-foreground">Crea tu primer presupuesto por categoría para ver el avance aquí.</p>
          ) : (
            <div className="space-y-3">
              {(budgets ?? []).slice(0, 3).map((budget) => {
                const spent = expenseByCategory[budget.categoryId] ?? 0;
                const percentage = Math.min(100, Math.round((spent / budget.amount) * 100));
                return (
                  <div key={budget.id}>
                    <div className="flex items-center justify-between text-sm">
                      <span>
                        {budget.category?.icon ? `${budget.category.icon} ` : ""}
                        {budget.category?.name ?? "Categoría"}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatCurrency(spent)} / {formatCurrency(budget.amount)}
                      </span>
                    </div>
                    <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-surface-muted">
                      <div className={percentage >= 100 ? "h-full bg-expense" : "h-full bg-primary"} style={{ width: `${percentage}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </section>
    </>
  );
}
