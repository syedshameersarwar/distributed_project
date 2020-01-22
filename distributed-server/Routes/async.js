import { Router } from "express";
import transactionContoller from "../Controllers/async/TransactionController";
import studentController from "../Controllers/async/StudentController";
import teacherController from "../Controllers/async/TeacherController";
import inviteController from "../Controllers/async/InviteController";

const router = Router();
router.put("/", transactionContoller);
router.post("/student", studentController);
router.post("/teacher", teacherController);
router.post("/invite", inviteController);

export default router;
