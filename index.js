import dotenv from 'dotenv';
import connectDB from './connection.js';
import { validateToken } from './services/jsonWeb.js';
import messageModel from './models/messageModel.js';
import cluster from 'cluster';
import os from 'os';
import friendRequestModel from './models/friendRequestModel.js';
import User from './models/userModel.js';
import { messageQueue } from './queue/messageQueue.js';
import { setupMessageWorker } from './queue/messageWorker.js';
import {io,server} from './Server.js'
import {connectRedis,redisClient} from './redisClient.js';

dotenv.config();


    if(cluster.isPrimary){
        connectDB();
        connectRedis();
        for(let i = 0 ;i<os.cpus().length;i++){
            cluster.fork()
        }
        setupMessageWorker(io);
    }else{
        connectDB();
        connectRedis();
    io.use((socket,next)=>{
        const token = socket.handshake.auth.token;
        if(!token)return next(new Error("Authentication Error."));
        try {
            const payload = validateToken(token);
            socket.user = payload;
            next();
        } catch (error) {
            next(new Error("Invalid Token."));
        }
    })
    io.on('connection',async(socket)=>{
        // socket.on("connect",)
        const userId=socket.user._id;
        await redisClient.sAdd("onlineUsers",userId);
        await redisClient.hSet('userSocketMap',userId,socket.id);

        let friendsIds=await redisClient.sMembers(`friends:${userId}`);
        
        if(!friendsIds || friendsIds.length ===0){
            const user = await User.findById(userId).select('friends');
            friendsIds = user.friends.map(id=>id.toString());
            if(friendsIds.length > 0){
                await redisClient.sAdd(`friends:${userId}`,friendsIds);
                await redisClient.expire(`friends:${userId}`,3600);
            }
        }
        const pipeline = redisClient.multi();
        friendsIds.forEach(friendId => {
            pipeline.sIsMember('onlineUsers',friendId)});
        const isOnlineArray = await pipeline.exec();

        const onlineFriendIds = friendsIds.filter((_,i)=> isOnlineArray[i]===true );

        socket.emit('onlineFriends',onlineFriendIds);
        const friendSocketMap = await redisClient.hGetAll('userSocketMap');
        const userDetail = await User.findById(userId);
        onlineFriendIds.forEach((id,ind)=>{
                const friendSocketId = friendSocketMap[id];
                if(friendSocketId){
                        io.to(friendSocketId).emit('friendOnline',userDetail);
                    }
                })
                
        socket.on('getPreviousMessages',async(recId)=>{
            const userId=socket.user._id;
                const messages = await messageModel.find({
                    $or:[
                        {senderId:userId,receiverId:recId},
                        {senderId:recId,receiverId:userId},
                    ]
                }); 
            socket.emit("previousMessages",messages);
        });
        socket.on('message',async(message)=>{
            console.log("socket message");
            await messageQueue.add('newMessage',JSON.parse(message))
        });
        socket.on('add-friend',async({requestSender,requestReceiver})=>{
            const result = await friendRequestModel.findOne({senderId:requestSender?._id,receiverId:requestReceiver});
            if(result){
                return;
            }
            if(onlineUsers.has(requestReceiver)){
                const friendSocketId = onlineUsers.get(requestReceiver);
                io.to(friendSocketId).emit("new_friend_request",requestSender)
            };
            await friendRequestModel.create({senderId:requestSender?._id,receiverId:requestReceiver})  
            console.log(`request sender ${requestSender} request receiver ${requestReceiver}`)
        });
        socket.on("confirm_request",async({requestId,senderId,receiverId})=>{
            try {

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
                console.log(result);
                // const socketId = onlineUsers.get(senderId);
                // const user = User.findOne({_id:receiverId});
                // user.then((res)=>{
                //     io.to(socketId).emit("request_accepted",res);
                // })         
            } catch (error) {
                
            }

       
        })
        socket.on('disconnect',async()=>{
          await redisClient.hDel('userSocketMap',userId);
          await redisClient.sRem('onlineUsers',userId);
          onlineFriendIds.forEach((id,ind)=>{
            const friendSocketiD = friendSocketMap[id]
            if(friendSocketiD){
                io.to(friendSocketiD).emit("friendOffline",userId)
            }
          });
        })
    });
        server.listen(process.env.PORT || 8000,()=>console.log('server is listening on port 8000'))
    }