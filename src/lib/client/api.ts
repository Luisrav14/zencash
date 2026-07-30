export type Category = {
  id: string;
  name: string;
  icon?: string | null;
  color?: string | null;
  type: "income" | "expense";
  parentId?: string | null;
  children?: Category[];
};

export type Account = {
  id: string;
  name: string;
  type: "cash" | "card" | "bank";
  initialBalance: number;
  color?: string | null;
};

export type Transaction = {
  id: string;
  amount: number;
  type: "income" | "expense";
  date: string;
  note?: string | null;
  tags?: string | null;
  categoryId: string;
  accountId: string;
  category?: Category;
  account?: Account;
};

export type Budget = {
  id: string;
  categoryId: string;
  amount: number;
  period: string;
  category?: Category;
};

export type UpcomingPayment = {
  id: string;
  amount: number;
  dueDate: string;
  note?: string | null;
  categoryId?: string | null;
  paid: boolean;
};

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    ...init,
  });
  const body = await res.json().catch(() => null);
  if (!res.ok) {
    const message = typeof body?.error === "string" ? body.error : "Ocurrió un error, intenta de nuevo";
    throw new Error(message);
  }
  return body as T;
}

export const categoriesApi = {
  list: () => request<{ categories: Category[] }>("/api/categories").then((r) => r.categories),
  create: (data: Partial<Category>) =>
    request<{ category: Category }>("/api/categories", {
      method: "POST",
      body: JSON.stringify(data),
    }).then((r) => r.category),
  remove: (id: string) => request<{ ok: true }>(`/api/categories/${id}`, { method: "DELETE" }),
};

export const accountsApi = {
  list: () => request<{ accounts: Account[] }>("/api/accounts").then((r) => r.accounts),
  create: (data: Partial<Account>) =>
    request<{ account: Account }>("/api/accounts", {
      method: "POST",
      body: JSON.stringify(data),
    }).then((r) => r.account),
  remove: (id: string) => request<{ ok: true }>(`/api/accounts/${id}`, { method: "DELETE" }),
};

export const transactionsApi = {
  list: () => request<{ transactions: Transaction[] }>("/api/transactions").then((r) => r.transactions),
  create: (data: Partial<Transaction>) =>
    request<{ transaction: Transaction }>("/api/transactions", {
      method: "POST",
      body: JSON.stringify(data),
    }).then((r) => r.transaction),
  remove: (id: string) => request<{ ok: true }>(`/api/transactions/${id}`, { method: "DELETE" }),
};

export const budgetsApi = {
  list: () => request<{ budgets: Budget[] }>("/api/budgets").then((r) => r.budgets),
  create: (data: Partial<Budget>) =>
    request<{ budget: Budget }>("/api/budgets", {
      method: "POST",
      body: JSON.stringify(data),
    }).then((r) => r.budget),
  remove: (id: string) => request<{ ok: true }>(`/api/budgets/${id}`, { method: "DELETE" }),
};

export const upcomingPaymentsApi = {
  list: () => request<{ payments: UpcomingPayment[] }>("/api/upcoming-payments").then((r) => r.payments),
  create: (data: Partial<UpcomingPayment>) =>
    request<{ payment: UpcomingPayment }>("/api/upcoming-payments", {
      method: "POST",
      body: JSON.stringify(data),
    }).then((r) => r.payment),
  update: (id: string, data: Partial<UpcomingPayment>) =>
    request<{ payment: UpcomingPayment }>(`/api/upcoming-payments/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }).then((r) => r.payment),
  remove: (id: string) => request<{ ok: true }>(`/api/upcoming-payments/${id}`, { method: "DELETE" }),
};
