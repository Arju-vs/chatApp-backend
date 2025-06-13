import express from 'express'
import "dotenv/config"
import cors from 'cors'
import http from 'http'
import { connectDB } from './lib/connection.js'
import userRouter from './routes/userRoutes.js'
import messageRouter from './routes/messageRoutes.js'
import { Server } from 'socket.io'

// create express and http Server
const app = express()
const server = http.createServer(app)

// init socket.io server
export const io = new Server(server, {
    cors: {origin: "*"}
})

// Store online users
export const userSocketMap = {} // {userId : socketId}

// socket.io connection handler
io.on("connection",(socket)=>{
    const userId = socket.handshake.query.userId;
    console.log("User Connected", userId);

    if(userId) userSocketMap[userId] = socket.id;

    // emit online users to all connected clients
    io.emit("getOnlineUsers", Object.keys(userSocketMap))

    socket.on("disconnect", ()=>{
        console.log("User Disconnected", userId);
        delete userSocketMap[userId];
        io.emit("getOnlineUsers", Object.keys(userSocketMap))   
    }) 
})


// middleWare
app.use(express.json({ limit: '10mb' }))
app.use(cors({
  origin: 'https://chat-app-ebon-two-11.vercel.app', 
  credentials: true
}))

// routes setup
app.use("/api/status", (req, res)=>res.send("Server is live"))
app.use("/api/auth", userRouter)
app.use("/api/messages", messageRouter)

// Connect to MongoDB
await connectDB()

server.get('/', (req,res)=>{
    res.status(200).send("Connected")
})

const PORT = process.env.PORT || 5000
server.listen(PORT, ()=>console.log("Server is running on PORT: "+ PORT));


