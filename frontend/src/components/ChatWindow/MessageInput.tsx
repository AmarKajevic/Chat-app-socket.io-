import { Send } from "lucide-react";
import React, { useRef, useState } from "react";
import { useAuthStore } from "../../stores/authStore";
import { useConversationStore } from "../../stores/conversationStore";
import { useSocketContext } from "../../context/SocketContext";

const MessageInput = () => {
  const { user } = useAuthStore();
  const { selectedConversation } = useConversationStore();
  const { socket } = useSocketContext();
  const [message, setMessage] = useState("");

  const typingTimeoutRef = useRef<number | null>(null);
  const isTypingRef = useRef(false);

  const emitTyping = (isTyping: boolean) => {
    if(!socket || !user || !selectedConversation) return;

    socket.emit("conversation:typing", {
      friendId: selectedConversation.friend.id,
      userId: user.id,
      isTyping
    });

    isTypingRef.current = isTyping;
  };

  if (!selectedConversation) return;

  const handleSendMessage = () => {
    if (message.trim() === "" || !user || !socket) return;

    socket?.emit("conversation:send-message", {
      conversationId: selectedConversation.conversationId,
      userId: user.id,
      friendId: selectedConversation.friend.id,
      content: message.trim(),
    });

    setMessage("");

    if(isTypingRef.current) {
        emitTyping(false);
    }
  };

  const handleOnChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);

    if(!isTypingRef.current) {
        emitTyping(true);
    }

    if(typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = window.setTimeout(() => {
        emitTyping(false);
    }, 500);
  }
  return (
    <div className="p-4 border border-gray-200 bg-white">
      <div className="flex items-center ">
        <div className="flex-1">
          <textarea
            placeholder="Type a message..."
            className="w-full text-sm bg-gray-200 py-2 px-4 rounded-full focus:outline-none fouces:ring-2 focus:ring-sky-500 resize-none "
            value={message}
            onChange={(e) => handleOnChange(e)}
          />
        </div>
        <div className="ml-3">
          <button
            onClick={handleSendMessage}
            type="button"
            className="bg-sky-500 text-white rounded-full size-10 flex items-center justify-center hover:bg-sky-600 cursor-pointer"
          >
            <Send className="size-[16px]" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default MessageInput;
