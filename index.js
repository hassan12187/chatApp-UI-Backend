import express from 'express';
import dotenv from 'dotenv';
import userRouter from './router/userRouter.js';
const app = express();
dotenv.config();
app.use(express.json());

app.use('/user',userRouter);

app.listen(process.env.PORT,()=>console.log(`listening to port ${process.env.PORT}`));