import { useEffect, useState, type FormEvent, type ReactNode } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  BadgeCheck,
  Building2,
  Calendar,
  Check,
  CheckCircle2,
  ChevronDown,
  CircleDashed,
  ClipboardList,
  Database,
  FileArchive,
  FileCheck2,
  Play,
  Plus,
  RefreshCw,
  ShieldAlert,
  UploadCloud,
  X,
} from 'lucide-react';
import type { PlatformClient } from '../../domain/superAdmin';
import type {
  OnboardingCase,
  OnboardingStageKey,
  OnboardingStageStatus,
  OnboardingState,
  ValidationFinding,
  ValidationSeverity,
} from '../../domain/onboarding';
import {
  createOnboardingCase,
  OnboardingRepository,
} from '../../services/OnboardingRepository';
import {
  resolveOnboardingCounts,
  runValidationDiagnostics,
  resolveInitializationChecks,
  validateOnboardingStage,
  type StageValidation,
} from '../../domain/onboardingValidation';
import { onboardingStageGuides } from '../../domain/onboardingGuide';
import type { CoreSection } from '../core/CoreModule';
import { authorizedRequest } from '../../services/CasaPlatformService';
import { CasaAuthService } from '../../services/CasaAuthService';
import { RootSession } from '../../services/RootSession';

type OnboardingTab = 'roadmap' | 'initialization' | 'validation';
type InitializationView = 'overview' | 'owner-balances' | 'payables' | 'banks' | 'notices' | 'payments' | 'reconciliation';
type InitializationSummary = {
  id: string;
  cutoverDate: string | null;
  historyFrom?: string | null;
  historyTo?: string | null;
  rows?: Array<{
    id: string;
    kind: string;
    propertyId: string | null;
    status: string;
  }>;
};

const inputClass =
  'mt-2 w-full rounded-xl border border-slate-200 bg-[#fbfaf7] px-3.5 py-3 text-sm text-[#0b1d33] outline-none transition focus:border-[#b08a3c] focus:ring-4 focus:ring-[#b08a3c]/10';

const statusLabel: Record<OnboardingStageStatus, string> = {
  pending: 'Pendiente',
  'in-progress': 'En curso',
  completed: 'Completada',
  blocked: 'Bloqueada',
};

const severityMeta: Record<ValidationSeverity, { label: string; className: string; icon: typeof AlertTriangle }> = {
  critical: { label: 'Crítico', className: 'bg-rose-50 text-rose-700 ring-rose-600/15', icon: ShieldAlert },
  warning: { label: 'Advertencia', className: 'bg-amber-50 text-amber-700 ring-amber-600/15', icon: AlertTriangle },
  info: { label: 'Informativo', className: 'bg-blue-50 text-blue-700 ring-blue-600/15', icon: CircleDashed },
};

function Field({ label, children, span = false, hint }: { label: string; children: ReactNode; span?: boolean; hint?: string }) {
  return (
    <label className={`block text-sm font-semibold text-slate-700 ${span ? 'sm:col-span-2' : ''}`}>
      {label}
      {children}
      {hint && <span className="mt-1.5 block text-xs font-normal leading-5 text-slate-400">{hint}</span>}
    </label>
  );
}

function Modal({ title, copy, onClose, children }: { title: string; copy: string; onClose: () => void; children: ReactNode }) {
  return (
    <div className="fixed inset-0 z-[140] flex items-end justify-center bg-[#061529]/65 backdrop-blur-sm sm:items-center sm:p-5">
      <div className="max-h-[94vh] w-full max-w-2xl overflow-y-auto rounded-t-[1.75rem] bg-white shadow-2xl sm:rounded-[1.75rem]">
        <header className="sticky top-0 z-10 flex items-start justify-between border-b border-slate-100 bg-white/95 px-6 py-5 backdrop-blur">
          <div>
            <h3 className="text-xl font-semibold tracking-[-.02em] text-[#071a33]">{title}</h3>
            <p className="mt-1 max-w-xl text-sm text-slate-500">{copy}</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-full border border-slate-200 p-2 text-slate-500 hover:border-[#b08a3c]" aria-label="Cerrar">
            <X size={18} />
          </button>
        </header>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

function StageIcon({ status }: { status: OnboardingStageStatus }) {
  if (status === 'completed') return <Check size={17} />;
  if (status === 'blocked') return <AlertTriangle size={17} />;
  if (status === 'in-progress') return <RefreshCw size={17} />;
  return <CircleDashed size={17} />;
}

function stageTone(status: OnboardingStageStatus) {
  if (status === 'completed') return 'bg-emerald-600 text-white';
  if (status === 'blocked') return 'bg-rose-600 text-white';
  if (status === 'in-progress') return 'bg-[#c99b3d] text-[#071a33]';
  return 'bg-slate-100 text-slate-400';
}

function formatDate(value: string) {
  if (!value) return 'Sin definir';
  return new Intl.DateTimeFormat('es-VE', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(`${value}T12:00:00`));
}

type OnboardingDestination =
  | { view: 'clients'; clientId: string }
  | { view: 'core'; clientId: string; section?: CoreSection };

export default function OnboardingModule({ clients, onNavigate }: { clients: PlatformClient[]; demoMode: boolean; onNavigate: (destination: OnboardingDestination) => void }) {
  const [state, setState] = useState<OnboardingState>(() => {
    const stored = OnboardingRepository.load();
    const missing = clients.filter(client => !stored.cases.some(item => item.clientId === client.id));
    return missing.length ? { cases: [...stored.cases, ...missing.map(client => createOnboardingCase(client.id))] } : stored;
  });
  const [selectedClientId, setSelectedClientId] = useState(() => {
    const stored = OnboardingRepository.load();
    return stored.cases.find(item => clients.some(client => client.id === item.clientId))?.clientId
      ?? clients[0]?.id
      ?? '';
  });
  const [tab, setTab] = useState<OnboardingTab>('roadmap');
  const [stageReview, setStageReview] = useState<StageValidation | null>(null);
  const [completionConfirmed, setCompletionConfirmed] = useState(false);
  const [guideStageKey, setGuideStageKey] = useState<OnboardingStageKey | null>(null);
  const [showOperationsModal, setShowOperationsModal] = useState(false);
  const [findingFilter, setFindingFilter] = useState<'open' | 'resolved'>('open');
  const [toast, setToast] = useState('');
  const [initializationStarting, setInitializationStarting] = useState(false);
  const [showInitializationStart, setShowInitializationStart] = useState(false);
  const [initializationFormError, setInitializationFormError] = useState('');
  const [initializationId, setInitializationId] = useState(() => localStorage.getItem(`casa_initialization_${selectedClientId}`) || '');
  const [initializationCase, setInitializationCase] = useState<InitializationSummary | null>(null);
  const [showInitializationRows, setShowInitializationRows] = useState(false);
  const [initializationView, setInitializationView] = useState<InitializationView>('overview');

  useEffect(() => OnboardingRepository.save(state), [state]);
  useEffect(() => {
    if (!toast) return;
    const timeout = window.setTimeout(() => setToast(''), 3200);
    return () => window.clearTimeout(timeout);
  }, [toast]);
  const onboardingCase = state.cases.find(item => item.clientId === selectedClientId) ?? null;
  const client = clients.find(item => item.id === selectedClientId) ?? null;
  const effectiveCounts = onboardingCase ? resolveOnboardingCounts(onboardingCase, client) : null;
  const completedStages = onboardingCase?.stages.filter(stage => stage.status === 'completed').length ?? 0;
  const progress = onboardingCase ? Math.round((completedStages / onboardingCase.stages.length) * 100) : 0;
  const openCritical = onboardingCase?.findings.filter(item => item.status === 'open' && item.severity === 'critical').length ?? 0;
  const openWarnings = onboardingCase?.findings.filter(item => item.status === 'open' && item.severity === 'warning').length ?? 0;
  const currentStageIndex = onboardingCase?.stages.findIndex(stage => stage.status === 'in-progress') ?? -1;
  const currentStage = onboardingCase && currentStageIndex >= 0 ? onboardingCase.stages[currentStageIndex] : null;
  const guideStage = onboardingCase?.stages.find(stage => stage.key === guideStageKey) ?? null;
  const guideValidation = onboardingCase && client && guideStageKey
    ? validateOnboardingStage(guideStageKey, onboardingCase, client)
    : null;
  const initializationChecks = onboardingCase ? resolveInitializationChecks(onboardingCase, client) : [];
  const initializationComplete = initializationChecks.filter(check => check.status === 'complete').length;
  const openingBalancePropertyIds = new Set(
    initializationCase?.rows
      ?.filter(row => row.kind === 'OWNER_BALANCE' && row.propertyId)
      .map(row => row.propertyId as string) ?? [],
  );
  useEffect(() => {
    const communityId = client?.communityId;
    if (tab !== 'initialization' || !communityId || !RootSession.token()) return;
    let cancelled = false;
    void (async () => {
      setInitializationCase(null);
      const context = await CasaAuthService.selectContext(RootSession.token(), communityId);
      if (!context.success || cancelled) return;
      RootSession.updateTokens(context.data.accessToken, RootSession.refreshToken());
      try {
        const response = await authorizedRequest<InitializationSummary | null>({ method: 'GET', url: '/accounting/initialization' });
        if (!cancelled && response.data?.id) {
          setInitializationId(response.data.id);
          setInitializationCase(response.data);
          localStorage.setItem(`casa_initialization_${selectedClientId}`, response.data.id);
        }
      } catch { /* No expediente todavía. */ }
    })();
    return () => { cancelled = true; };
  }, [tab, selectedClientId, client?.communityId]);

  const updateCase = (producer: (current: OnboardingCase) => OnboardingCase) => {
    setState(current => ({
      cases: current.cases.map(item => item.clientId === selectedClientId ? producer(item) : item),
    }));
  };

  const handleRunValidations = () => {
    if (!onboardingCase || !client) return;
    const res = runValidationDiagnostics(onboardingCase, client);
    const now = new Date().toISOString();

    if (res.criticalCount === 0 && res.warningCount === 0) {
      updateCase(current => {
        const completedStages = current.stages.map(stage => ({
          ...stage,
          status: 'completed' as const,
          completedAt: stage.completedAt || now,
        }));
        return {
          ...res.updatedCase,
          status: 'active' as const,
          stages: completedStages,
          updatedAt: now,
        };
      });
      setToast('🎉 ¡Validación exitosa! Las 8 etapas de incorporación se completaron y la comunidad está activa.');
    } else {
      updateCase(() => res.updatedCase);
      setToast(res.summaryMessage);
    }
  };

  useEffect(() => {
    if (tab === 'validation' && onboardingCase) {
      const res = runValidationDiagnostics(onboardingCase, client);
      updateCase(() => res.updatedCase);
    }
  }, [tab, selectedClientId]);

  const advanceStage = () => {
    if (!onboardingCase || !client || !currentStage || currentStage.key === 'activation') return;
    setCompletionConfirmed(false);
    setStageReview(validateOnboardingStage(currentStage.key, onboardingCase, client));
  };

  const confirmStageCompletion = () => {
    if (!onboardingCase || !client || !currentStage || !stageReview || !stageReview.passed || !completionConfirmed) return;
    const latestValidation = validateOnboardingStage(currentStage.key, onboardingCase, client);
    if (!latestValidation.passed) {
      setStageReview(latestValidation);
      setCompletionConfirmed(false);
      setToast('La información cambió y la etapa ya no cumple todos los requisitos.');
      return;
    }
    const now = new Date().toISOString();
    updateCase(current => {
      const stages = current.stages.map((stage, index) => {
        if (index === currentStageIndex) return { ...stage, status: 'completed' as const, completedAt: now };
        if (index === currentStageIndex + 1) return { ...stage, status: 'in-progress' as const };
        return stage;
      });
      return {
        ...current,
        status: currentStage.key === 'validation' ? 'ready' : 'configuring',
        stages,
        updatedAt: now,
      };
    });
    setStageReview(null);
    setCompletionConfirmed(false);
    setToast(`${currentStage.label} quedó marcada como completada.`);
  };

  const openMissingConfiguration = (stageKey: OnboardingStageKey) => {
    if (!client) return;
    setGuideStageKey(null);
    if (stageKey === 'identity') {
      onNavigate({ view: 'clients', clientId: client.id });
      return;
    }
    if (stageKey === 'structure') {
      onNavigate({ view: 'core', clientId: client.id, section: 'properties' });
      return;
    }
    if (stageKey === 'people') {
      onNavigate({ view: 'core', clientId: client.id, section: 'people' });
      return;
    }
    if (stageKey === 'finances') {
      setTab('initialization');
      return;
    }
    if (stageKey === 'operations') {
      setShowOperationsModal(true);
      return;
    }
    setTab('validation');
  };

  const handleGuideAction = () => {
    if (!guideStageKey || !guideStage || !guideValidation) return;
    const isCurrentStage = guideStage.status === 'in-progress';
    if (isCurrentStage && guideValidation.passed && guideStageKey !== 'activation') {
      setGuideStageKey(null);
      advanceStage();
      return;
    }
    openMissingConfiguration(guideStageKey);
  };

  const saveOperations = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    updateCase(current => ({
      ...current,
      coordinator: String(form.get('coordinator')).trim(),
      cutoverDate: String(form.get('cutoverDate')),
      sourceOwner: String(form.get('sourceOwner')).trim(),
      updatedAt: new Date().toISOString(),
    }));
    setShowOperationsModal(false);
    setToast('Responsables y fecha de corte actualizados.');
  };

  const startInitialization = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!client) return;
    const form = new FormData(event.currentTarget);
    setInitializationStarting(true);
    setInitializationFormError('');
    try {
      if (!client.communityId) throw new Error('La comunidad seleccionada todavía no tiene un contexto operativo configurado.');
      const accessToken = RootSession.token();
      if (!accessToken) throw new Error('La sesión ROOT no está autenticada.');
      const context = await CasaAuthService.selectContext(accessToken, client.communityId);
      if (!context.success) throw new Error(context.error);
      RootSession.updateTokens(context.data.accessToken, RootSession.refreshToken());
      const response = await authorizedRequest<InitializationSummary>({
        method: 'POST',
        url: '/accounting/initialization',
        data: {
          cutoverDate: String(form.get('cutoverDate')),
          historyFrom: String(form.get('historyFrom')),
          historyTo: String(form.get('historyTo')),
        },
      });
      setInitializationId(response.data.id);
      setInitializationCase(response.data);
      localStorage.setItem(`casa_initialization_${selectedClientId}`, response.data.id);
      setShowInitializationStart(false);
      setTab('initialization');
      setToast('Expediente de inicialización creado. Ya puedes cargar avisos, pagos, saldos y cuentas por pagar.');
    } catch (error) {
      setInitializationFormError(error instanceof Error ? error.message : 'No fue posible iniciar la inicialización.');
    } finally {
      setInitializationStarting(false);
    }
  };

  const loadInitializationRows = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!initializationId) { setInitializationFormError('Primero crea el expediente de inicialización.'); return; }
    try {
      const form = new FormData(event.currentTarget);
      const kind = String(form.get('kind'));
      const propertyId = String(form.get('propertyId') || '').trim();
      const vendorId = String(form.get('vendorId') || '').trim();
      const rows = [{
        kind,
        externalRef: String(form.get('externalRef')).trim(),
        propertyId: propertyId || undefined,
        vendorId: vendorId || undefined,
        eventDate: String(form.get('eventDate')),
        description: String(form.get('description')).trim(),
        amount: Number(form.get('amount')),
        currency: String(form.get('currency')),
        metadata: {
          periodKey: String(form.get('periodKey') || '').trim() || undefined,
          debitAccountId: String(form.get('debitAccountId')).trim(),
          creditAccountId: String(form.get('creditAccountId')).trim(),
          receivableAccountId: String(form.get('debitAccountId')).trim(),
          billingIncomeAccountId: String(form.get('creditAccountId')).trim(),
        },
      }];
      if (!rows[0].externalRef || !rows[0].description || !rows[0].eventDate || !Number.isFinite(rows[0].amount) || rows[0].amount <= 0) throw new Error('Completa referencia, fecha, descripción y monto válido.');
      await authorizedRequest({ method: 'POST', url: `/accounting/initialization/${initializationId}/rows`, data: { rows } });
      setShowInitializationRows(false);
      setToast('Registro cargado. Ahora puedes agregar otro o validar la inicialización.');
    } catch (error) { setInitializationFormError(error instanceof Error ? error.message : 'No fue posible cargar las filas.'); }
  };

  const saveOwnerOpeningBalance = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formElement = event.currentTarget;
    if (!initializationId) { setInitializationFormError('Primero crea el expediente de inicialización financiera.'); return; }
    const form = new FormData(formElement);
    const signedBalance = Number(form.get('signedBalance'));
    const propertyId = String(form.get('propertyId') || '');
    const cutoverDate = initializationCase?.cutoverDate?.slice(0, 10) || '';
    if (!propertyId || !cutoverDate || !Number.isFinite(signedBalance)) {
      setInitializationFormError('Selecciona el apartamento e indica el saldo final, incluso si es cero. La fecha de corte se toma del expediente; recarga esta sección si no aparece.');
      return;
    }
    try {
      const response = await authorizedRequest<InitializationSummary>({
        method: 'POST', url: `/accounting/initialization/${initializationId}/rows`, data: { rows: [{
          kind: 'OWNER_BALANCE', externalRef: `OPENING-${propertyId}-${cutoverDate}`, propertyId, eventDate: cutoverDate,
          description: String(form.get('description') || 'Saldo inicial del propietario').trim(), amount: Math.abs(signedBalance), currency: String(form.get('currency')),
          metadata: { signedBalance },
        }] },
      });
      setInitializationCase(response.data);
      setInitializationFormError('');
      setToast(signedBalance < 0 ? 'Saldo a favor guardado. CASA lo clasificará como anticipo al contabilizar.' : signedBalance === 0 ? 'Apartamento registrado como solvente al corte.' : 'Saldo pendiente guardado como cuenta por cobrar inicial.');
      formElement.reset();
    } catch (error) { setInitializationFormError(error instanceof Error ? error.message : 'No fue posible guardar el saldo inicial.'); }
  };

  const handleNavigateToResolve = (finding: ValidationFinding) => {
    if (!client) return;
    const areaLower = finding.area.toLowerCase();
    const titleLower = finding.title.toLowerCase();
    const idLower = finding.id.toLowerCase();

    if (areaLower.includes('estructura') || idLower.includes('aliquot') || idLower.includes('properties') || titleLower.includes('alícuot') || titleLower.includes('inmueble')) {
      onNavigate({ view: 'core', clientId: client.id, section: 'properties' });
    } else if (areaLower.includes('persona') || idLower.includes('people') || titleLower.includes('persona') || titleLower.includes('propiet')) {
      onNavigate({ view: 'core', clientId: client.id, section: 'people' });
    } else if (areaLower.includes('finanz') || idLower.includes('bank') || idLower.includes('payment') || titleLower.includes('banc') || titleLower.includes('pago')) {
      onNavigate({ view: 'core', clientId: client.id, section: 'banking' });
    } else if (areaLower.includes('junta') || idLower.includes('board') || titleLower.includes('junta')) {
      onNavigate({ view: 'core', clientId: client.id, section: 'board' });
    } else if (areaLower.includes('operacion') || areaLower.includes('operación') || idLower.includes('operations')) {
      setShowOperationsModal(true);
    } else {
      onNavigate({ view: 'core', clientId: client.id });
    }
  };

  const resolveFinding = (findingId: string) => {
    if (!onboardingCase) return;
    const isSystemDiagnostic = findingId.startsWith('finding_');
    if (isSystemDiagnostic) {
      const res = runValidationDiagnostics(onboardingCase, client);
      const stillFailing = res.updatedCase.findings.some(f => f.id === findingId && f.status === 'open');
      if (stillFailing) {
        setToast('El hallazgo requiere corrección en la comunidad. Redirigiendo...');
        const targetFinding = onboardingCase.findings.find(f => f.id === findingId);
        if (targetFinding) handleNavigateToResolve(targetFinding);
        return;
      }
    }
    updateCase(current => ({
      ...current,
      findings: current.findings.map(item => item.id === findingId ? { ...item, status: 'resolved' as const } : item),
      updatedAt: new Date().toISOString(),
    }));
    setToast('Hallazgo verificado y marcado como resuelto.');
  };

  const tabs: Array<{ id: OnboardingTab; label: string }> = [
    { id: 'roadmap', label: 'Ruta de incorporación' },
    { id: 'initialization', label: 'Inicialización financiera' },
    { id: 'validation', label: `Validación (${openCritical + openWarnings})` },
  ];

  if (!clients.length) {
    return (
      <section className="rounded-[1.6rem] border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
        <Building2 className="mx-auto text-[#9a742b]" size={32} />
        <h3 className="mt-4 text-xl font-semibold">Primero registra un cliente</h3>
        <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-500">La incorporación comienza después de crear la relación comercial y la licencia CASA.</p>
      </section>
    );
  }

  return (
    <div className="space-y-5">
      <section className="overflow-hidden rounded-[1.7rem] bg-[#071a33] text-white shadow-[0_22px_60px_rgba(7,26,51,.16)]">
        <div className="grid gap-8 p-6 sm:p-8 xl:grid-cols-[1fr_auto] xl:items-end">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-full bg-[#e4c26f]/15 px-3 py-1 text-xs font-bold uppercase tracking-[.15em] text-[#e4c26f]">Expediente de incorporación</span>
              <span className="rounded-full bg-white/8 px-3 py-1 text-xs font-semibold text-white/60">Prototipo local</span>
            </div>
            <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-end">
              <div className="min-w-0 flex-1">
                <p className="text-sm text-white/45">Cliente seleccionado</p>
                <h2 className="mt-1 truncate text-3xl font-semibold tracking-[-.04em]">{client?.name}</h2>
                <p className="mt-2 text-sm text-white/50">{client?.rif} · {client?.location}</p>
              </div>
              <label className="relative block">
                <span className="sr-only">Seleccionar cliente</span>
                <select value={selectedClientId} onChange={event => { setSelectedClientId(event.target.value); setTab('roadmap'); setGuideStageKey(null); setStageReview(null); setCompletionConfirmed(false); }} className="h-11 min-w-64 appearance-none rounded-xl border border-white/12 bg-white/8 pl-4 pr-10 text-sm font-semibold text-white outline-none">
                  {clients.map(item => <option key={item.id} value={item.id} className="text-[#071a33]">{item.name}</option>)}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-3 text-white/50" size={18} />
              </label>
            </div>
          </div>
          <div className="min-w-64">
            <div className="flex items-end justify-between">
              <div><p className="text-xs text-white/45">Avance controlado</p><p className="mt-1 text-3xl font-semibold text-[#e4c26f]">{progress}%</p></div>
              <p className="text-xs text-white/40">{completedStages} de {onboardingCase?.stages.length ?? 0} etapas</p>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-[#d8b25a] transition-all" style={{ width: `${progress}%` }} /></div>
          </div>
        </div>
        {onboardingCase?.notes && <div className="border-t border-white/8 bg-white/[.035] px-6 py-3 text-xs leading-5 text-white/45 sm:px-8"><strong className="text-[#e4c26f]">Transparencia:</strong> {onboardingCase.notes}</div>}
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Fuente principal', value: onboardingCase?.sourceSystem || 'Por registrar', detail: onboardingCase?.sourceOwner ? `Responsable: ${onboardingCase.sourceOwner}` : 'Responsable pendiente', icon: <Database size={18} /> },
          { label: 'Puesta en marcha', value: onboardingCase?.cutoverDate ? formatDate(onboardingCase.cutoverDate) : 'Corte por definir', detail: onboardingCase?.coordinator ? `Coordinador: ${onboardingCase.coordinator}` : 'Coordinador pendiente', icon: <Calendar size={18} /> },
          { label: 'Ventana histórica', value: onboardingCase?.historicalFrom ? `${formatDate(onboardingCase.historicalFrom)} — ${formatDate(onboardingCase.historicalTo)}` : 'Sin definir', detail: 'Período a preservar', icon: <FileArchive size={18} /> },
          { label: 'Bloqueos críticos', value: String(openCritical), detail: openCritical ? 'Impiden activar comunidad' : 'Sin bloqueos abiertos', icon: <ShieldAlert size={18} /> },
        ].map(item => (
          <article key={item.label} className="rounded-[1.4rem] border border-[#071a33]/8 bg-white p-5 shadow-[0_14px_40px_rgba(7,26,51,.04)]">
            <div className="flex items-start justify-between gap-3"><p className="text-sm font-semibold text-slate-500">{item.label}</p><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#f2ebdd] text-[#9a742b]">{item.icon}</span></div>
            <p className="mt-5 text-lg font-semibold tracking-[-.025em]">{item.value}</p>
            <p className="mt-2 text-xs text-slate-400">{item.detail}</p>
          </article>
        ))}
      </section>

      <div className="flex gap-2 overflow-x-auto rounded-2xl border border-[#071a33]/8 bg-white p-2">
        {tabs.map(item => <button key={item.id} onClick={() => setTab(item.id)} className={`whitespace-nowrap rounded-xl px-4 py-2.5 text-sm font-bold transition ${tab === item.id ? 'bg-[#071a33] text-white' : 'text-slate-500 hover:bg-slate-50'}`}>{item.label}</button>)}
      </div>

      {tab === 'roadmap' && onboardingCase && (
        <section className="grid gap-5 xl:grid-cols-[1fr_360px]">
          <div className="rounded-[1.6rem] border border-[#071a33]/8 bg-white p-5 shadow-[0_16px_45px_rgba(7,26,51,.04)] sm:p-6">
            <div className="flex flex-col gap-3 border-b border-slate-100 pb-5 sm:flex-row sm:items-center sm:justify-between">
              <div><p className="text-xs font-bold uppercase tracking-[.16em] text-[#9a742b]">Ruta maestra</p><h3 className="mt-2 text-xl font-semibold">Del contrato a la salida en vivo</h3></div>
              <button type="button" onClick={() => currentStage && setGuideStageKey(currentStage.key)} disabled={!currentStage} className="inline-flex items-center justify-center gap-2 rounded-full bg-[#071a33] px-5 py-3 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-35">
                Revisar etapa actual <ArrowRight size={16} />
              </button>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {onboardingCase.stages.map((stage, index) => (
                <article key={stage.key} className={`relative rounded-2xl border p-4 ${stage.status === 'in-progress' ? 'border-[#c99b3d]/50 bg-[#fbf7ed]' : stage.status === 'blocked' ? 'border-rose-200 bg-rose-50/50' : 'border-slate-100 bg-[#fcfbf8]'}`}>
                  <div className="flex items-start gap-3">
                    <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${stageTone(stage.status)}`}><StageIcon status={stage.status} /></span>
                    <div className="min-w-0 flex-1"><p className="text-[10px] font-bold uppercase tracking-[.15em] text-slate-400">Etapa {String(index + 1).padStart(2, '0')}</p><h4 className="mt-1 font-bold">{stage.label}</h4><p className="mt-2 text-xs leading-5 text-slate-500">{stage.description}</p><button type="button" onClick={() => setGuideStageKey(stage.key)} className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-[#8a6726] hover:text-[#071a33]">Ver guía y pendientes <ArrowRight size={13} /></button></div>
                  </div>
                  <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs"><span className="font-bold text-slate-500">{statusLabel[stage.status]}</span><span className="text-slate-400">{stage.completedAt ? new Intl.DateTimeFormat('es-VE', { day: '2-digit', month: 'short' }).format(new Date(stage.completedAt)) : '—'}</span></div>
                </article>
              ))}
            </div>
          </div>

          <aside className="space-y-5">
            {currentStage?.key === 'activation' && (
              <section className="rounded-[1.6rem] border border-amber-200 bg-amber-50 p-5">
                <div className="flex gap-3">
                  <ShieldAlert className="shrink-0 text-amber-700" size={20} />
                  <div>
                    <p className="font-bold text-amber-950">Activación definitiva protegida</p>
                    <p className="mt-1 text-sm leading-6 text-amber-900/70">Este expediente no puede integrarse desde un botón local. La salida en vivo permanecerá bloqueada hasta que el backend repita las validaciones y registre una aprobación explícita.</p>
                  </div>
                </div>
              </section>
            )}
            <section className="rounded-[1.6rem] border border-[#071a33]/8 bg-white p-5">
              <p className="text-xs font-bold uppercase tracking-[.15em] text-[#9a742b]">Universo esperado</p>
              <div className="mt-4 space-y-3">
                {[
                  ['Edificios', effectiveCounts?.buildings ?? 0],
                  ['Apartamentos', effectiveCounts?.apartments ?? 0],
                  ['Townhouses', effectiveCounts?.townhouses ?? 0],
                  ['Locales', effectiveCounts?.commercialUnits ?? 0],
                  ['Concesiones', effectiveCounts?.concessions ?? 0],
                ].map(([label, value]) => <div key={String(label)} className="flex items-center justify-between rounded-xl bg-[#f8f6f1] px-4 py-3"><span className="text-sm text-slate-500">{label}</span><strong>{value}</strong></div>)}
              </div>
              <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4"><span className="text-sm font-bold">Unidades principales</span><strong className="text-xl text-[#9a742b]">{(effectiveCounts?.apartments ?? 0) + (effectiveCounts?.townhouses ?? 0) + (effectiveCounts?.commercialUnits ?? 0)}</strong></div>
            </section>
            <section className={`rounded-[1.6rem] border p-5 ${openCritical ? 'border-rose-200 bg-rose-50' : 'border-emerald-200 bg-emerald-50'}`}>
              <div className="flex gap-3">{openCritical ? <ShieldAlert className="shrink-0 text-rose-700" size={20} /> : <BadgeCheck className="shrink-0 text-emerald-700" size={20} />}<div><p className={`font-bold ${openCritical ? 'text-rose-900' : 'text-emerald-900'}`}>{openCritical ? 'Activación bloqueada' : 'Sin bloqueos críticos'}</p><p className={`mt-1 text-sm leading-6 ${openCritical ? 'text-rose-800/70' : 'text-emerald-800/70'}`}>{openCritical ? `${openCritical} hallazgo crítico debe resolverse antes de aprobar la salida en vivo.` : 'La comunidad puede continuar hacia la validación final.'}</p></div></div>
            </section>
          </aside>
        </section>
      )}

      {tab === 'initialization' && onboardingCase && (
        <section className="flex flex-col gap-5">
          <section className="order-1 rounded-[1.6rem] bg-[#071a33] p-6 text-white shadow-[0_18px_50px_rgba(7,26,51,.14)] sm:p-8">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
              <div><p className="text-xs font-bold uppercase tracking-[.16em] text-[#e4c26f]">Etapa 04 · Control guiado</p><h3 className="mt-2 text-2xl font-semibold">Inicialización financiera</h3><p className="mt-2 max-w-2xl text-sm leading-6 text-white/65">CASA verifica qué existe realmente y te lleva en orden desde la estructura hasta el asiento de apertura. Nada se marca completo por apariencia.</p><div className="mt-5 flex flex-wrap gap-3"><button type="button" onClick={() => { setInitializationFormError(''); setShowInitializationStart(true); }} className="inline-flex items-center gap-2 rounded-full bg-[#e4c26f] px-5 py-3 text-sm font-bold text-[#071a33] hover:bg-white"><Plus size={16} /> Iniciar inicialización</button><button type="button" onClick={() => { setInitializationFormError(''); setShowInitializationRows(true); }} className="inline-flex items-center gap-2 rounded-full border border-white/25 px-5 py-3 text-sm font-bold text-white hover:bg-white/10"><UploadCloud size={16} /> Cargar datos históricos</button></div></div>
              <div className="shrink-0 rounded-2xl bg-white/10 px-4 py-3 text-center"><p className="text-2xl font-semibold text-[#e4c26f]">{initializationComplete}/{initializationChecks.length}</p><p className="text-xs text-white/55">controles completos</p></div>
            </div>
          </section>
          {initializationView !== 'overview' && (
            <section className="order-4 rounded-[1.6rem] border border-[#071a33]/10 bg-white p-6 shadow-[0_16px_45px_rgba(7,26,51,.05)] sm:p-8">
              <button type="button" onClick={() => setInitializationView('overview')} className="inline-flex items-center gap-2 text-sm font-bold text-[#8a6726]"><ArrowRight className="rotate-180" size={16} /> Volver a la ruta de inicialización</button>
              {initializationView === 'owner-balances' && <form onSubmit={saveOwnerOpeningBalance}><p className="mt-6 text-xs font-bold uppercase tracking-[.16em] text-[#9a742b]">Paso 01 · Saldo de apertura</p><h3 className="mt-2 text-2xl font-semibold">Saldos iniciales por propietario</h3><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">Carga la posición final al día de corte. Un monto positivo es deuda; un monto negativo se reconoce automáticamente como saldo a favor y se lleva a anticipos. No tienes que cargar avisos ni pagos antiguos para usar esta modalidad.</p>{initializationFormError && <div role="alert" className="mt-5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">{initializationFormError}</div>}<div className="mt-6 grid gap-5 sm:grid-cols-2"><Field label="Apartamento"><select name="propertyId" className={inputClass} required><option value="">Selecciona un apartamento</option>{(client?.properties ?? []).map(property => { const hasOpeningBalance = openingBalancePropertyIds.has(property.id); return <option key={property.id} value={property.id} disabled={hasOpeningBalance}>{property.code}{hasOpeningBalance ? ' · saldo inicial guardado' : ''}</option>; })}</select></Field><Field label="Saldo al corte" hint="Ej.: 250 si debe USD 250; -50 si tiene USD 50 a favor."><input name="signedBalance" type="number" step="0.01" className={inputClass} placeholder="0.00" required /></Field><div className="rounded-xl border border-[#b08a3c]/25 bg-[#fffaf0] px-4 py-3 text-sm text-slate-700"><p className="font-semibold text-[#071a33]">Fecha de corte del expediente</p><p className="mt-1">{initializationCase?.cutoverDate ? formatDate(initializationCase.cutoverDate.slice(0, 10)) : 'Cargando fecha del expediente…'}</p><p className="mt-1 text-xs leading-5 text-slate-500">Esta fecha ya se definió al crear el expediente y se aplicará automáticamente a este saldo.</p></div><Field label="Moneda"><select name="currency" className={inputClass}><option value="USD">USD</option><option value="VES">VES</option></select></Field></div><Field label="Observación" hint="Opcional: referencia al estado de cuenta entregado por el condominio."><input name="description" className={inputClass} placeholder="Ej. Estado final legacy al 31/08" /></Field><button type="submit" disabled={!initializationCase?.cutoverDate} className="mt-6 rounded-full bg-[#071a33] px-5 py-3 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-50">Guardar saldo de apertura</button></form>}
              {initializationView === 'payables' && <><p className="mt-6 text-xs font-bold uppercase tracking-[.16em] text-[#9a742b]">Paso 02 · Obligaciones pendientes</p><h3 className="mt-2 text-2xl font-semibold">Cuentas por pagar</h3><p className="mt-2 text-sm leading-6 text-slate-600">Registra las facturas y compromisos que el condominio ya debía al día de corte.</p><div className="mt-6 grid gap-5 sm:grid-cols-2"><Field label="Proveedor"><input className={inputClass} placeholder="Seleccionar o crear proveedor" /></Field><Field label="Factura o referencia"><input className={inputClass} placeholder="Ej. FAC-1024" /></Field><Field label="Monto pendiente"><input type="number" step="0.01" className={inputClass} /></Field><Field label="Vencimiento"><input type="date" className={inputClass} /></Field></div><button type="button" className="mt-6 rounded-full bg-[#071a33] px-5 py-3 text-sm font-bold text-white">Guardar cuenta por pagar</button></>}
              {initializationView === 'banks' && <><p className="mt-6 text-xs font-bold uppercase tracking-[.16em] text-[#9a742b]">Paso 03 · Tesorería</p><h3 className="mt-2 text-2xl font-semibold">Saldos de bancos y fondos</h3><p className="mt-2 text-sm leading-6 text-slate-600">Registra el saldo conciliado de cada cuenta bancaria, caja y fondo al día de corte.</p></>}
              {initializationView === 'notices' && <><p className="mt-6 text-xs font-bold uppercase tracking-[.16em] text-[#9a742b]">Historia opcional · primero avisos</p><h3 className="mt-2 text-2xl font-semibold">Avisos de cobro históricos</h3><p className="mt-2 text-sm leading-6 text-slate-600">Usa esta página solo si deseas conservar detalle histórico. Carga primero el aviso consolidado por mes; luego sus cargos por categoría y la asignación a apartamentos.</p></>}
              {initializationView === 'payments' && <><p className="mt-6 text-xs font-bold uppercase tracking-[.16em] text-[#9a742b]">Historia opcional · después pagos</p><h3 className="mt-2 text-2xl font-semibold">Pagos históricos</h3><p className="mt-2 text-sm leading-6 text-slate-600">Carga pagos después de los avisos. CASA los aplica a la deuda y convierte automáticamente cualquier excedente en saldo a favor.</p></>}
              {initializationView === 'reconciliation' && <><p className="mt-6 text-xs font-bold uppercase tracking-[.16em] text-[#9a742b]">Paso final</p><h3 className="mt-2 text-2xl font-semibold">Conciliación y asiento de apertura</h3><p className="mt-2 text-sm leading-6 text-slate-600">Compara los saldos por propietario, cuentas por pagar, bancos y contabilidad antes de aplicar la apertura.</p></>}
            </section>
          )}
          <section className="order-2 rounded-[1.6rem] border-2 border-[#c99b3d]/40 bg-[#fffaf0] p-5 shadow-[0_16px_45px_rgba(7,26,51,.05)] sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div><p className="text-xs font-bold uppercase tracking-[.16em] text-[#9a742b]">Carga inicial</p><h3 className="mt-2 text-xl font-semibold text-[#071a33]">¿Dónde cargo los saldos?</h3><p className="mt-1 max-w-2xl text-sm leading-6 text-slate-600">Aquí comienza la carga real. Selecciona una categoría para preparar el lote que quedará asociado al expediente de esta comunidad.</p></div>
              <button type="button" onClick={() => { setInitializationFormError(''); setShowInitializationRows(true); }} className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-[#071a33] px-5 py-3 text-sm font-bold text-white"><UploadCloud size={17} /> Cargar saldos y movimientos</button>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{[
              ['owner-balances', '1. Saldos de apertura', 'Deuda, solvencia o saldo a favor por apartamento'],
              ['payables', '2. Cuentas por pagar', 'Facturas y compromisos pendientes'],
              ['banks', '3. Bancos y fondos', 'Saldos conciliados al corte'],
              ['reconciliation', '4. Conciliar y abrir', 'Validar antes de contabilizar'],
              ['notices', 'Historia opcional: avisos', 'Primero avisos, si se conservará detalle'],
              ['payments', 'Historia opcional: pagos', 'Después de los avisos'],
            ].map(([view, label, detail]) => <button key={label} type="button" onClick={() => setInitializationView(view as InitializationView)} className="rounded-2xl border border-[#071a33]/10 bg-white p-4 text-left transition hover:border-[#c99b3d] hover:shadow-sm"><p className="text-sm font-bold text-[#071a33]">{label}</p><p className="mt-1 text-xs leading-5 text-slate-500">{detail}</p><span className="mt-3 inline-flex text-[10px] font-bold uppercase tracking-[.12em] text-[#9a742b]">Abrir sección →</span></button>)}</div>
          </section>
          <section className="order-3 rounded-[1.6rem] border border-[#071a33]/8 bg-white p-4 shadow-[0_16px_45px_rgba(7,26,51,.04)]">
            <div className="flex items-start gap-3 border-b border-slate-100 pb-3"><ClipboardList className="mt-0.5 text-[#9a742b]" size={19} /><div><h3 className="font-semibold">Guía de inicialización</h3><p className="mt-0.5 text-xs text-slate-500">Sigue este orden para evitar diferencias.</p></div></div>
            <div className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">{initializationChecks.map(check => {
              const tone = check.status === 'complete' ? 'border-emerald-200 bg-emerald-50/60' : check.status === 'warning' ? 'border-amber-200 bg-amber-50/60' : 'border-slate-200 bg-[#fcfbf8]';
              return <article key={check.id} className={`flex gap-2 rounded-xl border p-3 ${tone}`}><span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white text-xs font-bold text-[#9a742b] shadow-sm">{check.order}</span><div className="min-w-0 flex-1"><div className="flex items-center justify-between gap-1"><h4 className="truncate text-xs font-bold text-[#071a33]">{check.label}</h4><span className={`text-[10px] font-bold ${check.status === 'complete' ? 'text-emerald-700' : check.status === 'warning' ? 'text-amber-700' : 'text-slate-500'}`}>{check.status === 'complete' ? 'OK' : check.status === 'warning' ? 'Rev.' : 'Pend.'}</span></div><p className="mt-1 line-clamp-2 text-[11px] leading-4 text-slate-500">{check.evidence}</p></div></article>;
            })}</div>
          </section>
          <section className="rounded-[1.6rem] border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-950"><strong>Regla de seguridad:</strong> los avisos y pagos históricos se cargan antes de calcular el saldo inicial. El asiento de apertura solo se habilita cuando los saldos por apartamento coinciden con las cuentas contables; las cuentas agrupadoras únicamente suman sus hijas.</section>
        </section>
      )}

      {tab === 'validation' && onboardingCase && (
        <section className="grid gap-5 xl:grid-cols-[1fr_340px]">
          <div className="rounded-[1.6rem] border border-[#071a33]/8 bg-white shadow-[0_16px_45px_rgba(7,26,51,.04)]">
            <header className="flex flex-col gap-3 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
              <div>
                <p className="text-xs font-bold uppercase tracking-[.16em] text-[#9a742b]">Control de calidad</p>
                <h3 className="mt-2 text-xl font-semibold">Hallazgos de incorporación</h3>
                <p className="mt-1 text-sm text-slate-500">Nada se descarta ni se corrige silenciosamente.</p>
              </div>
              <div className="flex rounded-xl bg-slate-100 p-1 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setFindingFilter('open')}
                  className={`rounded-lg px-3 py-1.5 transition ${findingFilter === 'open' ? 'bg-[#071a33] text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                >
                  Abiertos ({onboardingCase.findings.filter(f => f.status === 'open').length})
                </button>
                <button
                  type="button"
                  onClick={() => setFindingFilter('resolved')}
                  className={`rounded-lg px-3 py-1.5 transition ${findingFilter === 'resolved' ? 'bg-[#071a33] text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                >
                  Histórico resueltos ({onboardingCase.findings.filter(f => f.status === 'resolved').length})
                </button>
              </div>
            </header>
            <div className="divide-y divide-slate-100">
              {onboardingCase.findings
                .filter(finding => findingFilter === 'open' ? finding.status === 'open' : finding.status !== 'open')
                .map(finding => {
                  const meta = severityMeta[finding.severity];
                  const Icon = meta.icon;
                  return (
                    <article key={finding.id} className="p-5 sm:p-6">
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                        <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${meta.className}`}>
                          <Icon size={18} />
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[.1em] ring-1 ring-inset ${meta.className}`}>
                              {meta.label}
                            </span>
                            <span className="text-xs font-semibold text-slate-400">{finding.area}</span>
                            {finding.status !== 'open' && (
                              <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold uppercase text-emerald-700">
                                Resuelto
                              </span>
                            )}
                          </div>
                          <h4 className="mt-3 font-bold">{finding.title}</h4>
                          <p className="mt-1 text-sm leading-6 text-slate-500">{finding.detail}</p>
                        </div>
                        {finding.status === 'open' && (
                          <div className="flex flex-col gap-2 shrink-0 sm:flex-row sm:items-center">
                            <button
                              type="button"
                              onClick={() => handleNavigateToResolve(finding)}
                              className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#071a33] px-3.5 py-2 text-xs font-bold text-white transition hover:bg-[#b08a3c]"
                            >
                              <ArrowRight size={14} /> Ir a resolver
                            </button>
                            <button
                              type="button"
                              onClick={() => resolveFinding(finding.id)}
                              className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold hover:border-[#b08a3c]"
                            >
                              Verificar
                            </button>
                          </div>
                        )}
                      </div>
                    </article>
                  );
                })}
              {onboardingCase.findings.filter(finding => findingFilter === 'open' ? finding.status === 'open' : finding.status !== 'open').length === 0 && (
                <div className="p-12 text-center">
                  <CheckCircle2 className="mx-auto text-emerald-600" size={36} />
                  <p className="mt-3 text-base font-bold">
                    {findingFilter === 'open' ? '¡Sin hallazgos abiertos!' : 'Aún no hay hallazgos en el histórico de resueltos'}
                  </p>
                  <p className="mt-1 text-sm text-slate-500 max-w-sm mx-auto">
                    {findingFilter === 'open'
                      ? 'Todas las alícuotas, personas, cuentas bancarias y parámetros operativos están verificados y en orden.'
                      : 'Los hallazgos corregidos o conciliados aparecerán en esta lista.'}
                  </p>
                </div>
              )}
            </div>
          </div>
          <aside className="space-y-5">
            <section className="rounded-[1.6rem] bg-[#071a33] p-5 text-white">
              <FileCheck2 className="text-[#e4c26f]" size={23} />
              <p className="mt-4 text-xs font-bold uppercase tracking-[.15em] text-[#e4c26f]">Condición de salida</p>
              <h3 className="mt-2 text-xl font-semibold">Cero diferencias sin explicar</h3>
              <p className="mt-3 text-sm leading-6 text-white/50">La activación exigirá conciliar estructura, alícuotas, pagos, saldos y reportes oficiales.</p>
              <button type="button" onClick={handleRunValidations} className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-bold text-[#071a33] hover:bg-[#fbfaf7] transition"><Play size={16} />Ejecutar validaciones</button>
            </section>
            <section className="rounded-[1.6rem] border border-[#071a33]/8 bg-white p-5">
              <p className="text-xs font-bold uppercase tracking-[.15em] text-slate-400">Resumen abierto</p>
              <div className="mt-4 space-y-3">
                <div className="flex items-center justify-between"><span className="text-sm text-slate-500">Críticos</span><strong className="text-rose-700">{openCritical}</strong></div>
                <div className="flex items-center justify-between"><span className="text-sm text-slate-500">Advertencias</span><strong className="text-amber-700">{openWarnings}</strong></div>
                <div className="flex items-center justify-between"><span className="text-sm text-slate-500">Resueltos</span><strong className="text-emerald-700">{onboardingCase.findings.filter(item => item.status === 'resolved').length}</strong></div>
              </div>
            </section>
          </aside>
        </section>
      )}



      {guideStageKey && guideStage && guideValidation && (
        <Modal
          title={`Etapa ${String(onboardingCase!.stages.findIndex(stage => stage.key === guideStageKey) + 1).padStart(2, '0')} · ${guideStage.label}`}
          copy={onboardingStageGuides[guideStageKey].purpose}
          onClose={() => setGuideStageKey(null)}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <section className="rounded-2xl bg-[#071a33] p-5 text-white">
              <p className="text-[10px] font-bold uppercase tracking-[.16em] text-[#e4c26f]">Resultado esperado</p>
              <p className="mt-3 text-sm leading-6 text-white/70">{onboardingStageGuides[guideStageKey].result}</p>
            </section>
            <section className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
              <p className="text-[10px] font-bold uppercase tracking-[.16em] text-amber-700">Punto de control</p>
              <p className="mt-3 text-sm leading-6 text-amber-900/75">{onboardingStageGuides[guideStageKey].caution}</p>
            </section>
          </div>

          <section className="mt-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[.15em] text-[#9a742b]">Qué debes hacer</p>
                <h4 className="mt-1 font-bold text-[#071a33]">Procedimiento recomendado</h4>
              </div>
              <span className={`rounded-full px-3 py-1 text-xs font-bold ${guideValidation.passed ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                {guideValidation.requirements.filter(item => item.passed).length}/{guideValidation.requirements.length} controles
              </span>
            </div>
            <ol className="mt-4 space-y-2">
              {onboardingStageGuides[guideStageKey].tasks.map((task, index) => (
                <li key={task} className="flex gap-3 rounded-xl bg-[#f8f6f1] px-4 py-3 text-sm leading-6 text-slate-600">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#e9dfca] text-xs font-bold text-[#806020]">{index + 1}</span>
                  {task}
                </li>
              ))}
            </ol>
          </section>

          <section className="mt-6 border-t border-slate-100 pt-6">
            <p className="text-xs font-bold uppercase tracking-[.15em] text-[#9a742b]">Lista de pendientes comprobable</p>
            <div className="mt-3 space-y-3">
              {guideValidation.requirements.map(item => (
                <div key={item.id} className={`flex gap-3 rounded-2xl border p-4 ${item.passed ? 'border-emerald-200 bg-emerald-50/60' : 'border-rose-200 bg-rose-50/60'}`}>
                  <span className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${item.passed ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'}`}>
                    {item.passed ? <Check size={15} /> : <X size={15} />}
                  </span>
                  <div>
                    <p className={`text-sm font-bold ${item.passed ? 'text-emerald-950' : 'text-rose-950'}`}>{item.label}</p>
                    <p className={`mt-1 text-xs leading-5 ${item.passed ? 'text-emerald-800/70' : 'text-rose-800/75'}`}>{item.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {guideStage.status === 'completed' ? (
            <div className="mt-6 flex items-center justify-center gap-2 rounded-2xl bg-emerald-50 px-5 py-4 text-sm font-bold text-emerald-700">
              <BadgeCheck size={18} /> Esta etapa ya fue completada
            </div>
          ) : guideStageKey === 'activation' ? (
            <button type="button" onClick={handleGuideAction} className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#071a33] px-6 py-3.5 text-sm font-bold text-white">
              <ShieldAlert size={17} /> Revisar preparación de salida
            </button>
          ) : (
            <div className="mt-6 space-y-3">

              <button type="button" onClick={handleGuideAction} className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#071a33] px-6 py-3.5 text-sm font-bold text-white">
                {guideStage.status === 'in-progress' && guideValidation.passed ? <BadgeCheck size={17} /> : <ArrowRight size={17} />}
                Completar etapa
              </button>
              <p className="text-center text-xs leading-5 text-slate-400">
                {guideStage.status === 'in-progress' && guideValidation.passed
                  ? 'Se abrirá la confirmación final; todavía no se activará al cliente.'
                  : `CASA te llevará a: ${onboardingStageGuides[guideStageKey].actionLabel}.`}
              </p>
            </div>
          )}
        </Modal>
      )}

      {showOperationsModal && onboardingCase && (
        <Modal
          title="Configuración operativa de salida"
          copy="Define quién coordina la incorporación y desde qué fecha CASA asumirá la operación."
          onClose={() => setShowOperationsModal(false)}
        >
          <form onSubmit={saveOperations}>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Coordinador de incorporación" hint="Persona responsable de coordinar validaciones, pendientes y salida en vivo.">
                <input name="coordinator" className={inputClass} defaultValue={onboardingCase.coordinator} required placeholder="Nombre y apellido" />
              </Field>
              <Field label="Fecha de corte" hint="Último día del sistema anterior y punto de inicio operativo de CASA.">
                <input name="cutoverDate" type="date" className={inputClass} defaultValue={onboardingCase.cutoverDate} required />
              </Field>
              <Field label="Responsable de la fuente" span hint="Persona del cliente o proveedor que responde por la entrega de los datos originales.">
                <input name="sourceOwner" className={inputClass} defaultValue={onboardingCase.sourceOwner} required placeholder="Nombre, cargo u organización" />
              </Field>
            </div>
            <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900/75">
              Guardar esta información no completa automáticamente la etapa. Aún deben configurarse tesorería, permisos, políticas y comunicaciones.
            </div>
            <button type="submit" className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#071a33] px-6 py-3.5 text-sm font-bold text-white">
              <Check size={17} /> Guardar configuración operativa
            </button>
            <button type="button" onClick={() => { setShowOperationsModal(false); if (client) onNavigate({ view: 'core', clientId: client.id, section: 'banking' }); }} className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-full border border-slate-200 px-6 py-3.5 text-sm font-bold text-[#071a33]">
              <ArrowRight size={17} /> Configurar tesorería
            </button>
          </form>
        </Modal>
      )}

      {showInitializationStart && onboardingCase && (
        <Modal title="Iniciar inicialización financiera" copy="Define el corte y la ventana de historia que CASA conservará antes de cargar cualquier aviso, pago o saldo." onClose={() => !initializationStarting && setShowInitializationStart(false)}>
          <form onSubmit={startInitialization} className="space-y-5">
            {initializationFormError && <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">{initializationFormError}</div>}
            <Field label="Fecha de corte" hint="Es el día en que CASA toma el control. El sistema anterior queda cerrado el día anterior; los saldos se calcularán hasta ese corte."><input name="cutoverDate" type="date" className={inputClass} required /></Field>
            <div className="grid gap-5 sm:grid-cols-2"><Field label="Historia desde" hint="Primer día de la historia legacy que quieres conservar y consultar dentro de CASA."><input name="historyFrom" type="date" className={inputClass} required /></Field><Field label="Historia hasta" hint="Último día de la historia que se importará. Normalmente coincide con el día anterior a la fecha de corte."><input name="historyTo" type="date" className={inputClass} required /></Field></div>
            <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-950">Después de crear el expediente podrás cargar filas históricas. La contabilidad no se modifica hasta validar y aplicar la inicialización.</div>
            <button type="submit" disabled={initializationStarting} className="w-full rounded-full bg-[#071a33] px-5 py-3.5 text-sm font-bold text-white disabled:opacity-50">{initializationStarting ? 'Creando expediente…' : 'Crear expediente y comenzar carga'}</button>
          </form>
        </Modal>
      )}

      {showInitializationRows && onboardingCase && (
        <Modal title="Cargar datos históricos" copy="Registra un aviso, pago, saldo o cuenta por pagar con sus datos de negocio. El sistema lo asociará al expediente de esta comunidad." onClose={() => setShowInitializationRows(false)}>
          <form onSubmit={loadInitializationRows} className="space-y-5">
            {initializationFormError && <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">{initializationFormError}</div>}
            <div className="grid gap-5 sm:grid-cols-2"><Field label="Tipo de registro"><select name="kind" className={inputClass} required><option value="OWNER_BALANCE">Saldo del propietario</option><option value="OWNER_PAYMENT">Pago histórico</option><option value="CHARGE_NOTICE">Aviso de cobro</option><option value="PAYABLE">Cuenta por pagar</option><option value="BANK_BALANCE">Saldo bancario</option></select></Field><Field label="Apartamento"><select name="propertyId" className={inputClass}><option value="">Selecciona apartamento</option>{(client?.properties ?? []).map(property => <option key={property.id} value={property.id}>{property.code}</option>)}</select></Field></div>
            <div className="grid gap-5 sm:grid-cols-2"><Field label="Referencia"><input name="externalRef" className={inputClass} required placeholder="Ej. AV-JUL-001" /></Field><Field label="Fecha"><input name="eventDate" type="date" className={inputClass} required /></Field></div>
            <Field label="Descripción"><input name="description" className={inputClass} required placeholder="Describe el aviso, pago o saldo" /></Field>
            <div className="grid gap-5 sm:grid-cols-2"><Field label="Monto"><input name="amount" type="number" min="0.01" step="0.01" className={inputClass} required /></Field><Field label="Moneda"><select name="currency" className={inputClass}><option value="USD">USD</option><option value="VES">VES</option><option value="EUR">EUR</option></select></Field></div>
            <div className="grid gap-5 sm:grid-cols-2"><Field label="Cuenta de débito" hint="Selecciona la cuenta de movimiento que recibe el débito."><input name="debitAccountId" className={inputClass} required placeholder="Código o ID de cuenta" /></Field><Field label="Cuenta de crédito" hint="Selecciona la cuenta de movimiento que recibe el crédito."><input name="creditAccountId" className={inputClass} required placeholder="Código o ID de cuenta" /></Field></div>
            <Field label="Período del aviso" hint="Solo requerido para avisos históricos, por ejemplo 2026-07."><input name="periodKey" className={inputClass} placeholder="AAAA-MM" pattern="\d{4}-(0[1-9]|1[0-2])" /></Field>
            <Field label="Proveedor (para cuentas por pagar)" hint="Usa el ID del proveedor registrado en CASA."><input name="vendorId" className={inputClass} placeholder="ID del proveedor" /></Field>
            <button type="submit" className="w-full rounded-full bg-[#071a33] px-5 py-3.5 text-sm font-bold text-white">Guardar registro pendiente de validación</button>
          </form>
        </Modal>
      )}

      {stageReview && currentStage && (
        <Modal
          title={stageReview.passed ? `Confirmar · ${currentStage.label}` : `Etapa bloqueada · ${currentStage.label}`}
          copy={stageReview.passed
            ? 'Todos los controles disponibles aprobaron. Revisa el resultado antes de cambiar el expediente.'
            : 'La etapa no será modificada. Corrige los requisitos pendientes y vuelve a ejecutar la verificación.'}
          onClose={() => { setStageReview(null); setCompletionConfirmed(false); }}
        >
          <div className="space-y-3">
            {stageReview.requirements.map(item => (
              <div key={item.id} className={`flex gap-3 rounded-2xl border p-4 ${item.passed ? 'border-emerald-200 bg-emerald-50/70' : 'border-rose-200 bg-rose-50/70'}`}>
                <span className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${item.passed ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'}`}>
                  {item.passed ? <Check size={15} /> : <X size={15} />}
                </span>
                <div>
                  <p className={`text-sm font-bold ${item.passed ? 'text-emerald-950' : 'text-rose-950'}`}>{item.label}</p>
                  <p className={`mt-1 text-xs leading-5 ${item.passed ? 'text-emerald-800/70' : 'text-rose-800/75'}`}>{item.detail}</p>
                </div>
              </div>
            ))}
          </div>

          {stageReview.passed ? (
            <div className="mt-6">
              <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-[#071a33]/10 bg-[#f8f6f1] p-4">
                <input
                  type="checkbox"
                  checked={completionConfirmed}
                  onChange={event => setCompletionConfirmed(event.target.checked)}
                  className="mt-0.5 h-4 w-4 accent-[#071a33]"
                />
                <span className="text-sm leading-6 text-slate-600">Revisé los controles y confirmo que deseo completar únicamente esta etapa. Esta acción no activa ni integra al cliente.</span>
              </label>
              <button
                type="button"
                onClick={confirmStageCompletion}
                disabled={!completionConfirmed}
                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#071a33] px-6 py-3.5 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-35"
              >
                <BadgeCheck size={17} /> Confirmar y completar etapa
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => { setStageReview(null); setCompletionConfirmed(false); }}
              className="mt-6 inline-flex w-full items-center justify-center rounded-full border border-slate-200 px-6 py-3.5 text-sm font-bold text-[#071a33]"
            >
              Entendido, volver al expediente
            </button>
          )}
        </Modal>
      )}

      {toast && <div className="fixed bottom-5 left-1/2 z-[160] flex -translate-x-1/2 items-center gap-3 rounded-full bg-[#071a33] px-5 py-3 text-sm font-semibold text-white shadow-2xl"><CheckCircle2 size={18} className="text-[#e4c26f]" />{toast}</div>}
    </div>
  );
}
