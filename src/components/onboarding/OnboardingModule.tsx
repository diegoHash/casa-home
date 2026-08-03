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
  Database,
  FileArchive,
  FileCheck2,
  FileSpreadsheet,
  Play,
  Plus,
  RefreshCw,
  ShieldAlert,
  UploadCloud,
  X,
} from 'lucide-react';
import type { PlatformClient } from '../../domain/superAdmin';
import type {
  MigrationBatchStatus,
  MigrationSourceType,
  OnboardingCase,
  OnboardingStageKey,
  OnboardingStageStatus,
  OnboardingState,
  ValidationFinding,
  ValidationSeverity,
} from '../../domain/onboarding';
import {
  createOnboardingCase,
  onboardingId,
  OnboardingRepository,
} from '../../services/OnboardingRepository';
import {
  resolveOnboardingCounts,
  runValidationDiagnostics,
  validateOnboardingStage,
  type StageValidation,
} from '../../domain/onboardingValidation';
import { onboardingStageGuides } from '../../domain/onboardingGuide';
import type { CoreSection } from '../core/CoreModule';
import ImportAssistant from './ImportAssistant';

type OnboardingTab = 'roadmap' | 'sources' | 'imports' | 'validation';

const inputClass =
  'mt-2 w-full rounded-xl border border-slate-200 bg-[#fbfaf7] px-3.5 py-3 text-sm text-[#0b1d33] outline-none transition focus:border-[#b08a3c] focus:ring-4 focus:ring-[#b08a3c]/10';

const statusLabel: Record<OnboardingStageStatus, string> = {
  pending: 'Pendiente',
  'in-progress': 'En curso',
  completed: 'Completada',
  blocked: 'Bloqueada',
};

const batchStatusLabel: Record<MigrationBatchStatus, string> = {
  registered: 'Registrado',
  extracted: 'Extraído',
  mapped: 'Mapeado',
  validated: 'Validado',
  imported: 'Importado',
  failed: 'Falló',
};

const sourceTypeLabel: Record<MigrationSourceType, string> = {
  access: 'Microsoft Access',
  excel: 'Excel',
  csv: 'CSV',
  manual: 'Carga manual',
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

export default function OnboardingModule({ clients, demoMode, onNavigate }: { clients: PlatformClient[]; demoMode: boolean; onNavigate: (destination: OnboardingDestination) => void }) {
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
  const [showSourceModal, setShowSourceModal] = useState(false);
  const [stageReview, setStageReview] = useState<StageValidation | null>(null);
  const [completionConfirmed, setCompletionConfirmed] = useState(false);
  const [guideStageKey, setGuideStageKey] = useState<OnboardingStageKey | null>(null);
  const [showOperationsModal, setShowOperationsModal] = useState(false);
  const [findingFilter, setFindingFilter] = useState<'open' | 'resolved'>('open');
  const [toast, setToast] = useState('');

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
    if (stageKey === 'sources') {
      if (demoMode) {
        setTab('sources');
        if (!onboardingCase?.batches.length) setShowSourceModal(true);
      } else {
        setTab('imports');
      }
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

  const declareManualDataEntry = () => {
    if (!onboardingCase) return;
    const now = new Date().toISOString();
    const today = now.slice(0, 10);
    const totalUnitsAndPeople =
      onboardingCase.counts.apartments +
      onboardingCase.counts.townhouses +
      onboardingCase.counts.commercialUnits +
      onboardingCase.counts.people;

    updateCase(current => {
      const alreadyHasManual = current.batches.some(b => b.sourceType === 'manual');
      const newBatches = alreadyHasManual
        ? current.batches
        : [
            {
              id: onboardingId('batch'),
              clientId: current.clientId,
              sourceType: 'manual' as MigrationSourceType,
              fileName: 'Levantamiento directo en Núcleo CASA',
              sourceLabel: 'Carga manual desde cero',
              periodFrom: current.historicalFrom || today,
              periodTo: current.historicalTo || today,
              rowCount: totalUnitsAndPeople || 1,
              tableCount: 2,
              status: 'imported' as MigrationBatchStatus,
              checksum: 'MANUAL_ENTRY_DIRECT',
              registeredAt: now,
              notes: 'Comunidad configurada mediante carga manual directa sin archivo legacy.',
            },
            ...current.batches,
          ];

      return {
        ...current,
        sourceSystem: current.sourceSystem || 'Carga manual directa',
        historicalFrom: current.historicalFrom || today,
        historicalTo: current.historicalTo || today,
        status: 'configuring',
        batches: newBatches,
        updatedAt: now,
      };
    });
    setToast('Carga manual declarada. La etapa de fuentes ha sido autorizada.');
  };

  const registerSource = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!onboardingCase) return;
    const form = new FormData(event.currentTarget);
    const sourceType = String(form.get('sourceType')) as MigrationSourceType;
    const isManual = sourceType === 'manual';
    const file = form.get('file');
    const fileName = isManual
      ? 'Levantamiento directo en Núcleo CASA'
      : (file instanceof File && file.name ? file.name : String(form.get('fileName')).trim());
    const now = new Date().toISOString();
    const today = now.slice(0, 10);

    updateCase(current => ({
      ...current,
      sourceSystem: current.sourceSystem || (isManual ? 'Carga manual directa' : sourceTypeLabel[sourceType]),
      historicalFrom: current.historicalFrom || String(form.get('periodFrom')) || today,
      historicalTo: current.historicalTo || String(form.get('periodTo')) || today,
      status: 'configuring',
      batches: [
        {
          id: onboardingId('batch'),
          clientId: current.clientId,
          sourceType,
          fileName: fileName || 'Archivo por confirmar',
          sourceLabel: isManual ? 'Carga manual desde cero' : (String(form.get('sourceLabel')).trim() || 'Fuente registrada'),
          periodFrom: String(form.get('periodFrom')) || today,
          periodTo: String(form.get('periodTo')) || today,
          rowCount: isManual ? (current.counts.apartments + current.counts.townhouses + current.counts.commercialUnits + current.counts.people) : 0,
          tableCount: isManual ? 2 : 0,
          status: isManual ? 'imported' : 'registered',
          checksum: isManual ? 'MANUAL_ENTRY_DIRECT' : '',
          registeredAt: now,
          notes: isManual ? 'Configuración realizada mediante carga manual en el sistema.' : String(form.get('notes')).trim(),
        },
        ...current.batches,
      ],
      updatedAt: now,
    }));
    setShowSourceModal(false);
    setToast(isManual ? 'Carga manual declarada correctamente.' : 'Fuente registrada. El archivo aún no ha sido extraído.');
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
    demoMode
      ? { id: 'sources', label: 'Fuentes y lotes · demo' }
      : { id: 'imports', label: 'Asistente de importación' },
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

      {tab === 'sources' && onboardingCase && (
        <section className="rounded-[1.6rem] border border-[#071a33]/8 bg-white shadow-[0_16px_45px_rgba(7,26,51,.04)]">
          <header className="flex flex-col gap-4 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
            <div><p className="text-xs font-bold uppercase tracking-[.16em] text-[#9a742b]">Custodia y trazabilidad</p><h3 className="mt-2 text-xl font-semibold">Fuentes y lotes de migración</h3><p className="mt-1 text-sm text-slate-500">Puedes migrar un archivo legacy o declarar la creación de datos de forma manual.</p></div>
            <div className="flex flex-wrap items-center gap-2">
              <button type="button" onClick={declareManualDataEntry} className="inline-flex items-center justify-center gap-2 rounded-full border border-[#071a33]/20 bg-white px-4 py-3 text-sm font-bold text-[#071a33] hover:border-[#b08a3c]"><FileSpreadsheet size={16} />Declarar carga manual desde cero</button>
              <button type="button" onClick={() => setShowSourceModal(true)} className="inline-flex items-center justify-center gap-2 rounded-full bg-[#071a33] px-5 py-3 text-sm font-bold text-white"><Plus size={16} />Registrar fuente</button>
            </div>
          </header>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[920px] text-left text-sm">
              <thead className="border-b border-slate-100 bg-[#fbfaf7] text-[11px] font-bold uppercase tracking-[.13em] text-slate-400"><tr><th className="px-6 py-3">Fuente</th><th className="px-4 py-3">Archivo</th><th className="px-4 py-3">Período</th><th className="px-4 py-3">Volumen</th><th className="px-4 py-3">Estado</th><th className="px-6 py-3">Registro</th></tr></thead>
              <tbody>{onboardingCase.batches.map(batch => <tr key={batch.id} className="border-b border-slate-100"><td className="px-6 py-4"><p className="font-bold">{sourceTypeLabel[batch.sourceType]}</p><p className="mt-1 text-xs text-slate-400">{batch.sourceLabel}</p></td><td className="px-4 py-4"><p className="font-mono text-xs">{batch.fileName}</p><p className="mt-1 text-xs text-slate-400">{batch.checksum ? `SHA-256 ${batch.checksum.slice(0, 12)}…` : 'Hash pendiente'}</p></td><td className="px-4 py-4 text-xs text-slate-500">{formatDate(batch.periodFrom)}<br />{formatDate(batch.periodTo)}</td><td className="px-4 py-4"><p className="font-bold">{batch.rowCount.toLocaleString('es-VE')} filas</p><p className="mt-1 text-xs text-slate-400">{batch.tableCount} tablas</p></td><td className="px-4 py-4"><span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700">{batchStatusLabel[batch.status]}</span></td><td className="px-6 py-4 text-xs text-slate-400">{new Intl.DateTimeFormat('es-VE', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(batch.registeredAt))}</td></tr>)}</tbody>
            </table>
          </div>
        </section>
      )}

      {tab === 'imports' && client && <ImportAssistant clientId={client.id} />}

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

      {showSourceModal && (
        <Modal title="Registrar fuente de información" copy="Crea el registro de custodia. Puedes seleccionar Carga manual si estás construyendo la comunidad directamente en CASA." onClose={() => setShowSourceModal(false)}>
          <form onSubmit={registerSource}>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Tipo de fuente"><select name="sourceType" className={inputClass} defaultValue="manual">{Object.entries(sourceTypeLabel).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></Field>
              <Field label="Descripción"><input name="sourceLabel" className={inputClass} required placeholder="Carga manual en Núcleo CASA" defaultValue="Carga manual desde cero" /></Field>
              <Field label="Seleccionar archivo (opcional para carga manual)" span hint="Si seleccionaste Carga manual, no necesitas adjuntar archivos."><label className="mt-2 flex cursor-pointer items-center justify-center gap-3 rounded-xl border border-dashed border-slate-300 bg-[#fbfaf7] px-4 py-5 text-sm font-semibold text-slate-500 hover:border-[#b08a3c]"><UploadCloud size={19} /><span>Elegir archivo local (opcional)</span><input name="file" type="file" className="sr-only" accept=".mdb,.accdb,.xlsx,.xls,.csv" /></label><input name="fileName" className={inputClass} placeholder="O escribe el nombre si aún no lo tienes" /></Field>
              <Field label="Historia desde"><input name="periodFrom" type="date" className={inputClass} defaultValue={new Date().toISOString().slice(0, 10)} required /></Field>
              <Field label="Historia hasta"><input name="periodTo" type="date" className={inputClass} defaultValue={new Date().toISOString().slice(0, 10)} required /></Field>
              <Field label="Notas de custodia" span><textarea name="notes" className={`${inputClass} min-h-24 resize-y`} placeholder="Detalles de la fuente o notas de carga manual en la comunidad…" /></Field>
            </div>
            <button type="submit" className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#071a33] px-6 py-3.5 text-sm font-bold text-white"><Database size={17} />Registrar fuente</button>
          </form>
        </Modal>
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
              {guideStageKey === 'sources' && !onboardingCase?.batches.some(b => b.sourceType === 'manual') && (
                <button
                  type="button"
                  onClick={declareManualDataEntry}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-amber-300 bg-amber-50 px-6 py-3 text-sm font-bold text-amber-900 hover:bg-amber-100 transition"
                >
                  <FileSpreadsheet size={17} />
                  Declarar carga manual desde cero (Sin archivo legacy)
                </button>
              )}
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
