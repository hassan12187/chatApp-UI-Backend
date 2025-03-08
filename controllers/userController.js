import User from "../models/userModel";

export const LoginUser=async(req,res)=>{
    try {
        res.send("Im in controller");
    } catch (error) {
        console.log(`Error in User Controller ${error}`);
    }
}
export const registerUser=async(req,res)=>{
    try {
        const {username,email,password}=req.body;
        const result = await User.create({username,email,password});
        if(!result)return res.json({message:"Error registering"});
        return res.json({message:"Successfully Registered"});
    } catch (error) {
        console.log(`Error in User Controller ${error}`);
    }
}