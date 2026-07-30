import { withAuth } from "@/server/middlewares/withAuth";
import { budgetController } from "@/server/controllers/budget.controller";

export const GET = withAuth((req, ctx) => budgetController.list(req, ctx));
export const POST = withAuth((req, ctx) => budgetController.create(req, ctx));
