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
import {connectRedis, redisClient} from './redisClient.js';
import { createClient } from 'redis';
import { createAdapter } from '@socket.io/redis-adapter';

dotenv.config();

    // if(cluster.isPrimary){
    //         for(let i = 0 ;i<os.cpus().length;i++){
    //                 cluster.fork()
    //             }
    //             connectDB();
    //             connectRedis();
    //         }else{
                connectDB();
                connectRedis();
                const pubClient = createClient({url:'redis://localhost:6379'});
                const subClient = pubClient.duplicate();
        pubClient.connect().then(()=>{
            console.log('publicne')
        
        });
        subClient.connect().then(()=>{
                console.log("subclient connected")
            });
            io.adapter(createAdapter(pubClient,subClient));
          
            setupMessageWorker(io);
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
        io.on('connect',async(socket)=>{
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
        console.log("onlineFriends event")
        const friendSocketMap = await redisClient.hGetAll('userSocketMap');
        onlineFriendIds.forEach((id,ind)=>{
                const friendSocketId = friendSocketMap[id];
                if(friendSocketId){
                        io.to(friendSocketId).emit('friendOnline',userId);
                        console.log("success friendOnline")
                    }
                })
        socket.on('typing',async(receiverid,val)=>{
           redisClient.hGet('userSocketMap',receiverid).then((socketId)=>{
                   console.log("typing friend socket id",socketId);
                   socket.to(socketId).emit('friend-typing');
            });
        })
        socket.on('not-typing',(receiverid)=>{
            redisClient.hGet('userSocketMap',receiverid).then((socketId)=>{
                console.log('friend not typing ');
                socket.to(socketId).emit('friend-not-typing');
            })
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
                console.log("add-friend in cond")
                return;
            }
            const friendSocketId = await redisClient.hGet('userSocketMap',requestReceiver);
            console.log(friendSocketId)
            if(friendSocketId){
                io.to(friendSocketId).emit("new_friend_request",requestSender)
            };
            await friendRequestModel.create({senderId:requestSender?._id,receiverId:requestReceiver})  
            console.log(`request sender ${requestSender} request receiver ${requestReceiver}`)
        });
        socket.on("confirm_request",async({requestId,senderId,receiverId})=>{
            try {
                const socketId = await redisClient.hGet('userSocketMap',senderId)
                if(socketId){
                    io.to(socketId).emit("request_accepted",receiverId);
                }
            } catch (error) {
                error;
                console.log("errro in comfirn request");
            }
       
        })
        socket.on('disconnect',async()=>{
          await redisClient.hDel('userSocketMap',userId);
          await redisClient.sRem('onlineUsers',userId);
          onlineFriendIds.forEach((id,ind)=>{
            const friendSocketiD = friendSocketMap[id]
            if(friendSocketiD){
                io.to(friendSocketiD).emit("friendOffline",userId)
                console.log("friend offline")
            }
          });
        })
    });
        server.listen(process.env.PORT || 8000,()=>console.log('server is listening on port 8000'))
    // }