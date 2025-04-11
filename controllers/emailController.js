import User from "../models/userModel.js";
import  {compare,genSalt,hash} from 'bcrypt';
import sendEmail from "../services/sendEmail.js";

export const verifyPassAndSendEmail=async(req,res)=>{
    try {
        const {currentPass,newPass,confirmPass}=req.body;
        const email = req.headers.email;
        const id = req.params.id;
        if(newPass !== confirmPass){return res.status(400).json({message:"new password and confirm password donot matched."})};
        const user = await User.findOne({_id:id});
        const comparison = await compare(currentPass,user.password);
        if(!comparison){return res.status(400).json({message:"current password is wrong."})};
        const salt = await genSalt(10);
        const hs = await hash("superman@121",salt);
        const link = `http://localhost:5173/email/verifyEmail?id=${id}&data=${newPass}&url=/user/updatePassword&${hs}`;
        await sendEmail(email,"Password change Request",link);
        return res.status(200).json({message:"Verification Link has been sent to your email."});
    } catch (error) {
        console.log(`Error verifying pass and sending email. ${error}`);
        return res.status(200).json({error:error});
    }
};
export const verifyEmailAndRegister=async(req,res)=>{
    try {
        const {email}=req.body;
        const salt = await genSalt(10);
        const hash = await hash("superman@121",salt);
        const link = `http://localhost:5173/email/verifyEmail?data=${req.body}&url=/user/signup&${hash}`;
        await sendEmail(email,"Verify Email",link);
        return res.end();
    } catch (error) {
        console.log('error verifying email and registring.');
        return res.status(401).json({error});
    }
}