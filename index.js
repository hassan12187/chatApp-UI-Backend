import express from 'express';
import dotenv from 'dotenv';
import userRouter from './router/userRouter.js';
import connectDB from './connection.js';
import cors from 'cors';
import http from 'http';
import cluster from 'cluster';
import os from 'os';
import {WebSocketServer} from 'ws';
const app = express();
dotenv.config();
app.use(cors({
    origin:"http://localhost:5173",
    credentials:true,
}));
app.use(express.json());

app.use('/user',userRouter);
app.use('as',(req,res)=>{
    req.proce
})

connectDB().then(()=>{
    if(cluster.isPrimary){
        for(let i =0;i<os.cpus().length;i++){
            cluster.fork();
        }
    }else{
        const server = http.createServer(app);
        const ws = new WebSocketServer({server});
        ws.on('connection',(socket,req)=>{
            const token = new URL(req.url,`http://${req.headers.host}`).searchParams.get('token');
            if(!token){
                ws.close();
                return;
            }
            socket.on('message',(message)=>{
                ws.clients.forEach(client=>{
                    if(client != socket && client.readyState===socket.OPEN){
                        client.send(`server sending message  ${message}`);
                    }
                })
            });
            socket.on('close',()=>{
                console.log(`user disconnected`);
            })
        });
        server.listen(process.env.PORT,()=>{console.log(`handled by worker ${process.pid}`)});
    }
}).catch((err)=>{
    console.log(`error in connection ${err}`);
});