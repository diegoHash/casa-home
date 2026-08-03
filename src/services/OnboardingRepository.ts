import {
  createOnboardingStages,
  type OnboardingCase,
  type OnboardingState,
} from '../domain/onboarding';

const STORAGE_KEY = 'casa_onboarding_v1';

export function onboardingId(prefix: string) {
  return `${prefix}_${crypto.randomUUID()}`;
}

export function createOnboardingCase(clientId: string): OnboardingCase {
  const now = new Date().toISOString();
  return {
    id: onboardingId('onboarding'),
    clientId,
    status: 'draft',
    sourceSystem: '',
    sourceOwner: '',
    historicalFrom: '',
    historicalTo: '',
    cutoverDate: '',
    coordinator: '',
    notes: '',
    stages: createOnboardingStages(),
    batches: [],
    findings: [],
    counts: {
      buildings: 0,
      apartments: 0,
      townhouses: 0,
      commercialUnits: 0,
      concessions: 0,
      people: 0,
      openBalances: 0,
    },
    createdAt: now,
    updatedAt: now,
  };
}

const caribbeanStages = createOnboardingStages().map((stage, index) => ({
  ...stage,
  status: index < 5 ? ('completed' as const) : index === 5 ? ('in-progress' as const) : ('pending' as const),
  completedAt: index < 5 ? `2026-07-${String(8 + index).padStart(2, '0')}T14:00:00.000Z` : null,
}));

const seedState: OnboardingState = {
  cases: [
    {
      ...createOnboardingCase('client_caribbean_marina'),
      id: 'onboarding_caribbean_marina',
      status: 'configuring',
      sourceSystem: 'Sistema administrativo legado · Microsoft Access',
      sourceOwner: 'Luis Venezuela',
      historicalFrom: '2021-01-01',
      historicalTo: '2026-07-31',
      cutoverDate: '',
      coordinator: 'Diego Sumoza',
      notes: 'Caso de ensayo. La información mostrada es una simulación de planificación; ningún archivo Access ha sido extraído todavía.',
      stages: caribbeanStages,
      batches: [
        {
          id: 'batch_access_discovery',
          clientId: 'client_caribbean_marina',
          sourceType: 'access',
          fileName: 'Pendiente de recepción',
          sourceLabel: 'Base administrativa principal',
          periodFrom: '2021-01-01',
          periodTo: '2026-07-31',
          rowCount: 0,
          tableCount: 0,
          status: 'registered',
          checksum: '',
          registeredAt: '2026-07-23T12:00:00.000Z',
          notes: 'Registro de planificación. Requiere copia oficial, archivos vinculados y reportes de control.',
        },
      ],
      findings: [
        {
          id: 'finding_source_pending',
          clientId: 'client_caribbean_marina',
          severity: 'critical',
          area: 'Fuente',
          title: 'Archivo Access oficial pendiente',
          detail: 'No se puede iniciar la extracción hasta recibir una copia identificada y verificable.',
          affectedRecords: 0,
          status: 'open',
          createdAt: '2026-07-23T12:05:00.000Z',
        },
        {
          id: 'finding_reports_pending',
          clientId: 'client_caribbean_marina',
          severity: 'warning',
          area: 'Conciliación',
          title: 'Reportes de control pendientes',
          detail: 'Se necesitan estados de cuenta, cuentas por cobrar y resúmenes mensuales para comparar los resultados.',
          affectedRecords: 0,
          status: 'open',
          createdAt: '2026-07-23T12:06:00.000Z',
        },
      ],
      counts: {
        buildings: 10,
        apartments: 600,
        townhouses: 78,
        commercialUnits: 51,
        concessions: 0,
        people: 0,
        openBalances: 0,
      },
      createdAt: '2026-07-08T14:00:00.000Z',
      updatedAt: '2026-07-23T12:06:00.000Z',
    },
  ],
};

function cloneSeed() {
  return structuredClone(seedState);
}

export const OnboardingRepository = {
  load(): OnboardingState {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return cloneSeed();
    try {
      const parsed = JSON.parse(stored) as Partial<OnboardingState>;
      return { cases: parsed.cases ?? [] };
    } catch {
      return cloneSeed();
    }
  },
  save(state: OnboardingState) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  },
};

export function ensureOnboardingForClient(clientId: string): OnboardingCase {
  const state = OnboardingRepository.load();
  const existing = state.cases.find(item => item.clientId === clientId);
  if (existing) return existing;
  const onboarding = createOnboardingCase(clientId);
  OnboardingRepository.save({ cases: [onboarding, ...state.cases] });
  return onboarding;
}
