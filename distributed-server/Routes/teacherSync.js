import { Router } from "express";
import {
  teacherInsert,
  teacherRead,
  teacherUpdate,
  teacherDelete
} from "../Controllers/sync/TeacherController";

const router = Router();
router.post("/", teacherInsert);
router.get("/:page?/:unit?", teacherRead);
router.put("/", teacherUpdate);
router.delete("/", teacherDelete);

export default router;
