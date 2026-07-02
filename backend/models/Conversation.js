import mongoose from "mongoose";

const conversationSchema = mongoose.Schema({
    participants: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    }],
    lastMessage: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Message"
    },
    lastMessagePreview: {
        content: String,
        timestamp: Date
    },
    unreadCounts: {
        type: Map,
        of: Number,
        default: {}
    }
}, {timestamp: true})

conversationSchema.index({"participants.0": 1, "participants.1": 1}, {unique: true})
conversationSchema.pre("save", function() {
    if(this.participants && this.participants.length === 2) {
        this.participants = this.participants.map(p => p.toString()).sort();
    }

})
export default mongoose.model("Conversation", conversationSchema)