import { Router } from "express";
import { LoginUser,registerUser,authenticate,getUsers,getUserbyId ,addFriend,getFriendsofUser,readUserMessages, updatePassword,getFriendRequests,handleUpdateFriendRequest} from "../controllers/userController.js";
import multer from 'multer';
const router = Router();

const diskStorage=multer.diskStorage({
    destination:(req,file,cb)=>{
        cb(null,'./images/')
    },
    filename:(req,file,cb)=>{
        cb(null,`${Date.now()}-${file.originalname}`);
    }
});
const upload=multer({storage:diskStorage});
// router.use('/friend',)
router.get('/api/protected',authenticate);
router.get('/',authenticate,getUsers);
router.post('/login',LoginUser);
router.post('/signup',upload.single('profileImage'),registerUser);
router.get('/friend',authenticate,getFriendsofUser);
router.patch('/messages',authenticate,readUserMessages);
router.post('/password',authenticate,updatePassword);
router.get('/request',authenticate,getFriendRequests);
router.patch('/request',authenticate,handleUpdateFriendRequest);
// router.post('/addFriend/:id',authenticate,addFriend);
router.get('/:id',authenticate,getUserbyId);

export default router;