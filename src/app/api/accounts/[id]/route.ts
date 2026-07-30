import { withAuth } from "@/server/middlewares/withAuth";
import { accountController } from "@/server/controllers/account.controller";

export const PUT = withAuth<{ id: string }>(async (req, ctx, { params }) => {
  const { id } = await params;
  return accountController.update(req, ctx, id);
});

export const DELETE = withAuth<{ id: string }>(async (req, ctx, { params }) => {
  const { id } = await params;
  return accountController.remove(req, ctx, id);
});
