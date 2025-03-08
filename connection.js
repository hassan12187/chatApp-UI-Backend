import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();
const connectDB=async()=>{
    try {
        await mongoose.connect(process.env.MONGO_DB_URI);
    } catch (error) {
        console.log(`error connecting to mongo DB ${error}`);
    }
}
export default connectDB;