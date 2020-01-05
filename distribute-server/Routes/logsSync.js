import { Router } from "express";
import {
  getLogs,
  deleteLogs,
  updateLogs
} from "../Controllers/sync/LogsController";

const router = Router();

router.get("/:page?/:unit?", getLogs);
router.put("/", updateLogs);
router.delete("/", deleteLogs);

export default router;
