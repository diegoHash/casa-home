import {
  useEffect,
  useMemo,
  useState,
  type FormEvent,
  type ReactNode,
} from 'react';
import {
  Check,
  CircleHelp,
  KeyRound,
  LoaderCircle,
  Plus,
  ShieldCheck,
  X,
} from 'lucide-react';
import { WorkspacePermissionsTree } from './WorkspacePermissionsTree';
import {
  communityFullAccessScope,
  normalizeWorkspaceScopes,
  roleCatalog,
  scopeCatalog,
  scopeIsGranted,
  scopesDefaultsForRole,
  workspaceDefaultsForRole,
} from '../../config/communityAccessCatalog';
import { workspaceCatalog, workspaceLabel } from '../../config/workspaceCatalog';
import type {
  AccessPersonnelRecord,
  CommunityAccessRecord,
  CreateCommunityAccessInput,
} from '../../services/CasaPlatformService';
import { CommunityWorkspaceService } from '../../services/CommunityWorkspaceService';

interface Props {
  currentUserId: string;
  grantedScopes: string[];
  grantedWorkspaces: string[];
}

const inputClass =
  'mt-1.5 w-full rounded-xl border border-[#071a33]/12 bg-white px-3.5 py-3 text-sm outline-none transition focus:border-[#b08a3c] focus:ring-2 focus:ring-[#b08a3c]/15';

export function CommunityPersonnelPanel({
  currentUserId,
  grantedScopes,
  grantedWorkspaces,
}: Props) {
  const [records, setRecords] = useState<CommunityAccessRecord[]>([]);
  const [personnel, setPersonnel] = useState<AccessPersonnelRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [creatingPersonId, setCreatingPersonId] = useState<string | null>(null);
  const [editing, setEditing] = useState<CommunityAccessRecord | null>(null);
  const [revoking, setRevoking] = useState<CommunityAccessRecord | null>(null);
  const [revokeReason, setRevokeReason] = useState('');

  const allowedScopes = useMemo(
    () =>
      scopeCatalog.filter((scope) =>
        scopeIsGranted(
          normalizeWorkspaceScopes(grantedScopes, grantedWorkspaces),
          scope.code,
        ),
      ),
    [grantedScopes, grantedWorkspaces],
  );
  const allowedWorkspaces = useMemo(
    () =>
      workspaceCatalog.filter(
        (workspace) =>
          grantedWorkspaces.includes('*') ||
          grantedScopes.includes('*') ||
          grantedScopes.includes(communityFullAccessScope) ||
          grantedWorkspaces.includes(workspace.code),
      ),
    [grantedScopes, grantedWorkspaces],
  );

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const [accessRecords, personnelRecords] = await Promise.all([
        CommunityWorkspaceService.accessUsers(),
        CommunityWorkspaceService.accessPersonnel(),
      ]);
      setRecords(accessRecords);
      setPersonnel(personnelRecords);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : 'No fue posible cargar los accesos.',
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    Promise.all([
      CommunityWorkspaceService.accessUsers(),
      CommunityWorkspaceService.accessPersonnel(),
    ])
      .then(([accessRecords, personnelRecords]) => {
        if (!active) return;
        setRecords(accessRecords);
        setPersonnel(personnelRecords);
      })
      .catch((loadError: unknown) => {
        if (!active) return;
        setError(
          loadError instanceof Error
            ? loadError.message
            : 'No fue posible cargar los accesos.',
        );
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const canManage = (record: CommunityAccessRecord) => {
    if (record.user.id === currentUserId) return false;
    if (
      !record.employmentActive ||
      !['ACTIVE', 'BLOCKED'].includes(record.status)
    ) return false;
    const activeWorkspaces = record.workspaces
      .filter((workspace) => workspace.status === 'ACTIVE')
      .map((workspace) => workspace.workspaceCode);
    return (
      record.scopes.every((scope) => scopeIsGranted(grantedScopes, scope)) &&
      activeWorkspaces.every(
        (workspace) =>
          grantedWorkspaces.includes('*') ||
          grantedWorkspaces.includes(workspace),
      )
    );
  };

  const handleCreate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setNotice('');
    const form = new FormData(event.currentTarget);
    const input: CreateCommunityAccessInput = {
      personId: String(form.get('personId')),
      roleCode: String(form.get('roleCode')).trim(),
      scopes: form.getAll('scopes').map(String),
      workspaceCodes: form.getAll('workspaceCodes').map(String),
      temporaryPassword:
        String(form.get('temporaryPassword')).trim() || undefined,
    };
    try {
      await CommunityWorkspaceService.createAccessUser(input);
      setCreatingPersonId(null);
      setNotice('Acceso creado y limitado a esta comunidad.');
      await load();
    } catch (createError) {
      setError(
        createError instanceof Error
          ? createError.message
          : 'No fue posible crear el acceso.',
      );
    }
  };

  const handleUpdate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editing) return;
    setError('');
    setNotice('');
    const form = new FormData(event.currentTarget);
    try {
      await CommunityWorkspaceService.updateAccessUser(editing.id, {
        roleCode: String(form.get('roleCode')).trim(),
        scopes: form.getAll('scopes').map(String),
        workspaceCodes: form.getAll('workspaceCodes').map(String),
        reason: String(form.get('reason')).trim(),
      });
      setEditing(null);
      setNotice(
        'Acceso actualizado. Las sesiones anteriores de esa persona fueron cerradas.',
      );
      await load();
    } catch (updateError) {
      setError(
        updateError instanceof Error
          ? updateError.message
          : 'No fue posible actualizar el acceso.',
      );
    }
  };

  const handleRevoke = async () => {
    if (!revoking) return;
    if (revokeReason.trim().length < 8) {
      setError('Explica brevemente el motivo de la revocación.');
      return;
    }
    setError('');
    setNotice('');
    try {
      await CommunityWorkspaceService.revokeAccessUser(
        revoking.id,
        revokeReason.trim(),
      );
      setRevoking(null);
      setRevokeReason('');
      setNotice('Acceso revocado y sesiones anteriores cerradas.');
      await load();
    } catch (revokeError) {
      setError(
        revokeError instanceof Error
          ? revokeError.message
          : 'No fue posible revocar el acceso.',
      );
    }
  };

  return (
    <div className="mt-6 rounded-[1.75rem] border border-[#071a33]/8 bg-white p-5 shadow-[0_16px_55px_rgba(7,26,51,.05)] sm:p-7">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#9c7532]">
            Administración delegada
          </p>
          <h3 className="mt-2 text-xl font-semibold">Accesos del personal</h3>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            Puedes conceder únicamente permisos y espacios incluidos en tu propia
            autorización. Los accesos superiores permanecen protegidos.
          </p>
        </div>
        <button
          onClick={() => {
            setError('');
            setCreatingPersonId('');
          }}
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-[#071a33] px-5 py-3 text-sm font-bold text-white"
        >
          <Plus size={16} /> Crear acceso
        </button>
      </div>

      {error && (
        <div role="alert" className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {error}
        </div>
      )}
      {notice && (
        <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
          {notice}
        </div>
      )}

      {loading ? (
        <div className="flex items-center gap-3 py-8 text-sm font-semibold text-slate-500">
          <LoaderCircle size={18} className="animate-spin" /> Cargando accesos…
        </div>
      ) : (
        <div className="mt-6 grid gap-3">
          {personnel.map((worker) => {
            const record =
              records.find(
                (access) => access.user.person?.id === worker.personId,
              ) ?? null;
            if (!record) {
              return (
                <article
                  key={worker.personId}
                  className="rounded-2xl border border-dashed border-[#b08a3c]/35 bg-[#fffdf8] p-4 sm:p-5"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-bold">{worker.firstName} {worker.lastName}</p>
                        <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-amber-700">
                          Sin acceso
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-slate-500">
                        {worker.position} · {worker.department} · {worker.email ?? 'Sin correo principal'}
                      </p>
                      {worker.blockingReason && (
                        <p className="mt-2 text-xs font-semibold text-rose-600">{worker.blockingReason}</p>
                      )}
                    </div>
                    <button
                      type="button"
                      disabled={!worker.canCreateAccess}
                      onClick={() => {
                        setError('');
                        setCreatingPersonId(worker.personId);
                      }}
                      className="inline-flex items-center justify-center gap-2 rounded-full bg-[#071a33] px-4 py-2.5 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <KeyRound size={15} /> Configurar acceso
                    </button>
                  </div>
                </article>
              );
            }
            const person = record.user.person;
            const activeWorkspaces = record.workspaces.filter(
              (workspace) => workspace.status === 'ACTIVE',
            );
            const manageable = canManage(record);
            return (
              <article
                key={record.id}
                className="rounded-2xl border border-[#071a33]/8 bg-[#fbfaf7] p-4 sm:p-5"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-bold">
                        {person
                          ? `${person.firstName} ${person.lastName}`
                          : record.user.email}
                      </p>
                      {record.user.id === currentUserId && (
                        <span className="rounded-full bg-[#e9dfc8] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-[#725421]">
                          Tu acceso
                        </span>
                      )}
                      {!record.employmentActive && (
                        <span className="rounded-full bg-rose-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-rose-700">
                          Relación finalizada
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-xs text-slate-500">
                      {record.user.email} · {record.roleCode}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {activeWorkspaces.map((workspace) => (
                        <span
                          key={workspace.id}
                          className="rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold text-[#725421] ring-1 ring-[#d8c28e]/45"
                        >
                          {workspaceLabel(workspace.workspaceCode)}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-wrap justify-end gap-2">
                    <button
                      disabled={!manageable}
                      onClick={() => {
                        setError('');
                        setEditing(record);
                      }}
                      title={
                        manageable
                          ? 'Editar acceso'
                          : !record.employmentActive
                            ? 'Acceso histórico: la persona no tiene una relación laboral vigente.'
                            : record.status !== 'ACTIVE'
                              ? 'El acceso no está activo.'
                              : 'No puedes modificar tu propio acceso ni uno superior a tu autorización.'
                      }
                      className="inline-flex items-center justify-center gap-2 rounded-full border border-[#071a33]/12 bg-white px-4 py-2.5 text-sm font-bold disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <KeyRound size={15} /> {!record.employmentActive
                        ? 'Acceso histórico'
                        : record.status === 'BLOCKED'
                          ? 'Reactivar acceso'
                          : 'Editar autoridad'}
                    </button>
                    {manageable && record.status === 'ACTIVE' && (
                      <button
                        type="button"
                        onClick={() => {
                          setError('');
                          setRevokeReason('');
                          setRevoking(record);
                        }}
                        className="rounded-full border border-rose-200 px-4 py-2.5 text-sm font-bold text-rose-700 hover:bg-rose-50"
                      >
                        Revocar acceso
                      </button>
                    )}
                  </div>
                </div>
                {revoking?.id === record.id && (
                  <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 p-4">
                    <label className="block text-xs font-bold text-rose-800">Motivo obligatorio<textarea value={revokeReason} onChange={(event) => setRevokeReason(event.target.value)} rows={2} maxLength={500} className="mt-2 w-full rounded-xl border border-rose-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-rose-400" placeholder="Ej.: Terminación de funciones." /></label>
                    <div className="mt-3 flex justify-end gap-2"><button type="button" onClick={() => { setRevoking(null); setRevokeReason(''); }} className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-bold">Cancelar</button><button type="button" onClick={() => void handleRevoke()} className="rounded-full bg-rose-700 px-4 py-2 text-xs font-bold text-white">Confirmar revocación</button></div>
                  </div>
                )}
              </article>
            );
          })}
          {!personnel.length && (
            <p className="rounded-2xl border border-dashed border-slate-200 p-6 text-sm text-slate-500">
              No hay trabajadores vigentes registrados en Núcleo CASA.
            </p>
          )}
        </div>
      )}

      {creatingPersonId !== null && (
        <AccessModal title="Crear acceso de personal" onClose={() => setCreatingPersonId(null)}>
          <AccessForm
            personnel={personnel}
            initialPersonId={creatingPersonId}
            allowedScopes={allowedScopes}
            allowedWorkspaces={allowedWorkspaces}
            onSubmit={handleCreate}
          />
        </AccessModal>
      )}
      {editing && (
        <AccessModal title="Editar autoridad del personal" onClose={() => setEditing(null)}>
          <AccessForm
            record={editing}
            allowedScopes={allowedScopes}
            allowedWorkspaces={allowedWorkspaces}
            onSubmit={handleUpdate}
          />
        </AccessModal>
      )}
    </div>
  );
}

function AccessModal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-[80] overflow-y-auto bg-[#071a33]/65 px-4 py-8 backdrop-blur-sm">
      <div className="mx-auto flex max-h-[calc(100vh-4rem)] max-w-3xl flex-col overflow-hidden rounded-[1.75rem] bg-[#f8f6f0] shadow-2xl">
        <header className="flex shrink-0 items-center justify-between rounded-t-[1.75rem] border-b border-[#071a33]/8 bg-[#f8f6f0] px-5 py-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#9c7532]">CASA</p>
            <h3 className="mt-1 text-lg font-semibold">{title}</h3>
          </div>
          <button onClick={onClose} aria-label="Cerrar" className="rounded-full border border-[#071a33]/10 bg-white p-2">
            <X size={18} />
          </button>
        </header>
        <div className="min-h-0 overflow-y-auto p-5 sm:p-7">{children}</div>
      </div>
    </div>
  );
}

function AccessForm({
  record,
  personnel = [],
  initialPersonId,
  allowedScopes,
  allowedWorkspaces,
  onSubmit,
}: {
  record?: CommunityAccessRecord;
  personnel?: AccessPersonnelRecord[];
  initialPersonId?: string;
  allowedScopes: Array<(typeof scopeCatalog)[number]>;
  allowedWorkspaces: Array<(typeof workspaceCatalog)[number]>;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  const [passwordLength, setPasswordLength] = useState(0);
  const firstEligiblePerson = personnel.find((worker) => worker.canCreateAccess);
  const [selectedPersonId, setSelectedPersonId] = useState(
    initialPersonId || firstEligiblePerson?.personId || '',
  );
  const selectedPerson = personnel.find(
    (worker) => worker.personId === selectedPersonId,
  );
  const initialRoleCode = record?.roleCode ?? 'LECTURA';
  const allowedWorkspaceCodes = new Set<string>(
    allowedWorkspaces.map((workspace) => workspace.code),
  );
  const initialWorkspaceCodes = record
    ? initialRoleCode === 'ADMINISTRADOR_INTEGRAL'
      ? workspaceCatalog.map((workspace) => workspace.code)
      : record.workspaces
          .filter((workspace) => workspace.status === 'ACTIVE')
          .map((workspace) => workspace.workspaceCode)
    : workspaceDefaultsForRole(initialRoleCode).filter((workspaceCode) =>
        allowedWorkspaceCodes.has(workspaceCode),
      );
  const [selectedRole, setSelectedRole] = useState(
    initialRoleCode,
  );
  const [selectedWorkspaceCodes, setSelectedWorkspaceCodes] = useState<string[]>(
    initialWorkspaceCodes,
  );
  const [selectedScopes, setSelectedScopes] = useState<string[]>(
    (record ? normalizeWorkspaceScopes(record.scopes, initialWorkspaceCodes) : undefined)?.filter((scope) =>
      allowedScopes.some((allowed) => allowed.code === scope),
    ) ?? scopesDefaultsForRole(initialRoleCode, initialWorkspaceCodes).filter(
      (scope) => allowedScopes.some((allowed) => allowed.code === scope),
    ),
  );
  const effectiveWorkspaceCodes = selectedWorkspaceCodes;
  const effectiveScopes = selectedScopes;
  const hasCommunityFullAccess = selectedScopes.includes(communityFullAccessScope);
  return (
    <form onSubmit={onSubmit}>
      {effectiveWorkspaceCodes.map((workspaceCode) => (
        <input
          key={`workspace-${workspaceCode}`}
          type="hidden"
          name="workspaceCodes"
          value={workspaceCode}
        />
      ))}
      {effectiveScopes.map((scope) => (
        <input key={`scope-${scope}`} type="hidden" name="scopes" value={scope} />
      ))}
      {!record && (
        <div>
          <Field label="Trabajador registrado en Núcleo CASA" wide>
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
              <option value="">Selecciona personal vigente</option>
              {personnel.map((worker) => (
                <option
                  key={worker.personId}
                  value={worker.personId}
                  disabled={!worker.canCreateAccess}
                >
                  {worker.firstName} {worker.lastName} · {worker.position}
                  {!worker.canCreateAccess ? ' · No disponible' : ''}
                </option>
              ))}
            </select>
          </Field>
          {selectedPerson && (
            <div className="mt-4 rounded-xl border border-[#d8c28e]/50 bg-[#f3ecdc] p-4">
              <p className="font-bold">{selectedPerson.firstName} {selectedPerson.lastName}</p>
              <p className="mt-1 text-xs text-slate-500">
                {selectedPerson.documentType}-{selectedPerson.documentNumber} · {selectedPerson.position}
              </p>
              <p className="mt-2 text-sm font-semibold text-[#725421]">
                {selectedPerson.loginEmail ?? 'Sin correo principal'}
              </p>
            </div>
          )}
          {selectedPerson && !selectedPerson.hasCasaUser && (
            <Field label="Contraseña temporal" wide>
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
            <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
              Esta persona ya tiene una identidad CASA global. Se conservarán
              su correo y contraseña; aquí solo se autoriza esta comunidad.
            </div>
          )}
          {!personnel.some((worker) => worker.canCreateAccess) && (
            <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
              No hay trabajadores elegibles. Vincula personal vigente con
              correo principal desde Núcleo CASA.
            </p>
          )}
        </div>
      )}

      <Field label="Rol operativo" wide>
        <select
          name="roleCode"
          className={inputClass}
          value={selectedRole}
          onChange={(event) => {
            const roleCode = event.target.value;
            setSelectedRole(roleCode);
            const defaultWorkspaces = workspaceDefaultsForRole(roleCode).filter(
              (workspaceCode) => allowedWorkspaceCodes.has(workspaceCode),
            );
            const roleScopes = scopesDefaultsForRole(
              roleCode,
              defaultWorkspaces,
            );
            setSelectedWorkspaceCodes(defaultWorkspaces);
            setSelectedScopes(
              roleScopes.filter((scope) =>
                allowedScopes.some((allowed) => allowed.code === scope),
              ),
            );
          }}
        >
          {roleCatalog.map((role) => <option key={role.code} value={role.code}>{role.label}</option>)}
        </select>
      </Field>

      <fieldset className="mt-6">
        <legend className="flex items-center gap-2 text-sm font-bold">
          Espacios autorizables
          <CircleHelp size={15} className="text-[#9c7532]" />
        </legend>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {allowedWorkspaces.map((workspace) => (
            <label key={workspace.code} className="flex items-start gap-3 rounded-xl border border-[#071a33]/8 bg-white p-3 text-sm">
              <input
                type="checkbox"
                value={workspace.code}
                checked={
                  hasCommunityFullAccess ||
                  selectedWorkspaceCodes.includes(workspace.code)
                }
                onChange={() =>
                  setSelectedWorkspaceCodes((current) =>
                    current.includes(workspace.code)
                      ? current.filter((code) => code !== workspace.code)
                      : [...current, workspace.code],
                  )
                }
                disabled={hasCommunityFullAccess}
                className="mt-0.5 accent-[#071a33]"
              />
              <span><strong className="block">{workspace.label}</strong><span className="mt-1 block text-xs leading-5 text-slate-500">{workspace.description}</span></span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="mt-6">
        <WorkspacePermissionsTree
          accessMode="CUSTOM"
          selectedWorkspaces={effectiveWorkspaceCodes}
          selectedScopes={selectedScopes}
          onToggleWorkspace={() => {
            // Workspace toggle in panel
          }}
          onToggleScope={(scopeCode) =>
            setSelectedScopes((current) =>
              current.includes(scopeCode)
                ? current.filter((code) => code !== scopeCode)
                : [...current, scopeCode],
            )
          }
          onSelectAllInWorkspace={(wsCode, scopeCodes) => {
            setSelectedWorkspaceCodes((current) =>
              Array.from(new Set([...current, wsCode])),
            );
            setSelectedScopes((current) => Array.from(new Set([...current, ...scopeCodes])));
          }}
          onDeselectAllInWorkspace={(wsCode, scopeCodes) => {
            setSelectedWorkspaceCodes((current) =>
              current.filter((code) => code !== wsCode),
            );
            setSelectedScopes((current) => current.filter((code) => !scopeCodes.includes(code)));
          }}
        />
      </div>

      {record && (
        <Field label="Motivo obligatorio del cambio" wide>
          <textarea name="reason" rows={3} className={inputClass} required maxLength={500} />
        </Field>
      )}

      <div className="mt-7 rounded-xl border border-[#d8c28e]/50 bg-[#f3ecdc] p-4 text-xs leading-5 text-[#725421]">
        <ShieldCheck size={17} className="mb-2" />
        CASA validará nuevamente la comunidad, tu autoridad y el alcance solicitado antes de guardar.
      </div>
      <button
        disabled={!record && !selectedPerson?.canCreateAccess}
        className="mt-5 w-full rounded-xl bg-[#071a33] px-5 py-3.5 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-40"
      >
        {record ? 'Guardar cambio auditado' : 'Crear acceso limitado'}
      </button>
    </form>
  );
}

function Field({
  label,
  wide,
  children,
}: {
  label: string;
  wide?: boolean;
  children: ReactNode;
}) {
  return (
    <label className={`${wide ? 'sm:col-span-2' : ''} mt-4 block text-sm font-bold`}>
      {label}
      {children}
    </label>
  );
}
