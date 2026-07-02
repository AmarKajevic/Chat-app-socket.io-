import React from "react";
import ChatWindow from "../../components/ChatWindow/ChatWindow";
import Sidebar from "../../components/Sidebar/Sidebar";
import { SocketProvider } from "../../context/SocketContext";
import { useConversationStore } from "../../stores/conversationStore";

const Chat = () => {
  const { selectedConversation } = useConversationStore();

  return (
    <SocketProvider>
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
    </SocketProvider>
  );
};

export default Chat;
