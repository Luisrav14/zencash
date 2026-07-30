import { db, type PendingMutation } from "./db";

const ENDPOINTS: Record<PendingMutation["entity"], string> = {
  category: "/api/categories",
  account: "/api/accounts",
  transaction: "/api/transactions",
  budget: "/api/budgets",
  upcomingPayment: "/api/upcoming-payments",
};

export async function queueMutation(mutation: Omit<PendingMutation, "id" | "createdAt">) {
  await db.pendingMutations.add({ ...mutation, createdAt: new Date().toISOString() });
  if (typeof navigator !== "undefined" && navigator.onLine) {
    void flushPendingMutations();
  }
}

export async function flushPendingMutations() {
  const pending = await db.pendingMutations.orderBy("createdAt").toArray();

  for (const mutation of pending) {
    const base = ENDPOINTS[mutation.entity];
    const url = mutation.entityId ? `${base}/${mutation.entityId}` : base;
    const method = mutation.operation === "create" ? "POST" : mutation.operation === "update" ? "PUT" : "DELETE";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: mutation.operation === "delete" ? undefined : JSON.stringify(mutation.payload),
        credentials: "include",
      });
      if (res.ok && mutation.id !== undefined) {
        await db.pendingMutations.delete(mutation.id);
      }
    } catch {
      // Sin conexión todavía: se reintenta en el próximo ciclo online.
      break;
    }
  }
}

export function registerSyncListeners() {
  if (typeof window === "undefined") return;
  window.addEventListener("online", () => {
    void flushPendingMutations();
  });
}
