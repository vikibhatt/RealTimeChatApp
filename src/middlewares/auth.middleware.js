import {ApiResponse} from '..//utils/apiResponse.utils.js'
import {ApiError} from '../utils/apiError.utils.js'
import {asyncHandler} from '../utils/asyncHandler.utils.js'
import jwt from 'jsonwebtoken'
import { User } from '../models/user.model.js';

export const JWTVerify = asyncHandler(async(req, _, next)=>{
    try {
        const token = req?.cookies?.accessToken ||
        req.header("Authorization")?.replace("Bearer ","")
    
        if(!token){ 
            throw new ApiError(404, "Token not found")
        }
    
        const decodeToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
    
        const user = await User.findById(decodeToken?._id).select("-password -refreshToken")
    
        if(!user){
            throw new ApiError(404, "User not found")
        }
    
        req.user = user
        next();
    } catch (error) {
        next(error)
    }
})
