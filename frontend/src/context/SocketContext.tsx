import { createContext, useContext, useEffect, useState } from "react";
import {io, Socket} from "socket.io-client"
import { useAuthStore } from "../stores/authStore";
import { toast } from "sonner";


type SocketContextType ={
    socket: Socket | null;
}

const SocketContext = createContext<SocketContextType>({socket: null})

export const useSocketContext = () => {
    const context = useContext(SocketContext);
    if(!context) throw new Error("use socekt context must be used within a socketContexProvider")
        return context


}

export const SocketProvider: React.FC<{children: React.ReactNode}> = ({children}) => {
    const {user} = useAuthStore()
    const [socket, setSocket] = useState<Socket |null>(null)

    useEffect(() => {
        if(!user) return;

        const socketClient = io(import.meta.env.VITE_API_URL.replace("/api", ""), {
            withCredentials: true,
            reconnectionAttempts: 1
        })
        setSocket(socketClient)

        socketClient.on("connect", () => {
            console.log("socket connected", socketClient.id)
        })
        socketClient.on("connect_error", (error) => {
            console.error("connection error", error);
            toast.error("Socket connection error")
        })
         socketClient.on("internal_error", (error) => {
            console.error("connection error", error);
            toast.error("Socket connection error")
        })

        return () => {
            socketClient.disconnect();
            setSocket(null)
        }
    },[user])

    return <SocketContext.Provider value={{socket}}>
        {children}
    </SocketContext.Provider>

}
