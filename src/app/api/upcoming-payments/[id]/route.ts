import { withAuth } from "@/server/middlewares/withAuth";
import { upcomingPaymentController } from "@/server/controllers/upcomingPayment.controller";

export const PUT = withAuth<{ id: string }>(async (req, ctx, { params }) => {
  const { id } = await params;
  return upcomingPaymentController.update(req, ctx, id);
});

export const DELETE = withAuth<{ id: string }>(async (req, ctx, { params }) => {
  const { id } = await params;
  return upcomingPaymentController.remove(req, ctx, id);
});
