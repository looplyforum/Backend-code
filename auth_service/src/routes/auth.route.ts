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
  VerifyOTP,
  GetUser,
  GetUserById,
  GetUsersByInterests,
} from "../controllers/auth.controller";
import { upload } from "../middlewares/upload.middleware";
import { verifyToken } from "../middlewares/jwt.middleware";


const router = express.Router();

router.get("/health", (req, res) => {
  res.status(200).json({ message: "Auth service is running" });
});

router.post("/register", RegisterUser);

router.post("/login", LoginUser);
router.post("/verify-otp", VerifyOTP);

router.post("/google", LoginWithGoogle); // TODO google login

router.get("/verify-user", VerifyUser);   // TODO email verification

router.get("/users/:id", GetUserById);
router.get("/users-by-interests", GetUsersByInterests);

router.use(verifyToken);

router.post("/logout", LogOutUser);

router.post("/update-profile", UpdateUserProfile);

router.post("/update-profile-picture", upload.single("profilePicture"), UpdateProfilePicture); // Issue with image strorage

router.post("/forgot-password", ForgotPassword);

router.delete("/delete-user", DeleteUser);

router.get("/get-user", GetUser);

export default router;