import { withAuth } from "@/server/middlewares/withAuth";
import { categoryController } from "@/server/controllers/category.controller";

export const PUT = withAuth<{ id: string }>(async (req, ctx, { params }) => {
  const { id } = await params;
  return categoryController.update(req, ctx, id);
});

export const DELETE = withAuth<{ id: string }>(async (req, ctx, { params }) => {
  const { id } = await params;
  return categoryController.remove(req, ctx, id);
});
