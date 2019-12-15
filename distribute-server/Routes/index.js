const router = require("express").Router();
import syncRouter from "./sync";
import asyncRouter from "./async";
import authRouter from "./auth";

router.use("/sync", syncRouter);
router.use("/async", asyncRouter);
router.use("/login", authRouter);

export default router;
