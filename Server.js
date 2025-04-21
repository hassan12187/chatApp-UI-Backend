import http from "http";
import { Server } from "socket.io";
import express from 'express';
import emailRoute from './router/emailRouter.js'
import userRouter from './router/userRouter.js';
import { validateToken } from "./services/jsonWeb.js";
import cors from 'cors';
const app = express();

    app.use(cors({
        origin:"http://localhost:5173",
        credentials:true,
    }));
    app.use(express.json());
    app.use('/images',express.static("images"));
    app.use('/email',emailRoute);
    app.use('/user',userRouter);
    app.get('/validate',(req,res)=>{
        const token = req.headers['authorization']?.split(' ')[1];
        const payload = validateToken(token);
        if(!payload)return res.status(404).json({message:"Token not verified"});
        req.user=payload;
        return res.status(201).json(payload);
    });
const server = http.createServer(app);
const io = new Server(server,{
        cors:{
            origin:"http://localhost:5173",
            methods:['GET','POST'],
            credentials:true,
        },
    });
export {server,io};