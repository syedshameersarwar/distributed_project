import { Router } from "express";
import {
  studentInsert,
  studentRead,
  studentUpdate,
  studentDelete
} from "../Controllers/sync/StudentController";

const router = Router();
router.post("/", studentInsert);
router.get("/:page?/:unit?", studentRead);
router.put("/", studentUpdate);
router.delete("/", studentDelete);

export default router;
