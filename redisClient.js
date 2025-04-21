import {createClient} from "redis";

const redisClient = createClient();
redisClient.on('error',err=>console.error('Redis Client Error',err));
const connectRedis=async()=>{
    try {
        if(!redisClient.isOpen)await redisClient.connect();
        console.log("Redis connected successfully.");
    }catch (error) {
        console.log("redis connections error",error);
    }
}
export {redisClient,connectRedis};