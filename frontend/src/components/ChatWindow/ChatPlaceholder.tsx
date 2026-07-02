import { MessageCircle } from 'lucide-react'
import React from 'react'

const ChatPlaceholder = () => {
  return (
    <div className='min-h-screen bg-gray-50 flex flex-col items-center justify-center p-8 text-gray-500'>
        <MessageCircle className='size-16 mb-4 opacity-70'/>
        <h2 className='text-lg font-semibold'>Welcome to Chatty</h2>
        <p className='text-sm mt-2'>Selec a friend to chat to!</p>
      
    </div>
  )
}

export default ChatPlaceholder 

