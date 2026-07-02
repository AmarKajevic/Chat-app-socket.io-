import express from "express"
import authMiddleware from "../middlewares/authMiddleware.js"
import ConversationController from "../controllers/conversationController.js"


const router = express.Router()

router.get("/check-connect-code", authMiddleware, ConversationController.checkConnectCode)
router.get("/", authMiddleware, ConversationController.getConversation)

export default router;