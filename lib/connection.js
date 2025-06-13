import mongoose from "mongoose";

const connectionString = process.env.connectionString

export const connectDB = async () =>{
    try {
        mongoose.connection.on('connected', ()=>console.log('Database Connected'));
        await mongoose.connect(`${connectionString}/chat-app`)
    } catch (error) {
        console.log(error);
        
    }
}



