import { Router } from "express";
import { activateUserController, registerUserController } from "../controllers/authController";

const router= Router()

router.post('/signup', registerUserController )
router.post('/activate-user', activateUserController )

export default router;