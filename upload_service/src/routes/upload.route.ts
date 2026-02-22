import express from "express"
import {DeleteImageToCloudinary,UploadImageToCloudinary} from "../controllers/upload.controller"
import { upload } from "../libs/multer";




const router = express.Router()


router.post("/upload", upload.single("file"), UploadImageToCloudinary)
router.post("/delete", DeleteImageToCloudinary)







export default router;