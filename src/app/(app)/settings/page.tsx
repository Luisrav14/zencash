"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { TopBar } from "@/components/layout/TopBar";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { formatCurrency } from "@/lib/utils";
import { useAccounts, useCreateAccount, useDeleteAccount } from "@/hooks/useAccounts";
import { useCategories, useCreateCategory, useDeleteCategory } from "@/hooks/useCategories";
import { logoutRequest } from "@/lib/client/authClient";
import { AddToggleButton } from "@/components/ui/AddToggleButton";

const ACCOUNT_TYPES = [
  { value: "cash", label: "Efectivo" },
  { value: "card", label: "Tarjeta" },
  { value: "bank", label: "Banco" },
];

export default function SettingsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: accounts, isLoading: loadingAccounts } = useAccounts();
  const { data: categories, isLoading: loadingCategories } = useCategories();
  const createAccount = useCreateAccount();
  const deleteAccount = useDeleteAccount();
  const createCategory = useCreateCategory();
  const deleteCategory = useDeleteCategory();

  const [categoryType, setCategoryType] = useState<"income" | "expense">("expense");
  const [showAccountForm, setShowAccountForm] = useState(false);
  const [showCategoryForm, setShowCategoryForm] = useState(false);

  async function handleCreateAccount(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    await createAccount.mutateAsync({
      name: String(form.get("name")),
      type: String(form.get("type")) as "cash" | "card" | "bank",
      initialBalance: Number(form.get("initialBalance") ?? 0),
    });
    (event.target as HTMLFormElement).reset();
    setShowAccountForm(false);
  }

  async function handleCreateCategory(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    await createCategory.mutateAsync({
      name: String(form.get("name")),
      type: categoryType,
    });
    (event.target as HTMLFormElement).reset();
    setShowCategoryForm(false);
  }

  async function handleLogout() {
    await logoutRequest();
    queryClient.removeQueries({ queryKey: ["session"] });
    router.push("/login");
    router.refresh();
  }

  return (
    <>
      <TopBar title="Ajustes" subtitle="Cuentas, categorías y tu perfil" />

      <section className="space-y-4 px-5 pt-5">
        <Card>
          <CardHeader>
            <CardTitle>Cuentas</CardTitle>
            <AddToggleButton open={showAccountForm} onClick={() => setShowAccountForm((v) => !v)} label="Agregar cuenta" />
          </CardHeader>
          {showAccountForm && (
            <form className="space-y-3" onSubmit={handleCreateAccount}>
              <Input label="Nombre" name="name" placeholder="Ej. BBVA" required />
              <Select label="Tipo" name="type" defaultValue="cash">
                {ACCOUNT_TYPES.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
              <Input label="Saldo inicial" name="initialBalance" type="number" step="0.01" defaultValue={0} />
              <Button type="submit" className="w-full" size="sm" disabled={createAccount.isPending}>
                Agregar cuenta
              </Button>
            </form>
          )}

          <div className="mt-4 space-y-2">
            {loadingAccounts && <p className="text-sm text-muted-foreground">Cargando…</p>}
            {accounts?.map((account) => (
              <div key={account.id} className="flex items-center justify-between rounded-xl bg-surface-muted px-3 py-2">
                <div>
                  <p className="text-sm font-medium">{account.name}</p>
                  <p className="text-xs text-muted-foreground">{formatCurrency(account.initialBalance)}</p>
                </div>
                <button type="button" onClick={() => deleteAccount.mutate(account.id)} className="text-xs text-muted-foreground underline">
                  Eliminar
                </button>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Categorías</CardTitle>
            <AddToggleButton open={showCategoryForm} onClick={() => setShowCategoryForm((v) => !v)} label="Agregar categoría" />
          </CardHeader>

          {showCategoryForm && (
            <>
              <div className="mb-3 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setCategoryType("expense")}
                  className={
                    categoryType === "expense"
                      ? "h-10 rounded-xl bg-expense/15 text-sm font-medium text-expense"
                      : "h-10 rounded-xl bg-surface-muted text-sm font-medium text-muted-foreground"
                  }
                >
                  Gasto
                </button>
                <button
                  type="button"
                  onClick={() => setCategoryType("income")}
                  className={
                    categoryType === "income"
                      ? "h-10 rounded-xl bg-income/15 text-sm font-medium text-income"
                      : "h-10 rounded-xl bg-surface-muted text-sm font-medium text-muted-foreground"
                  }
                >
                  Ingreso
                </button>
              </div>

              <form className="space-y-3" onSubmit={handleCreateCategory}>
                <Input label="Nombre" name="name" placeholder="Ej. Mascotas" required />
                <Button type="submit" className="w-full" size="sm" disabled={createCategory.isPending}>
                  Agregar categoría
                </Button>
              </form>
            </>
          )}

          <div className="mt-4 space-y-2">
            {loadingCategories && <p className="text-sm text-muted-foreground">Cargando…</p>}
            {categories
              ?.filter((c) => c.type === categoryType)
              .map((category) => (
                <div key={category.id} className="flex items-center justify-between rounded-xl bg-surface-muted px-3 py-2">
                  <p className="text-sm font-medium">
                    {category.icon ? `${category.icon} ` : ""}
                    {category.name}
                  </p>
                  <button type="button" onClick={() => deleteCategory.mutate(category.id)} className="text-xs text-muted-foreground underline">
                    Eliminar
                  </button>
                </div>
              ))}
          </div>
        </Card>

        <Button variant="secondary" className="w-full" onClick={handleLogout}>
          Cerrar sesión
        </Button>
      </section>
    </>
  );
}
