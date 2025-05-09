import { configureStore } from "@reduxjs/toolkit";
import authSlice from './authentication.ts'
import chatSlice from './chatSlice.ts'
import socketMiddleware from "./socketMiddleware.ts";
import socketUser from './socketUser.ts'
import searchSlice from './searchChats.ts'
import peerSlice from './peerSlice.ts'


export const store = configureStore({
    reducer:{
        auth:authSlice,
        chat:chatSlice,
        socketUser:socketUser,
        search:searchSlice,
        peer:peerSlice
    },
    middleware(getDefaultMiddleware) {
        return getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: ['chat/sendMessage'],
                ignoredPaths: ['chat.messages.imageDetails.buffer']
              },
        }).concat([socketMiddleware]);
      },
})


export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch