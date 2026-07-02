import React from 'react'

const TypingIndicator = () => {
  return (
    <div className="flex">
        <img 
        src="https://i.pravatar.cc/150"
         alt="User"
          className="size-8 rounded-full object-cover"/>
          <div className="bg-white p-3 rounded-2xl flex items-center ">
            <div className="size-2 bg-gray-400 rounded-full mr-1 animate-bounce" style={{animationDelay: '0s'}}></div>
            <div className="size-2 bg-gray-400 rounded-full mr-1 animate-bounce" style={{animationDelay: '0.2s'}}></div>
            <div className="size-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></div>

          </div>
      
    </div>
  )
}

export default TypingIndicator
