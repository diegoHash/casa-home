import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Building2, Lock, Mail, ShieldCheck } from 'lucide-react';
import { AuthService } from '../services/AuthService';
import { RootSession } from '../services/RootSession';

export default function Login() {
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  const [mode, setMode] = useState('login');
  const [recoveryToken, setRecoveryToken] = useState<string | null>(null);
  const [recoveryMethod, setRecoveryMethod] = useState('EMAIL');

  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('recoveryToken');
    if (token) {
      setRecoveryToken(token);
      setMode('reset');
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setRedirecting(false);
    setLoading(true);
    let willRedirect = false;

    try {
      const cleanUsername = username.trim().toLowerCase();
      let result;
      if (mode === 'register') {
        result = await AuthService.register(cleanUsername, pin);
      } else if (mode === 'recover') {
        result = await AuthService.requestRecoveryLink(cleanUsername, recoveryMethod);
        if (result.success) {
          setSuccessMsg(`Se ha enviado un enlace de recuperación por ${recoveryMethod === 'TELEGRAM' ? 'Telegram' : 'correo'}. Por favor, revisa tus mensajes.`);
          setUsername('');
        } else {
          setError(result.error || 'Error al solicitar recuperación.');
        }
      } else if (mode === 'reset') {
        if (!recoveryToken) return;
        result = await AuthService.resetPassword(recoveryToken, pin);
        if (result.success) {
          setSuccessMsg('Contraseña restablecida con éxito. Inicia sesión con tu nueva contraseña.');
          setMode('login');
          setPin('');
          window.history.replaceState({}, document.title, window.location.pathname);
          setRecoveryToken(null);
        } else {
          setError(result.error || 'Error al restablecer contraseña. El enlace pudo haber expirado.');
        }
      } else {
        result = await AuthService.login(cleanUsername, pin);
        if (result.success) {
          const role = String(result.user?.role || '').trim().toUpperCase();
          const originApp = String(result.user?.originApp || '').trim().toUpperCase();
          const targetApp = originApp.includes('CAC')
            ? 'CAC'
            : originApp.includes('POS')
              ? 'POS'
              : ['OS', 'SUPERVISOR'].includes(role)
                ? 'CAC'
                : 'POS';
          if (role === 'ROOT') {
            RootSession.save(result.token, result.user);
            navigate('/dashboard', { replace: true });
          } else if (targetApp === 'POS') {
            const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.hostname.startsWith('192.168');
            willRedirect = true;
            setRedirecting(true);
            setSuccessMsg('Acceso correcto. Abriendo POS...');
            window.location.assign(isLocal ? `http://localhost:5174?sso=${result.token}` : `https://pos.caribbean-one.site?sso=${result.token}`);
          } else if (targetApp === 'CAC') {
            const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.hostname.startsWith('192.168');
            willRedirect = true;
            setRedirecting(true);
            setSuccessMsg('Acceso correcto. Abriendo CAC...');
            window.location.assign(isLocal ? `http://localhost:5175?sso=${result.token}` : `https://cac.caribbean-one.site?sso=${result.token}`);
          }
        } else {
          setError(result.error || 'Error de autenticación');
        }
      }
    } catch {
      setError('Ocurrió un error inesperado.');
    } finally {
      if (!willRedirect) {
        setLoading(false);
      }
    }
  };

  const getTitle = () => {
    if (mode === 'register') return 'Registro interno';
    if (mode === 'recover') return 'Recuperar contraseña';
    if (mode === 'reset') return 'Nueva contraseña';
    return 'Acceso del personal';
  };

  const getSubTitle = () => {
    if (mode === 'register') return 'Crear nuevo usuario en el sistema';
    if (mode === 'recover') return 'Ingresa tu usuario para recibir un enlace de recuperación';
    if (mode === 'reset') return 'Ingresa tu nueva contraseña';
    return 'Administración, junta de condominio y equipo operativo';
  };

  const getSubmitText = () => {
    if (redirecting) return 'Redirigiendo...';
    if (loading) return 'Procesando...';
    if (mode === 'register') return 'Registrar usuario';
    if (mode === 'recover') return 'Enviar enlace de recuperación';
    if (mode === 'reset') return 'Guardar nueva contraseña';
    return 'Ingresar al sistema';
  };

  return (
    <main className="min-h-screen bg-[#f8f6f1] text-[#0b1d33]">
      <div className="grid min-h-screen lg:grid-cols-[0.92fr_1.08fr]">
        <section className="relative hidden overflow-hidden bg-[#0b1d33] lg:block">
          <div
            className="absolute inset-0 bg-cover bg-center opacity-45"
            style={{
              backgroundImage: 'url(https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&w=1600&q=85)',
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-br from-[#0b1d33] via-[#0b1d33]/90 to-[#b08a3c]/35" />
          <div className="relative z-10 flex min-h-screen flex-col justify-between p-12 text-white">
            <Link to="/" className="inline-flex w-fit items-center gap-3 text-sm font-semibold text-white/80 transition hover:text-[#f0cf77]">
              <ArrowLeft size={18} />
              Volver al portal
            </Link>

            <div>
              <img src="/casa-logo-institucional-dark.png" alt="CASA" className="h-auto w-full max-w-[430px]" />
              <p className="mt-10 text-xs font-semibold uppercase tracking-[0.32em] text-[#f0cf77]">Acceso institucional</p>
              <h1 className="mt-5 max-w-xl text-5xl font-semibold leading-tight tracking-tight">
                El trabajo del condominio, conectado.
              </h1>
              <p className="mt-6 max-w-xl text-base leading-8 text-white/75">
                Un entorno privado para administrar operaciones, atención, finanzas y servicios con trazabilidad, control y confianza.
              </p>
            </div>

            <div className="grid gap-3 text-sm text-white/80">
              <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/10 px-4 py-3 backdrop-blur">
                <ShieldCheck size={18} className="text-[#f0cf77]" />
                Seguridad y control de acceso por usuario.
              </div>
              <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/10 px-4 py-3 backdrop-blur">
                <Building2 size={18} className="text-[#f0cf77]" />
                Operación conectada con todas las herramientas de CASA.
              </div>
            </div>
          </div>
        </section>

        <section className="flex items-center justify-center px-5 py-10">
          <div className="w-full max-w-md">
            <Link to="/" className="mb-8 inline-flex items-center text-sm font-semibold text-slate-500 transition hover:text-[#0b1d33] lg:hidden">
              <ArrowLeft className="mr-2" size={16} />
              Volver al portal
            </Link>

            <div className="rounded-[2rem] border border-[#0b1d33]/10 bg-white p-8 shadow-[0_24px_80px_rgba(8,29,51,0.08)]">
              <div className="mb-8 text-center">
                <img src="/casa-wordmark-light.png" alt="CASA" className="mx-auto h-auto w-full max-w-[220px] object-contain" />
                <p className="mt-6 text-xs font-semibold uppercase tracking-[0.28em] text-[#b08a3c]">Portal interno</p>
                <h1 className="mt-3 text-3xl font-semibold tracking-tight text-[#0b1d33]">{getTitle()}</h1>
                <p className="mt-3 text-sm leading-6 text-slate-500">{getSubTitle()}</p>
              </div>

              {error && (
                <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-center text-sm font-medium text-red-600">
                  {error}
                </div>
              )}

              {successMsg && (
                <div className="mb-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-center text-sm font-medium text-emerald-700">
                  {successMsg}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {mode !== 'reset' && (
                  <label className="block">
                    <span className="mb-2 block text-sm font-medium text-slate-600">
                      {mode === 'recover' ? 'Usuario o correo' : 'Correo electrónico o usuario'}
                    </span>
                    <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-[#fbfaf7] px-4 py-3 transition focus-within:border-[#b08a3c] focus-within:ring-4 focus-within:ring-[#b08a3c]/10">
                      <Mail size={18} className="text-[#b08a3c]" />
                      <input
                        type="text"
                        placeholder={mode === 'recover' ? 'usuario@condominio.com' : 'Correo electrónico o usuario'}
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full bg-transparent text-sm text-[#0b1d33] outline-none placeholder:text-slate-400"
                        required
                      />
                    </div>
                  </label>
                )}

                {mode === 'recover' && (
                  <div className="rounded-2xl border border-[#b08a3c]/20 bg-[#f8f6f1] p-4">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-sm font-medium text-slate-600">Método de envío</span>
                      <button
                        type="button"
                        onClick={() => setRecoveryMethod(prev => prev === 'EMAIL' ? 'TELEGRAM' : 'EMAIL')}
                        className="text-sm font-bold text-[#0b1d33] underline decoration-[#b08a3c]/40 underline-offset-4 transition hover:text-[#b08a3c]"
                      >
                        Usar {recoveryMethod === 'EMAIL' ? 'Telegram' : 'Correo'}
                      </button>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-slate-500">
                      Enviaremos el enlace vía <span className="font-semibold text-[#0b1d33]">{recoveryMethod === 'TELEGRAM' ? 'Telegram' : 'correo electrónico'}</span>.
                    </p>
                  </div>
                )}

                {mode !== 'recover' && (
                  <label className="block">
                    <span className="mb-2 block text-sm font-medium text-slate-600">
                      {mode === 'reset' ? 'Nueva contraseña' : 'Contraseña'}
                    </span>
                    <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-[#fbfaf7] px-4 py-3 transition focus-within:border-[#b08a3c] focus-within:ring-4 focus-within:ring-[#b08a3c]/10">
                      <Lock size={18} className="text-[#b08a3c]" />
                      <input
                        type="password"
                        placeholder={mode === 'reset' ? 'Nueva contraseña' : '••••••••'}
                        value={pin}
                        onChange={(e) => setPin(e.target.value)}
                        className="w-full bg-transparent text-sm text-[#0b1d33] outline-none placeholder:text-slate-400"
                        required
                      />
                    </div>
                  </label>
                )}

                {mode === 'login' && (
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => { setMode('recover'); setError(''); setSuccessMsg(''); }}
                      className="text-sm font-semibold text-[#b08a3c] transition hover:text-[#0b1d33]"
                    >
                      ¿Olvidaste tu contraseña?
                    </button>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || redirecting}
                  className="w-full rounded-full bg-[#0b1d33] px-6 py-3.5 text-sm font-bold text-white shadow-[0_16px_40px_rgba(8,29,51,0.18)] transition hover:bg-[#14365d] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {getSubmitText()}
                </button>
              </form>

              {(mode === 'recover' || mode === 'reset') && (
                <div className="mt-6 text-center">
                  <button
                    type="button"
                    onClick={() => { setMode('login'); setError(''); setSuccessMsg(''); window.history.replaceState({}, document.title, window.location.pathname); }}
                    className="text-sm font-semibold text-slate-500 transition hover:text-[#0b1d33]"
                  >
                    Volver a iniciar sesión
                  </button>
                </div>
              )}

              {mode === 'login' && (
                <div className="mt-8 border-t border-slate-200 pt-6 text-center">
                  <p className="mb-3 text-xs uppercase tracking-[0.22em] text-slate-400">Acceso residencial</p>
                  <Link
                    to="/login"
                    className="inline-flex w-full justify-center rounded-full border border-[#b08a3c]/50 px-6 py-3 text-sm font-bold text-[#0b1d33] transition hover:bg-[#f1eadb]"
                  >
                    Acceder como propietario
                  </Link>
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
