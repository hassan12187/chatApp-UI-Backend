import User from "../models/userModel.js";

export const LoginUser=async(req,res)=>{
    try {
        const {email,password}=req.body;
        const user = await User.find({email,password});
        const result = await User.on("comparePass");
        console.log(result);
    } catch (error) {
        console.log(`Error in User Controller ${error}`);
    }
}
export const registerUser=async(req,res)=>{
    try {
        const {username,email,password}=req.body;
        const result = await User.create({username,email,password});
        if(!result) return res.status(401).json({message:"Error in Registration."});
        return res.status(200).json({message:"User Registered"});
    } catch (error) {
        console.log(`Error in User Controller ${error}`);
    }
}