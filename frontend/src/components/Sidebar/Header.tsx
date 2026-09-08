import { Contact, Settings, Bot } from 'lucide-react'  // dodajemo Bot ikonu
import { useState } from 'react'
import AddConversationModal from './AddConversationModal'
import { useConversationsContext } from '../../context/ConversationsContext' // importujemo kontekst

const Header = () => {
    const [isOpen, setIsOpen] = useState(false)
    const { startAIConversation } = useConversationsContext()  // uzimamo funkciju

    return (
        <div className='p-4 bg-sky-500 text-white flex items-center justify-between'>
            <h1 className='text-xl font-bold'>Messages</h1>
            <div className='flex space-x-3'>
                {/* Dugme za dodavanje prijatelja (postojeće) */}
                <button onClick={() => setIsOpen(true)} className='p-2 rounded-full cursor-pointer'>
                    <Contact className='size-[16px]'/>
                </button>

                {/* NOVO: Dugme za pokretanje AI chata */}
                <button 
                    onClick={startAIConversation} 
                    className='p-2 rounded-full cursor-pointer hover:bg-sky-600 transition'
                    title="Chat with AI"  // opcioni tooltip
                >
                    <Bot className='size-[16px]'/>
                </button>

                {/* Dugme za podešavanja (postojeće) */}
                <button className='p-2 rounded-full cursor-pointer'>
                    <Settings className='size-[16px]'/>
                </button>
            </div>
            <AddConversationModal isOpen={isOpen} onClose={() => setIsOpen(false)}/>
        </div>
    )
}

export default Header