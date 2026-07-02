import { create } from "zustand";
import type { Conversations } from "../context/ConversationsContext"

type ConversationState = {
    selectedConversation: Conversations | null,
    setSelectedConversation: (conversation: Conversations| null) => void;
}

export const useConversationStore = create<ConversationState>((set) => ({
    selectedConversation: null,
    setSelectedConversation: (conversation) => set({selectedConversation: conversation})
}))