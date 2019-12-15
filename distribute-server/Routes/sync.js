const router = require("express").Router();
import studentController from "../Controllers/sync/StudentController";
import teacherController from "../Controllers/sync/TeacherController";

router.post("/student", studentController);
router.post("/teacher", teacherController);

export default router;
