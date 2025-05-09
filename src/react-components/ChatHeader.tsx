import { User } from "@/axios/interfaces";
import { Button } from "@/components/ui/button"
import { useAppDispatch, useAppSelector } from "@/Store/hooks"
import { toggleInitiateCall } from "@/Store/peerSlice";
import { Video } from "lucide-react"
import { useNavigate } from "react-router-dom";

function ChatHeader({user}:{user:User | undefined}) {

   const darkMode = useAppSelector(state=>state.auth.darkMode);

     const navigate = useNavigate();

     const dispatch = useAppDispatch();


    function videocall(){
      if(user){
        // dispatch(toggleInitiateCall(user?._id));
      navigate('/video-call');
      }
    }
  return (
    <div
             className={`flex items-center justify-between px-6 py-4 shadow-lg ${
               darkMode
                 ? "bg-[#1f1f2e] text-white border border-transparent bg-clip-padding border-gradient-to-r from-indigo-600 to-purple-600"
                 : "bg-[#12121c] text-white border border-transparent bg-clip-padding border-gradient-to-r from-indigo-600 to-purple-600"
             }`}
           >
             <h2 className="text-2xl font-bold">Chat with {user?user.name:"error"}</h2>
             <Button
               variant="default"
               className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-xl"
               onClick={() =>videocall()}
             >
               <Video className="w-5 h-5 mr-2" /> Video Call
             </Button>
           </div>
  )
}

export default ChatHeader