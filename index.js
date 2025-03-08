import express from 'express';
import dotenv from 'dotenv';
import userRouter from './router/userRouter.js';
import connectDB from './connection.js';
const app = express();
dotenv.config();
app.use(express.json());


app.use('/user',userRouter);

connectDB().then(()=>{
    app.listen(process.env.PORT,()=>console.log(`listening to port ${process.env.PORT}`));
}).then((err)=>{
    console.log(`error in connection ${err}`);
})