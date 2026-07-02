import Friendship from "../models/Friendship.js"
import User from "../models/User.js"
import Conversation from "../models/Conversation.js"
import Message from "../models/Message.js"
import RedisService from "../services/RedisService.js"
import {getChatRoom} from "./helpers.js"


export const notifyConversationOnlineStatus = async (io, socket, online) => {
    try {
        const userId = socket.userId
        const user = socket.user

        const friendships = await Friendship.find({
            $or: [
                {requester: userId},
                {recipient: userId}
            ]
        })
        friendships.forEach((friendship) => {
            const isRequester = friendship.requester._id.toString() ===userId.toString();
            const friendId = isRequester ? friendship.recipient._id : friendship.requester._id;

            const room = getChatRoom(userId.toString(), friendId.toString())
            socket.join(room);

            console.log("Emit: converstaion: online-status");
            io.to(friendId.toString())
                .emit('conversation: online-status' , {
                    friendId: userId,
                    username: user.username,
                    online
                })
        })
        
    } catch (error) {
        console.error("notifyConversationOnlineStatus", error)
    }
}

export const conversationRequest = async (io, socket, data) => {
    try {
        const userId = socket.userId;
        const user = socket.user;
        const {connectCode} = data;

        const friend = await User.findOne({connectCode})

        if(!friend) {
            socket.emit("conversation:request:error",  {error: "Unable to find conversation"})
            return;
        }

        if(friend._id.toString() === userId.toString()) {
            socket.emit("conversation:request:error" , {error: "Can not add youreself as a friend"})
            return;

        }

        const existingFriendShip = await Friendship.findOne({
            $or: [
                {requester: userId, recipient:friend._id},
                {requester: friend._id, recipient: userId}
            ]
        })

        if(existingFriendShip) {
             socket.emit("conversation:request:error" , {error: "friendship already exist!"})
            return;
        }

        const friendShip = await Friendship.create({
            requester: userId,
            recipient: friend._id

        })

        const conversation = await Conversation.create({
            participants: [userId, friend._id.toString()]
        })

        socket.join(getChatRoom(userId, friend._id.toString()))

        const conversationData = {
            conversationId: conversation._id.toString(),
            lastMessage: null,
            unreadCounts: {
                [userId.toString()]: 0,
                [friend._id.toString()]: 0
            }
        }
        
        io.to(userId.toString()).emit("conversation:accept", {
            ...conversation,
            friend: {
                id: friend.id,
                fullName: friend.fullName,
                username: friend.username,
                connectCode: friend.connectCode,
                online: await RedisService.isUserOnline(friend._id.toString())
            }
        })

        io.to(friend._id.toString()).emit("conversation:accept", {
            ...conversation,
            friend: {
                id: user.id,
                fullName: user.fullName,
                username: user.username,
                connectCode: user.connectCode,
                isOnline: await RedisService.isUserOnline(user._id.toString())
            }
        })
    } catch (error) {
        console.error("Error conversation request", error)
        socket.emit("conversation:request:error", {error: "Error conversation:request"})
    }
}

export const conversationMarkAsRead = async (io, socket, data) => {
    try {
        const {conversationId, friendId} = data;
        const userId = socket.userId;

        const friendShip = await Friendship.findOne({
            $or: [
                {requester: userId, recipient: friendId},
                {requester: friendId, recipient: userId}
            ]
        })

        if(!friendShip) {
            socket.emit("conversation:mark-as-read:error", {error: "Friendship not found"})
            return;
        }

        const conversation = await Conversation.findById(conversationId)
        if(!conversation) {
            socket.emit("conversation:mark-as-read:error", {error: "Conversation not found"})
            return;
        }

        conversation.unreadCounts.set(userId.toString(), 0)
        await conversation.save()

        const room = getChatRoom(userId.toString(), friendId.toString() )
        io.to(room).emit("conversation:update-unread-counts", {
            conversationId: conversation._id.toString(),
            unreadCounts: {
                [userId.toString()]: 0,
                [friendId.toString()]: conversation.unreadCounts.get(friendId.toString()) || 0
            }
        })


    } catch (error){
        console.error("Error conversation mark as read", error)
        socket.emit("conversation:mark-as-read:error", {error: "Error marking conversation as read"})
    }

}

export const ConversationSendMessage = async (io, socket, data) => {
    try {

        const {conversationId, content, friendId} = data;
        const userId = socket.userId;

        const user = socket.user;

         const friendShip = await Friendship.findOne({
            $or: [
                {requester: userId, recipient: friendId},
                {requester: friendId, recipient: userId}
            ]
        })

        if(!friendShip) {
            socket.emit("conversation:send-message:error", {error: "Friendship not found"})
            return;
        }

        const conversation = await Conversation.findById(conversationId)
        if(!conversation) {
            socket.emit("conversation:send-message:error", {error: "Conversation not found"})
            return;
        }

        const message = new Message({
            conversation: conversationId,
            sender: userId,
            content
        })
        await message.save()

        const currentUnreadCount = conversation.unreadCounts.get(friendId.toString()) || 0;
        conversation.unreadCounts.set(friendId, currentUnreadCount + 1)
        await conversation.save()

        const messageData = {
            _id: message.id,
            sender: {
                _id: user.id.toString(),
                username: user.username
            },
            content,
            createdAt: message.createdAt,
            read: message.read

        }

        const updatedConversation = await Conversation.findById(conversationId)


        const room = getChatRoom(userId.toString(), friendId.toString())
        io.to(room).emit("conversation:new-message", {
            conversationId: conversation.id,
            message: messageData,

        })

        io.to(room).emit("conversation:update-conversation", {
            conversationId: conversation.id,
            lastMessage: updatedConversation.lastMessagePreview,
            unreadCounts: {
                [userId.toString()]: updatedConversation.unreadCounts.get(userId.toString()) || 0,
                [friendId.toString()]: updatedConversation.unreadCounts.get(friendId.toString()) || 0
            }
        })

    }catch (error) {
        console.error("Error sending message", error)
        socket.emit("conversation:send-message:error", {error: "Error sending message"})
    }
}

export const ConversationTyping = async (io, socket, data) => {
    try {
        const {friendId, isTyping} = data;
        const userId = socket.userId;

        if(userId.toString() === friendId) return;

        socket.to(friendId).emit("conversation:update-typing", {
            userId: userId.toString(),
            isTyping
        })


    }catch (error) {
        console.error("error sending conversation typing state", error)
    }
}