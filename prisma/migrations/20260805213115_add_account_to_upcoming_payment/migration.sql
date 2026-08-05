-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_UpcomingPayment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "amount" REAL NOT NULL,
    "dueDate" DATETIME NOT NULL,
    "note" TEXT,
    "categoryId" TEXT,
    "accountId" TEXT,
    "paid" BOOLEAN NOT NULL DEFAULT false,
    "paidAt" DATETIME,
    "userId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "UpcomingPayment_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "UpcomingPayment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_UpcomingPayment" ("amount", "categoryId", "createdAt", "dueDate", "id", "note", "paid", "paidAt", "updatedAt", "userId") SELECT "amount", "categoryId", "createdAt", "dueDate", "id", "note", "paid", "paidAt", "updatedAt", "userId" FROM "UpcomingPayment";
DROP TABLE "UpcomingPayment";
ALTER TABLE "new_UpcomingPayment" RENAME TO "UpcomingPayment";
CREATE INDEX "UpcomingPayment_userId_idx" ON "UpcomingPayment"("userId");
CREATE INDEX "UpcomingPayment_dueDate_idx" ON "UpcomingPayment"("dueDate");
CREATE INDEX "UpcomingPayment_accountId_idx" ON "UpcomingPayment"("accountId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
