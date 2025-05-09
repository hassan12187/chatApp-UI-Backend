import { createTransport } from "nodemailer";

const sendEmail=(to,subject,link)=>{
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
            html:link
        },(error,info)=>{
            if(error){
                console.log('error',error);
                return res.status(401).json({message:"Error sending email verification."});
            }else{
                console.log(info);
                return res.status(200).json({message:"Verification Link has been sent to your email."});
            }
        });
        return transporter;
    } catch (error) {
        console.log('Error sending Email',error);
    }
}
export default sendEmail;