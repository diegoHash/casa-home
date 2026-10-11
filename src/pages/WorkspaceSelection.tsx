import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  BriefcaseBusiness,
  Building2,
  Construction,
  LogOut,
} from 'lucide-react';
import { workspaceCatalog } from '../config/workspaceCatalog';
import { CasaAuthService } from '../services/CasaAuthService';
import { StaffSession } from '../services/StaffSession';

export default function WorkspaceSelection() {
  const navigate = useNavigate();
  const context = StaffSession.context();
  const user = StaffSession.user();

  const assignedWorkspaces = useMemo(() => {
    const granted = context?.workspaces ?? [];
    return workspaceCatalog.filter(
      (workspace) => granted.includes('*') || granted.includes(workspace.code),
    );
  }, [context?.workspaces]);

  const chooseWorkspace = (workspaceCode: string) => {
    StaffSession.selectWorkspace(workspaceCode);
    navigate('/workspace', { replace: true });
  };

  const logout = async () => {
    await CasaAuthService.logout(StaffSession.refreshToken());
    StaffSession.clear();
    navigate('/staff-login', { replace: true });
  };

  const displayName = user?.person
    ? `${user.person.firstName} ${user.person.lastName}`
    : user?.email;

  return (
    <main className="min-h-screen bg-[#f4f1e9] px-5 py-8 text-[#071a33] sm:px-8">
      <div className="mx-auto max-w-6xl">
        <header className="flex items-center justify-between gap-4">
          <img src="/casa-wordmark-light.png" alt="CASA" className="w-36 sm:w-44" />
          <button
            onClick={logout}
            className="inline-flex items-center gap-2 rounded-full border border-[#071a33]/10 bg-white px-4 py-2.5 text-sm font-bold shadow-sm"
          >
            <LogOut size={16} /> Cerrar sesión
          </button>
        </header>

        <section className="mx-auto mt-14 max-w-3xl text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#071a33] text-[#e3bf72]">
            <BriefcaseBusiness size={27} />
          </div>
          <p className="mt-6 text-xs font-bold uppercase tracking-[0.25em] text-[#a37b35]">
            {context?.name}
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-[-0.035em]">
            ¿En qué espacio deseas trabajar?
          </h1>
          <p className="mt-4 text-base leading-7 text-slate-500">
            {displayName ? `${displayName}, elige ` : 'Elige '}
            el área operativa que necesitas abrir. Solo verás las funciones
            autorizadas para ese espacio.
          </p>
        </section>

        {assignedWorkspaces.length === 0 ? (
          <div className="mx-auto mt-10 max-w-xl rounded-[2rem] border border-[#071a33]/10 bg-white p-8 text-center shadow-sm">
            <Building2 className="mx-auto text-[#a37b35]" size={30} />
            <h2 className="mt-4 text-xl font-semibold">
              Sin espacios de trabajo asignados
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Tu acceso a la comunidad está vigente, pero todavía no tiene un
              espacio operativo asignado. Solicita la configuración al
              administrador.
            </p>
          </div>
        ) : (
          <div className="mx-auto mt-10 grid max-w-5xl gap-4 md:grid-cols-2">
            {assignedWorkspaces.map((workspace) => (
              <button
                key={workspace.code}
                onClick={() => workspace.enabled && chooseWorkspace(workspace.code)}
                disabled={!workspace.enabled}
                aria-label={`${workspace.label}${workspace.enabled ? '' : ': próximamente'}`}
                className={`group relative overflow-hidden rounded-[1.75rem] border border-[#071a33]/10 bg-white p-6 text-left shadow-[0_16px_50px_rgba(7,26,51,.06)] transition ${workspace.enabled ? 'hover:-translate-y-1 hover:border-[#b08a3c]/50 hover:shadow-[0_24px_70px_rgba(7,26,51,.10)]' : 'cursor-not-allowed opacity-75'}`}
              >
                {!workspace.enabled && (
                  <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
                    <span className="flex w-[125%] -rotate-[18deg] items-center justify-center gap-2 bg-[#071a33]/90 px-4 py-2 text-[10px] font-black uppercase tracking-[0.22em] text-[#e3bf72] shadow-lg">
                      <Construction size={14} /> Próximamente · En construcción
                    </span>
                  </div>
                )}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#071a33] text-[#e3bf72]">
                    <BriefcaseBusiness size={22} />
                  </div>
                  {workspace.enabled ? <ArrowRight className="text-slate-300 transition group-hover:translate-x-1 group-hover:text-[#a37b35]" /> : <Construction className="text-slate-300" size={21} />}
                </div>
                <h2 className="mt-6 text-xl font-semibold">{workspace.label}</h2>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  {workspace.description}
                </p>
                <p className={`mt-4 text-xs font-bold uppercase tracking-[0.16em] ${workspace.enabled ? 'text-emerald-700' : 'text-slate-400'}`}>
                  {workspace.enabled ? 'Disponible para trabajar' : 'Disponible próximamente'}
                </p>
              </button>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
