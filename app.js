import express from 'express'
import { limitSize } from './constants.js'
import cookieParser from 'cookie-parser';
import cors from 'cors'
const app = express();

app.use(cors())
app.use(express.json({limit: limitSize}))
app.use(express.urlencoded({extended: true, limit: limitSize}))
app.use(cookieParser())
app.use(express.static("public"))

import {router as userRoutes} from './src/Routes/user.routes.js'
import {router as chatRoutes} from './src/Routes/chat.routes.js'

app.use('/api/v1/users', userRoutes)
app.use('/api/v1/chats', chatRoutes)

export {app}