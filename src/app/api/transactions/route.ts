import { withAuth } from "@/server/middlewares/withAuth";
import { transactionController } from "@/server/controllers/transaction.controller";

export const GET = withAuth((req, ctx) => transactionController.list(req, ctx));
export const POST = withAuth((req, ctx) => transactionController.create(req, ctx));
