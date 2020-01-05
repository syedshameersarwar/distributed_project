import { Router } from "express";
import tmpController from "../Controllers/sync/TmpController";

const router = Router();
router.get("/", tmpController);
export default router;
