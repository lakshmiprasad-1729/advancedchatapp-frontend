import { User } from "@/axios/interfaces"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toggleMode } from "@/Store/authentication"
import {  addUserDetails, getChat } from "@/Store/chatSlice"
import { useAppDispatch, useAppSelector } from "@/Store/hooks"
import { searchChats } from "@/Store/searchChats"
import { addChats, createaNewChat } from "@/Store/socketUser"
import { Sun,Moon } from "lucide-react"
import { useEffect, useState } from "react"



function Sidebar() {
  
  const [phoneno,setPhoneno] = useState<string>("");
  const darkMode = useAppSelector(state=>state.auth.darkMode);
  const [contacts,setContacts] = useState<User[]>([]);
  const  [toggle,setToogle] = useState<boolean>(true);
  const dispatch = useAppDispatch();

  const chats = useAppSelector(state=>state.socketUser.chats);
  const user = useAppSelector(state=>state.auth.user);

  const search = useAppSelector(state=>state.search.chats);

 useEffect(()=>{
   if( user && chats.length === 0){
    dispatch(addChats(chats));
   }
 },[user])

  useEffect(()=>{
    setContacts(chats);
    console.log("contacts",contacts);
  },[chats])
  
  function searchContacts(){
    setToogle(false);
    dispatch(searchChats(phoneno))
    setPhoneno("");

  }

  function createChat(participantid:string){
    dispatch(createaNewChat(participantid));
    setToogle(prev=>!prev);
  }


  function getChatinfo(contact:User){
     dispatch(getChat(contact._id));
     dispatch(addUserDetails(contact))
  }



  return (
    <div
        className={`w-full h-full sm:w-1/3 md:w-1/4 overflow-y-auto md:block ${
          darkMode ? "bg-[#1e1e2f]" : "bg-[#0d0d1f]"
        } p-6 shadow-xl backdrop-blur-2xl bg-opacity-80  border-white border-r rounded-none md:rounded-tr-3xl md:rounded-br-3xl transition-all`}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-extrabold tracking-wide text-white drop-shadow-xl">Contacts</h2>
          <Button variant="ghost" size="icon" onClick={() =>dispatch(toggleMode())}>
            {darkMode ? <Sun className="w-6 h-6 text-yellow-300" /> : <Moon className="w-6 h-6 text-white" />}
          </Button>
        </div>
        <div className="flex items-center justify-between mb-6">
        <Input
          placeholder="Search..."
          type="tel"
          value={phoneno}
          onChange={(e)=>setPhoneno(e.target.value)}
          className="mb-6 border-none focus:ring-0 rounded-xl bg-white/10 text-white placeholder-white backdrop-blur-md"
        />
       <Button variant="ghost" size="icon" onClick={() => searchContacts()}>
            search
          </Button>
        </div>
        <div className="space-y-4">
         {
          toggle?(
            contacts.map((contact) => (
              <div
                key={contact._id}
                onClick={()=>getChatinfo(contact)}
                className="p-4 rounded-2xl bg-[#26263f] text-white backdrop-blur-md shadow-md hover:bg-[#3c3c5c] hover:scale-[1.03] transition-all cursor-pointer"
              >
                {contact.name}
              </div>
            ))
          ):
          (
            search.map((user) => (
              <div
                key={user._id}
                onClick={()=>createChat(user._id)}
                className="p-4 rounded-2xl bg-[#26263f] text-white backdrop-blur-md shadow-md hover:bg-[#3c3c5c] hover:scale-[1.03] transition-all cursor-pointer"
              >
                {user.name}
              </div>
            ))
          )
         }
        </div>
      </div>
  )
}

export default Sidebar