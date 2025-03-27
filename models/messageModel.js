import {Schema,model} from 'mongoose';

const messageSchema = new Schema({
    senderId:{
        type:Schema.Types.ObjectId,
        ref:"user",
        required:true
    },
    receiverId:{
        type:Schema.Types.ObjectId,
        ref:"user",
        required:true
    },
    message:{
        type:String,
        required:true
    },
    timeStamps:{
        type:Date,
        default:Date.now()
    }
},{timestamps:true});

const messageModel = model('message',messageSchema);
export default messageModel;