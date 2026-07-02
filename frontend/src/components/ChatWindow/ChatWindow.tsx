
import ChatPlaceholder from './ChatPlaceholder'
import { useConversationStore } from '../../stores/conversationStore'
import ChatHeader from './ChatHeader'
import MessageList from './MessageList'
import MessageInput from './MessageInput'

const ChatWindow = () => {

  const {selectedConversation} = useConversationStore()
  return (
    <div className='min-h-screen max-h-screen w-full bg-white flex flex-col justify-between'>
      {selectedConversation && <ChatHeader/>}
      {selectedConversation && <MessageList/>}
      {!selectedConversation && <ChatPlaceholder/>}
      {selectedConversation && <MessageInput/>}

    </div>
  )
}

export default ChatWindow
