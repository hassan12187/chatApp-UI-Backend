import { Router } from "express";
import { LoginUser,registerUser,authenticate,getUsers,getUserbyId ,addFriend,getFriendsofUser} from "../controllers/userController.js";
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
router.get('/allUsers',getUsers);
router.post('/login',LoginUser);
router.post('/signup',upload.single('profileImage'),registerUser);
router.get('/:id',authenticate,getUserbyId);
router.post('/addFriend/:id',authenticate,addFriend);
router.get('/userFriends/:id',getFriendsofUser);

export default router;