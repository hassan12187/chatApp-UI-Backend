import { Queue } from "bullmq";
import Redis from 'ioredis';

const connection = new Redis();

export const messageQueue = new Queue("chat-messages",{
    connection
});