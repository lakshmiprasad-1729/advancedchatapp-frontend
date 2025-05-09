import { createSlice   } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit"


type SimplePeerSignalData = {
    type?: 'offer' | 'answer' | 'candidate';
    sdp?: string;
    candidate?: {
      candidate: string;
      sdpMLineIndex: number;
      sdpMid: string;
      usernameFragment?: string;
    };
    renegotiate?: boolean;
    transceiverRequest?: {
      kind: string;
      init?: RTCRtpTransceiverInit;
    };
  };

interface PeerState{
    remoteUserId:string | undefined,
    status:"connecting" | "connected" |undefined ,
    initiatedCall:boolean,
    recievedCall:boolean,
    callAccepted:boolean,
    callEnded:boolean,
    remoteDesc:SimplePeerSignalData | undefined | string
}

interface CallPayload{
    userid:string | undefined,
    signal:SimplePeerSignalData | string
}



const initialState:PeerState = {
    remoteUserId:undefined,
    status:undefined,
    initiatedCall:false,
    recievedCall:false,
    callAccepted:false,
    callEnded:false,
    remoteDesc:undefined
}


const peerSlice = createSlice({
    name:"peer",
    initialState,
    reducers:{
        initiateCall:(state,action:PayloadAction<CallPayload>)=>{
            state.remoteUserId = action.payload.userid;
            state.status = "connecting";
            state.initiatedCall = true;
        },
        recieveCall:(state,action:PayloadAction<CallPayload>)=>{
            state.remoteUserId = action.payload.userid;
            state.status = "connecting";
            state.recievedCall = true;
            state.remoteDesc = action.payload.signal;
        },
        callAccepted:(state,action:PayloadAction<boolean>)=>{
            state.callAccepted = action.payload;
            state.status = "connected";
        },
        setCallEnded:(state,action:PayloadAction<boolean>)=>{
            state.callEnded = action.payload;
            state.remoteUserId = undefined;
            state.status = undefined;
            state.initiatedCall = false;
            state.recievedCall = false;
            state.callAccepted = false;
        },
        toggleInitiateCall:(state,action:PayloadAction<string >)=>{
            state.remoteUserId = action.payload;
            state.initiatedCall = !state.initiatedCall;
        },
        toggleRecieveCall:(state)=>{
            state.recievedCall = !state.recievedCall;
        },
        recieveAnswer:(state,action:PayloadAction<SimplePeerSignalData>)=>{
            state.remoteDesc = action.payload;
        },
        sendAnswer:(state,action:PayloadAction<CallPayload>)=>{
            return state;
        }

    }
})



export const { initiateCall , recieveCall , callAccepted  , setCallEnded,toggleInitiateCall,toggleRecieveCall,recieveAnswer,sendAnswer } = peerSlice.actions;
export default peerSlice.reducer;