import { Route, Routes} from "react-router"
import Auth from "./pages/Auth/Auth"
import Chat from "./pages/Chat/Chat"
import {Toaster} from "sonner"
import { GuestRoute, PrivateRoute } from "./pages/PageGurads"

const App =() => {


  return (
    <>
     <Routes>
      <Route element={<PrivateRoute/>}>
        <Route path="/" element={<Chat/>}/>
      </Route>
       <Route element={<GuestRoute/>}>
        <Route path="/auth" element={<Auth/>}/>
       </Route>
       
     </Routes>
     <Toaster/>
    </>
  )
}

export default App
