import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  LogOut,
  ShieldCheck,
} from 'lucide-react';
import {
  CasaAuthService,
  type CommunityContext,
} from '../services/CasaAuthService';
import { RootSession } from '../services/RootSession';
import { StaffSession } from '../services/StaffSession';

const relationLabels: Record<string, string> = {
  OWNER: 'Propietario',
  STAFF: 'Personal',
  BOARD_MEMBER: 'Junta de condominio',
  ADMINISTRATOR: 'Administrador',
  PLATFORM_ROOT: 'CASA Control',
};

export default function ContextSelection() {
  const navigate = useNavigate();
  const [contexts, setContexts] = useState<CommunityContext[]>([]);
  const [loading, setLoading] = useState(true);
  const [opening, setOpening] = useState('');
  const [error, setError] = useState('');

  const openContext = useCallback(async (context: CommunityContext) => {
    setOpening(context.communityId);
    setError('');
    const selected = await CasaAuthService.selectContext(
      StaffSession.token(),
      context.communityId,
    );
    if (!selected.success) {
      setError(selected.error);
      setOpening('');
      return;
    }
    StaffSession.selectContext(selected.data.accessToken, context);
    navigate('/seleccionar-espacio', { replace: true });
  }, [navigate]);

  useEffect(() => {
    let active = true;
    const load = async () => {
      const user = StaffSession.user();
      if (
        user?.platformRole?.toUpperCase() === 'ROOT' &&
        StaffSession.token()
      ) {
        const accessToken = StaffSession.token();
        const refreshToken = StaffSession.refreshToken();
        StaffSession.clear();
        RootSession.save(accessToken, user, refreshToken);
        navigate('/dashboard', { replace: true });
        return;
      }
      const token = StaffSession.token();
      if (!token) {
        navigate('/staff-login', { replace: true });
        return;
      }
      const result = await CasaAuthService.contexts(token);
      if (!active) return;
      if (!result.success) {
        setError(result.error);
        setLoading(false);
        return;
      }
      setContexts(result.data);
      setLoading(false);
      if (result.data.length === 1) void openContext(result.data[0]);
    };
    void load();
    return () => {
      active = false;
    };
  }, [navigate, openContext]);

  const logout = async () => {
    await CasaAuthService.logout(StaffSession.refreshToken());
    StaffSession.clear();
    navigate('/staff-login', { replace: true });
  };

  const user = StaffSession.user();
  const displayName = user?.person
    ? `${user.person.firstName} ${user.person.lastName}`
    : user?.email;

  return (
    <main className="min-h-screen bg-[#f4f1e9] px-5 py-8 text-[#071a33] sm:px-8">
      <div className="mx-auto max-w-6xl">
        <header className="flex items-center justify-between">
          <img src="/casa-wordmark-light.png" alt="CASA" className="w-36 sm:w-44" />
          <button
            onClick={logout}
            className="inline-flex items-center gap-2 rounded-full border border-[#071a33]/10 bg-white px-4 py-2.5 text-sm font-bold shadow-sm"
          >
            <LogOut size={16} /> Cerrar sesión
          </button>
        </header>

        <section className="mx-auto mt-16 max-w-3xl text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#071a33] text-[#e3bf72]">
            <Building2 size={27} />
          </div>
          <p className="mt-6 text-xs font-bold uppercase tracking-[0.25em] text-[#a37b35]">
            Sesión verificada
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-[-0.035em]">
            ¿Dónde deseas trabajar?
          </h1>
          <p className="mt-4 text-base leading-7 text-slate-500">
            {displayName ? `${displayName}, selecciona ` : 'Selecciona '}
            la comunidad que deseas administrar. CASA mantendrá sus datos y
            permisos completamente separados.
          </p>
        </section>

        {error && (
          <div role="alert" className="mx-auto mt-8 max-w-2xl rounded-2xl border border-red-200 bg-red-50 p-4 text-center text-sm font-semibold text-red-700">
            {error}
          </div>
        )}

        {loading && (
          <div className="mt-12 text-center">
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-[#071a33]/15 border-t-[#b08a3c]" />
            <p className="mt-4 text-sm font-semibold text-slate-500">
              Consultando tus accesos…
            </p>
          </div>
        )}

        {!loading && contexts.length === 0 && (
          <div className="mx-auto mt-10 max-w-xl rounded-[2rem] border border-[#071a33]/10 bg-white p-8 text-center shadow-sm">
            <ShieldCheck className="mx-auto text-[#a37b35]" size={30} />
            <h2 className="mt-4 text-xl font-semibold">Sin comunidades asignadas</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Tu cuenta es válida, pero todavía no tiene acceso vigente a una
              comunidad. Solicita la asignación al administrador de CASA.
            </p>
          </div>
        )}

        <div className="mx-auto mt-10 grid max-w-4xl gap-4 md:grid-cols-2">
          {contexts.map((context) => (
            <button
              key={context.communityId}
              onClick={() => openContext(context)}
              disabled={Boolean(opening)}
              className="group rounded-[1.75rem] border border-[#071a33]/10 bg-white p-6 text-left shadow-[0_16px_50px_rgba(7,26,51,.06)] transition hover:-translate-y-1 hover:border-[#b08a3c]/50 hover:shadow-[0_24px_70px_rgba(7,26,51,.10)] disabled:cursor-wait disabled:opacity-60"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#071a33] text-[#e3bf72]">
                  <Building2 size={22} />
                </div>
                <ArrowRight className="text-slate-300 transition group-hover:translate-x-1 group-hover:text-[#a37b35]" />
              </div>
              <h2 className="mt-6 text-xl font-semibold">{context.name}</h2>
              <p className="mt-1 text-sm text-slate-500">{context.legalName}</p>
              <div className="mt-5 flex flex-wrap gap-2 text-xs font-semibold">
                <span className="rounded-full bg-[#f4efe4] px-3 py-1.5 text-[#7e5d28]">
                  {context.rif}
                </span>
                <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-emerald-700">
                  <CheckCircle2 className="mr-1 inline" size={13} />
                  {context.roleCode}
                </span>
                {(context.relationTypes ?? []).map((relation) => (
                  <span
                    key={relation}
                    className="rounded-full bg-slate-100 px-3 py-1.5 text-slate-600"
                  >
                    {relationLabels[relation] ?? relation}
                  </span>
                ))}
              </div>
              {opening === context.communityId && (
                <p className="mt-4 text-sm font-semibold text-[#a37b35]">
                  Abriendo espacio de trabajo…
                </p>
              )}
            </button>
          ))}
        </div>
      </div>
    </main>
  );
}
