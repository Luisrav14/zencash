import { withAuth } from "@/server/middlewares/withAuth";
import { authController as AuthController } from "@/server/controllers/auth.controller";

export const GET = withAuth((req) => AuthController.me(req));
