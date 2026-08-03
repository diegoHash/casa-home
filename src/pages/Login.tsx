import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Building2,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  ShieldCheck,
} from 'lucide-react';
import { CasaAuthService } from '../services/CasaAuthService';
import { RootSession } from '../services/RootSession';
import { StaffSession } from '../services/StaffSession';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (RootSession.isRoot()) {
      navigate('/dashboard', { replace: true });
      return;
    }
    const existingUser = StaffSession.user();
    if (
      existingUser?.platformRole?.toUpperCase() === 'ROOT' &&
      StaffSession.token()
    ) {
      const accessToken = StaffSession.token();
      const refreshToken = StaffSession.refreshToken();
      StaffSession.clear();
      RootSession.save(accessToken, existingUser, refreshToken);
      navigate('/dashboard', { replace: true });
      return;
    }
    if (StaffSession.token() && StaffSession.context()) {
      navigate(
        StaffSession.workspace() ? '/workspace' : '/seleccionar-espacio',
        { replace: true },
      );
    }
  }, [navigate]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    setLoading(true);
    const result = await CasaAuthService.login(email, password);
    if (!result.success) {
      setError(result.error);
      setLoading(false);
      return;
    }

    StaffSession.clear();
    if (result.data.user.platformRole?.toUpperCase() === 'ROOT') {
      RootSession.save(
        result.data.accessToken,
        result.data.user,
        result.data.refreshToken,
      );
      navigate('/dashboard', { replace: true });
      return;
    }
    RootSession.clear();
    StaffSession.saveIdentity(
      result.data.accessToken,
      result.data.refreshToken,
      result.data.user,
    );
    navigate('/seleccionar-comunidad', { replace: true });
  };

  return (
    <main className="min-h-screen bg-[#f5f2ea] text-[#071a33]">
      <div className="grid min-h-screen lg:grid-cols-[1.05fr_0.95fr]">
        <section className="relative hidden overflow-hidden bg-[#071a33] lg:flex lg:flex-col lg:justify-between lg:p-12">
          <div className="absolute inset-0 opacity-20 [background-image:radial-gradient(circle_at_20%_15%,#d2ad62_0,transparent_25%),radial-gradient(circle_at_80%_75%,#38648f_0,transparent_32%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.035)_1px,transparent_1px)] bg-[size:48px_48px]" />
          <Link
            to="/"
            className="relative z-10 inline-flex w-fit items-center gap-2 text-sm font-semibold text-white/70 transition hover:text-[#e4c47f]"
          >
            <ArrowLeft size={17} /> Volver al portal
          </Link>

          <div className="relative z-10 max-w-xl text-white">
            <img
              src="/casa-logo-institucional-dark.png"
              alt="CASA"
              className="w-full max-w-[360px]"
            />
            <p className="mt-10 text-xs font-bold uppercase tracking-[0.3em] text-[#e4c47f]">
              Espacio de trabajo
            </p>
            <h1 className="mt-5 text-5xl font-semibold leading-[1.08] tracking-[-0.04em]">
              La operación completa de tu comunidad, en orden.
            </h1>
            <p className="mt-6 max-w-lg text-base leading-8 text-white/68">
              Accede según tu función, con permisos verificables y cada acción
              vinculada a la comunidad correcta.
            </p>
          </div>

          <div className="relative z-10 grid grid-cols-2 gap-4 text-sm text-white/75">
            <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-4 backdrop-blur">
              <ShieldCheck className="mb-3 text-[#e4c47f]" size={20} />
              Acceso controlado por responsabilidades.
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-4 backdrop-blur">
              <Building2 className="mb-3 text-[#e4c47f]" size={20} />
              Contexto independiente por comunidad.
            </div>
          </div>
        </section>

        <section className="flex items-center justify-center px-5 py-10">
          <div className="w-full max-w-md">
            <Link
              to="/"
              className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 lg:hidden"
            >
              <ArrowLeft size={16} /> Volver
            </Link>
            <div className="rounded-[2rem] border border-[#071a33]/10 bg-white p-8 shadow-[0_28px_90px_rgba(7,26,51,.10)] sm:p-10">
              <img
                src="/casa-wordmark-light.png"
                alt="CASA"
                className="mx-auto w-full max-w-[210px]"
              />
              <div className="mb-8 mt-7 text-center">
                <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#a37b35]">
                  Acceso institucional
                </p>
                <h2 className="mt-3 text-3xl font-semibold tracking-tight">
                  Personal del condominio
                </h2>
                <p className="mt-3 text-sm leading-6 text-slate-500">
                  Usa las credenciales asignadas por CASA o por tu comunidad.
                </p>
              </div>

              {error && (
                <div
                  role="alert"
                  className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
                >
                  {error}
                </div>
              )}

              <form onSubmit={submit} className="space-y-5">
                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-slate-600">
                    Correo electrónico
                  </span>
                  <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-[#fbfaf7] px-4 py-3.5 focus-within:border-[#b08a3c] focus-within:ring-4 focus-within:ring-[#b08a3c]/10">
                    <Mail size={18} className="text-[#a37b35]" />
                    <input
                      type="email"
                      autoComplete="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      placeholder="nombre@comunidad.com"
                      className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
                      required
                    />
                  </div>
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-slate-600">
                    Contraseña
                  </span>
                  <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-[#fbfaf7] px-4 py-3.5 focus-within:border-[#b08a3c] focus-within:ring-4 focus-within:ring-[#b08a3c]/10">
                    <LockKeyhole size={18} className="text-[#a37b35]" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      placeholder="••••••••••••"
                      className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((value) => !value)}
                      className="text-slate-400 transition hover:text-[#071a33]"
                      aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
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
                  className="w-full rounded-full bg-[#071a33] px-6 py-3.5 text-sm font-bold text-white shadow-[0_16px_40px_rgba(7,26,51,.18)] transition hover:bg-[#12385f] disabled:cursor-wait disabled:opacity-65"
                >
                  {loading ? 'Verificando acceso…' : 'Continuar'}
                </button>
              </form>

              <div className="mt-8 border-t border-slate-200 pt-6 text-center">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                  ¿Eres propietario?
                </p>
                <Link
                  to="/login"
                  className="mt-3 inline-flex w-full justify-center rounded-full border border-[#b08a3c]/45 px-6 py-3 text-sm font-bold transition hover:bg-[#f4efe4]"
                >
                  Ir al portal de propietarios
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
