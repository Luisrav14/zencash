import { withAuth } from "@/server/middlewares/withAuth";
import { accountController } from "@/server/controllers/account.controller";

export const GET = withAuth((req, ctx) => accountController.list(req, ctx));
export const POST = withAuth((req, ctx) => accountController.create(req, ctx));
