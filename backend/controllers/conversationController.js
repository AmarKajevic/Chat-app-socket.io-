import Conversation from "../models/Conversation.js";
import Friendship from "../models/Friendship.js"
import User from "../models/User.js";
import RedisService from "../services/RedisService.js";

class ConversationController {
    static async checkConnectCode(req, res) {
        try {
            const userId = req.user._id;
            const{ connectCode} = req.query;

            const friend = await User.findOne({connectCode})

            if(!friend || friend._id.toString() === userId.toString()) {
                return res.status(400).json({message: "Invalid connect ID"})
            }
            const existingFriendship = await Friendship.findOne({
                $or: [
                    {requester: userId, recipient: friend._id},
                    {requester: friend._id, recipient: userId}
                ]
            })
            if(existingFriendship) {
                return res.status(400).json({message: "friendship already exist!"}

                )
            }

            res.json({success: true, message:"Connect ID is valid"})


            
        } catch (error) {
            console.error("Error checking connect code", error )
            res.status(500).json({message: "Internal server error!"})
        }
        
    }
static async getConversation(req, res) {
    try {
        const userId = req.user._id;

        const friendships = await Friendship.find({
            $or: [
                { requester: userId },
                { recipient: userId }
            ]
        }).populate([
            { path: 'requester', select: 'id fullName username connectCode' },
            { path: 'recipient', select: 'id fullName username connectCode' },
        ]).lean();

        if (!friendships.length) {
            return res.json({ data: [] });
        }

        // Dohvati sve konverzacije u kojima učestvuje userId
        const conversations = await Conversation.find({
            participants: { $all: [userId], $size: 2 }
        });

        // Napravi mapu: friendId -> conversation
        const conversationsMap = new Map();
        conversations.forEach((conversation) => {
            const friendId = conversation.participants.find(p => p.toString() !== userId.toString());
            if (friendId) {
                conversationsMap.set(friendId.toString(), conversation);
            }
        });

        // Formiraj podatke za svako prijateljstvo
        const conversationsData = await Promise.all(
            friendships.map(async (friendship) => {
                const isRequester = friendship.requester._id.toString() === userId.toString();
                const friend = isRequester ? friendship.recipient : friendship.requester;

                const conversation = conversationsMap.get(friend._id.toString());

                // Ako konverzacija ne postoji, vrati podrazumevane vrednosti
                if (!conversation) {
                    return {
                        conversationId: null,
                        lastMessage: null,
                        unreadCounts: {},
                        friend: {
                            id: friend._id.toString(),
                            username: friend.username,
                            fullName: friend.fullName,
                            connectCode: friend.connectCode,
                            online: false
                        }
                    };
                }

                return {
                    conversationId: conversation._id.toString(), // ili conversation.id
                    lastMessage: conversation.lastMessagePreview || null,
                    unreadCounts: {
                        [friendship.requester._id.toString()]: conversation.unreadCounts.get(friendship.requester._id.toString()) || 0,
                        [friendship.recipient._id.toString()]: conversation.unreadCounts.get(friendship.recipient._id.toString()) || 0,
                    },
                    friend: {
                        id: friend._id.toString(),
                        username: friend.username,
                        fullName: friend.fullName,
                        connectCode: friend.connectCode,
                        online: await RedisService.isUserOnline(friend._id.toString()),
                    }
                };
            })
        );

        res.json({ data: conversationsData });

    } catch (error) {
        console.error("Error fetching conversations", error);
        res.status(500).json({ message: "Internal server error!" });
    }
}
}

export default ConversationController