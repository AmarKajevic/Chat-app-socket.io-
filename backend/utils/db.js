import mongoose from "mongoose";

export const connectDB = async() => {
    const uri = process.env.MONGO_URI;
    if(!uri) {
        throw new Error("Mongo_URI is not set")
    }

    try {
        await mongoose.connect(uri, {dbName: 'chatty'})
        
        
    } catch (error) {
        console.error("MongoDb connection error", error);
        process.exit(1)
    }
}