import { useCallback, useEffect, useRef, useState } from 'react';

type ConnectionStatus = 'idle' | 'connecting' | 'waiting' | 'connecting-peer' | 'connected' | 'disconnected' | 'error';

export type ConferenceParticipant = {
  id: string;
  displayName: string;
};

export type ParticipantMediaState = {
  cameraEnabled: boolean;
  microphoneEnabled: boolean;
  screenSharing: boolean;
};

type SignalPayload = {
  description?: RTCSessionDescriptionInit;
  candidate?: RTCIceCandidateInit;
};

type ServerMessage = {
  type?: string;
  code?: string;
  message?: string;
  participantId?: string;
  fromId?: string;
  participants?: ConferenceParticipant[];
  participant?: ConferenceParticipant;
  payload?: SignalPayload;
  cameraEnabled?: boolean;
  microphoneEnabled?: boolean;
  screenSharing?: boolean;
};

const initialMediaState: ParticipantMediaState = {
  cameraEnabled: true,
  microphoneEnabled: true,
  screenSharing: false,
};

function conferenceEndpoints() {
  const isDevelopment = import.meta.env.DEV;
  const backendUrl = String(import.meta.env.VITE_CONFERENCE_BACKEND_URL || (isDevelopment ? 'http://localhost:8787' : 'https://turn.caribbean-one.site')).replace(/\/$/, '');
  const signalingUrl = String(import.meta.env.VITE_CONFERENCE_SIGNALING_URL || (isDevelopment
    ? 'ws://localhost:8787/ws'
    : 'wss://turn.caribbean-one.site/ws'));
  return { backendUrl, signalingUrl };
}

export function usePeerConference(roomId: string) {
  const [status, setStatus] = useState<ConnectionStatus>('idle');
  const [error, setError] = useState('');
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [remoteParticipant, setRemoteParticipant] = useState<ConferenceParticipant | null>(null);
  const [remoteMediaState, setRemoteMediaState] = useState<ParticipantMediaState>(initialMediaState);

  const socketRef = useRef<WebSocket | null>(null);
  const peerRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const remoteParticipantRef = useRef<ConferenceParticipant | null>(null);
  const pendingCandidatesRef = useRef<RTCIceCandidateInit[]>([]);
  const iceServersRef = useRef<RTCIceServer[]>([]);
  const intentionalCloseRef = useRef(false);
  const connectionAttemptRef = useRef(0);
  const localMediaStateRef = useRef<ParticipantMediaState>(initialMediaState);

  const send = useCallback((message: Record<string, unknown>) => {
    const socket = socketRef.current;
    if (socket?.readyState === WebSocket.OPEN) socket.send(JSON.stringify(message));
  }, []);

  const closePeer = useCallback(() => {
    peerRef.current?.close();
    peerRef.current = null;
    pendingCandidatesRef.current = [];
    setRemoteStream(null);
  }, []);

  const ensurePeer = useCallback((participantId: string) => {
    const existing = peerRef.current;
    if (existing && remoteParticipantRef.current?.id === participantId) return existing;
    closePeer();

    const peer = new RTCPeerConnection({ iceServers: iceServersRef.current });
    peerRef.current = peer;
    const localStream = localStreamRef.current;
    localStream?.getTracks().forEach(track => peer.addTrack(track, localStream));

    peer.onicecandidate = event => {
      if (event.candidate) {
        send({ type: 'signal', targetId: participantId, payload: { candidate: event.candidate.toJSON() } });
      }
    };
    peer.ontrack = event => {
      const stream = event.streams[0];
      if (stream) setRemoteStream(stream);
    };
    peer.onconnectionstatechange = () => {
      if (peer.connectionState === 'connected') {
        setStatus('connected');
        setError('');
      } else if (peer.connectionState === 'connecting') {
        setStatus('connecting-peer');
      } else if (peer.connectionState === 'failed') {
        setStatus('error');
        setError('No se pudo establecer la conexión multimedia. Revisa la configuración TURN.');
      } else if (peer.connectionState === 'disconnected') {
        setStatus('disconnected');
      }
    };
    return peer;
  }, [closePeer, send]);

  const handleSignal = useCallback(async (fromId: string, payload: SignalPayload) => {
    const peer = ensurePeer(fromId);
    if (payload.description) {
      await peer.setRemoteDescription(payload.description);
      for (const candidate of pendingCandidatesRef.current.splice(0)) {
        await peer.addIceCandidate(candidate);
      }
      if (payload.description.type === 'offer') {
        const answer = await peer.createAnswer();
        await peer.setLocalDescription(answer);
        send({ type: 'signal', targetId: fromId, payload: { description: peer.localDescription } });
      }
    }
    if (payload.candidate) {
      if (peer.remoteDescription) await peer.addIceCandidate(payload.candidate);
      else pendingCandidatesRef.current.push(payload.candidate);
    }
  }, [ensurePeer, send]);

  const disconnect = useCallback(() => {
    intentionalCloseRef.current = true;
    send({ type: 'leave' });
    socketRef.current?.close(1000, 'Participant left');
    socketRef.current = null;
    closePeer();
    remoteParticipantRef.current = null;
    setRemoteParticipant(null);
    setRemoteMediaState(initialMediaState);
    setStatus('idle');
  }, [closePeer, send]);

  const connect = useCallback(async (displayName: string, localStream: MediaStream) => {
    disconnect();
    intentionalCloseRef.current = false;
    localStreamRef.current = localStream;
    setError('');
    setStatus('connecting');
    const attempt = connectionAttemptRef.current + 1;
    connectionAttemptRef.current = attempt;
    const { backendUrl, signalingUrl } = conferenceEndpoints();

    try {
      const response = await fetch(`${backendUrl}/api/ice-servers`, { headers: { Accept: 'application/json' } });
      if (!response.ok) throw new Error('ICE_CONFIG_UNAVAILABLE');
      const configuration = await response.json() as { iceServers?: RTCIceServer[] };
      iceServersRef.current = Array.isArray(configuration.iceServers) ? configuration.iceServers : [];
    } catch {
      setStatus('error');
      const message = 'No se pudo consultar la configuración de conferencia.';
      setError(message);
      throw new Error(message);
    }

    await new Promise<void>((resolve, reject) => {
      const socket = new WebSocket(signalingUrl);
      socketRef.current = socket;
      const timeout = window.setTimeout(() => {
        socket.close();
        reject(new Error('El servidor de conferencia tardó demasiado en responder.'));
      }, 12_000);

      const fail = (message: string) => {
        window.clearTimeout(timeout);
        setStatus('error');
        setError(message);
        intentionalCloseRef.current = true;
        if (socket.readyState < WebSocket.CLOSING) socket.close(1008, 'Conference connection rejected');
        reject(new Error(message));
      };

      socket.onopen = () => {
        socket.send(JSON.stringify({ type: 'join', roomId, displayName }));
      };
      socket.onerror = () => fail('No se pudo conectar con el servidor de conferencia.');
      socket.onclose = () => {
        window.clearTimeout(timeout);
        if (!intentionalCloseRef.current && connectionAttemptRef.current === attempt) {
          closePeer();
          setStatus('disconnected');
        }
      };
      socket.onmessage = event => {
        void (async () => {
          let message: ServerMessage;
          try {
            message = JSON.parse(String(event.data)) as ServerMessage;
          } catch {
            return;
          }

          if (message.type === 'error') {
            const text = message.code === 'ROOM_FULL'
              ? 'La sala ya tiene dos participantes. Inténtalo cuando alguien salga.'
              : message.message || 'El servidor rechazó la solicitud.';
            fail(text);
            return;
          }
          if (message.type === 'joined') {
            window.clearTimeout(timeout);
            const existing = message.participants?.[0] ?? null;
            remoteParticipantRef.current = existing;
            setRemoteParticipant(existing);
            setStatus(existing ? 'connecting-peer' : 'waiting');
            resolve();
            return;
          }
          if (message.type === 'peer-joined' && message.participant) {
            remoteParticipantRef.current = message.participant;
            setRemoteParticipant(message.participant);
            setStatus('connecting-peer');
            const peer = ensurePeer(message.participant.id);
            const offer = await peer.createOffer();
            await peer.setLocalDescription(offer);
            send({ type: 'signal', targetId: message.participant.id, payload: { description: peer.localDescription } });
            send({ type: 'media-state', ...localMediaStateRef.current });
            return;
          }
          if (message.type === 'signal' && message.fromId && message.payload) {
            await handleSignal(message.fromId, message.payload);
            return;
          }
          if (message.type === 'media-state' && message.fromId === remoteParticipantRef.current?.id) {
            setRemoteMediaState({
              cameraEnabled: message.cameraEnabled ?? true,
              microphoneEnabled: message.microphoneEnabled ?? true,
              screenSharing: message.screenSharing ?? false,
            });
            return;
          }
          if (message.type === 'peer-left' && message.participantId === remoteParticipantRef.current?.id) {
            closePeer();
            remoteParticipantRef.current = null;
            setRemoteParticipant(null);
            setRemoteMediaState(initialMediaState);
            setStatus('waiting');
          }
        })().catch(() => {
          setStatus('error');
          setError('Ocurrió un error durante la negociación WebRTC.');
        });
      };
    });
  }, [closePeer, disconnect, ensurePeer, handleSignal, roomId, send]);

  const updateLocalStream = useCallback(async (stream: MediaStream) => {
    localStreamRef.current = stream;
    const peer = peerRef.current;
    if (!peer) return;

    for (const kind of ['audio', 'video'] as const) {
      const nextTrack = stream.getTracks().find(track => track.kind === kind) ?? null;
      const sender = peer.getSenders().find(item => item.track?.kind === kind);
      if (sender) await sender.replaceTrack(nextTrack);
      else if (nextTrack) peer.addTrack(nextTrack, stream);
    }
  }, []);

  const sendMediaState = useCallback((mediaState: ParticipantMediaState) => {
    localMediaStateRef.current = mediaState;
    send({ type: 'media-state', ...mediaState });
  }, [send]);

  useEffect(() => () => disconnect(), [disconnect]);

  return {
    status,
    error,
    remoteStream,
    remoteParticipant,
    remoteMediaState,
    connect,
    disconnect,
    updateLocalStream,
    sendMediaState,
  };
}
