import { Router, type IRouter } from "express";
import healthRouter from "./health";
import catalogRouter from "./catalog";
import cartRouter from "./cart";
import ordersRouter from "./orders";
import contactRouter from "./contact";
import adminRouter from "./admin";
import appearancesRouter from "./appearances";

const router: IRouter = Router();

router.use(healthRouter);
router.use(catalogRouter);
router.use(cartRouter);
router.use(ordersRouter);
router.use(contactRouter);
router.use(adminRouter);
router.use(appearancesRouter);

export default router;
