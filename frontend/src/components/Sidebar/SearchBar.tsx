import { Search } from 'lucide-react'
import { useConversationsContext } from '../../context/ConversationsContext'

const SearchBar = () => {

  const{searchTerm, setSearchTerm} = useConversationsContext()
  return (
    <div className='p-4 relative bg-sky-500 '>
        <input
            type='text'
            placeholder='Search conversations'
            className='w-full text-sm bg-sky-500 text-white placeholder-blue-200 rounded-full py-2 px-4 pl-10 foucs:ouline-none foucs:ring-2 focus:ring-blue-200'
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}

        />
        <Search className='absoulte size-4 text-blue-200 ml-3  translate-y-[-150%]'/>
      
    </div>
  )
}

export default SearchBar
