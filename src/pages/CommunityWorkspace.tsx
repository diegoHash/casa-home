import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Building2,
  ChevronRight,
  CreditCard,
  DoorOpen,
  Home,
  Landmark,
  LayoutDashboard,
  LogOut,
  Menu,
  Network,
  Plus,
  RefreshCw,
  ShieldCheck,
  Store,
  ShoppingCart,
  Headphones,
  HandCoins,
  ScanLine,
  Watch,
  ReceiptText,
  BookOpenCheck,
  CalendarDays,
  ScrollText,
  Users,
  UserCheck,
  X,
} from 'lucide-react';
import { CasaAuthService, type CommunityContext } from '../services/CasaAuthService';
import {
  CommunityWorkspaceService,
  type CoreSnapshot,
  type TreasurySnapshot,
  type AccountingSnapshot,
} from '../services/CommunityWorkspaceService';
import { StaffSession } from '../services/StaffSession';
import { CommunityPersonnelPanel } from '../components/community/CommunityPersonnelPanel';
import { BillingWorkspacePanel } from '../components/community/BillingWorkspacePanel';
import { AccountingWorkspacePanel } from '../components/community/AccountingWorkspacePanel';
import { OwnerServicePanel } from '../components/community/OwnerServicePanel';
import { RegistrationRequestsWorkspacePanel } from '../components/community/RegistrationRequestsWorkspacePanel';
import { PeopleDirectoryTable } from '../components/community/PeopleDirectoryTable';
import { PayablesWorkspacePanel } from '../components/community/PayablesWorkspacePanel';
import { NotificationsBell } from '../components/community/NotificationsBell';
import { ControlPrincipalPanel } from '../components/community/ControlPrincipalPanel';
import {
  AdministrationCoreDialog,
  type AdministrationDialogMode,
} from '../components/community/AdministrationCoreDialog';
import { workspaceLabel } from '../config/workspaceCatalog';
import PropertyEditPage from './PropertyEditPage';

type Section =
  | 'resumen'
  | 'inmuebles'
  | 'directorio'
  | 'solicitudes-registro'
  | 'estructura'
  | 'tesoreria'
  | 'facturacion'
  | 'contabilidad'
  | 'asientos-contables'
  | 'cuentas-por-cobrar'
  | 'libro-diario'
  | 'cuentas-por-pagar'
  | 'centros-de-costos'
  | 'reportes-contables'
  | 'auditoria-contable'
  | 'compras'
  | 'atencion'
  | 'cobranza'
  | 'control'
  | 'brazaletes';

const navigation: Array<{
  id: Section;
  label: string;
  icon: typeof Home;
  scope?: string;
  workspaces: string[];
}> = [
  { id: 'resumen', label: 'Resumen', icon: LayoutDashboard, workspaces: ['*'] },
  { id: 'inmuebles', label: 'Inmuebles', icon: Building2, scope: 'core.read', workspaces: ['ADMINISTRATION', 'BOARD'] },
  { id: 'directorio', label: 'Personas', icon: Users, scope: 'core.read', workspaces: ['ADMINISTRATION', 'OWNER_SERVICE'] },
  { id: 'solicitudes-registro', label: 'Solicitudes de registro', icon: UserCheck, scope: 'core.read', workspaces: ['ADMINISTRATION'] },
  { id: 'estructura', label: 'Junta directiva y equipos', icon: Network, scope: 'core.read', workspaces: ['ADMINISTRATION', 'BOARD'] },
  { id: 'tesoreria', label: 'Tesorería', icon: Landmark, scope: 'treasury.read', workspaces: ['ADMINISTRATION', 'ACCOUNTING'] },
  { id: 'facturacion', label: 'Operación financiera', icon: ReceiptText, scope: 'billing.read', workspaces: ['ADMINISTRATION'] },
  { id: 'contabilidad', label: 'Cuentas contables', icon: BookOpenCheck, scope: 'accounting.read', workspaces: ['ACCOUNTING'] },
  { id: 'asientos-contables', label: 'Asientos contables', icon: CalendarDays, scope: 'accounting.read', workspaces: ['ACCOUNTING'] },
  { id: 'cuentas-por-cobrar', label: 'Cuentas por cobrar', icon: HandCoins, scope: 'accounting.read', workspaces: ['ACCOUNTING'] },
  { id: 'libro-diario', label: 'Libro diario', icon: ScrollText, scope: 'accounting.read', workspaces: ['ACCOUNTING'] },
  { id: 'cuentas-por-pagar', label: 'Cuentas por pagar', icon: CreditCard, scope: 'accounting.read', workspaces: ['ACCOUNTING'] },
  { id: 'centros-de-costos', label: 'Centros de costos', icon: Network, scope: 'accounting.read', workspaces: ['ACCOUNTING'] },
  { id: 'reportes-contables', label: 'Reportes', icon: ReceiptText, scope: 'accounting.read', workspaces: ['ACCOUNTING'] },
  { id: 'auditoria-contable', label: 'Auditoría', icon: ShieldCheck, scope: 'accounting.read', workspaces: ['ACCOUNTING'] },
  { id: 'compras', label: 'Compras', icon: ShoppingCart, workspaces: ['PURCHASES'] },
  { id: 'atencion', label: 'Atención al propietario', icon: Headphones, workspaces: ['OWNER_SERVICE'] },
  { id: 'cobranza', label: 'Gestión de cobranza', icon: HandCoins, workspaces: ['COLLECTIONS'] },
  { id: 'control', label: 'Control principal', icon: ScanLine, workspaces: ['CONTROL_PRINCIPAL'] },
  { id: 'brazaletes', label: 'Brazaletes', icon: Watch, workspaces: ['WRISTBANDS'] },
];

function hasScope(scopes: string[], required: string) {
  return scopes.some(
    (scope) =>
      scope === '*' ||
      scope === 'community.full_access' ||
      scope === required ||
      scope === `${StaffSession.workspace()}:${required}` ||
      (scope.endsWith('.*') && required.startsWith(scope.slice(0, -1))),
  );
}

function hasWorkspace(granted: string[], required: string[]) {
  return (
    required.includes('*') ||
    granted.includes('*') ||
    required.some((workspace) => granted.includes(workspace))
  );
}

function statusLabel(value: string) {
  const labels: Record<string, string> = {
    ACTIVE: 'Activo',
    INACTIVE: 'Inactivo',
    ENDED: 'Finalizado',
    DRAFT: 'En configuración',
    SOLVENT: 'Solvente',
    APARTMENT: 'Apartamento',
    TOWNHOUSE: 'Townhouse',
    COMMERCIAL: 'Local comercial',
    BANK_TRANSFER: 'Transferencia',
    MOBILE_PAYMENT: 'Pago móvil',
    CASH: 'Efectivo',
    EMPLOYEE: 'Relación laboral',
    CONTRACTOR: 'Contratista',
  };
  return labels[value] || value;
}

function shortDate(value: string) {
  return new Intl.DateTimeFormat('es-VE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone: 'America/Caracas',
  })
    .format(new Date(value))
    .replace(/\//g, '-');
}

function formatCommunityLocation(address?: string, city?: string, state?: string) {
  return [address, city, state].map((value) => value?.trim()).filter(Boolean).join(', ') || undefined;
}

async function synchronizeCommunityContext(
  current: NonNullable<ReturnType<typeof StaffSession.context>>,
) {
  const identity = await CasaAuthService.me(StaffSession.token());
  const selected = identity.success ? identity.data.selectedContext : null;
  if (!selected || selected.communityId !== current.communityId) return current;
  const unchanged =
    selected.roleCode === current.roleCode &&
    selected.scopes.length === current.scopes.length &&
    selected.scopes.every((scope) => current.scopes.includes(scope)) &&
    selected.workspaces.length === current.workspaces.length &&
    selected.workspaces.every((workspace) =>
      current.workspaces.includes(workspace),
    );
  if (unchanged) return current;
  const synchronized = {
    ...current,
    roleCode: selected.roleCode,
    scopes: selected.scopes,
    workspaces: selected.workspaces,
  };
  StaffSession.updateContext(synchronized);
  return synchronized;
}

export default function CommunityWorkspace() {
  const navigate = useNavigate();
  const { propertyId } = useParams<{ propertyId?: string }>();
  const [context, setContext] = useState(() => StaffSession.context());
  const [activeWorkspace, setActiveWorkspace] = useState(() => StaffSession.workspace());
  const [user] = useState(() => StaffSession.user());
  const [section, setSection] = useState<Section>(() => {
    const requested = new URLSearchParams(window.location.search).get('section') as Section | null;
    if (propertyId) return 'inmuebles';
    return requested && navigation.some((item) => item.id === requested)
      ? requested
      : activeWorkspace === 'OWNER_SERVICE' ? 'atencion' : 'resumen';
  });
  const [menuOpen, setMenuOpen] = useState(false);
  const [core, setCore] = useState<CoreSnapshot | null>(null);
  const [treasury, setTreasury] = useState<TreasurySnapshot | null>(null);
  const [accounting, setAccounting] = useState<AccountingSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [administrationDialog, setAdministrationDialog] =
    useState<AdministrationDialogMode | null>(null);
  const [editingPerson, setEditingPerson] =
    useState<CoreSnapshot['people'][number]['person'] | null>(null);
  const [editingBankAccount, setEditingBankAccount] =
    useState<TreasurySnapshot['bankAccounts'][number] | null>(null);
  const [editingPaymentMethod, setEditingPaymentMethod] =
    useState<TreasurySnapshot['paymentMethods'][number] | null>(null);

  const allowedNavigation = useMemo(
    () =>
      navigation.filter(
        (item) =>
          !(activeWorkspace === 'OWNER_SERVICE' && item.id === 'resumen') &&
          hasWorkspace([activeWorkspace], item.workspaces) &&
          (!item.scope || hasScope(context?.scopes ?? [], item.scope)),
      ),
    [activeWorkspace, context?.scopes],
  );

  const load = async (initial = false) => {
    if (!context) return;
    if (!initial) {
      setLoading(true);
      setError('');
    }
    try {
      const synchronized = await synchronizeCommunityContext(context);
      setContext(synchronized);
      const canReadCore = hasScope(synchronized.scopes, 'core.read');
      const canReadTreasury = hasScope(synchronized.scopes, 'treasury.read');
      const canReadAccounting = hasScope(synchronized.scopes, 'accounting.read');
      const [coreData, treasuryData, accountingData] = await Promise.all([
        canReadCore ? CommunityWorkspaceService.coreSnapshot() : Promise.resolve(null),
        canReadTreasury ? CommunityWorkspaceService.treasurySnapshot() : Promise.resolve(null),
        canReadAccounting ? CommunityWorkspaceService.accountingSnapshot() : Promise.resolve(null),
      ]);
      setCore(coreData);
      setTreasury(treasuryData);
      setAccounting(accountingData);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'No fue posible abrir el espacio de trabajo.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handleWorkspaceChange = () => {
      const nextWorkspace = StaffSession.workspace();
      setActiveWorkspace(nextWorkspace);
      setSection(nextWorkspace === 'OWNER_SERVICE' ? 'atencion' : 'resumen');
    };
    window.addEventListener('casa:workspace-changed', handleWorkspaceChange);
    return () => window.removeEventListener('casa:workspace-changed', handleWorkspaceChange);
  }, []);

  useEffect(() => {
    let active = true;
    if (!context) return;
    synchronizeCommunityContext(context)
      .then((synchronized) => {
        if (active) setContext(synchronized);
        const canReadCore = hasScope(synchronized.scopes, 'core.read');
        const canReadTreasury = hasScope(synchronized.scopes, 'treasury.read');
        const canReadAccounting = hasScope(synchronized.scopes, 'accounting.read');
        return Promise.all([
          canReadCore
            ? CommunityWorkspaceService.coreSnapshot()
            : Promise.resolve(null),
          canReadTreasury
            ? CommunityWorkspaceService.treasurySnapshot()
            : Promise.resolve(null),
          canReadAccounting
            ? CommunityWorkspaceService.accountingSnapshot()
            : Promise.resolve(null),
        ]);
      })
      .then((res) => {
        if (active) {
          setCore(res[0]);
          setTreasury(res[1]);
          setAccounting(res[2]);
        }
      })
      .catch((loadError: unknown) => {
        if (!active) return;
        setError(
          loadError instanceof Error
            ? loadError.message
            : 'No fue posible abrir el espacio de trabajo.',
        );
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [context]);

  const logout = async () => {
    await CasaAuthService.logout(StaffSession.refreshToken());
    StaffSession.clear();
    navigate('/staff-login', { replace: true });
  };

  const switchWorkspace = () => {
    StaffSession.clearWorkspace();
    navigate('/seleccionar-espacio');
  };

  const chooseSection = (id: Section) => {
    setSection(id);
    setMenuOpen(false);
  };

  const administrationSaved = async (message: string) => {
    setAdministrationDialog(null);
    setNotice(message);
    await load();
  };

  if (!context) return null;

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#f4f1e9] text-[#071a33]">
      <aside className={`${menuOpen ? 'translate-x-0' : '-translate-x-full'} fixed inset-y-0 left-0 z-40 flex h-full w-[288px] flex-shrink-0 flex-col bg-[#071a33] text-white transition-transform lg:static lg:inset-auto lg:z-auto lg:translate-x-0`}>
        <div className="flex flex-shrink-0 items-center justify-between border-b border-white/10 px-6 py-6">
          <img src="/casa-wordmark-dark.png" alt="CASA" className="w-36" />
          <button onClick={() => setMenuOpen(false)} className="lg:hidden">
            <X size={22} />
          </button>
        </div>
        <div className="flex-shrink-0 border-b border-white/10 px-5 py-5">
          <p className="text-[10px] font-bold uppercase tracking-[0.23em] text-[#d9b76d]">
            Comunidad activa
          </p>
          <p className="mt-2 truncate text-sm font-semibold">{context.name}</p>
          <p className="mt-1 text-xs text-white/45">{context.rif}</p>
          <div className="mt-4 rounded-xl bg-white/[0.06] px-3 py-2.5">
            <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-white/40">
              Espacio activo
            </p>
            <p className="mt-1 text-xs font-semibold text-white">
              {workspaceLabel(activeWorkspace)}
            </p>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
            <button onClick={switchWorkspace} className="text-xs font-bold text-[#d9b76d] hover:text-white">
              Cambiar espacio
            </button>
            <span className="text-[10px] text-white/40">
              <kbd className="rounded border border-white/15 px-1.5 py-0.5 text-white/65">Shift + E</kbd>
            </span>
          </div>
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto px-4 py-5">
          {allowedNavigation.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => chooseSection(item.id)}
                className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-semibold transition ${
                  section === item.id
                    ? 'bg-white text-[#071a33]'
                    : 'text-white/65 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Icon size={18} /> {item.label}
              </button>
            );
          })}
        </nav>
        <div className="flex-shrink-0 border-t border-white/10 p-4 bg-[#071a33]">
          <div className="mb-3 px-3">
            <p className="truncate text-sm font-semibold">
              {user?.person ? `${user.person.firstName} ${user.person.lastName}` : user?.email}
            </p>
            <p className="mt-1 text-xs text-white/45">{context.roleCode}</p>
          </div>
          <button onClick={logout} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-white/60 hover:bg-white/10 hover:text-white">
            <LogOut size={17} /> Cerrar sesión
          </button>
        </div>
      </aside>

      {menuOpen && <button aria-label="Cerrar menú" className="fixed inset-0 z-30 bg-[#071a33]/50 lg:hidden" onClick={() => setMenuOpen(false)} />}

      <div className="flex flex-1 flex-col h-full min-w-0 overflow-y-auto">
        <header className="sticky top-0 z-20 flex flex-shrink-0 items-center justify-between border-b border-[#071a33]/8 bg-[#f4f1e9]/90 px-5 py-4 backdrop-blur-xl sm:px-8">
          <div className="flex items-center gap-3">
            <button onClick={() => setMenuOpen(true)} className="rounded-xl border border-[#071a33]/10 bg-white p-2.5 lg:hidden">
              <Menu size={20} />
            </button>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#9c7532]">Espacio de trabajo</p>
              <h1 className="mt-1 text-lg font-semibold">
                {workspaceLabel(activeWorkspace)}
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <NotificationsBell enabled={hasScope(context.scopes, 'billing.read')} onOpenPayables={() => chooseSection('cuentas-por-pagar')} />
            {section === 'contabilidad' && hasScope(context.scopes, 'accounting.write') && (
              <div className="hidden items-center gap-2 md:flex">
                <button onClick={() => window.dispatchEvent(new Event('accounting:create-account'))} className="rounded-full bg-[#071a33] px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-[#14365d]">Crear cuenta</button>
              </div>
            )}
            <button onClick={() => window.location.reload()} className="inline-flex items-center gap-2 rounded-full border border-[#071a33]/10 bg-white px-4 py-2.5 text-sm font-bold shadow-sm cursor-pointer hover:bg-slate-50 transition">
              <RefreshCw size={15} />
              <span className="hidden sm:inline">Actualizar</span>
            </button>
          </div>
        </header>

        <div className="p-5 sm:p-8 lg:p-10">
          {error && (
            <div role="alert" className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
              {error}
            </div>
          )}
          {notice && (
            <div
              role="status"
              className="mb-6 flex items-center justify-between gap-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-800"
            >
              <span>{notice}</span>
              <button
                type="button"
                onClick={() => setNotice('')}
                className="rounded-full p-1 hover:bg-emerald-100"
                aria-label="Cerrar aviso"
              >
                <X size={16} />
              </button>
            </div>
          )}
          {propertyId ? (
            <PropertyEditPage embedded />
          ) : loading && !core && !treasury ? (
            <div className="flex min-h-[55vh] items-center justify-center">
              <div className="text-center">
                <div className="mx-auto h-11 w-11 animate-spin rounded-full border-2 border-[#071a33]/15 border-t-[#b08a3c]" />
                <p className="mt-4 text-sm font-semibold text-slate-500">Preparando tu espacio de trabajo…</p>
              </div>
            </div>
          ) : (
            <WorkspaceContent
              section={section}
              context={context}
              core={core}
              treasury={treasury}
              accounting={accounting}
              availableSections={allowedNavigation.map((item) => item.id)}
              currentUserId={user?.id ?? ''}
              grantedScopes={context.scopes}
              grantedWorkspaces={context.workspaces}
              onNavigate={chooseSection}
              onOpenAdministration={(mode) => {
                setEditingPerson(null);
                setEditingBankAccount(null);
                setEditingPaymentMethod(null);
                setAdministrationDialog(mode);
              }}
              onEditBankAccount={(account) => {
                setEditingBankAccount(account);
                setEditingPaymentMethod(null);
                setAdministrationDialog('edit-bank');
              }}
              onEditPaymentMethod={(method) => {
                setEditingPaymentMethod(method);
                setEditingBankAccount(null);
                setAdministrationDialog('edit-payment-method');
              }}
              onEditPerson={(person) => {
                setEditingPerson(person);
                setAdministrationDialog('edit-person');
              }}
              onEditProperty={(property) => navigate(`/workspace/inmuebles/${property.id}/editar`)}
              onImportProperties={() => navigate('/workspace/inmuebles/importar')}
              onDeactivateProperty={async (property) => {
                if (!window.confirm(`¿Desactivar el inmueble ${property.code}? Se conservará su historial.`)) return;
                try {
                  await CommunityWorkspaceService.deactivateProperty(property.id);
                  setNotice('Inmueble desactivado. Su historial se conserva en CASA.');
                  await load();
                } catch (cause) {
                  setError(cause instanceof Error ? cause.message : 'No fue posible desactivar el inmueble.');
                }
              }}
              onDeactivatePerson={async (person) => {
                if (!window.confirm(`¿Retirar a ${person.firstName} ${person.lastName} del directorio de esta comunidad?`)) return;
                try {
                  await CommunityWorkspaceService.deactivatePerson(person.id);
                  setNotice('Persona retirada del directorio de esta comunidad.');
                  await load();
                } catch (cause) {
                  setError(cause instanceof Error ? cause.message : 'No fue posible retirar la persona.');
                }
              }}
            />
          )}
        </div>
      </div>
      {administrationDialog && (
        <AdministrationCoreDialog
          mode={administrationDialog}
          core={core}
          treasury={treasury}
          person={editingPerson}
          bankAccount={editingBankAccount}
          paymentMethod={editingPaymentMethod}
          onClose={() => setAdministrationDialog(null)}
          onSaved={administrationSaved}
        />
      )}
    </div>
  );
}

function WorkspaceContent({
  section,
  context,
  core,
  treasury,
  accounting,
  availableSections,
  currentUserId,
  grantedScopes,
  grantedWorkspaces,
  onNavigate,
  onOpenAdministration,
  onEditBankAccount,
  onEditPaymentMethod,
  onEditPerson,
  onDeactivatePerson,
  onEditProperty,
  onImportProperties,
  onDeactivateProperty,
}: {
  section: Section;
  context: CommunityContext;
  core: CoreSnapshot | null;
  treasury: TreasurySnapshot | null;
  accounting: AccountingSnapshot | null;
  availableSections: Section[];
  currentUserId: string;
  grantedScopes: string[];
  grantedWorkspaces: string[];
  onNavigate: (section: Section) => void;
  onOpenAdministration: (mode: AdministrationDialogMode) => void;
  onEditBankAccount: (account: TreasurySnapshot['bankAccounts'][number]) => void;
  onEditPaymentMethod: (method: TreasurySnapshot['paymentMethods'][number]) => void;
  onEditPerson: (person: CoreSnapshot['people'][number]['person']) => void;
  onDeactivatePerson: (person: CoreSnapshot['people'][number]['person']) => Promise<void> | void;
  onEditProperty: (property: CoreSnapshot['properties'][number]) => void;
  onImportProperties: () => void;
  onDeactivateProperty: (property: CoreSnapshot['properties'][number]) => Promise<void> | void;
}) {
  const [selectedMethodInfo, setSelectedMethodInfo] = useState<
    TreasurySnapshot['paymentMethods'][number] | null
  >(null);
  const canCreateTreasury = hasScope(grantedScopes, 'treasury.write');
  const canEditBanks = hasScope(grantedScopes, 'treasury.banks.write');
  const canEditMethods = hasScope(grantedScopes, 'treasury.methods.write');

  if (section === 'resumen') {
    if (availableSections.includes('contabilidad')) {
      const currentPeriod = accounting?.accountingPeriods.find((period) => period.status === 'OPEN');
      const pendingEntries = accounting?.journalEntries.filter((entry) => entry.status === 'DRAFT').length ?? 0;
      const cards = [
        { label: 'Período actual', value: currentPeriod?.label ?? 'Sin período abierto', detail: currentPeriod ? 'Mes habilitado para registrar movimientos.' : 'Abre un período para comenzar a registrar.', target: 'asientos-contables' as Section },
        { label: 'Asientos pendientes', value: String(pendingEntries), detail: 'Borradores que aún no se han contabilizado.', target: 'asientos-contables' as Section },
        { label: 'Pagos por conciliar', value: '—', detail: 'Pagos recibidos por comparar con el banco.', target: 'tesoreria-contable' as Section },
        { label: 'Cuentas por cobrar', value: '—', detail: 'Monto pendiente de los propietarios.', target: 'cuentas-por-cobrar' as Section },
        { label: 'Cuentas por pagar', value: '—', detail: 'Obligaciones pendientes con proveedores.', target: 'cuentas-por-pagar' as Section },
      ];
      return (
        <>
          <div className="max-w-3xl">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#9c7532]">Resumen contable</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.035em] sm:text-4xl">La situación financiera de la comunidad, de un vistazo.</h2>
            <p className="mt-4 text-base leading-7 text-slate-500">Vista inicial del módulo contable. Los importes de cartera, pagos y obligaciones se conectarán cuando estén listos sus módulos de origen.</p>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {cards.map((card) => <button key={card.label} onClick={() => onNavigate(card.target)} className="rounded-[1.5rem] border border-[#071a33]/8 bg-white p-5 text-left shadow-[0_14px_45px_rgba(7,26,51,.05)] transition hover:-translate-y-0.5"><p className="text-sm font-bold text-slate-600">{card.label}</p><p className={`mt-4 text-2xl font-semibold ${card.value === '—' ? 'text-slate-400' : 'text-[#071a33]'}`}>{card.value}</p><p className="mt-2 text-xs leading-5 text-slate-500">{card.detail}</p></button>)}
          </div>
        </>
      );
    }
    const cards = [
      { label: 'Inmuebles', value: core?.properties.length ?? '—', icon: Building2, target: 'inmuebles' as Section },
      { label: 'Personas', value: core?.people.length ?? '—', icon: Users, target: 'directorio' as Section },
      { label: 'Equipo activo', value: core?.employments.filter((item) => item.status === 'ACTIVE').length ?? '—', icon: ShieldCheck, target: 'estructura' as Section },
      { label: 'Métodos de pago', value: treasury?.paymentMethods.length ?? '—', icon: CreditCard, target: 'tesoreria' as Section },
    ].filter((card) => availableSections.includes(card.target));
    return (
      <>
        <div className="max-w-3xl">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#9c7532]">Núcleo operativo</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-[-0.035em] sm:text-4xl">
            Todo lo esencial, visible desde un solo lugar.
          </h2>
          <p className="mt-4 text-base leading-7 text-slate-500">
            Este tablero usa la información real registrada para la comunidad. No presenta cifras financieras simuladas.
          </p>
        </div>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {cards.map((card) => {
            const Icon = card.icon;
            return (
              <button key={card.label} onClick={() => onNavigate(card.target)} className="rounded-[1.5rem] border border-[#071a33]/8 bg-white p-5 text-left shadow-[0_14px_45px_rgba(7,26,51,.05)] transition hover:-translate-y-0.5">
                <div className="flex items-center justify-between">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#f2ecdf] text-[#8d672a]"><Icon size={20} /></div>
                  <ChevronRight size={17} className="text-slate-300" />
                </div>
                <p className="mt-5 text-3xl font-semibold">{card.value}</p>
                <p className="mt-1 text-sm font-medium text-slate-500">{card.label}</p>
              </button>
            );
          })}
        </div>
        <div className="mt-6">
          <Panel title="Identidad de la comunidad">
            <dl className="grid gap-4 text-sm sm:grid-cols-2">
              <Info label="Razón social" value={core?.legalName ?? context?.legalName} />
              <Info label="RIF" value={core?.rif ?? context?.rif} />
              <Info label="Ubicación" value={formatCommunityLocation(core?.address ?? context?.address, core?.city, core?.state)} />
            </dl>
          </Panel>
        </div>
      </>
    );
  }

  if (section === 'inmuebles') {
    const canWriteProperties = hasScope(grantedScopes, 'core.properties.write');
    const canImportProperties = ['core.properties.write', 'core.people.write', 'core.ownerships.write']
      .every((scope) => hasScope(grantedScopes, scope));
    return (
      <SectionLayout eyebrow="Inventario" title="Inmuebles de la comunidad" description="Apartamentos, townhouses y locales comerciales registrados en el núcleo.">
        {hasScope(grantedScopes, 'core.properties.write') && (
          <ActionBar
            actions={[
              {
                label: 'Nueva ubicación',
                onClick: () => onOpenAdministration('location'),
                secondary: true,
              },
              {
                label: 'Nuevo inmueble',
                onClick: () => onOpenAdministration('property'),
              },
              ...(canImportProperties
                ? [{ label: 'Importar', onClick: onImportProperties, secondary: true }]
                : []),
            ]}
          />
        )}
        <Table
           headers={['Código', 'Ubicación', 'Categoría', 'Propietario(s)', 'Alícuota', 'Capacidad', 'Estacionamiento', 'Estado', ...(canWriteProperties ? ['Acciones'] : [])]}
          rows={(core?.properties ?? []).map((property) => [
            property.code,
            property.location?.name ?? 'Directo en la comunidad',
            statusLabel(property.kind),
            (core?.ownerships ?? [])
              .filter((ownership) => ownership.propertyId === property.id && ownership.status === 'ACTIVE')
              .map((ownership) => `${ownership.person.firstName} ${ownership.person.lastName}`)
              .join(', ') || 'Sin propietario vinculado',
            property.currentAliquot ? `${property.currentAliquot}%` : 'No aplica',
             property.maximumOccupancy ? `${property.maximumOccupancy} personas` : 'Sin definir',
             property.parkingSpace ? (
               <div className="min-w-[140px]">
                 <span className="inline-flex rounded-lg bg-[#f1eadb] px-2.5 py-1 text-xs font-bold text-[#805d20]">{property.parkingSpace}</span>
                 {property.parkingCapacity ? <span className="mt-1 block text-xs text-slate-500">{property.parkingCapacity} vehículo(s)</span> : <span className="mt-1 block text-xs text-slate-400">Capacidad no definida</span>}
               </div>
             ) : <span className="text-slate-400">No asignado</span>,
             statusLabel(property.status),
             ...(canWriteProperties ? [
               <div className="flex justify-end gap-2 whitespace-nowrap">
                 <button type="button" onClick={() => onEditProperty(property)} className="rounded-lg border border-[#071a33]/15 bg-white px-3 py-1.5 text-xs font-bold text-[#071a33] transition hover:border-[#b08a3c] hover:bg-[#fbfaf7]">Editar</button>
                 {property.status === 'ACTIVE' && <button type="button" onClick={() => void onDeactivateProperty(property)} className="rounded-lg border border-rose-200 px-3 py-1.5 text-xs font-bold text-rose-600 transition hover:bg-rose-50">Desactivar</button>}
               </div>,
             ] : []),
           ])}
           empty="Aún no hay inmuebles registrados."
           wide
         />
      </SectionLayout>
    );
  }

  if (section === 'directorio') {
    return (
      <SectionLayout eyebrow="Directorio único" title="Personas vinculadas" description="Una identidad puede asumir distintas relaciones sin duplicarse dentro del sistema.">
        {(hasScope(grantedScopes, 'core.people.write') ||
          hasScope(grantedScopes, 'core.ownerships.write')) && (
          <ActionBar
            actions={[
              ...(hasScope(grantedScopes, 'core.people.write')
                ? [
                    {
                      label: 'Nueva persona',
                      onClick: () => onOpenAdministration('person'),
                    },
                  ]
                : []),
              ...(hasScope(grantedScopes, 'core.ownerships.write')
                ? [
                    {
                      label: 'Vincular a inmueble',
                      onClick: () => onOpenAdministration('ownership'),
                      secondary: true,
                    },
                  ]
                : []),
            ]}
          />
        )}
        <PeopleDirectoryTable
          core={core}
          canWrite={hasScope(grantedScopes, 'core.people.write')}
          onEdit={onEditPerson}
          onDeactivate={onDeactivatePerson}
        />
      </SectionLayout>
    );
  }

  if (section === 'estructura') {
    return (
      <SectionLayout eyebrow="Estructura organizativa" title="Junta directiva y equipos de trabajo" description="Integrantes de junta y personal vinculados a esta comunidad, con cargo, inmueble y vigencia real.">
        {(hasScope(grantedScopes, 'core.board.write') ||
          hasScope(grantedScopes, 'core.staff.write')) && (
          <ActionBar
            actions={[
              ...(hasScope(grantedScopes, 'core.board.write')
                ? [
                    {
                      label: 'Designar integrante de junta',
                      onClick: () => onOpenAdministration('board'),
                    },
                  ]
                : []),
              ...(hasScope(grantedScopes, 'core.staff.write')
                ? [
                    {
                      label: 'Incorporar al equipo',
                      onClick: () => onOpenAdministration('employment'),
                      secondary: true,
                    },
                  ]
                : []),
            ]}
          />
        )}
        <div className="grid gap-3 sm:grid-cols-3">
          <MetricPanel icon={ShieldCheck} label="Junta vigente" value={core?.boardAppointments.filter((item) => item.status === 'ACTIVE').length ?? 0} />
          <MetricPanel icon={Users} label="Equipo activo" value={core?.employments.filter((item) => item.status === 'ACTIVE').length ?? 0} />
          <MetricPanel icon={Store} label="Concesiones" value={core?.concessions.filter((item) => item.status === 'ACTIVE').length ?? 0} />
        </div>
        <div className="mt-6 grid gap-6 2xl:grid-cols-2">
          <Panel title="Junta directiva">
            <div className="max-h-72 overflow-y-auto pr-1">
              <Table
                headers={['Integrante', 'Cargo', 'Inmueble', 'Desde', 'Estado']}
                rows={(core?.boardAppointments ?? []).map((appointment) => [
                  `${appointment.person.firstName} ${appointment.person.lastName}`,
                  appointment.position,
                  appointment.property?.code ?? 'No vinculado',
                  shortDate(appointment.startsOn),
                  statusLabel(appointment.status),
                ])}
                empty="No hay integrantes de junta registrados."
              />
            </div>
          </Panel>
          <Panel title="Equipos de trabajo">
            <div className="max-h-72 overflow-y-auto pr-1">
              <Table
                headers={['Persona', 'Cargo', 'Área', 'Vinculación', 'Desde', 'Estado']}
                rows={(core?.employments ?? []).map((employment) => [
                  `${employment.person.firstName} ${employment.person.lastName}`,
                  employment.position,
                  employment.department,
                  employment.engagementType === 'PROFESSIONAL_FEE' ? 'Honorarios profesionales' : statusLabel(employment.engagementType),
                  shortDate(employment.startsOn),
                  statusLabel(employment.status),
                ])}
                empty="No hay integrantes de equipos de trabajo registrados."
              />
            </div>
          </Panel>
        </div>
        {hasScope(grantedScopes, 'core.staff.write') && (
          <CommunityPersonnelPanel
            currentUserId={currentUserId}
            grantedScopes={grantedScopes}
            grantedWorkspaces={grantedWorkspaces}
          />
        )}
      </SectionLayout>
    );
  }

  if (section === 'solicitudes-registro') {
    return (
      <SectionLayout
        eyebrow="Espacio de Administración"
        title="Solicitudes de registro de propietarios"
        description="Revisión catastral, verificación de titularidad de inmuebles y procesamiento de accesos."
      >
        <RegistrationRequestsWorkspacePanel />
      </SectionLayout>
    );
  }

  if (section === 'facturacion') {
    return (
      <BillingWorkspacePanel
        canWrite={hasScope(grantedScopes, 'billing.write')}
        canPost={hasScope(grantedScopes, 'accounting.post')}
      />
    );
  }

  if (section === 'contabilidad' || section === 'asientos-contables' || section === 'cuentas-por-cobrar' || section === 'libro-diario') {
    return (
      <AccountingWorkspacePanel
        canWrite={hasScope(grantedScopes, 'accounting.write')}
        canPost={hasScope(grantedScopes, 'accounting.post')}
        section={section === 'contabilidad' ? 'accounts' : section === 'asientos-contables' ? 'periods' : section === 'cuentas-por-cobrar' ? 'receivables' : 'journal'}
      />
    );
  }

  if (section === 'cuentas-por-pagar') {
    return <SectionLayout eyebrow="Obligaciones pendientes" title="Cuentas por pagar" description="Facturas, servicios, nómina, honorarios, reparaciones y compromisos pendientes de la comunidad."><PayablesWorkspacePanel canWrite={hasScope(grantedScopes, 'billing.write')} /></SectionLayout>;
  }

  if (section === 'centros-de-costos' || section === 'reportes-contables' || section === 'auditoria-contable') {
    const modules = {
      'cuentas-por-pagar': ['Cuentas por pagar', 'Obligaciones pendientes', 'Aquí se organizarán facturas, proveedores, vencimientos y pagos pendientes de la comunidad.'],
      'centros-de-costos': ['Centros de costos', 'Clasificación del gasto', 'Aquí se distribuirán gastos e ingresos por áreas, edificios, proyectos o servicios de la comunidad.'],
      'reportes-contables': ['Reportes', 'Información para decidir', 'Aquí estarán el balance de comprobación, estado de resultados, flujo de efectivo y reportes de cartera.'],
      'auditoria-contable': ['Auditoría', 'Trazabilidad y control', 'Aquí se revisarán cambios, responsables, soportes y movimientos que requieren seguimiento.'],
    } as const;
    const [title, eyebrow, description] = modules[section];
    return <SectionLayout eyebrow={eyebrow} title={title} description={description}><div className="rounded-[1.5rem] border border-[#d7bb7c]/35 bg-[#f8f3e7] p-7"><p className="text-sm leading-6 text-slate-600">Módulo incluido en la arquitectura contable. Su maqueta detallada se desarrollará en la siguiente fase.</p></div></SectionLayout>;
  }

  if (section === 'atencion') {
    return (
      <SectionLayout
        eyebrow="Relación con propietarios"
        title="Centro de atención"
        description="Solicitudes, autorizaciones, incidencias, contactos y comunicaciones de esta comunidad."
      >
        <OwnerServicePanel
          grantedScopes={grantedScopes}
        />
      </SectionLayout>
    );
  }

  if (section === 'control') {
    return <SectionLayout eyebrow="Control de accesos" title="Gestor de autorizaciones" description="Autorizaciones, lectura de QR, historial y registro de visitantes del complejo."><ControlPrincipalPanel /></SectionLayout>;
  }

  if (section !== 'tesoreria') {
    const pendingWorkspaces: Record<
      Exclude<Section, 'resumen' | 'inmuebles' | 'directorio' | 'solicitudes-registro' | 'estructura' | 'tesoreria' | 'facturacion' | 'contabilidad' | 'asientos-contables' | 'cuentas-por-cobrar' | 'libro-diario' | 'tesoreria-contable' | 'cuentas-por-pagar' | 'centros-de-costos' | 'reportes-contables' | 'auditoria-contable'>,
      { eyebrow: string; title: string; description: string; icon: typeof Store }
    > = {
      compras: {
        eyebrow: 'Espacio asignado',
        title: 'Compras',
        description:
          'Solicitudes, cotizaciones, órdenes y seguimiento de proveedores se integrarán aquí.',
        icon: ShoppingCart,
      },
      atencion: {
        eyebrow: 'Espacio asignado',
        title: 'Atención al propietario',
        description:
          'La gestión estructurada de solicitudes e incidencias se integrará aquí.',
        icon: Headphones,
      },
      cobranza: {
        eyebrow: 'Espacio asignado',
        title: 'Gestión de cobranza',
        description:
          'El seguimiento de cartera y compromisos de pago se integrará aquí.',
        icon: HandCoins,
      },
      control: {
        eyebrow: 'Espacio asignado',
        title: 'Control principal',
        description:
          'Autorizaciones, accesos y novedades operativas se integrarán aquí.',
        icon: ScanLine,
      },
      brazaletes: {
        eyebrow: 'Espacio asignado',
        title: 'Brazaletes',
        description:
          'El proyecto de venta y control de brazaletes se conectará a este espacio conservando la identidad CASA.',
        icon: Watch,
      },
    };
    const workspace = pendingWorkspaces[section];
    const Icon = workspace.icon;
    return (
      <SectionLayout
        eyebrow={workspace.eyebrow}
        title={workspace.title}
        description={workspace.description}
      >
        <div className="rounded-[1.5rem] border border-[#d7bb7c]/35 bg-[#f8f3e7] p-7">
          <Icon size={26} className="text-[#8d672a]" />
          <h3 className="mt-5 text-lg font-semibold">Asignación activa</h3>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            CASA ya reconoce que este espacio pertenece al usuario. Sus
            operaciones específicas se habilitarán cuando el dominio
            correspondiente esté desarrollado e integrado.
          </p>
        </div>
      </SectionLayout>
    );
  }

  return (
    <SectionLayout eyebrow="Tesorería" title="Banca y métodos de pago" description="Canales oficiales configurados para recibir pagos de la comunidad.">
      {canCreateTreasury && (
        <ActionBar
          actions={[
            {
              label: 'Agregar cuenta bancaria',
              onClick: () => onOpenAdministration('bank'),
            },
            {
              label: 'Agregar método de pago',
              onClick: () => onOpenAdministration('payment-method'),
              secondary: true,
            },
          ]}
        />
      )}
      <div className="mt-8 space-y-6">
        {(treasury?.bankAccounts ?? []).length === 0 ? (
          <div className="rounded-2xl border border-slate-200 border-dashed p-8 text-center text-slate-500">No hay cuentas bancarias configuradas.</div>
        ) : (
          (treasury?.bankAccounts ?? []).map((account) => {
            const linkedMethods = (treasury?.paymentMethods ?? []).filter(pm => pm.bankAccountId === account.id);
            return (
              <article key={account.id} className="rounded-2xl border border-[#1a365d] bg-gradient-to-br from-[#071a33] to-[#0a2540] p-3.5 text-white shadow-sm transition hover:border-[#d7bb7c]/60 sm:p-4">
                <div className="relative">
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-[10px] font-bold uppercase tracking-[.14em] text-[#d7bb7c]/80">Cuenta {statusLabel(account.accountType)}</p>
                      <div className="mt-2 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                        <p className="text-sm font-bold text-[#e5ca8f]">{account.bankName}</p>
                        <p className="font-mono text-xs font-bold tracking-[.18em] text-[#d7bb7c]">•••• {account.accountNumber.slice(-4)}</p>
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <span className="hidden rounded-md bg-green-500/10 px-2.5 py-1 text-xs font-medium text-green-400 ring-1 ring-inset ring-green-500/20 sm:inline-flex">Activa</span>
                      {canEditBanks && (
                        <button
                          type="button"
                          onClick={() => onEditBankAccount(account)}
                          className="rounded-lg border border-[#d7bb7c]/35 px-3 py-1.5 text-xs font-bold text-[#e5ca8f] transition hover:bg-white/10"
                        >
                          Editar
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                    {hasScope(grantedScopes, 'accounting.read') ? (
                      (accounting?.ledgerAccounts ?? []).some(a => a.bankAccountId === account.id) ? (
                        <div className="inline-flex items-center gap-1.5 rounded-lg border border-[#b08a3c]/30 bg-[#b08a3c]/20 px-2.5 py-1.5 text-xs font-semibold text-[#e5ca8f]">
                          <BookOpenCheck size={14} />
                          Cuenta Contable: {(accounting?.ledgerAccounts ?? []).find(a => a.bankAccountId === account.id)?.code} - {(accounting?.ledgerAccounts ?? []).find(a => a.bankAccountId === account.id)?.name}
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800/50 px-2.5 py-1.5 text-xs font-semibold text-slate-400">
                          <BookOpenCheck size={14} className="opacity-50" />
                          Sin cuenta contable vinculada
                        </div>
                      )
                    ) : (
                      <div className="inline-flex items-center gap-1.5 rounded-lg bg-slate-800/30 px-2.5 py-1.5 text-xs font-semibold text-slate-400/80 border border-slate-800">
                        <BookOpenCheck size={14} className="opacity-40" />
                        Requiere permiso de contabilidad para ver vinculación
                      </div>
                    )}
                  </div>

                  <div className="mt-3 border-t border-[#1a365d] pt-3">
                    <h4 className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.15em] text-[#849fbf]">
                      <CreditCard size={14} />
                      Métodos de pago vinculados
                    </h4>
                    {linkedMethods.length === 0 ? (
                      <p className="text-sm text-slate-500">No hay métodos de pago vinculados a esta cuenta.</p>
                    ) : (
                      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {linkedMethods.map(method => (
                          <div
                            key={method.id}
                            className="bg-[#0b1d33]/50 rounded-xl p-3.5 border border-[#1a365d] hover:border-[#d7bb7c]/50 hover:bg-[#122e50] transition group"
                          >
                            <button
                              type="button"
                              onClick={() => setSelectedMethodInfo(method)}
                              className="w-full text-left"
                            >
                            <div className="flex justify-between items-start">
                              <p className="font-semibold text-slate-200 text-sm group-hover:text-white transition">{method.label}</p>
                              <span className={`inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${method.status === 'ACTIVE' ? 'bg-green-500/20 text-green-400' : 'bg-slate-500/20 text-slate-400'}`}>
                                {method.status === 'ACTIVE' ? 'Activo' : 'Inac.'}
                              </span>
                            </div>
                            <p className="text-xs text-slate-400 mt-1.5 flex items-center justify-between">
                              <span>{statusLabel(method.type)}</span>
                              <span className="font-bold text-[#d7bb7c]">{method.currency}</span>
                            </p>
                            </button>
                            {canEditMethods && (
                              <button
                                type="button"
                                onClick={() => onEditPaymentMethod(method)}
                                className="mt-3 rounded-lg border border-[#d7bb7c]/35 px-3 py-1.5 text-xs font-bold text-[#e5ca8f] hover:bg-white/10"
                              >
                                Editar método
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </article>
            );
          })
        )}

        {/* Unlinked / Cash Methods */}
        {(treasury?.paymentMethods ?? []).filter(pm => !pm.bankAccountId).length > 0 && (
          <article className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 sm:p-7 shadow-sm">
            <h3 className="font-semibold text-lg text-[#0b1d33]">Otras modalidades de pago</h3>
            <p className="text-sm text-slate-500 mb-5">Efectivo u otras formas de pago no vinculadas a bancos</p>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {(treasury?.paymentMethods ?? []).filter(pm => !pm.bankAccountId).map(method => (
                <div
                  key={method.id}
                  className="text-left bg-slate-50 rounded-xl p-3.5 border border-slate-200 hover:border-[#b08a3c] transition cursor-pointer group"
                >
                  <button type="button" onClick={() => setSelectedMethodInfo(method)} className="w-full text-left">
                    <div className="flex justify-between items-start">
                    <p className="font-semibold text-slate-700 text-sm group-hover:text-[#0b1d33] transition">{method.label}</p>
                    <span className={`inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${method.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>
                      {method.status === 'ACTIVE' ? 'Activo' : 'Inac.'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1.5 flex items-center justify-between">
                    <span>{statusLabel(method.type)}</span>
                    <span className="font-bold text-[#b08a3c]">{method.currency}</span>
                  </p>
                  </button>
                  {canEditMethods && (
                    <button
                      type="button"
                      onClick={() => onEditPaymentMethod(method)}
                      className="mt-3 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-white"
                    >
                      Editar método
                    </button>
                  )}
                </div>
              ))}
            </div>
          </article>
        )}
      </div>

      {selectedMethodInfo && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#0b1d33]/40 backdrop-blur-sm cursor-pointer" onClick={() => setSelectedMethodInfo(null)}></div>
          <div className="relative bg-white rounded-[2rem] shadow-2xl w-full max-w-md p-7 overflow-hidden">
            <button onClick={() => setSelectedMethodInfo(null)} className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 transition cursor-pointer">
              <X size={20} />
            </button>
            <div className="flex items-center gap-3 mb-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f8f3e7] text-[#b08a3c]">
                <CreditCard size={20} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-[#0b1d33]">{selectedMethodInfo.label}</h3>
                <p className="text-sm font-medium text-slate-500">{statusLabel(selectedMethodInfo.type)} · {selectedMethodInfo.currency}</p>
              </div>
            </div>

            <div className="space-y-5 bg-slate-50 p-5 rounded-2xl border border-slate-100">
              <Info label="Estado actual" value={statusLabel(selectedMethodInfo.status)} />
              {selectedMethodInfo.instructions && (
                <Info label="Instrucciones para el propietario" value={selectedMethodInfo.instructions} />
              )}
              {selectedMethodInfo.bankAccountId && (
                <div className="mt-2 pt-5 border-t border-slate-200">
                  <Info label="Cuenta bancaria vinculada" value={`${treasury?.bankAccounts.find(b => b.id === selectedMethodInfo.bankAccountId)?.bankName} (•••• ${treasury?.bankAccounts.find(b => b.id === selectedMethodInfo.bankAccountId)?.accountNumber.slice(-4)})`} />
                </div>
              )}
            </div>

            <div className="mt-6 flex gap-3 justify-end">
              {canEditMethods && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedMethodInfo(null);
                    onEditPaymentMethod(selectedMethodInfo);
                  }}
                  className="px-5 py-2.5 rounded-full bg-[#071a33] text-white text-sm font-bold transition hover:bg-[#12335a]"
                >
                  Editar
                </button>
              )}
              <button
                onClick={() => setSelectedMethodInfo(null)}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full text-sm font-bold transition cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </SectionLayout>
  );
}

function SectionLayout({ eyebrow, title, description, children }: { eyebrow: string; title: string; description: string; children: React.ReactNode }) {
  return (
    <>
      <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#9c7532]">{eyebrow}</p>
      <h2 className="mt-3 text-3xl font-semibold tracking-[-0.035em]">{title}</h2>
      <p className="mt-3 max-w-3xl text-base leading-7 text-slate-500">{description}</p>
      <div className="mt-8">{children}</div>
    </>
  );
}

function ActionBar({
  actions,
}: {
  actions: Array<{
    label: string;
    onClick: () => void;
    secondary?: boolean;
  }>;
}) {
  return (
    <div className="mb-6 flex flex-wrap gap-3">
      {actions.map((action) => (
        <button
          key={action.label}
          type="button"
          onClick={action.onClick}
          className={`inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-bold transition hover:-translate-y-0.5 ${
            action.secondary
              ? 'border border-[#071a33]/12 bg-white text-[#071a33] shadow-sm'
              : 'bg-[#071a33] text-white shadow-[0_10px_25px_rgba(7,26,51,.16)]'
          }`}
        >
          <Plus size={17} />
          {action.label}
        </button>
      ))}
    </div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="rounded-[1.5rem] border border-[#071a33]/8 bg-white p-6 shadow-[0_14px_45px_rgba(7,26,51,.05)]"><h3 className="mb-5 text-lg font-semibold">{title}</h3>{children}</section>;
}

function Info({ label, value }: { label: string; value?: string }) {
  return <div><dt className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">{label}</dt><dd className="mt-1.5 font-semibold">{value || '—'}</dd></div>;
}

function MetricPanel({ icon: Icon, label, value }: { icon: typeof DoorOpen; label: string; value: number }) {
  return <div className="rounded-2xl border border-[#071a33]/8 bg-white px-4 py-3 shadow-[0_10px_30px_rgba(7,26,51,.04)]"><div className="flex items-center justify-between gap-3"><span className="text-xs font-bold uppercase tracking-[0.1em] text-slate-500">{label}</span><div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#f2ecdf] text-[#8d672a]"><Icon size={17} /></div></div><span className="mt-2 block text-2xl font-semibold">{value}</span></div>;
}

function Table({ headers, rows, empty, wide = false }: { headers: string[]; rows: React.ReactNode[][]; empty: string; wide?: boolean }) {
  if (!rows.length) return <div className="rounded-[1.5rem] border border-dashed border-[#071a33]/15 bg-white/50 p-10 text-center text-sm font-medium text-slate-500">{empty}</div>;
  return (
    <div className="overflow-hidden rounded-[1.5rem] border border-[#071a33]/8 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className={`w-full ${wide ? 'min-w-[980px]' : 'min-w-[680px]'} text-left text-sm`}>
          <thead className="bg-[#071a33] text-white"><tr>{headers.map((header) => <th key={header} className="px-5 py-4 text-xs uppercase tracking-[0.13em]">{header}</th>)}</tr></thead>
          <tbody>{rows.map((row, rowIndex) => <tr key={rowIndex} className="border-t border-slate-100">{row.map((cell, cellIndex) => <td key={cellIndex} className={`px-5 py-4 ${cellIndex === 0 ? 'font-semibold' : 'text-slate-500'} ${cellIndex === row.length - 1 && headers[headers.length - 1] === 'Acciones' ? 'text-right' : ''}`}>{cell}</td>)}</tr>)}</tbody>
        </table>
      </div>
    </div>
  );
}
