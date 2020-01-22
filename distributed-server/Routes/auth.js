import { Router } from "express";
import authController from "../Controllers/AuthController";

const router = Router();
router.post("/", authController);

export default router;
