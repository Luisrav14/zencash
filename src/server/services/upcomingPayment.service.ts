import { upcomingPaymentRepository } from "@/server/repositories/upcomingPayment.repository";

export const upcomingPaymentService = {
  list: (userId: string) => upcomingPaymentRepository.findAllByUser(userId),

  create(userId: string, data: { amount: number; dueDate: Date; note?: string; categoryId?: string }) {
    return upcomingPaymentRepository.create({ ...data, userId });
  },

  async update(
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
    const payment = await upcomingPaymentRepository.findById(id, userId);
    if (!payment) throw new Error("Pago próximo no encontrado");
    await upcomingPaymentRepository.update(id, userId, data);
    return upcomingPaymentRepository.findById(id, userId);
  },

  async markAsPaid(id: string, userId: string) {
    return upcomingPaymentService.update(id, userId, { paid: true, paidAt: new Date() });
  },

  async remove(id: string, userId: string) {
    const payment = await upcomingPaymentRepository.findById(id, userId);
    if (!payment) throw new Error("Pago próximo no encontrado");
    await upcomingPaymentRepository.remove(id, userId);
  },
};
