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
  if (typeof navigator !== "undefined" && !navigator.onLine) return;
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
      if (!res.ok) {
        // Los errores de validación/autorización no se resolverán reintentando.
        if (res.status >= 400 && res.status < 500 && mutation.id !== undefined) {
          await db.pendingMutations.delete(mutation.id);
        }
        continue;
      }

      if (mutation.operation === "create" && mutation.localId) {
        const body = await res.json().catch(() => null);
        const created = body && Object.values(body)[0] as { id?: string } | undefined;
        if (created?.id && created.id !== mutation.localId) {
          await replaceLocalId(mutation.entity, mutation.localId, created.id, created);
          await rewritePendingReferences(mutation.localId, created.id);
        }
      }

      if (mutation.id !== undefined) {
        await db.pendingMutations.delete(mutation.id);
      }
    } catch {
      // Sin conexión todavía: se reintenta en el próximo ciclo online.
      break;
    }
  }
}

async function replaceLocalId(entity: PendingMutation["entity"], oldId: string, newId: string, value: object) {
  const table = db[`${entity === "upcomingPayment" ? "upcomingPayments" : `${entity}s`}` as "categories" | "accounts" | "transactions" | "budgets" | "upcomingPayments"];
  await table.delete(oldId);
  await table.put({ ...value, id: newId } as never);
}

async function rewritePendingReferences(oldId: string, newId: string) {
  const pending = await db.pendingMutations.toArray();
  for (const mutation of pending) {
    const payload = JSON.stringify(mutation.payload).replaceAll(oldId, newId);
    await db.pendingMutations.put({ ...mutation, payload: JSON.parse(payload) });
  }
}

export function registerSyncListeners() {
  if (typeof window === "undefined") return;
  window.addEventListener("online", async () => {
    await flushPendingMutations();
    window.dispatchEvent(new Event("zencash:sync"));
  });
}
