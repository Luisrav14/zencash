import { prisma } from "@/lib/prisma";

export const transactionRepository = {
  findAllByUser(userId: string, filters?: { accountId?: string; categoryId?: string }) {
    return prisma.transaction.findMany({
      where: {
        userId,
        accountId: filters?.accountId,
        categoryId: filters?.categoryId,
      },
      include: { category: true, account: true },
      orderBy: { date: "desc" },
    });
  },
  findById(id: string, userId: string) {
    return prisma.transaction.findFirst({ where: { id, userId } });
  },
  create(data: { amount: number; type: string; date: Date; note?: string; tags?: string; categoryId: string; accountId: string; userId: string }) {
    return prisma.transaction.create({ data });
  },
  update(
    id: string,
    userId: string,
    data: Partial<{
      amount: number;
      type: string;
      date: Date;
      note: string | null;
      tags: string | null;
      categoryId: string;
      accountId: string;
    }>,
  ) {
    return prisma.transaction.updateMany({ where: { id, userId }, data });
  },
  remove(id: string, userId: string) {
    return prisma.transaction.deleteMany({ where: { id, userId } });
  },
};
