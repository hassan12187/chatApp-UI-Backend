import jwt from 'jsonwebtoken';
const generateToken=async(user)=>{
    return jwt.sign(user,process.env.SECRET_JWT_KEY);
};
const validateToken=async()=>{};
export {generateToken,validateToken};