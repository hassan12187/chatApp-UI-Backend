import {Schema,model} from 'mongoose';
import bcrypt from 'bcrypt';

const userSchema = new Schema({
    username:{
        type:String,
        require:true
    },
    email:{
        type:String,
        require:true
    },
    password:{
        type:String,
        require:true
    }
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
    
}
const User = model('user',userSchema);
export default User;