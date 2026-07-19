import { useEffect, useMemo, useState } from 'react';
import { Link, Navigate, Route, Routes, useNavigate } from 'react-router-dom';

import './index.css';
import { HeroSection } from '@/components/blocks/hero-section-5';
import Login from './pages/Login';
import OwnerLogin from './pages/OwnerLogin';
import OwnerPortal from './pages/OwnerPortal';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import Conferences from './pages/Conferences';
import DemoRequest from './pages/DemoRequest';
import { CAC_APPLICATION, POS_APPLICATION, roleTemplate, ROLE_TEMPLATES, type PermissionMap } from './config/accessCatalog';
import { RootSession } from './services/RootSession';
import {
  Activity,
  AppWindow,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  FileText,
  Gauge,
  KeyRound,
  LogOut,
  Pencil,
  Search,
  Shield,
  ToggleLeft,
  ToggleRight,
  Trash2,
  UserPlus,
  Users,
  X,
} from 'lucide-react';

type AdminModule = 'overview' | 'users' | 'apps' | 'roles' | 'audit' | 'security' | 'legal';

const isLocal = window.location.hostname === 'localhost' || window.location.hostname.startsWith('192.168');
const SUPER_ADMIN_API_URL = import.meta.env.VITE_SUPER_ADMIN_API_URL || (isLocal
  ? 'http://localhost:9591/api'
  : 'https://admin.caribbean-one.site/api');
const USERS_PER_PAGE = 8;

interface DashboardUser {
  id?: number;
  operatorName: string;
  username: string;
  role: string;
  originApp: string;
  permissions?: string | PermissionMap | null;
  status: 'active' | 'disabled' | 'locked' | 'demo';
}

interface CreateUserForm {
  username: string;
  operatorName: string;
  email: string;
  password: string;
  role: string;
  originApp: string;
  permissions: PermissionMap;
}

const emptyCreateUserForm: CreateUserForm = {
  username: '',
  operatorName: '',
  email: '',
  password: '',
  role: 'CAJERO',
  originApp: 'POS',
  permissions: ROLE_TEMPLATES.CAJERO,
};

const applicationTabs = [
  { key: 'POS', name: 'POS', description: 'Punto de venta', icon: '📊' },
  { key: 'CAC', name: 'CAC', description: 'Control de Acceso', icon: '🛡️' },
] as const;

const apps = [
  {
    id: 'cac',
    title: 'Control de Acceso',
    desc: 'Gestión de ingresos y control vehicular',
    icon: '\u{1F6E1}\u{FE0F}',
    url: isLocal ? 'http://localhost:5175' : 'https://cac.caribbean-one.site',
    status: 'Activo',
    health: '99.9%',
  },
  {
    id: 'pos',
    title: 'Gestión POS',
    desc: 'Punto de venta y módulo de administración',
    icon: '\u{1F4CA}',
    url: isLocal ? 'http://localhost:5174' : 'https://pos.caribbean-one.site',
    status: 'Activo',
    health: '99.7%',
  },
];

const fallbackUserRows: DashboardUser[] = [
  { operatorName: 'Diego Sumoza', username: 'root', role: 'ROOT', originApp: 'Todas', permissions: 'users:admin,apps:admin,audit:read', status: 'demo' },
  { operatorName: 'Supervisor POS', username: 'supervisor.pos', role: 'CAJERO', originApp: 'POS', permissions: 'sales:read,sales:create', status: 'demo' },
  { operatorName: 'Acceso Principal', username: 'acceso.main', role: 'OBSERVADOR', originApp: 'CAC', permissions: 'access:read', status: 'demo' },
];

const auditRows = [
  { action: 'Inicio de sesión root', actor: 'root', time: 'Hace 2 min' },
  { action: 'Token SSO generado', actor: 'root', time: 'Hace 4 min' },
  { action: 'Consulta de aplicaciones', actor: 'root', time: 'Hace 8 min' },
];

function parsePermissions(value?: string | PermissionMap | null) {
  if (value && typeof value === 'object') {
    return Object.entries(value).flatMap(([module, capabilities]) => capabilities.map(capability => `${module}:${capability}`));
  }
  if (!value) return ['Sin permisos explícitos'];

  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) return parsed.map(String);
    if (typeof parsed === 'object' && parsed !== null) return Object.keys(parsed);
  } catch {
    // The current table may store permissions as comma-separated text.
  }

  return value.split(/[,\n;]/).map(item => item.trim()).filter(Boolean);
}

function statusLabel(status: DashboardUser['status']) {
  if (status === 'disabled') return 'Desactivado';
  if (status === 'locked') return 'Bloqueado';
  if (status === 'demo') return 'Demo';
  return 'Activo';
}

function UserTableSkeletonRows() {
  return (
    <>
      {Array.from({ length: 6 }).map((_, index) => (
        <tr key={`user-skeleton-${index}`} className="border-t border-white/8 align-top">
          <td className="px-5 py-4"><div className="h-4 w-32 animate-pulse rounded bg-white/10" /></td>
          <td className="px-5 py-4"><div className="h-4 w-40 animate-pulse rounded bg-white/10" /></td>
          <td className="px-5 py-4"><div className="h-6 w-20 animate-pulse rounded-md bg-cyan-400/10" /></td>
          <td className="px-5 py-4">
            <div className="flex gap-2">
              <div className="h-6 w-24 animate-pulse rounded-md bg-white/10" />
              <div className="h-6 w-20 animate-pulse rounded-md bg-white/10" />
              <div className="h-6 w-16 animate-pulse rounded-md bg-white/10" />
            </div>
          </td>
          <td className="px-5 py-4"><div className="h-4 w-14 animate-pulse rounded bg-white/10" /></td>
          <td className="px-5 py-4"><div className="h-6 w-20 animate-pulse rounded-full bg-white/10" /></td>
          <td className="px-5 py-4">
            <div className="ml-auto flex justify-end gap-2">
              <div className="h-9 w-24 animate-pulse rounded-lg bg-white/10" />
              <div className="h-9 w-24 animate-pulse rounded-lg bg-white/10" />
            </div>
          </td>
        </tr>
      ))}
    </>
  );
}

function PublicDocumentLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <header className="fixed left-0 right-0 top-0 z-50 border-b border-white/10 bg-[#0a0a0a]/85 backdrop-blur-xl">
        <nav className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4 text-sm text-white/70">
          <Link to="/" className="font-semibold text-white">CASA</Link>
          <div className="flex items-center gap-5">
            <Link to="/privacy" className="transition hover:text-white">Política de privacidad</Link>
            <Link to="/terms" className="transition hover:text-white">Términos y condiciones</Link>
            <Link to="/login" className="rounded-md border border-white/15 px-3 py-2 text-white transition hover:border-white/40">
              Iniciar sesión
            </Link>
          </div>
        </nav>
      </header>
      {children}
    </div>
  );
}

function OverviewModule({ users, usersSource, ssoToken }: { users: DashboardUser[]; usersSource: 'api' | 'demo'; ssoToken: string }) {
  return (
    <>
      <section className="mb-6 grid gap-4 md:grid-cols-3">
        {[
          { label: 'Aplicaciones activas', value: '2', tone: 'text-cyan-300' },
          { label: usersSource === 'api' ? 'Usuarios reales' : 'Usuarios demo', value: String(users.length), tone: 'text-emerald-300' },
          { label: 'Eventos auditados', value: '128', tone: 'text-amber-300' },
        ].map(card => (
          <div key={card.label} className="rounded-lg border border-white/10 bg-white/[0.04] p-5">
            <p className="text-sm text-white/50">{card.label}</p>
            <p className={`mt-3 text-3xl font-semibold ${card.tone}`}>{card.value}</p>
          </div>
        ))}
      </section>

      <section className="mb-6 grid gap-4 xl:grid-cols-2">
        {apps.map(app => {
          const finalUrl = ssoToken ? `${app.url}?sso=${ssoToken}` : app.url;
          return (
            <a
              key={app.id}
              href={finalUrl}
              className="group rounded-lg border border-white/10 bg-[#0d1320] p-5 text-white transition hover:border-cyan-300/60 hover:bg-[#111a2b]"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-white/8 text-2xl">{app.icon}</div>
                  <div>
                    <h3 className="text-lg font-semibold">{app.title}</h3>
                    <p className="mt-1 text-sm leading-6 text-white/55">{app.desc}</p>
                  </div>
                </div>
                <ArrowUpRight className="text-white/40 transition group-hover:text-cyan-300" size={20} />
              </div>
              <div className="mt-5 flex gap-3 text-xs text-white/55">
                <span className="rounded-md bg-emerald-400/10 px-2 py-1 text-emerald-300">{app.status}</span>
                <span className="rounded-md bg-white/5 px-2 py-1">Salud {app.health}</span>
              </div>
            </a>
          );
        })}
      </section>

      <section className="rounded-lg border border-white/10 bg-[#0d1320]">
        <div className="border-b border-white/10 px-5 py-4">
          <h3 className="font-semibold">Auditoría reciente</h3>
        </div>
        <div className="divide-y divide-white/8">
          {auditRows.map(row => (
            <div key={`${row.action}-${row.time}`} className="px-5 py-4">
              <p className="text-sm text-white">{row.action}</p>
              <p className="mt-1 text-xs text-white/45">{row.actor} · {row.time}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

function UsersModule({
  users,
  usersSource,
  usersLoadState,
  usersLoadMessage,
  searchTerm,
  setSearchTerm,
  statusMessage,
  updatingUserId,
  createUserForm,
  setCreateUserForm,
  createUserMessage,
  creatingUser,
  onCreateUser,
  onToggleStatus,
  editingUser,
  onStartEdit,
  onCancelEdit,
  onUpdateUser,
  onDeleteUser,
}: {
  users: DashboardUser[];
  usersSource: 'api' | 'demo';
  usersLoadState: 'idle' | 'loading' | 'loaded' | 'error';
  usersLoadMessage: string;
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  statusMessage: string;
  updatingUserId: number | null;
  createUserForm: CreateUserForm;
  setCreateUserForm: React.Dispatch<React.SetStateAction<CreateUserForm>>;
  createUserMessage: string;
  creatingUser: boolean;
  onCreateUser: (event: React.FormEvent<HTMLFormElement>) => void;
  onToggleStatus: (user: DashboardUser) => void;
  editingUser: DashboardUser | null;
  onStartEdit: (user: DashboardUser) => void;
  onCancelEdit: () => void;
  onUpdateUser: (event: React.FormEvent<HTMLFormElement>) => void;
  onDeleteUser: (user: DashboardUser) => void;
}) {
  const [page, setPage] = useState(1);
  const [activeApplication, setActiveApplication] = useState<'POS' | 'CAC'>('POS');
  const applicationCatalog = activeApplication === 'CAC' ? CAC_APPLICATION : POS_APPLICATION;
  const availableRoles = activeApplication === 'CAC'
    ? ['OS', 'SUPERVISOR']
    : ['CAJERO', 'OBSERVADOR', 'ADMIN', 'ROOT'];

  const filteredUsers = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    return users.filter(user => (user.originApp === activeApplication || user.originApp === 'Todas') && [
      user.operatorName,
      user.username,
      user.role,
      user.originApp,
      parsePermissions(user.permissions).join(' '),
      statusLabel(user.status),
    ].some(value => value.toLowerCase().includes(query)));
  }, [activeApplication, searchTerm, users]);

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / USERS_PER_PAGE));
  const currentPage = Math.min(page, totalPages);
  const visibleUsers = filteredUsers.slice((currentPage - 1) * USERS_PER_PAGE, currentPage * USERS_PER_PAGE);

  useEffect(() => {
    setPage(1);
  }, [activeApplication, searchTerm, users.length]);

  useEffect(() => {
    if (editingUser) {
      setActiveApplication(editingUser.originApp as 'POS' | 'CAC');
    }
  }, [editingUser]);

  const selectApplication = (application: 'POS' | 'CAC') => {
    const role = application === 'CAC' ? 'OS' : 'CAJERO';
    setActiveApplication(application);
    setCreateUserForm(current => ({ ...current, originApp: application, role, permissions: roleTemplate(application, role) }));
  };

  return (
    <section className="space-y-5">
      <div className="flex max-w-full gap-1 overflow-x-auto border-b border-white/10 px-1 pt-1" role="tablist" aria-label="Usuarios por aplicación">
        {applicationTabs.map(tab => {
          const active = activeApplication === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => selectApplication(tab.key)}
              className={`relative shrink-0 rounded-t-xl border border-b-0 px-4 py-3 text-left transition ${
                active ? 'border-cyan-300/30 bg-[#0b1422] text-white shadow-[0_-8px_24px_rgba(0,210,255,0.06)]' : 'border-transparent text-white/45 hover:bg-white/5 hover:text-white/75'
              }`}
            >
              <span className="mr-2">{tab.icon}</span><span className="text-sm font-semibold">{tab.name}</span>
              <span className="ml-2 text-xs text-white/40">{tab.description}</span>
              {active && <span className="absolute inset-x-0 -bottom-px h-px bg-[#0b1422]" />}
            </button>
          );
        })}
      </div>
      <form onSubmit={editingUser ? onUpdateUser : onCreateUser} className="rounded-lg border border-cyan-300/15 bg-[#0b1422] p-5 shadow-[0_20px_80px_rgba(0,0,0,0.25)]">
        <div className="mb-5 flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <div className="flex items-center gap-2 text-cyan-200">
              {editingUser ? <Pencil size={18} /> : <UserPlus size={18} />}
              <h3 className="font-semibold text-white">
                {editingUser ? `Editar usuario: @${editingUser.username}` : 'Crear usuario'}
              </h3>
            </div>
            <p className="mt-2 text-sm leading-6 text-white/50">
              {editingUser
                ? `Actualiza el rol y los permisos de este usuario en ${editingUser.originApp}.`
                : 'Registra usuarios reales en `caribbean_one_users` y define desde aqui su rol, permisos y aplicacion de origen.'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {editingUser && (
              <button
                type="button"
                onClick={onCancelEdit}
                className="inline-flex items-center justify-center rounded-lg border border-white/15 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                <X size={16} className="mr-1.5" />
                Cancelar
              </button>
            )}
            <button
              type="submit"
              disabled={creatingUser || usersSource !== 'api'}
              className="inline-flex items-center justify-center rounded-lg bg-cyan-300 px-4 py-2 text-sm font-semibold text-[#06111f] transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:bg-white/15 disabled:text-white/35"
            >
              {creatingUser ? 'Procesando...' : editingUser ? 'Guardar cambios' : 'Crear usuario'}
            </button>
          </div>
        </div>

        {createUserMessage && (
          <div className={`mb-4 rounded-lg border px-4 py-3 text-sm ${
            createUserMessage.toLowerCase().includes('correctamente')
              ? 'border-emerald-400/20 bg-emerald-400/10 text-emerald-200'
              : 'border-amber-400/20 bg-amber-400/10 text-amber-100'
          }`}>
            {createUserMessage}
          </div>
        )}

        {usersSource !== 'api' && (
          <div className="mb-4 rounded-lg border border-amber-400/20 bg-amber-400/10 px-4 py-3 text-sm text-amber-100">
            Conecta el panel al API con una sesion root valida para habilitar la creacion de usuarios.
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <label className="space-y-2 text-sm">
            <span className="text-white/60">Usuario</span>
            <input
              value={createUserForm.username}
              onChange={event => setCreateUserForm(current => ({ ...current, username: event.target.value }))}
              placeholder="usuario.login"
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white outline-none transition placeholder:text-white/25 focus:border-cyan-300/60 disabled:cursor-not-allowed disabled:opacity-50"
              required
              minLength={3}
              disabled={!!editingUser}
            />
          </label>

          {!editingUser && (
            <>
              <label className="space-y-2 text-sm">
                <span className="text-white/60">Nombre completo</span>
                <input
                  value={createUserForm.operatorName}
                  onChange={event => setCreateUserForm(current => ({ ...current, operatorName: event.target.value }))}
                  placeholder="Nombre del operador"
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white outline-none transition placeholder:text-white/25 focus:border-cyan-300/60"
                  required
                  minLength={2}
                />
              </label>

              <label className="space-y-2 text-sm">
                <span className="text-white/60">Correo electronico</span>
                <input
                  type="email"
                  value={createUserForm.email}
                  onChange={event => setCreateUserForm(current => ({ ...current, email: event.target.value }))}
                  placeholder="usuario@caribbean-one.site"
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white outline-none transition placeholder:text-white/25 focus:border-cyan-300/60"
                  required
                />
              </label>

              <label className="space-y-2 text-sm">
                <span className="text-white/60">PIN o contrasena</span>
                <input
                  type="password"
                  value={createUserForm.password}
                  onChange={event => setCreateUserForm(current => ({ ...current, password: event.target.value }))}
                  placeholder="Minimo 4 caracteres"
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white outline-none transition placeholder:text-white/25 focus:border-cyan-300/60"
                  required
                  minLength={4}
                />
              </label>
            </>
          )}

          <label className="space-y-2 text-sm">
            <span className="text-white/60">Rol</span>
            <select
              value={createUserForm.role}
              onChange={event => {
                const role = event.target.value;
                setCreateUserForm(current => ({ ...current, role, permissions: roleTemplate(current.originApp, role) }));
              }}
              className="w-full rounded-lg border border-white/10 bg-[#101827] px-3 py-2 text-white outline-none transition focus:border-cyan-300/60"
            >
              {availableRoles.map(role => <option key={role} value={role}>{role}</option>)}
            </select>
          </label>

          <label className="space-y-2 text-sm">
            <span className="text-white/60">Aplicacion</span>
            <select
              value={createUserForm.originApp}
              onChange={event => selectApplication(event.target.value as 'POS' | 'CAC')}
              className="w-full rounded-lg border border-white/10 bg-[#101827] px-3 py-2 text-white outline-none transition focus:border-cyan-300/60 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={!!editingUser}
            >
              <option value="POS">POS</option>
              <option value="CAC">CAC</option>
            </select>
          </label>

          {(createUserForm.originApp === 'POS' || createUserForm.originApp === 'CAC') && <fieldset className="space-y-3 md:col-span-2 xl:col-span-4">
            <legend className="text-sm text-white/60">Módulos y capacidades efectivas</legend>
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {applicationCatalog.modules.map(module => (
                <div key={module.key} className="rounded-lg border border-white/10 bg-white/[0.03] p-3">
                  <p className="mb-2 text-sm font-medium text-white">{module.name}</p>
                  <div className="flex flex-wrap gap-2">
                    {module.capabilities.map(capability => {
                      const checked = createUserForm.permissions[module.key]?.includes(capability) ?? false;
                      return (
                        <label key={capability} className="flex cursor-pointer items-center gap-1.5 rounded-md bg-white/5 px-2 py-1 text-xs text-white/65">
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => setCreateUserForm(current => {
                              const selected = current.permissions[module.key] ?? [];
                              const next = checked ? selected.filter(item => item !== capability) : [...selected, capability];
                              const permissions = { ...current.permissions, [module.key]: next };
                              if (!next.length) delete permissions[module.key];
                              return { ...current, permissions };
                            })}
                            className="accent-cyan-300"
                          />
                          {capability}
                        </label>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </fieldset>}
        </div>
      </form>

      <div className="rounded-lg border border-white/10 bg-[#0d1320]">
      <div className="flex flex-col gap-4 border-b border-white/10 px-5 py-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <h3 className="font-semibold">Usuarios</h3>
          <p className="mt-1 text-sm text-white/45">Todos los usuarios registrados en `caribbean_one_users`, con rol, permisos, aplicación, estatus y control operativo.</p>
        </div>
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white/60">
            <Search size={16} />
            <input
              value={searchTerm}
              onChange={event => setSearchTerm(event.target.value)}
              placeholder="Buscar por usuario, nombre, rol o app"
              className="w-full min-w-0 bg-transparent text-sm text-white outline-none placeholder:text-white/35 md:w-72"
            />
          </div>
          <span className={`w-fit rounded-md px-2 py-1 text-xs ${usersSource === 'api' ? 'bg-emerald-400/10 text-emerald-300' : 'bg-amber-400/10 text-amber-300'}`}>
            {usersLoadState === 'loading' ? 'Cargando API' : usersSource === 'api' ? 'Conectado al API' : 'Modo demo'}
          </span>
        </div>
      </div>

      {usersLoadMessage && (
        <div className={`border-b border-white/10 px-5 py-3 text-sm ${usersLoadState === 'error' ? 'bg-rose-400/10 text-rose-200' : 'bg-white/[0.03] text-cyan-200'}`}>
          {usersLoadMessage}
        </div>
      )}

      {statusMessage && (
        <div className="border-b border-white/10 bg-white/[0.03] px-5 py-3 text-sm text-cyan-200">
          {statusMessage}
        </div>
      )}

      <div className="max-w-full overflow-x-auto overscroll-x-contain [-webkit-overflow-scrolling:touch]">
        <table className="w-full min-w-[1100px] text-left text-sm">
          <thead className="text-white/45">
            <tr>
              <th className="px-5 py-3 font-medium">Usuario</th>
              <th className="px-5 py-3 font-medium">Nombre</th>
              <th className="px-5 py-3 font-medium">Rol</th>
              <th className="px-5 py-3 font-medium">Permisos</th>
              <th className="px-5 py-3 font-medium">Aplicación</th>
              <th className="px-5 py-3 font-medium">Estatus</th>
              <th className="px-5 py-3 text-right font-medium">Control</th>
            </tr>
          </thead>
          <tbody>
            {usersLoadState === 'loading' ? (
              <UserTableSkeletonRows />
            ) : visibleUsers.map(user => {
              const permissions = parsePermissions(user.permissions).slice(0, 4);
              const isDisabled = user.status === 'disabled';
              const canToggle = usersSource === 'api' && typeof user.id === 'number';

              return (
                <tr key={`${user.id ?? user.username}`} className="border-t border-white/8 align-top">
                  <td className="px-5 py-4 font-medium text-white">{user.username}</td>
                  <td className="px-5 py-4 text-white/70">{user.operatorName}</td>
                  <td className="px-5 py-4">
                    <span className="rounded-md bg-cyan-400/10 px-2 py-1 text-xs text-cyan-200">{user.role}</span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex max-w-[320px] flex-wrap gap-1.5">
                      {permissions.map(permission => (
                        <span key={permission} className="rounded-md bg-white/7 px-2 py-1 text-xs text-white/65">{permission}</span>
                      ))}
                    </div>
                  </td>
                  <td className="px-5 py-4 text-white/70">{user.originApp}</td>
                  <td className="px-5 py-4">
                    <span className={`rounded-md px-2 py-1 text-xs ${
                      isDisabled ? 'bg-rose-400/10 text-rose-300' : user.status === 'demo' ? 'bg-amber-400/10 text-amber-300' : 'bg-emerald-400/10 text-emerald-300'
                    }`}>
                      {statusLabel(user.status)}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="inline-flex items-center gap-2">
                      <button
                        type="button"
                        disabled={usersSource !== 'api'}
                        onClick={() => onStartEdit(user)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-cyan-300/30 px-3 py-2 text-xs text-cyan-200 transition hover:bg-cyan-300/10 disabled:cursor-not-allowed disabled:border-white/10 disabled:text-white/30"
                      >
                        <Pencil size={14} />
                        Editar
                      </button>
                      <button
                        type="button"
                        disabled={!canToggle || updatingUserId === user.id}
                        onClick={() => onToggleStatus(user)}
                        className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs transition ${
                          !canToggle
                            ? 'cursor-not-allowed border-white/10 text-white/30'
                            : isDisabled
                              ? 'border-emerald-400/30 text-emerald-300 hover:bg-emerald-400/10'
                              : 'border-rose-400/30 text-rose-300 hover:bg-rose-400/10'
                        }`}
                      >
                        {isDisabled ? <ToggleLeft size={14} /> : <ToggleRight size={14} />}
                        {isDisabled ? 'Activar' : 'Desactivar'}
                      </button>
                      <button
                        type="button"
                        disabled={usersSource !== 'api' || updatingUserId === user.id}
                        onClick={() => onDeleteUser(user)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-rose-400/30 px-3 py-2 text-xs text-rose-300 transition hover:bg-rose-400/10 disabled:cursor-not-allowed disabled:border-white/10 disabled:text-white/30"
                      >
                        <Trash2 size={14} />
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col gap-3 border-t border-white/10 px-5 py-4 text-sm text-white/55 md:flex-row md:items-center md:justify-between">
        <span>
          Mostrando {visibleUsers.length} de {filteredUsers.length} usuarios
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={currentPage <= 1}
            onClick={() => setPage(value => Math.max(1, value - 1))}
            className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-xs text-white transition hover:border-white/30 disabled:cursor-not-allowed disabled:text-white/25"
          >
            <ArrowLeft size={14} />
            Anterior
          </button>
          <span className="rounded-lg bg-white/5 px-3 py-2 text-xs text-white/70">
            Página {currentPage} / {totalPages}
          </span>
          <button
            type="button"
            disabled={currentPage >= totalPages}
            onClick={() => setPage(value => Math.min(totalPages, value + 1))}
            className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-xs text-white transition hover:border-white/30 disabled:cursor-not-allowed disabled:text-white/25"
          >
            Siguiente
            <ArrowRight size={14} />
          </button>
        </div>
      </div>
      </div>
    </section>
  );
}

function Dashboard() {
  const navigate = useNavigate();
  const [ssoToken, setSsoToken] = useState(() => RootSession.token());
  const [activeModule, setActiveModule] = useState<AdminModule>('overview');
  const [users, setUsers] = useState<DashboardUser[]>(fallbackUserRows);
  const [usersSource, setUsersSource] = useState<'api' | 'demo'>('demo');
  const [usersLoadState, setUsersLoadState] = useState<'idle' | 'loading' | 'loaded' | 'error'>('idle');
  const [usersLoadMessage, setUsersLoadMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [updatingUserId, setUpdatingUserId] = useState<number | null>(null);
  const [createUserForm, setCreateUserForm] = useState<CreateUserForm>(emptyCreateUserForm);
  const [createUserMessage, setCreateUserMessage] = useState('');
  const [creatingUser, setCreatingUser] = useState(false);
  const [editingUser, setEditingUser] = useState<DashboardUser | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlToken = params.get('sso');

    if (urlToken) {
      RootSession.save(urlToken, null);
      setSsoToken(urlToken);
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  useEffect(() => {
    if (!ssoToken) {
      setUsersLoadState('error');
      setUsersLoadMessage('No hay token SSO disponible. Inicia sesión de nuevo para consultar usuarios reales.');
      return;
    }

    const controller = new AbortController();

    async function loadUsers() {
      setUsersLoadState('loading');
      setUsersLoadMessage('');

      try {
        const response = await fetch(`${SUPER_ADMIN_API_URL}/users`, {
          headers: {
            Authorization: `Bearer ${ssoToken}`,
          },
          signal: controller.signal,
        });

        if (!response.ok) {
          const payload = await response.json().catch(() => null);
          setUsersLoadState('error');
          setUsersLoadMessage(payload?.message || `El API respondió ${response.status} al consultar usuarios.`);
          return;
        }

        const payload = await response.json();
        const userRows = Array.isArray(payload) ? payload : payload.users ?? payload.data;
        if (Array.isArray(userRows)) {
          setUsers(userRows.map((user: any) => ({
            id: user.id,
            operatorName: user.operatorName || 'Sin nombre',
            username: user.username || 'sin_usuario',
            role: user.role || 'SIN_ROL',
            originApp: user.originApp || 'Sin aplicación',
            permissions: user.permissions,
            status: user.status || 'active',
          })));
          setUsersSource('api');
          setUsersLoadState('loaded');
          setUsersLoadMessage('');
          return;
        }

        setUsersLoadState('error');
        setUsersLoadMessage('La respuesta del API no incluyó una lista de usuarios.');
      } catch (error) {
        if (!controller.signal.aborted) {
          console.warn('No se pudo cargar usuarios del super admin API', error);
          setUsersLoadState('error');
          setUsersLoadMessage('No se pudo conectar con el API de usuarios.');
        }
      }
    }

    loadUsers();

    return () => controller.abort();
  }, [navigate, ssoToken]);

  const handleLogout = () => {
    RootSession.clear();
    navigate('/');
  };

  const handleToggleStatus = async (user: DashboardUser) => {
    if (!user.id || usersSource !== 'api') return;

    const nextStatus = user.status === 'disabled' ? 'active' : 'disabled';
    setUpdatingUserId(user.id);
    setStatusMessage('');

    try {
      const response = await fetch(`${SUPER_ADMIN_API_URL}/users/${user.id}/status`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${ssoToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: nextStatus }),
      });

      const payload = response.status === 204 ? null : await response.json().catch(() => null);

      if (!response.ok) {
        setStatusMessage(payload?.message || 'No se pudo actualizar el estado del usuario.');
        return;
      }

      setUsers(current => current.map(item => item.id === user.id ? { ...item, status: nextStatus } : item));
      setStatusMessage(`Usuario ${nextStatus === 'disabled' ? 'desactivado' : 'activado'} correctamente.`);
    } catch {
      setStatusMessage('No se pudo conectar con el API para actualizar el estado.');
    } finally {
      setUpdatingUserId(null);
    }
  };

  const handleCreateUser = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (usersSource !== 'api') return;
    if (createUserForm.originApp !== 'POS' && createUserForm.originApp !== 'CAC') {
      setCreateUserMessage('La creación de usuarios para la aplicación seleccionada no está habilitada.');
      return;
    }

    setCreatingUser(true);
    setCreateUserMessage('');

    const payload = {
      username: createUserForm.username.trim().toLowerCase(),
      operatorName: createUserForm.operatorName.trim(),
      email: createUserForm.email.trim(),
      password: createUserForm.password,
      role: createUserForm.role,
      originApp: createUserForm.originApp,
      // The POS API accepts permissions as a JSON string, not as a nested object.
      permissions: JSON.stringify(createUserForm.permissions),
    };

    try {
      const response = await fetch(`${SUPER_ADMIN_API_URL}/users`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${ssoToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errText = await response.text().catch(() => '');
        let errMsg = `No se pudo crear el usuario. El API respondió ${response.status}.`;
        try {
          const parsed = JSON.parse(errText);
          if (parsed && (parsed.message || parsed.error)) {
            errMsg = parsed.message || parsed.error;
          }
        } catch {
          if (errText) {
            errMsg = errText;
          }
        }
        setCreateUserMessage(errMsg);
        return;
      }

      const result = await response.json().catch(() => null);

      const created = result?.user;
      if (created) {
        setUsers(current => [{
          id: created.id,
          operatorName: created.operatorName || payload.operatorName,
          username: created.username || payload.username,
          role: created.role || payload.role,
          originApp: created.originApp || payload.originApp,
          permissions: created.permissions ?? payload.permissions,
          status: created.status || 'active',
        }, ...current]);
      }

      setCreateUserForm(emptyCreateUserForm);
      setCreateUserMessage('Usuario creado correctamente.');
      setSearchTerm('');
    } catch {
      setCreateUserMessage('No se pudo conectar con el API para crear el usuario.');
    } finally {
      setCreatingUser(false);
    }
  };

  const handleStartEdit = (user: DashboardUser) => {
    let parsedPermissions: PermissionMap = {};
    if (user.permissions) {
      if (typeof user.permissions === 'object') {
        parsedPermissions = user.permissions as PermissionMap;
      } else {
        try {
          parsedPermissions = JSON.parse(user.permissions);
        } catch {
          // ignore
        }
      }
    }

    setEditingUser(user);
    setCreateUserForm({
      username: user.username,
      operatorName: user.operatorName,
      email: '',
      password: '',
      role: user.role,
      originApp: user.originApp,
      permissions: parsedPermissions,
    });
    setCreateUserMessage('');
  };

  const handleCancelEdit = () => {
    setEditingUser(null);
    setCreateUserForm(emptyCreateUserForm);
    setCreateUserMessage('');
  };

  const handleUpdateUser = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editingUser || !editingUser.id || usersSource !== 'api') return;

    setCreatingUser(true);
    setCreateUserMessage('');

    const payload: Record<string, unknown> = {
      role: createUserForm.role,
      permissions: JSON.stringify(createUserForm.permissions),
    };
    const operatorName = createUserForm.operatorName.trim();
    const email = createUserForm.email.trim();
    if (operatorName) payload.operatorName = operatorName;
    if (email) payload.email = email;
    if (createUserForm.originApp === 'POS' || createUserForm.originApp === 'CAC') {
      payload.originApp = createUserForm.originApp;
    }

    try {
      const response = await fetch(`${SUPER_ADMIN_API_URL}/users/${editingUser.id}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${ssoToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errText = await response.text().catch(() => '');
        let errMsg = `No se pudo actualizar el usuario. El API respondió ${response.status}.`;
        try {
          const parsed = JSON.parse(errText);
          if (parsed && (parsed.message || parsed.error)) {
            errMsg = parsed.message || parsed.error;
          }
        } catch {
          if (errText) {
            errMsg = errText;
          }
        }
        setCreateUserMessage(errMsg);
        return;
      }

      const result = await response.json().catch(() => null);
      const updated = result?.user;

      setUsers(current => current.map(item => item.id === editingUser.id ? {
        ...item,
        operatorName: updated?.operatorName || item.operatorName,
        role: updated?.role || createUserForm.role,
        originApp: updated?.originApp || item.originApp,
        permissions: updated?.permissions ?? createUserForm.permissions,
        status: updated?.status || item.status,
      } : item));

      setEditingUser(null);
      setCreateUserForm(emptyCreateUserForm);
      setCreateUserMessage('Usuario actualizado correctamente.');
      setSearchTerm('');
    } catch {
      setCreateUserMessage('No se pudo conectar con el API para actualizar el usuario.');
    } finally {
      setCreatingUser(false);
    }
  };

  const handleDeleteUser = async (user: DashboardUser) => {
    if (!user.id || usersSource !== 'api') return;
    if (!window.confirm(`¿Estás seguro de que deseas eliminar permanentemente al usuario ${user.username}?`)) return;

    setStatusMessage('');
    setUpdatingUserId(user.id);

    try {
      const response = await fetch(`${SUPER_ADMIN_API_URL}/users/${user.id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${ssoToken}`,
        },
      });

      if (!response.ok) {
        const errText = await response.text().catch(() => '');
        let errMsg = `No se pudo eliminar el usuario. El API respondió ${response.status}.`;
        try {
          const parsed = JSON.parse(errText);
          if (parsed && (parsed.message || parsed.error)) {
            errMsg = parsed.message || parsed.error;
          }
        } catch {
          if (errText) {
            errMsg = errText;
          }
        }
        setStatusMessage(errMsg);
        return;
      }

      setUsers(current => current.filter(item => item.id !== user.id));
      setStatusMessage('Usuario eliminado correctamente.');
    } catch {
      setStatusMessage('No se pudo conectar con el API para eliminar el usuario.');
    } finally {
      setUpdatingUserId(null);
    }
  };

  const menuItems = [
    { id: 'overview' as const, label: 'Panel general', icon: Gauge },
    { id: 'apps' as const, label: 'Aplicaciones', icon: AppWindow },
    { id: 'users' as const, label: 'Usuarios', icon: Users },
    { id: 'roles' as const, label: 'Roles y permisos', icon: KeyRound },
    { id: 'audit' as const, label: 'Auditoría', icon: Activity },
    { id: 'security' as const, label: 'Seguridad', icon: Shield },
    { id: 'legal' as const, label: 'Documentos legales', icon: FileText },
  ];

  return (
    <div className="super-admin-light min-h-screen max-w-full overflow-x-hidden bg-[#f8f6f1] text-[#0b1d33]">
      <style dangerouslySetInnerHTML={{ __html: `
        .super-admin-light {
          background: #f8f6f1;
          color: #0b1d33;
        }
        .super-admin-light aside,
        .super-admin-light form,
        .super-admin-light section,
        .super-admin-light [class*="bg-[#0d1320]"],
        .super-admin-light [class*="bg-[#0b1422]"],
        .super-admin-light [class*="bg-[#0b0f19]"],
        .super-admin-light [class*="bg-[#101827]"] {
          background: #ffffff !important;
          border-color: rgba(11, 29, 51, 0.1) !important;
          color: #0b1d33 !important;
          box-shadow: 0 18px 50px rgba(8, 29, 51, 0.06);
        }
        .super-admin-light [class*="text-white"] {
          color: #0b1d33 !important;
        }
        .super-admin-light [class*="text-cyan"],
        .super-admin-light [class*="text-amber"] {
          color: #b08a3c !important;
        }
        .super-admin-light [class*="text-white/"],
        .super-admin-light [class*="text-slate"] {
          color: #64748b !important;
        }
        .super-admin-light [class*="border-white"],
        .super-admin-light [class*="border-cyan"] {
          border-color: rgba(11, 29, 51, 0.1) !important;
        }
        .super-admin-light [class*="bg-white/"],
        .super-admin-light [class*="bg-white["] {
          background: #f8f6f1 !important;
        }
        .super-admin-light [class*="bg-cyan"],
        .super-admin-light [class*="bg-amber"] {
          background: rgba(176, 138, 60, 0.14) !important;
          color: #8a6a25 !important;
        }
        .super-admin-light [class*="bg-emerald"] {
          background: #ecfdf5 !important;
          color: #047857 !important;
        }
        .super-admin-light [class*="bg-rose"] {
          background: #fff1f2 !important;
          color: #be123c !important;
        }
        .super-admin-light input,
        .super-admin-light select {
          background: #fbfaf7 !important;
          border-color: #e2e8f0 !important;
          color: #0b1d33 !important;
        }
        .super-admin-light input::placeholder {
          color: #94a3b8 !important;
        }
        .super-admin-light button:hover {
          border-color: rgba(176, 138, 60, 0.45) !important;
        }
        .super-admin-light aside button[class*="bg-white"],
        .super-admin-light nav button[class*="bg-white"] {
          background: #0b1d33 !important;
          color: #ffffff !important;
        }
        .super-admin-light button[type="submit"] {
          background: #0b1d33 !important;
          color: #ffffff !important;
        }
      ` }} />
      <div className="flex min-h-screen">
        <aside className="hidden w-72 shrink-0 border-r border-white/10 bg-[#0b0f19] px-5 py-6 lg:block">
          <div className="mb-10">
            <p className="text-xs uppercase tracking-[0.2em] text-cyan-300/80">CASA</p>
            <h1 className="mt-2 text-xl font-semibold">Super Admin</h1>
          </div>

          <nav className="space-y-1 text-sm">
            {menuItems.map(item => {
              const Icon = item.icon;
              const active = activeModule === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveModule(item.id)}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition ${
                    active ? 'bg-white text-[#07090f]' : 'text-white/65 hover:bg-white/8 hover:text-white'
                  }`}
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </aside>

        <main className="min-w-0 flex-1 px-4 py-5 sm:px-5 sm:py-6 md:px-8 lg:px-10">
          <nav className="mb-6 flex gap-2 overflow-x-auto pb-2 lg:hidden" aria-label="Navegación del Super Admin">
            {menuItems.map(item => {
              const Icon = item.icon;
              const active = activeModule === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveModule(item.id)}
                  className={`inline-flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-xs transition ${
                    active ? 'bg-white text-[#07090f]' : 'border border-white/10 text-white/65'
                  }`}
                >
                  <Icon size={15} />
                  {item.label}
                </button>
              );
            })}
          </nav>
          <header className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm text-cyan-300">Sesión root activa</p>
              <h2 className="mt-1 text-3xl font-semibold tracking-normal">
                {activeModule === 'users' ? 'Gestión de usuarios' : 'Administración del ecosistema'}
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-white/55">
                {activeModule === 'users'
                  ? 'Consulta, filtra y administra los usuarios registrados en la base de datos del ecosistema.'
                  : 'Control central para aplicaciones, usuarios, permisos, sesiones y actividad operativa.'}
              </p>
            </div>

            <button
              onClick={handleLogout}
              className="inline-flex w-fit items-center gap-2 rounded-lg border border-white/15 px-4 py-2 text-sm text-white transition hover:border-white/40"
            >
              <LogOut size={16} />
              Cerrar sesión
            </button>
          </header>

          {activeModule === 'users' ? (
            <UsersModule
              users={users}
              usersSource={usersSource}
              usersLoadState={usersLoadState}
              usersLoadMessage={usersLoadMessage}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              statusMessage={statusMessage}
              updatingUserId={updatingUserId}
              createUserForm={createUserForm}
              setCreateUserForm={setCreateUserForm}
              createUserMessage={createUserMessage}
              creatingUser={creatingUser}
              onCreateUser={handleCreateUser}
              onToggleStatus={handleToggleStatus}
              editingUser={editingUser}
              onStartEdit={handleStartEdit}
              onCancelEdit={handleCancelEdit}
              onUpdateUser={handleUpdateUser}
              onDeleteUser={handleDeleteUser}
            />
          ) : (
            <OverviewModule users={users} usersSource={usersSource} ssoToken={ssoToken} />
          )}
        </main>
      </div>
    </div>
  );
}

function App() {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const recoveryToken = params.get('recoveryToken');
    if (recoveryToken && window.location.pathname !== '/staff-login') {
      navigate(`/staff-login?recoveryToken=${encodeURIComponent(recoveryToken)}`, { replace: true });
    }
  }, [navigate]);

  return (
    <Routes>
      <Route path="/" element={<HeroSection onLoginClick={() => navigate('/login')} />} />
      <Route path="/login" element={<OwnerLogin />} />
      <Route path="/portal" element={<OwnerPortal />} />
      <Route path="/staff-login" element={<Login />} />
      <Route path="/dashboard" element={<RootOnlyRoute><Dashboard /></RootOnlyRoute>} />
      <Route path="/settings" element={<RootOnlyRoute><Dashboard /></RootOnlyRoute>} />
      <Route path="/privacy" element={<PublicDocumentLayout><PrivacyPolicy /></PublicDocumentLayout>} />
      <Route path="/terms" element={<PublicDocumentLayout><TermsOfService /></PublicDocumentLayout>} />
      <Route path="/conferencias" element={<Conferences />} />
      <Route path="/conferencias/:roomId" element={<Conferences />} />
      <Route path="/solicitar-demo" element={<DemoRequest />} />
    </Routes>
  );
}

function RootOnlyRoute({ children }: { children: React.ReactNode }) {
  const urlToken = new URLSearchParams(window.location.search).get('sso');
  if (urlToken && !RootSession.token()) RootSession.save(urlToken, null);
  const token = RootSession.token();
  const locallyRoot = RootSession.isRoot();

  if (!token || !locallyRoot) {
    RootSession.clear();
    return <Navigate to="/staff-login" replace state={{ reason: 'root-required' }} />;
  }
  return children;
}

export default App;
