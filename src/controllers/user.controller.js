import {ApiResponse} from '..//utils/apiResponse.utils.js'
import { User } from '../models/user.model.js';
import {ApiError} from '../utils/apiError.utils.js'
import {asyncHandler} from '../utils/asyncHandler.utils.js'
import {options} from '../../constants.js'
import { addFilesToCloudinary, deleteFilesFromCloudnary } from '../utils/cloudinary.utils.js';

const generateRefreshTokensAndAccessTokens = async(userId)=>{
    try {
        const user = await User.findOne(userId)
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();
    
        user.refreshToken = refreshToken;
        user.save({validateBeforeSave: false});
    
        return {accessToken, refreshToken}
    } catch (error) {
        throw new ApiError(500, `Error while generating tokens ${error?.message}`)
    }
}

const userRegister = asyncHandler(async(req, res)=>{
    const {name, email, password} = req.body;

    if(!email || !password){
        throw new ApiError(401, "email or password is required")
    }

    const isUserExists = await User.exists({email})

    if(isUserExists){
        throw new ApiError(402, "user already exists")
    }

    try {
        const user = await User.create({
            name,
            email,
            password
        })

        console.log("User created successfully")
        return res
        .status(200).
        json(
            new ApiResponse(200, user, "User created successfully")
        )
    } catch (error) {
        throw new ApiError(500, `Error while creating new User ${error?.message}`)
    }
})

const userLogin = asyncHandler(async(req, res)=>{
    const {email, password} = req.body

    if(!email || !password){
        throw new ApiError(401, "email or password is required")
    }

    try {
        const user = await User.findOne({email})
        if(!user){
            throw new ApiError(404, "User not found")
        }
    
        const isCorrect = await user.isPasswordCorrect(password)
    
        if(isCorrect){
            const {accessToken, refreshToken} = await generateRefreshTokensAndAccessTokens(user._id)

            const userDetails = await User.find(user._id).select("-password -refreshToken")

            console.log("User logged in successfully")
            return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", refreshToken, options)
            .json(
                new ApiResponse(200,{
                    user: userDetails, accessToken, refreshToken
                }, "User logged in successfully")
            )
        }
        else{
            throw new ApiError(406, "Password is incorrect")
        }
    } catch (error) {
        throw new ApiError(500, `Error while login ${error?.message}`)
    }
})

const userLogout = asyncHandler(async(req, res)=>{
    await User.findByIdAndUpdate(req.user?._id,
        {
            $unset: {
                refreshToken: 1
            }
        },
        {
            new: true
        }
    )

    console.log("Logout successfully")

    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(
        new ApiResponse(200, {}, "Logout successfully")
    )
})

const showUserProfile = asyncHandler(async(req, res)=>{
    const {userId} = req.query

    const user = await User.findById(userId).select("-password -refreshToken -email")

    if(!user){
        throw new ApiError(404, "User not found")
    }

    console.log("User data fetched successfully")

    return res
    .status(200)
    .json(
        new ApiResponse(200, user, "User data fetched successfully")
    )
})

const editUserProfile = asyncHandler(async(req, res)=>{
    const user = await User.findById(req.user?._id)

    if(!user){
        throw new ApiError(404, "User not found")
    }

    const {name} = req.body

    const coverImageLocalPath = req.files?.coverImage[0].path

    user.name = name
    if(coverImageLocalPath){
        const coverImagePath = await addFilesToCloudinary(coverImageLocalPath);
        user.coverImage = coverImagePath?.url
    }

    user.save({validateBeforeSave: false})

    const newData = await User.findById(user?._id).select("-password -refreshToken -email")

    console.log("Data updated successfully")

    return res 
    .status(200)
    .json(
        new ApiResponse(200, newData, "Data updated successfully")
    )
})

const destroyUserProfile = asyncHandler(async(req, res)=>{
    const user = await User.findById(req.user._id)
    
    if(!user){
        throw new ApiError(404, "User not found")
    }

    const coverImageUrl = user?.coverImage

    try {
        await user.deleteOne();

        if(coverImageUrl){
            await deleteFilesFromCloudnary(coverImageUrl, 'image')
        }

        console.log("User profile deleted successfully")

        return res
        .status(200)
        .clearCookie('accessToken', options)
        .clearCookie('refreshToken', options)
        .json(
            new ApiResponse(200,{}, "User profile deleted successfully")
        )
    } catch (error) {
        throw new ApiError(500, `Error while deleting the user profile ${error?.message}`)
    }
})

export {userRegister, userLogin, userLogout, showUserProfile, editUserProfile, destroyUserProfile}