import express from "express"
import {logInAlert,verificationEmail, getNotifications, markAsRead} from "../controllers/notification.controller"
import { verifyToken } from "../middlewares/middleware"

const router = express.Router()

router.post("/log-in-alert", logInAlert)

router.post("/verification-email", verificationEmail)

router.get("/notifications", verifyToken, getNotifications)

router.patch("/notifications/:id/read", verifyToken, markAsRead)


export default router;