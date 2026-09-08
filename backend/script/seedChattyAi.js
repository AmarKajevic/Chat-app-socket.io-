import dotenv from 'dotenv';
dotenv.config();

import User from "../models/User.js"
import { connectDB } from "../utils/db.js"

export const CreateChattyAI = async () => {
    let chattyAI = await User.findOne({isAI: true})
    if(chattyAI) {
        console.log("Chatty AI already exists")
        return chattyAI;
    }
    chattyAI = await User.create({
        name: "Chatty AI",
        isAI: true,
        avatar: "https://i.pravatar.cc/150?img=3",
    });
    console.log("Chatty AI created", chattyAI.id)
    return chattyAI;
}

const seedChattyAI = async () => {
    try {
        await connectDB();
        await CreateChattyAI();
        console.log("Chatty AI seeding completed");
    } catch (error) {
        console.error("Error seeding Chatty AI:", error);
    }
}

seedChattyAI();