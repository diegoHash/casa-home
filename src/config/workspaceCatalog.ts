export const workspaceCatalog = [
  {
    code: 'ADMINISTRATION',
    label: 'Administración',
    description: 'Estructura, inmuebles, personas, tesorería y operación administrativa.',
  },
  {
    code: 'ACCOUNTING',
    label: 'Contabilidad',
    description: 'Plan de cuentas, asientos de doble partida, períodos contables y estados financieros.',
  },
  {
    code: 'PURCHASES',
    label: 'Compras',
    description: 'Solicitudes, cotizaciones, órdenes y seguimiento de compras.',
  },
  {
    code: 'OWNER_SERVICE',
    label: 'Atención al propietario',
    description: 'Solicitudes, incidencias y comunicaciones de la comunidad.',
  },
  {
    code: 'COLLECTIONS',
    label: 'Gestión de cobranza',
    description: 'Seguimiento de cartera, compromisos y gestiones de cobro.',
  },
  {
    code: 'CONTROL_PRINCIPAL',
    label: 'Control principal y accesos',
    description: 'Ingresos, autorizaciones, novedades y operación del control.',
  },
  {
    code: 'WRISTBANDS',
    label: 'Brazaletes',
    description: 'Venta, activación, entrega, reposición e inventario.',
  },
  {
    code: 'BOARD',
    label: 'Junta de condominio',
    description: 'Gobierno, supervisión, decisiones y acuerdos comunitarios.',
  },
] as const;

export type WorkspaceCode = (typeof workspaceCatalog)[number]['code'];

export function workspaceLabel(code: string) {
  return workspaceCatalog.find((workspace) => workspace.code === code)?.label ??
    code;
}
