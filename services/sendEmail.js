import { createTransport } from "nodemailer";

const sendEmail=(to,subject,text)=>{
    try {
        const transporter = createTransport({
            service:'gmail',
            auth:{
                user:'hassanmuhammad12187@gmail.com',
                pass:'fwhv fhrs plkv feax'
            }
        })
        transporter.sendMail({
            from:"no-reply@gmail.com",
            to:to,
            subject:subject,
            text:text
        },(error,info)=>{
            if(error){
                console.log('error',error);
                return res.status(401).json({message:"Error sending email verification."});
            }else{
                console.log(info);
                return res.status(250).json({message:"Verification Link has been sent to your email."});
            }
        });
    } catch (error) {
        console.log('Error sending Email',error);
    }
}
export default sendEmail;