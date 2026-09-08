import Friendship from "../models/Friendship.js"
import User from "../models/User.js"
import Conversation from "../models/Conversation.js"
import Message from "../models/Message.js"
import RedisService from "../services/RedisService.js"
import {getChatRoom} from "./helpers.js"
import { generateAIResponse } from "../services/GeminiService.js"


export const notifyConversationOnlineStatus = async (io, socket, online) => {
    try {
        const userId = socket.userId;
        const user = socket.user;


        const friendships = await Friendship.find({
            $or: [
                { requester: userId },
                { recipient: userId }
            ]
        });

        for (const friendship of friendships) {
            const isRequester = friendship.requester._id.toString() === userId.toString();
            const friendId = isRequester ? friendship.recipient._id : friendship.requester._id;


            const friendUser = await User.findById(friendId);
            if (friendUser && friendUser.isAI) continue;

            const room = getChatRoom(userId.toString(), friendId.toString());
            socket.join(room);

            io.to(friendId.toString()).emit('conversation:online-status', {
                friendId: userId,
                username: user.username,
                online
            });
        }

    } catch (error) {
        console.error("notifyConversationOnlineStatus", error);
    }
};

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


        const conversation = await Conversation.findById(conversationId)
        if(!conversation) {
            socket.emit("conversation:mark-as-read:error", {error: "Conversation not found"})
            return;
        }

        if (!conversation.isAiChat) {
        const friendShip = await Friendship.findOne({
            $or: [
                { requester: userId, recipient: friendId },
                { requester: friendId, recipient: userId }
            ]
        });
        if (!friendShip) {
            socket.emit("conversation:mark-as-read:error", { error: "Friendship not found" });
            return;
        }
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
        const { conversationId, content, friendId } = data;
        const userId = socket.userId;
        const user = socket.user;

        // 1. Dohvati konverzaciju
        const conversation = await Conversation.findById(conversationId);
        if (!conversation) {
            socket.emit("conversation:send-message:error", { error: "Conversation not found" });
            return;
        }

        // 2. Provera prijateljstva – samo za obične (ne-AI) čatove
        if (!conversation.isAiChat) {
            const friendship = await Friendship.findOne({
                $or: [
                    { requester: userId, recipient: friendId },
                    { requester: friendId, recipient: userId }
                ]
            });
            if (!friendship) {
                socket.emit("conversation:send-message:error", { error: "Friendship not found" });
                return;
            }
        }

        // 3. Kreiraj i sačuvaj korisnikovu poruku
        const message = new Message({
            conversation: conversationId,
            sender: userId,
            content
        });
        await message.save();

        // 4. Ažuriraj unread za primaoca (friendId)
        const currentUnread = conversation.unreadCounts.get(friendId.toString()) || 0;
        conversation.unreadCounts.set(friendId.toString(), currentUnread + 1);

        // 5. Ažuriraj lastMessagePreview
        conversation.lastMessagePreview = {
            content: content,
            timestamp: new Date()
        };
        await conversation.save();

        // 6. Pripremi podatke za emitovanje korisnikove poruke
        const messageData = {
            _id: message.id,
            sender: {
                _id: user.id.toString(),
                username: user.username
            },
            content,
            createdAt: message.createdAt,
            read: message.read
        };

        const room = getChatRoom(userId.toString(), friendId.toString());

        // 7. Emituj novu poruku svima u sobi
        io.to(room).emit("conversation:new-message", {
            conversationId: conversation.id,
            message: messageData,
        });

        // 8. Emituj ažuriranje konverzacije (lastMessage, unreadCounts)
        io.to(room).emit("conversation:update-conversation", {
            conversationId: conversation.id,
            lastMessage: conversation.lastMessagePreview,
            unreadCounts: {
                [userId.toString()]: conversation.unreadCounts.get(userId.toString()) || 0,
                [friendId.toString()]: conversation.unreadCounts.get(friendId.toString()) || 0
            }
        });

        // =========================================================
        // 9. AKO JE AI ČAT – generiši AI odgovor (asinhrono, ne blokiramo)
        // =========================================================
        if (conversation.isAiChat) {
            // Pronađi AI korisnika (pretpostavljamo da postoji samo jedan)
            const aiUser = await User.findOne({ isAI: true });

            if (!aiUser) {
            // Opcija 1: Vrati grešku
            socket.emit("conversation:start-ai:error", { 
                error: "AI assistant is not available. Please contact support." 
            });
            return;
            }

            // Dohvati poslednjih 20 poruka za kontekst (uključujući i ovu novu)
            const lastMessages = await Message.find({ conversation: conversationId })
                .sort({ createdAt: -1 })
                .limit(20)
                .populate('sender', 'isAI');

            // Formiraj istoriju za AI (od najstarije ka najnovijoj)
            const history = lastMessages.reverse().map(msg => {
                const isAISender = msg.sender && msg.sender.isAI === true;
                return {
                    role: isAISender ? 'model' : 'user',
                    content: msg.content
                };
            });

            // Pokreni generisanje AI odgovora – bez `await` da ne blokiramo
            (async () => {
                try {
                    const aiReply = await generateAIResponse(content, history);

                    // Sačuvaj AI odgovor kao poruku
                    const aiMessage = new Message({
                        conversation: conversationId,
                        sender: aiUser._id,
                        content: aiReply,
                        read: false
                    });
                    await aiMessage.save();

                    // Ažuriraj lastMessagePreview i unread za korisnika (pošto je AI poslao)
                    const conv = await Conversation.findById(conversationId);
                    conv.lastMessagePreview = {
                        content: aiReply,
                        timestamp: new Date()
                    };
                    // Povećaj unread za KORISNIKA (on još nije pročitao AI poruku)
                    const userUnread = conv.unreadCounts.get(userId.toString()) || 0;
                    conv.unreadCounts.set(userId.toString(), userUnread + 1);
                    await conv.save();

                    // Pripremi podatke za AI poruku
                    const aiMessageData = {
                        _id: aiMessage.id,
                        sender: {
                            _id: aiUser.id.toString(),
                            username: aiUser.username,
                            isAI: true // flag za frontend
                        },
                        content: aiReply,
                        createdAt: aiMessage.createdAt,
                        read: false
                    };

                    // Emituj AI poruku u istu sobu
                    io.to(room).emit("conversation:new-message", {
                        conversationId: conversationId,
                        message: aiMessageData,
                    });

                    // Emituj ažuriranje konverzacije (sa novim lastMessage i unread)
                    io.to(room).emit("conversation:update-conversation", {
                        conversationId: conversationId,
                        lastMessage: conv.lastMessagePreview,
                        unreadCounts: {
                            [userId.toString()]: conv.unreadCounts.get(userId.toString()) || 0,
                            [friendId.toString()]: conv.unreadCounts.get(friendId.toString()) || 0
                        }
                    });

                } catch (aiError) {
                    console.error("AI response generation failed:", aiError);
                    socket.emit("conversation:ai-error", { error: "AI failed to respond" });
                }
            })(); // Izvršavamo odmah, asinhrono
        }
        // =========================================================

    } catch (error) {
        console.error("Error sending message", error);
        socket.emit("conversation:send-message:error", { error: "Error sending message" });
    }
};
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

export const startAiConversation = async (io, socket) => {
    try {
        const userId = socket.userId;

        // ---- PRONAĐI ILI KREIRAJ AI KORISNIKA ----
        let aiUser = await User.findOne({ isAI: true });

        if (!aiUser) {
            console.warn("⚠️ Chatty AI not found in DB – creating one now...");
            aiUser = await User.create({
                name: "Chatty AI",
                isAI: true,
                avatar: "https://i.pravatar.cc/150?img=3",
                // Dodaj obavezna polja ako tvoj model zahteva:
                // username: "chatty_ai",
                // fullName: "Chatty AI",
                // connectCode: "CHATTY_AI_" + Date.now(),
            });

        } else {
            return aiUser; 
        }

        // ---- KREIRAJ ILI PRONAĐI KONVERZACIJU ----
        let conversation = await Conversation.findOne({
            participants: { $all: [userId, aiUser._id] },
            isAiChat: true
        });

        if (!conversation) {
            conversation = await Conversation.create({
                participants: [userId, aiUser._id],
                isAiChat: true
            });
           
        } else {
            return conversation;
        }

        // ---- SOCKET ROOM ----
        const room = getChatRoom(userId.toString(), aiUser._id.toString());
        socket.join(room);

        // ---- ODGOVOR KLIJENTU ----
        socket.emit("conversation:start-ai:success", {
            conversationId: conversation._id.toString(),
            aiUser: {
                id: aiUser._id,
                username: aiUser.username || "Chatty AI",
                fullName: aiUser.fullName || "Chatty AI",
                avatar: aiUser.avatar || "https://i.pravatar.cc/150?img=3",
                online: true
            }
        });

    } catch (error) {
        console.error("❌ Error starting AI conversation:", error);
        socket.emit("conversation:start-ai:error", {
            error: "Failed to start AI chat. Please try again."
        });
    }
};