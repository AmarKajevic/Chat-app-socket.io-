// pages/Chat/Chat.tsx
import ChatWindow from "../../components/ChatWindow/ChatWindow";
import Sidebar from "../../components/Sidebar/Sidebar";
import { SocketProvider } from "../../context/SocketContext";
import { ConversationsProvider } from "../../context/ConversationsContext";
import { useConversationStore } from "../../stores/conversationStore";
import AIFloatingButton from "../../components/AI/AIFloatingButton";

const Chat = () => {
  const { selectedConversation } = useConversationStore();

  return (
    <SocketProvider>
      <ConversationsProvider>
        <div className="flex flex-col sm:flex-row min-h-screen">
          <div
            className={`
              w-full sm:w-1/3 sm:max-w-[456px]
              ${selectedConversation ? "hidden" : "block"} sm:block
            `}
          >
            <Sidebar />
          </div>
          <div
            className={`
              ${selectedConversation ? "flex" : "hidden"} sm:flex
              flex-1
            `}
          >
            <ChatWindow />
          </div>
        </div>
        {/* AIFloatingButton je i dalje unutar ConversationsProvider */}
        <AIFloatingButton />
      </ConversationsProvider>
    </SocketProvider>
  );
};

export default Chat;