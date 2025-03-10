import { Router } from "express";
import { LoginUser,registerUser,authenticate } from "../controllers/userController.js";
const router = Router();

router.get('/api/protected',authenticate);
router.post('/login',LoginUser);
router.post('/signup',registerUser);

export default router;