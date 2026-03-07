import { Router } from "express";
import { sendMessage, getChatHistory } from "../controllers/message.controller";

const router = Router();

router.post("/", sendMessage);
router.get("/:roomId", getChatHistory);

export default router;
