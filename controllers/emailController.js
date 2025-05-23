import User from "../models/userModel.js";
import  {compare,genSalt,hash} from 'bcrypt';
import sendEmail from "../services/sendEmail.js";
import jwt from 'jsonwebtoken';

export const verifyPassAndSendEmail=async(req,res)=>{
    try {
        const {currentPass,newPass,confirmPass,id}=req.body;
        const email = req.headers.email;
        if(newPass !== confirmPass){return res.status(400).json({message:"new password and confirm password donot matched."})};
        const user = await User.findOne({_id:id});
        const comparison = await compare(currentPass,user.password);
        if(!comparison){return res.status(400).json({message:"current password is wrong."})};
        const token = jwt.sign({
            id:id,newpass:newPass
        },process.env.VERIFY_SECRET_KEY,{expiresIn:'1hr'});
        const link = `<a href='http://localhost:5173/email/verifyEmail?token=${token}&url=/user/password'>Click Here to Verify</a>`;
        sendEmail(email,"Password change Request",link);
        return res.status(200).json({message:"Verification Link has been sent to your email."});
    } catch (error) {
        console.log(`Error verifying pass and sending email. ${error}`);
        return res.status(200).json({error:error});
    }
};
export const verifyEmailAndRegister=async(req,res)=>{
    try {
        const email = req.headers.email;
        const token = jwt.sign(req.body,process.env.VERIFY_SECRET_KEY,{
            expiresIn:'1h'
        });
        
        const link = `<a href='http://localhost:5173/email/verifyEmail?token=${token}&url=/user/signup'>click Here to Verify</a>`;
        sendEmail(email,"Verify Email",link);
        return res.status(200).json({message:"Verification link has been send to your email."});
    } catch (error) {
        console.log('Error sending email.',error);
        return res.status(400).json({message:"Error Sending Email"});
    }
}