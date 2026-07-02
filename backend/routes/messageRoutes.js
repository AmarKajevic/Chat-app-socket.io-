import express from "express"
import authMiddleware from "../middlewares/authMiddleware.js"
import messageController from "../controllers/messageController.js"



const router = express.Router()

router.get("/:conversationId/messages", authMiddleware, messageController.getMessages)

export default router;