export type OnboardingStatus =
  | 'draft'
  | 'configuring'
  | 'validating'
  | 'ready'
  | 'active'
  | 'paused';

export type OnboardingStageKey =
  | 'identity'
  | 'sources'
  | 'structure'
  | 'people'
  | 'finances'
  | 'operations'
  | 'validation'
  | 'activation';

export type OnboardingStageStatus = 'pending' | 'in-progress' | 'completed' | 'blocked';
export type MigrationSourceType = 'access' | 'excel' | 'csv' | 'manual';
export type MigrationBatchStatus = 'registered' | 'extracted' | 'mapped' | 'validated' | 'imported' | 'failed';
export type ValidationSeverity = 'critical' | 'warning' | 'info';
export type ValidationStatus = 'open' | 'resolved' | 'accepted';

export interface OnboardingStage {
  key: OnboardingStageKey;
  label: string;
  description: string;
  status: OnboardingStageStatus;
  completedAt: string | null;
}

export interface MigrationBatch {
  id: string;
  clientId: string;
  sourceType: MigrationSourceType;
  fileName: string;
  sourceLabel: string;
  periodFrom: string;
  periodTo: string;
  rowCount: number;
  tableCount: number;
  status: MigrationBatchStatus;
  checksum: string;
  registeredAt: string;
  notes: string;
}

export interface ValidationFinding {
  id: string;
  clientId: string;
  severity: ValidationSeverity;
  area: string;
  title: string;
  detail: string;
  affectedRecords: number;
  status: ValidationStatus;
  createdAt: string;
}

export interface OnboardingCounts {
  buildings: number;
  apartments: number;
  townhouses: number;
  commercialUnits: number;
  concessions: number;
  people: number;
  openBalances: number;
}

export interface OnboardingCase {
  id: string;
  clientId: string;
  status: OnboardingStatus;
  sourceSystem: string;
  sourceOwner: string;
  historicalFrom: string;
  historicalTo: string;
  cutoverDate: string;
  coordinator: string;
  notes: string;
  stages: OnboardingStage[];
  batches: MigrationBatch[];
  findings: ValidationFinding[];
  counts: OnboardingCounts;
  createdAt: string;
  updatedAt: string;
}

export interface OnboardingState {
  cases: OnboardingCase[];
}

export const onboardingStageBlueprint: Array<Pick<OnboardingStage, 'key' | 'label' | 'description'>> = [
  { key: 'identity', label: 'Identidad y licencia', description: 'Contrato, RIF, comunidad y responsables.' },
  { key: 'sources', label: 'Fuentes de información', description: 'Archivos, sistemas anteriores y custodia.' },
  { key: 'structure', label: 'Estructura inmobiliaria', description: 'Edificios, inmuebles, alícuotas y concesiones.' },
  { key: 'people', label: 'Personas y relaciones', description: 'Propiedad, ocupación, junta y personal.' },
  { key: 'finances', label: 'Historia financiera', description: 'Avisos, pagos, saldos, fondos y ajustes.' },
  { key: 'operations', label: 'Configuración operativa', description: 'Banca, políticas, permisos y comunicaciones.' },
  { key: 'validation', label: 'Conciliación y validación', description: 'Controles estructurales y financieros.' },
  { key: 'activation', label: 'Activación', description: 'Aprobación, corte, invitaciones y salida en vivo.' },
];

export function createOnboardingStages(): OnboardingStage[] {
  return onboardingStageBlueprint.map((stage, index) => ({
    ...stage,
    status: index === 0 ? 'in-progress' : 'pending',
    completedAt: null,
  }));
}

