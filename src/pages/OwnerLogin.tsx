import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Building2, Eye, LockKeyhole, Mail, ShieldCheck } from 'lucide-react';
import { AuthService } from '../services/AuthService';

export default function OwnerLogin() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await AuthService.login(username.trim().toLowerCase(), password);
      const role = String(result.user?.role || '').trim().toUpperCase();
      const ownerRoles = ['OWNER', 'PROPIETARIO', 'RESIDENT', 'RESIDENTE'];

      if (!result.success) {
        setError(result.error || 'No pudimos validar tus credenciales.');
      } else if (!ownerRoles.includes(role)) {
        setError('Esta cuenta no tiene acceso al portal de propietarios.');
      } else {
        sessionStorage.setItem('casa_owner_session', JSON.stringify({ token: result.token, user: result.user }));
        navigate('/portal', { replace: true });
      }
    } catch {
      setError('Ocurrió un error inesperado. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#f8f6f1] text-[#0b1d33]">
      <div className="grid min-h-screen lg:grid-cols-[1.05fr_0.95fr]">
        <section
          className="relative hidden overflow-hidden bg-cover bg-center lg:block"
          style={{
            backgroundImage: 'linear-gradient(180deg, rgba(8,29,51,0.2), rgba(8,29,51,0.72)), url(https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&w=1600&q=85)',
          }}
        >
          <div className="absolute inset-x-0 bottom-0 p-12 text-white">
            <img src="/casa-logo-institucional-dark.png" alt="CASA" className="h-auto w-full max-w-[420px]" />
            <p className="mt-10 text-xs font-semibold uppercase tracking-[0.28em] text-[#f0cf77]">Portal del propietario</p>
            <h1 className="mt-4 max-w-xl text-5xl font-semibold leading-tight tracking-tight">
              Tu comunidad, más cerca de ti.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-8 text-white/75">
              Consulta tu inmueble, pagos y documentos. Recibe comunicados oficiales y participa en las decisiones de tu comunidad desde un entorno seguro.
            </p>
          </div>
        </section>

        <section className="flex items-center justify-center px-5 py-10">
          <div className="w-full max-w-md">
            <Link to="/" className="mb-10 inline-flex items-center text-sm font-semibold text-slate-500 transition hover:text-[#0b1d33]">
              <ArrowLeft className="mr-2" size={16} /> Volver al inicio
            </Link>

            <div className="rounded-[2rem] border border-[#0b1d33]/10 bg-white p-8 shadow-[0_24px_80px_rgba(8,29,51,0.08)]">
              <div className="mb-8 text-center">
                <img src="/casa-wordmark-light.png" alt="CASA" className="mx-auto h-auto w-full max-w-[220px]" />
                <p className="mt-6 text-xs font-semibold uppercase tracking-[0.28em] text-[#b08a3c]">Acceso de propietarios</p>
                <h1 className="mt-3 text-3xl font-semibold tracking-tight text-[#0b1d33]">Bienvenido a CASA</h1>
                <p className="mt-3 text-sm leading-6 text-slate-500">
                  Ingresa al espacio digital privado de tu comunidad.
                </p>
              </div>

              {error && (
                <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-center text-sm font-medium text-red-600">
                  {error}
                </div>
              )}

              <form className="space-y-4" onSubmit={handleSubmit}>
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-slate-600">Correo o usuario</span>
                  <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-[#fbfaf7] px-4 py-3 focus-within:border-[#b08a3c]">
                    <Mail size={18} className="text-[#b08a3c]" />
                    <input
                      type="text"
                      value={username}
                      onChange={(event) => setUsername(event.target.value)}
                      className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
                      placeholder="propietario@correo.com"
                      autoComplete="username"
                      required
                    />
                  </div>
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-slate-600">Contraseña</span>
                  <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-[#fbfaf7] px-4 py-3 focus-within:border-[#b08a3c]">
                    <LockKeyhole size={18} className="text-[#b08a3c]" />
                    <input
                      type="password"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
                      placeholder="••••••••"
                      autoComplete="current-password"
                      required
                    />
                  </div>
                </label>

                <button type="submit" disabled={loading} className="w-full rounded-full bg-[#0b1d33] px-6 py-3.5 text-sm font-bold text-white transition hover:bg-[#14365d] disabled:cursor-not-allowed disabled:opacity-70">
                  {loading ? 'Validando acceso…' : 'Acceder como propietario'}
                </button>
              </form>

              <div className="my-5 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                <span className="h-px flex-1 bg-slate-200" />
                o explora primero
                <span className="h-px flex-1 bg-slate-200" />
              </div>

              <button
                type="button"
                onClick={() => navigate('/portal?demo=1')}
                className="group flex w-full items-center justify-between rounded-full border border-[#b08a3c]/55 bg-[#f8f3e8] px-5 py-3.5 text-sm font-bold text-[#0b1d33] transition hover:border-[#b08a3c] hover:bg-[#f1e7d2]"
              >
                <span className="inline-flex items-center gap-2"><Eye size={18} /> Ver demo del portal</span>
                <ArrowRight size={17} className="transition group-hover:translate-x-1" />
              </button>

              <div className="mt-6 grid gap-3 text-sm text-slate-500">
                <div className="flex items-center gap-3 rounded-2xl bg-[#f8f6f1] px-4 py-3">
                  <ShieldCheck size={18} className="text-[#b08a3c]" />
                  Acceso seguro a información oficial del condominio.
                </div>
                <div className="flex items-center gap-3 rounded-2xl bg-[#f8f6f1] px-4 py-3">
                  <Building2 size={18} className="text-[#b08a3c]" />
                  Consulta de inmueble, pagos, documentos y comunicaciones.
                </div>
              </div>

              <div className="mt-8 border-t border-slate-200 pt-6 text-center">
                <p className="mb-3 text-xs uppercase tracking-[0.22em] text-slate-400">Acceso interno</p>
                <Link to="/staff-login" className="inline-flex w-full justify-center rounded-full border border-[#b08a3c]/50 px-6 py-3 text-sm font-bold text-[#0b1d33] transition hover:bg-[#f1eadb]">
                  Acceder como personal del condominio
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
