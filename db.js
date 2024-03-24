import mongoose from 'mongoose'
import { DB_Name } from './constants.js'
import dotenv from 'dotenv'

dotenv.config({
    path: './.env'
})

const connectDB = async() =>{
    try {
        await mongoose.connect(`${process.env.MONGO_URL}${DB_Name}`)
    } catch (error) {
        console.log(`DB connection error ${error?.message}`)
        process.exit(1)
    }
}

export {connectDB}