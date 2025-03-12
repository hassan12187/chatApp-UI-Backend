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
    friends:[
        {
            type:Schema.Types.ObjectId,
            ref:'User',
        }
    ]
},{timestamps:true});

userSchema.pre("save",async function(next){
    const user = this;
    const rounds = 10;
    const salt = await bcrypt.genSalt(rounds);
    const hashPass = await bcrypt.hash(user.password,salt);
    user.password=hashPass;
    next();
});
userSchema.methods.comparePass=async function(password){
    const isMatched = await bcrypt.compare(password,this.password);
    if(isMatched){
        return await generateToken({_id:this._id,email:this.email,password:this.password});
    };
};
const User = model('user',userSchema);
export default User;