import RedisService from "./services/RedisService.js";
import {leaveAllRooms}  from "./socket/helpers.js";
import { conversationMarkAsRead,
        conversationRequest,
        ConversationSendMessage, 
        ConversationTyping, 
        notifyConversationOnlineStatus, 
        startAiConversation} from "./socket/socketConversation.js";

export const initializeSocket = async (io) => {
    io.on("connection", async (socket) => {
       try {
        const user = socket.user;
        console.log("User Connected", user.id)
        socket.join(user._id.toString())

        await RedisService.addUserSession(user.id, socket.id)

        await notifyConversationOnlineStatus(io, socket, true)

        socket.on("conversation:request", (data) => conversationRequest(io, socket, data))

        socket.on("conversation:mark-as-read",  (data) => conversationMarkAsRead(io, socket, data))
        socket.on("conversation:send-message",  (data) => ConversationSendMessage(io, socket, data))
        socket.on("conversation:typing",  (data) => ConversationTyping(io, socket, data))
        socket.on('conversation:start-ai', (data) => startAiConversation(io, socket, data));

        socket.on('disconnect', async () => {
            
            await RedisService.removeUserSessions(user.id, socket.id)

            const isOnline = await RedisService.isUserOnline(user.id)

            if(!isOnline) {
                await notifyConversationOnlineStatus(io, socket, false)
                leaveAllRooms(socket);
            }
            
        })
        
       } catch (error) {
        console.error("socket connection error", error)
        socket.emit("internal server error", {error: "internal server error"})
       }
    })
}