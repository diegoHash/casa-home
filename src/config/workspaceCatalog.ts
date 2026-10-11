export const workspaceCatalog = [
  {
    code: 'ADMINISTRATION',
    label: 'Administración',
    description: 'Estructura, personas, tesorería y operación administrativa.',
    enabled: true,
  },
  {
    code: 'ACCOUNTING',
    label: 'Contabilidad',
    description: 'Plan de cuentas, tesorería, métodos de pago, períodos contables y estados financieros.',
    enabled: true,
  },
  {
    code: 'PURCHASES',
    label: 'Compras',
    description: 'Solicitudes, cotizaciones, órdenes y seguimiento de compras.',
    enabled: false,
  },
  {
    code: 'OWNER_SERVICE',
    label: 'Atención al propietario',
    description: 'Solicitudes, incidencias y comunicaciones de la comunidad.',
    enabled: true,
  },
  {
    code: 'COLLECTIONS',
    label: 'Gestión de cobranza',
    description: 'Seguimiento de cartera, compromisos y gestiones de cobro.',
    enabled: false,
  },
  {
    code: 'CONTROL_PRINCIPAL',
    label: 'Control principal y accesos',
    description: 'Ingresos, autorizaciones, novedades y operación del control.',
    enabled: true,
  },
  {
    code: 'WRISTBANDS',
    label: 'Brazaletes',
    description: 'Venta, activación, entrega, reposición e inventario.',
    enabled: false,
  },
  {
    code: 'BOARD',
    label: 'Junta de condominio',
    description: 'Gobierno, supervisión, decisiones y acuerdos comunitarios.',
    enabled: false,
  },
] as const;

export type WorkspaceCode = (typeof workspaceCatalog)[number]['code'];

const legacyWorkspaceAliases: Record<string, WorkspaceCode> = {
  TREASURY: 'ACCOUNTING',
};

export function normalizeWorkspaceCode(code: string) {
  const normalized = code.trim().toUpperCase();
  return legacyWorkspaceAliases[normalized] ?? normalized;
}

export function normalizeWorkspaceCodes(codes: string[]) {
  return Array.from(new Set(codes.map(normalizeWorkspaceCode).filter(Boolean)));
}

export function workspaceLabel(code: string) {
  return workspaceCatalog.find((workspace) => workspace.code === normalizeWorkspaceCode(code))?.label ??
    code;
}

export function workspaceIsEnabled(code: string) {
  return workspaceCatalog.find(
    (workspace) => workspace.code === normalizeWorkspaceCode(code),
  )?.enabled ?? false;
}
