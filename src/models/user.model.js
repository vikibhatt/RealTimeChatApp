import mongoose, {Schema} from 'mongoose'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

const userSchema = new Schema({
    name: {
        type: String,
        default: "guest"
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true,
    },
    refreshToken: {
        type: String,
    },
    coverImage:{
        type: String,
    }
},{timestamps: true})

userSchema.pre('save', async function(next){
    if(!this.isModified('password')) next();

    try {
        const salt = await bcrypt.genSalt(10);
        const encryptedPassword = await bcrypt.hash(this.password, salt);
        this.password = encryptedPassword;
        next();
    } catch(error) {
        next(error)
    }
})

userSchema.methods.isPasswordCorrect = async function(password){
    return await bcrypt.compare(password, this.password)
}

userSchema.methods.generateAccessToken = function(){
    return jwt.sign(
        {
            _id: this._id,
            email: this.email
        },
        process.env.ACCESS_TOKEN_SECRET,
        {expiresIn: process.env.ACCESS_TOKEN_EXPIRY}
    )
}

userSchema.methods.generateRefreshToken = function(){
    return jwt.sign(
        {
            _id: this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {expiresIn: process.env.REFRESH_TOKEN_EXPIRY}
    )
}

export const User = mongoose.model("User", userSchema)