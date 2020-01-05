import { Router } from "express";
import syncRouter from "./sync";
import asyncRouter from "./async";
import authRouter from "./auth";

const router = Router();
router.use("/sync", syncRouter);
router.use("/async", asyncRouter);
router.use("/login", authRouter);

export default router;
