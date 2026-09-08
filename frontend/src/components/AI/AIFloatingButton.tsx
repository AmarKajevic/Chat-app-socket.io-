// components/AI/AIFloatingButton.tsx
import { Bot } from "lucide-react";
import { createPortal } from "react-dom";
import { useConversationsContext } from "../../context/ConversationsContext";
import { useConversationStore } from "../../stores/conversationStore";
import { useAuthStore } from "../../stores/authStore";
import { useEffect, useState } from "react";

const AIFloatingButton = () => {
  const { startAIConversation } = useConversationsContext();
  const { selectedConversation } = useConversationStore();
  const { user } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // 🔥 SAKRUJ kada je BILO KOJA konverzacija selektovana (ne samo AI)
  const isConversationOpen = !!selectedConversation;
  
  if (!user || isConversationOpen || !mounted) return null;

  const button = (
    <button
      onClick={startAIConversation}
      className="bg-sky-500 hover:bg-sky-600 text-white rounded-full p-4 shadow-lg transition-all duration-200 hover:scale-110 flex items-center justify-center"
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 99999,
        border: 'none',
        cursor: 'pointer',
        width: '56px',
        height: '56px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      }}
      aria-label="Chat with AI"
    >
      <Bot size={28} />
    </button>
  );

  return createPortal(button, document.body);
};

export default AIFloatingButton;