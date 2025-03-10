import express from 'express';
import dotenv from 'dotenv';
import userRouter from './router/userRouter.js';
import connectDB from './connection.js';
import cors from 'cors';
import http from 'http';
import cluster from 'cluster';
import os from 'os';
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
        server.listen(process.env.PORT,()=>{console.log(`handled by worker ${process.pid}`)});
    }
}).catch((err)=>{
    console.log(`error in connection ${err}`);
});