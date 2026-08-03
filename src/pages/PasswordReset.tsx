import { useState, type FormEvent } from 'react';
import { Check, KeyRound, Mail, ShieldCheck } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { CasaAuthService } from '../services/CasaAuthService';

const inputClass =
  'mt-2 w-full rounded-xl border border-slate-200 bg-[#fbfaf7] px-4 py-3 text-sm outline-none transition focus:border-[#b08a3c] focus:ring-4 focus:ring-[#b08a3c]/10';

export default function PasswordReset() {
  const navigate = useNavigate();
  const token = new URLSearchParams(window.location.search).get('token') ?? '';
  const [mode, setMode] = useState<'request' | 'token' | 'pin'>(
    token ? 'token' : 'request',
  );
  const [email, setEmail] = useState('');
  const [pin, setPin] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const request = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    const result = await CasaAuthService.requestPasswordReset(email);
    setSaving(false);
    if (!result.success) {
      setError(result.error);
      return;
    }
    setNotice(
      'Si el correo pertenece a una cuenta activa, recibirás un enlace y un PIN de un solo uso.',
    );
    setMode('pin');
  };

  const reset = async (event: FormEvent) => {
    event.preventDefault();
    if (password !== confirm) {
      setError('Las contraseñas no coinciden.');
      return;
    }
    setSaving(true);
    setError('');
    const result = await CasaAuthService.resetPassword({
      token: mode === 'token' ? token : undefined,
      email: mode === 'pin' ? email.trim().toLowerCase() : undefined,
      pin: mode === 'pin' ? pin : undefined,
      newPassword: password,
    });
    setSaving(false);
    if (!result.success) {
      setError(result.error);
      return;
    }
    setNotice('Contraseña actualizada. Tus sesiones anteriores fueron cerradas.');
    window.setTimeout(() => navigate('/staff-login', { replace: true }), 1800);
  };

  return (
    <main className="min-h-screen bg-[#f5f3ee] px-4 py-10 text-[#071a33]">
      <div className="mx-auto max-w-lg overflow-hidden rounded-[2rem] border border-[#071a33]/8 bg-white shadow-[0_28px_80px_rgba(7,26,51,.12)]">
        <header className="bg-[#071a33] px-7 py-7 text-center">
          <img
            src="/casa-wordmark-dark.png"
            alt="CASA"
            className="mx-auto h-11 w-auto"
          />
          <p className="mt-4 text-xs font-bold uppercase tracking-[.2em] text-[#e4c26f]">
            Seguridad global
          </p>
        </header>
        <section className="p-6 sm:p-8">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f1eadb] text-[#85631f]">
            {mode === 'request' ? <Mail size={21} /> : <KeyRound size={21} />}
          </span>
          <h1 className="mt-5 text-2xl font-semibold">
            {mode === 'request'
              ? 'Recupera tu acceso'
              : 'Crea una nueva contraseña'}
          </h1>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            {mode === 'request'
              ? 'CASA enviará un enlace y un PIN que vencen en 15 minutos.'
              : 'La validación es de un solo uso y cerrará todas las sesiones anteriores.'}
          </p>

          {error && (
            <div className="mt-5 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm font-semibold text-rose-700">
              {error}
            </div>
          )}
          {notice && (
            <div className="mt-5 flex gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
              <Check size={18} className="shrink-0" /> {notice}
            </div>
          )}

          {mode === 'request' ? (
            <form onSubmit={request} className="mt-6">
              <label className="text-sm font-bold">
                Correo de la cuenta
                <input
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  type="email"
                  className={inputClass}
                  required
                />
              </label>
              <button disabled={saving} className="mt-6 w-full rounded-full bg-[#071a33] py-3.5 text-sm font-bold text-white disabled:opacity-50">
                {saving ? 'Preparando recuperación…' : 'Enviar enlace y PIN'}
              </button>
            </form>
          ) : (
            <form onSubmit={reset} className="mt-6 space-y-4">
              {mode === 'pin' && (
                <>
                  <label className="block text-sm font-bold">
                    Correo
                    <input
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      type="email"
                      className={inputClass}
                      required
                    />
                  </label>
                  <label className="block text-sm font-bold">
                    PIN de 6 dígitos
                    <input
                      value={pin}
                      onChange={(event) =>
                        setPin(event.target.value.replace(/\D/g, '').slice(0, 6))
                      }
                      inputMode="numeric"
                      pattern="\d{6}"
                      className={`${inputClass} text-center text-xl font-bold tracking-[.4em]`}
                      required
                    />
                  </label>
                </>
              )}
              <label className="block text-sm font-bold">
                Nueva contraseña
                <input
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  type="password"
                  minLength={8}
                  className={inputClass}
                  required
                />
              </label>
              <label className="block text-sm font-bold">
                Confirmar contraseña
                <input
                  value={confirm}
                  onChange={(event) => setConfirm(event.target.value)}
                  type="password"
                  minLength={8}
                  className={inputClass}
                  required
                />
              </label>
              <button disabled={saving} className="w-full rounded-full bg-[#071a33] py-3.5 text-sm font-bold text-white disabled:opacity-50">
                {saving ? 'Actualizando…' : 'Restablecer contraseña'}
              </button>
              {mode === 'token' && (
                <button type="button" onClick={() => setMode('pin')} className="w-full text-sm font-bold text-[#9a742b]">
                  Usar el PIN en su lugar
                </button>
              )}
            </form>
          )}
          <div className="mt-6 flex items-center gap-2 rounded-xl bg-[#f8f6f1] p-3 text-xs leading-5 text-slate-500">
            <ShieldCheck size={17} className="shrink-0 text-[#9a742b]" />
            CASA nunca enviará tu contraseña actual por correo.
          </div>
          <Link to="/staff-login" className="mt-5 block text-center text-sm font-bold text-slate-500">
            Volver al inicio de sesión
          </Link>
        </section>
      </div>
    </main>
  );
}
