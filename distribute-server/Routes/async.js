const router = require("express").Router();
import transactionContoller from "../Controllers/async/TransactionController";
import studentController from "../Controllers/async/StudentController";
import teacherController from "../Controllers/async/TeacherController";

router.put("/", transactionContoller);
router.post("/student", studentController);
router.post("/teacher", teacherController);

export default router;
