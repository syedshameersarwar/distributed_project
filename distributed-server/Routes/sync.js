import { Router } from "express";
import studentController from "./studentSync";
import teacherController from "./teacherSync";
import inviteController from "./inviteSync";
import logsController from "./logsSync";
import tmpController from "./tmpSync";

const router = Router();
router.use("/student", studentController);
router.use("/teacher", teacherController);
router.use("/invite", inviteController);
router.use("/logs", logsController);
router.use("/tmp", tmpController);

export default router;
