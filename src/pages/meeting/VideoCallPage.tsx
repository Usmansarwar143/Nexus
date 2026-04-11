import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSocket } from '../../context/SocketContext';
import { useAuth } from '../../context/AuthContext';
import { Mic, MicOff, Video as VideoIcon, VideoOff, PhoneOff } from 'lucide-react';
import { Button } from '../../components/ui/Button';

export const VideoCallPage: React.FC = () => {
  const { id: roomId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { socket, isConnected } = useSocket();
  const { user } = useAuth();

  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  
  const localStreamRef = useRef<MediaStream | null>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const pendingCandidatesRef = useRef<RTCIceCandidateInit[]>([]);

  // WebRTC config (Google STUN server)
  const iceServers = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
    ],
  };

  useEffect(() => {
    if (!socket || !isConnected || !user) return;

    // 1. Get user media
    const initMedia = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        localStreamRef.current = stream;
        
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }

        // Join room
        socket.emit('join-room', roomId, user.id);
      } catch (err) {
        console.error("Failed to access media devices", err);
      }
    };

    initMedia();

    // 2. Peer Connection Factory
    const createPeerConnection = (targetSocketId: string) => {
      const pc = new RTCPeerConnection(iceServers);

      // Add local tracks to PC
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => {
          if (localStreamRef.current) pc.addTrack(track, localStreamRef.current);
        });
      }

      // Handle ICE Candidates
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit('ice-candidate', {
            target: targetSocketId,
            candidate: event.candidate,
          });
        }
      };

      // Handle Remote Stream
      pc.ontrack = (event) => {
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = event.streams[0];
        }
      };

      peerConnectionRef.current = pc;
      return pc;
    };

    // 3. Socket Event Listeners

    // Other user joined -> we are the caller, we send an offer
    socket.on('user-connected', async (userId: string, targetSocketId: string) => {
      const pc = createPeerConnection(targetSocketId);
      
      try {
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        socket.emit('offer', { target: targetSocketId, caller: socket.id, offer });
      } catch (err) {
        console.error("Error creating offer", err);
      }
    });

    // Received an offer -> we are the callee, we send an answer
    socket.on('offer', async (payload: { target: string, caller: string, offer: RTCSessionDescriptionInit }) => {
      const pc = createPeerConnection(payload.caller);
      
      try {
        await pc.setRemoteDescription(new RTCSessionDescription(payload.offer));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        
        socket.emit('answer', { target: payload.caller, answer });

        // Add any pending candidates that arrived before the remote description was set
        pendingCandidatesRef.current.forEach(candidate => {
          pc.addIceCandidate(new RTCIceCandidate(candidate));
        });
        pendingCandidatesRef.current = [];
      } catch (err) {
        console.error("Error handling offer", err);
      }
    });

    // Received answer -> Set remote description
    socket.on('answer', async (payload: { target: string, answer: RTCSessionDescriptionInit }) => {
      const pc = peerConnectionRef.current;
      if (pc) {
        try {
          await pc.setRemoteDescription(new RTCSessionDescription(payload.answer));
          // Process pending ICE candidates
          pendingCandidatesRef.current.forEach(candidate => {
            pc.addIceCandidate(new RTCIceCandidate(candidate));
          });
          pendingCandidatesRef.current = [];
        } catch (err) {
          console.error("Error setting answer", err);
        }
      }
    });

    // Received ICE candidate
    socket.on('ice-candidate', async (payload: { target: string, candidate: RTCIceCandidateInit }) => {
      const pc = peerConnectionRef.current;
      if (pc && pc.remoteDescription) {
        try {
          await pc.addIceCandidate(new RTCIceCandidate(payload.candidate));
        } catch (e) {
          console.error('Error adding received ice candidate', e);
        }
      } else {
        // Queue candidates until remote description is set
        pendingCandidatesRef.current.push(payload.candidate);
      }
    });

    socket.on('user-disconnected', () => {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = null;
      }
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
      }
    });

    return () => {
      // Cleanup
      socket.off('user-connected');
      socket.off('offer');
      socket.off('answer');
      socket.off('ice-candidate');
      socket.off('user-disconnected');

      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => track.stop());
      }
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
      }
    };
  }, [socket, isConnected, roomId, user]);

  const toggleMute = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach(t => t.enabled = !t.enabled);
      setIsMuted(!isMuted);
    }
  };

  const toggleVideo = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getVideoTracks().forEach(t => t.enabled = !t.enabled);
      setIsVideoOff(!isVideoOff);
    }
  };

  const endCall = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(t => t.stop());
    }
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
    }
    navigate('/dashboard'); // Head back home
  };

  return (
    <div className="flex flex-col h-screen bg-gray-900 absolute inset-0 z-50 p-4">
      <div className="flex justify-between items-center mb-4 text-white">
        <h1 className="text-xl font-bold">Secure Video Room</h1>
      </div>

      <div className="flex-1 flex flex-col md:flex-row gap-4 justify-center items-center overflow-hidden relative">
        {/* Remote Video (Main View) */}
        <div className="w-full h-full bg-black rounded-xl overflow-hidden relative">
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          />
          <div className="absolute top-4 left-4 bg-black bg-opacity-50 px-3 py-1 rounded-md text-white text-sm">
            Partner Connection
          </div>
        </div>

        {/* Local Video (Floating PIP or Sidebar) */}
        <div className="absolute md:relative md:w-1/4 bottom-4 right-4 md:bottom-auto md:right-auto md:h-full aspect-video md:aspect-auto bg-gray-800 rounded-xl overflow-hidden shadow-2xl border-2 border-gray-700">
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover transform scale-x-[-1]"
          />
          <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 px-2 py-0.5 rounded text-white text-xs">
            You {isMuted && '(Muted)'}
          </div>
        </div>
      </div>

      <div className="h-20 mt-4 bg-gray-800 rounded-xl flex items-center justify-center gap-4">
        <Button 
          variant={isMuted ? 'danger' : 'secondary'} 
          onClick={toggleMute} 
          className="rounded-full w-12 h-12 p-0 flex items-center justify-center"
        >
          {isMuted ? <MicOff /> : <Mic />}
        </Button>
        <Button 
          variant={isVideoOff ? 'danger' : 'secondary'} 
          onClick={toggleVideo} 
          className="rounded-full w-12 h-12 p-0 flex items-center justify-center"
        >
          {isVideoOff ? <VideoOff /> : <VideoIcon />}
        </Button>
        <Button 
          variant="danger" 
          onClick={endCall}
          className="rounded-full w-14 h-14 p-0 flex items-center justify-center border-4 border-gray-900"
        >
          <PhoneOff size={24} />
        </Button>
      </div>
    </div>
  );
};
