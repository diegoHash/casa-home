import {
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from 'react';
import {
  BadgeCheck,
  BellRing,
  CheckCheck,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  Contact,
  Eye,
  LoaderCircle,
  Megaphone,
  MessageSquareWarning,
  Search,
  Send,
  Users,
  X,
} from 'lucide-react';
import {
  CommunityWorkspaceService,
  type CommunicationDetailRecord,
  type CommunicationRecord,
  type OwnerServiceOptions,
  type PageResult,
  type ServiceAuthorizationRecord,
  type ServiceAuthorizationStatus,
  type ServiceAuthorizationType,
  type ServiceIncidentRecord,
  type ServiceIncidentStatus,
  type ServiceOwnerRecord,
} from '../../services/CommunityWorkspaceService';

type Tab = 'authorizations' | 'incidents' | 'owners' | 'communications';
type PageSize = 20 | 50 | 70 | 100;

const emptyPage = <T,>(): PageResult<T> => ({
  items: [],
  total: 0,
  page: 1,
  pageSize: 20,
  pageCount: 1,
});

const incidentStatuses: ServiceIncidentStatus[] = [
  'RECEIVED',
  'IN_REVIEW',
  'WORKER_ASSIGNED',
  'IN_EXECUTION',
  'RESOLVED',
];

const manualIncidentStatuses: ServiceIncidentStatus[] = [
  'IN_REVIEW',
  'IN_EXECUTION',
  'RESOLVED',
];

const authorizationLabels: Record<ServiceAuthorizationType, string> = {
  ACCESS: 'Autorización de ingreso',
  WORK: 'Solicitud de trabajo',
  EXIT: 'Autorización de salida',
};

const statusLabels: Record<string, string> = {
  RECEIVED: 'Recibida',
  IN_REVIEW: 'En revisión',
  WORKER_ASSIGNED: 'Trabajador asignado',
  IN_EXECUTION: 'En ejecución',
  RESOLVED: 'Resuelta',
  APPROVED: 'Aprobada',
  REJECTED: 'Rechazada',
  READ: 'Leído',
};

function statusLabel(value: string) {
  return statusLabels[value] ?? value;
}

function formatDateTime(value?: string | null) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  const parts = new Intl.DateTimeFormat('es-VE', {
    timeZone: 'America/Caracas',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(date);
  const part = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((item) => item.type === type)?.value ?? '';
  return `${part('day')}-${part('month')}-${part('year')} ${part('hour')}:${part('minute')}`;
}

function hasScope(scopes: string[], required: string) {
  return scopes.some(
    (scope) =>
      scope === '*' ||
      scope === 'community.full_access' ||
      scope === required ||
      (scope.endsWith('.*') && required.startsWith(scope.slice(0, -1))),
  );
}

export function OwnerServicePanel({
  grantedScopes,
}: {
  grantedScopes: string[];
}) {
  const [tab, setTab] = useState<Tab>('authorizations');
  const [options, setOptions] = useState<OwnerServiceOptions>({
    sectors: [],
    owners: [],
    staff: [],
  });
  const [authorizations, setAuthorizations] = useState<
    PageResult<ServiceAuthorizationRecord>
  >(emptyPage);
  const [incidents, setIncidents] =
    useState<PageResult<ServiceIncidentRecord>>(emptyPage);
  const [owners, setOwners] =
    useState<PageResult<ServiceOwnerRecord>>(emptyPage);
  const [communications, setCommunications] =
    useState<PageResult<CommunicationRecord>>(emptyPage);
  const [authorizationStatus, setAuthorizationStatus] = useState<
    'ALL' | ServiceAuthorizationStatus
  >('RECEIVED');
  const [incidentStatus, setIncidentStatus] = useState<
    'ALL' | ServiceIncidentStatus
  >('RECEIVED');
  const [query, setQuery] = useState('');
  const [page, setPage] = useState<Record<Tab, number>>({
    authorizations: 1,
    incidents: 1,
    owners: 1,
    communications: 1,
  });
  const [pageSize, setPageSize] = useState<Record<Tab, PageSize>>({
    authorizations: 20,
    incidents: 20,
    owners: 20,
    communications: 20,
  });
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [selectedAuthorization, setSelectedAuthorization] =
    useState<ServiceAuthorizationRecord | null>(null);
  const [selectedIncident, setSelectedIncident] =
    useState<ServiceIncidentRecord | null>(null);
  const [selectedCommunicationId, setSelectedCommunicationId] =
    useState<string | null>(null);

  const loadOptions = async () => {
    try {
      setOptions(await CommunityWorkspaceService.ownerServiceOptions());
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : 'No fue posible cargar las opciones de Atención.',
      );
    }
  };

  const loadCurrent = async () => {
    setRefreshing(true);
    setError('');
    try {
      if (tab === 'authorizations') {
        setAuthorizations(
          await CommunityWorkspaceService.ownerServiceAuthorizations({
            page: page.authorizations,
            pageSize: pageSize.authorizations,
            search: query || undefined,
            status:
              authorizationStatus === 'ALL'
                ? undefined
                : authorizationStatus,
          }),
        );
      } else if (tab === 'incidents') {
        setIncidents(
          await CommunityWorkspaceService.ownerServiceIncidents({
            page: page.incidents,
            pageSize: pageSize.incidents,
            search: query || undefined,
            status: incidentStatus === 'ALL' ? undefined : incidentStatus,
          }),
        );
      } else if (tab === 'owners') {
        setOwners(
          await CommunityWorkspaceService.ownerServiceOwners({
            page: page.owners,
            pageSize: pageSize.owners,
            search: query || undefined,
          }),
        );
      } else {
        setCommunications(
          await CommunityWorkspaceService.ownerServiceCommunications({
            page: page.communications,
            pageSize: pageSize.communications,
            search: query || undefined,
          }),
        );
      }
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : 'No fue posible consultar Atención al Propietario.',
      );
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    let active = true;
    Promise.all([
      CommunityWorkspaceService.ownerServiceOptions(),
      CommunityWorkspaceService.ownerServiceAuthorizations({
        page: 1,
        pageSize: 20,
        status: 'RECEIVED',
      }),
      CommunityWorkspaceService.ownerServiceIncidents({
        page: 1,
        pageSize: 20,
        status: 'RECEIVED',
      }),
      CommunityWorkspaceService.ownerServiceOwners({
        page: 1,
        pageSize: 20,
      }),
      CommunityWorkspaceService.ownerServiceCommunications({
        page: 1,
        pageSize: 20,
      }),
    ])
      .then(
        ([
          optionsData,
          authorizationData,
          incidentData,
          ownerData,
          communicationData,
        ]) => {
          if (!active) return;
          setOptions(optionsData);
          setAuthorizations(authorizationData);
          setIncidents(incidentData);
          setOwners(ownerData);
          setCommunications(communicationData);
        },
      )
      .catch((loadError: unknown) => {
        if (!active) return;
        setError(
          loadError instanceof Error
            ? loadError.message
            : 'No fue posible abrir Atención al Propietario.',
        );
      })
      .finally(() => {
        if (!active) return;
        setLoading(false);
        setInitialized(true);
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!initialized) return;
    const timer = window.setTimeout(() => void loadCurrent(), 250);
    return () => window.clearTimeout(timer);
  }, [
    initialized,
    tab,
    query,
    authorizationStatus,
    incidentStatus,
    page.authorizations,
    page.incidents,
    page.owners,
    page.communications,
    pageSize.authorizations,
    pageSize.incidents,
    pageSize.owners,
    pageSize.communications,
  ]);

  const currentResult =
    tab === 'authorizations'
      ? authorizations
      : tab === 'incidents'
        ? incidents
        : tab === 'owners'
          ? owners
          : communications;

  const changeTab = (next: Tab) => {
    setTab(next);
    setQuery('');
    setError('');
    setNotice('');
  };

  const updatePage = (next: number) =>
    setPage((current) => ({ ...current, [tab]: next }));

  const updatePageSize = (next: PageSize) => {
    setPageSize((current) => ({ ...current, [tab]: next }));
    updatePage(1);
  };

  const execute = async (action: () => Promise<unknown>, message: string) => {
    setSaving(true);
    setError('');
    try {
      await action();
      setNotice(message);
      setSelectedAuthorization(null);
      setSelectedIncident(null);
      await Promise.all([loadCurrent(), loadOptions()]);
    } catch (actionError) {
      setError(
        actionError instanceof Error
          ? actionError.message
          : 'No fue posible completar la operación.',
      );
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    {
      id: 'authorizations' as const,
      label: 'Autorizaciones',
      icon: ClipboardCheck,
      count: loading ? '—' : authorizations.total,
    },
    {
      id: 'incidents' as const,
      label: 'Incidencias',
      icon: MessageSquareWarning,
      count: loading ? '—' : incidents.total,
    },
    {
      id: 'owners' as const,
      label: 'Propietarios',
      icon: Contact,
      count: loading ? '—' : owners.total,
    },
    {
      id: 'communications' as const,
      label: 'Comunicados',
      icon: Megaphone,
      count: loading ? '—' : communications.total,
    },
  ];

  return (
    <section>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {tabs.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => changeTab(item.id)}
              className={`rounded-2xl border p-4 text-left transition ${
                tab === item.id
                  ? 'border-[#b08a3c] bg-[#f6f0e4]'
                  : 'border-[#071a33]/8 bg-white hover:border-[#b08a3c]/45'
              }`}
            >
              <div className="flex items-center justify-between">
                <Icon size={19} className="text-[#9c7532]" />
                <strong className="text-2xl">{item.count}</strong>
              </div>
              <p className="mt-4 text-sm font-bold">{item.label}</p>
            </button>
          );
        })}
      </div>

      {error && (
        <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
          {error}
        </div>
      )}
      {notice && (
        <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-800">
          {notice}
        </div>
      )}

      <Toolbar
        tab={tab}
        query={query}
        onQuery={(value) => {
          setQuery(value);
          updatePage(1);
        }}
        authorizationStatus={authorizationStatus}
        onAuthorizationStatus={(value) => {
          setAuthorizationStatus(value);
          updatePage(1);
        }}
        incidentStatus={incidentStatus}
        onIncidentStatus={(value) => {
          setIncidentStatus(value);
          updatePage(1);
        }}
        pageSize={pageSize[tab]}
        onPageSize={updatePageSize}
      />
      <div
        aria-live="polite"
        className="mt-2 flex h-5 items-center justify-end text-xs font-semibold text-slate-400"
      >
        {refreshing && !loading && (
          <span className="inline-flex items-center gap-2">
            <LoaderCircle size={13} className="animate-spin" />
            Actualizando
          </span>
        )}
      </div>

      {loading ? (
        <div className="flex min-h-52 items-center justify-center">
          <LoaderCircle className="animate-spin text-[#9c7532]" />
        </div>
      ) : (
        <>
          {tab === 'authorizations' && (
            <AuthorizationList
              items={authorizations.items}
              onView={setSelectedAuthorization}
            />
          )}
          {tab === 'incidents' && (
            <IncidentList
              items={incidents.items}
              onView={setSelectedIncident}
            />
          )}
          {tab === 'owners' && <OwnerList items={owners.items} />}
          {tab === 'communications' && (
            <CommunicationsWorkspace
              options={options}
              communications={communications.items}
              saving={saving}
              canPublish={hasScope(
                grantedScopes,
                'owner_service.communications.send',
              )}
              onPublish={(input) =>
                execute(
                  () =>
                    CommunityWorkspaceService.publishServiceCommunication(
                      input,
                    ),
                  'Comunicado publicado y entregado a sus destinatarios.',
                )
              }
              onView={setSelectedCommunicationId}
            />
          )}
          <Pagination
            result={currentResult}
            onPage={updatePage}
          />
        </>
      )}

      {selectedAuthorization && (
        <AuthorizationModal
          authorization={selectedAuthorization}
          saving={saving}
          canApprove={hasScope(
            grantedScopes,
            'owner_service.authorizations.sign',
          )}
          canReject={hasScope(
            grantedScopes,
            'owner_service.authorizations.reject',
          )}
          onApprove={() =>
            execute(
              () =>
                CommunityWorkspaceService.approveServiceAuthorization(
                  selectedAuthorization.id,
                ),
              'Autorización aprobada.',
            )
          }
          onReject={(reason) =>
            execute(
              () =>
                CommunityWorkspaceService.rejectServiceAuthorization(
                  selectedAuthorization.id,
                  reason,
                ),
              'Autorización rechazada con motivo registrado.',
            )
          }
          onClose={() => setSelectedAuthorization(null)}
        />
      )}

      {selectedIncident && (
        <IncidentModal
          incident={selectedIncident}
          staff={options.staff}
          saving={saving}
          canAssign={hasScope(
            grantedScopes,
            'owner_service.incidents.assign',
          )}
          canUpdate={hasScope(
            grantedScopes,
            'owner_service.incidents.status.update',
          )}
          onAssign={(input) =>
            execute(
              () =>
                CommunityWorkspaceService.assignServiceIncident(
                  selectedIncident.id,
                  input,
                ),
              'Trabajador asignado. El histórico fue actualizado.',
            )
          }
          onUpdate={(input) =>
            execute(
              () =>
                CommunityWorkspaceService.updateServiceIncidentStatus(
                  selectedIncident.id,
                  input,
                ),
              'Estado de la incidencia actualizado.',
            )
          }
          onClose={() => setSelectedIncident(null)}
        />
      )}

      {selectedCommunicationId && (
        <CommunicationModal
          communicationId={selectedCommunicationId}
          onClose={() => setSelectedCommunicationId(null)}
        />
      )}
    </section>
  );
}

function Toolbar({
  tab,
  query,
  onQuery,
  authorizationStatus,
  onAuthorizationStatus,
  incidentStatus,
  onIncidentStatus,
  pageSize,
  onPageSize,
}: {
  tab: Tab;
  query: string;
  onQuery: (value: string) => void;
  authorizationStatus: 'ALL' | ServiceAuthorizationStatus;
  onAuthorizationStatus: (value: 'ALL' | ServiceAuthorizationStatus) => void;
  incidentStatus: 'ALL' | ServiceIncidentStatus;
  onIncidentStatus: (value: 'ALL' | ServiceIncidentStatus) => void;
  pageSize: PageSize;
  onPageSize: (value: PageSize) => void;
}) {
  return (
    <div className="mt-6 grid gap-3 lg:grid-cols-[minmax(0,1fr)_250px_150px]">
      <div className="relative">
        <Search
          className="absolute left-4 top-3.5 text-slate-400"
          size={17}
        />
        <input
          value={query}
          onChange={(event) => onQuery(event.target.value)}
          placeholder={
            tab === 'communications'
              ? 'Buscar comunicado…'
              : 'Buscar por código, inmueble, propietario o descripción…'
          }
          className="w-full rounded-2xl border border-[#071a33]/10 bg-white py-3 pl-11 pr-4 text-sm outline-none focus:border-[#b08a3c]"
        />
      </div>
      {tab === 'incidents' ? (
        <select
          value={incidentStatus}
          onChange={(event) =>
            onIncidentStatus(
              event.target.value as 'ALL' | ServiceIncidentStatus,
            )
          }
          className="rounded-2xl border border-[#071a33]/10 bg-white px-4 py-3 text-sm font-semibold"
        >
          <option value="ALL">Todos los estados</option>
          {incidentStatuses.map((status) => (
            <option key={status} value={status}>
              {status === 'RECEIVED'
                ? 'Recibidas · Pendientes'
                : statusLabel(status)}
            </option>
          ))}
        </select>
      ) : tab === 'authorizations' ? (
        <select
          value={authorizationStatus}
          onChange={(event) =>
            onAuthorizationStatus(
              event.target.value as 'ALL' | ServiceAuthorizationStatus,
            )
          }
          className="rounded-2xl border border-[#071a33]/10 bg-white px-4 py-3 text-sm font-semibold"
        >
          <option value="ALL">Todos los estados</option>
          <option value="RECEIVED">Recibidas · Pendientes</option>
          <option value="APPROVED">Aprobadas</option>
          <option value="REJECTED">Rechazadas</option>
        </select>
      ) : (
        <div />
      )}
      <select
        value={pageSize}
        onChange={(event) => onPageSize(Number(event.target.value) as PageSize)}
        className="rounded-2xl border border-[#071a33]/10 bg-white px-4 py-3 text-sm font-semibold"
      >
        {[20, 50, 70, 100].map((size) => (
          <option key={size} value={size}>
            {size} por página
          </option>
        ))}
      </select>
    </div>
  );
}

function AuthorizationList({
  items,
  onView,
}: {
  items: ServiceAuthorizationRecord[];
  onView: (item: ServiceAuthorizationRecord) => void;
}) {
  if (!items.length) return <Empty message="No hay autorizaciones en esta bandeja." />;
  return (
    <div className="mt-5 space-y-3">
      {items.map((item) => (
        <article
          key={item.id}
          className="rounded-2xl border border-[#071a33]/8 bg-white p-5"
        >
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="flex flex-wrap gap-2">
                <Pill>{authorizationLabels[item.type]}</Pill>
                <Pill muted>{statusLabel(item.status)}</Pill>
              </div>
              <h3 className="mt-4 font-bold">{item.subject}</h3>
              <p className="mt-2 text-sm text-slate-500">
                {item.property.code} · {item.owner.firstName}{' '}
                {item.owner.lastName}
              </p>
              <p className="mt-1 text-xs text-slate-400">
                Emitida: {formatDateTime(item.issuedAt)}
              </p>
            </div>
            <ViewButton onClick={() => onView(item)} />
          </div>
        </article>
      ))}
    </div>
  );
}

function IncidentList({
  items,
  onView,
}: {
  items: ServiceIncidentRecord[];
  onView: (item: ServiceIncidentRecord) => void;
}) {
  if (!items.length) return <Empty message="No hay incidencias en esta bandeja." />;
  return (
    <div className="mt-5 space-y-3">
      {items.map((item) => (
        <article
          key={item.id}
          className="rounded-2xl border border-[#071a33]/8 bg-white p-5"
        >
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="flex flex-wrap gap-2">
                <Pill muted>{statusLabel(item.status)}</Pill>
                <span className="text-xs font-semibold text-slate-400">
                  {item.id}
                </span>
              </div>
              <h3 className="mt-4 font-bold">{item.title}</h3>
              <p className="mt-2 line-clamp-2 text-sm text-slate-600">
                {item.description}
              </p>
              <p className="mt-3 text-xs text-slate-400">
                {item.property.code} · {item.reporter.firstName}{' '}
                {item.reporter.lastName} · {formatDateTime(item.reportedAt)}
              </p>
              {item.assignedName && (
                <p className="mt-2 text-xs font-semibold text-[#76571e]">
                  Asignada a {item.assignedName} ·{' '}
                  {formatDateTime(item.assignedAt)}
                </p>
              )}
            </div>
            <ViewButton onClick={() => onView(item)} />
          </div>
        </article>
      ))}
    </div>
  );
}

function OwnerList({ items }: { items: ServiceOwnerRecord[] }) {
  if (!items.length) return <Empty message="No hay propietarios para mostrar." />;
  return (
    <div className="mt-5 overflow-hidden rounded-2xl border border-[#071a33]/8 bg-white">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[800px] text-left text-sm">
          <thead className="bg-[#f8f6f1] text-xs uppercase tracking-wider text-slate-400">
            <tr>
              <th className="p-4">Propietario</th>
              <th>Inmueble</th>
              <th>Sector</th>
              <th>Documento</th>
              <th>Contacto</th>
            </tr>
          </thead>
          <tbody>
            {items.map(({ person, property, sector }) => (
              <tr
                key={`${person.id}-${property.id}`}
                className="border-t border-slate-100"
              >
                <td className="p-4 font-bold">
                  {person.firstName} {person.lastName}
                </td>
                <td>{property.code}</td>
                <td>{sector}</td>
                <td>
                  {person.documentType}-{person.documentNumber}
                </td>
                <td>
                  <p>{person.phone || 'Sin teléfono'}</p>
                  <p className="text-xs text-slate-400">
                    {person.email || 'Sin correo'}
                  </p>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function CommunicationsWorkspace({
  options,
  communications,
  saving,
  canPublish,
  onPublish,
  onView,
}: {
  options: OwnerServiceOptions;
  communications: CommunicationRecord[];
  saving: boolean;
  canPublish: boolean;
  onPublish: (input: {
    title: string;
    body: string;
    audienceType: 'ALL' | 'SECTOR' | 'GROUP' | 'OWNER';
    sectorId?: string;
    propertyIds?: string[];
  }) => void;
  onView: (id: string) => void;
}) {
  const [audienceType, setAudienceType] = useState<
    'ALL' | 'SECTOR' | 'GROUP' | 'OWNER'
  >('ALL');
  const [sectorId, setSectorId] = useState('');
  const [propertyIds, setPropertyIds] = useState<string[]>([]);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    onPublish({
      title: String(form.get('title')).trim(),
      body: String(form.get('body')).trim(),
      audienceType,
      ...(audienceType === 'SECTOR' ? { sectorId } : {}),
      ...(['GROUP', 'OWNER'].includes(audienceType) ? { propertyIds } : {}),
    });
  };

  return (
    <div className="mt-6 grid gap-5 xl:grid-cols-[.9fr_1.1fr]">
      <form
        onSubmit={submit}
        className="rounded-2xl border border-[#071a33]/8 bg-white p-5"
      >
        <h3 className="font-bold">Publicar comunicado</h3>
        <p className="mt-2 text-xs leading-5 text-slate-500">
          CASA resolverá y registrará los destinatarios reales antes de
          publicar.
        </p>
        <fieldset
          disabled={!canPublish || saving}
          className="mt-5 space-y-4 disabled:opacity-50"
        >
          <input
            name="title"
            required
            maxLength={220}
            placeholder="Título del comunicado"
            className="w-full rounded-xl border border-slate-200 p-3 text-sm"
          />
          <textarea
            name="body"
            required
            maxLength={10000}
            rows={6}
            placeholder="Mensaje para los propietarios…"
            className="w-full rounded-xl border border-slate-200 p-3 text-sm"
          />
          <select
            value={audienceType}
            onChange={(event) => {
              setAudienceType(
                event.target.value as typeof audienceType,
              );
              setSectorId('');
              setPropertyIds([]);
            }}
            className="w-full rounded-xl border border-slate-200 p-3 text-sm"
          >
            <option value="ALL">Todos los propietarios</option>
            <option value="SECTOR">Sector, torre o edificio</option>
            <option value="GROUP">Grupo de inmuebles</option>
            <option value="OWNER">Propietario específico</option>
          </select>
          {audienceType === 'SECTOR' && (
            <select
              required
              value={sectorId}
              onChange={(event) => setSectorId(event.target.value)}
              className="w-full rounded-xl border border-slate-200 p-3 text-sm"
            >
              <option value="">Selecciona el sector</option>
              {options.sectors.map((sector) => (
                <option key={sector.id} value={sector.id}>
                  {sector.code} · {sector.name}
                </option>
              ))}
            </select>
          )}
          {['GROUP', 'OWNER'].includes(audienceType) && (
            <PropertyAudiencePicker
              multiple={audienceType === 'GROUP'}
              owners={options.owners}
              selected={propertyIds}
              onChange={setPropertyIds}
            />
          )}
          <button className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#071a33] py-3 text-sm font-bold text-white">
            {saving ? <LoaderCircle size={16} className="animate-spin" /> : <Send size={16} />}
            Publicar ahora
          </button>
        </fieldset>
      </form>

      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <BellRing size={18} className="text-[#9c7532]" />
          <h3 className="font-bold">Historial publicado</h3>
        </div>
        {communications.map((item) => (
          <article
            key={item.id}
            className="rounded-2xl border border-[#071a33]/8 bg-white p-4"
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <strong>{item.title}</strong>
                <p className="mt-2 line-clamp-2 text-sm text-slate-500">
                  {item.body}
                </p>
                <p className="mt-3 text-xs text-slate-400">
                  <Users className="mr-1 inline" size={13} />
                  {item.audienceLabel} · {formatDateTime(item.publishedAt)}
                </p>
                <p className="mt-2 text-xs font-semibold text-[#76571e]">
                  {item.readCount} leído(s) de {item.recipientCount}
                </p>
              </div>
              <ViewButton onClick={() => onView(item.id)} compact />
            </div>
          </article>
        ))}
        {!communications.length && (
          <Empty message="Todavía no hay comunicados publicados." />
        )}
      </section>
    </div>
  );
}

function PropertyAudiencePicker({
  multiple,
  owners,
  selected,
  onChange,
}: {
  multiple: boolean;
  owners: OwnerServiceOptions['owners'];
  selected: string[];
  onChange: (ids: string[]) => void;
}) {
  const unique = useMemo(
    () =>
      [
        ...new Map(
          owners.map((item) => [item.property.id, item]),
        ).values(),
      ],
    [owners],
  );
  return (
    <div className="max-h-56 space-y-2 overflow-y-auto rounded-xl border border-slate-200 p-3">
      {unique.map(({ property, person }) => {
        const checked = selected.includes(property.id);
        return (
          <label
            key={property.id}
            className="flex cursor-pointer items-center gap-3 rounded-lg p-2 text-sm hover:bg-slate-50"
          >
            <input
              type={multiple ? 'checkbox' : 'radio'}
              checked={checked}
              onChange={() =>
                onChange(
                  multiple
                    ? checked
                      ? selected.filter((id) => id !== property.id)
                      : [...selected, property.id]
                    : [property.id],
                )
              }
            />
            <span>
              <b>{property.code}</b> · {person.firstName} {person.lastName}
            </span>
          </label>
        );
      })}
      {!unique.length && (
        <p className="p-3 text-center text-xs text-slate-500">
          No hay inmuebles con propietarios activos.
        </p>
      )}
    </div>
  );
}

function AuthorizationModal({
  authorization,
  saving,
  canApprove,
  canReject,
  onApprove,
  onReject,
  onClose,
}: {
  authorization: ServiceAuthorizationRecord;
  saving: boolean;
  canApprove: boolean;
  canReject: boolean;
  onApprove: () => void;
  onReject: (reason: string) => void;
  onClose: () => void;
}) {
  const [reason, setReason] = useState('');
  return (
    <Modal
      eyebrow={`Expediente ${authorization.id}`}
      title={authorizationLabels[authorization.type]}
      subtitle={`Emitida el ${formatDateTime(authorization.issuedAt)}`}
      onClose={onClose}
    >
      <InfoCard title="Información del propietario">
        <dl className="grid gap-4 sm:grid-cols-3">
          <Detail
            label="Nombre y apellido"
            value={`${authorization.owner.firstName} ${authorization.owner.lastName}`}
          />
          <Detail label="Inmueble" value={authorization.property.code} />
          <Detail
            label="Documento"
            value={`${authorization.owner.documentType}-${authorization.owner.documentNumber}`}
          />
        </dl>
      </InfoCard>
      <InfoCard title="Personas autorizadas">
        <div className="space-y-2">
          {authorization.authorizedPeople.map((person) => (
            <div
              key={person.id}
              className="grid gap-2 rounded-xl bg-[#f8f6f1] p-4 sm:grid-cols-2"
            >
              <Detail
                label="Nombre"
                value={`${person.firstName} ${person.lastName}`}
              />
              <Detail label="Documento" value={person.documentNumber} />
            </div>
          ))}
          {!authorization.authorizedPeople.length && (
            <p className="text-sm text-slate-500">Sin personas registradas.</p>
          )}
        </div>
      </InfoCard>
      <InfoCard title="Vigencia">
        <dl className="grid gap-4 sm:grid-cols-3">
          <Detail label="Desde" value={formatDateTime(authorization.validFrom)} />
          <Detail label="Hasta" value={formatDateTime(authorization.validUntil)} />
          <Detail label="Estado" value={statusLabel(authorization.status)} />
        </dl>
      </InfoCard>
      {authorization.type === 'ACCESS' && (
        <InfoCard title="Vehículo">
          <dl className="grid gap-4 sm:grid-cols-4">
            <Detail label="Marca" value={authorization.vehicleBrand || '—'} />
            <Detail label="Modelo" value={authorization.vehicleModel || '—'} />
            <Detail label="Color" value={authorization.vehicleColor || '—'} />
            <Detail label="Placa" value={authorization.vehiclePlate || '—'} />
          </dl>
        </InfoCard>
      )}
      {authorization.type === 'WORK' && (
        <InfoCard title="Trabajo solicitado">
          <p className="text-sm leading-7 text-slate-600">
            {authorization.workDescription || 'Sin descripción.'}
          </p>
        </InfoCard>
      )}
      {authorization.type === 'EXIT' && (
        <InfoCard title="Detalle de la salida">
          <dl className="grid gap-4 sm:grid-cols-[180px_1fr]">
            <Detail
              label="Motivo"
              value={authorization.exitPurpose || '—'}
            />
            <Detail
              label="Bienes"
              value={authorization.exitItems || 'Sin detalle.'}
            />
          </dl>
        </InfoCard>
      )}
      {authorization.status === 'REJECTED' && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5">
          <Detail
            label="Motivo del rechazo"
            value={authorization.rejectionReason || 'No registrado'}
          />
        </div>
      )}
      {authorization.status === 'RECEIVED' && (
        <div className="rounded-2xl border border-[#071a33]/8 bg-white p-5">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Motivo obligatorio si será rechazada
            <textarea
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              rows={3}
              maxLength={1000}
              placeholder="Explica claramente el motivo…"
              className="mt-2 w-full rounded-xl border border-slate-200 p-3 text-sm font-normal normal-case tracking-normal"
            />
          </label>
          <div className="mt-4 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            {canReject && (
              <button
                disabled={saving || !reason.trim()}
                onClick={() => onReject(reason.trim())}
                className="rounded-xl border border-rose-200 px-5 py-3 text-sm font-bold text-rose-700 disabled:opacity-40"
              >
                Rechazar
              </button>
            )}
            {canApprove && (
              <button
                disabled={saving}
                onClick={onApprove}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#071a33] px-5 py-3 text-sm font-bold text-white disabled:opacity-40"
              >
                <BadgeCheck size={16} />
                Aprobar
              </button>
            )}
          </div>
        </div>
      )}
    </Modal>
  );
}

function IncidentModal({
  incident,
  staff,
  saving,
  canAssign,
  canUpdate,
  onAssign,
  onUpdate,
  onClose,
}: {
  incident: ServiceIncidentRecord;
  staff: OwnerServiceOptions['staff'];
  saving: boolean;
  canAssign: boolean;
  canUpdate: boolean;
  onAssign: (input: { employmentId?: string; assignedName: string }) => void;
  onUpdate: (input: {
    status: ServiceIncidentStatus;
    note?: string;
  }) => void;
  onClose: () => void;
}) {
  const [employmentId, setEmploymentId] = useState('');
  const [assignedName, setAssignedName] = useState(incident.assignedName ?? '');
  const [status, setStatus] = useState<ServiceIncidentStatus>(
    incident.status === 'WORKER_ASSIGNED' ? 'IN_EXECUTION' : 'IN_REVIEW',
  );
  const [note, setNote] = useState('');

  return (
    <Modal
      eyebrow={`Expediente ${incident.id}`}
      title={incident.title}
      subtitle={`Recibida el ${formatDateTime(incident.reportedAt)}`}
      onClose={onClose}
    >
      <InfoCard title="Información reportada">
        <p className="text-sm leading-7 text-slate-600">
          {incident.description}
        </p>
        <dl className="mt-5 grid gap-4 border-t border-slate-100 pt-5 sm:grid-cols-3">
          <Detail
            label="Propietario"
            value={`${incident.reporter.firstName} ${incident.reporter.lastName}`}
          />
          <Detail label="Inmueble" value={incident.property.code} />
          <Detail label="Estado" value={statusLabel(incident.status)} />
        </dl>
      </InfoCard>
      <div className="grid gap-5 lg:grid-cols-2">
        <InfoCard title="Asignar trabajador">
          <select
            disabled={!canAssign || saving}
            value={employmentId}
            onChange={(event) => {
              const value = event.target.value;
              setEmploymentId(value);
              const worker = staff.find((item) => item.id === value);
              if (worker) {
                setAssignedName(
                  `${worker.person.firstName} ${worker.person.lastName}`,
                );
              }
            }}
            className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm disabled:opacity-50"
          >
            <option value="">Nombre externo o sin seleccionar</option>
            {staff.map((worker) => (
              <option key={worker.id} value={worker.id}>
                {worker.person.firstName} {worker.person.lastName} ·{' '}
                {worker.position}
              </option>
            ))}
          </select>
          <input
            disabled={!canAssign || saving}
            value={assignedName}
            onChange={(event) => {
              setAssignedName(event.target.value);
              setEmploymentId('');
            }}
            placeholder="Nombre del responsable"
            className="mt-3 w-full rounded-xl border border-slate-200 p-3 text-sm disabled:opacity-50"
          />
          <button
            disabled={!canAssign || saving || !assignedName.trim()}
            onClick={() =>
              onAssign({
                ...(employmentId ? { employmentId } : {}),
                assignedName: assignedName.trim(),
              })
            }
            className="mt-3 w-full rounded-xl bg-[#071a33] py-3 text-sm font-bold text-white disabled:opacity-40"
          >
            Asignar trabajador
          </button>
        </InfoCard>
        <InfoCard title="Actualizar estado">
          <select
            disabled={!canUpdate || saving}
            value={status}
            onChange={(event) =>
              setStatus(event.target.value as ServiceIncidentStatus)
            }
            className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm disabled:opacity-50"
          >
            {manualIncidentStatuses.map((item) => (
              <option key={item} value={item}>
                {statusLabel(item)}
              </option>
            ))}
          </select>
          <textarea
            disabled={!canUpdate || saving}
            value={note}
            onChange={(event) => setNote(event.target.value)}
            rows={2}
            placeholder="Nota de seguimiento opcional"
            className="mt-3 w-full rounded-xl border border-slate-200 p-3 text-sm disabled:opacity-50"
          />
          <button
            disabled={!canUpdate || saving}
            onClick={() =>
              onUpdate({ status, ...(note.trim() ? { note: note.trim() } : {}) })
            }
            className="mt-3 w-full rounded-xl border border-[#b08a3c] py-3 text-sm font-bold text-[#76571e] disabled:opacity-40"
          >
            Actualizar estado
          </button>
        </InfoCard>
      </div>
      <InfoCard title="Histórico del seguimiento">
        <div className="space-y-0">
          {incident.history.map((event, index) => (
            <div
              key={event.id}
              className="grid grid-cols-[28px_1fr] gap-3"
            >
              <div className="flex flex-col items-center">
                <span className="mt-1 h-3 w-3 rounded-full bg-[#b08a3c]" />
                {index < incident.history.length - 1 && (
                  <span className="min-h-16 w-px flex-1 bg-slate-200" />
                )}
              </div>
              <div className="pb-5">
                <div className="flex flex-wrap justify-between gap-2">
                  <strong className="text-sm">
                    {statusLabel(event.status)}
                  </strong>
                  <span className="text-xs text-slate-400">
                    {formatDateTime(event.occurredAt)}
                  </span>
                </div>
                <p className="mt-1 text-sm text-slate-600">{event.note}</p>
                <p className="mt-2 text-xs text-slate-400">
                  {event.actor?.person
                    ? `${event.actor.person.firstName} ${event.actor.person.lastName}`
                    : event.actor?.email || 'Sistema CASA'}
                  {event.assignedName
                    ? ` · Responsable: ${event.assignedName}`
                    : ''}
                </p>
              </div>
            </div>
          ))}
        </div>
      </InfoCard>
    </Modal>
  );
}

function CommunicationModal({
  communicationId,
  onClose,
}: {
  communicationId: string;
  onClose: () => void;
}) {
  const [detail, setDetail] = useState<CommunicationDetailRecord | null>(null);
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<PageSize>(20);
  const [error, setError] = useState('');

  useEffect(() => {
    const timer = window.setTimeout(() => {
      CommunityWorkspaceService.ownerServiceCommunication(communicationId, {
        page,
        pageSize,
        search: query || undefined,
      })
        .then(setDetail)
        .catch((loadError: unknown) =>
          setError(
            loadError instanceof Error
              ? loadError.message
              : 'No fue posible abrir el comunicado.',
          ),
        );
    }, 200);
    return () => window.clearTimeout(timer);
  }, [communicationId, page, pageSize, query]);

  if (!detail) {
    return (
      <Modal
        eyebrow="Comunicado"
        title="Cargando expediente…"
        onClose={onClose}
      >
        {error ? (
          <p className="text-sm font-semibold text-red-700">{error}</p>
        ) : (
          <LoaderCircle className="mx-auto animate-spin text-[#9c7532]" />
        )}
      </Modal>
    );
  }
  const read = detail.recipients.items.filter(
    (item) => item.status === 'READ',
  ).length;
  return (
    <Modal
      eyebrow={`Comunicado ${detail.id}`}
      title={detail.title}
      subtitle={`Publicado el ${formatDateTime(detail.publishedAt)}`}
      onClose={onClose}
    >
      <InfoCard title="Información completa">
        <dl className="grid gap-4 sm:grid-cols-3">
          <Detail
            label="Emitido por"
            value={
              detail.publishedBy.person
                ? `${detail.publishedBy.person.firstName} ${detail.publishedBy.person.lastName}`
                : detail.publishedBy.email
            }
          />
          <Detail label="Audiencia" value={detail.audienceLabel} />
          <Detail
            label="Fecha de emisión"
            value={formatDateTime(detail.publishedAt)}
          />
        </dl>
        <p className="mt-5 whitespace-pre-wrap border-t border-slate-100 pt-5 text-sm leading-7 text-slate-700">
          {detail.body}
        </p>
      </InfoCard>
      <InfoCard title="Entrega y lectura">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs text-slate-500">
            {read} leído(s) en esta página · {detail.recipients.total}{' '}
            destinatario(s)
          </p>
          <select
            value={pageSize}
            onChange={(event) => {
              setPageSize(Number(event.target.value) as PageSize);
              setPage(1);
            }}
            className="rounded-lg border border-slate-200 px-3 py-2 text-xs"
          >
            {[20, 50, 70, 100].map((size) => (
              <option key={size} value={size}>
                {size} por página
              </option>
            ))}
          </select>
        </div>
        <div className="relative mt-4">
          <Search
            className="absolute left-4 top-3.5 text-slate-400"
            size={16}
          />
          <input
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setPage(1);
            }}
            placeholder="Buscar por inmueble o propietario…"
            className="w-full rounded-xl border border-slate-200 py-3 pl-11 pr-4 text-sm"
          />
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[650px] text-left text-sm">
            <thead className="text-xs uppercase tracking-wider text-slate-400">
              <tr>
                <th className="py-3">Inmueble</th>
                <th>Propietario</th>
                <th>Estado</th>
                <th>Fecha</th>
              </tr>
            </thead>
            <tbody>
              {detail.recipients.items.map((recipient) => (
                <tr key={recipient.id} className="border-t border-slate-100">
                  <td className="py-4 font-bold">{recipient.property.code}</td>
                  <td>
                    {recipient.person.firstName} {recipient.person.lastName}
                  </td>
                  <td>
                    <span
                      className={`inline-flex items-center gap-1.5 font-semibold ${
                        recipient.status === 'READ'
                          ? 'text-sky-600'
                          : 'text-slate-500'
                      }`}
                    >
                      <CheckCheck size={16} />
                      {recipient.status === 'READ'
                        ? 'Leído'
                        : 'Recibido, no leído'}
                    </span>
                  </td>
                  <td className="text-xs text-slate-500">
                    {formatDateTime(
                      recipient.readAt || recipient.receivedAt,
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination result={detail.recipients} onPage={setPage} />
      </InfoCard>
    </Modal>
  );
}

function Pagination({
  result,
  onPage,
}: {
  result: { total: number; page: number; pageCount: number };
  onPage: (page: number) => void;
}) {
  return (
    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-white px-4 py-3 text-xs font-semibold text-slate-500">
      <span>
        {result.total} registro(s) · Página {result.page} de {result.pageCount}
      </span>
      <div className="flex gap-2">
        <button
          disabled={result.page <= 1}
          onClick={() => onPage(Math.max(1, result.page - 1))}
          className="rounded-lg border border-slate-200 p-2 disabled:opacity-35"
        >
          <ChevronLeft size={15} />
        </button>
        <button
          disabled={result.page >= result.pageCount}
          onClick={() => onPage(Math.min(result.pageCount, result.page + 1))}
          className="rounded-lg border border-slate-200 p-2 disabled:opacity-35"
        >
          <ChevronRight size={15} />
        </button>
      </div>
    </div>
  );
}

function Modal({
  eyebrow,
  title,
  subtitle,
  onClose,
  children,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 overflow-y-auto bg-[#071a33]/70 p-4 backdrop-blur-sm sm:p-7"
    >
      <div className="mx-auto my-3 max-w-4xl overflow-hidden rounded-[1.75rem] bg-[#f7f4ed] shadow-2xl">
        <header className="flex items-start justify-between gap-5 bg-[#071a33] px-6 py-6 text-white sm:px-8">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#d9b76d]">
              {eyebrow}
            </p>
            <h2 className="mt-2 text-2xl font-semibold">{title}</h2>
            {subtitle && (
              <p className="mt-2 text-sm text-white/60">{subtitle}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="rounded-full border border-white/15 p-2.5 text-white/70 hover:bg-white/10 hover:text-white"
          >
            <X size={19} />
          </button>
        </header>
        <div className="space-y-5 p-5 sm:p-8">{children}</div>
        <footer className="flex justify-end border-t border-[#071a33]/8 bg-white px-5 py-5 sm:px-8">
          <button
            onClick={onClose}
            className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold"
          >
            Cerrar
          </button>
        </footer>
      </div>
    </div>
  );
}

function InfoCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-[#071a33]/8 bg-white p-5">
      <h3 className="mb-4 text-sm font-bold">{title}</h3>
      {children}
    </section>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
        {label}
      </dt>
      <dd className="mt-1 text-sm font-semibold leading-6 text-[#071a33]">
        {value}
      </dd>
    </div>
  );
}

function Pill({
  children,
  muted = false,
}: {
  children: React.ReactNode;
  muted?: boolean;
}) {
  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-bold ${
        muted
          ? 'bg-slate-100 text-slate-600'
          : 'bg-[#f1eadb] text-[#76571e]'
      }`}
    >
      {children}
    </span>
  );
}

function ViewButton({
  onClick,
  compact = false,
}: {
  onClick: () => void;
  compact?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center justify-center gap-2 rounded-xl font-bold ${
        compact
          ? 'border border-[#071a33]/15 px-4 py-2 text-xs'
          : 'bg-[#071a33] px-5 py-3 text-sm text-white'
      }`}
    >
      <Eye size={compact ? 15 : 16} />
      Ver
    </button>
  );
}

function Empty({ message }: { message: string }) {
  return (
    <div className="mt-5 rounded-2xl border border-dashed border-[#071a33]/15 bg-white/50 p-10 text-center">
      <MessageSquareWarning className="mx-auto text-slate-300" />
      <p className="mt-3 text-sm font-semibold text-slate-500">{message}</p>
    </div>
  );
}
