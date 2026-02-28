import express from "express";
import {
  DeleteUser,
  ForgotPassword,
  LogOutUser,
  LoginUser,
  RegisterUser,
  UpdateProfilePicture,
  UpdateUserProfile,
  LoginWithGoogle,
  VerifyUser,
  GetUser,
} from "../controllers/auth.controller";
import { upload } from "../middlewares/upload.middleware";
import { verifyToken } from "../middlewares/jwt.middleware";


const router = express.Router();

router.get("/health", (req, res) => {
  res.status(200).json({ message: "Auth service is running" });
});

router.post("/register", RegisterUser);

router.post("/login", LoginUser);

router.post("/google", LoginWithGoogle); // TODO google login

router.get("/verify-user", VerifyUser);   // TODO email verification

router.use(verifyToken);

router.post("/logout", LogOutUser);

router.post("/update-profile", UpdateUserProfile);

router.post("/update-profile-picture", upload.single("profilePicture"), UpdateProfilePicture); // Issue with image strorage

router.post("/forgot-password", ForgotPassword);

router.delete("/delete-user", DeleteUser);

router.get("/get-user", GetUser);

export default router;