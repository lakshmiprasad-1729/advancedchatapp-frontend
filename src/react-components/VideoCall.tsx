import React, { useRef, useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Video, VideoOff, PhoneOff, SwitchCamera, RefreshCw } from "lucide-react";
import { Peer, MediaConnection } from "peerjs";
import { useAppDispatch, useAppSelector } from "@/Store/hooks";
import { initiateCall, recieveCall, sendAnswer } from "@/Store/peerSlice";
import { User } from "@/axios/interfaces";

interface Position {
  x: number;
  y: number;
}

const VideoCall: React.FC = () => {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const pipRef = useRef<HTMLDivElement>(null);

  const [swapped, setSwapped] = useState<boolean>(false);
  const [position, setPosition] = useState<Position>({ x: 16, y: 112 });
  const [dragging, setDragging] = useState<boolean>(false);
  const [offset, setOffset] = useState<Position>({ x: 0, y: 0 });
  const [videoEnabled, setVideoEnabled] = useState<boolean>(true);
  const [micEnabled, setMicEnabled] = useState<boolean>(true);
  
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [callInProgress, setCallInProgress] = useState<boolean>(false);
  const [connectionStatus, setConnectionStatus] = useState<string>("waiting"); // "waiting", "connecting", "connected", "error"
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [reconnecting, setReconnecting] = useState<boolean>(false);
  
  const initiatedCall = useAppSelector(state => state.peer.initiatedCall);
  const recievingCall = useAppSelector(state => state.peer.recievedCall);
  const remoteDesc = useAppSelector(state => state.peer.remoteDesc);
  const user: User | undefined = useAppSelector(state => state.auth.user);
  const chatUser = useAppSelector(state => state.chat.userDetails);
  
  const peerRef = useRef<Peer | null>(null);
  const currentCallRef = useRef<MediaConnection | null>(null);
  const dispatch = useAppDispatch();

  // Debug logging with timestamp
  const logEvent = (event: string, data?: any): void => {
    const timestamp = new Date().toISOString().substr(11, 8);
    console.log(`[VideoCall ${timestamp}] ${event}`, data || '');
    setConnectionStatus(prev => `${prev}\n${timestamp} - ${event}`);
  };

  // Create a cleanup function that can be reused
  const cleanupResources = useCallback(() => {
    logEvent("Cleaning up resources");
    
    if (currentCallRef.current) {
      currentCallRef.current.close();
      currentCallRef.current = null;
      logEvent("Closed active call");
    }
    
    if (localStream) {
      localStream.getTracks().forEach(track => {
        track.stop();
        logEvent(`Stopped local track: ${track.kind}`);
      });
    }
    
    if (peerRef.current) {
      peerRef.current.destroy();
      peerRef.current = null;
      logEvent("Destroyed peer connection");
    }

    setRemoteStream(null);
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
    }
  }, [localStream]);

  // Function to handle the remote stream
  const handleRemoteStream = useCallback((incomingStream: MediaStream) => {
    logEvent("Received remote stream", {
      videoTracks: incomingStream.getVideoTracks().length,
      audioTracks: incomingStream.getAudioTracks().length
    });
    
    setRemoteStream(incomingStream);
    
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = incomingStream;
      logEvent("Set remote video source");
    }
    
    setCallInProgress(true);
    setConnectionStatus("connected");
  }, []);

  // Setup call event handlers
  const setupCallEventHandlers = useCallback((call: MediaConnection) => {
    // Handle the remote stream when it arrives
    call.on('stream', handleRemoteStream);
    
    // Handle call closing
    call.on('close', () => {
      logEvent("Call closed");
      setCallInProgress(false);
      setRemoteStream(null);
      setConnectionStatus("waiting");
      
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = null;
      }
    });
    
    // Handle call errors
    call.on('error', (err: any) => {
      logEvent(`Call error: ${err}`);
      setCallInProgress(false);
      setConnectionStatus("error");
      setErrorMessage(`Call error: ${err}`);
    });
  }, [handleRemoteStream]);

  // Initialize media stream 
  const initializeMedia = useCallback(async (): Promise<MediaStream | null> => {
    try {
      logEvent("Requesting media permissions");
      
      // Try to get the media stream with both video and audio
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: true 
      });
      
      logEvent("Media permissions granted", {
        videoTracks: stream.getVideoTracks().length,
        audioTracks: stream.getAudioTracks().length
      });
      
      setLocalStream(stream);
      
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
        logEvent("Set local video source");
      }
      
      setVideoEnabled(true);
      setMicEnabled(true);
      
      return stream;
    } catch (err) {
      console.error("Error getting user media:", err);
      logEvent(`Media error: ${err instanceof Error ? err.message : String(err)}`);
      setConnectionStatus("error");
      setErrorMessage(`Could not access camera/microphone: ${err instanceof Error ? err.message : String(err)}`);
      
      // Try to initialize with audio only
      try {
        const audioOnlyStream = await navigator.mediaDevices.getUserMedia({ 
          video: false, 
          audio: true 
        });
        logEvent("Fallback to audio-only successful");
        setVideoEnabled(false);
        setLocalStream(audioOnlyStream);
        
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = audioOnlyStream;
        }
        
        return audioOnlyStream;
      } catch (audioErr) {
        logEvent(`Audio-only fallback failed: ${audioErr instanceof Error ? audioErr.message : String(audioErr)}`);
        return null;
      }
    }
  }, []);

  // Initialize the peer connection
  const initializePeer = useCallback((stream: MediaStream | null): Peer | null => {
    // Clean up any existing peer
    if (peerRef.current) {
      logEvent("Destroying existing peer connection");
      peerRef.current.destroy();
    }
    
    if (!user || !user._id) {
      logEvent("Cannot initialize peer: missing user ID");
      return null;
    }
    
    try {
      logEvent(`Creating new peer with ID: ${user._id}`);
      
      // Create new peer with user's ID and debug options
      const peer = new Peer(user._id, {
        debug: 3, // Set to maximum debug level
        config: {
          'iceServers': [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' },
            { urls: 'stun:stun2.l.google.com:19302' },
            // Add TURN servers for better NAT traversal
            {
              urls: 'turn:global.turn.twilio.com:3478?transport=udp',
              username: 'dummy_username', // You'll need to replace these with actual credentials
              credential: 'dummy_credential'  // from a TURN service provider
            }
          ]
        }
      });
      
      // Handle peer open event (successful connection to the signaling server)
      peer.on('open', (id: string) => {
        logEvent(`Peer connection established with ID: ${id}`);
        setConnectionStatus("waiting");
        setReconnecting(false);
      });
      
      // Handle incoming calls
      peer.on('call', (call: MediaConnection) => {
        logEvent(`Incoming call from: ${call.peer}`);
        
        // Store the call for later use
        currentCallRef.current = call;
        
        // Notify the UI that we're receiving a call
        dispatch(recieveCall({ userId: call.peer, signal: null }));
        setConnectionStatus("connecting");
        
        try {
          // Answer the call with our stream
          logEvent("Answering call with local stream");
          call.answer(stream);
          
          // Set up the call event handlers
          setupCallEventHandlers(call);
        } catch (err) {
          logEvent(`Error answering call: ${err instanceof Error ? err.message : String(err)}`);
          setConnectionStatus("error");
          setErrorMessage(`Error answering call: ${err instanceof Error ? err.message : String(err)}`);
        }
      });
      
      // Handle peer connection errors
      peer.on('error', (err: any) => {
        logEvent(`Peer connection error: ${err.type} - ${err.message}`);
        setConnectionStatus("error");
        setErrorMessage(`Connection error: ${err.message}`);
        
        // Try to reconnect after a delay
        setTimeout(() => {
          if (user && user._id) {
            logEvent("Attempting to reconnect peer");
            setReconnecting(true);
            // The main useEffect will handle reconnection
          }
        }, 5000);
      });
      
      // Handle peer disconnect
      peer.on('disconnected', () => {
        logEvent("Peer disconnected from signaling server");
        
        // Try to reconnect
        peer.reconnect();
      });
      
      // Handle peer close event
      peer.on('close', () => {
        logEvent("Peer connection closed");
      });
      
      return peer;
    } catch (err) {
      logEvent(`Error creating peer: ${err instanceof Error ? err.message : String(err)}`);
      setConnectionStatus("error");
      setErrorMessage(`Connection error: ${err instanceof Error ? err.message : String(err)}`);
      return null;
    }
  }, [user, setupCallEventHandlers]);

  // Make a call to the remote peer
  const makeCall = useCallback(() => {
    if (!peerRef.current || !chatUser || !chatUser._id || !localStream) {
      logEvent("Cannot make call: missing peer, chat user, or local stream");
      return;
    }
    
    try {
      logEvent(`Initiating call to: ${chatUser._id}`);
      setConnectionStatus("connecting");
      
      // Make the call
      const call = peerRef.current.call(chatUser._id, localStream);
      currentCallRef.current = call;
      
      // Update state
      dispatch(initiateCall({ userid: chatUser._id, signal: null }));
      
      // Set up the call event handlers
      setupCallEventHandlers(call);
      
      // Set a timeout to check if the call was successful
      setTimeout(() => {
        if (!remoteStream && currentCallRef.current === call) {
          logEvent("Call timed out - no remote stream received");
          setConnectionStatus("error");
          setErrorMessage("Call timed out. The remote peer may be unavailable.");
        }
      }, 30000); // 30 second timeout
    } catch (err) {
      logEvent(`Error making call: ${err instanceof Error ? err.message : String(err)}`);
      setConnectionStatus("error");
      setErrorMessage(`Error making call: ${err instanceof Error ? err.message : String(err)}`);
    }
  }, [peerRef.current, chatUser, localStream, remoteStream, setupCallEventHandlers]);

  // Initialize the connection
  useEffect(() => {
    // Only initialize if we have a user
    if (!user || !user._id) {
      logEvent("No user data available");
      return;
    }

    logEvent(`Initializing for user: ${user._id}`);
    setConnectionStatus("initializing");

    const initialize = async () => {
      // Get user media first
      const stream = await initializeMedia();
      
      // Initialize peer connection after we have media
      const peer = initializePeer(stream);
      if (peer) {
        peerRef.current = peer;
      }
    };
    
    initialize();
    
    // Cleanup function
    return cleanupResources;
  }, [user, initializeMedia, initializePeer, cleanupResources, reconnecting]);

  // Handle initiating calls when chatUser changes or when reconnecting
  useEffect(() => {
    // Don't call if already in call progress
    if (callInProgress) {
      return;
    }
    
    // Only make call if we have peer, chatUser, and stream
    if (!peerRef.current || !chatUser || !chatUser._id || !localStream) {
      return;
    }
    
    // Wait a moment before initiating call to ensure both peers are ready
    logEvent("Waiting before initiating call");
    const timer = setTimeout(makeCall, 2000); // Increased timeout for better connection chance
    
    return () => {
      clearTimeout(timer);
    };
  }, [peerRef.current, chatUser, localStream, callInProgress, makeCall]);

  // Force reconnection function
  const handleReconnect = () => {
    logEvent("Manual reconnection requested");
    cleanupResources();
    setReconnecting(true);
  };

  // Toggle media controls
  const toggleVideo = (): void => {
    if (localStream) {
      const videoTracks = localStream.getVideoTracks();
      if (videoTracks.length > 0) {
        videoTracks.forEach(track => {
          track.enabled = !videoEnabled;
          logEvent(`Video ${!videoEnabled ? 'enabled' : 'disabled'}`);
        });
      }
      setVideoEnabled(!videoEnabled);
    }
  };

  const toggleMic = (): void => {
    if (localStream) {
      const audioTracks = localStream.getAudioTracks();
      if (audioTracks.length > 0) {
        audioTracks.forEach(track => {
          track.enabled = !micEnabled;
          logEvent(`Microphone ${!micEnabled ? 'enabled' : 'disabled'}`);
        });
      }
      setMicEnabled(!micEnabled);
    }
  };

  const endCall = (): void => {
    logEvent("User ended call");
    if (currentCallRef.current) {
      currentCallRef.current.close();
      currentCallRef.current = null;
    }
    setCallInProgress(false);
    setRemoteStream(null);
    setConnectionStatus("waiting");
    
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
    }
  };

  // Handle video element loadedmetadata events
  const handleLocalVideoLoaded = (): void => {
    logEvent("Local video element loaded metadata");
  };
  
  const handleRemoteVideoLoaded = (): void => {
    logEvent("Remote video element loaded metadata");
  };

  // UI handlers
  const handleSwap = (): void => {
    setSwapped((prev) => !prev);
  };

  const handleMouseDown = (e: React.MouseEvent | React.TouchEvent): void => {
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
    setDragging(true);
    setOffset({ x: clientX - position.x, y: clientY - position.y });
  };

  const handleMouseUp = (): void => {
    if (dragging) snapToNearestCorner();
    setDragging(false);
  };

  const handleMouseMove = (e: React.MouseEvent | React.TouchEvent): void => {
    if (!dragging) return;
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
    setPosition({ x: clientX - offset.x, y: clientY - offset.y });
  };

  const handleDoubleClick = (): void => {
    handleSwap();
  };

  const snapToNearestCorner = (): void => {
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

  // Helper to get the connection status display
  const getConnectionStatusDisplay = (): JSX.Element => {
    switch (connectionStatus) {
      case "initializing":
        return (
          <span className="flex items-center">
            <span className="h-3 w-3 bg-blue-500 rounded-full mr-2 animate-pulse"></span>
            Initializing...
          </span>
        );
      case "waiting":
        return (
          <span className="flex items-center">
            <span className="h-3 w-3 bg-yellow-500 rounded-full mr-2"></span>
            Waiting for call
          </span>
        );
      case "connecting":
        return (
          <span className="flex items-center">
            <span className="h-3 w-3 bg-yellow-500 rounded-full mr-2 animate-pulse"></span>
            Connecting...
          </span>
        );
      case "connected":
        return (
          <span className="flex items-center">
            <span className="h-3 w-3 bg-green-500 rounded-full mr-2"></span>
            Connected
          </span>
        );
      case "error":
        return (
          <span className="flex items-center">
            <span className="h-3 w-3 bg-red-500 rounded-full mr-2"></span>
            Error
          </span>
        );
      default:
        return (
          <span className="flex items-center">
            <span className="h-3 w-3 bg-gray-500 rounded-full mr-2"></span>
            Unknown
          </span>
        );
    }
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
        playsInline
        muted={swapped} // Only mute if it's the local video
        onLoadedMetadata={swapped ? handleLocalVideoLoaded : handleRemoteVideoLoaded}
      />

      {/* Fallback for no video */}
      {!remoteStream && !swapped && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900 z-0">
          <div className="text-center">
            <div className="text-4xl mb-4">{chatUser?.name?.charAt(0) || "?"}</div>
            <div>{connectionStatus === "waiting" ? "Waiting for peer..." : "Connecting..."}</div>
          </div>
        </div>
      )}

      {/* Dim overlay */}
      <div className="absolute inset-0 bg-black/40 z-5" />

      {/* Participant name */}
      <div className="absolute top-4 left-4 text-lg md:text-xl font-semibold z-10 bg-black/50 px-4 py-2 rounded-xl shadow">
        {swapped ? "You" : (chatUser?.name || "Peer")}
      </div>

      {/* Connection status indicator */}
      <div className="absolute top-4 right-4 z-10 bg-black/50 px-4 py-2 rounded-xl shadow">
        {getConnectionStatusDisplay()}
      </div>

      {/* Error message if any */}
      {errorMessage && (
        <div className="absolute top-16 right-4 z-10 bg-red-500/80 px-4 py-2 rounded-xl shadow max-w-md">
          {errorMessage}
          <Button 
            onClick={handleReconnect}
            variant="secondary" 
            className="ml-2 p-1 rounded-full bg-white/20 hover:bg-white/30"
            title="Reconnect"
          >
            <RefreshCw size={16} />
          </Button>
        </div>
      )}

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
          playsInline
          muted={!swapped} // Always mute local video
          onLoadedMetadata={swapped ? handleRemoteVideoLoaded : handleLocalVideoLoaded}
        />

        {/* Fallback for no video in PiP */}
        {!localStream && !swapped && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
            <div className="text-2xl">{user?.name?.charAt(0) || "Me"}</div>
          </div>
        )}
        
        {!remoteStream && swapped && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
            <div className="text-2xl">{chatUser?.name?.charAt(0) || "?"}</div>
          </div>
        )}

        <div className="absolute bottom-1 left-1 text-xs font-medium bg-black/60 px-2 py-0.5 rounded text-white">
          {swapped ? (chatUser?.name || "Peer") : "You"}
        </div>
      </div>

      {/* Control buttons */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex gap-4 z-20">
        <Button 
          onClick={toggleMic} 
          variant="secondary" 
          className={`rounded-full p-4 shadow-2xl ${micEnabled ? 'bg-white/20 hover:bg-white/30' : 'bg-red-500/70 hover:bg-red-500/90'}`}
        >
          {micEnabled ? <Mic className="text-white" /> : <MicOff className="text-white" />}
        </Button>
        <Button 
          onClick={toggleVideo} 
          variant="secondary" 
          className={`rounded-full p-4 shadow-2xl ${videoEnabled ? 'bg-white/20 hover:bg-white/30' : 'bg-red-500/70 hover:bg-red-500/90'}`}
        >
          {videoEnabled ? <Video className="text-white" /> : <VideoOff className="text-white" />}
        </Button>
        <Button 
          onClick={handleSwap} 
          variant="secondary" 
          className="rounded-full p-4 shadow-2xl bg-white/20 hover:bg-white/30"
        >
          <SwitchCamera className="text-white" />
        </Button>
        <Button 
          onClick={handleReconnect} 
          variant="secondary" 
          className="rounded-full p-4 shadow-2xl bg-white/20 hover:bg-white/30"
        >
          <RefreshCw className="text-white" />
        </Button>
        <Button 
          onClick={endCall} 
          variant="destructive" 
          className="rounded-full p-4 shadow-2xl bg-red-600 hover:bg-red-700"
        >
          <PhoneOff className="text-white" />
        </Button>
      </div>
      
      {/* Debug mode - only in development */}
      {process.env.NODE_ENV === 'development' && (
        <div className="absolute bottom-24 left-4 right-4 z-20 bg-black/80 p-2 rounded text-xs font-mono h-32 overflow-auto">
          <div>Peer ID: {user?._id || 'unknown'}</div>
          <div>Target ID: {chatUser?._id || 'unknown'}</div>
          <div>Status: {connectionStatus}</div>
          <div>Local Stream: {localStream ? `✓ (${localStream.getTracks().length} tracks)` : '✗'}</div>
          <div>Remote Stream: {remoteStream ? `✓ (${remoteStream.getTracks().length} tracks)` : '✗'}</div>
          <div>Call In Progress: {callInProgress ? 'Yes' : 'No'}</div>
          <div>Video Enabled: {videoEnabled ? 'Yes' : 'No'}</div>
          <div>Mic Enabled: {micEnabled ? 'Yes' : 'No'}</div>
        </div>
      )}
    </div>
  );
};

export default VideoCall;