import messages from "../models/message.js";
import users from "../models/users.js";
import cloudinary from "../lib/cloudinary.js";
import { io, userSocketMap } from "../index.js";


// getUsers- except logged user
export const getFilteredUsers = async (req, res) =>{
    try {
        const userId = req.user._id;
        const filteredUsers = await users.find({_id: {$ne : userId}}).select("-password");

        // not seen messages count
        const unseenMsges = {}
        const promises = filteredUsers.map(async (user)=>{
            const msges = await messages.find({
                senderId: user._id,
                receiverId: userId, seen: false
            })
            if(msges.length > 0){
                unseenMsges[user._id] = messages.length;
            }
        })
        await Promise.all(promises);
        res.json({success: true, users: filteredUsers, unseenMsges})
    } catch (error) {
        console.log(error.messages);
        res.json({success: false, message: error.message})
    }
}

// getMessages for selected user
export const getMessages = async (req, res)=>{
    try {
        const { id: selectedUserId } = req.params
        const myId = req.user._id

        const msges = await messages.find({
            $or: [
                {senderId: myId, receiverId:selectedUserId},
                {senderId: selectedUserId, receiverId:myId}
            ]
        })
        await messages.updateMany({senderId: selectedUserId, receiverId: myId},{seen:true})
        res.json({success: true, msges})
    } catch (error) {
        console.log(error.messages);
        res.json({success: false, message: error.message})
    }
}

// api to mark msge as seen using msge id
export const markMsgesAsSeen = async (req, res)=>{
    try {
        const { id } = req.params
        await messages.findByIdAndUpdate(id, {seen:true})
        res.json({success: true})
    } catch (error) {
        console.log(error.messages);
        res.json({success: false, message: error.message})
    }
}

// sendMessage
export const sendMessage = async (req, res)=>{
    try {
        const { text, image } = req.body
        const receiverId = req.params.id
        const senderId = req.user._id

        let imageUrl;
        if(image){
            const uploadResponse = await cloudinary.uploader.upload(image)
            imageUrl = uploadResponse.secure_url
        }
        const newMsge = await messages.create({
            senderId,
            receiverId,
            text,
            image:imageUrl
        })

        // emit new msges to the receiver's socket
        const receiverSocketId = userSocketMap[receiverId];
        if(receiverSocketId){
            io.to(receiverSocketId).emit("newMessage", newMsge)
        }

        res.json({success: true, newMsge})
        
    } catch (error) {
       console.log(error.messages);
        res.json({success: false, message: error.message})  
    }
}