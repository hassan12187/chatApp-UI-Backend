import {Router} from 'express';
import { verifyEmailAndRegister, verifyPassAndSendEmail } from '../controllers/emailController.js';
const route = Router();
route.post('/verifyPassAndSendEmail/:id',verifyPassAndSendEmail);
route.post('/verifyEmail',verifyEmailAndRegister);
export default route;