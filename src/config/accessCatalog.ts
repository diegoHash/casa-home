export const CRUD_CAPABILITIES = ['READ', 'CREATE', 'UPDATE', 'DELETE'] as const;

export type PermissionMap = Record<string, string[]>;

export interface ApplicationAccess {
  applicationKey: string;
  enabled: boolean;
  roleKey: string;
  permissions: PermissionMap;
}

export const POS_APPLICATION = {
  id: 'pos',
  key: 'POS',
  name: 'POS',
  url: 'https://pos.caribbean-one.site',
  modules: [
    { key: 'pos', name: 'Terminal / Ventas', capabilities: ['READ', 'CREATE'] },
    { key: 'cashclose', name: 'Cierre de caja', capabilities: ['READ', 'EXPORT'] },
    { key: 'batches', name: 'Lotes', capabilities: ['READ', 'CREATE', 'UPDATE', 'DELETE'] },
    { key: 'owners', name: 'Propietarios', capabilities: ['READ', 'UPDATE_PHONE', 'RESET_QUOTAS'] },
    { key: 'reports', name: 'Análisis / Reportes', capabilities: ['READ', 'EXPORT', 'REQUEST_CORRECTION', 'DELETE_TRANSACTION'] },
    { key: 'stats', name: 'Estadísticas', capabilities: ['READ'] },
    { key: 'predictive', name: 'Analítica predictiva', capabilities: ['READ'] },
    { key: 'users', name: 'Gestión de usuarios', capabilities: ['READ', 'CREATE', 'UPDATE', 'DELETE', 'ASSIGN_PERMISSIONS'] },
    { key: 'reconciliation', name: 'Conciliación bancaria', capabilities: ['READ', 'EXECUTE', 'EXPORT'] },
    { key: 'logs', name: 'Logs', capabilities: ['READ', 'DELETE'] },
    { key: 'requests', name: 'Solicitudes', capabilities: ['READ', 'APPROVE', 'REJECT', 'EDIT_TRANSACTION'] },
    { key: 'local_db', name: 'Base de datos local', capabilities: ['READ', 'MANAGE_SYNC_QUEUE', 'PURGE_LOCAL_DATA'] },
  ],
} as const;

export const CAC_APPLICATION = {
  id: 'cac', key: 'CAC', name: 'CAC', url: 'https://cac.caribbean-one.site',
  modules: [
    { key: 'dashboard', name: 'Dashboard', capabilities: ['READ'] },
    { key: 'statistics', name: 'Estadísticas', capabilities: ['READ'] },
    { key: 'access', name: 'Acceso', capabilities: ['READ', 'CREATE', 'UPDATE', 'DELETE'] },
    { key: 'reports', name: 'Reportes', capabilities: ['READ', 'EXPORT', 'UPDATE', 'DELETE'] },
    { key: 'authorizations', name: 'Autorizaciones', capabilities: ['READ', 'CREATE', 'UPDATE', 'DELETE'] },
    { key: 'families', name: 'Familiares', capabilities: ['READ', 'CREATE', 'UPDATE', 'DELETE'] },
    { key: 'users', name: 'Usuarios', capabilities: ['READ', 'CREATE', 'UPDATE', 'DELETE', 'ASSIGN_PERMISSIONS'] },
  ],
} as const;

export const ROLE_TEMPLATES: Record<string, PermissionMap> = {
  CAJERO: {
    pos: ['READ', 'CREATE'], cashclose: ['READ'], batches: ['READ'], owners: ['READ'], reports: ['READ'],
  },
  OBSERVADOR: {
    pos: ['READ'], cashclose: ['READ'], batches: ['READ'], owners: ['READ'], reports: ['READ'], stats: ['READ'], predictive: ['READ'],
  },
  ADMIN: {},
  ROOT: Object.fromEntries(POS_APPLICATION.modules.map(module => [module.key, [...module.capabilities]])),
};

export const CAC_ROLE_TEMPLATES: Record<string, PermissionMap> = {
  OS: { dashboard: ['READ'], access: ['READ', 'CREATE'], authorizations: ['READ'], families: ['READ'] },
  SUPERVISOR: Object.fromEntries(CAC_APPLICATION.modules.map(module => [module.key, ['READ']])),
  ROOT: Object.fromEntries(CAC_APPLICATION.modules.map(module => [module.key, [...module.capabilities]])),
};

export function roleTemplate(applicationKey: string, role: string): PermissionMap {
  const templates = applicationKey === 'CAC' ? CAC_ROLE_TEMPLATES : ROLE_TEMPLATES;
  return templates[role] ? structuredClone(templates[role]) : {};
}

