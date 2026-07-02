import React from "react";
import { useConversationsContext } from "../../context/ConversationsContext";
import ConversationItem from "./ConversationItem";

const Conversations = () => {
  const { filteredConversations, isLoading, isError } =
    useConversationsContext();
  if (isLoading) {
    <div className="flex-1 h-full items-center justify-center">
      <div className="size-10 bg-sky-200 rounded-full animate-bounce"></div>
    </div>;
  }
  if(isError) {
    return <div>Something went wrong</div>
  }

  return <div className="flex-1 overflow-y-auto">
    {filteredConversations.map((conversations) => <ConversationItem key={conversations.conversationId} {...conversations}/>)}
  </div>
};

export default Conversations;
