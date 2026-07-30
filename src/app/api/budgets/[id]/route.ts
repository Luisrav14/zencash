import { withAuth } from "@/server/middlewares/withAuth";
import { budgetController } from "@/server/controllers/budget.controller";

export const PUT = withAuth<{ id: string }>(async (req, ctx, { params }) => {
  const { id } = await params;
  return budgetController.update(req, ctx, id);
});

export const DELETE = withAuth<{ id: string }>(async (req, ctx, { params }) => {
  const { id } = await params;
  return budgetController.remove(req, ctx, id);
});
