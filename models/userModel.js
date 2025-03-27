import {Schema,model} from 'mongoose';
import bcrypt from 'bcrypt';
import { generateToken } from '../services/jsonWeb.js';

const userSchema = new Schema({
    username:{
        type:String,
        require:true
    },
    email:{
        type:String,
        require:true,
        unique:true
    },
    password:{
        type:String,
        require:true
    },
    profileImage:{
        type:String,
        default:'default_user.jpg'
    },
    friends:[
        {
            type:Schema.Types.ObjectId,
            ref:'user',
        }
    ]
},{timestamps:true});

userSchema.pre("save",async function(next){
    if(!this.isModified("password")) return next();
    try {
        const salt = await bcrypt.genSalt(10);
        this.password=await bcrypt.hash(this.password,salt);;
        next();
    } catch (error) {
        next(error);
    }

});
userSchema.methods.comparePass=async function(password){
    const isMatched = await bcrypt.compare(password,this.password);
    if(isMatched){
        return generateToken({_id:this._id,username:this.username,email:this.email,image:this.profileImage});
    };
    return false;
};
const User = model('user',userSchema);
export default User;