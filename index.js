    import express from 'express';
    import dotenv from 'dotenv';
    import userRouter from './router/userRouter.js';
    import connectDB from './connection.js';
    import cors from 'cors';
    import http from 'http';
    import {Server} from 'socket.io';
    import Redis from 'ioredis';
    import {createAdapter} from '@socket.io/redis-adapter';
    import { validateToken } from './services/jsonWeb.js';
    import messageModel from './models/messageModel.js';
    import cluster from 'cluster';
    import os from 'os';
    dotenv.config();
        const app = express();
    app.use(cors({
        origin:"http://localhost:5173",
        credentials:true,
    }));
    app.use(express.json());

    app.use('/images',express.static("images"));
    app.use('/user',userRouter);
    app.get('/validate',(req,res)=>{
        const token = req.headers['authorization']?.split(' ')[1];
        const payload = validateToken(token);
        if(!payload)return res.status(404).json({message:"Token not verified"});
        req.user=payload;
        return res.status(201).json(payload);
    });

    if(cluster.isPrimary){
        connectDB();
        for(let i = 0 ;i<os.cpus().length;i++){
            cluster.fork()
        }
    }else{
        const server = http.createServer(app);
        connectDB();
        const io = new Server(server,{
        cors:{
            origin:"http://localhost:5173",
            methods:["GET","POST"],
        },
    });
    const pub = new Redis();
    const sub = new Redis();
    io.adapter(createAdapter(pub,sub));
    const onlineUsers = new Map();
    sub.subscribe('chat');
    sub.on('message',async(channel,message)=>{
        const {senderId,receiverId,txt} = JSON.parse(message);
        const model = new messageModel({senderId,receiverId,message:txt,isRead:false});
        const receiverSocketId = onlineUsers.get(receiverId);
        if(receiverSocketId){
            io.to(receiverSocketId).emit('messageSender',{senderId,message:txt,date:new Date()});
        }
        await model.save();
    });
    io.on('connection',(socket)=>{
        socket.on('register',async(userId,recId)=>{
            onlineUsers.set(userId,socket.id);
            const messages = await messageModel.find({
                $or:[
                    {senderId:userId,receiverId:recId},
                    {senderId:recId,receiverId:userId},
                ]
            }); 
            socket.emit("previousMessages",messages);
        });
        socket.on('message',(message)=>{
            const data = JSON.parse(message)
            pub.publish('chat',JSON.stringify(data));
        })
        socket.on('disconnect',()=>{
            onlineUsers.forEach((id,userId)=>{
                if(id===socket.id){
                    onlineUsers.delete(userId);
                }
            })
        })
    });
        server.listen(process.env.PORT || 8000,()=>console.log('server is listening on port 8000'))
    }