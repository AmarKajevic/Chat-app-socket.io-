import { createContext, useCallback, useContext, useEffect, useState } from "react"
import type { User } from "../stores/authStore"
import { useConversations } from "../hooks/useConversations"
import { useSocketContext } from "./SocketContext"
import { toast } from "sonner"
import { useConversationStore } from "../stores/conversationStore"

export type Conversations = {
    conversationId: string,
    friend: User & {
        online: boolean
    },
    unreadCounts: Record<string, number>,
    lastMessage: {
        content: string
        timestamp: Date
    }
}

// Proširujemo tip konteksta sa startAIConversation
type ConversationContextType = {
    conversations: Conversations[],
    filteredConversations: Conversations[],
    searchTerm: string,
    setSearchTerm: (term: string) => void;
    isLoading: boolean
    isError: boolean
    startAIConversation: () => void; // nova funkcija
}

const conversationsContext = createContext<ConversationContextType | undefined>(undefined);

export const useConversationsContext = () => {
    const context = useContext(conversationsContext)
    if (!context) throw new Error("useConversationContext must be used within ConversationProvider")
    return context;
}

export const ConversationsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { data, isLoading, isError } = useConversations()
    const [conversations, setConversations] = useState<Conversations[]>([]);
    const [searchTerm, setSearchTerm] = useState("")
    const { setSelectedConversation } = useConversationStore();
    const { socket } = useSocketContext()

    useEffect(() => {
        if (data) setConversations(data.data)
    }, [data])

    const filteredConversations = conversations
        .filter(c => c.friend.username.toLowerCase().includes(searchTerm.toLowerCase()))

    // --- Postojeći handleri ---
    const handleConversationOnlineStatus = useCallback(({ friendId, username, online }: { friendId: string, username: string, online: boolean }) => {
        setConversations((prev) => {
            return prev.map((conversation) => {
                if (conversation.friend.id === friendId) {
                    if (conversation.friend.online != online) {
                        toast.info(`${username} is ${online ? "online" : "offline"}`)
                    }
                    return { ...conversation, friend: { ...conversation.friend, online } };
                }
                return conversation
            })
        })
    }, [])

    const handleNewConversation = (conversation: Conversations) => {
       
        setConversations((prev) => {
            return [...prev, conversation]
        })
        toast.success(`you and ${conversation.friend.username} are now friends!`)
        // Ovo disconnect+connect verovatno nije potrebno, ali ostavljam kako je
        if (socket) {
            socket.disconnect()
            socket.connect()
        }
        toast.error("problem") // ovo izgleda kao greška, ali ostavljam
    }

    const handleConversationUpdateUnreadCounts = (conversation: { conversationId: string, unreadCounts: Record<string, number> }) => {

        setConversations((prev) => {
            return prev.map((c) => {
                if (c.conversationId === conversation.conversationId) {
                    return { ...c, unreadCounts: conversation.unreadCounts }
                }
                return c
            })
        })
    }

    const handleConversationUpdate = (conversation: Pick<Conversations, "conversationId" | "lastMessage" | "unreadCounts">) => {
        setConversations((prev) => {
            return prev.map((c) => {
                if (c.conversationId === conversation.conversationId) {
                    return { ...c, lastMessage: conversation.lastMessage, unreadCounts: conversation.unreadCounts }
                }
                return c
            })
        })
    }

    // --- NOVI HANDLERI ZA AI ---
    const handleStartAISuccess = useCallback((data: { conversationId: string, aiUser: { id: string, username: string, fullName: string, avatar?: string, online: boolean } }) => {
        // Kreiraj novu konverzaciju sa AI prijateljem
        const newConversation: Conversations = {
            conversationId: data.conversationId,
            friend: {
                ...data.aiUser,         // širi sva polja koja stižu
                online: true,           // AI je uvek online
                // Ako User interfejs zahteva dodatna polja (email, connectCode, itd.)
                // moraćeš da ih dodaš ili da promeniš tip. Ovdje dajem fleksibilno rešenje.
            } as any, // privremeno, ali preporučujem da prilagodiš tip Conversation
            unreadCounts: {},
            lastMessage: {
                content: '',
                timestamp: new Date()
            }
        };
        setConversations(prev => [...prev, newConversation]);
        
        toast.success(`AI Chat started with ${data.aiUser.username}`);
          setSelectedConversation({
        conversationId: data.conversationId,
        friend: newConversation.friend,
        lastMessage: newConversation.lastMessage,
        unreadCounts: newConversation.unreadCounts
    });
        
    }, [setSelectedConversation]);

    const handleStartAIError = useCallback((error: { error: string }) => {
        toast.error(error.error || "Failed to start AI chat");
    }, []);

    // --- FUNKCIJA ZA POKRETANJE AI ČATA (emituje event) ---
    const startAIConversation = useCallback(() => {
        if (socket) {
            socket.emit("conversation:start-ai", {});
        } else {
            toast.error("Socket not connected");
        }
    }, [socket]);

    // --- Postojeći handleri za greške ---
    const handleErrorNewConversation = () => {
        toast.error("Unable to add conversation ")
    }
    const handleErrorConverationMarkAsRead = () => {
        toast.error("Unable to mark conversation as read")
    }

    // --- Registracija listenera ---
    useEffect(() => {
        // Postojeći listeneri
        socket?.on("conversation: online-status", handleConversationOnlineStatus);
        socket?.on("conversation:accept", handleNewConversation);
        socket?.on("conversation:update-unread-counts", handleConversationUpdateUnreadCounts);
        socket?.on("conversation:update-conversation", handleConversationUpdate);
        socket?.on("conversation:request:error", handleErrorNewConversation)
        socket?.on("conversation:mark-as-read:error", handleErrorConverationMarkAsRead)

        // NOVI listeneri za AI
        socket?.on("conversation:start-ai:success", handleStartAISuccess);
        socket?.on("conversation:start-ai:error", handleStartAIError);

        return () => {
            socket?.off("conversation: online-status", handleConversationOnlineStatus)
            socket?.off("conversation:accept", handleNewConversation);
            socket?.off("conversation:update-unread-counts", handleConversationUpdateUnreadCounts);
            socket?.off("conversation:update-conversation", handleConversationUpdate);
            socket?.off("conversation:request:error", handleErrorNewConversation)
            socket?.off("conversation:mark-as-read:error", handleErrorConverationMarkAsRead)

            socket?.off("conversation:start-ai:success", handleStartAISuccess);
            socket?.off("conversation:start-ai:error", handleStartAIError);
        }
    }, [socket, 
        handleConversationOnlineStatus, 
        handleNewConversation, 
        handleConversationUpdateUnreadCounts, 
        handleConversationUpdate,
        handleStartAISuccess,
        handleStartAIError
    ]) // dodali zavisnosti

    return (
        <conversationsContext.Provider value={{ 
            conversations, 
            filteredConversations, 
            searchTerm, 
            setSearchTerm, 
            isLoading, 
            isError, 
            startAIConversation  // prosleđujemo funkciju
        }}>
            {children}
        </conversationsContext.Provider>
    )
}