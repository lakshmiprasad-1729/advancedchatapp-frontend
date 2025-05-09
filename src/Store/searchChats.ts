import { createSlice } from "@reduxjs/toolkit";
import {  User } from "@/axios/interfaces.ts";
import type { PayloadAction } from "@reduxjs/toolkit";


interface counterState{
    chats:User[];
}

const initialState:counterState={
    chats:[]
}


const searchSlice = createSlice({
    name:"searchSlice",
    initialState,
    reducers:{
          addSearchChats:(state,action:PayloadAction<User[]>)=>{
            state.chats = [...action.payload]
          },
          searchChats:(state,action:PayloadAction<string>)=>{
            return state;
          }
    }
})

export const {addSearchChats,searchChats} = searchSlice.actions;

export default searchSlice.reducer;