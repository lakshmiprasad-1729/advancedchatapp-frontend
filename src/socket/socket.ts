import {io , Socket} from "socket.io-client"


export interface SocketInterface{
    socket:Socket
}


class SocketConnection implements SocketInterface{
    public socket:Socket;
   

    constructor(){
       this.socket = io("http://localhost:5500",{
        withCredentials: true,  
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        autoConnect: true,
        transports: ['websocket', 'polling'] 
      })
    }
}

let socketConnection:SocketInterface | undefined;


export default class CreateSocketConnection{
    public static Create():SocketConnection{
        if(!socketConnection){
            socketConnection = new SocketConnection();
        }

        return socketConnection;
    }
}