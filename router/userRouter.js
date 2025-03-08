import { Router } from "express";
import { LoginUser,registerUser } from "../controllers/userController.js";
const router = Router();

router.post('/login',LoginUser);
router.post('/signup',registerUser);

export default router;