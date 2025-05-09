import { User } from "@/axios/interfaces";
import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";





interface counterState{
    rooms:string[],
    chats:User[]
}

const initialState:counterState={
    rooms:[],
    chats:[]
}

const socketUser = createSlice({
    name:"socketUser",
    initialState,
    reducers:{
        initSocket:(state)=>{
         return state;
        },
        addRoom:(state,action:PayloadAction<string>)=>{
            state.rooms.push(action.payload);
        },
        removeRoom:(state,action:PayloadAction<string>)=>{
            state.rooms = state.rooms.filter((room)=>room != action.payload)
        },
        addChats:(state,action:PayloadAction<User[] >)=>{
            state.chats = action.payload;
        },
        createaNewChat:(state,action:PayloadAction<string>)=>{
            return state;
        },
        addNewChat:(state,action:PayloadAction<User>)=>{
            let prev = state.chats;
            let chats = prev.filter(chat=> chat._id != action.payload._id);

            state.chats = [action.payload,...chats];
        }
    }
})


export const { addRoom,removeRoom , addChats,initSocket ,createaNewChat,addNewChat} = socketUser.actions;

export default socketUser.reducer;