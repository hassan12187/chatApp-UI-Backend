import express from 'express';
import dotenv from 'dotenv';
import userRouter from './router/userRouter.js';
import connectDB from './connection.js';
import cors from 'cors';
import http from 'http';
import cluster from 'cluster';
import os from 'os';
import {WebSocketServer} from 'ws';
import { validateToken } from './services/jsonWeb.js';
const app = express();
dotenv.config();
app.use(cors({
    origin:"http://localhost:5173",
    credentials:true,
}));
app.use(express.json());

app.use('/user',userRouter);
connectDB().then(()=>{
    if(cluster.isPrimary){
        for(let i =0;i<os.cpus().length;i++){
            cluster.fork();
        }
    }else{
        const server = http.createServer(app);
        const wss = new WebSocketServer({server});
        const activeUsers = new Map();
        wss.on('connection',(socket,req)=>{
            const token = new URL(req.url,`http://${req.headers.host}`).searchParams.get('token');
            if(!token){
                wss.close();
                return;
            }
            try {
                const user = validateToken(token);
                activeUsers.set(user._id,socket);
                socket.userId=user._id;
                socket.username=user.username;
                try {
                    socket.on('message',(text)=>{
                        wss.clients.forEach(client=>{
                            if(client !== socket && client.readyState===WebSocket.OPEN){
                                client.send(JSON.stringify({senderName:user.username,message:text.toString()}));
                            }
                        })
                    });
                } catch (error) {
                    console.log(`wrong message format ${error}`);
                };
                socket.on('close',()=>{
                    console.log(`user ${user._id} ${user.username} disconnected`);
                    activeUsers.delete(user._id);
                });
            } catch (error) {
                socket.close();
            }
        });
        server.listen(process.env.PORT,()=>{console.log(`handled by worker ${process.pid}`)});
    }
}).catch((err)=>{
    console.log(`error in connection ${err}`);
});