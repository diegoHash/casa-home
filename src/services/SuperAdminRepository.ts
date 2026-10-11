import type { PlatformAuditEvent, SuperAdminState } from '../domain/superAdmin';
import { safeRandomUUID } from '../utils/uuid';

const STORAGE_KEY = 'casa_super_admin_v1';

export function platformId(prefix: string) {
  return `${prefix}_${safeRandomUUID()}`;
}

export function platformAudit(action: string, target: string, detail: string, severity: PlatformAuditEvent['severity'] = 'info'): PlatformAuditEvent {
  return { id: platformId('event'), action, actor: 'Diego Sumoza · ROOT', target, detail, severity, createdAt: new Date().toISOString() };
}

const seedState: SuperAdminState = {
  clients: [
    {
      id: 'client_caribbean_marina', name: 'Caribbean Marina', legalName: 'Conjunto Residencial Caribbean Marina, A.C.', rif: 'J-40127846-2',
      location: 'La Guaira, La Guaira', contactName: 'Junta de Condominio', contactEmail: 'administracion@caribbeanmarina.com', contactPhone: '+58 412-555-0181',
      standing: 'solvent', propertyCount: 729, composition: '10 edificios · 600 apartamentos · 78 townhouses · 51 locales', onboardingProgress: 82,
      joinedAt: '2026-06-01', lastActivityAt: '2026-07-19T13:44:00.000Z',
      properties: [],
      license: { status: 'active', autoRenewOnReconciliation: true, monthlyFee: 1450, currency: 'USD', periodStart: '2026-07-01', periodEnd: '2026-07-31', graceUntil: '2026-08-05', lastReconciledAt: '2026-07-02T14:18:00.000Z', revokedAt: null },
    },
    {
      id: 'client_bahia_central', name: 'Residencias Bahía Central', legalName: 'Condominio Residencias Bahía Central', rif: 'J-29841052-7',
      location: 'Lechería, Anzoátegui', contactName: 'María Fernanda Ruiz', contactEmail: 'junta@bahiacentral.com', contactPhone: '+58 414-201-0912',
      standing: 'past-due', propertyCount: 184, composition: '4 torres · 176 apartamentos · 8 locales', onboardingProgress: 100,
      joinedAt: '2026-03-12', lastActivityAt: '2026-07-18T19:20:00.000Z',
      properties: [],
      license: { status: 'grace', autoRenewOnReconciliation: true, monthlyFee: 620, currency: 'USD', periodStart: '2026-06-01', periodEnd: '2026-06-30', graceUntil: '2026-07-22', lastReconciledAt: '2026-06-04T10:10:00.000Z', revokedAt: null },
    },
    {
      id: 'client_altamira_norte', name: 'Parque Residencial Altamira Norte', legalName: 'Condominio Parque Residencial Altamira Norte', rif: 'J-31540982-1',
      location: 'Chacao, Miranda', contactName: 'Carlos Méndez', contactEmail: 'administracion@altamiranorte.com', contactPhone: '+58 424-718-3010',
      standing: 'due-soon', propertyCount: 96, composition: '2 torres · 92 apartamentos · 4 locales', onboardingProgress: 64,
      joinedAt: '2026-07-01', lastActivityAt: '2026-07-19T08:36:00.000Z',
      properties: [],
      license: { status: 'active', autoRenewOnReconciliation: false, monthlyFee: 480, currency: 'USD', periodStart: '2026-07-01', periodEnd: '2026-07-31', graceUntil: '2026-08-05', lastReconciledAt: '2026-07-01T16:30:00.000Z', revokedAt: null },
    },
    {
      id: 'client_lago_suite', name: 'Lago Suite', legalName: 'Condominio Residencias Lago Suite', rif: 'J-40912587-4',
      location: 'Maracaibo, Zulia', contactName: 'Ana Villalobos', contactEmail: 'condominio@lagosuite.com', contactPhone: '+58 416-552-1087',
      standing: 'onboarding', propertyCount: 212, composition: '3 edificios · 208 apartamentos · 4 locales', onboardingProgress: 28,
      joinedAt: '2026-07-15', lastActivityAt: '2026-07-18T15:12:00.000Z',
      properties: [],
      license: { status: 'active', autoRenewOnReconciliation: true, monthlyFee: 690, currency: 'USD', periodStart: '2026-07-15', periodEnd: '2026-08-14', graceUntil: '2026-08-19', lastReconciledAt: '2026-07-15T13:15:00.000Z', revokedAt: null },
    },
  ],
  payments: [
    { id: 'pay_001', clientId: 'client_bahia_central', reference: '0102-884921', amount: 620, currency: 'USD', bank: 'Banco de Venezuela', reportedAt: '2026-07-19T09:32:00.000Z', reconciledAt: null, status: 'pending' },
    { id: 'pay_002', clientId: 'client_caribbean_marina', reference: '0134-400128', amount: 1450, currency: 'USD', bank: 'Banesco', reportedAt: '2026-07-02T13:55:00.000Z', reconciledAt: '2026-07-02T14:18:00.000Z', status: 'reconciled' },
    { id: 'pay_003', clientId: 'client_altamira_norte', reference: '0105-728310', amount: 480, currency: 'USD', bank: 'Mercantil', reportedAt: '2026-07-01T15:48:00.000Z', reconciledAt: '2026-07-01T16:30:00.000Z', status: 'reconciled' },
  ],
  users: [
    { id: 'user_root', name: 'Diego Sumoza', email: 'diegosumozar@gmail.com', role: 'ROOT', scope: 'Toda la plataforma', status: 'active', lastAccessAt: '2026-07-19T14:04:00.000Z' },
    { id: 'user_ops', name: 'Coordinación de Operaciones', email: 'operaciones@somoscasa.site', role: 'OPERACIONES', scope: 'Clientes y núcleo', status: 'invited', lastAccessAt: null },
    { id: 'user_finance', name: 'Administración CASA', email: 'finanzas@somoscasa.site', role: 'FINANZAS', scope: 'Licencias y conciliaciones', status: 'invited', lastAccessAt: null },
  ],
  audit: [
    { id: 'event_001', action: 'Pago conciliado', actor: 'Diego Sumoza · ROOT', target: 'Caribbean Marina', detail: 'Licencia renovada automáticamente hasta el 31/07/2026.', severity: 'info', createdAt: '2026-07-02T14:18:00.000Z' },
    { id: 'event_002', action: 'Cliente registrado', actor: 'Diego Sumoza · ROOT', target: 'Lago Suite', detail: 'Se inició el proceso de incorporación con licencia integral.', severity: 'info', createdAt: '2026-07-15T13:15:00.000Z' },
    { id: 'event_003', action: 'Período vencido', actor: 'Sistema CASA', target: 'Residencias Bahía Central', detail: 'La licencia entró en período de gracia.', severity: 'warning', createdAt: '2026-07-01T04:00:00.000Z' },
  ],
};

function cloneSeed() {
  return structuredClone(seedState);
}

export const SuperAdminRepository = {
  load(): SuperAdminState {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return cloneSeed();
    try {
      return JSON.parse(stored) as SuperAdminState;
    } catch {
      return cloneSeed();
    }
  },
  save(state: SuperAdminState) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  },
};
