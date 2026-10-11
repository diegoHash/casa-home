import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, LogOut, RefreshCw, Timer } from 'lucide-react';
import { CasaAuthService } from '../../services/CasaAuthService';
import { RootSession } from '../../services/RootSession';
import { StaffSession } from '../../services/StaffSession';

type SessionType = 'root' | 'staff';
const IDLE_TIMEOUT_MS = 15 * 60 * 1000;
const FINAL_WARNING_SECONDS = 15;
const ACTIVITY_EVENTS: Array<keyof WindowEventMap> = [
  'pointerdown', 'keydown', 'input', 'change', 'scroll', 'touchstart',
];

function activeSession(): SessionType | null {
  if (RootSession.token() && RootSession.refreshToken()) return 'root';
  if (StaffSession.token() && StaffSession.refreshToken()) return 'staff';
  return null;
}

function lastActivity(type: SessionType) {
  return type === 'root' ? RootSession.lastActivityAt() : StaffSession.lastActivityAt();
}

function touch(type: SessionType) {
  if (type === 'root') RootSession.touch();
  else StaffSession.touch();
}

function remainingSeconds(type: SessionType | null) {
  return type ? Math.max(0, Math.ceil((IDLE_TIMEOUT_MS - (Date.now() - lastActivity(type))) / 1000)) : null;
}

function formatTime(seconds: number) {
  return `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
}

export function SessionTimeoutGuard({ children }: { children?: React.ReactNode }) {
  const navigate = useNavigate();
  const [sessionType, setSessionType] = useState<SessionType | null>(() => activeSession());
  const [seconds, setSeconds] = useState<number | null>(() => remainingSeconds(activeSession()));
  const [showModal, setShowModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const showModalRef = useRef(false);

  const handleLogout = useCallback(async () => {
    const type = activeSession();
    const refreshToken = type === 'root' ? RootSession.refreshToken() : type === 'staff' ? StaffSession.refreshToken() : '';
    setShowModal(false);
    if (type === 'root') RootSession.clear();
    else if (type === 'staff') StaffSession.clear();
    try {
      await CasaAuthService.logout(refreshToken);
    } finally {
      navigate(type === 'root' ? '/' : '/staff-login', { replace: true, state: { reason: 'session-expired' } });
    }
  }, [navigate]);

  const extendSession = useCallback(async () => {
    const type = activeSession();
    if (!type) return handleLogout();
    setRefreshing(true);
    try {
      const result = type === 'root'
        ? await CasaAuthService.refresh(RootSession.refreshToken())
        : await CasaAuthService.refresh(StaffSession.refreshToken(), StaffSession.context()?.communityId);
      if (!result.success) return handleLogout();
      if (type === 'root') RootSession.updateTokens(result.data.accessToken, result.data.refreshToken);
      else StaffSession.updateTokens(result.data.accessToken, result.data.refreshToken);
      touch(type);
      setSessionType(type);
      setSeconds(remainingSeconds(type));
      showModalRef.current = false;
      setShowModal(false);
    } catch {
      await handleLogout();
    } finally {
      setRefreshing(false);
    }
  }, [handleLogout]);

  useEffect(() => {
    const update = () => {
      const type = activeSession();
      const remaining = remainingSeconds(type);
      setSessionType(type);
      setSeconds(remaining);
      if (!type) {
        showModalRef.current = false;
        setShowModal(false);
      } else if (remaining !== null && remaining <= FINAL_WARNING_SECONDS) {
        showModalRef.current = true;
        setShowModal(true);
      }
    };
    const onActivity = () => {
      if (showModalRef.current) return;
      const type = activeSession();
      if (type) {
        touch(type);
        setSeconds(Math.ceil(IDLE_TIMEOUT_MS / 1000));
      }
    };
    update();
    const timer = window.setInterval(update, 1000);
    ACTIVITY_EVENTS.forEach((event) => window.addEventListener(event, onActivity, { passive: true }));
    return () => {
      window.clearInterval(timer);
      ACTIVITY_EVENTS.forEach((event) => window.removeEventListener(event, onActivity));
    };
  }, []);

  useEffect(() => {
    if (!showModal || refreshing || seconds === null || seconds > 0) return;
    void handleLogout();
  }, [showModal, refreshing, seconds, handleLogout]);

  return <>
    {children}
    {sessionType && seconds !== null && !showModal && <div className="fixed bottom-4 right-4 z-[90] flex items-center gap-2 rounded-full border border-[#b08a3c]/30 bg-white px-3.5 py-2 text-xs font-bold text-[#071a33] shadow-lg" aria-live="polite"><Timer size={15} className="text-[#9a742b]" />Sesión: <span className="tabular-nums">{formatTime(seconds)}</span></div>}
    {showModal && <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#071a33]/65 p-4 backdrop-blur-md" role="dialog" aria-modal="true" aria-labelledby="session-expired-title"><div className="w-full max-w-md rounded-[2rem] border border-[#b08a3c]/30 bg-white p-7 shadow-[0_24px_70px_rgba(7,26,51,0.25)] sm:p-8"><div className="flex items-center gap-3"><div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#b08a3c]/30 bg-[#f8f3e8] text-[#9a742b]"><Clock size={24} /></div><div><p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#9a742b]">Seguridad y privacidad</p><h3 id="session-expired-title" className="text-xl font-bold text-[#071a33]">Tu sesión está por vencer</h3></div></div><p className="mt-5 text-sm leading-6 text-slate-600">No detectamos actividad. Se cerrará tu sesión en <strong>{seconds ?? FINAL_WARNING_SECONDS} segundos</strong>. ¿Deseas permanecer activo?</p><div className="mt-7 flex flex-col gap-3 sm:flex-row"><button type="button" onClick={extendSession} disabled={refreshing} className="flex-1 inline-flex items-center justify-center gap-2 rounded-full bg-[#071a33] px-6 py-3.5 text-sm font-bold text-white disabled:opacity-60"><RefreshCw size={17} className={refreshing ? 'animate-spin' : ''} />{refreshing ? 'Renovando...' : 'Permanecer activo'}</button><button type="button" onClick={() => void handleLogout()} className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-5 py-3.5 text-sm font-bold text-slate-600"><LogOut size={17} />Cerrar sesión</button></div></div></div>}
  </>;
}
