import express from 'express';
import dotenv from 'dotenv';
import userRouter from './router/userRouter.js';
import connectDB from './connection.js';
import cors from 'cors';
const app = express();
dotenv.config();
app.use(cors({
    origin:"http://localhost:5173",
    credentials:true,
}));
app.use(express.json());

app.use('/user',userRouter);

connectDB().then(()=>{
    app.listen(process.env.PORT,()=>console.log(`listening to port ${process.env.PORT}`));
}).catch((err)=>{
    console.log(`error in connection ${err}`);
});