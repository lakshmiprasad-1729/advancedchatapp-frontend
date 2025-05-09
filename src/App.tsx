import  { useState, useEffect } from "react";
import {
  ChatHeader,
  ChatMessage,
  InputComp,
  Sidebar
} from './react-components/index.ts';
import { useAppSelector,useAppDispatch } from "./Store/hooks.ts";
import { initSocket,addRoom } from "./Store/socketUser.ts";
import ApiRequests from "./axios/axios.ts";
import { authLogin } from "./Store/authentication.ts";
import { useNavigate } from "react-router-dom";
import { User } from "./axios/interfaces.ts";
import { getMessages } from "./Store/chatSlice.ts";




export default function ChatApp() {
  const [input, setInput] = useState<string>("");
  const [typing, setTyping] = useState<boolean>(false);

  const navigate = useNavigate();


  const darkMode = useAppSelector(state=>state.auth.darkMode);
  const dispatch = useAppDispatch();

  useEffect(()=>{
      let user;
     (async()=>{
        try {
          user = await ApiRequests.userDetails();
          if( user?.data?.statuscode == 200 ){
            dispatch(authLogin(user.data.data))
          }
          else{
            navigate('/login');
          }
        } catch (error) {
          console.log("error while getting user details in app.tsx");
        }
      })()
      

    dispatch(initSocket());
  },[])


  const userDetails:User | undefined = useAppSelector(state=>state.auth.user);

  useEffect(()=>{
    console.log(userDetails)
    if( userDetails){
      dispatch(addRoom(userDetails._id.toString()));
    }
  },[userDetails])
   

  const chatDetails = useAppSelector(state=>state.chat.chatdetails);

  const messages = useAppSelector(state=>state.chat.Messages);

  const chatUser = useAppSelector(state=>state.chat.userDetails);

  const recievingcall = useAppSelector(state=>state.peer.recievedCall);



  useEffect(()=>{
       if(chatDetails){
        dispatch(getMessages(chatDetails._id));
        dispatch(addRoom(chatDetails._id));
       }
  },[chatDetails])


  
  

  useEffect(() => {
    if (typing) {
      const timer = setTimeout(() => setTyping(false), 2000);
      return () => clearTimeout(timer);
    }

   
  }, [typing]);

 

 

  return (
    <div
      className={`flex h-screen w-full font-sans transition-all duration-500 ease-in-out flex-col md:flex-row ${
        darkMode
          ? "bg-[#0f0f1a] text-white"
          : "bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white"
      }`}
    >
      {/* Sidebar */}
     
     <Sidebar/>

      {/* Chat Area */}
     {
       chatDetails ?(
        <div className="flex-1  flex-col hidden sm:flex">
        {/* Header */}
       <ChatHeader user={chatUser}/>

        {/* Messages */}
        <div
          className={`flex-1 overflow-y-auto px-6 py-6 space-y-4 ${
            darkMode ? "bg-[#0e0e1a]" : "bg-[#0e0e1a]"
          }`}
        >
          {messages.map((msg) => (
           <ChatMessage key={msg._id}  msg={msg}/>
          ))}
          {typing && (
            <div className="text-sm text-gray-400 italic animate-pulse">Alice is typing...</div>
          )}
        </div>

        {/* Input */}
        <InputComp/>
       
      </div>
      ):(
          <div className="w-full h-full bg-black hidden lg:flex">
            </div>
      )
     }




      {/* Video Call Modal */}
      {/* {videoCall && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <Card className="w-96 border border-transparent bg-clip-padding border-gradient-to-r from-indigo-600 to-purple-600 shadow-2xl">
            <CardContent className="p-6 flex flex-col gap-4 bg-[#1e1e2f] rounded-2xl">
              <h2 className="text-xl font-bold text-indigo-300">Video Call with Alice</h2>
              <div className="bg-indigo-900 h-48 rounded-lg flex items-center justify-center text-indigo-300 font-semibold">
                Live Video Stream
              </div>
              <Button onClick={() => setVideoCall(false)} variant="destructive">
                End Call
              </Button>
            </CardContent>
          </Card>
        </div>
      )} */}

      <div className={`fixed top-0 left-0 w-[100dvw] ${recievingcall?"flex":"hidden"} justify-center`}>
         <div className="w-[20rem] flex justify-between bg-gray-800 p-[1rem] rounded-2xl">
             <button onClick={()=>navigate("/video-call")} className="p-[1rem] h-[3rem] rounded-xl bg-green-700 cursor-pointer hover:scale-[1.1]"> accept</button>
             <button className="p-[1rem] h-[3rem] rounded-xl bg-red-700 "> decline</button>
         </div>
      </div>
    </div>

  );
}
