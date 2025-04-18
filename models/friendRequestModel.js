import {Schema,model} from 'mongoose';

const friendRequestSchema=new Schema({
    senderId:{
        type:Schema.Types.ObjectId,
        ref:"user"
    },
    receiverId:{
        type:Schema.Types.ObjectId,
        ref:"user",
    },
    status:{
        type:Boolean,
        default:false
    }
},{timestamps:true});

const friendRequestModel = model('FriendRequest',friendRequestSchema);
export default friendRequestModel;