import { Router } from "express";
import { LoginUser,registerUser } from "../controllers/userController.js";
const router = Router();

router.post('/login',LoginUser);
router.post('/login',registerUser);

export default router;