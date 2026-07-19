import { useCallback, useEffect, useState } from 'react';
import { ControlBar, LiveKitRoom, ParticipantTile, RoomAudioRenderer, StartAudio, useRoomContext, useTracks, VideoConference } from '@livekit/components-react';
import { RoomEvent, Track, VideoQuality } from 'livekit-client';
import { Check, Copy, Link2, PenTool, Share2, X } from 'lucide-react';
import { CollaborativeWhiteboard } from './CollaborativeWhiteboard';
import { useWhiteboardChannel } from '../../hooks/useWhiteboardChannel';
import '@livekit/components-styles';

type TokenResponse = { token: string; serverUrl: string };

type CasaSfuRoomProps = {
  roomId: string;
  displayName: string;
  onLeave: () => void;
};

const conferenceApiUrl = String(import.meta.env.VITE_CONFERENCE_BACKEND_URL
  || (import.meta.env.DEV ? 'http://localhost:8787' : 'https://turn.caribbean-one.site')).replace(/\/$/, '');

export function CasaSfuRoom({ roomId, displayName, onLeave }: CasaSfuRoomProps) {
  const [credentials, setCredentials] = useState<TokenResponse | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const controller = new AbortController();
    void fetch(`${conferenceApiUrl}/api/livekit/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ roomId, displayName }),
      signal: controller.signal,
    })
      .then(async response => {
        if (!response.ok) throw new Error(`TOKEN_${response.status}`);
        return response.json() as Promise<TokenResponse>;
      })
      .then(setCredentials)
      .catch(fetchError => {
        if (fetchError instanceof DOMException && fetchError.name === 'AbortError') return;
        setError('No pudimos conectar con la sala de CASA. Inténtalo nuevamente.');
      });
    return () => controller.abort();
  }, [displayName, roomId]);

  if (error) {
    return (
      <main className="flex min-h-[100dvh] items-center justify-center bg-[#050d18] p-5 text-white">
        <div className="w-full max-w-md rounded-3xl border border-red-400/20 bg-white/5 p-6 text-center">
          <h1 className="text-xl font-semibold">No se pudo abrir la conferencia</h1>
          <p className="mt-3 text-sm leading-6 text-white/60">{error}</p>
          <button type="button" onClick={onLeave} className="mt-6 rounded-full bg-white px-5 py-3 text-sm font-bold text-[#0b1d33]">Volver a conferencias</button>
        </div>
      </main>
    );
  }

  if (!credentials) {
    return <main className="flex min-h-[100dvh] items-center justify-center bg-[#050d18] p-5 text-white"><p className="rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm text-white/70">Preparando sala CASA…</p></main>;
  }

  return (
    <div data-lk-theme="default" className="h-[100dvh] w-full max-w-[100vw] overflow-hidden bg-[#050d18]">
      <LiveKitRoom
        token={credentials.token}
        serverUrl={credentials.serverUrl}
        connect
        audio
        video
        onDisconnected={onLeave}
        options={{ adaptiveStream: true, dynacast: true }}
        className="h-full"
      >
        <ConferenceExperience />
        <RoomAudioRenderer />
        <StartAudio label="Activar audio" />
      </LiveKitRoom>
    </div>
  );
}

function ConferenceExperience() {
  const room = useRoomContext();
  const channel = useWhiteboardChannel(room.name, room.localParticipant.name || 'Participante');
  const [whiteboardOpen, setWhiteboardOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [connectionQuality, setConnectionQuality] = useState(String(room.localParticipant.connectionQuality));
  const cameraTracks = useTracks([{ source: Track.Source.Camera, withPlaceholder: true }]);
  const debug = new URLSearchParams(window.location.search).get('debugConference') === '1';

  const changeWhiteboardMode = useCallback((open: boolean, broadcast = true) => {
    setWhiteboardOpen(open);
    if (broadcast) channel.send({ type: 'whiteboard-mode', open });
  }, [channel]);

  useEffect(() => {
    return channel.subscribe(message => {
      if (message.type === 'whiteboard-mode' && typeof message.open === 'boolean') changeWhiteboardMode(message.open, false);
    });
  }, [changeWhiteboardMode, channel]);

  useEffect(() => {
    const updateQuality = (quality: unknown, participant: { identity: string }) => {
      if (participant.identity === room.localParticipant.identity) setConnectionQuality(String(quality));
    };
    room.on(RoomEvent.ConnectionQualityChanged, updateQuality);
    return () => { room.off(RoomEvent.ConnectionQualityChanged, updateQuality); };
  }, [room]);

  useEffect(() => {
    for (const participant of room.remoteParticipants.values()) {
      const publication = participant.getTrackPublication(Track.Source.Camera);
      publication?.setVideoQuality(whiteboardOpen ? VideoQuality.LOW : VideoQuality.HIGH);
    }
  }, [cameraTracks, room, whiteboardOpen]);

  return (
    <div className="h-full min-h-0">
      {!whiteboardOpen && (
        <div className="pointer-events-none fixed left-3 top-3 z-[9999] rounded-full border border-white/15 bg-[#071426]/85 px-3 py-2 shadow-2xl backdrop-blur sm:left-5 sm:top-5">
          <img src="/casa-wordmark-dark.png" alt="CASA" className="h-5 w-auto max-w-[105px] object-contain sm:h-6 sm:max-w-[125px]" />
        </div>
      )}
      {!whiteboardOpen && <button
        type="button"
        onClick={() => setShareOpen(true)}
        className="fixed right-3 top-3 z-[9999] inline-flex items-center rounded-full border border-white/20 bg-[#0b1d33] px-3 py-2.5 text-sm font-bold text-white shadow-2xl transition hover:bg-[#173d65] sm:right-40 sm:top-5"
      >
        <Share2 className="mr-2" size={18} /> Compartir
      </button>}
      {!whiteboardOpen && <div className="relative h-full">
        <VideoConference />
        <button
          type="button"
          onClick={() => changeWhiteboardMode(true)}
          className="fixed bottom-24 right-3 z-[9999] inline-flex items-center rounded-full border-2 border-white/80 bg-[#d6af57] px-4 py-3 text-sm font-bold text-[#0b1d33] shadow-2xl transition hover:bg-[#e5c673] sm:bottom-auto sm:right-5 sm:top-5"
        >
          <PenTool className="mr-2" size={18} /> Pizarra
        </button>
      </div>}
      <div className={`h-full min-h-0 flex-col bg-[#050d18] p-2 sm:p-3 ${whiteboardOpen ? 'flex' : 'hidden'}`}>
        <div className="mb-1.5 flex shrink-0 items-center justify-between gap-2 px-1 text-white sm:mb-2">
          <div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">Pizarra colaborativa</p><p className="hidden text-xs text-white/45 sm:block">{channel.connected ? 'En vivo para toda la sala · T para mover' : 'Reconectando la pizarra…'}</p></div>
          <div className="flex shrink-0 items-center gap-2">
            <button type="button" onClick={() => setShareOpen(true)} aria-label="Compartir sala" className="inline-flex h-9 items-center rounded-full border border-white/20 bg-[#0b1d33] px-2.5 text-xs font-bold text-white hover:bg-[#173d65] sm:h-10 sm:px-3 sm:text-sm"><Share2 className="sm:mr-1.5" size={17} /><span className="hidden sm:inline">Compartir</span></button>
            <button type="button" onClick={() => changeWhiteboardMode(false)} aria-label="Cerrar la pizarra para todos" className="inline-flex h-9 shrink-0 items-center rounded-full border border-white/15 px-2.5 text-xs font-semibold hover:bg-white/10 sm:h-10 sm:px-3 sm:text-sm"><X className="sm:mr-1.5" size={17} /><span className="hidden sm:inline">Cerrar para todos</span></button>
          </div>
        </div>
        <div className="grid min-h-0 flex-1 gap-2 md:grid-cols-[minmax(0,1fr)_240px]">
          <CollaborativeWhiteboard channel={channel} />
          {whiteboardOpen && <aside className="grid max-h-28 select-none grid-cols-3 gap-1.5 overflow-y-auto rounded-2xl border border-white/10 bg-white/5 p-1.5 [&_video]:pointer-events-none [&_video]:select-none sm:max-h-36 sm:gap-2 sm:p-2 md:max-h-none md:grid-cols-1 md:auto-rows-[135px]">
            {cameraTracks.map(trackRef => <ParticipantTile key={`${trackRef.participant.identity}-${trackRef.source}`} trackRef={trackRef} className="min-h-0 overflow-hidden rounded-xl" />)}
          </aside>}
        </div>
        <div className="conference-control-scroll mt-2 max-w-full shrink-0 overflow-x-auto overflow-y-hidden rounded-2xl border border-white/10 bg-white/5">
          <ControlBar controls={{ chat: false }} />
        </div>
      </div>
      {shareOpen && <ShareRoomModal roomId={room.name} onClose={() => setShareOpen(false)} />}
      {debug && <div className="fixed bottom-2 left-2 z-[10001] rounded-xl bg-black/80 px-3 py-2 font-mono text-[10px] text-emerald-300">
        WS {channel.connected ? 'ON' : 'OFF'} · enviados {channel.metrics.sent} · recibidos {channel.metrics.received} · descartados {channel.metrics.dropped} · cola {channel.metrics.bufferedBytes} B · red {connectionQuality}
      </div>}
    </div>
  );
}

function ShareRoomModal({ roomId, onClose }: { roomId: string; onClose: () => void }) {
  const [copied, setCopied] = useState<'code' | 'id' | 'link' | null>(null);
  const roomLink = window.location.href;
  const accessCode = roomId.slice(-5).toLowerCase();

  const copy = async (value: string, kind: 'code' | 'id' | 'link') => {
    await navigator.clipboard.writeText(value);
    setCopied(kind);
    window.setTimeout(() => setCopied(null), 1_800);
  };

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="share-room-title" onMouseDown={event => event.target === event.currentTarget && onClose()}>
      <section className="w-full max-w-lg rounded-3xl border border-white/10 bg-[#0b1d33] p-5 text-white shadow-2xl sm:p-7">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#d6af57]/15 text-[#d6af57]"><Share2 size={21} /></div>
            <h2 id="share-room-title" className="mt-4 text-xl font-semibold">Compartir sala</h2>
            <p className="mt-1 text-sm text-white/50">Invita a otras personas mediante el código o el enlace.</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Cerrar" className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/10 hover:bg-white/10"><X size={18} /></button>
        </div>

        <ShareField label="Código para invitados (últimos 5)" value={accessCode} icon={Link2} copied={copied === 'code'} onCopy={() => void copy(accessCode, 'code')} />
        <p className="mt-2 text-xs font-semibold text-[#d6af57]">Comparte estos últimos 5 dígitos con tus invitados.</p>
        <ShareField label="ID completo de la sala" value={roomId} icon={Link2} copied={copied === 'id'} onCopy={() => void copy(roomId, 'id')} />
        <ShareField label="Enlace de invitación" value={roomLink} icon={Share2} copied={copied === 'link'} onCopy={() => void copy(roomLink, 'link')} />

        <button type="button" onClick={onClose} className="mt-6 w-full rounded-2xl bg-white px-5 py-3 text-sm font-bold text-[#0b1d33] transition hover:bg-slate-100">Listo</button>
      </section>
    </div>
  );
}

function ShareField({ label, value, icon: Icon, copied, onCopy }: { label: string; value: string; icon: typeof Link2; copied: boolean; onCopy: () => void }) {
  return (
    <div className="mt-5">
      <p className="mb-2 text-xs font-bold uppercase tracking-[0.16em] text-white/45">{label}</p>
      <div className="flex min-w-0 items-center gap-2 rounded-2xl border border-white/10 bg-white/5 p-2">
        <Icon className="ml-2 shrink-0 text-[#d6af57]" size={17} />
        <code title={value} className="min-w-0 flex-1 touch-pan-x overflow-x-auto whitespace-nowrap py-1 text-xs text-white/75 [scrollbar-width:thin] sm:text-sm">{value}</code>
        <button type="button" onClick={onCopy} className="inline-flex shrink-0 items-center rounded-xl bg-white/10 px-3 py-2 text-xs font-bold transition hover:bg-white/15">
          {copied ? <Check className="mr-1.5 text-emerald-400" size={15} /> : <Copy className="mr-1.5" size={15} />}{copied ? 'Copiado' : 'Copiar'}
        </button>
      </div>
    </div>
  );
}
