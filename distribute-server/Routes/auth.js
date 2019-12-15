const router = require("express").Router();
import authController from "../Controllers/AuthController";

router.post("/", authController);

export default router;
