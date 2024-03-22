import express from "express";
import { isAuthenticated } from "../middlewares/auth";
import { decryptDataController, encryptDataController } from "../utils/crypto";

const router = express.Router();

// Protected routes
router.use(isAuthenticated); 
router.post("/encrypt", encryptDataController);
router.post("/decrypt", decryptDataController);

export default router;
