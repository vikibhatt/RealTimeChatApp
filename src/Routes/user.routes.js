import express from 'express'
import {destroyUserProfile, editUserProfile, showUserProfile, userLogin, userLogout, userRegister } from '../controllers/user.controller.js';
import { JWTVerify } from '../middlewares/auth.middleware.js';
import {upload} from '../middlewares/multer.middlerware.js'

const router = express.Router();

router.post('/register', userRegister)
router.post('/login', userLogin)
router.get('/logout',JWTVerify, userLogout)
router.post('/showUserData', showUserProfile)
router.post('/editUserData', JWTVerify,
upload.fields([
    {
        name: 'coverImage',
        maxCount: 1
    }
]), editUserProfile)

router.get('/deleteProfile', JWTVerify, destroyUserProfile)

export {router}