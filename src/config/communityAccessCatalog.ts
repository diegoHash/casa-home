import { workspaceCatalog } from './workspaceCatalog';

export const roleCatalog = [
  {
    code: 'ADMINISTRADOR_INTEGRAL',
    label: 'Administrador integral',
    description:
      'Opera todos los espacios de la comunidad sin acceso a CASA Control ni a otros clientes.',
  },
  {
    code: 'ADMINISTRACION',
    label: 'Administración',
    description: 'Gestiona la operación administrativa general de la comunidad.',
  },
  {
    code: 'TESORERIA',
    label: 'Tesorería',
    description: 'Gestiona tesorería y procesos financieros dentro de Contabilidad.',
  },
  {
    code: 'JUNTA',
    label: 'Junta de condominio',
    description: 'Supervisa decisiones, acuerdos y gobierno de la comunidad.',
  },
  {
    code: 'ATENCION',
    label: 'Atención al propietario',
    description: 'Atiende solicitudes, incidencias y comunicaciones.',
  },
  {
    code: 'BRAZALETES',
    label: 'Brazaletes',
    description: 'Opera venta, entrega, activación y control de brazaletes.',
  },
  {
    code: 'OS_CONTROL_PRINCIPAL',
    label: 'O/S Control Principal',
    description: 'Opera accesos, novedades y coordinación del control principal.',
  },
  {
    code: 'LECTURA',
    label: 'Solo consulta',
    description: 'Consulta únicamente la información expresamente autorizada.',
  },
] as const;

const baseScopeCatalog = [
  { code: 'community.full_access', label: 'Acceso integral de la comunidad', workspaceCode: '*', description: 'Acceso total y sin restricciones a todos los espacios y funciones de la comunidad.' },
  
  // Administración
  { code: 'core.read', label: 'Consultar núcleo de administración', workspaceCode: 'ADMINISTRATION', description: 'Permite visualizar el resumen del condominio, inmuebles, personas y junta directiva.' },
  { code: 'core.community.write', label: 'Editar comunidad', workspaceCode: 'ADMINISTRATION', description: 'Permite editar el nombre legal, RIF y datos institucionales del condominio.' },
  { code: 'core.people.write', label: 'Gestionar personas', workspaceCode: 'ADMINISTRATION', description: 'Permite crear y actualizar perfiles de propietarios, residentes y personal.' },
  { code: 'core.properties.write', label: 'Gestionar inmuebles y alícuotas', workspaceCode: 'ADMINISTRATION', description: 'Permite registrar, editar, desactivar y transferir unidades inmobiliarias dentro de la comunidad.' },
  { code: 'core.access.write', label: 'Administrar accesos del personal', workspaceCode: 'ADMINISTRATION', description: 'Permite al administrador consultar y modificar los roles, permisos y espacios de trabajo de los demás trabajadores.' },
  { code: 'core.ownerships.write', label: 'Vincular propietarios', workspaceCode: 'ADMINISTRATION', description: 'Permite asignar o actualizar la titularidad de los inmuebles.' },
  { code: 'core.staff.write', label: 'Gestionar personal', workspaceCode: 'ADMINISTRATION', description: 'Permite administrar fichas laborales, contratos y cargos del personal.' },
  { code: 'core.board.write', label: 'Gestionar junta', workspaceCode: 'ADMINISTRATION', description: 'Permite registrar e integrar los miembros de la junta de condominio.' },
  { code: 'core.concessions.write', label: 'Gestionar concesiones', workspaceCode: 'ADMINISTRATION', description: 'Permite administrar espacios comerciales y concesiones bajo custodia.' },

  // Tesorería
  { code: 'treasury.read', label: 'Consultar tesorería y banca', workspaceCode: 'ACCOUNTING', description: 'Permite consultar cuentas bancarias, saldos y métodos de pago activos dentro de Contabilidad.' },
  { code: 'treasury.write', label: 'Gestionar tesorería general', workspaceCode: 'ACCOUNTING', description: 'Permite registrar ingresos, egresos y movimientos de la tesorería general.' },
  { code: 'treasury.banks.write', label: 'Editar cuentas bancarias', workspaceCode: 'ACCOUNTING', description: 'Permite agregar, editar o desactivar cuentas bancarias receptoras.' },
  { code: 'treasury.methods.write', label: 'Editar métodos de pago', workspaceCode: 'ACCOUNTING', description: 'Permite configurar Pago Móvil, Zelle y modalidades de recepción de fondos.' },

  // Operación Financiera (Gastos, Conceptos, Avisos de Cobro) -> Administración
  { code: 'billing.read', label: 'Consultar períodos, gastos y avisos', workspaceCode: 'ADMINISTRATION', description: 'Permite visualizar avisos emitidos, períodos cerrados y relación de gastos.' },
  { code: 'billing.write', label: 'Gestionar gastos, conceptos y avisos', workspaceCode: 'ADMINISTRATION', description: 'Permite cargar facturas de gastos, crear conceptos y emitir el aviso mensual.' },

  // Contabilidad (Espacio dedicado)
  { code: 'accounting.read', label: 'Consultar contabilidad', workspaceCode: 'ACCOUNTING', description: 'Permite explorar el plan de cuentas, libro diario y balanza de comprobación.' },
  { code: 'accounting.write', label: 'Preparar y editar cuentas contables', workspaceCode: 'ACCOUNTING', description: 'Permite crear cuentas contables y estructurar asientos de partida doble.' },
  { code: 'accounting.post', label: 'Contabilizar, cerrar y reversar', workspaceCode: 'ACCOUNTING', description: 'Permite asentar transacciones definitivas, hacer cierres contables y reversiones.' },
  { code: 'accounting.link_bank', label: 'Vincular cuentas bancarias con cuentas contables', workspaceCode: 'ACCOUNTING', description: 'Permite enlazar cuentas del banco con su respectiva cuenta del activo contable.' },

  // Atención al propietario
  { code: 'owner_service.authorizations.read', label: 'Consultar autorizaciones', workspaceCode: 'OWNER_SERVICE', description: 'Permite visualizar permisos de trabajo, mudanza y pases de acceso.' },
  { code: 'owner_service.authorizations.work.validate', label: 'Validar autorizaciones de trabajo', workspaceCode: 'OWNER_SERVICE', description: 'Permite autorizar trabajos de remodelación y contratistas en inmuebles.' },
  { code: 'owner_service.authorizations.access.validate', label: 'Validar autorizaciones de acceso', workspaceCode: 'OWNER_SERVICE', description: 'Permite aprobar pases y autorizaciones de visitantes e invitados.' },
  { code: 'owner_service.authorizations.exit.validate', label: 'Validar autorizaciones de salida', workspaceCode: 'OWNER_SERVICE', description: 'Permite autorizar la salida de bienes, muebles y equipos del conjunto.' },
  { code: 'owner_service.authorizations.sign', label: 'Firmar autorizaciones', workspaceCode: 'OWNER_SERVICE', description: 'Permite avalar digitalmente con firma las autorizaciones aprobadas.' },
  { code: 'owner_service.authorizations.reject', label: 'Rechazar autorizaciones', workspaceCode: 'OWNER_SERVICE', description: 'Permite rechazar autorizaciones que no cumplan con el reglamento.' },
  { code: 'owner_service.authorizations.revoke', label: 'Revocar autorizaciones', workspaceCode: 'OWNER_SERVICE', description: 'Permite dejar sin efecto autorizaciones otorgadas con anterioridad.' },
  { code: 'owner_service.incidents.read', label: 'Consultar incidencias', workspaceCode: 'OWNER_SERVICE', description: 'Permite explorar la lista de reportes e incidencias comunitarias.' },
  { code: 'owner_service.incidents.create', label: 'Registrar incidencias', workspaceCode: 'OWNER_SERVICE', description: 'Permite registrar nuevos reportes de averías o solicitudes de residentes.' },
  { code: 'owner_service.incidents.status.update', label: 'Actualizar seguimiento de incidencias', workspaceCode: 'OWNER_SERVICE', description: 'Permite modificar el estado de resolución de un reporte.' },
  { code: 'owner_service.incidents.assign', label: 'Asignar responsable de incidencia', workspaceCode: 'OWNER_SERVICE', description: 'Permite delegar la atención del reporte a un técnico o trabajador.' },
  { code: 'owner_service.incidents.comment', label: 'Agregar seguimiento a incidencias', workspaceCode: 'OWNER_SERVICE', description: 'Permite escribir avances y comentarios en la bitácora de la incidencia.' },
  { code: 'owner_service.incidents.evidence.manage', label: 'Gestionar evidencias de incidencias', workspaceCode: 'OWNER_SERVICE', description: 'Permite subir o eliminar fotografías y soportes técnicos.' },
  { code: 'owner_service.incidents.reopen', label: 'Reabrir incidencias', workspaceCode: 'OWNER_SERVICE', description: 'Permite reabrir un caso si el inconveniente persiste.' },
  { code: 'owner_service.incidents.close', label: 'Cerrar incidencias definitivamente', workspaceCode: 'OWNER_SERVICE', description: 'Permite dar por finalizado y verificado el reporte.' },
  { code: 'owner_service.owners.read', label: 'Consultar información básica de propietarios', workspaceCode: 'OWNER_SERVICE', description: 'Permite visualizar la ficha técnica del propietario.' },
  { code: 'owner_service.owners.contacts.read', label: 'Consultar contactos de propietarios', workspaceCode: 'OWNER_SERVICE', description: 'Permite acceder a los números telefónicos y correos de contacto.' },
  { code: 'owner_service.owners.service_history.read', label: 'Consultar historial de atención', workspaceCode: 'OWNER_SERVICE', description: 'Permite revisar la bitácora de solicitudes e interacciones del propietario.' },
  { code: 'owner_service.owners.contacts.update', label: 'Actualizar contactos de propietarios', workspaceCode: 'OWNER_SERVICE', description: 'Permite corregir o actualizar la información de localización del vecino.' },
  { code: 'owner_service.communications.read', label: 'Consultar comunicados', workspaceCode: 'OWNER_SERVICE', description: 'Permite consultar el historial de comunicados difundidos.' },
  { code: 'owner_service.communications.draft', label: 'Redactar comunicados', workspaceCode: 'OWNER_SERVICE', description: 'Permite crear nuevos borradores de circulares institucionales.' },
  { code: 'owner_service.communications.review', label: 'Revisar comunicados', workspaceCode: 'OWNER_SERVICE', description: 'Permite auditar el contenido de un comunicado antes de su emisión.' },
  { code: 'owner_service.communications.send', label: 'Enviar comunicados', workspaceCode: 'OWNER_SERVICE', description: 'Permite despachar comunicados masivos a la comunidad.' },
  { code: 'owner_service.communications.schedule', label: 'Programar comunicados', workspaceCode: 'OWNER_SERVICE', description: 'Permite definir fecha y hora futura para el envío automático.' },
  { code: 'owner_service.communications.cancel', label: 'Cancelar comunicados programados', workspaceCode: 'OWNER_SERVICE', description: 'Permite detener la salida de un comunicado en cola de programación.' },

  // Control principal y accesos
  { code: 'access_control.authorizations.read', label: 'Consultar autorizaciones de acceso', workspaceCode: 'CONTROL_PRINCIPAL', description: 'Permite consultar las autorizaciones que deben validarse en el control de acceso.' },
  { code: 'access_control.authorizations.access.validate', label: 'Validar autorizaciones de acceso', workspaceCode: 'CONTROL_PRINCIPAL', description: 'Permite validar códigos QR y registrar entradas y salidas autorizadas.' },
] as const;

// Shared permissions have a distinct persisted identity in each workspace.
export const scopeCatalog = baseScopeCatalog.flatMap((scope) =>
  (scope.code.startsWith('treasury.')
    ? ['ADMINISTRATION', 'ACCOUNTING']
    : scope.code === 'core.board.write'
      ? ['ADMINISTRATION', 'BOARD']
      : [])
    .length
    ? (scope.code.startsWith('treasury.')
      ? ['ADMINISTRATION', 'ACCOUNTING']
      : ['ADMINISTRATION', 'BOARD']).map((workspaceCode) => ({
        ...scope, workspaceCode, code: `${workspaceCode}:${scope.code}`,
      }))
    : [{ ...scope, code: String(scope.code), workspaceCode: String(scope.workspaceCode) }],
);

export function normalizeWorkspaceScopes(scopes: string[], workspaceCodes: string[]) {
  return Array.from(new Set(scopes.flatMap((scope) =>
    !scope.includes(':')
      ? (scopeCatalog.filter((entry) =>
          entry.code.endsWith(`:${scope}`) && workspaceCodes.includes(entry.workspaceCode),
        ).map((entry) => entry.code).length
          ? scopeCatalog.filter((entry) =>
              entry.code.endsWith(`:${scope}`) && workspaceCodes.includes(entry.workspaceCode),
            ).map((entry) => entry.code)
          : [scope])
      : [scope],
  )));
}

export type AccessMode = 'CUSTOM' | 'WORKSPACE_FULL' | 'COMMUNITY_FULL';

export const communityFullAccessScope = 'community.full_access';

export const workspaceFullScopeMap: Record<string, string[]> = {
  ADMINISTRATION: ['core.*', 'treasury.*', 'billing.*'],
  ACCOUNTING: ['accounting.*', 'treasury.*'],
  PURCHASES: ['purchases.*'],
  OWNER_SERVICE: ['owner_service.*'],
  COLLECTIONS: ['collections.*'],
  CONTROL_PRINCIPAL: ['access_control.*'],
  WRISTBANDS: ['wristbands.*'],
  BOARD: ['board.*', 'core.board.write'],
};

export const explicitScopeCatalog = scopeCatalog.filter(
  (scope) =>
    scope.code !== communityFullAccessScope && !scope.code.endsWith('.*'),
);

export const ownerServiceAgentScopes = [
  'owner_service.authorizations.read',
  'owner_service.incidents.read',
  'owner_service.incidents.create',
  'owner_service.incidents.status.update',
  'owner_service.incidents.comment',
  'owner_service.incidents.evidence.manage',
  'owner_service.owners.read',
  'owner_service.owners.contacts.read',
  'owner_service.owners.service_history.read',
  'owner_service.communications.read',
  'owner_service.communications.draft',
] as const;

export const controlPrincipalScopes = [
  'access_control.authorizations.read',
  'access_control.authorizations.access.validate',
] as const;

export function workspaceDefaultsForRole(roleCode: string) {
  switch (roleCode.trim().toUpperCase()) {
    case 'ADMINISTRADOR_INTEGRAL':
      return workspaceCatalog.map((workspace) => workspace.code);
    case 'ADMINISTRACION':
      return ['ADMINISTRATION'];
    case 'TESORERIA':
      return ['ACCOUNTING'];
    case 'JUNTA':
      return ['BOARD'];
    case 'ATENCION':
      return ['OWNER_SERVICE'];
    case 'BRAZALETES':
      return ['WRISTBANDS'];
    case 'OS_CONTROL_PRINCIPAL':
      return ['CONTROL_PRINCIPAL'];
    default:
      return [];
  }
}

export function scopesDefaultsForRole(
  roleCode: string,
  workspaceCodes: string[],
) {
  const normalizedRole = roleCode.trim().toUpperCase();
  if (normalizedRole === 'ADMINISTRADOR_INTEGRAL') {
    return [communityFullAccessScope];
  }
  if (normalizedRole === 'ATENCION') return [...ownerServiceAgentScopes];
  if (normalizedRole === 'OS_CONTROL_PRINCIPAL') {
    return [...controlPrincipalScopes];
  }
  return scopesForWorkspaceFull(workspaceCodes);
}

export function scopesForWorkspaceFull(workspaceCodes: string[]) {
  return scopeCatalog
    .filter((scope) => workspaceCodes.includes(scope.workspaceCode))
    .map((scope) => scope.code);
}

export function inferAccessMode(scopes: string[]): AccessMode {
  if (scopes.includes(communityFullAccessScope)) return 'COMMUNITY_FULL';
  if (scopes.some((scope) => scope.endsWith('.*'))) return 'WORKSPACE_FULL';
  return 'CUSTOM';
}

export function roleLabel(code: string) {
  return roleCatalog.find((role) => role.code === code)?.label ?? code;
}

export function scopeLabel(code: string) {
  if (code === '*') return 'Acceso total de plataforma';
  return scopeCatalog.find((scope) => scope.code === code)?.label
    ?? baseScopeCatalog.find((scope) => scope.code === code)?.label
    ?? code;
}

export function scopeIsGranted(granted: string[], required: string, workspaceCode?: string) {
  return granted.some(
    (scope) =>
      scope === '*' ||
      scope === communityFullAccessScope ||
      scope === required ||
      (!!workspaceCode && scope === `${workspaceCode}:${required}`) ||
      (scope.endsWith('.*') && required.startsWith(scope.slice(0, -1))),
  );
}
