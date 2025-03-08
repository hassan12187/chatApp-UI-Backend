import User from "../models/userModel.js";

export const LoginUser=async(req,res)=>{
    try {
        const {email,password}=req.body;
        const user = await User.findOne({email});
        if(!user) return res.status(404).json({message:"User not Found."});
        const comparePassAndGenToken = await user.comparePass(password);
        if(!comparePassAndGenToken) {return res.status(400).json({message:"Wrong Credentials"})};
        return res.status(200).cookie("token",comparePassAndGenToken).json({message:"User Logged in."});
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