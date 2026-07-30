import { withAuth } from "@/server/middlewares/withAuth";
import { upcomingPaymentController } from "@/server/controllers/upcomingPayment.controller";

export const GET = withAuth((req, ctx) => upcomingPaymentController.list(req, ctx));
export const POST = withAuth((req, ctx) => upcomingPaymentController.create(req, ctx));
