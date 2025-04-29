import messageModel from "../models/messageModel.js";
import User from "../models/userModel.js";
import { validateToken } from "../services/jsonWeb.js";
import {hash,genSalt} from 'bcrypt';
import friendRequestModel from "../models/friendRequestModel.js";
import jwt, { decode } from "jsonwebtoken";

export const authenticate = async(req,res,next)=>{
    try{
        const token = req.headers['authorization']?.split(' ')[1];
        const payload = validateToken(token);
        if(!payload)return res.status(404).json({message:"Token not verified"});
        req.user=payload;
        next();
    }catch(err){
        return res.status(401).send({error:`error in authentication ${err}`});
    }
};
export const LoginUser=async(req,res)=>{
    try {
        const {email,password}=req.body;
        const user = await User.findOne({email});
        if(!user) {return res.status(400).json({message:"User not Found."})};
        const comparePassAndGenToken = await user.comparePass(password);
        if(!comparePassAndGenToken){
            console.log('password not matched');
        return res.status(400).json({message:"Wrong Credentials"});
        }
            return res.status(200).json({message:"User Logged in.",token:comparePassAndGenToken});
    } catch (error) {
        return res.status(401).json({message:`Error Logging in user ${error}`});
    }
}
export const registerUser=async(req,res)=>{
    try {
        const decoded = jwt.verify(req.headers.authorization,process.env.VERIFY_SECRET_KEY);
        const {username,email,password}=decoded;
        console.log(username,email,password);
        let result;
        if(req.file){
            result=await User.create({username,email,password,profileImage:req.file.filename});    
        }else{
           result= await User.create({username,email,password});
        }
        if(!result) return res.status(401).json({message:"Error in Registration."});
        return res.status(200).json({message:"User Registered"});
    } catch (error) {
        return res.status(401).json({message:`Error registring user ${error}`});

    }
}
export const getUsers=async(req,res)=>{
    try {
        const val = req.query.q;
        let users;
        if(val.length<=0){
            users = await User.findOne({_id:req.user._id});
            // users=users.friends;
        }else{
            users = await User.find({username:{$regex:val,$options:"i"}});
        }
        return res.status(200).send(users);
    } catch (error) {
        return res.status(401).json({message:`Error Getting all users ${error}`});
        }
}
export const getUserbyId=async(req,res)=>{
    try {
        const myid = req.user._id;
        const id = req.params.id;
        const user = await User.findOne({_id:id});
        const friendRequest = await friendRequestModel.findOne({senderId:myid,receiverId:id});
        if(!friendRequest){
            return res.status(200).send({friends:false,user});
        }
        if(friendRequest.status===false){
            return res.status(200).send({friends:"pending",user});
        }
        if(user.friends.includes(req.user._id)){
            return res.status(200).send({friends:true,user});
        }
    } catch (error) {
        return res.status(401).json({message:`Error Getting User by ID ${error}`});
    }
}
export const addFriend=async(req,res)=>{
    try {
        const userId = req.user._id;
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
        return res.status(400).json({message:`Error Adding Friend ${error}`});
    }
}
export const getFriendsofUser=async(req,res)=>{
    try{
        const id = req.user._id;
        const user = await User.findById(id).populate('friends').lean();
        const message = await messageModel.aggregate([{$match:{receiverId:user._id,isRead:false}},{$lookup:{
            from:"users",
            foreignField:"_id",
            localField:"senderId",
            as:"senderDetails"
        }},
        {
            $unwind:"$senderDetails"
        },
        {
         $group:{
            _id:null,
            unreadCount:{$sum:1},
            messages:{$push:"$$ROOT"}
         }   
        }
    ]);
    if (message.length === 0) {
        return res.status(200).json(user.friends);
    }
   const unreadMap = new Map();
   message.forEach((msg)=>{
    if(msg.messages.length){
        unreadMap.set(msg.messages[0].senderDetails._id.toString(),msg.unreadCount);
    }
   });
   user.friends.map((friend)=>{
    if(unreadMap.has(friend._id.toString())){
        friend.unreadCount=unreadMap.get(friend._id.toString());
    }
   });
    return res.status(200).json(user.friends);
    }catch(err){
        console.log("error")
        return res.status(401).json({message:`Error getting friends of user ${err}`});
    }
}
export const readUserMessages=async(req,res)=>{
    try{
        const {receiverId,userId} = req.body;
        const result = await messageModel.updateMany({senderId:receiverId,receiverId:userId},{$set:{isRead:true}});
        return res.status(200).json(result);
    }catch(err){
        console.log(err);
        return res.status(400).json({message:"Cannot Read Messages"});
    }
}
export const updatePassword=async(req,res)=>{
    try {
        const decoded = jwt.verify(req.headers.authorization,process.env.VERIFY_SECRET_KEY);
        const {id,newpass}=decoded;
        const salt = await genSalt(10);
        const hashPassword=await hash(newpass,salt);
        const result = await User.findOneAndUpdate({_id:id},{$set:{password:hashPassword}});
        return res.status(200).json(result);
    } catch (error) {
        console.log('error updating password',error);
    }
}
export const getFriendRequests=async(req,res)=>{
    try {
        const id = req.user._id;
        const result = await friendRequestModel.find({receiverId:id,status:false}).populate('senderId');
        return res.status(200).send(result);
    } catch (error) {
        console.log("Error getting friend requests.");
        return res.status(401).json({message:error});
    }
}

export const handleUpdateFriendRequest = async(req,res)=>{
    try {
        const {requestId,senderId,receiverId}=req.body;
            await friendRequestModel.findByIdAndUpdate(requestId,{$set:{status:true}});
                        const result = await User.bulkWrite([
                            {
                                updateOne:{
                                    filter:{_id:senderId},
                                    update:{$addToSet:{friends:receiverId}}
                                }
                            },{
                                updateOne:{
                                    filter:{_id:receiverId},
                                    update:{$addToSet:{friends:senderId}}
                                }
                            }
                        ]);
            return res.status(200).json(result);
    } catch (error) {
        return res.status(400).json({message:"error confirm request"});
    }
}