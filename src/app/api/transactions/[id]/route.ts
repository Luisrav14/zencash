import { withAuth } from "@/server/middlewares/withAuth";
import { transactionController } from "@/server/controllers/transaction.controller";

export const PUT = withAuth<{ id: string }>(async (req, ctx, { params }) => {
  const { id } = await params;
  return transactionController.update(req, ctx, id);
});

export const DELETE = withAuth<{ id: string }>(async (req, ctx, { params }) => {
  const { id } = await params;
  return transactionController.remove(req, ctx, id);
});
