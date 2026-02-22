import express from "express"
import {logInAlert,verificationEmail} from "../controllers/notification.controller"

const router = express.Router()


router.post("/log-in-alert", logInAlert)
router.post("/verification-email", verificationEmail)







export default router;