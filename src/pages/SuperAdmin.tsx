import { useEffect, useState, type FormEvent, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Activity,
  ActivitySquare,
  AlertTriangle,
  ArrowRight,
  Bell,
  BriefcaseBusiness,
  Building2,
  CalendarClock,
  Check,
  CheckCircle2,
  ChevronDown,
  CircleDollarSign,
  CircleHelp,
  ClipboardCheck,
  Clock3,
  Database,
  FileClock,
  KeyRound,
  Landmark,
  LayoutDashboard,
  LogOut,
  Menu,
  MoreHorizontal,
  Plus,
  RefreshCw,
  Search,
  Settings2,
  ShieldCheck,
  SlidersHorizontal,
  UserRoundCog,
  UsersRound,
  WalletCards,
  X,
} from 'lucide-react';
import CoreModule, { type CoreSection } from '../components/core/CoreModule';
import OnboardingModule from '../components/onboarding/OnboardingModule';
import { WorkspacePermissionsTree } from '../components/community/WorkspacePermissionsTree';
import { workspaceCatalog, workspaceLabel } from '../config/workspaceCatalog';
import {
  explicitScopeCatalog,
  roleCatalog,
  roleLabel,
  scopeLabel,
  normalizeWorkspaceScopes,
  scopesDefaultsForRole,
  workspaceDefaultsForRole,
} from '../config/communityAccessCatalog';
import type { ClientStanding, LicenseStatus, PlatformClient, SuperAdminState } from '../domain/superAdmin';
import { platformAudit, platformId, SuperAdminRepository } from '../services/SuperAdminRepository';
import { ensureCommunityForClient } from '../services/CoreRepository';
import { ensureOnboardingForClient } from '../services/OnboardingRepository';
import { RootSession } from '../services/RootSession';
import MonitoringDashboard from '../components/monitoring/MonitoringDashboard';
import { CasaAuthService } from '../services/CasaAuthService';
import { CasaPlatformService } from '../services/CasaPlatformService';
import type { AccessPersonnelRecord, CommunityAccessRecord, PlatformAuditRecord } from '../services/CasaPlatformService';

type AdminView = 'overview' | 'clients' | 'onboarding' | 'licenses' | 'payments' | 'core' | 'users' | 'audit' | 'monitoring' | 'settings';

const money = new Intl.NumberFormat('es-VE', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
const date = new Intl.DateTimeFormat('es-VE', { day: '2-digit', month: 'short', year: 'numeric' });
const dateTime = new Intl.DateTimeFormat('es-VE', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
const inputClass = 'mt-2 w-full rounded-xl border border-slate-200 bg-[#fbfaf7] px-3.5 py-3 text-sm text-[#0b1d33] outline-none transition focus:border-[#b08a3c] focus:ring-4 focus:ring-[#b08a3c]/10';

const standingMeta: Record<ClientStanding, { label: string; className: string }> = {
  solvent: { label: 'Solvente', className: 'bg-emerald-50 text-emerald-700 ring-emerald-600/15' },
  'due-soon': { label: 'Próximo a vencer', className: 'bg-amber-50 text-amber-700 ring-amber-600/15' },
  'past-due': { label: 'Pago pendiente', className: 'bg-orange-50 text-orange-700 ring-orange-600/15' },
  suspended: { label: 'Suspendido', className: 'bg-rose-50 text-rose-700 ring-rose-600/15' },
  onboarding: { label: 'Incorporación', className: 'bg-blue-50 text-blue-700 ring-blue-600/15' },
};

const licenseMeta: Record<LicenseStatus, { label: string; className: string }> = {
  active: { label: 'Activa', className: 'bg-emerald-50 text-emerald-700 ring-emerald-600/15' },
  grace: { label: 'En gracia', className: 'bg-amber-50 text-amber-700 ring-amber-600/15' },
  suspended: { label: 'Suspendida', className: 'bg-orange-50 text-orange-700 ring-orange-600/15' },
  revoked: { label: 'Revocada', className: 'bg-rose-50 text-rose-700 ring-rose-600/15' },
  expired: { label: 'Vencida', className: 'bg-slate-100 text-slate-600 ring-slate-500/15' },
};

function StatusBadge({ type, license = false }: { type: ClientStanding | LicenseStatus; license?: boolean }) {
  const meta = license ? licenseMeta[type as LicenseStatus] : standingMeta[type as ClientStanding];
  return <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold ring-1 ring-inset ${meta.className}`}><span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-current" />{meta.label}</span>;
}

function Field({ label, children, span = false, hint }: { label: string; children: ReactNode; span?: boolean; hint?: string }) {
  return <label className={`block text-sm font-semibold text-slate-700 ${span ? 'sm:col-span-2' : ''}`}>{label}{children}{hint && <span className="mt-1.5 block text-xs font-normal leading-5 text-slate-400">{hint}</span>}</label>;
}

function Modal({ title, copy, onClose, children, width = 'max-w-2xl' }: { title: string; copy: string; onClose: () => void; children: ReactNode; width?: string }) {
  return <div className="fixed inset-0 z-[120] flex items-end justify-center bg-[#061529]/65 backdrop-blur-sm sm:items-center sm:p-5"><div className={`max-h-[94vh] w-full overflow-y-auto rounded-t-[1.75rem] bg-white shadow-2xl sm:rounded-[1.75rem] ${width}`}><header className="sticky top-0 z-10 flex items-start justify-between border-b border-slate-100 bg-white/95 px-6 py-5 backdrop-blur"><div><h3 className="text-xl font-semibold tracking-[-.02em] text-[#071a33]">{title}</h3><p className="mt-1 max-w-xl text-sm text-slate-500">{copy}</p></div><button onClick={onClose} className="rounded-full border border-slate-200 p-2 text-slate-500 hover:border-[#b08a3c]" aria-label="Cerrar"><X size={18} /></button></header><div className="p-6">{children}</div></div></div>;
}

function MetricCard({ label, value, detail, icon, accent = false }: { label: string; value: string; detail: string; icon: ReactNode; accent?: boolean }) {
  return <article className={`relative overflow-hidden rounded-[1.4rem] border p-5 ${accent ? 'border-[#d6af57]/30 bg-[#071a33] text-white shadow-[0_20px_50px_rgba(7,26,51,.16)]' : 'border-[#071a33]/8 bg-white shadow-[0_14px_40px_rgba(7,26,51,.04)]'}`}><div className="flex items-start justify-between"><p className={`text-sm font-semibold ${accent ? 'text-white/60' : 'text-slate-500'}`}>{label}</p><span className={`flex h-9 w-9 items-center justify-center rounded-xl ${accent ? 'bg-white/10 text-[#e4c26f]' : 'bg-[#f2ebdd] text-[#9a742b]'}`}>{icon}</span></div><p className="mt-5 text-3xl font-semibold tracking-[-.04em]">{value}</p><p className={`mt-2 text-xs leading-5 ${accent ? 'text-white/45' : 'text-slate-400'}`}>{detail}</p>{accent && <div className="absolute -bottom-12 -right-12 h-32 w-32 rounded-full bg-[#d6af57]/10 blur-xl" />}</article>;
}

function SectionHeader({ eyebrow, title, copy, action }: { eyebrow: string; title: string; copy: string; action?: ReactNode }) {
  return <header className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between"><div><p className="text-xs font-extrabold uppercase tracking-[.2em] text-[#9a742b]">{eyebrow}</p><h2 className="mt-2 text-3xl font-semibold tracking-[-.04em] text-[#071a33]">{title}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">{copy}</p></div>{action}</header>;
}

export default function SuperAdmin() {
  const navigate = useNavigate();
  const demoMode =
    import.meta.env.DEV &&
    new URLSearchParams(window.location.search).get('demo') === '1';
  const [state, setState] = useState<SuperAdminState>(() =>
    demoMode
      ? SuperAdminRepository.load()
      : { clients: [], payments: [], users: [], audit: [] },
  );
  const [view, setView] = useState<AdminView>(() => import.meta.env.DEV && new URLSearchParams(window.location.search).get('demo') === '1' ? 'overview' : 'overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [clientFilter, setClientFilter] = useState<'all' | ClientStanding>('all');
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [showNewClient, setShowNewClient] = useState(false);
  const [accessClientId, setAccessClientId] = useState<string | null>(null);
  const [manageAccessTarget, setManageAccessTarget] = useState<{
    clientId: string;
    accessId?: string;
  } | null>(null);
  const [accessReloadKey, setAccessReloadKey] = useState(0);
  const [revokeClientId, setRevokeClientId] = useState<string | null>(null);
  const [reconcilePaymentId, setReconcilePaymentId] = useState<string | null>(null);
  const [toast, setToast] = useState('');
  const [loadingClients, setLoadingClients] = useState(!demoMode);
  const [platformError, setPlatformError] = useState('');
  const [coreDestination, setCoreDestination] = useState<{ clientId: string | null; section: CoreSection }>({
    clientId: null,
    section: 'summary',
  });
  const openClient = (clientId: string) => navigate(`/dashboard/clientes/${clientId}${demoMode ? '?demo=1' : ''}`);

  useEffect(() => {
    if (demoMode) SuperAdminRepository.save(state);
  }, [demoMode, state]);
  useEffect(() => {
    if (!demoMode) return;
    state.clients.forEach(client => {
      ensureCommunityForClient(client);
      ensureOnboardingForClient(client.id);
    });
  }, [demoMode, state.clients]);
  useEffect(() => {
    if (demoMode) return;
    let active = true;
    const load = async () => {
      setLoadingClients(true);
      setPlatformError('');
      try {
        const clients = await CasaPlatformService.listClients();
        if (active) {
          setState((current) => ({ ...current, clients }));
        }
      } catch (error) {
        if (active) {
          setPlatformError(
            error instanceof Error
              ? error.message
              : 'No fue posible cargar los clientes de CASA.',
          );
        }
      } finally {
        if (active) setLoadingClients(false);
      }
    };
    void load();
    return () => {
      active = false;
    };
  }, [demoMode]);
  useEffect(() => {
    if (!toast) return;
    const timeout = window.setTimeout(() => setToast(''), 3500);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  const selectedClient = state.clients.find(client => client.id === selectedClientId) ?? null;
  const pendingPayments = state.payments.filter(payment => payment.status === 'pending');
  const activeClients = state.clients.filter(client => client.license.status === 'active').length;
  const atRiskClients = state.clients.filter(client => ['past-due', 'suspended'].includes(client.standing)).length;
  const monthlyRevenue = state.clients.filter(client => client.license.status !== 'revoked').reduce((total, client) => total + client.license.monthlyFee, 0);
  const filteredClients = state.clients.filter(client => {
    const matchesSearch = `${client.name} ${client.rif} ${client.location}`.toLowerCase().includes(search.toLowerCase());
    return matchesSearch && (clientFilter === 'all' || client.standing === clientFilter);
  });

  const updateState = (producer: (current: SuperAdminState) => SuperAdminState) => setState(current => producer(current));
  const clientName = (clientId: string) => state.clients.find(client => client.id === clientId)?.name ?? 'Cliente no disponible';

  const reloadRealClients = async () => {
    const clients = await CasaPlatformService.listClients();
    setState((current) => ({ ...current, clients }));
  };

  const toggleAutoRenew = async (clientId: string) => {
    const client = state.clients.find(item => item.id === clientId);
    if (!client) return;
    const enabled = !client.license.autoRenewOnReconciliation;
    if (!demoMode) {
      try {
        setPlatformError('');
        await CasaPlatformService.updateAutoRenew(clientId, enabled);
        await reloadRealClients();
        setToast(
          enabled
            ? 'Renovación automática activada.'
            : 'Renovación automática desactivada.',
        );
      } catch (error) {
        setPlatformError(
          error instanceof Error
            ? error.message
            : 'No fue posible actualizar la renovación.',
        );
      }
      return;
    }
    updateState(current => ({
      ...current,
      clients: current.clients.map(item => item.id === clientId ? { ...item, license: { ...item.license, autoRenewOnReconciliation: enabled } } : item),
      audit: [platformAudit(enabled ? 'Activó renovación automática' : 'Desactivó renovación automática', client.name, 'La renovación queda condicionada a la conciliación del pago mensual.'), ...current.audit],
    }));
    setToast(enabled ? 'Renovación automática activada.' : 'Renovación automática desactivada.');
  };

  const reconcilePayment = (paymentId: string) => {
    const payment = state.payments.find(item => item.id === paymentId);
    if (!payment || payment.status !== 'pending') return;
    const client = state.clients.find(item => item.id === payment.clientId);
    if (!client) return;
    const now = new Date().toISOString();
    const baseEnd = new Date(`${client.license.periodEnd}T12:00:00`);
    const nextStart = new Date(baseEnd);
    nextStart.setDate(nextStart.getDate() + 1);
    const nextEnd = new Date(nextStart);
    nextEnd.setMonth(nextEnd.getMonth() + 1);
    nextEnd.setDate(nextEnd.getDate() - 1);
    const grace = new Date(nextEnd);
    grace.setDate(grace.getDate() + 5);
    const toIsoDate = (value: Date) => value.toISOString().slice(0, 10);
    const renews = client.license.autoRenewOnReconciliation;
    updateState(current => ({
      ...current,
      payments: current.payments.map(item => item.id === paymentId ? { ...item, status: 'reconciled', reconciledAt: now } : item),
      clients: current.clients.map(item => item.id === client.id ? {
        ...item,
        standing: item.license.status === 'revoked' ? 'suspended' : 'solvent',
        license: {
          ...item.license,
          status: item.license.status === 'revoked' ? 'revoked' : 'active',
          lastReconciledAt: now,
          ...(renews ? { periodStart: toIsoDate(nextStart), periodEnd: toIsoDate(nextEnd), graceUntil: toIsoDate(grace) } : {}),
        },
      } : item),
      audit: [platformAudit('Pago conciliado', client.name, renews ? `Pago ${payment.reference} conciliado y licencia renovada hasta ${date.format(nextEnd)}.` : `Pago ${payment.reference} conciliado. Renovación automática desactivada.`), ...current.audit],
    }));
    setToast(renews ? `Pago conciliado. Licencia de ${client.name} renovada.` : 'Pago conciliado sin extender la licencia.');
  };

  const revokeLicense = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!revokeClientId) return;
    const client = state.clients.find(item => item.id === revokeClientId);
    if (!client) return;
    const form = new FormData(event.currentTarget);
    const reason = String(form.get('reason')).trim();
    if (!demoMode) {
      try {
        setPlatformError('');
        await CasaPlatformService.revokeLicense(client.id, reason);
        await reloadRealClients();
        setRevokeClientId(null);
        openClient(client.id);
        setToast(`Licencia de ${client.name} revocada.`);
      } catch (error) {
        setPlatformError(
          error instanceof Error
            ? error.message
            : 'No fue posible revocar la licencia.',
        );
      }
      return;
    }
    updateState(current => ({
      ...current,
      clients: current.clients.map(item => item.id === client.id ? { ...item, standing: 'suspended', license: { ...item.license, status: 'revoked', revokedAt: new Date().toISOString(), autoRenewOnReconciliation: false } } : item),
      audit: [platformAudit('Revocó licencia', client.name, reason, 'critical'), ...current.audit],
    }));
    setRevokeClientId(null);
    setToast(`Licencia de ${client.name} revocada.`);
  };

  const createClient = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const name = String(form.get('name')).trim();
    if (!demoMode) {
      try {
        setPlatformError('');
        const created = await CasaPlatformService.createClient({
          name,
          legalName: String(form.get('legalName')).trim(),
          rif: String(form.get('rif')).trim(),
          contactName: String(form.get('contactName')).trim(),
          contactEmail: String(form.get('contactEmail')).trim(),
          contactPhone: String(form.get('contactPhone')).trim(),
          address: String(form.get('address')).trim(),
          state: String(form.get('state')).trim(),
          city: String(form.get('city')).trim(),
          postalCode: String(form.get('postalCode')).trim(),
          monthlyFee: Number(form.get('monthlyFee')),
          onboardingProgress: 0,
        });
        const id = created.clientId;
        await reloadRealClients();
        setShowNewClient(false);
        openClient(id);
        setToast(`${name} fue registrado correctamente.`);
      } catch (error) {
        setPlatformError(
          error instanceof Error
            ? error.message
            : 'No fue posible registrar el cliente.',
        );
      }
      return;
    }
    const id = platformId('client');
    const start = new Date();
    const end = new Date(start);
    end.setMonth(end.getMonth() + 1);
    end.setDate(end.getDate() - 1);
    const grace = new Date(end);
    grace.setDate(grace.getDate() + 5);
    const iso = (value: Date) => value.toISOString().slice(0, 10);
    const client: PlatformClient = {
      id, name, legalName: String(form.get('legalName')).trim(), rif: String(form.get('rif')).trim().toUpperCase(),
      location: `${String(form.get('city')).trim()}, ${String(form.get('state')).trim()}`, contactName: String(form.get('contactName')).trim(), contactEmail: String(form.get('contactEmail')).trim().toLowerCase(), contactPhone: String(form.get('contactPhone')).trim(),
      standing: 'onboarding', propertyCount: 0, properties: [], composition: 'Estructura pendiente de levantamiento en el Núcleo CASA', onboardingProgress: 10,
      joinedAt: iso(start), lastActivityAt: new Date().toISOString(),
      license: { status: 'active', autoRenewOnReconciliation: true, monthlyFee: Number(form.get('monthlyFee')), currency: 'USD', periodStart: iso(start), periodEnd: iso(end), graceUntil: iso(grace), lastReconciledAt: null, revokedAt: null },
    };
    updateState(current => ({ ...current, clients: [client, ...current.clients], audit: [platformAudit('Registró cliente', name, 'Licencia integral creada e incorporación iniciada.'), ...current.audit] }));
    ensureCommunityForClient(client);
    ensureOnboardingForClient(client.id);
    setShowNewClient(false);
    openClient(id);
    setToast(`${name} fue registrado correctamente.`);
  };

  const createCommunityAccess = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();
    if (!accessClientId || demoMode) return;
    const form = new FormData(event.currentTarget);
    const scopes = form.getAll('scopes').map(String).filter(Boolean);
    const workspaceCodes = form
      .getAll('workspaceCodes')
      .map(String)
      .filter(Boolean);
    const temporaryPassword = form.get('temporaryPassword');
    try {
      setPlatformError('');
      await CasaPlatformService.createCommunityAccess(accessClientId, {
        personId: String(form.get('personId')).trim(),
        roleCode: String(form.get('roleCode')).trim(),
        scopes,
        workspaceCodes,
        temporaryPassword:
          typeof temporaryPassword === 'string'
            ? temporaryPassword.trim() || undefined
            : undefined,
      });
      const client = state.clients.find((item) => item.id === accessClientId);
      setAccessClientId(null);
      setAccessReloadKey((current) => current + 1);
      setToast(
        `Acceso de personal creado${client ? ` para ${client.name}` : ''}.`,
      );
    } catch (error) {
      setPlatformError(
        error instanceof Error
          ? error.message
          : 'No fue posible crear el acceso.',
      );
    }
  };

  const logout = () => {
    const refreshToken = RootSession.refreshToken();
    RootSession.clear();
    navigate('/', { replace: true });
    void CasaAuthService.logout(refreshToken);
  };
  const openView = (next: AdminView) => { setView(next); setSidebarOpen(false); };
  const openOnboardingDestination = (
    destination:
      | { view: 'clients'; clientId: string }
      | { view: 'core'; clientId: string; section?: CoreSection },
  ) => {
    if (destination.view === 'clients') {
      setView('clients');
      openClient(destination.clientId);
      return;
    }
    setCoreDestination({ clientId: destination.clientId, section: destination.section ?? 'summary' });
    setView('core');
  };
  const menuGroups: Array<{ label: string; items: Array<{ id: AdminView; label: string; icon: typeof LayoutDashboard; count?: number }> }> = [
    { label: 'Control', items: [{ id: 'overview', label: 'Resumen ejecutivo', icon: LayoutDashboard }, { id: 'clients', label: 'Clientes', icon: Building2, count: state.clients.length }, { id: 'onboarding', label: 'Incorporación', icon: ClipboardCheck, count: state.clients.filter(client => client.standing === 'onboarding').length }, { id: 'licenses', label: 'Licencias', icon: KeyRound }, { id: 'payments', label: 'Conciliaciones', icon: Landmark, count: pendingPayments.length }] },
    { label: 'Plataforma', items: [{ id: 'core', label: 'Núcleo CASA', icon: Database }, { id: 'users', label: 'Usuarios y acceso', icon: UsersRound }, { id: 'audit', label: 'Auditoría', icon: FileClock }] },
    { label: 'Sistema', items: [{ id: 'monitoring', label: 'Monitoreo', icon: ActivitySquare }, { id: 'settings', label: 'Configuración', icon: Settings2 }] },
  ];

  return <div className="min-h-screen bg-[#f5f3ee] text-[#071a33]">
    {sidebarOpen && <button className="fixed inset-0 z-40 bg-[#071a33]/45 lg:hidden" onClick={() => setSidebarOpen(false)} aria-label="Cerrar navegación" />}
    <aside className={`fixed inset-y-0 left-0 z-50 flex w-[286px] flex-col bg-[#071a33] text-white transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
      <div className="flex h-24 items-center justify-between border-b border-white/8 px-6"><img src="/casa-wordmark-dark.png" alt="CASA" className="h-10 w-auto max-w-[160px] object-contain" /><button onClick={() => setSidebarOpen(false)} className="rounded-lg p-2 text-white/60 lg:hidden"><X size={20} /></button></div>
      <div className="mx-5 mt-5 rounded-2xl border border-[#d6af57]/20 bg-white/[.055] p-4"><div className="flex items-center gap-3"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#d6af57] text-[#071a33]"><ShieldCheck size={18} /></span><div><p className="text-xs font-bold uppercase tracking-[.14em] text-[#e7c975]">CASA Control</p><p className="mt-0.5 text-xs text-white/45">Administración global</p></div></div></div>
      <nav className="mt-5 flex-1 overflow-y-auto px-4 pb-6">{menuGroups.map(group => <div key={group.label} className="mb-6"><p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[.2em] text-white/30">{group.label}</p><div className="space-y-1">{group.items.map(item => { const Icon = item.icon; const active = view === item.id; return <button key={item.id} onClick={() => openView(item.id)} className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold transition ${active ? 'bg-white text-[#071a33] shadow-lg' : 'text-white/60 hover:bg-white/[.06] hover:text-white'}`}><Icon size={18} className={active ? 'text-[#9a742b]' : ''} /><span className="flex-1">{item.label}</span>{item.count !== undefined && item.count > 0 && <span className={`rounded-full px-2 py-0.5 text-[10px] ${active ? 'bg-[#f1eadb] text-[#85631f]' : 'bg-white/10 text-white/70'}`}>{item.count}</span>}</button>; })}</div></div>)}</nav>
      <div className="border-t border-white/8 p-4"><button onClick={logout} className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-white/55 hover:bg-white/[.06] hover:text-white"><LogOut size={18} />Cerrar sesión</button></div>
    </aside>

    <div className="min-h-screen lg:pl-[286px]">
      <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-[#071a33]/8 bg-[#f5f3ee]/90 px-4 backdrop-blur-xl sm:px-7 lg:px-9"><div className="flex items-center gap-3"><button onClick={() => setSidebarOpen(true)} className="rounded-xl border border-[#071a33]/10 bg-white p-2.5 lg:hidden"><Menu size={20} /></button><div><p className="text-[11px] font-bold uppercase tracking-[.18em] text-[#9a742b]">Super Admin</p><p className="hidden text-sm font-semibold sm:block">Control integral de CASA</p></div></div><div className="flex items-center gap-2 sm:gap-3"><button className="relative rounded-xl border border-[#071a33]/8 bg-white p-2.5 text-slate-500"><Bell size={19} /><span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-[#c9972f] ring-2 ring-white" /></button><div className="hidden h-9 w-px bg-[#071a33]/8 sm:block" /><div className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#071a33] text-sm font-bold text-[#e4c26f]">DS</span><div className="hidden md:block"><p className="text-sm font-bold">Diego Sumoza</p><p className="text-xs text-slate-400">ROOT · Acceso total</p></div><ChevronDown size={15} className="hidden text-slate-400 md:block" /></div></div></header>

      <main className="mx-auto max-w-[1600px] px-4 py-7 sm:px-7 lg:px-9 lg:py-9">
        {!demoMode && platformError && <div role="alert" className="mb-6 rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm font-semibold text-rose-700">{platformError}</div>}
        {!demoMode && loadingClients && <div className="mb-6 flex items-center gap-3 rounded-2xl border border-[#071a33]/8 bg-white px-5 py-4 text-sm font-semibold text-slate-500"><span className="h-5 w-5 animate-spin rounded-full border-2 border-[#071a33]/15 border-t-[#b08a3c]" />Sincronizando CASA Control…</div>}
        {view === 'overview' && <Overview state={state} activeClients={activeClients} atRiskClients={atRiskClients} monthlyRevenue={monthlyRevenue} pendingPayments={pendingPayments.length} onView={openView} onClient={openClient} clientName={clientName} />}
        {view === 'clients' && <ClientsView clients={filteredClients} search={search} setSearch={setSearch} filter={clientFilter} setFilter={setClientFilter} onClient={openClient} onNew={() => { setPlatformError(''); setShowNewClient(true); }} />}
        {view === 'onboarding' && <><SectionHeader eyebrow="Ingreso controlado" title="Incorporación de comunidades" copy="Gobierna cada migración desde la recepción de fuentes hasta la conciliación y activación definitiva." /><OnboardingModule key={state.clients.map(client => client.id).join('|')} clients={state.clients} demoMode={demoMode} onNavigate={openOnboardingDestination} /></>}
        {view === 'licenses' && <LicensesView clients={state.clients} onClient={openClient} onToggle={toggleAutoRenew} onRevoke={(id) => { setPlatformError(''); setRevokeClientId(id); }} />}
        {view === 'payments' && <PaymentsView state={state} clientName={clientName} onReconcile={setReconcilePaymentId} onClient={openClient} />}
        {view === 'core' && <><SectionHeader eyebrow="Fuente única de información" title="Núcleo multi-condominio" copy="Gestiona la estructura, personas, gobierno, cuentas y expedientes de cada comunidad desde una base coherente." /><CoreModule clientId={coreDestination.clientId} initialSection={coreDestination.section} canWriteTreasury={true} onManageAccess={(clientId, accessId) => { setPlatformError(''); setManageAccessTarget({ clientId, accessId }); }} /></>}
        {view === 'users' && (
          <UsersView
            clients={state.clients}
            demoMode={demoMode}
            reloadKey={accessReloadKey}
            onManageClient={(id) => {
              setPlatformError('');
              setManageAccessTarget({ clientId: id });
            }}
            onCreateAccess={(id) => {
              setPlatformError('');
              setAccessClientId(id);
            }}
          />
        )}
        {view === 'audit' && <AuditView clients={state.clients} demoMode={demoMode} fallbackEvents={state.audit} />}
        {view === 'monitoring' && <MonitoringDashboard />}
        {view === 'settings' && <SettingsView />}
      </main>
    </div>

    {selectedClient && <ClientDrawer client={selectedClient} payments={state.payments.filter(item => item.clientId === selectedClient.id)} onClose={() => setSelectedClientId(null)} onToggle={() => toggleAutoRenew(selectedClient.id)} onRevoke={() => { setPlatformError(''); setRevokeClientId(selectedClient.id); }} onCreateAccess={() => { setPlatformError(''); setAccessClientId(selectedClient.id); }} onManageAccess={() => { setPlatformError(''); setManageAccessTarget({ clientId: selectedClient.id }); }} />}
    {showNewClient && <NewClientModal error={platformError} onClose={() => setShowNewClient(false)} onSubmit={createClient} />}
    {revokeClientId && <RevokeModal error={platformError} client={state.clients.find(item => item.id === revokeClientId)!} onClose={() => setRevokeClientId(null)} onSubmit={revokeLicense} />}
    {reconcilePaymentId && <ReconcileModal payment={state.payments.find(item => item.id === reconcilePaymentId)!} client={state.clients.find(item => item.id === state.payments.find(payment => payment.id === reconcilePaymentId)?.clientId)!} onClose={() => setReconcilePaymentId(null)} onConfirm={() => { reconcilePayment(reconcilePaymentId); setReconcilePaymentId(null); }} />}
    {accessClientId && <CommunityAccessModal client={state.clients.find(item => item.id === accessClientId)!} error={platformError} onClose={() => setAccessClientId(null)} onSubmit={createCommunityAccess} />}
    {manageAccessTarget && <ManageCommunityAccessModal client={state.clients.find(item => item.id === manageAccessTarget.clientId)!} initialAccessId={manageAccessTarget.accessId} onClose={() => setManageAccessTarget(null)} onSaved={(message) => { setToast(message); setAccessReloadKey((current) => current + 1); }} />}
    {toast && <div className="fixed bottom-5 left-1/2 z-[150] flex -translate-x-1/2 items-center gap-3 rounded-full bg-[#071a33] px-5 py-3 text-sm font-semibold text-white shadow-2xl"><CheckCircle2 size={18} className="text-[#e4c26f]" />{toast}</div>}
  </div>;
}

function Overview({ state, activeClients, atRiskClients, monthlyRevenue, pendingPayments, onView, onClient, clientName }: { state: SuperAdminState; activeClients: number; atRiskClients: number; monthlyRevenue: number; pendingPayments: number; onView: (view: AdminView) => void; onClient: (id: string) => void; clientName: (id: string) => string }) {
  const attention = state.clients.filter(client => ['past-due', 'due-soon', 'onboarding', 'suspended'].includes(client.standing));
  return <><SectionHeader eyebrow="Domingo, 19 de julio" title="El estado completo de CASA, en un vistazo." copy="Supervisa clientes, licencias, ingresos y riesgos operativos desde una única superficie de control." action={<button onClick={() => onView('clients')} className="inline-flex items-center justify-center gap-2 rounded-full bg-[#071a33] px-5 py-3 text-sm font-bold text-white"><Building2 size={17} />Gestionar clientes</button>} />
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><MetricCard label="Ingresos mensuales" value={money.format(monthlyRevenue)} detail="Licencias integrales vigentes" icon={<CircleDollarSign size={18} />} accent /><MetricCard label="Clientes activos" value={String(activeClients)} detail={`${state.clients.length} organizaciones registradas`} icon={<Building2 size={18} />} /><MetricCard label="Requieren atención" value={String(atRiskClients)} detail="Mora, suspensión o riesgo" icon={<AlertTriangle size={18} />} /><MetricCard label="Por conciliar" value={String(pendingPayments)} detail="Pagos esperando validación" icon={<Landmark size={18} />} /></section>
    <section className="mt-6 grid gap-6 xl:grid-cols-[1.25fr_.75fr]"><article className="rounded-[1.6rem] border border-[#071a33]/8 bg-white p-5 shadow-[0_16px_45px_rgba(7,26,51,.04)] sm:p-6"><div className="flex items-center justify-between"><div><p className="text-xs font-bold uppercase tracking-[.16em] text-[#9a742b]">Atención prioritaria</p><h3 className="mt-2 text-xl font-semibold">Clientes que requieren seguimiento</h3></div><button onClick={() => onView('clients')} className="text-sm font-bold text-[#9a742b]">Ver todos</button></div><div className="mt-5 divide-y divide-slate-100">{attention.map(client => <button key={client.id} onClick={() => onClient(client.id)} className="grid w-full gap-3 py-4 text-left sm:grid-cols-[1fr_auto_auto] sm:items-center"><div className="flex min-w-0 items-center gap-3"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#f1eadb] font-bold text-[#85631f]">{client.name.charAt(0)}</span><div className="min-w-0"><p className="truncate text-sm font-bold">{client.name}</p><p className="mt-1 truncate text-xs text-slate-400">{client.location} · {client.propertyCount} inmuebles</p></div></div><StatusBadge type={client.standing} /><p className="text-right text-xs text-slate-400">Vence {date.format(new Date(`${client.license.periodEnd}T12:00:00`))}</p></button>)}</div></article>
      <article className="rounded-[1.6rem] bg-[#071a33] p-6 text-white shadow-[0_20px_55px_rgba(7,26,51,.18)]"><div className="flex items-center justify-between"><div><p className="text-xs font-bold uppercase tracking-[.16em] text-[#e4c26f]">Pulso de plataforma</p><h3 className="mt-2 text-xl font-semibold">Servicios operativos</h3></div><Activity className="text-[#e4c26f]" size={22} /></div><div className="mt-7 space-y-5">{[['API principal', 'Operativa', '99.99%'], ['Base de datos', 'Operativa', '12 ms'], ['Conferencias', 'Operativa', '99.96%'], ['Notificaciones', 'Operativa', '148 ms']].map(([label, status, metric]) => <div key={label} className="flex items-center justify-between"><div><p className="text-sm font-semibold">{label}</p><p className="mt-1 text-xs text-emerald-300">● {status}</p></div><span className="font-mono text-xs text-white/40">{metric}</span></div>)}</div><button onClick={() => onView('settings')} className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl border border-white/12 bg-white/[.05] py-3 text-sm font-bold text-white/75">Ver estado técnico <ArrowRight size={15} /></button></article></section>
    <section className="mt-6 rounded-[1.6rem] border border-[#071a33]/8 bg-white p-5 shadow-[0_16px_45px_rgba(7,26,51,.04)] sm:p-6"><div className="flex items-center justify-between"><div><p className="text-xs font-bold uppercase tracking-[.16em] text-[#9a742b]">Actividad financiera</p><h3 className="mt-2 text-xl font-semibold">Últimos movimientos de licencia</h3></div><button onClick={() => onView('payments')} className="text-sm font-bold text-[#9a742b]">Abrir conciliaciones</button></div><div className="mt-5 overflow-x-auto"><table className="w-full min-w-[720px] text-left text-sm"><thead className="border-b border-slate-200 text-[11px] font-bold uppercase tracking-[.14em] text-slate-400"><tr><th className="pb-3">Cliente</th><th className="pb-3">Referencia</th><th className="pb-3">Monto</th><th className="pb-3">Reportado</th><th className="pb-3">Estado</th></tr></thead><tbody>{state.payments.slice(0, 5).map(payment => <tr key={payment.id} className="border-b border-slate-100"><td className="py-4 font-semibold">{clientName(payment.clientId)}</td><td className="py-4 font-mono text-xs text-slate-500">{payment.reference}</td><td className="py-4 font-semibold">{money.format(payment.amount)}</td><td className="py-4 text-slate-500">{dateTime.format(new Date(payment.reportedAt))}</td><td className="py-4">{payment.status === 'reconciled' ? <span className="text-xs font-bold text-emerald-700">✓ Conciliado</span> : <span className="text-xs font-bold text-amber-700">● Pendiente</span>}</td></tr>)}</tbody></table></div></section>
  </>;
}

function ClientsView({ clients, search, setSearch, filter, setFilter, onClient, onNew }: { clients: PlatformClient[]; search: string; setSearch: (value: string) => void; filter: 'all' | ClientStanding; setFilter: (value: 'all' | ClientStanding) => void; onClient: (id: string) => void; onNew: () => void }) {
  return <><SectionHeader eyebrow="Relación comercial" title="Clientes" copy="Consulta la situación operativa, contractual y financiera de cada organización que utiliza CASA." action={<button onClick={onNew} className="inline-flex items-center justify-center gap-2 rounded-full bg-[#071a33] px-5 py-3 text-sm font-bold text-white"><Plus size={17} />Registrar cliente</button>} />
    <section className="rounded-[1.6rem] border border-[#071a33]/8 bg-white shadow-[0_16px_45px_rgba(7,26,51,.04)]"><div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5"><div className="relative flex-1 sm:max-w-md"><Search className="absolute left-3.5 top-3 text-slate-400" size={17} /><input value={search} onChange={event => setSearch(event.target.value)} placeholder="Buscar cliente, RIF o ubicación" className="w-full rounded-xl border border-slate-200 bg-[#fbfaf7] py-2.5 pl-10 pr-4 text-sm outline-none focus:border-[#b08a3c]" /></div><div className="flex items-center gap-2 overflow-x-auto"><SlidersHorizontal size={17} className="shrink-0 text-slate-400" /><select value={filter} onChange={event => setFilter(event.target.value as 'all' | ClientStanding)} className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold"><option value="all">Todos los estados</option>{Object.entries(standingMeta).map(([value, meta]) => <option key={value} value={value}>{meta.label}</option>)}</select></div></div><div className="overflow-x-auto"><table className="w-full min-w-[1050px] text-left text-sm"><thead className="border-b border-slate-100 bg-[#fbfaf7] text-[11px] font-bold uppercase tracking-[.13em] text-slate-400"><tr><th className="px-5 py-3">Cliente</th><th className="px-4 py-3">Solvencia</th><th className="px-4 py-3">Licencia</th><th className="px-4 py-3">Mensualidad</th><th className="px-4 py-3">Vigencia</th><th className="px-4 py-3">Incorporación</th><th className="px-5 py-3 text-right">Control</th></tr></thead><tbody>{clients.map(client => <tr key={client.id} className="border-b border-slate-100 transition hover:bg-[#fbfaf7]"><td className="px-5 py-4"><div className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#071a33] font-bold text-[#e4c26f]">{client.name.charAt(0)}</span><div><p className="font-bold">{client.name}</p><p className="mt-1 text-xs text-slate-400">{client.rif} · {client.location}</p></div></div></td><td className="px-4 py-4"><StatusBadge type={client.standing} /></td><td className="px-4 py-4"><StatusBadge type={client.license.status} license /></td><td className="px-4 py-4 font-semibold">{money.format(client.license.monthlyFee)}</td><td className="px-4 py-4 text-xs text-slate-500">Hasta {date.format(new Date(`${client.license.periodEnd}T12:00:00`))}</td><td className="px-4 py-4"><div className="w-28"><div className="flex justify-between text-[10px] text-slate-400"><span>Progreso</span><span>{client.onboardingProgress}%</span></div><div className="mt-1.5 h-1.5 rounded-full bg-slate-100"><div className="h-full rounded-full bg-[#c89e43]" style={{ width: `${client.onboardingProgress}%` }} /></div></div></td><td className="px-5 py-4 text-right"><button onClick={() => onClient(client.id)} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold hover:border-[#b08a3c]">Abrir ficha <ArrowRight size={14} /></button></td></tr>)}</tbody></table>{!clients.length && <p className="p-12 text-center text-sm text-slate-500">No hay clientes que coincidan con la búsqueda.</p>}</div></section>
  </>;
}

function LicensesView({ clients, onClient, onToggle, onRevoke }: { clients: PlatformClient[]; onClient: (id: string) => void; onToggle: (id: string) => void; onRevoke: (id: string) => void }) {
  return <><SectionHeader eyebrow="Gobierno comercial" title="Licencias integrales" copy="Cada licencia habilita el ecosistema completo. La vigencia se extiende al conciliar la mensualidad cuando la renovación automática está activa." /><div className="grid gap-4 lg:grid-cols-3"><MetricCard label="Licencias vigentes" value={String(clients.filter(item => item.license.status === 'active').length)} detail="Acceso operativo habilitado" icon={<KeyRound size={18} />} /><MetricCard label="Renovación automática" value={String(clients.filter(item => item.license.autoRenewOnReconciliation).length)} detail="Condicionadas a conciliación" icon={<RefreshCw size={18} />} /><MetricCard label="Valor mensual" value={money.format(clients.filter(item => item.license.status !== 'revoked').reduce((sum, item) => sum + item.license.monthlyFee, 0))} detail="Cartera contractual activa" icon={<WalletCards size={18} />} accent /></div>
    <section className="mt-6 space-y-4">{clients.map(client => <article key={client.id} className="rounded-[1.5rem] border border-[#071a33]/8 bg-white p-5 shadow-[0_14px_40px_rgba(7,26,51,.04)]"><div className="grid gap-5 xl:grid-cols-[1.3fr_.8fr_.8fr_1fr_auto] xl:items-center"><button onClick={() => onClient(client.id)} className="flex items-center gap-3 text-left"><span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#071a33] font-bold text-[#e4c26f]">{client.name.charAt(0)}</span><div><p className="font-bold">{client.name}</p><p className="mt-1 text-xs text-slate-400">{client.rif}</p></div></button><div><p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Estado</p><div className="mt-2"><StatusBadge type={client.license.status} license /></div></div><div><p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Vigencia</p><p className="mt-2 text-sm font-semibold">{date.format(new Date(`${client.license.periodEnd}T12:00:00`))}</p></div><div><p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Renovar al conciliar</p><button onClick={() => onToggle(client.id)} className={`mt-2 flex items-center gap-2 text-sm font-bold ${client.license.autoRenewOnReconciliation ? 'text-emerald-700' : 'text-slate-400'}`}><span className={`relative h-6 w-11 rounded-full transition ${client.license.autoRenewOnReconciliation ? 'bg-emerald-600' : 'bg-slate-200'}`}><span className={`absolute top-1 h-4 w-4 rounded-full bg-white transition ${client.license.autoRenewOnReconciliation ? 'left-6' : 'left-1'}`} /></span>{client.license.autoRenewOnReconciliation ? 'Activa' : 'Manual'}</button></div><div className="flex gap-2"><button onClick={() => onClient(client.id)} className="rounded-xl border border-slate-200 p-2.5 text-slate-500"><MoreHorizontal size={18} /></button>{client.license.status !== 'revoked' && <button onClick={() => onRevoke(client.id)} className="rounded-xl border border-rose-200 px-3 py-2 text-xs font-bold text-rose-700 hover:bg-rose-50">Revocar</button>}</div></div></article>)}</section>
  </>;
}

function PaymentsView({ state, clientName, onReconcile, onClient }: { state: SuperAdminState; clientName: (id: string) => string; onReconcile: (id: string) => void; onClient: (id: string) => void }) {
  const pending = state.payments.filter(item => item.status === 'pending');
  return <><SectionHeader eyebrow="Control financiero" title="Conciliaciones de licencia" copy="Validar un pago cambia la solvencia del cliente y puede renovar automáticamente el período contratado. Cada acción queda auditada." />
    {pending.length > 0 && <section className="mb-6 rounded-[1.6rem] border border-amber-200 bg-amber-50/70 p-5"><div className="flex items-start gap-3"><span className="rounded-xl bg-amber-100 p-2 text-amber-700"><Clock3 size={20} /></span><div><p className="font-bold text-amber-900">{pending.length} pago pendiente de validación</p><p className="mt-1 text-sm text-amber-800/70">Confirma referencia, monto y cuenta receptora antes de conciliar.</p></div></div></section>}
    <section className="rounded-[1.6rem] border border-[#071a33]/8 bg-white shadow-[0_16px_45px_rgba(7,26,51,.04)]"><div className="overflow-x-auto"><table className="w-full min-w-[920px] text-left text-sm"><thead className="border-b border-slate-100 bg-[#fbfaf7] text-[11px] font-bold uppercase tracking-[.13em] text-slate-400"><tr><th className="px-5 py-3">Cliente</th><th className="px-4 py-3">Referencia</th><th className="px-4 py-3">Banco</th><th className="px-4 py-3">Monto</th><th className="px-4 py-3">Fecha</th><th className="px-4 py-3">Estado</th><th className="px-5 py-3 text-right">Acción</th></tr></thead><tbody>{state.payments.map(payment => <tr key={payment.id} className="border-b border-slate-100"><td className="px-5 py-4"><button onClick={() => onClient(payment.clientId)} className="font-bold hover:text-[#9a742b]">{clientName(payment.clientId)}</button></td><td className="px-4 py-4 font-mono text-xs">{payment.reference}</td><td className="px-4 py-4 text-slate-500">{payment.bank}</td><td className="px-4 py-4 font-bold">{money.format(payment.amount)}</td><td className="px-4 py-4 text-slate-500">{dateTime.format(new Date(payment.reportedAt))}</td><td className="px-4 py-4">{payment.status === 'reconciled' ? <span className="text-xs font-bold text-emerald-700">✓ Conciliado</span> : payment.status === 'pending' ? <span className="text-xs font-bold text-amber-700">● Por validar</span> : <span className="text-xs font-bold text-rose-700">× Rechazado</span>}</td><td className="px-5 py-4 text-right">{payment.status === 'pending' ? <button onClick={() => onReconcile(payment.id)} className="inline-flex items-center gap-2 rounded-xl bg-[#071a33] px-3.5 py-2.5 text-xs font-bold text-white"><Check size={15} />Conciliar y procesar</button> : <span className="text-xs text-slate-400">{payment.reconciledAt ? dateTime.format(new Date(payment.reconciledAt)) : '—'}</span>}</td></tr>)}</tbody></table></div></section>
  </>;
}

function UsersView({
  clients,
  demoMode,
  reloadKey,
  onManageClient,
  onCreateAccess,
}: {
  clients: PlatformClient[];
  demoMode: boolean;
  reloadKey: number;
  onManageClient: (clientId: string) => void;
  onCreateAccess: (clientId: string) => void;
}) {
  const [records, setRecords] = useState<
    Array<{ client: PlatformClient; access: CommunityAccessRecord }>
  >([]);
  const [communityId, setCommunityId] = useState('all');
  const [status, setStatus] = useState('ACTIVE');
  const [searchValue, setSearchValue] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);
  useEffect(() => {
    let active = true;
    const load = async () => {
      if (!clients.length) {
        setRecords([]);
        setLoading(false);
        return;
      }
      if (demoMode) {
        const demoRoles = [
          {
            role: 'ADMINISTRACION',
            scopes: [
              'core.read',
              'core.community.write',
              'core.people.write',
              'core.properties.write',
            ],
            workspaces: ['ADMINISTRATION'],
          },
          {
            role: 'TESORERIA',
            scopes: ['core.read', 'treasury.read', 'treasury.write'],
            workspaces: ['ADMINISTRATION', 'COLLECTIONS'],
          },
          {
            role: 'JUNTA',
            scopes: ['core.read', 'billing.read'],
            workspaces: ['BOARD', 'ADMINISTRATION'],
          },
          {
            role: 'ATENCION',
            scopes: ['core.read', 'core.people.write'],
            workspaces: ['OWNER_SERVICE'],
          },
        ];
        const demoRecords = clients.map((client, index) => {
          const profile = demoRoles[index % demoRoles.length];
          const nameParts = client.contactName.split(' ').filter(Boolean);
          return {
            client,
            access: {
              id: `demo-access-${client.id}`,
              roleCode: profile.role,
              scopes: profile.scopes,
              status: 'ACTIVE',
              employmentActive: true,
              workspaces: profile.workspaces.map((workspaceCode) => ({
                id: `demo-workspace-${client.id}-${workspaceCode}`,
                workspaceCode,
                status: 'ACTIVE',
                startsOn: client.joinedAt,
                endsOn: null,
                endReason: null,
              })),
              user: {
                id: `demo-user-${client.id}`,
                email: client.contactEmail,
                status: 'ACTIVE',
                lastAccessAt: client.lastActivityAt,
                person: {
                  firstName: nameParts[0] ?? 'Personal',
                  lastName: nameParts.slice(1).join(' ') || client.name,
                  documentType: 'V',
                  documentNumber: `DEMO-${index + 1}`,
                },
              },
            },
          } satisfies {
            client: PlatformClient;
            access: CommunityAccessRecord;
          };
        });
        if (active) {
          setRecords(demoRecords);
          setError('');
          setLoading(false);
        }
        return;
      }
      setLoading(true);
      setError('');
      const results = await Promise.allSettled(
        clients.map(async (client) => {
          const [accessesResult, personnelResult] = await Promise.allSettled([
            CasaPlatformService.listCommunityAccess(client.id),
            CasaPlatformService.listAccessPersonnel(client.id),
          ]);
          const accesses = accessesResult.status === 'fulfilled'
            ? accessesResult.value
            : [];
          const personnelAccesses = personnelResult.status === 'fulfilled'
            ? personnelResult.value.flatMap((item) => item.access ? [item.access] : [])
            : [];
          const known = new Set(accesses.map((access) => access.id));
          return {
            client,
            accesses: [...accesses, ...personnelAccesses.filter((access) => !known.has(access.id))],
            failed: accessesResult.status === 'rejected' && personnelResult.status === 'rejected',
          };
        }),
      );
      if (!active) return;
      const available = results.flatMap((result) =>
        result.status === 'fulfilled'
          ? result.value.accesses.map((access) => ({
              client: result.value.client,
              access,
            }))
          : [],
      );
      const failed = results.filter((result) =>
        result.status === 'rejected' || (result.status === 'fulfilled' && result.value.failed),
      );
      setRecords(available);
      if (failed.length) {
        setError(
          failed.length === clients.length
            ? 'No fue posible consultar los accesos de las comunidades.'
            : `No se pudieron consultar ${failed.length} comunidad(es). Los demás accesos sí están visibles.`,
        );
      }
      setLoading(false);
    };
    void load();
    return () => {
      active = false;
    };
  }, [clients, demoMode, refreshKey, reloadKey]);

  const normalizedSearch = searchValue.trim().toLowerCase();
  const filtered = records.filter(({ client, access }) => {
    const personName = access.user.person
      ? `${access.user.person.firstName} ${access.user.person.lastName}`
      : '';
    const document = access.user.person
      ? `${access.user.person.documentType}-${access.user.person.documentNumber}`
      : '';
    const matchesCommunity =
      communityId === 'all' || client.id === communityId;
    const matchesStatus = status === 'all' || access.status === status;
    const matchesSearch =
      !normalizedSearch ||
      `${personName} ${access.user.email} ${document} ${access.roleCode} ${client.name}`
        .toLowerCase()
        .includes(normalizedSearch);
    return matchesCommunity && matchesStatus && matchesSearch;
  });

  const activeUsers = records.filter(
    ({ access }) => access.status === 'ACTIVE',
  ).length;
  const communitiesWithUsers = new Set(
    records.map(({ client }) => client.id),
  ).size;
  const selectedClient =
    communityId === 'all'
      ? null
      : clients.find((client) => client.id === communityId) ?? null;

  return (
    <>
      <SectionHeader
        eyebrow="Gobierno de acceso"
        title="Usuarios por comunidad"
        copy="Consulta quién puede ingresar a cada comunidad, con qué rol, cuáles permisos efectivos posee y en qué espacios puede trabajar."
        action={
          selectedClient ? (
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => onManageClient(selectedClient.id)}
                className="rounded-full border border-[#071a33]/12 bg-white px-5 py-3 text-sm font-bold"
              >
                Administrar accesos
              </button>
              <button
                onClick={() => onCreateAccess(selectedClient.id)}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#071a33] px-5 py-3 text-sm font-bold text-white"
              >
                <Plus size={17} /> Crear acceso
              </button>
            </div>
          ) : null
        }
      />

      <section className="grid gap-4 sm:grid-cols-3">
        <MetricCard
          label="Usuarios registrados"
          value={String(records.length)}
          detail={`${activeUsers} con acceso activo`}
          icon={<UsersRound size={18} />}
          accent
        />
        <MetricCard
          label="Comunidades cubiertas"
          value={String(communitiesWithUsers)}
          detail={`De ${clients.length} clientes registrados`}
          icon={<Building2 size={18} />}
        />
        <MetricCard
          label="Asignaciones operativas"
          value={String(
            records.reduce(
              (total, { access }) =>
                total +
                access.workspaces.filter(
                  (workspace) => workspace.status === 'ACTIVE',
                ).length,
              0,
            ),
          )}
          detail="Espacios de trabajo vigentes"
          icon={<BriefcaseBusiness size={18} />}
        />
      </section>

      <section className="mt-6 rounded-[1.6rem] border border-[#d6af57]/35 bg-[#fffaf0] p-5 shadow-[0_16px_45px_rgba(7,26,51,.03)] sm:p-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[.16em] text-[#9a742b]">Catálogo de autorización</p>
            <h3 className="mt-2 text-xl font-semibold text-[#071a33]">Espacios de trabajo y permisos disponibles</h3>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">Este es el catálogo que ROOT puede asignar a cada trabajador. En “Administrar accesos” puedes combinar espacios completos o permisos individuales.</p>
          </div>
          <span className="shrink-0 rounded-full bg-white px-3 py-1.5 text-xs font-bold text-[#76571e] ring-1 ring-[#d8be86]/50">{workspaceCatalog.length} espacios · {explicitScopeCatalog.length} permisos</span>
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {workspaceCatalog.map((workspace) => {
            const workspaceScopes = explicitScopeCatalog.filter((scope) =>
              scope.workspaceCode === workspace.code ||
              (workspace.code === 'ADMINISTRATION' && (scope.code.startsWith('core.') || scope.code.startsWith('treasury.') || scope.code.startsWith('billing.'))) ||
              (workspace.code === 'ACCOUNTING' && (scope.code.startsWith('accounting.') || scope.code.startsWith('treasury.'))),
            );
            return (
              <details key={workspace.code} className="group rounded-2xl border border-white bg-white p-4 shadow-sm">
                <summary className="cursor-pointer list-none font-bold text-[#071a33] marker:hidden">
                  <span className="flex items-center justify-between gap-3"><span>{workspace.label}</span><span className="rounded-full bg-[#f1eadb] px-2 py-1 text-[10px] text-[#76571e]">{workspaceScopes.length}</span></span>
                  <span className="mt-1 block text-xs font-normal leading-5 text-slate-500">{workspace.description}</span>
                </summary>
                <div className="mt-3 space-y-2 border-t border-slate-100 pt-3">
                  {workspaceScopes.length ? workspaceScopes.map((scope) => <div key={scope.code} className="rounded-xl bg-[#fbfaf7] px-3 py-2"><p className="text-xs font-bold text-[#071a33]">{scope.label}</p><p className="mt-0.5 text-[11px] leading-4 text-slate-500">{scope.description}</p></div>) : <p className="text-xs text-slate-500">Se asigna como espacio operativo completo.</p>}
                </div>
              </details>
            );
          })}
        </div>
      </section>

      <section className="mt-6 rounded-[1.6rem] border border-[#071a33]/8 bg-white shadow-[0_16px_45px_rgba(7,26,51,.04)]">
        {demoMode && (
          <div className="border-b border-[#d8be86]/35 bg-[#faf6ec] px-5 py-3 text-xs font-semibold text-[#76571e]">
            Vista de demostración: estas identidades sirven para comprobar la
            organización visual. En la sesión ROOT se consultan los accesos
            reales de la base de datos.
          </div>
        )}
        <div className="grid gap-3 border-b border-slate-100 p-4 md:grid-cols-[1fr_240px_180px_auto] md:items-center sm:p-5">
          <div className="relative">
            <Search
              className="absolute left-3.5 top-3 text-slate-400"
              size={17}
            />
            <input
              value={searchValue}
              onChange={(event) => setSearchValue(event.target.value)}
              placeholder="Buscar persona, correo, documento o rol"
              className="w-full rounded-xl border border-slate-200 bg-[#fbfaf7] py-2.5 pl-10 pr-4 text-sm outline-none focus:border-[#b08a3c]"
            />
          </div>
          <select
            value={communityId}
            onChange={(event) => setCommunityId(event.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold"
          >
            <option value="all">Todas las comunidades</option>
            {clients.map((client) => (
              <option key={client.id} value={client.id}>
                {client.name}
              </option>
            ))}
          </select>
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold"
          >
            <option value="ACTIVE">Solo activos</option>
            <option value="all">Todos los estados</option>
            <option value="BLOCKED">Bloqueados / históricos</option>
            <option value="REVOKED">Revocados</option>
          </select>
          <button
            onClick={() => setRefreshKey((current) => current + 1)}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold disabled:opacity-50"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            Actualizar
          </button>
        </div>

        {error && (
          <div
            role="alert"
            className="m-5 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800"
          >
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center gap-3 py-20 text-sm font-semibold text-slate-500">
            <span className="h-7 w-7 animate-spin rounded-full border-2 border-[#071a33]/15 border-t-[#b08a3c]" />
            Consultando usuarios y autorizaciones…
          </div>
        ) : filtered.length ? (
          <div className="divide-y divide-slate-100">
            {filtered.map(({ client, access }) => {
              const person = access.user.person;
              const personName = person
                ? `${person.firstName} ${person.lastName}`
                : access.user.email;
              const activeWorkspaces = access.workspaces.filter(
                (workspace) => workspace.status === 'ACTIVE',
              );
              return (
                <article key={`${client.id}-${access.id}`} className="p-5 sm:p-6">
                  <div className="grid gap-5 xl:grid-cols-[1.15fr_.7fr_1.1fr_1.4fr]">
                    <div>
                      <div className="flex items-start gap-3">
                        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#071a33] font-bold text-[#e4c26f]">
                          {personName.charAt(0).toUpperCase()}
                        </span>
                        <div className="min-w-0">
                          <p className="truncate font-bold">{personName}</p>
                          <p className="mt-1 truncate text-xs text-slate-400">
                            {access.user.email}
                          </p>
                          {person && (
                            <p className="mt-1 text-xs text-slate-400">
                              {person.documentType}-{person.documentNumber}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="mt-4 flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-[#f0e8d8] px-2.5 py-1 text-xs font-bold text-[#76571e]">
                          {client.name}
                        </span>
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                            access.status === 'ACTIVE'
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-rose-50 text-rose-700'
                          }`}
                        >
                          {access.status === 'ACTIVE'
                            ? 'Acceso activo'
                            : access.status}
                        </span>
                        <span className="rounded-full bg-[#eef2f5] px-2.5 py-1 text-xs font-bold text-[#31465d]">
                          {access.employmentActive ? 'Personal' : 'Propietario / otro acceso'}
                        </span>
                      </div>
                    </div>

                    <AccessColumn title="Rol">
                      <span className="inline-flex rounded-lg bg-[#f8f6f1] px-3 py-2 text-sm font-bold">
                        {roleLabel(access.roleCode)}
                      </span>
                      <p className="mt-3 text-xs leading-5 text-slate-400">
                        Último acceso:{' '}
                        {access.user.lastAccessAt
                          ? dateTime.format(new Date(access.user.lastAccessAt))
                          : 'Nunca'}
                      </p>
                    </AccessColumn>

                    <AccessColumn title="Espacios de trabajo">
                      <div className="flex flex-wrap gap-2">
                        {activeWorkspaces.length ? (
                          activeWorkspaces.map((workspace) => (
                            <span
                              key={workspace.id}
                              className="rounded-lg border border-[#d8be86]/45 bg-[#faf6ec] px-2.5 py-1.5 text-xs font-bold text-[#76571e]"
                            >
                              {workspaceLabel(workspace.workspaceCode)}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs font-semibold text-rose-600">
                            Sin espacios vigentes
                          </span>
                        )}
                      </div>
                    </AccessColumn>

                    <AccessColumn title="Permisos explícitos">
                      <div className="flex flex-wrap gap-2">
                        {(Array.isArray(access.scopes) ? access.scopes : []).length ? (
                          (Array.isArray(access.scopes) ? access.scopes : []).map((scope) => (
                            <span
                              key={scope}
                              title={scope}
                              className="rounded-lg bg-[#eef2f5] px-2.5 py-1.5 text-xs font-semibold text-[#31465d]"
                            >
                              {scopeLabel(scope)}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs font-semibold text-rose-600">
                            Sin permisos explícitos
                          </span>
                        )}
                      </div>
                    </AccessColumn>
                  </div>
                  <div className="mt-5 flex flex-wrap justify-end gap-2 border-t border-slate-100 pt-4">
                    <button
                      type="button"
                      onClick={() => onManageClient(client.id)}
                      className="rounded-xl border border-[#071a33]/12 bg-white px-4 py-2.5 text-xs font-bold text-[#071a33] hover:border-[#b08a3c]"
                    >
                      Editar permisos y espacios
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="p-14 text-center">
            <UserRoundCog className="mx-auto text-slate-300" size={30} />
            <p className="mt-4 text-sm font-semibold text-slate-500">
              No hay usuarios que coincidan con los filtros.
            </p>
            {selectedClient && (
              <button
                onClick={() => onCreateAccess(selectedClient.id)}
                className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#071a33] px-5 py-3 text-sm font-bold text-white"
              >
                <Plus size={16} /> Crear primer acceso
              </button>
            )}
          </div>
        )}
      </section>
    </>
  );
}

function AccessColumn({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div>
      <p className="mb-3 text-[10px] font-bold uppercase tracking-[.14em] text-slate-400">
        {title}
      </p>
      {children}
    </div>
  );
}

function AuditView({
  clients,
  demoMode,
  fallbackEvents,
}: {
  clients: PlatformClient[];
  demoMode: boolean;
  fallbackEvents: SuperAdminState['audit'];
}) {
  const [communityId, setCommunityId] = useState('all');
  const [searchValue, setSearchValue] = useState('');
  const [events, setEvents] = useState<PlatformAuditRecord[]>([]);
  const [loading, setLoading] = useState(!demoMode);
  const [error, setError] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  const demoEvents = fallbackEvents.map((event) => ({
    id: event.id,
    communityId: null,
    actorUserId: null,
    requestId: `demo-request-${event.id}`,
    action: event.action,
    entityType: 'Platform',
    entityId: event.id,
    detail: event.detail,
    reason: null,
    before: null,
    after: null,
    ipAddress: null,
    userAgent: null,
    createdAt: event.createdAt,
    community: null,
    actor: { id: 'demo-root', email: event.actor, platformRole: 'ROOT', person: null },
  } satisfies PlatformAuditRecord));

  useEffect(() => {
    let active = true;
    if (demoMode) {
      return () => { active = false; };
    }
    void Promise.resolve().then(() => {
      if (active) {
        setLoading(true);
        setError('');
      }
    });
    void CasaPlatformService.listAuditEvents(
      communityId === 'all'
        ? undefined
        : clients.find((client) => client.id === communityId)?.communityId ?? undefined,
    )
      .then((data) => {
        if (active) setEvents(data);
      })
      .catch((loadError: unknown) => {
        if (active) {
          setEvents([]);
          setError(loadError instanceof Error ? loadError.message : 'No fue posible consultar la auditoría global.');
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, [clients, communityId, demoMode, fallbackEvents, refreshKey]);

  const normalizedSearch = searchValue.trim().toLowerCase();
  const filteredEvents = (demoMode ? demoEvents : events).filter((event) => {
    const actorName = event.actor?.person
      ? `${event.actor.person.firstName} ${event.actor.person.lastName}`
      : event.actor?.email ?? event.actorUserId ?? '';
    return !normalizedSearch || `${event.community?.name ?? 'Plataforma'} ${event.action} ${event.detail} ${event.reason ?? ''} ${actorName} ${event.actorUserId ?? ''} ${event.id} ${event.entityId ?? ''}`.toLowerCase().includes(normalizedSearch);
  });

  const formatPayload = (value: unknown) => {
    if (value === null || value === undefined) return '—';
    try {
      return JSON.stringify(value, null, 2);
    } catch {
      return 'No disponible';
    }
  };

  return <>
    <SectionHeader
      eyebrow="Central de auditoría"
      title="Actividad de todas las comunidades"
      copy="Consulta quién hizo qué, en qué comunidad y cuándo. La vista ROOT no limita el alcance: puedes revisar la bitácora global o seleccionar una comunidad específica."
    />
    <section className="rounded-[1.6rem] border border-[#071a33]/8 bg-white shadow-[0_16px_45px_rgba(7,26,51,.04)]">
      <div className="grid gap-3 border-b border-slate-100 p-4 md:grid-cols-[1fr_280px_auto] md:items-center sm:p-5">
        <div className="relative">
          <Search className="absolute left-3.5 top-3 text-slate-400" size={17} />
          <input value={searchValue} onChange={(event) => setSearchValue(event.target.value)} placeholder="Buscar usuario, acción, ID o detalle" className="w-full rounded-xl border border-slate-200 bg-[#fbfaf7] py-2.5 pl-10 pr-4 text-sm outline-none focus:border-[#b08a3c]" />
        </div>
        <select value={communityId} onChange={(event) => setCommunityId(event.target.value)} className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold">
          <option value="all">Todas las comunidades</option>
          {clients.map((client) => <option key={client.id} value={client.id}>{client.name}</option>)}
        </select>
        <button onClick={() => setRefreshKey((current) => current + 1)} disabled={loading} className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold disabled:opacity-50"><RefreshCw size={16} className={loading ? 'animate-spin' : ''} />Actualizar</button>
      </div>
      {error && <div role="alert" className="m-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">{error}</div>}
      {loading ? <div className="flex items-center justify-center gap-3 py-20 text-sm font-semibold text-slate-500"><span className="h-7 w-7 animate-spin rounded-full border-2 border-[#071a33]/15 border-t-[#b08a3c]" />Consultando bitácora global…</div> : filteredEvents.length ? <div className="divide-y divide-slate-100">
        {filteredEvents.map((event) => {
          const person = event.actor?.person;
          const actorName = person ? `${person.firstName} ${person.lastName}` : event.actor?.email ?? event.actorUserId ?? 'Sistema';
          return <details key={event.id} className="group px-5 py-5 sm:px-6">
            <summary className="grid cursor-pointer list-none gap-4 md:grid-cols-[minmax(180px,.75fr)_minmax(220px,1.2fr)_minmax(240px,1.5fr)_180px] md:items-start">
              <div><span className="inline-flex rounded-full bg-[#f0e8d8] px-2.5 py-1 text-xs font-bold text-[#76571e]">{event.community?.name ?? 'Plataforma CASA'}</span><p className="mt-2 text-[11px] font-mono text-slate-400">ID: {event.id}</p></div>
              <div><p className="text-sm font-bold text-[#071a33]">{event.action}</p><p className="mt-1 text-xs text-slate-500">{event.entityType}{event.entityId ? ` · ${event.entityId}` : ''}</p></div>
              <div><p className="text-sm font-semibold">{event.detail}</p><p className="mt-1 text-xs leading-5 text-slate-500">{event.reason ? `Motivo: ${event.reason}` : 'Sin motivo adicional'}</p></div>
              <div className="text-xs text-slate-500 md:text-right"><p className="font-semibold text-[#071a33]">{actorName}</p><p className="mt-1 break-all font-mono text-[10px]">Usuario: {event.actorUserId ?? event.actor?.id ?? '—'}</p><time className="mt-1 block">{dateTime.format(new Date(event.createdAt))}</time></div>
            </summary>
            <div className="mt-4 grid gap-3 border-t border-slate-100 pt-4 text-xs md:grid-cols-3">
              <div><p className="font-bold uppercase tracking-wider text-slate-400">Identidad</p><p className="mt-2 font-mono text-slate-600">{person ? `${person.documentType}-${person.documentNumber}` : event.actor?.email ?? '—'}</p><p className="mt-1 break-all font-mono text-slate-400">Request: {event.requestId}</p></div>
              <div><p className="font-bold uppercase tracking-wider text-slate-400">Antes</p><pre className="mt-2 max-h-36 overflow-auto rounded-xl bg-[#fbfaf7] p-3 text-[10px] leading-4 text-slate-600">{formatPayload(event.before)}</pre></div>
              <div><p className="font-bold uppercase tracking-wider text-slate-400">Después</p><pre className="mt-2 max-h-36 overflow-auto rounded-xl bg-[#fbfaf7] p-3 text-[10px] leading-4 text-slate-600">{formatPayload(event.after)}</pre></div>
            </div>
          </details>;
        })}
      </div> : <div className="p-14 text-center text-sm font-semibold text-slate-500">No hay eventos para los filtros seleccionados.</div>}
    </section>
  </>;
}

function SettingsView() {
  return <><SectionHeader eyebrow="Gobierno técnico" title="Configuración de plataforma" copy="Controles globales que afectan seguridad, licenciamiento, notificaciones e infraestructura de CASA." /><section className="grid gap-5 lg:grid-cols-2">{[
    { icon: ShieldCheck, title: 'Seguridad y sesiones', copy: 'Políticas de acceso ROOT, MFA, caducidad de sesión y dispositivos confiables.', status: 'Revisión requerida' },
    { icon: CalendarClock, title: 'Reglas de licenciamiento', copy: 'Período de gracia, renovación por conciliación, suspensión y revocación.', status: '5 días de gracia' },
    { icon: Bell, title: 'Notificaciones de plataforma', copy: 'Alertas de vencimiento, pagos pendientes, riesgos y actividad crítica.', status: 'Canales por configurar' },
    { icon: UsersRound, title: 'Espacios de trabajo del personal', copy: 'Asignación histórica de Administración, Tesorería, Compras, Atención, Cobranza, Control Principal, Brazaletes y Junta, separada de roles y permisos.', status: 'Pendiente prioritario' },
    { icon: Database, title: 'Datos y respaldos', copy: 'Retención, exportación, respaldo cifrado y recuperación por comunidad.', status: 'Diseño pendiente de backend' },
  ].map(item => { const Icon = item.icon; return <article key={item.title} className="rounded-[1.5rem] border border-[#071a33]/8 bg-white p-6 shadow-[0_14px_40px_rgba(7,26,51,.04)]"><div className="flex items-start justify-between"><span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#f1eadb] text-[#85631f]"><Icon size={20} /></span><button className="rounded-xl border border-slate-200 p-2 text-slate-400"><Settings2 size={17} /></button></div><h3 className="mt-5 text-lg font-bold">{item.title}</h3><p className="mt-2 text-sm leading-6 text-slate-500">{item.copy}</p><p className="mt-5 text-xs font-bold text-[#9a742b]">{item.status}</p></article>; })}</section></>;
}

function ClientDrawer({ client, payments, onClose, onToggle, onRevoke, onCreateAccess, onManageAccess }: { client: PlatformClient; payments: SuperAdminState['payments']; onClose: () => void; onToggle: () => void; onRevoke: () => void; onCreateAccess: () => void; onManageAccess: () => void }) {
  return <><button className="fixed inset-0 z-[80] bg-[#071a33]/40 backdrop-blur-[2px]" onClick={onClose} aria-label="Cerrar ficha" /><aside className="fixed inset-y-0 right-0 z-[90] w-full max-w-2xl overflow-y-auto bg-[#f7f5f0] shadow-2xl"><header className="sticky top-0 z-10 flex items-center justify-between border-b border-[#071a33]/8 bg-[#f7f5f0]/95 px-5 py-4 backdrop-blur"><div><p className="text-xs font-bold uppercase tracking-[.16em] text-[#9a742b]">Ficha integral del cliente</p><p className="mt-1 font-bold">Control comercial y operativo</p></div><button onClick={onClose} className="rounded-full border border-slate-200 bg-white p-2"><X size={18} /></button></header><div className="p-5 sm:p-7"><section className="rounded-[1.5rem] bg-[#071a33] p-6 text-white"><div className="flex items-start justify-between gap-4"><div><p className="text-xs text-[#e4c26f]">{client.rif}</p><h2 className="mt-2 text-2xl font-semibold tracking-[-.03em]">{client.name}</h2><p className="mt-2 text-sm text-white/50">{client.legalName}</p></div><StatusBadge type={client.standing} /></div><div className="mt-7 grid grid-cols-2 gap-3"><div className="rounded-xl bg-white/[.06] p-3"><p className="text-xs text-white/40">Inmuebles</p><p className="mt-1 text-xl font-semibold">{client.propertyCount}</p></div><div className="rounded-xl bg-white/[.06] p-3"><p className="text-xs text-white/40">Mensualidad</p><p className="mt-1 text-xl font-semibold text-[#e4c26f]">{money.format(client.license.monthlyFee)}</p></div></div></section>
      <section className="mt-5 rounded-[1.5rem] border border-[#071a33]/8 bg-white p-5"><div className="flex items-center justify-between"><div><p className="text-xs font-bold uppercase tracking-[.14em] text-slate-400">Licencia integral</p><div className="mt-2"><StatusBadge type={client.license.status} license /></div></div><KeyRound className="text-[#9a742b]" size={22} /></div><dl className="mt-5 grid grid-cols-2 gap-4 text-sm"><div><dt className="text-xs text-slate-400">Período actual</dt><dd className="mt-1 font-semibold">{date.format(new Date(`${client.license.periodStart}T12:00:00`))} — {date.format(new Date(`${client.license.periodEnd}T12:00:00`))}</dd></div><div><dt className="text-xs text-slate-400">Período de gracia</dt><dd className="mt-1 font-semibold">Hasta {date.format(new Date(`${client.license.graceUntil}T12:00:00`))}</dd></div><div><dt className="text-xs text-slate-400">Última conciliación</dt><dd className="mt-1 font-semibold">{client.license.lastReconciledAt ? dateTime.format(new Date(client.license.lastReconciledAt)) : 'Sin conciliaciones'}</dd></div><div><dt className="text-xs text-slate-400">Renovación</dt><dd className="mt-1 font-semibold">{client.license.autoRenewOnReconciliation ? 'Automática al conciliar' : 'Control manual'}</dd></div></dl><button onClick={onToggle} disabled={client.license.status === 'revoked'} className="mt-5 flex w-full items-center justify-between rounded-xl bg-[#f8f6f1] px-4 py-3 text-sm font-bold disabled:opacity-40"><span>Renovar licencia al conciliar pago</span><span className={`relative h-6 w-11 rounded-full ${client.license.autoRenewOnReconciliation ? 'bg-emerald-600' : 'bg-slate-200'}`}><span className={`absolute top-1 h-4 w-4 rounded-full bg-white transition ${client.license.autoRenewOnReconciliation ? 'left-6' : 'left-1'}`} /></span></button></section>
      <section className="mt-5 rounded-[1.5rem] border border-[#071a33]/8 bg-white p-5"><p className="text-xs font-bold uppercase tracking-[.14em] text-slate-400">Datos del cliente</p><dl className="mt-4 space-y-4 text-sm"><div><dt className="text-xs text-slate-400">Composición</dt><dd className="mt-1 font-semibold">{client.composition}</dd></div><div><dt className="text-xs text-slate-400">Ubicación</dt><dd className="mt-1 font-semibold">{client.location}</dd></div><div><dt className="text-xs text-slate-400">Contacto principal</dt><dd className="mt-1 font-semibold">{client.contactName}</dd><dd className="mt-1 text-slate-500">{client.contactEmail} · {client.contactPhone}</dd></div></dl></section>
      <section className="mt-5 rounded-[1.5rem] border border-[#071a33]/8 bg-white p-5"><div className="flex items-center justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-[.14em] text-slate-400">Inmuebles de la comunidad</p><p className="mt-1 text-sm text-slate-500">Inventario leído directamente desde el Núcleo CASA.</p></div><span className="rounded-full bg-[#f1eadb] px-3 py-1 text-xs font-bold text-[#85631f]">{client.properties.length}</span></div><div className="mt-4 max-h-72 space-y-2 overflow-y-auto pr-1">{client.properties.map(property => <article key={property.id} className="grid grid-cols-[1fr_auto] gap-3 rounded-xl border border-slate-100 p-3"><div><p className="text-sm font-bold">{property.code}</p><p className="mt-1 text-xs text-slate-400">{property.location || 'Directamente en el condominio'} · {property.kind === 'apartment' ? 'Apartamento' : property.kind === 'townhouse' ? 'Townhouse' : 'Local comercial'}</p></div><div className="text-right text-xs"><p className="font-semibold">Cap. {property.maximumOccupancy ?? '—'}</p><p className="mt-1 text-slate-400">{property.braceletQuota} brazaletes</p></div></article>)}{!client.properties.length && <p className="rounded-xl border border-dashed border-slate-200 p-5 text-center text-sm text-slate-400">La comunidad aún no tiene inmuebles registrados.</p>}</div></section>
      <section className="mt-5 rounded-[1.5rem] border border-[#071a33]/8 bg-white p-5"><div className="flex items-start gap-3"><span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#f1eadb] text-[#85631f]"><UsersRound size={20} /></span><div><p className="font-bold">Acceso del personal</p><p className="mt-1 text-sm leading-6 text-slate-500">Crea identidades y administra por separado sus espacios de trabajo, rol y permisos.</p></div></div><div className="mt-4 grid grid-cols-2 gap-2"><button onClick={onManageAccess} className="rounded-xl border border-slate-200 py-3 text-sm font-bold text-[#071a33]">Administrar</button><button onClick={onCreateAccess} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#071a33] py-3 text-sm font-bold text-white"><Plus size={16} />Crear acceso</button></div></section>
      <section className="mt-5 rounded-[1.5rem] border border-[#071a33]/8 bg-white p-5"><p className="text-xs font-bold uppercase tracking-[.14em] text-slate-400">Historial financiero</p><div className="mt-3 divide-y divide-slate-100">{payments.map(payment => <div key={payment.id} className="flex items-center justify-between py-3"><div><p className="text-sm font-bold">{payment.reference}</p><p className="mt-1 text-xs text-slate-400">{payment.bank} · {dateTime.format(new Date(payment.reportedAt))}</p></div><div className="text-right"><p className="text-sm font-bold">{money.format(payment.amount)}</p><p className={`mt-1 text-xs font-semibold ${payment.status === 'reconciled' ? 'text-emerald-700' : 'text-amber-700'}`}>{payment.status === 'reconciled' ? 'Conciliado' : 'Pendiente'}</p></div></div>)}</div></section>
      <section className="mt-5 rounded-[1.5rem] border border-rose-200 bg-rose-50/60 p-5"><div className="flex gap-3"><AlertTriangle className="shrink-0 text-rose-700" size={20} /><div><p className="font-bold text-rose-900">Control crítico de licencia</p><p className="mt-1 text-sm leading-6 text-rose-800/70">Revocar bloquea el acceso contractual. Requiere una justificación y queda registrado en auditoría.</p></div></div><button onClick={onRevoke} disabled={client.license.status === 'revoked'} className="mt-4 w-full rounded-xl border border-rose-300 bg-white py-3 text-sm font-bold text-rose-700 disabled:opacity-40">{client.license.status === 'revoked' ? 'Licencia revocada' : 'Revocar licencia'}</button></section>
    </div></aside></>;
}

function ManageCommunityAccessModal({
  client,
  initialAccessId,
  onClose,
  onSaved,
}: {
  client: PlatformClient;
  initialAccessId?: string;
  onClose: () => void;
  onSaved: (message: string) => void;
}) {
  const [records, setRecords] = useState<CommunityAccessRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState('');
  const [selectedScopes, setSelectedScopes] = useState<string[]>([]);
  const [selectedCodes, setSelectedCodes] = useState<string[]>([]);
  const [reason, setReason] = useState('');
  const [reasonError, setReasonError] = useState('');
  const [openedInitialAccess, setOpenedInitialAccess] = useState(false);
  const [saving, setSaving] = useState(false);
  const [revokingId, setRevokingId] = useState<string | null>(null);
  const [revokeReason, setRevokeReason] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      setRecords(await CasaPlatformService.listCommunityAccess(client.id));
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : 'No fue posible consultar los accesos.',
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    CasaPlatformService.listCommunityAccess(client.id)
      .then((data) => {
        if (active) setRecords(data);
      })
      .catch((loadError: unknown) => {
        if (!active) return;
        setError(
          loadError instanceof Error
            ? loadError.message
            : 'No fue posible consultar los accesos.',
        );
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [client.id]);

  const beginEditing = (record: CommunityAccessRecord) => {
    if (
      !record.employmentActive ||
      !['ACTIVE', 'BLOCKED'].includes(record.status)
    ) {
      setError(
        'Este acceso es histórico y no puede modificarse porque la persona no tiene una relación laboral vigente.',
      );
      return;
    }
    setEditingId(record.id);
    setSelectedRole(record.roleCode);
    setSelectedScopes(normalizeWorkspaceScopes(Array.isArray(record.scopes) ? record.scopes : [], record.workspaces.filter((workspace) => workspace.status === 'ACTIVE').map((workspace) => workspace.workspaceCode)));
    setSelectedCodes(
      record.roleCode === 'ADMINISTRADOR_INTEGRAL'
        ? workspaceCatalog.map((workspace) => workspace.code)
        : record.workspaces
            .filter((workspace) => workspace.status === 'ACTIVE')
            .map((workspace) => workspace.workspaceCode),
    );
    setReason('');
    setReasonError('');
    setError('');
  };

  useEffect(() => {
    if (!initialAccessId || openedInitialAccess || !records.length) return;
    const requestedAccess = records.find((record) => record.id === initialAccessId);
    const timer = window.setTimeout(() => {
      if (requestedAccess) beginEditing(requestedAccess);
      setOpenedInitialAccess(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [initialAccessId, openedInitialAccess, records]);

  const toggleScope = (code: string) => {
    setSelectedScopes((current) =>
      current.includes(code)
        ? current.filter((item) => item !== code)
        : [...current, code],
    );
  };

  const toggleWorkspace = (code: string) => {
    setSelectedCodes((current) =>
      current.includes(code)
        ? current.filter((item) => item !== code)
        : [...current, code],
    );
  };

  const save = async () => {
    if (!editingId) return;
    setReasonError('');
    const effectiveWorkspaces = selectedCodes;
    const effectiveScopes = selectedScopes;
    if (!effectiveWorkspaces.length) {
      setError('El personal debe conservar al menos un espacio de trabajo.');
      return;
    }
    if (reason.trim().length < 8) {
      setReasonError('Explica brevemente el motivo del cambio (mínimo 8 caracteres).');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await CasaPlatformService.updateCommunityAccess(
        client.id,
        editingId,
        {
          roleCode: selectedRole,
          scopes: effectiveScopes,
          workspaceCodes: effectiveWorkspaces,
          reason: reason.trim(),
        },
      );
      await load();
      setEditingId(null);
      setReason('');
      onSaved('Rol, permisos y espacios actualizados y auditados.');
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : 'No fue posible actualizar los espacios.',
      );
    } finally {
      setSaving(false);
    }
  };

  const revoke = async (record: CommunityAccessRecord) => {
    if (revokeReason.trim().length < 8) {
      setError('Explica brevemente el motivo de la revocación.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await CasaPlatformService.revokeCommunityAccess(
        client.id,
        record.id,
        revokeReason.trim(),
      );
      await load();
      setRevokingId(null);
      setRevokeReason('');
      onSaved('Acceso revocado y sesiones cerradas.');
    } catch (revokeError) {
      setError(
        revokeError instanceof Error
          ? revokeError.message
          : 'No fue posible revocar el acceso.',
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      title="Accesos del personal"
      copy={`Edita el rol, los permisos y los espacios operativos de ${client.name}. Cada cambio queda auditado.`}
      onClose={onClose}
      width="max-w-4xl"
    >
      {error && (
        <div
          role="alert"
          className="mb-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700"
        >
          {error}
        </div>
      )}
      {loading ? (
        <div className="flex items-center justify-center gap-3 py-14 text-sm font-semibold text-slate-500">
          <span className="h-6 w-6 animate-spin rounded-full border-2 border-[#071a33]/15 border-t-[#b08a3c]" />
          Consultando accesos…
        </div>
      ) : records.length ? (
        <div className="space-y-4">
          {(initialAccessId
            ? records.filter((record) => record.id === initialAccessId)
            : records
          ).map((record) => {
            const activeCodes = record.workspaces
              .filter((workspace) => workspace.status === 'ACTIVE')
              .map((workspace) => workspace.workspaceCode);
            const isEditing = editingId === record.id;
            const canEdit =
              record.employmentActive &&
              ['ACTIVE', 'BLOCKED'].includes(record.status);
            const isReactivation = record.status === 'BLOCKED';
            const personName = record.user.person
              ? `${record.user.person.firstName} ${record.user.person.lastName}`
              : record.user.email;
            return (
              <article
                key={record.id}
                className="rounded-2xl border border-slate-200 bg-[#fbfaf7] p-5"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="font-bold text-[#071a33]">{personName}</p>
                    <p className="mt-1 text-xs text-slate-400">
                      {record.user.email} · {roleLabel(record.roleCode)}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {!record.employmentActive && (
                        <span className="rounded-full bg-rose-50 px-2.5 py-1 text-xs font-bold text-rose-700">
                          Relación laboral finalizada
                        </span>
                      )}
                      {record.status !== 'ACTIVE' && (
                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600">
                          Acceso {record.status.toLowerCase()}
                        </span>
                      )}
                      {activeCodes.map((code) => (
                        <span
                          key={code}
                          className="rounded-full bg-[#f0e8d8] px-2.5 py-1 text-xs font-bold text-[#76571e]"
                        >
                          {workspaceLabel(code)}
                        </span>
                      ))}
                    </div>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {(Array.isArray(record.scopes) ? record.scopes : []).map(
                        (scope) => (
                          <span
                            key={scope}
                            className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-500"
                          >
                            {scopeLabel(scope)}
                          </span>
                        ),
                      )}
                    </div>
                    {record.status === 'ACTIVE' && (
                      <div className="mt-4">
                        {revokingId === record.id ? (
                          <div className="rounded-xl border border-rose-200 bg-rose-50 p-3">
                            <label className="block text-xs font-bold text-rose-800">Motivo obligatorio de la revocación<textarea value={revokeReason} onChange={(event) => setRevokeReason(event.target.value)} rows={2} maxLength={500} className="mt-2 w-full rounded-lg border border-rose-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-rose-400" placeholder="Ej.: Terminación de funciones." /></label>
                            <div className="mt-2 flex justify-end gap-2"><button type="button" onClick={() => { setRevokingId(null); setRevokeReason(''); }} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold">Cancelar</button><button type="button" onClick={() => revoke(record)} disabled={saving} className="rounded-lg bg-rose-700 px-3 py-2 text-xs font-bold text-white disabled:opacity-50">{saving ? 'Revocando…' : 'Confirmar revocación'}</button></div>
                          </div>
                        ) : (
                          <button type="button" onClick={() => { setRevokingId(record.id); setRevokeReason(''); setError(''); }} className="rounded-xl border border-rose-200 px-4 py-2.5 text-xs font-bold text-rose-700 hover:bg-rose-50">Revocar acceso</button>
                        )}
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      isEditing ? setEditingId(null) : beginEditing(record)
                    }
                    disabled={!isEditing && !canEdit}
                    title={
                      canEdit
                        ? isReactivation
                          ? 'Reactivar con un nuevo rol, permisos y espacios de trabajo'
                          : 'Modificar rol, permisos y espacios de trabajo'
                        : 'Solo se puede editar personal con relación laboral vigente y acceso activo'
                    }
                    className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
                  >
                    {isEditing
                      ? 'Cancelar'
                      : canEdit
                        ? isReactivation
                          ? 'Reactivar acceso'
                          : 'Editar acceso'
                        : 'Acceso histórico'}
                  </button>
                </div>

                {isEditing && (
                  <div className="mt-5 border-t border-slate-200 pt-5">
                    <p className="text-xs font-bold uppercase tracking-[.14em] text-slate-400">
                      Rol operativo
                    </p>
                    <div className="mt-3 grid gap-2 sm:grid-cols-2">
                      {roleCatalog.map((role) => (
                        <label
                          key={role.code}
                          className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 text-sm ${
                            selectedRole === role.code
                              ? 'border-[#b08a3c] bg-[#f6f0e4]'
                              : 'border-slate-200 bg-white'
                          }`}
                        >
                          <input
                            type="radio"
                            checked={selectedRole === role.code}
                            onChange={() => {
                              const nextWorkspaces = workspaceDefaultsForRole(role.code);
                              setSelectedRole(role.code);
                              setSelectedCodes(nextWorkspaces);
                              setSelectedScopes(
                                scopesDefaultsForRole(role.code, nextWorkspaces),
                              );
                            }}
                            className="mt-0.5 h-4 w-4 accent-[#071a33]"
                          />
                          <span>
                            <span className="font-semibold">{role.label}</span>
                            <span className="mt-1 block text-xs leading-5 text-slate-400">
                              {role.description}
                            </span>
                          </span>
                        </label>
                      ))}
                    </div>

                    <div className="mt-5">
                      <WorkspacePermissionsTree
                        accessMode="CUSTOM"
                        selectedWorkspaces={selectedCodes}
                        selectedScopes={selectedScopes}
                        onToggleWorkspace={toggleWorkspace}
                        onToggleScope={toggleScope}
                        onSelectAllInWorkspace={(_wsCode, scopeCodes) => {
                          setSelectedCodes(current => Array.from(new Set([...current, _wsCode])));
                          setSelectedScopes(current => Array.from(new Set([...current, ...scopeCodes])));
                        }}
                        onDeselectAllInWorkspace={(wsCode, scopeCodes) => {
                          setSelectedCodes(current => current.filter(code => code !== wsCode));
                          setSelectedScopes(current => current.filter(code => !scopeCodes.includes(code)));
                        }}
                      />
                    </div>
                    <label className="mt-4 block text-sm font-semibold text-slate-700">
                      Motivo obligatorio
                      <textarea
                        value={reason}
                        onChange={(event) => {
                          setReason(event.target.value);
                          if (reasonError) setReasonError('');
                        }}
                        aria-invalid={Boolean(reasonError)}
                        aria-describedby={reasonError ? 'access-change-reason-error' : undefined}
                        className={`${inputClass} min-h-20 resize-y ${reasonError ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/10' : ''}`}
                        placeholder="Ej.: Cambio de responsabilidades aprobado por la junta."
                      />
                      {reasonError && <span id="access-change-reason-error" role="alert" className="mt-2 block text-xs font-semibold text-rose-700">{reasonError}</span>}
                    </label>
                    <button
                      type="button"
                      onClick={save}
                      disabled={saving}
                      className="mt-4 w-full rounded-full bg-[#071a33] px-5 py-3 text-sm font-bold text-white disabled:opacity-60"
                    >
                      {saving
                        ? 'Guardando cambio…'
                        : 'Guardar acceso y registrar auditoría'}
                    </button>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-slate-300 p-10 text-center text-sm text-slate-500">
          Este cliente todavía no tiene personal con acceso.
        </div>
      )}
    </Modal>
  );
}

function CommunityAccessModal({ client, error, onClose, onSubmit }: { client: PlatformClient; error: string; onClose: () => void; onSubmit: (event: FormEvent<HTMLFormElement>) => void }) {
  const [selectedRole, setSelectedRole] = useState('ADMINISTRACION');
  const [selectedWorkspaces, setSelectedWorkspaces] = useState<string[]>(
    workspaceDefaultsForRole('ADMINISTRACION'),
  );
  const [selectedScopes, setSelectedScopes] = useState<string[]>(
    scopesDefaultsForRole('ADMINISTRACION', workspaceDefaultsForRole('ADMINISTRACION')),
  );
  const [passwordLength, setPasswordLength] = useState(0);
  const [personnel, setPersonnel] = useState<AccessPersonnelRecord[]>([]);
  const [selectedPersonId, setSelectedPersonId] = useState('');
  const [loadingPersonnel, setLoadingPersonnel] = useState(true);
  const [personnelError, setPersonnelError] = useState('');
  const roleOptions = roleCatalog.map((role) => ({
    value: role.code,
    label: role.label,
    description: role.description,
  }));
  const effectiveWorkspaceCodes = selectedWorkspaces;
  const effectiveScopes = selectedScopes;
  const selectedPerson = personnel.find(
    (record) => record.personId === selectedPersonId,
  );

  useEffect(() => {
    let active = true;
    CasaPlatformService.listAccessPersonnel(client.id)
      .then((records) => {
        if (!active) return;
        setPersonnel(records);
        const firstEligible = records.find((record) => record.canCreateAccess);
        setSelectedPersonId(firstEligible?.personId ?? '');
      })
      .catch((loadError: unknown) => {
        if (!active) return;
        setPersonnelError(
          loadError instanceof Error
            ? loadError.message
            : 'No fue posible consultar el personal de la comunidad.',
        );
      })
      .finally(() => {
        if (active) setLoadingPersonnel(false);
      });
    return () => {
      active = false;
    };
  }, [client.id]);
  return (
    <Modal
      title="Crear acceso de personal"
      copy={`El acceso quedará limitado exclusivamente a ${client.name}.`}
      onClose={onClose}
    >
      <form onSubmit={onSubmit}>
        {error && (
          <div
            role="alert"
            className="mb-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700"
          >
            {error}
          </div>
        )}
        {personnelError && (
          <div className="mb-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
            {personnelError}
          </div>
        )}
        {loadingPersonnel ? (
          <div className="flex items-center justify-center gap-3 rounded-2xl border border-slate-200 py-10 text-sm font-semibold text-slate-500">
            <span className="h-5 w-5 animate-spin rounded-full border-2 border-[#071a33]/15 border-t-[#b08a3c]" />
            Leyendo personal vigente del Núcleo CASA…
          </div>
        ) : (
          <Field
            label="Trabajador"
            span
            hint="La identidad y los datos laborales se leen del registro de Personal. No se crea una persona duplicada."
          >
            <select
              name="personId"
              value={selectedPersonId}
              onChange={(event) => {
                setSelectedPersonId(event.target.value);
                setPasswordLength(0);
              }}
              className={inputClass}
              required
            >
              <option value="">Selecciona un trabajador vigente</option>
              {personnel.map((record) => (
                <option
                  key={record.personId}
                  value={record.personId}
                  disabled={!record.canCreateAccess}
                >
                  {record.firstName} {record.lastName} · {record.position}
                  {!record.canCreateAccess ? ' · Acceso no disponible' : ''}
                </option>
              ))}
            </select>
          </Field>
        )}

        {selectedPerson && (
          <section className="mt-5 rounded-2xl border border-[#d6af57]/25 bg-[#f8f3e7] p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-bold text-[#071a33]">
                  {selectedPerson.firstName} {selectedPerson.lastName}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  {selectedPerson.documentType}-{selectedPerson.documentNumber}
                  {' · '}
                  {selectedPerson.position}
                </p>
              </div>
              <span className="rounded-full bg-white px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#85631f]">
                {selectedPerson.department}
              </span>
            </div>
            <dl className="mt-4 grid gap-3 text-xs sm:grid-cols-2">
              <div>
                <dt className="text-slate-400">Correo de acceso</dt>
                <dd className="mt-1 font-semibold">
                  {selectedPerson.loginEmail ?? 'Sin correo registrado'}
                </dd>
              </div>
              <div>
                <dt className="text-slate-400">Vinculación</dt>
                <dd className="mt-1 font-semibold">
                  {selectedPerson.engagementType} · desde{' '}
                  {date.format(new Date(selectedPerson.startsOn))}
                </dd>
              </div>
            </dl>
          </section>
        )}

        {selectedPerson && !selectedPerson.hasCasaUser && (
          <Field label="Contraseña temporal" span>
            <input
              name="temporaryPassword"
              type="password"
              minLength={8}
              onChange={(event) => setPasswordLength(event.target.value.length)}
              className={`${inputClass} ${
                passwordLength >= 8
                  ? 'border-emerald-400 focus:border-emerald-500 focus:ring-emerald-500/10'
                  : ''
              }`}
              required
            />
            <span
              className={`mt-2 flex items-center gap-2 text-xs font-semibold ${
                passwordLength >= 8 ? 'text-emerald-600' : 'text-slate-400'
              }`}
            >
              <span
                className={`flex h-4 w-4 items-center justify-center rounded-full border ${
                  passwordLength >= 8
                    ? 'border-emerald-500 bg-emerald-500 text-white'
                    : 'border-slate-300'
                }`}
              >
                {passwordLength >= 8 && <Check size={11} strokeWidth={3} />}
              </span>
              Mínimo 8 caracteres
            </span>
          </Field>
        )}
        {selectedPerson?.hasCasaUser && (
          <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            Esta persona ya posee una identidad CASA. Conservará su correo y
            contraseña actuales; aquí solo se habilita su acceso a esta comunidad.
          </div>
        )}

        {effectiveWorkspaceCodes.map((workspaceCode) => (
          <input
            key={`effective-workspace-${workspaceCode}`}
            type="hidden"
            name="workspaceCodes"
            value={workspaceCode}
          />
        ))}
        {effectiveScopes.map((scope) => (
          <input
            key={`effective-scope-${scope}`}
            type="hidden"
            name="scopes"
            value={scope}
          />
        ))}

        <fieldset className="mt-7">
          <legend className="text-sm font-bold text-[#071a33]">
            Rol operativo
          </legend>
          <p className="mt-1 text-xs leading-5 text-slate-500">
            El rol identifica su función. Los permisos y espacios de trabajo se
            controlan de manera independiente.
          </p>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {roleOptions.map((role) => (
              <label
                key={role.value}
                className={`relative flex cursor-pointer items-center gap-3 rounded-xl border px-3.5 py-3 text-sm font-semibold transition ${
                  selectedRole === role.value
                    ? 'border-[#b08a3c] bg-[#f6f0e4] text-[#071a33] ring-2 ring-[#b08a3c]/10'
                    : 'border-slate-200 bg-[#fbfaf7] text-slate-600'
                }`}
              >
                <input
                  type="radio"
                  name="roleCode"
                  value={role.value}
                  checked={selectedRole === role.value}
                  onChange={() => {
                    setSelectedRole(role.value);
                    const nextWorkspaces = workspaceDefaultsForRole(role.value);
                    setSelectedWorkspaces(nextWorkspaces);
                    setSelectedScopes(
                      scopesDefaultsForRole(role.value, nextWorkspaces),
                    );
                  }}
                  className="h-4 w-4 accent-[#071a33]"
                  required
                />
                <span className="flex-1">{role.label}</span>
                <span className="group relative">
                  <CircleHelp
                    size={16}
                    tabIndex={0}
                    aria-label={`Descripción de ${role.label}`}
                    className="text-[#9a742b] outline-none"
                  />
                  <span
                    role="tooltip"
                    className="pointer-events-none absolute bottom-full right-0 z-20 mb-2 hidden w-64 rounded-xl bg-[#071a33] p-3 text-xs font-medium leading-5 text-white shadow-xl group-hover:block group-focus-within:block"
                  >
                    {role.description}
                  </span>
                </span>
              </label>
            ))}
          </div>
          <p className="mt-3 rounded-xl bg-[#f5f1e8] px-4 py-3 text-xs leading-5 text-[#725421]">
            {
              roleOptions.find((role) => role.value === selectedRole)
                ?.description
            }
          </p>
        </fieldset>

        <div className="mt-7">
          <WorkspacePermissionsTree
            accessMode="CUSTOM"
            selectedWorkspaces={selectedWorkspaces}
            selectedScopes={selectedScopes}
            onToggleWorkspace={(wsCode) =>
              setSelectedWorkspaces((current) =>
                current.includes(wsCode)
                  ? current.filter((code) => code !== wsCode)
                  : [...current, wsCode],
              )
            }
            onToggleScope={(scopeCode) =>
              setSelectedScopes((current) =>
                current.includes(scopeCode)
                  ? current.filter((scope) => scope !== scopeCode)
                  : [...current, scopeCode],
              )
            }
            onSelectAllInWorkspace={(wsCode, scopeCodes) => {
              setSelectedWorkspaces((current) => Array.from(new Set([...current, wsCode])));
              setSelectedScopes((current) => Array.from(new Set([...current, ...scopeCodes])));
            }}
            onDeselectAllInWorkspace={(wsCode, scopeCodes) => {
              setSelectedWorkspaces((current) =>
                current.filter((code) => code !== wsCode),
              );
              setSelectedScopes((current) => current.filter((code) => !scopeCodes.includes(code)));
            }}
          />
        </div>
        <label className="mt-5 flex items-start gap-3 text-sm leading-6 text-slate-600">
          <input
            type="checkbox"
            required
            className="mt-1 h-4 w-4 accent-[#071a33]"
          />
          <span>
            Confirmo que revisé la identidad, el rol y cada permiso antes de
            crear el acceso.
          </span>
        </label>
        <button
          type="submit"
          disabled={!selectedPerson?.canCreateAccess || loadingPersonnel}
          className="mt-6 w-full rounded-full bg-[#071a33] px-6 py-3.5 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-45"
        >
          Crear acceso verificado
        </button>
        {!loadingPersonnel && !personnel.some((record) => record.canCreateAccess) && (
          <p className="mt-3 text-center text-xs leading-5 text-slate-500">
            No hay trabajadores elegibles. Registra personal vigente con correo
            en el Núcleo CASA, o edita los accesos ya existentes desde Administrar.
          </p>
        )}
      </form>
    </Modal>
  );
}

function NewClientModal({ error, onClose, onSubmit }: { error: string; onClose: () => void; onSubmit: (event: FormEvent<HTMLFormElement>) => void }) {
  return <Modal title="Registrar cliente" copy="Crea la relación comercial, la comunidad y el primer período de licencia integral CASA." onClose={onClose}><form onSubmit={onSubmit}>{error && <div role="alert" className="mb-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">{error}</div>}<div className="grid gap-5 sm:grid-cols-2"><Field label="Nombre comercial" span><input name="name" className={inputClass} required placeholder="Ej.: Residencias Costa Azul" /></Field><Field label="Razón social"><input name="legalName" className={inputClass} required /></Field><Field label="RIF"><input name="rif" className={inputClass} required placeholder="J-12345678-9" pattern="[JjGgVvEePp]-?[0-9]{8}-?[0-9]" /></Field><Field label="Dirección" span><textarea name="address" className={`${inputClass} min-h-24 resize-y`} required placeholder="Avenida, urbanización, sector y referencia" /></Field><Field label="Estado"><input name="state" className={inputClass} required placeholder="Anzoátegui" /></Field><Field label="Ciudad"><input name="city" className={inputClass} required placeholder="Lechería" /></Field><Field label="Código postal"><input name="postalCode" className={inputClass} maxLength={20} /></Field><Field label="Mensualidad (USD)"><input name="monthlyFee" type="number" min="0" step="0.01" className={inputClass} required /></Field><Field label="Contacto principal"><input name="contactName" className={inputClass} required /></Field><Field label="Teléfono" hint="Usa formato internacional, por ejemplo +584141234567."><input name="contactPhone" type="tel" className={inputClass} required placeholder="+584141234567" /></Field><Field label="Correo" span><input name="contactEmail" type="email" className={inputClass} required /></Field></div><button type="submit" className="mt-7 w-full rounded-full bg-[#071a33] px-6 py-3.5 text-sm font-bold text-white">Registrar e iniciar incorporación</button></form></Modal>;
}

function RevokeModal({ client, error, onClose, onSubmit }: { client: PlatformClient; error: string; onClose: () => void; onSubmit: (event: FormEvent<HTMLFormElement>) => void }) {
  return <Modal title="Revocar licencia" copy={`Esta acción bloqueará el acceso contractual de ${client.name}.`} onClose={onClose} width="max-w-lg"><form onSubmit={onSubmit}>{error && <div role="alert" className="mb-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">{error}</div>}<div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm leading-6 text-rose-800"><p className="font-bold">Acción crítica y auditable</p><p className="mt-1">La renovación automática será desactivada. La información del cliente no será eliminada.</p></div><Field label="Motivo obligatorio" span hint="Describe la autorización o condición contractual que fundamenta la revocación."><textarea name="reason" className={`${inputClass} min-h-28 resize-y`} required minLength={12} /></Field><label className="mt-4 flex items-start gap-3 text-sm text-slate-600"><input type="checkbox" required className="mt-1 h-4 w-4 accent-[#071a33]" /><span>Confirmo que revisé el estado financiero y tengo autorización para revocar esta licencia.</span></label><div className="mt-6 grid grid-cols-2 gap-3"><button type="button" onClick={onClose} className="rounded-full border border-slate-200 py-3 text-sm font-bold">Cancelar</button><button type="submit" className="rounded-full bg-rose-700 py-3 text-sm font-bold text-white">Revocar licencia</button></div></form></Modal>;
}

function ReconcileModal({ payment, client, onClose, onConfirm }: { payment: SuperAdminState['payments'][number]; client: PlatformClient; onClose: () => void; onConfirm: () => void }) {
  return <Modal title="Confirmar conciliación" copy="Esta operación afecta la solvencia y puede extender inmediatamente la licencia del cliente." onClose={onClose} width="max-w-lg"><form onSubmit={event => { event.preventDefault(); onConfirm(); }}><div className="rounded-2xl bg-[#071a33] p-5 text-white"><p className="text-xs font-bold uppercase tracking-[.14em] text-[#e4c26f]">{client.name}</p><div className="mt-4 flex items-end justify-between gap-4"><div><p className="text-xs text-white/45">Referencia</p><p className="mt-1 font-mono text-sm">{payment.reference}</p></div><p className="text-2xl font-semibold text-[#e4c26f]">{money.format(payment.amount)}</p></div><p className="mt-4 text-xs text-white/45">{payment.bank} · reportado {dateTime.format(new Date(payment.reportedAt))}</p></div><div className="mt-4 rounded-2xl border border-[#d6af57]/25 bg-[#f8f3e7] p-4"><div className="flex gap-3"><RefreshCw className="mt-0.5 shrink-0 text-[#9a742b]" size={18} /><div><p className="text-sm font-bold">{client.license.autoRenewOnReconciliation ? 'La licencia será renovada automáticamente' : 'La licencia no se renovará automáticamente'}</p><p className="mt-1 text-sm leading-6 text-slate-600">{client.license.autoRenewOnReconciliation ? 'CASA abrirá el siguiente período mensual al confirmar la conciliación.' : 'El pago quedará conciliado, pero la vigencia continuará bajo control manual.'}</p></div></div></div><label className="mt-5 flex items-start gap-3 text-sm text-slate-600"><input type="checkbox" required className="mt-1 h-4 w-4 accent-[#071a33]" /><span>Verifiqué el monto, la referencia y la cuenta receptora contra el movimiento bancario.</span></label><div className="mt-6 grid grid-cols-2 gap-3"><button type="button" onClick={onClose} className="rounded-full border border-slate-200 py-3 text-sm font-bold">Cancelar</button><button type="submit" className="rounded-full bg-[#071a33] py-3 text-sm font-bold text-white">Conciliar pago</button></div></form></Modal>;
}
