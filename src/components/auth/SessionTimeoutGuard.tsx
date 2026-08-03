import { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, RefreshCw, LogOut, Timer } from 'lucide-react';
import { CasaAuthService } from '../../services/CasaAuthService';
import { RootSession } from '../../services/RootSession';
import { StaffSession } from '../../services/StaffSession';

const IDLE_TIMEOUT_MS = 9 * 60 * 1000; // 9 minutes of inactivity
const COUNTDOWN_SECONDS = 60; // 60 seconds warning countdown

export function SessionTimeoutGuard({ children }: { children?: React.ReactNode }) {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [countdown, setCountdown] = useState(COUNTDOWN_SECONDS);
  const [refreshing, setRefreshing] = useState(false);

  const lastActivityRef = useRef<number>(Date.now());
  const modalOpenRef = useRef<boolean>(false);

  // Helper to determine if there is an active session
  const getActiveSessionType = (): 'root' | 'staff' | null => {
    if (RootSession.token() && RootSession.refreshToken()) return 'root';
    if (StaffSession.token() && StaffSession.refreshToken()) return 'staff';
    return null;
  };

  const handleLogout = useCallback(() => {
    setShowModal(false);
    modalOpenRef.current = false;
    const sessionType = getActiveSessionType();
    RootSession.clear();
    StaffSession.clear();
    const loginTarget = sessionType === 'root' ? '/' : '/staff-login';
    navigate(loginTarget, { replace: true, state: { reason: 'idle-timeout' } });
  }, [navigate]);

  // Perform silent token refresh
  const extendSession = useCallback(async () => {
    const sessionType = getActiveSessionType();
    if (!sessionType) {
      setShowModal(false);
      modalOpenRef.current = false;
      return;
    }

    setRefreshing(true);
    try {
      if (sessionType === 'root') {
        const refreshToken = RootSession.refreshToken();
        const res = await CasaAuthService.refresh(refreshToken);
        if (res.success) {
          RootSession.updateTokens(res.data.accessToken, res.data.refreshToken);
        } else {
          handleLogout();
          return;
        }
      } else {
        const refreshToken = StaffSession.refreshToken();
        const communityId = StaffSession.context()?.communityId;
        const res = await CasaAuthService.refresh(refreshToken, communityId);
        if (res.success) {
          StaffSession.updateTokens(res.data.accessToken, res.data.refreshToken);
        } else {
          handleLogout();
          return;
        }
      }
      // Reset activity and hide modal
      lastActivityRef.current = Date.now();
      setShowModal(false);
      modalOpenRef.current = false;
    } catch {
      handleLogout();
    } finally {
      setRefreshing(false);
    }
  }, [handleLogout]);

  // Activity listener
  useEffect(() => {
    const handleUserActivity = () => {
      // If modal is not open, update activity timestamp
      if (!modalOpenRef.current) {
        lastActivityRef.current = Date.now();
      }
    };

    const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];
    events.forEach((ev) => window.addEventListener(ev, handleUserActivity, { passive: true }));

    return () => {
      events.forEach((ev) => window.removeEventListener(ev, handleUserActivity));
    };
  }, []);

  // Idle check timer (checks every 2 seconds)
  useEffect(() => {
    const interval = setInterval(() => {
      const sessionType = getActiveSessionType();
      if (!sessionType) {
        if (modalOpenRef.current) {
          setShowModal(false);
          modalOpenRef.current = false;
        }
        return;
      }

      const elapsed = Date.now() - lastActivityRef.current;
      if (!modalOpenRef.current && elapsed >= IDLE_TIMEOUT_MS) {
        setShowModal(true);
        modalOpenRef.current = true;
        setCountdown(COUNTDOWN_SECONDS);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  // Countdown timer when modal is visible
  useEffect(() => {
    if (!showModal) return;

    if (countdown <= 0) {
      handleLogout();
      return;
    }

    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [showModal, countdown, handleLogout]);

  return (
    <>
      {children}

      {showModal && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#071a33]/65 p-4 backdrop-blur-md animate-fade-in"
          role="dialog"
          aria-modal="true"
          aria-labelledby="session-timeout-title"
        >
          <div className="w-full max-w-md overflow-hidden rounded-[2rem] border border-[#b08a3c]/30 bg-white p-7 shadow-[0_24px_70px_rgba(7,26,51,0.25)] sm:p-8">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-[#b08a3c]/30 bg-[#f8f3e8] text-[#9a742b]">
                <Clock size={24} />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#9a742b]">
                  Seguridad y Privacidad
                </p>
                <h3 id="session-timeout-title" className="text-xl font-bold text-[#071a33]">
                  Inactividad detectada
                </h3>
              </div>
            </div>

            <div className="mt-5 rounded-2xl border border-[#b08a3c]/20 bg-[#f8f3e8]/70 p-4">
              <div className="flex items-center justify-between text-xs font-bold text-[#7b5c20]">
                <span className="flex items-center gap-1.5">
                  <Timer size={16} className="text-[#9a742b]" />
                  Cierre automático en:
                </span>
                <span className="rounded-full bg-[#071a33] px-3 py-1 text-sm tabular-nums font-extrabold text-[#e4c26f]">
                  00:{String(countdown).padStart(2, '0')}
                </span>
              </div>
              <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-[#e4c26f]/30">
                <div
                  className="h-full bg-gradient-to-r from-[#9a742b] to-[#e4c26f] transition-all duration-1000 ease-linear"
                  style={{ width: `${(countdown / COUNTDOWN_SECONDS) * 100}%` }}
                />
              </div>
            </div>

            <p className="mt-4 text-sm leading-6 text-slate-600">
              Hemos detectado 9 minutos sin actividad. Por razones de seguridad, tu sesión finalizará si no confirmas tu presencia. Los datos no guardados podrían perderse.
            </p>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={extendSession}
                disabled={refreshing}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-full bg-[#071a33] px-6 py-3.5 text-sm font-bold text-white shadow-lg transition hover:bg-[#12335a] focus:ring-2 focus:ring-[#b08a3c] disabled:opacity-60"
              >
                <RefreshCw size={17} className={refreshing ? 'animate-spin' : ''} />
                {refreshing ? 'Renovando...' : 'Mantener sesión activa'}
              </button>

              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-5 py-3.5 text-sm font-bold text-slate-600 transition hover:border-rose-300 hover:bg-rose-50 hover:text-rose-700"
              >
                <LogOut size={17} />
                Salir
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
