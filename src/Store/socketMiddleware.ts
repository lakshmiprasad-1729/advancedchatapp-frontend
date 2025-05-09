import { Middleware } from "@reduxjs/toolkit";

import { addRoom,removeRoom , addChats ,initSocket, createaNewChat, addNewChat } from './socketUser.ts'
import { addChat,removeChat,addMessage, sendMessage, getChat, addMessages, getMessages } from './chatSlice.ts'
import { SocketInterface } from "@/socket/socket.ts";
import { searchChats,addSearchChats } from "./searchChats.ts";
import { initiateCall , recieveCall , callAccepted  , setCallEnded, sendAnswer, recieveAnswer } from "./peerSlice.ts";
import CreateSocketConnection from "@/socket/socket.ts";


enum SocketEvents {
    connect="connect",
    disconnect="disconnect",

    //messages
    sendMessage="create-message",
    recieveMessage="new-message",
    fetchMessages="fetch-messages",
    recieveMessages="recieve-messages",

    //contacts
    recieveContacts = "get-chats",
    fetchChats="fetch-chats",

    //chat-recieve and creation
    newChat = "new-chat",
    createChat = "create-chat",

    //rooms
    joinRoom = "join-room",
    joined = "joined",
    leaveRoom = "leave-room",

    //searching
    search = "search",
    searchChats = "search-chats",

    //get a single chat
    fetchAChat ="fetch-a-chat",
    recieveChat = "recieve-chat",


    //video-call

    initiateCall ="initiate-call",
    recieveCall ="recieve-call",
    sendAns ="send-answer",
    recieveAns="recieve-answer"

}


const socketMiddleware : Middleware = (store) =>{
    let socket:SocketInterface;

    const setUpSocketListeners=()=>{

        if(!socket) return;
        
        socket.socket.on(SocketEvents.connect,()=>{
            console.log(" socket is connected");
        })

        
    socket.socket.on(SocketEvents.disconnect,()=>{
        console.log(" socket is dis connected");
    })

    socket.socket.on(SocketEvents.recieveMessage,(data)=>{
        store.dispatch(addMessage(data));
    })

    socket.socket.on(SocketEvents.recieveContacts,(data)=>{
        store.dispatch(addChats(data));
    })

    socket.socket.on(SocketEvents.newChat,(data)=>{
        // store.dispatch(addChat(data));
        store.dispatch(addNewChat(data));
    })

    socket.socket.on(SocketEvents.joined,(data)=>console.log(data));

    socket.socket.on(SocketEvents.searchChats,(data)=>{
        store.dispatch(addSearchChats(data));
    })

    socket.socket.on(SocketEvents.recieveChat,(data)=>{
        store.dispatch(addChat(data));
    })

    socket.socket.on(SocketEvents.recieveMessages,(data)=>{
        store.dispatch(addMessages(data));
    })


    socket.socket.on(SocketEvents.recieveCall,(data)=>{
        console.log(data);
        store.dispatch(recieveCall(data));
    })

    socket.socket.on(SocketEvents.recieveAns,data=>{
        store.dispatch(recieveAnswer(data))
    })
    }

    return (next)=>(action)=>{
        if(initSocket.match(action)){
            
            if (!socket && typeof window !== 'undefined') {
                socket = CreateSocketConnection.Create();

                setUpSocketListeners();
                console.log("socket created");
            }
        }

        

        if(addRoom.match(action) && socket){
            let room = action.payload;
           socket.socket.emit(SocketEvents.joinRoom,room);
        }


        //chats

        if(addChats.match(action) && socket){
            let chats = action.payload;
             if(chats.length === 0){
                socket.socket.emit(SocketEvents.fetchChats,action.payload);
             }
        }

        if(getChat.match(action) && socket){
            let participantid = action.payload;
            console.log("getting chat for",participantid);
            
            socket.socket.emit(SocketEvents.fetchAChat,participantid)
        }
        
        if(createaNewChat.match(action) && socket){
            socket.socket.emit(SocketEvents.createChat,action.payload);
        }

        if( searchChats.match(action) && socket){
            socket.socket.emit(SocketEvents.search,action.payload);
        }

        if(removeChat.match(action) && socket){
            socket.socket.emit(SocketEvents.leaveRoom,action.payload);
            store.dispatch(removeChat(action.payload));
            store.dispatch(removeRoom(action.payload));
        }

        //messages

        if(getMessages.match(action) && socket){
            console.log("getting messages for",action.payload);
            socket.socket.emit(SocketEvents.fetchMessages,action.payload);
            
        }


        if(sendMessage.match(action) && socket){
            socket.socket.emit(SocketEvents.sendMessage,action.payload);
        }



        //video call 

       if(initiateCall.match(action) && socket){
            socket.socket.emit(SocketEvents.initiateCall,action.payload);
       }

       if(sendAnswer.match(action) && socket){
        socket.socket.emit(SocketEvents.sendAns,action.payload);
       }





       next(action);
    }
}


export default socketMiddleware;
