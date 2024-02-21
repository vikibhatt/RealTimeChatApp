import express from 'express'
import { JWTVerify } from '../middlewares/auth.middleware.js';
import {upload} from '../middlewares/multer.middlerware.js'
import { chatting } from '../controllers/chat.controller.js';

const router = express.Router();

router.post('/sendChats', JWTVerify,
upload.fields([
    {
        name: 'image',
        maxCount: 1,
    }
]),
chatting)

export {router}