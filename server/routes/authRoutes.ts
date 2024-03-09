import { Router } from "express";
import {
  activateUserController,
  loginUserController,
  registerUserController,
  logoutUserController,
  updateAccessTokenController,
  forgotPasswordController,
  resetPasswordController,
  resetPasswordValidatorController,
} from "../controllers/authController";
import { isAuthenticated } from "../middlewares/auth";

const router = Router();

router.post("/register", registerUserController);
router.post("/activate-user", activateUserController);
router.post("/login", loginUserController);
router.get("/logout", isAuthenticated, logoutUserController);
router.get("/refresh", updateAccessTokenController);
router.post("/forgot-password", forgotPasswordController);
router.post("/reset-password/:userId/:token", resetPasswordController);
router.post("/reset-password-validator/:userId/:token", resetPasswordValidatorController);

export default router;
