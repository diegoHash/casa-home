import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

export type WhiteboardWireMessage = Record<string, unknown> & { type: string };
export type WhiteboardChannel = {
  connected: boolean;
  send: (message: WhiteboardWireMessage) => void;
  subscribe: (listener: (message: WhiteboardWireMessage) => void) => () => void;
  metrics: WhiteboardMetrics;
};
export type WhiteboardMetrics = { sent: number; received: number; dropped: number; bufferedBytes: number };

const apiUrl = String(import.meta.env.VITE_CONFERENCE_BACKEND_URL
  || (import.meta.env.DEV ? 'http://localhost:8787' : 'https://turn.caribbean-one.site')).replace(/\/$/, '');

export function useWhiteboardChannel(roomId: string, displayName: string): WhiteboardChannel {
  const socketRef = useRef<WebSocket | null>(null);
  const listenersRef = useRef(new Set<(message: WhiteboardWireMessage) => void>());
  const queueRef = useRef<WhiteboardWireMessage[]>([]);
  const ephemeralRef = useRef(new Map<string, WhiteboardWireMessage>());
  const flushFrameRef = useRef<number | null>(null);
  const metricsRef = useRef<WhiteboardMetrics>({ sent: 0, received: 0, dropped: 0, bufferedBytes: 0 });
  const [connected, setConnected] = useState(false);
  const [metrics, setMetrics] = useState<WhiteboardMetrics>({ sent: 0, received: 0, dropped: 0, bufferedBytes: 0 });

  useEffect(() => {
    const timer = window.setInterval(() => setMetrics({ ...metricsRef.current }), 1_000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    let disposed = false;
    let retry: number | undefined;
    const connect = () => {
      const url = new URL(apiUrl.replace(/^http/, 'ws') + '/whiteboard');
      url.searchParams.set('roomId', roomId);
      url.searchParams.set('displayName', displayName || 'Participante');
      const socket = new WebSocket(url);
      socketRef.current = socket;
      socket.onopen = () => {
        setConnected(true);
        queueRef.current.splice(0).forEach(message => socket.send(JSON.stringify(message)));
      };
      socket.onmessage = event => {
        try {
          const message = JSON.parse(String(event.data)) as WhiteboardWireMessage;
          metricsRef.current.received += 1;
          metricsRef.current.bufferedBytes = socket.bufferedAmount;
          listenersRef.current.forEach(listener => listener(message));
        } catch { /* Ignore malformed server messages. */ }
      };
      socket.onclose = () => {
        if (socketRef.current === socket) socketRef.current = null;
        setConnected(false);
        if (!disposed) retry = window.setTimeout(connect, 1_200);
      };
    };
    connect();
    return () => {
      disposed = true;
      if (retry) window.clearTimeout(retry);
      if (flushFrameRef.current !== null) cancelAnimationFrame(flushFrameRef.current);
      socketRef.current?.close();
      socketRef.current = null;
    };
  }, [displayName, roomId]);

  const sendNow = useCallback((message: WhiteboardWireMessage) => {
    const socket = socketRef.current;
    if (socket?.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify(message));
      metricsRef.current.sent += 1;
      metricsRef.current.bufferedBytes = socket.bufferedAmount;
    } else if (message.type !== 'cursor' && message.type !== 'stroke-points') queueRef.current.push(message);
  }, []);

  const send = useCallback((message: WhiteboardWireMessage) => {
    const ephemeral = message.type === 'cursor' || message.type === 'stroke-points';
    if (!ephemeral) return sendNow(message);
    const socket = socketRef.current;
    if (socket?.bufferedAmount && socket.bufferedAmount > 64_000) {
      metricsRef.current.dropped += 1;
      metricsRef.current.bufferedBytes = socket.bufferedAmount;
      return;
    }
    const key = message.type === 'cursor' ? 'cursor' : `stroke:${String(message.id ?? '')}`;
    const previous = ephemeralRef.current.get(key);
    if (message.type === 'stroke-points' && previous?.type === 'stroke-points') {
      const points = [...(Array.isArray(previous.points) ? previous.points : []), ...(Array.isArray(message.points) ? message.points : [])].slice(-32);
      ephemeralRef.current.set(key, { ...message, points });
    } else {
      ephemeralRef.current.set(key, message);
    }
    if (flushFrameRef.current !== null) return;
    flushFrameRef.current = requestAnimationFrame(() => {
      flushFrameRef.current = null;
      const pending = [...ephemeralRef.current.values()];
      ephemeralRef.current.clear();
      pending.forEach(sendNow);
    });
  }, [sendNow]);
  const subscribe = useCallback((listener: (message: WhiteboardWireMessage) => void) => {
    listenersRef.current.add(listener);
    return () => { listenersRef.current.delete(listener); };
  }, []);
  return useMemo(() => ({ connected, send, subscribe, metrics }), [connected, send, subscribe, metrics]);
}
