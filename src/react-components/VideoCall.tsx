import React, { useRef, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Video, VideoOff, PhoneOff, SwitchCamera } from "lucide-react";
import { Peer } from  'peerjs'
import { useAppDispatch, useAppSelector } from "@/Store/hooks";
import { initiateCall, recieveCall, sendAnswer } from "@/Store/peerSlice";
import Stream from "stream";
import { User } from "@/axios/interfaces";
import { useSelector } from "react-redux";




const VideoCall = () => {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const pipRef = useRef<HTMLDivElement>(null);

  const [swapped, setSwapped] = useState(false);
  const [position, setPosition] = useState({ x: 16, y: 112 });
  const [dragging, setDragging] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [toggleCamera,setToggleCamer] = useState(false)
  const [toggleMic,setToggleMic] = useState(false);


  const initiatedCall:boolean = useAppSelector(state=>state.peer.initiatedCall);
  const recievingCall:boolean = useAppSelector(state=>state.peer.recievedCall);
  const remoteDesc = useAppSelector(state=>state.peer.remoteDesc)
  const user:User | undefined = useAppSelector(state=>state.auth.user);
  const chatUser = useAppSelector(state=>state.chat.userDetails);

  const [stream,setStream] = useState<MediaStream>();
  const [remoteStream,setRemoteStream] = useState<MediaStream>();
  const peer = useRef<Peer | undefined>(undefined);
  const dispatch = useAppDispatch();

//   useEffect(()=>{
//     let peer1:any = undefined;

//     if(initiatedCall && user){
//        peer1 = new Peer({ initiator: true});

//       peer1.on('signal',data=>{
//          dispatch(initiateCall({userid:user,signal:data}))
//       });
//     }

//     if(remoteDesc && peer1){
//       peer1.signal(remoteDesc);
//     }


//     if( recievingCall && !peer1 && user){
//       peer1 = new Peer({ initiator: true});
//       peer1.signal(remoteDesc);
      
//       peer1.on('signal',data=>{
//         dispatch(sendAnswer({userid:user,signal:data}));
//       })
//     }

//     peer1.on('connect', () => {
//       // wait for 'connect' event before using the data channel
//       console.log("connected with webrtc");
//     })


    
// .
//     navigator.mediaDevices.getUserMedia({
//       video: true,
//       audio: true
//     }).then(stream=> {
//       peer1.addStream(stream);
//       if(localVideoRef.current){
//         localVideoRef.current.srcObject = stream;
//       }
//     } ).catch((error:{error:Error}) => {console.log(error)})

//     peer1.on('stream', stream => {
     
//       if(remoteVideoRef.current) 
//         remoteVideoRef.current.srcObject = stream;
     
//     })
    

//   },[initiatedCall,user,recievingCall])


useEffect(()=>{
  if(user){
    navigator.mediaDevices.getUserMedia({video:true,audio:true})
    .then((stream)=>setStream(stream))
    .catch((err)=> console.log("error while getting stream",err));

    peer.current = new Peer(user._id);

    peer.current.on('call',(call)=>{
        
      console.log("accepting call")
      call.answer(stream);

      call.on('stream',(remoteStream)=>{
        console.log("recieving remote stream");
         setRemoteStream(remoteStream);

         console.log("call connected");
      })
    })

    // console.log("peer" , peer,chatUser,stream)

  }

  //  if( chatUser ){

  //   // navigator.mediaDevices.getUserMedia(
  //   //   { video: true, audio: true })
  //   //   .then((stream)=>{
  

  //   peer.on("call", (call) => {
  //     navigator.mediaDevices.getUserMedia(
  //       { video: true, audio: true })
  //       .then((stream)=>{
  //          call.answer(stream);

  //          if(localVideoRef.current) localVideoRef.current.srcObject = stream;
  //          call.on("stream",(remoteStream)=>{
  //            if(remoteVideoRef.current) remoteVideoRef.current.srcObject = remoteStream;

  //          })
  //       })
  //       .catch((err)=>console.log(err));
        // (stream) => {
        //   call.answer(stream); // Answer the call with an A/V stream.
        //   call.on("stream", (remoteStream) => {
        //     // Show stream in some <video> element.
        //   });
        // },
        // (err) => {
        //   console.error("Failed to get local stream", err);
        // },
      // );
    // });
  // }

  return ()=>{
    peer.current?.destroy();
  }
},[user])


useEffect(()=>{
  if(peer.current && chatUser && stream){
    console.log("initiating call");
     const call = peer.current.call(chatUser._id,stream);
     console.log(call)
     dispatch(initiateCall({userid:chatUser?._id,signal:"hell"}));

     call.on('stream',(remoteStream)=>{
      console.log("recieving remote stream");

      if(remoteVideoRef.current)   remoteVideoRef.current.srcObject = remoteStream;
      if(localVideoRef.current && stream )  localVideoRef.current.srcObject = stream;

      console.log("call connected");
     })
  }
},[peer.current,chatUser,stream])

useEffect(()=>{

  if(localVideoRef.current && remoteVideoRef.current){
    if(stream && remoteStream){
      localVideoRef.current.srcObject = stream;
      remoteVideoRef.current.srcObject = stream;
    }
  }

},[localVideoRef.current,remoteVideoRef.current,stream,remoteStream])

// useEffect(()=>{
//   if(peer && chatUser && stream){
//     console.log("initiating call");
//      const call = peer.current?.call(chatUser._id,stream);

//      call?.on('stream',(remoteStream)=>{
//       console.log("recieving remote stream");

//       if(remoteVideoRef.current)   remoteVideoRef.current.srcObject = remoteStream;
//       if(localVideoRef.current && stream )  localVideoRef.current.srcObject = stream;

//       console.log("call connected");
//      })
//   }
// },[peer])

// useEffect(()=>{
//   if(stream && user ){
//      console.log("hlo");
//     let peer = new Peer(user);


//     if(localVideoRef.current) localVideoRef.current.srcObject = stream;
//     else console.log(stream);
       
//    if(!chatUser){
//     peer.on("call", (call) => {
//       call.answer(stream);

//       call.on("stream",(remoteStream)=>{
//         if(remoteVideoRef.current) remoteVideoRef.current.srcObject = remoteStream;
//         else console.log(remoteStream)
//       })})}
   
//    else{
//      const call = peer.call(chatUser._id, stream);
//      call.on("stream", (remoteStream) => {
//       console.log("bunny");
// 			if(remoteVideoRef.current) remoteVideoRef.current.srcObject = remoteStream;
//         else console.log(remoteStream)
// 		});
//    }
//   }
// },[stream])
  // useEffect(() => {
  //   if (localVideoRef.current && localStream) {
  //     localVideoRef.current.srcObject = localStream;
  //     localVideoRef.current.play();
  //   }
  //   if (remoteVideoRef.current && remoteStream) {
  //     remoteVideoRef.current.srcObject = remoteStream;
  //     remoteVideoRef.current.play();
  //   }
  // }, [localStream, remoteStream]);

  const handleSwap = () => {
    setSwapped((prev) => !prev);
  };

  const handleMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
    setDragging(true);
    setOffset({ x: clientX - position.x, y: clientY - position.y });
  };

  const handleMouseUp = () => {
    if (dragging) snapToNearestCorner();
    setDragging(false);
  };

  const handleMouseMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!dragging) return;
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
    setPosition({ x: clientX - offset.x, y: clientY - offset.y });
  };

  const handleDoubleClick = () => {
    handleSwap();
  };

  const snapToNearestCorner = () => {
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    const pipWidth = pipRef.current?.offsetWidth || 160;
    const pipHeight = pipRef.current?.offsetHeight || 112;

    const corners = [
      { x: 16, y: 112 }, // top-left
      { x: screenWidth - pipWidth - 16, y: 112 }, // top-right
      { x: 16, y: screenHeight - pipHeight - 16 }, // bottom-left
      { x: screenWidth - pipWidth - 16, y: screenHeight - pipHeight - 16 } // bottom-right
    ];

    const distances = corners.map(corner => {
      const dx = position.x - corner.x;
      const dy = position.y - corner.y;
      return dx * dx + dy * dy;
    });

    const closestIndex = distances.indexOf(Math.min(...distances));
    setPosition(corners[closestIndex]);
  };

  return (
    <div
      className="relative w-full h-screen bg-black overflow-hidden text-white font-sans"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onTouchMove={handleMouseMove}
      onTouchEnd={handleMouseUp}
    >
      {/* Main video */}
      <video
        ref={swapped ? localVideoRef : remoteVideoRef}
        className="absolute inset-0 w-full h-full object-cover z-0 transition-all duration-500"
        autoPlay
        muted
      />

      {/* Dim overlay */}
      <div className="absolute inset-0 bg-black/40 z-5" />

      {/* Participant name */}
      <div className="absolute top-4 left-4 text-lg md:text-xl font-semibold z-10 bg-black/50 px-4 py-2 rounded-xl shadow">
        {swapped ? "You" : "Stranger"}
      </div>

      {/* Draggable PiP video */}
      <div
        ref={pipRef}
        className="absolute z-10 w-40 h-28 md:w-60 md:h-40 rounded-xl overflow-hidden border border-white/20 shadow-xl cursor-move transition-all duration-200"
        style={{ top: position.y, left: position.x }}
        onMouseDown={handleMouseDown}
        onTouchStart={handleMouseDown}
        onDoubleClick={handleDoubleClick}
      >
        <video
          ref={swapped ? remoteVideoRef : localVideoRef}
          className="w-full h-full object-cover"
          autoPlay
          muted
        />
        <div className="absolute bottom-1 left-1 text-xs font-medium bg-black/60 px-2 py-0.5 rounded text-white">
          {swapped ? "Stranger" : "You"}
        </div>
      </div>

      {/* Control buttons */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex gap-4 z-20">
        <Button onClick={()=>setToggleMic(prev=>!prev)} variant="secondary" className="rounded-full p-4 shadow-2xl bg-white/20 hover:bg-white/30">
          {toggleMic ? <Mic className="text-white" /> : <MicOff className="text-white" />}
        </Button>
        <Button onClick={()=>setToggleCamer(prev=>!prev)} variant="secondary" className="rounded-full p-4 shadow-2xl bg-white/20 hover:bg-white/30">
          {toggleCamera ? <Video className="text-white" /> : <VideoOff className="text-white" />}
        </Button>
        <Button onClick={handleSwap} variant="secondary" className="rounded-full p-4 shadow-2xl bg-white/20 hover:bg-white/30">
          <SwitchCamera className="text-white" />
        </Button>
        <Button  variant="destructive" className="rounded-full p-4 shadow-2xl bg-red-600 hover:bg-red-700">
          <PhoneOff className="text-white" />
        </Button>
      </div>
    </div>
  );
};

export default VideoCall;