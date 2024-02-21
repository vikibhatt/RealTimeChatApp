import {ApiResponse} from '..//utils/apiResponse.utils.js'
import { User } from '../models/user.model.js';
import {Chat} from '../models/chat.model.js'
import {ApiError} from '../utils/apiError.utils.js'
import {asyncHandler} from '../utils/asyncHandler.utils.js'
import { addFilesToCloudinary } from '../utils/cloudinary.utils.js';

const chatting = asyncHandler(async(req, res)=>{
    const {recieverId} = req.query
    const {message} = req.body;

    const sender = await User.findById(req.user?._id)
    if(!sender){
        throw new ApiError(404,"User not found")
    }

    try {
        const imageLocalPath = req.files?.image[0].path
        let imagePath
        if(imageLocalPath){
            imagePath = await addFilesToCloudinary(imageLocalPath)
        }
        
        const chat = await Chat.create({
            message,
            image: imagePath?.url,
            reciever: recieverId,
            sender: sender._id
        })

        console.log("chats send successfully")

        return res
        .status(200)
        .json(
            new ApiResponse(200, chat, "chats send successfully")
        )
    } catch (error) {
        throw new ApiError(500, `Error while sending the chats ${error?.message}`)
    }
})

export {chatting}