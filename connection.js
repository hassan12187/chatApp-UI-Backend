import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();
let isConnected = false;
const connectDB=async()=>{
    if(isConnected){
        console.log('using existing database connection');
        return;
    }
    try {
        const conn = await mongoose.connect(process.env.MONGO_DB_URI);
        isConnected=true;
        console.log(`MongoDB connected ${conn.connection.host}`);
    } catch (error) {
        console.log(`error connecting to mongo DB ${error}`);
        process.exit(1);
    }
}
export default connectDB;