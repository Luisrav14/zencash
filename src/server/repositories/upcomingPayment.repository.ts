import { prisma } from "@/lib/prisma";

export const upcomingPaymentRepository = {
  findAllByUser(userId: string) {
    return prisma.upcomingPayment.findMany({
      where: { userId },
      orderBy: { dueDate: "asc" },
    });
  },
  findById(id: string, userId: string) {
    return prisma.upcomingPayment.findFirst({ where: { id, userId } });
  },
  create(data: { amount: number; dueDate: Date; note?: string; categoryId?: string; accountId?: string; userId: string }) {
    return prisma.upcomingPayment.create({ data });
  },
  update(
    id: string,
    userId: string,
    data: Partial<{
      amount: number;
      dueDate: Date;
      note: string | null;
      categoryId: string | null;
      accountId: string | null;
      paid: boolean;
      paidAt: Date | null;
    }>,
  ) {
    return prisma.upcomingPayment.updateMany({ where: { id, userId }, data });
  },
  remove(id: string, userId: string) {
    return prisma.upcomingPayment.deleteMany({ where: { id, userId } });
  },
  // Marca el pago como pagado y registra el gasto en la misma transacción de base de datos.
  markPaidWithExpense(id: string, userId: string, payment: { amount: number; note: string | null; categoryId: string; accountId: string }) {
    const paidAt = new Date();
    return prisma.$transaction(async (tx) => {
      await tx.upcomingPayment.updateMany({ where: { id, userId }, data: { paid: true, paidAt } });
      await tx.transaction.create({
        data: {
          amount: payment.amount,
          type: "expense",
          date: paidAt,
          note: payment.note ?? undefined,
          categoryId: payment.categoryId,
          accountId: payment.accountId,
          userId,
        },
      });
    });
  },
};
