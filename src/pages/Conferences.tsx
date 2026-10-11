import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { usePeerConference } from '../hooks/usePeerConference';
import { safeRandomUUID } from '../utils/uuid';
import {
  ArrowLeft,
  Camera,
  CameraOff,
  Check,
  ChevronDown,
  Copy,
  Link2,
  LoaderCircle,
  Mic,
  MicOff,
  MonitorUp,
  PhoneOff,
  Plus,
  ScreenShareOff,
  Settings2,
  SwitchCamera,
  UserRound,
  Users,
  Video,
} from 'lucide-react';

type MediaStatus = 'idle' | 'loading' | 'ready' | 'error';
type CameraFacingMode = 'user' | 'environment';

const CasaSfuRoom = lazy(() => import('../components/conferences/CasaSfuRoom').then(module => ({ default: module.CasaSfuRoom })));
const conferenceApiUrl = String(import.meta.env.VITE_CONFERENCE_BACKEND_URL
  || (import.meta.env.DEV ? 'http://localhost:8787' : 'https://turn.caribbean-one.site')).replace(/\/$/, '');

function isPhoneDevice() {
  if (typeof navigator === 'undefined' || typeof window === 'undefined') return false;
  const mobileUserAgent = /Android|iPhone|iPad|iPod|IEMobile|Opera Mini/i.test(navigator.userAgent);
  const coarsePointer = window.matchMedia?.('(pointer: coarse)').matches ?? false;
  return mobileUserAgent || (coarsePointer && Math.min(window.screen.width, window.screen.height) <= 820);
}

function roomIdFromInput(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return '';

  try {
    const url = new URL(trimmed);
    const segments = url.pathname.split('/').filter(Boolean);
    return segments.at(-1) ?? '';
  } catch {
    const segments = trimmed.split('/').filter(Boolean);
    return segments.at(-1) ?? '';
  }
}

function MediaPreview({
  stream,
  cameraEnabled,
  screenSharing,
  mirrorVideo,
  muted = true,
  displayName,
}: {
  stream: MediaStream | null;
  cameraEnabled: boolean;
  screenSharing: boolean;
  mirrorVideo: boolean;
  muted?: boolean;
  displayName: string;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!videoRef.current) return;
    videoRef.current.srcObject = stream;
  }, [stream]);

  const videoVisible = Boolean(stream && (cameraEnabled || screenSharing));

  return (
    <div className="relative aspect-video w-full min-w-0 overflow-hidden rounded-2xl bg-[#071426] shadow-2xl shadow-slate-950/25 sm:min-h-[260px] sm:rounded-3xl">
      <video
        ref={videoRef}
        autoPlay
        muted={muted}
        playsInline
        className={`absolute inset-0 h-full w-full object-contain transition-opacity duration-300 sm:object-cover ${mirrorVideo ? '-scale-x-100' : ''} ${videoVisible ? 'opacity-100' : 'opacity-0'}`}
      />
      {!videoVisible && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-[radial-gradient(circle_at_center,_#173d65,_#071426_65%)] text-white">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-white/10 ring-1 ring-white/15">
            <UserRound size={42} className="text-[#d6af57]" />
          </div>
          <p className="mt-5 text-lg font-semibold">{displayName || 'Tu vista previa'}</p>
          <p className="mt-1 text-sm text-white/55">La cámara está apagada</p>
        </div>
      )}
      <div className="absolute bottom-2 left-2 flex max-w-[calc(100%-1rem)] items-center gap-2 truncate rounded-full bg-black/55 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur sm:bottom-4 sm:left-4">
        {screenSharing ? <MonitorUp size={14} /> : <UserRound size={14} />}
        {screenSharing ? `${muted ? 'Estás' : displayName} compartiendo pantalla` : displayName || 'Tú'}
      </div>
    </div>
  );
}

function ConferenceLanding() {
  const navigate = useNavigate();
  const [roomLink, setRoomLink] = useState('');
  const [joinError, setJoinError] = useState('');
  const [joining, setJoining] = useState(false);

  const createRoom = () => {
    navigate(`/conferencias/${safeRandomUUID()}`);
  };

  const joinRoom = async () => {
    const roomId = roomIdFromInput(roomLink);
    if (!roomId) {
      setJoinError('Escribe el código de 5 caracteres, el ID o el enlace de la sala.');
      return;
    }
    if (/^[A-Za-z0-9_-]{5}$/.test(roomId)) {
      setJoining(true);
      try {
        const response = await fetch(`${conferenceApiUrl}/api/livekit/resolve-room`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code: roomId }),
        });
        if (!response.ok) {
          setJoinError(response.status === 404 ? 'No encontramos una sala activa con ese código.' : response.status === 429 ? 'Demasiados intentos. Espera un minuto.' : 'No pudimos comprobar el código de la sala.');
          return;
        }
        const resolved = await response.json() as { roomId: string };
        navigate(`/conferencias/${encodeURIComponent(resolved.roomId)}`);
      } catch {
        setJoinError('No pudimos conectar con el servicio de conferencias.');
      } finally {
        setJoining(false);
      }
      return;
    }
    navigate(`/conferencias/${encodeURIComponent(roomId)}`);
  };

  return (
    <div data-release="conference-mvp-1" className="min-h-screen bg-[#f8f6f1] text-[#0b1d33]">
      <ConferenceHeader />
      <main className="mx-auto grid min-h-screen max-w-7xl items-center gap-12 px-5 pb-16 pt-32 lg:grid-cols-[1fr_0.9fr]">
        <section>
          <p className="text-xs font-bold uppercase tracking-[0.28em] text-[#a47d2e]">Reuniones digitales CASA</p>
          <h1 className="mt-5 max-w-3xl text-4xl font-semibold leading-tight tracking-tight md:text-6xl">
            Convoca, conecta y coordina tu comunidad.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
            Crea una sala segura para reuniones de trabajo, juntas y asambleas. Invita a los participantes y colabora en tiempo real desde cualquier dispositivo.
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={createRoom}
              className="inline-flex items-center justify-center rounded-full bg-[#0b1d33] px-7 py-3.5 text-sm font-bold text-white transition hover:bg-[#12345a]"
            >
              <Plus className="mr-2" size={18} /> Crear nueva sala
            </button>
            <Link
              to="/"
              className="inline-flex items-center justify-center rounded-full border border-[#0b1d33]/15 bg-white px-7 py-3.5 text-sm font-bold transition hover:border-[#b08a3c]/50"
            >
              <ArrowLeft className="mr-2" size={17} /> Volver al inicio
            </Link>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-900/8 md:p-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f1eadb] text-[#9a742b]">
            <Link2 size={23} />
          </div>
          <h2 className="mt-5 text-2xl font-semibold">Unirse a una reunión</h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">Utiliza el enlace de invitación, el ID completo o el código de acceso de 5 caracteres.</p>
          <div className="mt-6">
            <label htmlFor="room-link" className="text-sm font-semibold text-slate-700">Código, ID o enlace de sala</label>
            <input
              id="room-link"
              value={roomLink}
              onChange={(event) => {
                setRoomLink(event.target.value);
                setJoinError('');
              }}
              onKeyDown={(event) => event.key === 'Enter' && void joinRoom()}
              placeholder="Ej.: a7f29"
              autoCapitalize="none"
              autoCorrect="off"
              className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3.5 text-sm outline-none transition focus:border-[#b08a3c] focus:ring-4 focus:ring-[#b08a3c]/10"
            />
            {joinError && <p className="mt-2 text-sm text-red-600">{joinError}</p>}
          </div>
          <button
            type="button"
            onClick={() => void joinRoom()}
            disabled={joining}
            className="mt-5 inline-flex w-full items-center justify-center rounded-2xl border border-[#0b1d33] px-5 py-3.5 text-sm font-bold transition hover:bg-[#0b1d33] hover:text-white disabled:cursor-wait disabled:opacity-60"
          >
            {joining && <LoaderCircle className="mr-2 animate-spin" size={17} />}{joining ? 'Buscando sala…' : 'Unirme a la reunión'}
          </button>
          <p className="mt-5 rounded-2xl bg-[#f8f6f1] px-4 py-3 text-xs leading-5 text-slate-500">
            Videoconferencia, pantalla compartida y pizarra colaborativa en un mismo espacio protegido.
          </p>
        </section>
      </main>
    </div>
  );
}

function ConferenceHeader() {
  return (
    <header className="fixed left-0 right-0 top-0 z-50 border-b border-[#0b1d33]/10 bg-white/90 backdrop-blur-xl">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
        <Link to="/" className="flex items-center gap-3">
          <img src="/casa-wordmark-light.png" alt="CASA" className="h-9 w-auto max-w-[180px] object-contain" />
        </Link>
        <Link to="/" className="inline-flex items-center text-sm font-semibold text-slate-600 transition hover:text-[#0b1d33]">
          <ArrowLeft className="mr-2" size={16} /> Inicio
        </Link>
      </nav>
    </header>
  );
}

function ConferenceRoom({ roomId }: { roomId: string }) {
  const navigate = useNavigate();
  const sfuEnabled = import.meta.env.PROD && import.meta.env.VITE_CONFERENCE_SFU_ENABLED !== 'false';
  const [isPhone] = useState(isPhoneDevice);
  const cameraStreamRef = useRef<MediaStream | null>(null);
  const screenStreamRef = useRef<MediaStream | null>(null);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [screenStream, setScreenStream] = useState<MediaStream | null>(null);
  const [mediaStatus, setMediaStatus] = useState<MediaStatus>('idle');
  const [mediaError, setMediaError] = useState('');
  const [cameras, setCameras] = useState<MediaDeviceInfo[]>([]);
  const [microphones, setMicrophones] = useState<MediaDeviceInfo[]>([]);
  const [cameraId, setCameraId] = useState('');
  const [cameraFacingMode, setCameraFacingMode] = useState<CameraFacingMode>('user');
  const [microphoneId, setMicrophoneId] = useState('');
  const [cameraEnabled, setCameraEnabled] = useState(true);
  const [microphoneEnabled, setMicrophoneEnabled] = useState(true);
  const [displayName, setDisplayName] = useState('');
  const [joined, setJoined] = useState(false);
  const [copied, setCopied] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const {
    status: conferenceStatus,
    error: conferenceError,
    remoteStream,
    remoteParticipant,
    remoteMediaState,
    connect: connectConference,
    disconnect: disconnectConference,
    updateLocalStream,
    sendMediaState,
  } = usePeerConference(roomId);

  const stopStream = useCallback((stream: MediaStream | null) => {
    stream?.getTracks().forEach(track => track.stop());
  }, []);

  const refreshDevices = useCallback(async () => {
    const available = await navigator.mediaDevices.enumerateDevices();
    const availableCameras = available.filter(device => device.kind === 'videoinput');
    const availableMicrophones = available.filter(device => device.kind === 'audioinput');
    setCameras(availableCameras);
    setMicrophones(availableMicrophones);
    setCameraId(current => current || availableCameras[0]?.deviceId || '');
    setMicrophoneId(current => current || availableMicrophones[0]?.deviceId || '');
  }, []);

  const startMedia = useCallback(async (nextCameraId?: string, nextMicrophoneId?: string, nextFacingMode: CameraFacingMode = 'user') => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setMediaStatus('error');
      setMediaError('Este navegador no permite acceder a cámara y micrófono. Usa una versión reciente mediante HTTPS.');
      return;
    }

    setMediaStatus('loading');
    setMediaError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: nextCameraId
          ? { deviceId: { exact: nextCameraId }, width: { ideal: 1280 }, height: { ideal: 720 } }
          : { facingMode: { ideal: nextFacingMode }, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: nextMicrophoneId ? { deviceId: { exact: nextMicrophoneId }, echoCancellation: true, noiseSuppression: true } : { echoCancellation: true, noiseSuppression: true },
      });
      stopStream(cameraStreamRef.current);
      cameraStreamRef.current = stream;
      stream.getVideoTracks().forEach(track => { track.enabled = cameraEnabled; });
      stream.getAudioTracks().forEach(track => { track.enabled = microphoneEnabled; });
      setCameraStream(stream);
      const videoSettings = stream.getVideoTracks()[0]?.getSettings();
      setCameraId(videoSettings?.deviceId || nextCameraId || '');
      setCameraFacingMode(videoSettings?.facingMode === 'environment' ? 'environment' : nextFacingMode);
      setMicrophoneId(stream.getAudioTracks()[0]?.getSettings().deviceId || nextMicrophoneId || '');
      setMediaStatus('ready');
      await refreshDevices();
    } catch (error) {
      const name = error instanceof DOMException ? error.name : '';
      setMediaStatus('error');
      setMediaError(name === 'NotAllowedError'
        ? 'Permite el acceso a la cámara y al micrófono desde la barra del navegador para continuar.'
        : name === 'NotFoundError'
          ? 'No encontramos una cámara o un micrófono disponible en este dispositivo.'
          : 'No pudimos iniciar los dispositivos. Revisa que ninguna otra aplicación los esté utilizando.');
    }
  }, [cameraEnabled, microphoneEnabled, refreshDevices, stopStream]);

  useEffect(() => {
    const initializationTimer = window.setTimeout(() => void startMedia(), 0);
    return () => {
      window.clearTimeout(initializationTimer);
      stopStream(cameraStreamRef.current);
      stopStream(screenStreamRef.current);
    };
    // Device initialization should only run once for this room.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId]);

  useEffect(() => {
    const audioTrack = cameraStream?.getAudioTracks()[0];
    if (!audioTrack || !microphoneEnabled) {
      return;
    }

    const audioContext = new AudioContext();
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 256;
    const source = audioContext.createMediaStreamSource(new MediaStream([audioTrack]));
    source.connect(analyser);
    const values = new Uint8Array(analyser.frequencyBinCount);
    let frame = 0;

    const measure = () => {
      analyser.getByteFrequencyData(values);
      const average = values.reduce((sum, value) => sum + value, 0) / values.length;
      setAudioLevel(Math.min(100, Math.round(average * 1.6)));
      frame = requestAnimationFrame(measure);
    };
    measure();

    return () => {
      cancelAnimationFrame(frame);
      source.disconnect();
      void audioContext.close();
    };
  }, [cameraStream, microphoneEnabled]);

  const toggleCamera = () => {
    const enabled = !cameraEnabled;
    cameraStreamRef.current?.getVideoTracks().forEach(track => { track.enabled = enabled; });
    setCameraEnabled(enabled);
  };

  const switchCamera = async () => {
    const nextFacingMode: CameraFacingMode = cameraFacingMode === 'user' ? 'environment' : 'user';
    cameraStreamRef.current?.getVideoTracks().forEach(track => track.stop());
    await startMedia(undefined, microphoneId, nextFacingMode);
  };

  const toggleMicrophone = () => {
    const enabled = !microphoneEnabled;
    cameraStreamRef.current?.getAudioTracks().forEach(track => { track.enabled = enabled; });
    setMicrophoneEnabled(enabled);
  };

  const stopScreenShare = useCallback(() => {
    stopStream(screenStreamRef.current);
    screenStreamRef.current = null;
    setScreenStream(null);
  }, [stopStream]);

  const toggleScreenShare = async () => {
    if (screenStreamRef.current) {
      stopScreenShare();
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: false });
      screenStreamRef.current = stream;
      setScreenStream(stream);
      stream.getVideoTracks()[0]?.addEventListener('ended', stopScreenShare, { once: true });
    } catch (error) {
      if (!(error instanceof DOMException && error.name === 'NotAllowedError')) {
        setMediaError('No pudimos iniciar la pantalla compartida. Inténtalo nuevamente.');
      }
    }
  };

  const copyRoomLink = async () => {
    await navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  const outgoingStream = useCallback(() => {
    if (!cameraStream) return null;
    const tracks = [
      ...cameraStream.getAudioTracks(),
      ...(screenStream?.getVideoTracks() ?? cameraStream.getVideoTracks()),
    ];
    return new MediaStream(tracks);
  }, [cameraStream, screenStream]);

  const joinConference = async () => {
    const stream = outgoingStream();
    if (!stream) return;
    if (sfuEnabled) {
      stopStream(cameraStreamRef.current);
      stopStream(screenStreamRef.current);
      cameraStreamRef.current = null;
      screenStreamRef.current = null;
      setJoined(true);
      return;
    }
    try {
      await connectConference(displayName.trim(), stream);
      setJoined(true);
    } catch {
      // The hook exposes a user-facing connection error.
    }
  };

  useEffect(() => {
    if (!joined) return;
    const stream = outgoingStream();
    if (stream) void updateLocalStream(stream);
  }, [joined, outgoingStream, updateLocalStream]);

  useEffect(() => {
    if (!joined) return;
    sendMediaState({ cameraEnabled, microphoneEnabled, screenSharing: Boolean(screenStream) });
  }, [cameraEnabled, joined, microphoneEnabled, screenStream, sendMediaState]);

  const leaveRoom = () => {
    disconnectConference();
    stopStream(cameraStreamRef.current);
    stopStream(screenStreamRef.current);
    cameraStreamRef.current = null;
    screenStreamRef.current = null;
    navigate('/conferencias');
  };

  const activeStream = screenStream ?? cameraStream;
  const canJoin = mediaStatus === 'ready' && displayName.trim().length >= 2 && conferenceStatus !== 'connecting';

  if (!joined) {
    return (
      <div className="min-h-screen bg-[#f8f6f1] text-[#0b1d33]">
        <ConferenceHeader />
        <main className="mx-auto grid w-full max-w-7xl gap-6 overflow-x-hidden px-3 pb-8 pt-24 sm:px-5 sm:pb-12 sm:pt-28 lg:grid-cols-[minmax(0,1.25fr)_minmax(280px,0.75fr)] lg:items-center lg:gap-8">
          <section className="min-w-0">
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
              <div className="min-w-0">
                <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#a47d2e]">Antes de entrar</p>
                <h1 className="mt-2 text-2xl font-semibold sm:text-3xl">Configura tu acceso a la reunión</h1>
              </div>
              <button type="button" onClick={copyRoomLink} className="inline-flex w-full items-center justify-center self-start rounded-full border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold shadow-sm transition hover:border-[#b08a3c]/50 sm:w-auto sm:shrink-0">
                {copied ? <Check className="mr-2 text-emerald-600" size={15} /> : <Copy className="mr-2" size={15} />}
                {copied ? 'Copiado' : 'Copiar enlace'}
              </button>
            </div>
            <MediaPreview stream={activeStream} cameraEnabled={cameraEnabled} screenSharing={Boolean(screenStream)} mirrorVideo={!screenStream && cameraFacingMode === 'user'} displayName={displayName} />
            <div className="mt-5 flex flex-wrap justify-center gap-3">
              <RoundControl active={microphoneEnabled} label={microphoneEnabled ? 'Silenciar' : 'Activar micrófono'} onClick={toggleMicrophone} icon={microphoneEnabled ? Mic : MicOff} />
              <RoundControl active={cameraEnabled} label={cameraEnabled ? 'Apagar cámara' : 'Encender cámara'} onClick={toggleCamera} icon={cameraEnabled ? Camera : CameraOff} />
              {isPhone && cameras.length > 1 && !screenStream && <RoundControl active label="Cambiar cámara" onClick={() => void switchCamera()} icon={SwitchCamera} />}
              <RoundControl active={Boolean(screenStream)} label={screenStream ? 'Dejar de presentar' : 'Compartir pantalla'} onClick={() => void toggleScreenShare()} icon={screenStream ? ScreenShareOff : MonitorUp} />
            </div>
          </section>

          <aside className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-xl shadow-slate-900/8 sm:rounded-3xl sm:p-6 md:p-8">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#f1eadb] text-[#9a742b]"><Settings2 size={21} /></div>
              <div><h2 className="font-semibold">Tus dispositivos</h2><p className="text-xs text-slate-500">Sala {roomId.slice(0, 8)}</p></div>
            </div>

            {mediaStatus === 'loading' && <div className="mt-6 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">Solicitando acceso a cámara y micrófono…</div>}
            {mediaError && <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-700">{mediaError}</div>}
            {conferenceError && <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-700">{conferenceError}</div>}

            <label className="mt-6 block text-sm font-semibold text-slate-700" htmlFor="display-name">Tu nombre</label>
            <input
              id="display-name"
              value={displayName}
              onChange={event => setDisplayName(event.target.value)}
              placeholder="¿Cómo quieres aparecer?"
              className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-base outline-none transition focus:border-[#b08a3c] focus:ring-4 focus:ring-[#b08a3c]/10 sm:text-sm"
            />

            <DeviceSelect label="Cámara" value={cameraId} devices={cameras} onChange={(value) => { setCameraId(value); void startMedia(value, microphoneId); }} />
            <DeviceSelect label="Micrófono" value={microphoneId} devices={microphones} onChange={(value) => { setMicrophoneId(value); void startMedia(cameraId, value); }} />

            <div className="mt-5">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-500"><span>Nivel del micrófono</span><span>{microphoneEnabled ? 'Activo' : 'Silenciado'}</span></div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-emerald-500 transition-[width] duration-75" style={{ width: `${microphoneEnabled ? Math.max(3, audioLevel) : 0}%` }} /></div>
            </div>

            <button
              type="button"
              disabled={!canJoin}
              onClick={() => void joinConference()}
              className="mt-7 w-full rounded-2xl bg-[#0b1d33] px-5 py-3.5 text-sm font-bold text-white transition hover:bg-[#12345a] disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
            >
              {conferenceStatus === 'connecting' ? 'Conectando…' : 'Entrar a la reunión'}
            </button>
            {mediaStatus === 'error' && <button type="button" onClick={() => void startMedia(cameraId, microphoneId)} className="mt-3 w-full text-sm font-semibold text-[#8a6725]">Intentar nuevamente</button>}
          </aside>
        </main>
      </div>
    );
  }

  if (sfuEnabled) {
    return (
      <Suspense fallback={<main className="flex min-h-[100dvh] items-center justify-center bg-[#050d18] text-sm text-white/70">Preparando sala CASA…</main>}>
        <CasaSfuRoom roomId={roomId} displayName={displayName.trim()} onLeave={() => navigate('/conferencias')} />
      </Suspense>
    );
  }

  return (
    <div className="min-h-[100dvh] overflow-x-hidden bg-[#050d18] text-white">
      <header className="flex min-w-0 items-center justify-between gap-2 border-b border-white/10 px-3 py-3 sm:gap-4 sm:px-5 sm:py-4">
        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
          <img src="/casa-wordmark-dark.png" alt="CASA" className="h-8 w-auto max-w-[150px] object-contain" />
          <div className="min-w-0"><p className="truncate text-sm font-semibold">Reunión CASA</p><p className="text-xs text-white/45">{roomId.slice(0, 8)}</p></div>
        </div>
        <button type="button" onClick={copyRoomLink} className="inline-flex shrink-0 items-center rounded-full border border-white/15 px-3 py-2 text-xs font-semibold transition hover:bg-white/10 sm:px-4">
          {copied ? <Check className="text-emerald-400 sm:mr-2" size={15} /> : <Copy className="sm:mr-2" size={15} />}
          <span className="hidden sm:inline">{copied ? 'Enlace copiado' : 'Copiar enlace'}</span>
          <span className="sr-only sm:hidden">{copied ? 'Enlace copiado' : 'Copiar enlace'}</span>
        </button>
      </header>

      <main className="grid w-full min-w-0 gap-3 p-2 sm:gap-4 sm:p-4 lg:min-h-[calc(100dvh-74px)] lg:grid-cols-[minmax(0,1fr)_290px]">
        <section className="flex min-w-0 flex-col lg:min-h-[65vh]">
          <div className={`grid min-w-0 flex-1 content-center gap-3 sm:gap-4 ${remoteParticipant ? 'md:grid-cols-2' : ''}`}>
            <MediaPreview stream={activeStream} cameraEnabled={cameraEnabled} screenSharing={Boolean(screenStream)} mirrorVideo={!screenStream && cameraFacingMode === 'user'} displayName={displayName} />
            {remoteParticipant && (
              <MediaPreview
                stream={remoteStream}
                cameraEnabled={remoteMediaState.cameraEnabled}
                screenSharing={remoteMediaState.screenSharing}
                mirrorVideo={false}
                muted={false}
                displayName={remoteParticipant.displayName}
              />
            )}
          </div>
          {!remoteParticipant && <p className="mt-3 text-center text-sm text-white/55">Esperando participantes… Comparte el enlace de la sala.</p>}
          {conferenceError && <p className="mt-3 text-center text-sm text-red-300">{conferenceError}</p>}
          <div className="mt-3 grid grid-cols-3 items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 p-2 sm:mt-4 sm:flex sm:flex-wrap sm:gap-3 sm:p-3">
            <RoomControl label={microphoneEnabled ? 'Silenciar' : 'Activar audio'} onClick={toggleMicrophone} icon={microphoneEnabled ? Mic : MicOff} active={microphoneEnabled} />
            <RoomControl label={cameraEnabled ? 'Apagar cámara' : 'Encender cámara'} onClick={toggleCamera} icon={cameraEnabled ? Video : CameraOff} active={cameraEnabled} />
            {isPhone && cameras.length > 1 && !screenStream && <RoomControl label="Cambiar cámara" onClick={() => void switchCamera()} icon={SwitchCamera} active />}
            <RoomControl label={screenStream ? 'Dejar de presentar' : 'Compartir pantalla'} onClick={() => void toggleScreenShare()} icon={screenStream ? ScreenShareOff : MonitorUp} active={Boolean(screenStream)} />
            <button type="button" onClick={leaveRoom} title="Salir" className="inline-flex min-h-11 items-center justify-center rounded-full bg-red-600 px-3 py-3 text-sm font-bold transition hover:bg-red-500 sm:min-w-28 sm:px-5"><PhoneOff size={18} /><span className="ml-2 hidden sm:inline">Salir</span><span className="sr-only sm:hidden">Salir</span></button>
          </div>
        </section>

        <aside className="min-w-0 rounded-2xl border border-white/10 bg-white/[0.04] p-4 sm:rounded-3xl sm:p-5">
          <div className="flex items-center justify-between"><h2 className="flex items-center font-semibold"><Users className="mr-2 text-[#d6af57]" size={19} />Participantes</h2><span className="rounded-full bg-white/10 px-2.5 py-1 text-xs">{remoteParticipant ? 2 : 1}</span></div>
          <div className="mt-5 flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#d6af57] font-bold text-[#0b1d33]">{displayName.trim().charAt(0).toUpperCase()}</div>
            <div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">{displayName}</p><p className="text-xs text-white/45">Tú · Anfitrión</p></div>
            {microphoneEnabled ? <Mic size={16} className="text-emerald-400" /> : <MicOff size={16} className="text-red-400" />}
          </div>
          {remoteParticipant && (
            <div className="mt-3 flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#173d65] font-bold text-white">{remoteParticipant.displayName.charAt(0).toUpperCase()}</div>
              <div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">{remoteParticipant.displayName}</p><p className="text-xs text-white/45">Participante</p></div>
              {remoteMediaState.microphoneEnabled ? <Mic size={16} className="text-emerald-400" /> : <MicOff size={16} className="text-red-400" />}
            </div>
          )}
          <div className="mt-5 rounded-2xl bg-[#d6af57]/10 p-4 text-xs leading-5 text-[#f0d78f]">
            {conferenceStatus === 'connected' ? 'Conexión multimedia establecida.' : remoteParticipant ? 'Conectando audio y video…' : 'Comparte el enlace para invitar participantes.'}
          </div>
        </aside>
      </main>
    </div>
  );
}

function DeviceSelect({ label, value, devices, onChange }: { label: string; value: string; devices: MediaDeviceInfo[]; onChange: (value: string) => void }) {
  return (
    <label className="mt-5 block text-sm font-semibold text-slate-700">
      {label}
      <span className="relative mt-2 block">
        <select value={value} onChange={event => onChange(event.target.value)} className="w-full appearance-none rounded-2xl border border-slate-200 bg-white px-4 py-3 pr-10 text-sm font-normal outline-none transition focus:border-[#b08a3c] focus:ring-4 focus:ring-[#b08a3c]/10">
          {devices.length === 0 && <option value="">No disponible</option>}
          {devices.map((device, index) => <option value={device.deviceId} key={device.deviceId}>{device.label || `${label} ${index + 1}`}</option>)}
        </select>
        <ChevronDown className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
      </span>
    </label>
  );
}

function RoundControl({ active, label, onClick, icon: Icon }: { active: boolean; label: string; onClick: () => void; icon: typeof Mic }) {
  return <button type="button" onClick={onClick} title={label} className={`inline-flex h-12 w-12 items-center justify-center rounded-full border shadow-sm transition ${active ? 'border-slate-200 bg-white text-[#0b1d33] hover:border-[#b08a3c]' : 'border-red-200 bg-red-50 text-red-600'}`}><Icon size={20} /></button>;
}

function RoomControl({ active, label, onClick, icon: Icon }: { active: boolean; label: string; onClick: () => void; icon: typeof Mic }) {
  return <button type="button" onClick={onClick} title={label} className={`inline-flex min-h-11 min-w-0 items-center justify-center rounded-full border px-3 py-3 text-sm font-semibold transition sm:px-4 ${active ? 'border-white/15 bg-white/10 hover:bg-white/15' : 'border-red-400/30 bg-red-500/15 text-red-200'}`}><Icon size={18} /><span className="ml-2 hidden sm:inline">{label}</span><span className="sr-only sm:hidden">{label}</span></button>;
}

export default function Conferences() {
  const { roomId } = useParams();
  return roomId ? <ConferenceRoom roomId={roomId} /> : <ConferenceLanding />;
}
