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
    },
    isAiChat : {
        type: Boolean,
        default: false
    }

}, {timestamps: true})

conversationSchema.index({"participants.0": 1, "participants.1": 1}, {unique: true})
conversationSchema.pre("save", async function() {
    if(this.participants && this.participants.length === 2) {
        this.participants = this.participants.map(p => p.toString()).sort();
    }
    if(this.isNew) {
        const User = mongoose.model("User");
        const participants = await User.find({
            _id: { $in: this.participants },
            isAI: true
        })
        if(participants.length === 1) {
            this.isAiChat = true;
        }
    }

})
export default mongoose.model("Conversation", conversationSchema)