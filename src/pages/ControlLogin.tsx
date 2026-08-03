import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Eye,
  EyeOff,
  KeyRound,
  LockKeyhole,
  Mail,
  ShieldCheck,
} from 'lucide-react';
import { CasaAuthService } from '../services/CasaAuthService';
import { RootSession } from '../services/RootSession';

export default function ControlLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (RootSession.isRoot()) navigate('/dashboard', { replace: true });
  }, [navigate]);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setLoading(true);
    const result = await CasaAuthService.login(email, password);
    if (!result.success) {
      setError(result.error);
      setLoading(false);
      return;
    }
    if (result.data.user.platformRole !== 'ROOT') {
      await CasaAuthService.logout(result.data.refreshToken);
      setError('Esta cuenta no tiene autorización para CASA Control.');
      setLoading(false);
      return;
    }
    RootSession.save(
      result.data.accessToken,
      result.data.user,
      result.data.refreshToken,
    );
    navigate('/dashboard', { replace: true });
  };

  return (
    <main className="min-h-screen bg-[#f4f1e9] text-[#071a33]">
      <div className="grid min-h-screen lg:grid-cols-[1.05fr_.95fr]">
        <section className="relative hidden overflow-hidden bg-[#071a33] lg:flex lg:flex-col lg:justify-between lg:p-12">
          <div className="absolute -left-32 top-1/4 h-96 w-96 rounded-full border border-[#d6af57]/15" />
          <div className="absolute -left-20 top-1/3 h-64 w-64 rounded-full border border-[#d6af57]/10" />
          <div className="absolute bottom-[-12rem] right-[-10rem] h-[34rem] w-[34rem] rounded-full bg-[#d6af57]/8 blur-3xl" />
          <Link
            to="/"
            className="relative z-10 inline-flex w-fit items-center gap-3 text-sm font-semibold text-white/65 transition hover:text-[#edcf82]"
          >
            <ArrowLeft size={18} />
            Volver a somoscasa.site
          </Link>
          <div className="relative z-10 max-w-2xl">
            <img
              src="/casa-logo-institucional-dark.png"
              alt="CASA"
              className="h-auto w-full max-w-[430px]"
            />
            <p className="mt-12 text-xs font-bold uppercase tracking-[.3em] text-[#e2bf68]">
              Control de plataforma
            </p>
            <h1 className="mt-5 text-5xl font-semibold leading-[1.08] tracking-[-.045em] text-white">
              Todo CASA, bajo una administración rigurosa.
            </h1>
            <p className="mt-6 max-w-xl text-base leading-8 text-white/58">
              Clientes, licencias, incorporación y seguridad global desde un
              entorno reservado para la operación central.
            </p>
          </div>
          <div className="relative z-10 flex items-center gap-3 text-sm text-white/48">
            <ShieldCheck size={18} className="text-[#e2bf68]" />
            Acceso exclusivo para usuarios autorizados de CASA.
          </div>
        </section>

        <section className="flex items-center justify-center px-5 py-10 sm:px-8">
          <div className="w-full max-w-md">
            <Link
              to="/"
              className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 lg:hidden"
            >
              <ArrowLeft size={17} />
              Volver
            </Link>
            <div className="rounded-[2rem] border border-[#071a33]/8 bg-white p-7 shadow-[0_28px_90px_rgba(7,26,51,.1)] sm:p-9">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#071a33] text-[#e4c26f] shadow-lg">
                <LockKeyhole size={25} />
              </div>
              <p className="mt-7 text-xs font-extrabold uppercase tracking-[.24em] text-[#9a742b]">
                CASA Control
              </p>
              <h1 className="mt-3 text-3xl font-semibold tracking-[-.04em]">
                Acceso de plataforma
              </h1>
              <p className="mt-3 text-sm leading-6 text-slate-500">
                Ingresa con las credenciales del administrador global.
              </p>

              {error && (
                <div
                  role="alert"
                  className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold leading-6 text-rose-700"
                >
                  {error}
                </div>
              )}

              <form onSubmit={submit} className="mt-7 space-y-5">
                <label className="block text-sm font-semibold text-slate-700">
                  Correo electrónico
                  <span className="mt-2 flex items-center gap-3 rounded-2xl border border-slate-200 bg-[#fbfaf7] px-4 py-3.5 transition focus-within:border-[#b08a3c] focus-within:ring-4 focus-within:ring-[#b08a3c]/10">
                    <Mail size={18} className="text-[#a47c2c]" />
                    <input
                      type="email"
                      autoComplete="username"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      placeholder="usuario@somoscasa.site"
                      className="min-w-0 flex-1 bg-transparent font-normal outline-none placeholder:text-slate-400"
                      required
                      autoFocus
                    />
                  </span>
                </label>

                <label className="block text-sm font-semibold text-slate-700">
                  Contraseña
                  <span className="mt-2 flex items-center gap-3 rounded-2xl border border-slate-200 bg-[#fbfaf7] px-4 py-3.5 transition focus-within:border-[#b08a3c] focus-within:ring-4 focus-within:ring-[#b08a3c]/10">
                    <KeyRound size={18} className="text-[#a47c2c]" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      placeholder="••••••••••••••"
                      className="min-w-0 flex-1 bg-transparent font-normal outline-none placeholder:text-slate-400"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((current) => !current)}
                      className="text-slate-400 transition hover:text-[#071a33]"
                      aria-label={
                        showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'
                      }
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </span>
                </label>

                <div className="text-right">
                  <Link
                    to="/restablecer-clave"
                    className="text-sm font-bold text-[#9a742b] hover:text-[#071a33]"
                  >
                    ¿Olvidaste tu contraseña?
                  </Link>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-full bg-[#071a33] px-6 py-3.5 text-sm font-bold text-white shadow-[0_16px_40px_rgba(7,26,51,.18)] transition hover:bg-[#12345a] disabled:cursor-wait disabled:opacity-60"
                >
                  {loading ? 'Validando acceso…' : 'Ingresar a CASA Control'}
                </button>
              </form>

              <div className="mt-7 border-t border-slate-100 pt-6 text-center">
                <Link
                  to="/staff-login"
                  className="text-sm font-semibold text-slate-500 transition hover:text-[#9a742b]"
                >
                  ¿Eres personal de un condominio?
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
