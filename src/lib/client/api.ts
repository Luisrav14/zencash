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
  accountId?: string | null;
  paid: boolean;
  paidAt?: string | null;
};

import { db, type PendingMutation } from "./db";
import { queueMutation } from "./syncManager";

class NetworkError extends Error {}

const localId = () => `offline-${crypto.randomUUID()}`;

async function cachedList<T extends { id: string }>(
  userId: string,
  online: () => Promise<T[]>,
  table: { where: (key: string) => { equals: (value: string) => { toArray: () => Promise<T[]> } } },
) {
  try {
    const result = await online();
    await db.table(tableName(table)).bulkPut(result.map((item) => ({ ...item, userId })) as never[]);
    return result;
  } catch (error) {
    if (!(error instanceof NetworkError)) throw error;
    return table.where("userId").equals(userId).toArray();
  }
}

function tableName(table: object) {
  if (table === db.categories) return "categories";
  if (table === db.accounts) return "accounts";
  if (table === db.transactions) return "transactions";
  if (table === db.budgets) return "budgets";
  return "upcomingPayments";
}

async function offlineMutation<T extends { id: string }>(
  entity: PendingMutation["entity"],
  operation: "create" | "update" | "delete",
  userId: string,
  payload: Partial<T>,
  table: { put: (...args: never[]) => Promise<unknown>; delete: (id: string) => Promise<unknown> },
  request: () => Promise<T | { ok: true }>,
): Promise<T | { ok: true }> {
  try {
    const result = await request();
    if (operation !== "delete") await table.put({ ...result, userId } as never);
    return result;
  } catch (error) {
    if (!(error instanceof NetworkError)) throw error;
    const id = (payload.id as string | undefined) ?? localId();
    if (operation === "delete") {
      await table.delete(id);
    } else {
      await table.put({ ...payload, id, userId } as never);
    }
    await queueMutation({
      entity,
      operation,
      payload: { ...payload, id: operation === "create" ? undefined : id },
      entityId: operation === "create" ? undefined : id,
      localId: operation === "create" ? id : undefined,
    });
    return operation === "delete" ? { ok: true } : ({ ...payload, id } as T);
  }
}

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(url, {
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      ...init,
    });
  } catch (error) {
    throw new NetworkError(error instanceof Error ? error.message : "Sin conexión");
  }
  const body = await res.json().catch(() => null);
  if (!res.ok) {
    const message = typeof body?.error === "string" ? body.error : "Ocurrió un error, intenta de nuevo";
    throw new Error(message);
  }
  return body as T;
}

export const categoriesApi = {
  list: (userId: string) => cachedList(userId, () => request<{ categories: Category[] }>("/api/categories").then((r) => r.categories), db.categories),
  create: (userId: string, data: Partial<Category>) =>
    offlineMutation("category", "create", userId, data, db.categories, () =>
      request<{ category: Category }>("/api/categories", { method: "POST", body: JSON.stringify(data) }).then((r) => r.category),
    ) as Promise<Category>,
  remove: (userId: string, id: string) =>
    offlineMutation("category", "delete", userId, { id }, db.categories, () => request<{ ok: true }>(`/api/categories/${id}`, { method: "DELETE" })),
};

export const accountsApi = {
  list: (userId: string) => cachedList(userId, () => request<{ accounts: Account[] }>("/api/accounts").then((r) => r.accounts), db.accounts),
  create: (userId: string, data: Partial<Account>) =>
    offlineMutation("account", "create", userId, data, db.accounts, () =>
      request<{ account: Account }>("/api/accounts", { method: "POST", body: JSON.stringify(data) }).then((r) => r.account),
    ) as Promise<Account>,
  remove: (userId: string, id: string) =>
    offlineMutation("account", "delete", userId, { id }, db.accounts, () => request<{ ok: true }>(`/api/accounts/${id}`, { method: "DELETE" })),
};

export const transactionsApi = {
  list: (userId: string) =>
    cachedList(userId, () => request<{ transactions: Transaction[] }>("/api/transactions").then((r) => r.transactions), db.transactions),
  create: (userId: string, data: Partial<Transaction>) =>
    offlineMutation("transaction", "create", userId, data, db.transactions, () =>
      request<{ transaction: Transaction }>("/api/transactions", { method: "POST", body: JSON.stringify(data) }).then((r) => r.transaction),
    ) as Promise<Transaction>,
  remove: (userId: string, id: string) =>
    offlineMutation("transaction", "delete", userId, { id }, db.transactions, () =>
      request<{ ok: true }>(`/api/transactions/${id}`, { method: "DELETE" }),
    ),
};

export const budgetsApi = {
  list: (userId: string) => cachedList(userId, () => request<{ budgets: Budget[] }>("/api/budgets").then((r) => r.budgets), db.budgets),
  create: (userId: string, data: Partial<Budget>) =>
    offlineMutation("budget", "create", userId, data, db.budgets, () =>
      request<{ budget: Budget }>("/api/budgets", { method: "POST", body: JSON.stringify(data) }).then((r) => r.budget),
    ) as Promise<Budget>,
  remove: (userId: string, id: string) =>
    offlineMutation("budget", "delete", userId, { id }, db.budgets, () => request<{ ok: true }>(`/api/budgets/${id}`, { method: "DELETE" })),
};

export const upcomingPaymentsApi = {
  list: (userId: string) =>
    cachedList(userId, () => request<{ payments: UpcomingPayment[] }>("/api/upcoming-payments").then((r) => r.payments), db.upcomingPayments),
  create: (userId: string, data: Partial<UpcomingPayment>) =>
    offlineMutation("upcomingPayment", "create", userId, data, db.upcomingPayments, () =>
      request<{ payment: UpcomingPayment }>("/api/upcoming-payments", { method: "POST", body: JSON.stringify(data) }).then((r) => r.payment),
    ) as Promise<UpcomingPayment>,
  update: (userId: string, id: string, data: Partial<UpcomingPayment>) =>
    offlineMutation("upcomingPayment", "update", userId, { ...data, id }, db.upcomingPayments, () =>
      request<{ payment: UpcomingPayment }>(`/api/upcoming-payments/${id}`, { method: "PUT", body: JSON.stringify(data) }).then((r) => r.payment),
    ) as Promise<UpcomingPayment>,
  remove: (userId: string, id: string) =>
    offlineMutation("upcomingPayment", "delete", userId, { id }, db.upcomingPayments, () =>
      request<{ ok: true }>(`/api/upcoming-payments/${id}`, { method: "DELETE" }),
    ),
};
