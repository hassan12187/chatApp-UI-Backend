import jwt from 'jsonwebtoken';
const generateToken=(user)=>{
    return jwt.sign(user,process.env.SECRET_JWT_KEY);
};
const validateToken=(token)=>{
    return jwt.verify(token,process.env.SECRET_JWT_KEY);
};
export {generateToken,validateToken};