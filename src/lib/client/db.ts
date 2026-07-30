import Dexie, { type EntityTable } from "dexie";

export type LocalCategory = {
  id: string;
  name: string;
  icon?: string;
  color?: string;
  type: "income" | "expense";
  parentId?: string | null;
  userId: string;
};

export type LocalAccount = {
  id: string;
  name: string;
  type: "cash" | "card" | "bank";
  initialBalance: number;
  color?: string;
  userId: string;
};

export type LocalTransaction = {
  id: string;
  amount: number;
  type: "income" | "expense";
  date: string;
  note?: string;
  tags?: string;
  categoryId: string;
  accountId: string;
  userId: string;
  createdAt: string;
};

export type LocalBudget = {
  id: string;
  categoryId: string;
  amount: number;
  period: string;
  userId: string;
};

export type LocalUpcomingPayment = {
  id: string;
  amount: number;
  dueDate: string;
  note?: string;
  categoryId?: string;
  paid: boolean;
  userId: string;
};

export type PendingMutation = {
  id?: number;
  entity: "category" | "account" | "transaction" | "budget" | "upcomingPayment";
  operation: "create" | "update" | "delete";
  payload: unknown;
  entityId?: string;
  createdAt: string;
};

class ZenCashDB extends Dexie {
  categories!: EntityTable<LocalCategory, "id">;
  accounts!: EntityTable<LocalAccount, "id">;
  transactions!: EntityTable<LocalTransaction, "id">;
  budgets!: EntityTable<LocalBudget, "id">;
  upcomingPayments!: EntityTable<LocalUpcomingPayment, "id">;
  pendingMutations!: EntityTable<PendingMutation, "id">;

  constructor() {
    super("zencash");
    this.version(1).stores({
      categories: "id, userId, parentId, type",
      accounts: "id, userId, type",
      transactions: "id, userId, categoryId, accountId, date",
      budgets: "id, userId, categoryId",
      upcomingPayments: "id, userId, dueDate, paid",
      pendingMutations: "++id, entity, createdAt",
    });
  }
}

export const db = new ZenCashDB();
