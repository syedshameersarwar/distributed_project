import { Router } from "express";
import {
  inviteInsert,
  inviteRead,
  inviteDelete,
  getMeta
} from "../Controllers/sync/InviteController";

const router = Router();
router.post("/", inviteInsert);
router.get("/meta", getMeta);
router.get("/:page?/:unit?", inviteRead);
router.delete("/", inviteDelete);

export default router;
