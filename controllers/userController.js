import User from "../models/userModel.js";
import { validateToken } from "../services/jsonWeb.js";

export const authenticate = async(req,res)=>{
    const token = req.headers['authorization']?.split(' ')[1];
    const payload = await validateToken(token);
    if(!payload)return res.status(404).json({message:"Token not verified"});
    return res.status(200).json({message:"Token Verified",user:payload});
};
export const LoginUser=async(req,res)=>{
    try {
        const {email,password}=req.body;
        const user = await User.findOne({email});
        if(!user) return res.status(404).json({message:"User not Found."});
        const comparePassAndGenToken = await user.comparePass(password);
        if(!comparePassAndGenToken) {return res.status(400).json({message:"Wrong Credentials"})};
        return res.status(200).cookie("token",comparePassAndGenToken).json({message:"User Logged in.",token:comparePassAndGenToken});
    } catch (error) {
        return res.status(401).json({message:`Error Getting all users ${error}`});

    }
}
export const registerUser=async(req,res)=>{
    try {
        const {username,email,password}=req.body;
        let result;
        if(req.file){
            result=await User.create({username,email,password,profileImage:req.file.filename});    
        }else{
           result= await User.create({username,email,password});
        }
        if(!result) return res.status(401).json({message:"Error in Registration."});
        return res.status(200).json({message:"User Registered"});
    } catch (error) {
        return res.status(401).json({message:`Error Getting all users ${error}`});

    }
}
export const getUsers=async(req,res)=>{
    try {
        const val = req.query.q;
        const users = await User.find();
        // const users = await User.find({username:{$regex:val,$options:"i"}});
        return res.send(users);
    } catch (error) {
        return res.status(401).json({message:`Error Getting all users ${error}`});
        }
}
export const getUserbyId=async(req,res)=>{
    try {
        const id = req.params.id;
        const user = await User.findOne({_id:id});
        return res.status(200).send(user);
    } catch (error) {
        return res.status(401).json({message:`Error Getting User by ID ${error}`});
    }
}
export const addFriend=async(req,res)=>{
    try {
        const {userId} = req.body;
        const friendId = req.params.id;
        const user = await User.findOne({_id:userId});
        const friend = await User.findOne({_id:friendId});
        if(user.friends.includes(friendId)){
            return res.status(400).json({message:"Already friends"});
        }
        user.friends.push(friendId);
        friend.friends.push(userId);
        await user.save();
        await friend.save();
        return res.status(200).json({message:"friend added Successfully."});
    } catch (error) {
        return res.status(401).json({message:`Error Adding Friend ${error}`});
    }
}
export const getFriendsofUser=async(req,res)=>{
    try{
        const id = req.params.id;
        const user = await User.findById({_id:id}).populate('friends');
        console.log(user);
        return res.status(200).json({data:user});
    }catch(err){
        return res.status(401).json({message:`Error getting friends of user ${err}`});
    }
}