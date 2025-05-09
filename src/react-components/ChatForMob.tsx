import React, { useEffect, useState } from 'react'
import ChatHeader from'./ChatHeader.tsx'
import ChatMessage from './ChatMessage.tsx'
import InputComp from './InputComp.tsx'
import { useNavigate } from "react-router-dom";
import { Message } from '@/App.tsx';
import { useAppSelector } from '@/Store/hooks.ts';

function ChatForMob() {

   const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState<string>("");
   
    // const [videoCall, setVideoCall] = useState<boolean>(false);
    const [typing, setTyping] = useState<boolean>(false);
    const darkMode = useAppSelector(state=>state.auth.darkMode);
    const navigate = useNavigate();

    useEffect(()=>{

        if( window.innerWidth > 620) navigate('/');
    },[])
  return (
    <div className="flex-1  flex-col flex h-[100dvh]">
           {/* Header */}
          <ChatHeader/>
   
           {/* Messages */}
           <div
             className={`flex-1 overflow-y-auto px-6 py-6 space-y-4 ${
               darkMode ? "bg-[#0e0e1a]" : "bg-[#0e0e1a]"
             }`}
           >
             {messages.map((msg) => (
              <ChatMessage  msg={msg}/>
             ))}
             {typing && (
               <div className="text-sm text-gray-400 italic animate-pulse">Alice is typing...</div>
             )}
           </div>
   
           {/* Input */}
           <InputComp/>
          
         </div>
  )
}

export default ChatForMob