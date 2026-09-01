import React, { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';

interface Props {
  roomId: string;
  userId: string;
  username: string;
}

export const StudyRoom: React.FC<Props> = ({ roomId, userId, username }) => {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [editorText, setEditorText] = useState<string>('');
  const [audioMuted, setAudioMuted] = useState<boolean>(false);
  const [videoMuted, setVideoMuted] = useState<boolean>(false);

  const socketRef = useRef<Socket | null>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);

  const iceServers = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] };

  useEffect(() => {
    socketRef.current = io(process.env.NEXT_PUBLIC_WS_URL || '');

    // 1. Capture WebRTC Audio and Video Feeds
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((stream) => {
        setLocalStream(stream);
        if (localVideoRef.current) localVideoRef.current.srcObject = stream;

        socketRef.current?.emit('join_study_room', { roomId, userId, username });
      }).catch(err => console.error('Permissions deployment failed:', err));
    }

    // 2. Setup Signaling Handlers
    socketRef.current.on('peer_joined', async ({ socketId }) => {
      initializePeerConnection(socketId, stream => setRemoteStream(stream));
      
      const offer = await peerConnectionRef.current?.createOffer();
      await peerConnectionRef.current?.setLocalDescription(offer);
      socketRef.current?.emit('webrtc_signal', { targetSocketId: socketId, signalData: offer });
    });

    socketRef.current.on('webrtc_signal_received', async ({ senderSocketId, signalData }) => {
      if (!peerConnectionRef.current) initializePeerConnection(senderSocketId, stream => setRemoteStream(stream));

      if (signalData.type === 'offer') {
        await peerConnectionRef.current?.setRemoteDescription(new RTCSessionDescription(signalData));
        const answer = await peerConnectionRef.current?.createAnswer();
        await peerConnectionRef.current?.setLocalDescription(answer);
        socketRef.current?.emit('webrtc_signal', { targetSocketId: senderSocketId, signalData: answer });
      } else if (signalData.type === 'answer') {
        await peerConnectionRef.current?.setRemoteDescription(new RTCSessionDescription(signalData));
      } else if (signalData.candidate) {
        await peerConnectionRef.current?.addIceCandidate(new RTCIceCandidate(signalData));
      }
    });

    socketRef.current.on('editor_update', ({ content }) => setEditorText(content));
    socketRef.current.on('peer_left', () => setRemoteStream(null));

    return () => {
      localStream?.getTracks().forEach(track => track.stop());
      peerConnectionRef.current?.close();
      socketRef.current?.disconnect();
    };
  }, [roomId, userId, username]);

  const initializePeerConnection = (targetSocketId: string, onStreamReceived: (s: MediaStream) => void) => {
    peerConnectionRef.current = new RTCPeerConnection(iceServers);
    
    localStream?.getTracks().forEach(track => {
      if (localStream) peerConnectionRef.current?.addTrack(track, localStream);
    });

    peerConnectionRef.current.onicecandidate = (event) => {
      if (event.candidate) {
        socketRef.current?.emit('webrtc_signal', { targetSocketId, signalData: event.candidate });
      }
    };

    peerConnectionRef.current.ontrack = (event) => {
      if (event.streams && event.streams[0]) onStreamReceived(event.streams[0]);
    };
  };

  const handleEditorChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const content = e.target.value;
    setEditorText(content);
    socketRef.current?.emit('editor_change', { content });
  };

  const toggleAudio = () => {
    if (localStream && localStream.getAudioTracks().length > 0) {
      localStream.getAudioTracks()[0].enabled = audioMuted;
      setAudioMuted(!audioMuted);
      socketRef.current?.emit('media_state_change', { audioMuted: !audioMuted, videoMuted });
    }
  };

  const toggleVideo = () => {
    if (localStream && localStream.getVideoTracks().length > 0) {
      localStream.getVideoTracks()[0].enabled = videoMuted;
      setVideoMuted(!videoMuted);
      socketRef.current?.emit('media_state_change', { audioMuted, videoMuted: !videoMuted });
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 p-6 bg-slate-950 text-white min-h-screen">
      <div className="flex-1 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="relative rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 aspect-video">
            <video ref={localVideoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
            <div className="absolute bottom-2 left-2 px-3 py-1 rounded-lg bg-black/60 backdrop-blur-md text-xs font-semibold">
              You ({username})
            </div>
          </div>
          {remoteStream ? (
            <div className="relative rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 aspect-video">
              <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover" />
              <div className="absolute bottom-2 left-2 px-3 py-1 rounded-lg bg-black/60 backdrop-blur-md text-xs font-semibold">
                Peer Participant
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-2xl bg-slate-900 border border-slate-800 border-dashed aspect-video p-6 text-center text-slate-500">
              <p className="font-semibold text-sm">Waiting for peer participant to join...</p>
              <p className="text-xs text-slate-600 mt-1">Share this room link to invite a study partner or mentor.</p>
            </div>
          )}
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={toggleAudio}
            className={`px-4 py-2.5 rounded-xl border text-xs font-bold transition-colors ${
              audioMuted ? 'bg-rose-500/10 border-rose-500/30 text-rose-400' : 'bg-slate-900 border-slate-800 text-slate-200 hover:bg-slate-800'
            }`}
          >
            {audioMuted ? '💥 Unmute' : '🎙️ Mute'}
          </button>
          <button
            onClick={toggleVideo}
            className={`px-4 py-2.5 rounded-xl border text-xs font-bold transition-colors ${
              videoMuted ? 'bg-rose-500/10 border-rose-500/30 text-rose-400' : 'bg-slate-900 border-slate-800 text-slate-200 hover:bg-slate-800'
            }`}
          >
            {videoMuted ? '📷 Camera On' : '📹 Camera Off'}
          </button>
        </div>
      </div>
      <div className="flex-1 flex flex-col space-y-2">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Synchronized Collaborative Workspace & Code Pad
        </label>
        <textarea
          value={editorText}
          onChange={handleEditorChange}
          placeholder="Paste your code snippet or collaborative note logs here..."
          className="w-full h-full min-h-[350px] p-4 rounded-2xl bg-slate-900 border border-slate-800 text-emerald-400 font-mono text-sm focus:outline-none focus:border-indigo-500 transition-colors"
        />
      </div>
    </div>
  );
};
