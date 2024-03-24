import dotenv from 'dotenv'
import {app} from './app.js'
import { connectDB } from './db.js'
import {WebSocketServer} from 'ws'

dotenv.config({
    path: './.env'
})

const port = process.env.PORT

const server = app.listen(port, ()=>{
    console.log(`server listening on port ${port}`)
})

const wss = new WebSocketServer({server});

wss.on('connection', (ws) => {
    ws.on('message', (msg) => {
        console.log("%s",msg)
        ws.send('msg recieved');
    });
});

connectDB()
.then(()=>{
    console.log("Database connected")
})
.catch((error)=>{
    console.log("Server connection error: ", error?.message)
})
