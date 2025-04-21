import { Worker } from "bullmq";
import Redis from "ioredis";
import messageModel from "../models/messageModel.js";
import { redisClient } from "../redisClient.js";

const connection = new Redis({maxRetriesPerRequest:null});
export const setupMessageWorker=(io)=>{
    const worker = new Worker('chat-messages',async (job)=>{
        const {senderId,receiverId,txt} = job.data;
        const receiverSocketId = await redisClient.hGet('userSocketMap',receiverId)
        const model = new messageModel({senderId,receiverId,message:txt,isRead:false});
        if(receiverSocketId){
            io.to(receiverSocketId).emit('messageSender',{senderId,message:txt,date:new Date()});
            model.isRead=true;
        }
        await model.save();
    },{connection});
    worker.on("completed",(job)=>{
        console.log(`Processed Job ${job.id}`)
    })
    worker.on("failed",(job,err)=>{
        console.error(`Failed job ${job.id}`,err.message);
    })
}