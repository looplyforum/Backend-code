import { Router } from "express";
import { createRoom, getUserChatRooms, joinRoom, addMemberToRoomByPost } from "../controllers/chat.controller";

const router = Router();



router.post("/", createRoom);
router.get("/", getUserChatRooms);
router.post("/join/:roomId", joinRoom);
router.post("/add-member-internal", addMemberToRoomByPost);

export default router;
