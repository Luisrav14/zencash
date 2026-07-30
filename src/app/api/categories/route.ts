import { withAuth } from "@/server/middlewares/withAuth";
import { categoryController } from "@/server/controllers/category.controller";

export const GET = withAuth((req, ctx) => categoryController.list(req, ctx));
export const POST = withAuth((req, ctx) => categoryController.create(req, ctx));
