import { upcomingPaymentRepository } from "@/server/repositories/upcomingPayment.repository";

export const upcomingPaymentService = {
  list: (userId: string) => upcomingPaymentRepository.findAllByUser(userId),

  create(userId: string, data: { amount: number; dueDate: Date; note?: string; categoryId?: string; accountId?: string }) {
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
      accountId: string | null;
      paid: boolean;
      paidAt: Date | null;
    }>,
  ) {
    const payment = await upcomingPaymentRepository.findById(id, userId);
    if (!payment) throw new Error("Pago próximo no encontrado");

    // Marcar como pagado descuenta el monto del balance creando el gasto correspondiente.
    if (data.paid === true && !payment.paid) {
      return upcomingPaymentService.markAsPaid(id, userId);
    }

    await upcomingPaymentRepository.update(id, userId, data);
    return upcomingPaymentRepository.findById(id, userId);
  },

  async markAsPaid(id: string, userId: string) {
    const payment = await upcomingPaymentRepository.findById(id, userId);
    if (!payment) throw new Error("Pago próximo no encontrado");
    if (payment.paid) return payment;
    if (!payment.categoryId || !payment.accountId) {
      throw new Error("Asigna una cuenta y una categoría a este pago antes de marcarlo como pagado");
    }
    await upcomingPaymentRepository.markPaidWithExpense(id, userId, {
      amount: payment.amount,
      note: payment.note,
      categoryId: payment.categoryId,
      accountId: payment.accountId,
    });
    return upcomingPaymentRepository.findById(id, userId);
  },

  async remove(id: string, userId: string) {
    const payment = await upcomingPaymentRepository.findById(id, userId);
    if (!payment) throw new Error("Pago próximo no encontrado");
    await upcomingPaymentRepository.remove(id, userId);
  },
};
