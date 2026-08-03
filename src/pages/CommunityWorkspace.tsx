import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Users,
  X,
} from 'lucide-react';
import { CasaAuthService } from '../services/CasaAuthService';
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
import { PeopleDirectoryTable } from '../components/community/PeopleDirectoryTable';
import {
  AdministrationCoreDialog,
  type AdministrationDialogMode,
} from '../components/community/AdministrationCoreDialog';
import { workspaceLabel } from '../config/workspaceCatalog';

type Section =
  | 'resumen'
  | 'inmuebles'
  | 'directorio'
  | 'estructura'
  | 'tesoreria'
  | 'facturacion'
  | 'contabilidad'
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
  { id: 'estructura', label: 'Junta directiva y equipos', icon: Network, scope: 'core.read', workspaces: ['ADMINISTRATION', 'BOARD'] },
  { id: 'tesoreria', label: 'Tesorería', icon: Landmark, scope: 'treasury.read', workspaces: ['ADMINISTRATION'] },
  { id: 'facturacion', label: 'Operación financiera', icon: ReceiptText, scope: 'billing.read', workspaces: ['ADMINISTRATION'] },
  { id: 'contabilidad', label: 'Contabilidad', icon: BookOpenCheck, scope: 'accounting.read', workspaces: ['TREASURY'] },
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
  const [context, setContext] = useState(() => StaffSession.context());
  const [activeWorkspace] = useState(() => StaffSession.workspace());
  const [user] = useState(() => StaffSession.user());
  const [section, setSection] = useState<Section>(() =>
    activeWorkspace === 'OWNER_SERVICE' ? 'atencion' : 'resumen',
  );
  const [menuOpen, setMenuOpen] = useState(false);
  const [core, setCore] = useState<CoreSnapshot | null>(null);
  const [treasury, setTreasury] = useState<TreasurySnapshot | null>(null);
  const [accounting, setAccounting] = useState<AccountingSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [administrationDialog, setAdministrationDialog] =
    useState<AdministrationDialogMode | null>(null);

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
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2">
            <button onClick={switchWorkspace} className="text-xs font-bold text-[#d9b76d] hover:text-white">
              Cambiar espacio
            </button>
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
          <button onClick={() => void load()} disabled={loading} className="inline-flex items-center gap-2 rounded-full border border-[#071a33]/10 bg-white px-4 py-2.5 text-sm font-bold shadow-sm disabled:opacity-50">
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
            <span className="hidden sm:inline">Actualizar</span>
          </button>
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
          {loading && !core && !treasury ? (
            <div className="flex min-h-[55vh] items-center justify-center">
              <div className="text-center">
                <div className="mx-auto h-11 w-11 animate-spin rounded-full border-2 border-[#071a33]/15 border-t-[#b08a3c]" />
                <p className="mt-4 text-sm font-semibold text-slate-500">Preparando tu espacio de trabajo…</p>
              </div>
            </div>
          ) : (
            <WorkspaceContent
              section={section}
              core={core}
              treasury={treasury}
              accounting={accounting}
              availableSections={allowedNavigation.map((item) => item.id)}
              currentUserId={user?.id ?? ''}
              grantedScopes={context.scopes}
              grantedWorkspaces={context.workspaces}
              onNavigate={chooseSection}
              onOpenAdministration={setAdministrationDialog}
            />
          )}
        </div>
      </div>
      {administrationDialog && (
        <AdministrationCoreDialog
          mode={administrationDialog}
          core={core}
          treasury={treasury}
          onClose={() => setAdministrationDialog(null)}
          onSaved={administrationSaved}
        />
      )}
    </div>
  );
}

function WorkspaceContent({
  section,
  core,
  treasury,
  accounting,
  availableSections,
  currentUserId,
  grantedScopes,
  grantedWorkspaces,
  onNavigate,
  onOpenAdministration,
}: {
  section: Section;
  core: CoreSnapshot | null;
  treasury: TreasurySnapshot | null;
  accounting: AccountingSnapshot | null;
  availableSections: Section[];
  currentUserId: string;
  grantedScopes: string[];
  grantedWorkspaces: string[];
  onNavigate: (section: Section) => void;
  onOpenAdministration: (mode: AdministrationDialogMode) => void;
}) {
  if (section === 'resumen') {
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
              <Info label="Razón social" value={core?.legalName} />
              <Info label="RIF" value={core?.rif} />
              <Info label="Ubicación" value={core ? `${core.city}, ${core.state}` : undefined} />
              <Info label="Modelo de administración" value={core ? statusLabel(core.administrationMode) : undefined} />
            </dl>
          </Panel>
        </div>
      </>
    );
  }

  if (section === 'inmuebles') {
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
            ]}
          />
        )}
        <Table
          headers={['Código', 'Ubicación', 'Categoría', 'Propietario(s)', 'Alícuota', 'Capacidad', 'Estado']}
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
            statusLabel(property.status),
          ])}
          empty="Aún no hay inmuebles registrados."
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
        <PeopleDirectoryTable core={core} />
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
        <div className="grid gap-5 xl:grid-cols-3">
          <MetricPanel icon={ShieldCheck} label="Junta directiva vigente" value={core?.boardAppointments.filter((item) => item.status === 'ACTIVE').length ?? 0} />
          <MetricPanel icon={Users} label="Equipo de trabajo activo" value={core?.employments.filter((item) => item.status === 'ACTIVE').length ?? 0} />
          <MetricPanel icon={Store} label="Concesiones activas" value={core?.concessions.filter((item) => item.status === 'ACTIVE').length ?? 0} />
        </div>
        <div className="mt-6 grid gap-6 2xl:grid-cols-2">
          <Panel title="Junta directiva">
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
          </Panel>
          <Panel title="Equipos de trabajo">
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

  if (section === 'facturacion') {
    return (
      <BillingWorkspacePanel
        canWrite={hasScope(grantedScopes, 'billing.write')}
        canPost={hasScope(grantedScopes, 'accounting.post')}
      />
    );
  }

  if (section === 'contabilidad') {
    return (
      <AccountingWorkspacePanel
        canWrite={hasScope(grantedScopes, 'accounting.write')}
        canPost={hasScope(grantedScopes, 'accounting.post')}
      />
    );
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

  if (section !== 'tesoreria') {
    const pendingWorkspaces: Record<
      Exclude<Section, 'resumen' | 'inmuebles' | 'directorio' | 'estructura' | 'tesoreria' | 'facturacion' | 'contabilidad'>,
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
      {hasScope(grantedScopes, 'treasury.write') && (
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
      <div className="mt-8 grid gap-6 xl:grid-cols-[1fr_1fr]">
        <section>
          <p className="mb-4 text-xs font-bold uppercase tracking-[.14em] text-slate-400">Cuentas receptoras</p>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
            {(treasury?.bankAccounts ?? []).length === 0 ? (
              <div className="rounded-2xl border border-slate-200 border-dashed p-8 text-center text-slate-500">No hay cuentas configuradas.</div>
            ) : (
              (treasury?.bankAccounts ?? []).map((item) => (
                <article key={item.id} className="relative overflow-hidden rounded-2xl border border-[#1a365d] bg-gradient-to-br from-[#071a33] to-[#0a2540] p-5 shadow-lg">
                  <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-[#122e50]/50 blur-xl"></div>
                  <div className="relative">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-medium text-slate-300">Cuenta {statusLabel(item.accountType)}</p>
                        <p className="mt-1 text-lg font-bold tracking-widest text-[#d7bb7c]">•••• {item.accountNumber.slice(-4)}</p>
                      </div>
                      <span className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">Activa</span>
                    </div>
                    
                    <div className="mt-6">
                      {hasScope(grantedScopes, 'accounting.read') ? (
                        (accounting?.ledgerAccounts ?? []).some(a => a.bankAccountId === item.id) ? (
                          <div className="mb-4 inline-flex items-center gap-1.5 rounded-lg bg-[#b08a3c]/20 px-2.5 py-1 text-xs font-semibold text-[#e5ca8f] border border-[#b08a3c]/30">
                            <BookOpenCheck size={13} />
                            Cuenta Contable: {(accounting?.ledgerAccounts ?? []).find(a => a.bankAccountId === item.id)?.code} - {(accounting?.ledgerAccounts ?? []).find(a => a.bankAccountId === item.id)?.name}
                          </div>
                        ) : (
                          <div className="mb-4 inline-flex items-center gap-1.5 rounded-lg bg-slate-800/50 px-2.5 py-1 text-xs font-semibold text-slate-400 border border-slate-700">
                            <BookOpenCheck size={13} className="opacity-50" />
                            Sin cuenta contable vinculada
                          </div>
                        )
                      ) : (
                        <div className="mb-4 inline-flex items-center gap-1.5 rounded-lg bg-slate-800/30 px-2.5 py-1 text-xs font-semibold text-slate-400/80 border border-slate-800">
                          <BookOpenCheck size={13} className="opacity-40" />
                          Requiere permiso de contabilidad para ver vinculación
                        </div>
                      )}
                    </div>
                    <div className="mt-4 flex items-end justify-between">
                      <div>
                        <p className="text-sm font-semibold text-white">{item.bankName}</p>
                        <p className="text-[11px] font-bold text-[#d7bb7c]/80">{item.holderRif}</p>
                      </div>
                    </div>
                  </div>
                </article>
              ))
            )}
          </div>
        </section>

        <section>
          <p className="mb-4 text-xs font-bold uppercase tracking-[.14em] text-slate-400">Métodos habilitados</p>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
            {(treasury?.paymentMethods ?? []).length === 0 ? (
              <div className="rounded-2xl border border-slate-200 border-dashed p-8 text-center text-slate-500">No hay métodos de pago configurados.</div>
            ) : (
              (treasury?.paymentMethods ?? []).map((item) => {
                const account = item.bankAccountId
                  ? treasury?.bankAccounts.find((b) => b.id === item.bankAccountId)
                  : null;
                return (
                  <article key={item.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 text-slate-400">
                            <CreditCard size={18} />
                          </div>
                          <p className="font-semibold text-slate-700">{item.label}</p>
                        </div>
                        <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${item.status === 'ACTIVE' ? 'bg-green-50 text-green-700 ring-green-600/20' : 'bg-slate-50 text-slate-600 ring-slate-500/10'}`}>
                          {item.status === 'ACTIVE' ? 'Activo' : 'Inactivo'}
                        </span>
                      </div>
                      
                      <p className="mt-4 text-xs font-bold uppercase tracking-wider text-slate-500">{item.currency}</p>
                      <p className="mt-1 text-sm font-medium text-slate-700">
                        {item.type === 'CASH'
                          ? 'Recepción de efectivo'
                          : `Transferencia · ${account?.bankName ?? 'Cuenta no disponible'}`}
                      </p>
                      <p className="mt-1 text-xs text-slate-400">Vinculado a: {account ? `${account.bankName} (•••• ${account.accountNumber.slice(-4)})` : 'Cuenta no encontrada'}</p>
                      {item.instructions && <p className="mt-2 text-xs leading-5 text-slate-400">{item.instructions}</p>}
                    </div>
                  </article>
                );
              })
            )}
          </div>
        </section>
      </div>
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
  return <Panel title={label}><div className="flex items-end justify-between"><span className="text-4xl font-semibold">{value}</span><div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f2ecdf] text-[#8d672a]"><Icon /></div></div></Panel>;
}

function Table({ headers, rows, empty }: { headers: string[]; rows: string[][]; empty: string }) {
  if (!rows.length) return <div className="rounded-[1.5rem] border border-dashed border-[#071a33]/15 bg-white/50 p-10 text-center text-sm font-medium text-slate-500">{empty}</div>;
  return (
    <div className="overflow-hidden rounded-[1.5rem] border border-[#071a33]/8 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[680px] text-left text-sm">
          <thead className="bg-[#071a33] text-white"><tr>{headers.map((header) => <th key={header} className="px-5 py-4 text-xs uppercase tracking-[0.13em]">{header}</th>)}</tr></thead>
          <tbody>{rows.map((row, rowIndex) => <tr key={rowIndex} className="border-t border-slate-100">{row.map((cell, cellIndex) => <td key={cellIndex} className={`px-5 py-4 ${cellIndex === 0 ? 'font-semibold' : 'text-slate-500'}`}>{cell}</td>)}</tr>)}</tbody>
        </table>
      </div>
    </div>
  );
}
