import { Router } from "express";
import { LoginUser,registerUser,authenticate,getUsers,getUserbyId ,addFriend,getFriendsofUser,readUserMessages, updatePassword,getFriendRequests} from "../controllers/userController.js";
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
router.get('/api/protected',authenticate);
router.get('/allUsers',authenticate,getUsers);
router.post('/login',LoginUser);
router.post('/signup',upload.single('profileImage'),registerUser);
router.get('/userFriends',authenticate,getFriendsofUser);
router.patch('/readMessages',authenticate,readUserMessages)
router.post('/updatePassword',authenticate,updatePassword);
router.get('/friendRequests',authenticate,getFriendRequests)
router.post('/addFriend/:id',authenticate,addFriend);
router.get('/:id',authenticate,getUserbyId);
// router.patch('/user/confirmFriendRequest/:id',authenticate,confirmRequest)

export default router;