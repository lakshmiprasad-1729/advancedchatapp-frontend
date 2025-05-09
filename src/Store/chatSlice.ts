import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { Message,Chat, User, imageData } from "@/axios/interfaces";



interface counterState{
    chatdetails:Chat | undefined,
    userDetails:User | undefined,
    Messages:Message[] ,

}

interface sendmessage{
    chatid:string,
    message:string,
    imageDetails: imageData | null
}

const initialState:counterState={
    chatdetails:undefined,
    userDetails:undefined,
    Messages:[]
}

export const chatSlice = createSlice({
    name:'chat',
    initialState,
    reducers:{
        addChat:(state,action:PayloadAction<Chat>)=>{
                    state.chatdetails = action.payload;
        },
        getChat:(state,action:PayloadAction<string>)=>{
              return state;
        },
        removeChat:(state,action:PayloadAction<string>)=>{
            state.chatdetails = undefined;
            state.Messages = [];
            state.userDetails = undefined;
        },
        addMessage:(state,action:PayloadAction<Message>)=>{
            state.Messages.push(action.payload);
        },
        sendMessage:(state,action:PayloadAction<sendmessage>)=>{
            return state;
        },
        addMessages:(state,action:PayloadAction<Message[] >)=>{
            state.Messages = action.payload;
        },
        getMessages:(state,action:PayloadAction<string>)=>{
            return state;
        },
        addUserDetails:(state,action:PayloadAction<User>)=>{
            state.userDetails = action.payload;
        }

    }

})


export const { addChat,removeChat,addMessage,sendMessage,getChat,addMessages,getMessages ,addUserDetails} = chatSlice.actions;

export default chatSlice.reducer;