import type { Message } from "../../services/messageService"
import { useAuthStore } from "../../stores/authStore"


const MessageItem = ({sender, content,  createdAt}: Message) => {
    const {user} = useAuthStore()
    const userIsSender = sender._id === user?.id;

    const created = new Date(createdAt)
    const now = new Date();

    const diffInMs = now.getTime() - created.getTime();
    const diffInDays = diffInMs / (1000 * 60 * 60 *24)

    const time = created.toLocaleTimeString([] ,{
        hour: "2-digit",
        minute: "2-digit"
    })

    const date = created.toLocaleDateString([], {
        year: "numeric",
        month: "short",
        day: "numeric"
    })


    const displayTime = diffInDays > 1 ? `${date} `: time;

    if(userIsSender) {
        return <div className="flex justify-end mb-4">
            <div className="bg-sky-500 text-white p-3 max-w-xs lg:max-w-md rounded-2xl">
                <p className="text-sm">{content}</p>
                <span className="text-xs flex items-center gap-1 text-blue-100 mt-1">{displayTime}</span>
            </div>
        </div>
    }
  return (
   <div className="flex  mb-4">
    <img src="https://i.pravatar.cc/150?u=123" 
    alt={sender.username}
    className="size-8 rounded-full object-cover mr-2"
    />
            <div className="bg-white p-3 max-w-xs lg:max-w-md rounded-2xl">
                <p className="text-sm">{content}</p>
                <span className="text-xs flex items-center gap-1 text-gray-600 mt-1">{displayTime}</span>
            </div>
        </div>
  )
}

export default MessageItem
