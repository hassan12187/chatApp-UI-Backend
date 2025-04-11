import {Router} from 'express';
import { verifyEmailAndRegister, verifyPassAndSendEmail } from '../controllers/emailController.js';
const route = Router();
route.post('/verifyPassAndSendEmail/:id',verifyPassAndSendEmail);
route.get('/verifyEmail',(req,res)=>{
    try {
        console.log(req.query);
        return res.end();
    } catch (error) {
        console.log('error veryfing email');
    }
});
route.post('/verifyEmailForRegistration',verifyEmailAndRegister);
export default route;