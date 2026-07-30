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
  create(data: { amount: number; dueDate: Date; note?: string; categoryId?: string; userId: string }) {
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
      paid: boolean;
      paidAt: Date | null;
    }>,
  ) {
    return prisma.upcomingPayment.updateMany({ where: { id, userId }, data });
  },
  remove(id: string, userId: string) {
    return prisma.upcomingPayment.deleteMany({ where: { id, userId } });
  },
};
