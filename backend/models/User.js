import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    connectCode: {
        type: String,
        required: function() {
            return !this.isAI;
        },
        unique: true,
        index: true
    },
    fullName : {
        type: String,
        required: function() {
            return !this.isAI;
        },
        trim : true,
        minLength: 3,
        maxLength: 30,
    },
    username: {
        type: String,
        required: function() {
            return !this.isAI;
        },
        minLength: 3,
        maxLength: 30,
        unique: true
    },
    email: {
        type: String,
        required: function() {
            return !this.isAI;
        },
        unique: true,
        trim: true,
        lowercase: true,
    },
    password: {
        type: String,
        required: function() {
            return !this.isAI;
        },
        minLength: 6,

    },
    isAI: {
        type: Boolean,
        default: false

    }
})

export default mongoose.model("User", userSchema)