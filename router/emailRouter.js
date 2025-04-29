import {Router} from 'express';
import { verifyEmailAndRegister, verifyPassAndSendEmail } from '../controllers/emailController.js';
const route = Router();
route.post('/password',verifyPassAndSendEmail);
route.post('/register',verifyEmailAndRegister);
export default route;