import type { OnboardingCase, OnboardingCounts, OnboardingStageKey, ValidationFinding } from './onboarding';
import type { PlatformClient } from './superAdmin';
import { CoreRepository } from '../services/CoreRepository';

export interface StageRequirement {
  id: string;
  label: string;
  detail: string;
  passed: boolean;
}

export interface StageValidation {
  stageKey: OnboardingStageKey;
  passed: boolean;
  requirements: StageRequirement[];
}

function requirement(id: string, label: string, detail: string, passed: boolean): StageRequirement {
  return { id, label, detail, passed };
}

function findingText(finding: ValidationFinding) {
  return `${finding.area} ${finding.title} ${finding.detail}`.toLocaleLowerCase('es');
}

function hasOpenCritical(onboardingCase: OnboardingCase, terms: string[]) {
  return onboardingCase.findings.some(finding =>
    finding.status === 'open'
    && finding.severity === 'critical'
    && terms.some(term => findingText(finding).includes(term)),
  );
}

function priorStagesCompleted(onboardingCase: OnboardingCase, stageKey: OnboardingStageKey) {
  const index = onboardingCase.stages.findIndex(stage => stage.key === stageKey);
  return index > 0 && onboardingCase.stages.slice(0, index).every(stage => stage.status === 'completed');
}

function validDateRange(from: string, to: string) {
  if (!from || !to) return false;
  const fromTime = Date.parse(from);
  const toTime = Date.parse(to);
  return Number.isFinite(fromTime) && Number.isFinite(toTime) && fromTime <= toTime;
}

export function resolveOnboardingCounts(
  onboardingCase: OnboardingCase,
  client?: PlatformClient | null,
): OnboardingCounts {
  let apartments = onboardingCase.counts.apartments;
  let townhouses = onboardingCase.counts.townhouses;
  let commercialUnits = onboardingCase.counts.commercialUnits;
  let buildings = onboardingCase.counts.buildings;
  let concessions = onboardingCase.counts.concessions;
  let people = onboardingCase.counts.people;

  if (client?.properties && client.properties.length > 0) {
    const clientApartments = client.properties.filter(p => p.kind === 'apartment').length;
    const clientTownhouses = client.properties.filter(p => p.kind === 'townhouse').length;
    const clientCommercial = client.properties.filter(p => p.kind === 'commercial').length;
    apartments = Math.max(apartments, clientApartments);
    townhouses = Math.max(townhouses, clientTownhouses);
    commercialUnits = Math.max(commercialUnits, clientCommercial);
  }

  try {
    const coreState = CoreRepository.load();
    const clientId = onboardingCase.clientId;
    const community = coreState.communities.find(
      c => c.clientId === clientId || c.id === `community_${clientId}` || c.id === clientId || (client?.communityId && c.id === client.communityId)
    );
    const targetCommunityId = community?.id ?? (client?.communityId || `community_${clientId}`);

    const allCorePeopleCount = Math.max(
      coreState.people.length,
      coreState.communityPeople.length,
      coreState.ownerships.length,
      coreState.employments.length,
      coreState.boardAppointments.length,
      coreState.memberships.length
    );

    if (targetCommunityId) {
      const coreProperties = coreState.properties.filter(p => p.communityId === targetCommunityId || (community && p.communityId === community.id));
      const coreLocations = coreState.propertyLocations.filter(l => l.communityId === targetCommunityId || (community && l.communityId === community.id));
      const coreConcessions = coreState.concessions.filter(c => c.communityId === targetCommunityId || (community && c.communityId === community.id));

      const linkedPeopleIds = new Set([
        ...coreState.communityPeople.filter(cp => cp.communityId === targetCommunityId || (community && cp.communityId === community.id)).map(cp => cp.personId),
        ...coreState.ownerships.filter(o => o.communityId === targetCommunityId || (community && o.communityId === community.id)).map(o => o.personId),
        ...coreState.employments.filter(e => e.communityId === targetCommunityId || (community && e.communityId === community.id)).map(e => e.personId),
        ...coreState.boardAppointments.filter(b => b.communityId === targetCommunityId || (community && b.communityId === community.id)).map(b => b.personId),
        ...coreState.memberships.filter(m => m.communityId === targetCommunityId || (community && m.communityId === community.id)).map(m => m.personId),
      ]);

      const coreApartments = coreProperties.filter(p => p.kind === 'apartment').length;
      const coreTownhouses = coreProperties.filter(p => p.kind === 'townhouse').length;
      const coreCommercial = coreProperties.filter(p => p.kind === 'commercial').length;
      const coreBuildings = coreLocations.length;
      const coreConcessionsCount = coreConcessions.length;
      const corePeopleCount = Math.max(linkedPeopleIds.size, allCorePeopleCount);

      apartments = Math.max(apartments, coreApartments);
      townhouses = Math.max(townhouses, coreTownhouses);
      commercialUnits = Math.max(commercialUnits, coreCommercial);
      buildings = Math.max(buildings, coreBuildings);
      concessions = Math.max(concessions, coreConcessionsCount);
      people = Math.max(people, corePeopleCount);
    } else {
      people = Math.max(people, allCorePeopleCount);
    }
  } catch {
    // Ignore error
  }

  return {
    buildings,
    apartments,
    townhouses,
    commercialUnits,
    concessions,
    people,
    openBalances: onboardingCase.counts.openBalances,
  };
}

export function validateOnboardingStage(
  stageKey: OnboardingStageKey,
  onboardingCase: OnboardingCase,
  client: PlatformClient,
): StageValidation {
  const verifiedBatches = onboardingCase.batches.filter(batch => ['validated', 'imported'].includes(batch.status));
  const allBatchesImported = onboardingCase.batches.length > 0
    && onboardingCase.batches.every(batch => batch.status === 'imported');
  const openCritical = onboardingCase.findings.filter(finding => finding.status === 'open' && finding.severity === 'critical');
  const openWarnings = onboardingCase.findings.filter(finding => finding.status === 'open' && finding.severity === 'warning');

  const counts = resolveOnboardingCounts(onboardingCase, client);
  const primaryUnits = counts.apartments + counts.townhouses + counts.commercialUnits;

  const hasManualSource = onboardingCase.batches.some(batch => batch.sourceType === 'manual');
  const hasDirectData = primaryUnits > 0 || counts.people > 0;
  const isManualMode = hasManualSource || (onboardingCase.batches.length === 0 && hasDirectData);

  let requirements: StageRequirement[];

  switch (stageKey) {
    case 'identity':
      requirements = [
        requirement('identity-client', 'Identidad legal completa', 'Nombre legal, RIF y ubicación registrados.', Boolean(client.name.trim() && client.legalName.trim() && client.rif.trim() && client.location.trim())),
        requirement('identity-contact', 'Responsable de contacto completo', 'Nombre, correo y teléfono disponibles para la incorporación.', Boolean(client.contactName.trim() && client.contactEmail.trim() && client.contactPhone.trim())),
        requirement('identity-license', 'Licencia habilitada', 'La licencia no puede estar revocada, suspendida ni vencida.', !['revoked', 'suspended', 'expired'].includes(client.license.status)),
      ];
      break;
    case 'sources':
      requirements = [
        requirement('sources-registered', 'Fuente registrada', 'Debe existir al menos una fuente bajo custodia o haberse registrado carga manual.', onboardingCase.batches.length > 0 || isManualMode),
        requirement('sources-history', 'Ventana histórica válida', 'Las fechas desde/hasta deben estar definidas o indicarse carga manual.', validDateRange(onboardingCase.historicalFrom, onboardingCase.historicalTo) || isManualMode),
        requirement('sources-processed', 'Extracción validada', 'Al menos un lote debe haber sido validado/importado o registrarse carga manual.', verifiedBatches.length > 0 || isManualMode),
        requirement('sources-integrity', 'Integridad comprobada', 'Todos los lotes deben tener hash contabilizado o ser levantamiento manual.', isManualMode || (onboardingCase.batches.length > 0 && onboardingCase.batches.every(batch => Boolean(batch.checksum) && batch.tableCount > 0 && batch.rowCount > 0))),
        requirement('sources-failures', 'Sin lotes fallidos', 'No puede existir una extracción en estado fallido.', !onboardingCase.batches.some(batch => batch.status === 'failed')),
      ];
      break;
    case 'structure':
      requirements = [
        requirement('structure-prior', 'Etapas anteriores aprobadas', 'Identidad y fuentes deben estar completadas.', priorStagesCompleted(onboardingCase, stageKey)),
        requirement('structure-import', 'Estructura cargada', 'La estructura debe provenir de un lote o del levantamiento manual directo.', verifiedBatches.length > 0 || isManualMode || primaryUnits > 0),
        requirement('structure-units', 'Universo inmobiliario definido', 'Debe existir al menos un apartamento, townhouse o local comercial.', primaryUnits > 0),
        requirement('structure-findings', 'Sin bloqueos estructurales', 'No puede haber hallazgos críticos abiertos sobre inmuebles, alícuotas, edificios o concesiones.', !hasOpenCritical(onboardingCase, ['estructura', 'inmueble', 'alícuota', 'alicuota', 'edificio', 'concesión', 'concesion'])),
      ];
      break;
    case 'people':
      requirements = [
        requirement('people-prior', 'Etapas anteriores aprobadas', 'La estructura inmobiliaria debe estar completada.', priorStagesCompleted(onboardingCase, stageKey)),
        requirement('people-import', 'Personas cargadas', 'La información de personas debe provenir de un lote o de la carga manual directa.', verifiedBatches.length > 0 || isManualMode || counts.people > 0),
        requirement('people-count', 'Universo de personas definido', 'Debe existir al menos una persona registrada.', counts.people > 0),
        requirement('people-findings', 'Sin relaciones críticas pendientes', 'Propietarios, junta, personal y participaciones no pueden tener bloqueos críticos.', !hasOpenCritical(onboardingCase, ['persona', 'propiet', 'junta', 'personal', 'participación', 'participacion'])),
      ];
      break;
    case 'finances':
      requirements = [
        requirement('finances-prior', 'Etapas anteriores aprobadas', 'Personas y relaciones deben estar completadas.', priorStagesCompleted(onboardingCase, stageKey)),
        requirement('finances-import', 'Historia financiera procesada', 'Todos los lotes registrados deben alcanzarse como importados o carga manual.', allBatchesImported || isManualMode),
        requirement('finances-history', 'Período contable delimitado', 'La ventana histórica debe ser válida o declararse carga manual.', validDateRange(onboardingCase.historicalFrom, onboardingCase.historicalTo) || isManualMode),
        requirement('finances-findings', 'Sin bloqueos financieros', 'Saldos, pagos, avisos y fondos no pueden tener diferencias críticas abiertas.', !hasOpenCritical(onboardingCase, ['financ', 'contab', 'saldo', 'pago', 'aviso', 'fondo', 'cobranza'])),
      ];
      break;
    case 'operations':
      requirements = [
        requirement('operations-prior', 'Etapas anteriores aprobadas', 'La historia financiera debe estar completada.', priorStagesCompleted(onboardingCase, stageKey)),
        requirement('operations-coordinator', 'Responsable de salida asignado', 'Debe existir un coordinador identificable para la puesta en marcha.', Boolean(onboardingCase.coordinator.trim())),
        requirement('operations-cutover', 'Fecha de corte definida', 'Debe indicarse la fecha operativa de transición a CASA.', Boolean(onboardingCase.cutoverDate) && Number.isFinite(Date.parse(onboardingCase.cutoverDate))),
        requirement('operations-findings', 'Sin bloqueos operativos', 'Banca, permisos, políticas y comunicaciones no pueden tener hallazgos críticos abiertos.', !hasOpenCritical(onboardingCase, ['operación', 'operacion', 'banca', 'permiso', 'política', 'politica', 'comunicación', 'comunicacion'])),
      ];
      break;
    case 'validation':
      requirements = [
        requirement('validation-prior', 'Ruta previa completada', 'Las seis etapas anteriores deben estar aprobadas.', priorStagesCompleted(onboardingCase, stageKey)),
        requirement('validation-import', 'Importación / Carga finalizada', 'Todos los lotes registrados deben estar importados o ser carga manual.', allBatchesImported || isManualMode),
        requirement('validation-critical', 'Cero críticos abiertos', 'Todo hallazgo crítico debe estar resuelto.', openCritical.length === 0),
        requirement('validation-warning', 'Advertencias atendidas', 'Cada advertencia debe estar resuelta o aceptada expresamente.', openWarnings.length === 0),
      ];
      break;
    case 'activation':
      requirements = [
        requirement('activation-prior', 'Expediente aprobado', 'Las siete etapas anteriores deben estar completadas.', priorStagesCompleted(onboardingCase, stageKey)),
        requirement('activation-ready', 'Caso listo para activación', 'La conciliación debe dejar el expediente en estado listo.', onboardingCase.status === 'ready'),
        requirement('activation-cutover', 'Fecha de corte confirmada', 'La salida en vivo debe tener una fecha definida.', Boolean(onboardingCase.cutoverDate) && Number.isFinite(Date.parse(onboardingCase.cutoverDate))),
        requirement('activation-findings', 'Cero asuntos abiertos', 'No puede quedar ningún crítico ni advertencia sin atender.', openCritical.length === 0 && openWarnings.length === 0),
        requirement('activation-import', 'Fuentes procesadas o cargadas', 'Todos los lotes deben estar importados o ser carga manual.', allBatchesImported || isManualMode),
      ];
      break;
  }

  return { stageKey, passed: requirements.every(item => item.passed), requirements };
}

export function runValidationDiagnostics(
  onboardingCase: OnboardingCase,
  client?: PlatformClient | null,
): {
  updatedCase: OnboardingCase;
  criticalCount: number;
  warningCount: number;
  summaryMessage: string;
  aliquotSum: number;
} {
  const now = new Date().toISOString();
  let coreState;
  try {
    coreState = CoreRepository.load();
  } catch {
    coreState = null;
  }

  const clientId = onboardingCase.clientId;
  const community = coreState?.communities.find(
    c => c.clientId === clientId || c.id === `community_${clientId}` || c.id === clientId || (client?.communityId && c.id === client.communityId)
  );
  const targetCommunityId = community?.id ?? (client?.communityId || `community_${clientId}`);

  const existingFindingsMap = new Map<string, ValidationFinding>(
    onboardingCase.findings.map(f => [f.id, { ...f }])
  );

  let aliquotSum = 0;
  let propertiesCount = 0;

  if (coreState && targetCommunityId) {
    const properties = coreState.properties.filter(
      p => p.communityId === targetCommunityId || (community && p.communityId === community.id)
    );
    propertiesCount = properties.length;

    if (properties.length > 0) {
      aliquotSum = properties.reduce((sum, p) => {
        const val = typeof p.aliquot === 'number' ? p.aliquot : parseFloat(String(p.aliquot || 0)) || 0;
        return sum + val;
      }, 0);

      const roundedAliquot = Math.round(aliquotSum * 100) / 100;
      const isAliquot100 = Math.abs(roundedAliquot - 100) <= 0.01;

      if (!isAliquot100) {
        const diff = (100 - roundedAliquot).toFixed(2);
        const detailText = roundedAliquot < 100
          ? `La suma de las alícuotas de los ${properties.length} inmuebles registrados suma ${roundedAliquot.toFixed(2)}%. Falta un ${diff}% para completar el 100.00% requerido del condominio. Verifica los inmuebles o ajusta sus porcentajes.`
          : `La suma de las alícuotas de los ${properties.length} inmuebles registrados suma ${roundedAliquot.toFixed(2)}%. Excede el 100.00% requerido por un ${Math.abs(Number(diff)).toFixed(2)}%. Revisa los inmuebles o ajusta sus porcentajes alícuota.`;

        existingFindingsMap.set('finding_aliquot_sum', {
          id: 'finding_aliquot_sum',
          clientId,
          severity: 'critical',
          area: 'Estructura',
          title: `Sumatoria de alícuotas incompleta (${roundedAliquot.toFixed(2)}% / 100.00%)`,
          detail: detailText,
          affectedRecords: properties.length,
          status: 'open',
          createdAt: existingFindingsMap.get('finding_aliquot_sum')?.createdAt || now,
        });
      } else {
        if (existingFindingsMap.has('finding_aliquot_sum')) {
          const f = existingFindingsMap.get('finding_aliquot_sum')!;
          existingFindingsMap.set('finding_aliquot_sum', { ...f, status: 'resolved' });
        }
      }

      if (existingFindingsMap.has('finding_no_properties')) {
        const f = existingFindingsMap.get('finding_no_properties')!;
        existingFindingsMap.set('finding_no_properties', { ...f, status: 'resolved' });
      }
    } else {
      existingFindingsMap.set('finding_no_properties', {
        id: 'finding_no_properties',
        clientId,
        severity: 'critical',
        area: 'Estructura',
        title: 'Sin inmuebles registrados',
        detail: 'Debe existir al menos un apartamento, townhouse o local comercial en la comunidad.',
        affectedRecords: 0,
        status: 'open',
        createdAt: existingFindingsMap.get('finding_no_properties')?.createdAt || now,
      });
    }

    const peopleCount = Math.max(
      coreState.people.length,
      coreState.communityPeople.filter(cp => cp.communityId === targetCommunityId).length,
      coreState.ownerships.filter(o => o.communityId === targetCommunityId).length
    );

    if (peopleCount === 0) {
      existingFindingsMap.set('finding_no_people', {
        id: 'finding_no_people',
        clientId,
        severity: 'critical',
        area: 'Persona',
        title: 'Directorio de personas vacío',
        detail: 'No hay personas o propietarios registrados en la comunidad.',
        affectedRecords: 0,
        status: 'open',
        createdAt: existingFindingsMap.get('finding_no_people')?.createdAt || now,
      });
    } else if (existingFindingsMap.has('finding_no_people')) {
      const f = existingFindingsMap.get('finding_no_people')!;
      existingFindingsMap.set('finding_no_people', { ...f, status: 'resolved' });
    }

    const bankAccounts = coreState.bankAccounts.filter(
      b => b.communityId === targetCommunityId || (community && b.communityId === community.id)
    );
    const paymentMethods = coreState.paymentMethods.filter(
      p => p.communityId === targetCommunityId || (community && p.communityId === community.id)
    );

    if (bankAccounts.length === 0) {
      existingFindingsMap.set('finding_no_bank', {
        id: 'finding_no_bank',
        clientId,
        severity: 'warning',
        area: 'Finanzas',
        title: 'Sin cuentas bancarias receptoras',
        detail: 'No se han registrado cuentas bancarias receptoras oficiales en el módulo de tesorería.',
        affectedRecords: 0,
        status: 'open',
        createdAt: existingFindingsMap.get('finding_no_bank')?.createdAt || now,
      });
    } else if (existingFindingsMap.has('finding_no_bank')) {
      const f = existingFindingsMap.get('finding_no_bank')!;
      existingFindingsMap.set('finding_no_bank', { ...f, status: 'resolved' });
    }

    if (bankAccounts.length > 0 && paymentMethods.length === 0) {
      existingFindingsMap.set('finding_no_payment_method', {
        id: 'finding_no_payment_method',
        clientId,
        severity: 'warning',
        area: 'Finanzas',
        title: 'Sin métodos de pago activos',
        detail: 'No se han configurado métodos de pago (ej. Pago Móvil, Transferencia, Efectivo) en el módulo de tesorería.',
        affectedRecords: 0,
        status: 'open',
        createdAt: existingFindingsMap.get('finding_no_payment_method')?.createdAt || now,
      });
    } else if (existingFindingsMap.has('finding_no_payment_method')) {
      const f = existingFindingsMap.get('finding_no_payment_method')!;
      existingFindingsMap.set('finding_no_payment_method', { ...f, status: 'resolved' });
    }

    if (!onboardingCase.coordinator.trim() || !onboardingCase.cutoverDate) {
      existingFindingsMap.set('finding_no_operations', {
        id: 'finding_no_operations',
        clientId,
        severity: 'warning',
        area: 'Operaciones',
        title: 'Puesta en marcha incompleta',
        detail: 'Asigna el coordinador de salida y la fecha de corte operativa en la etapa 6.',
        affectedRecords: 0,
        status: 'open',
        createdAt: existingFindingsMap.get('finding_no_operations')?.createdAt || now,
      });
    } else if (existingFindingsMap.has('finding_no_operations')) {
      const f = existingFindingsMap.get('finding_no_operations')!;
      existingFindingsMap.set('finding_no_operations', { ...f, status: 'resolved' });
    }
  }

  const updatedFindings = Array.from(existingFindingsMap.values());
  const criticalCount = updatedFindings.filter(f => f.status === 'open' && f.severity === 'critical').length;
  const warningCount = updatedFindings.filter(f => f.status === 'open' && f.severity === 'warning').length;

  const roundedAliquot = Math.round(aliquotSum * 100) / 100;
  let summaryMessage = `Diagnóstico completado: ${criticalCount} crítico(s), ${warningCount} advertencia(s).`;
  if (propertiesCount > 0 && Math.abs(roundedAliquot - 100) > 0.01) {
    summaryMessage = `Alerta: Suma de alícuotas incompleta (${roundedAliquot.toFixed(2)}% / 100.00%). ${criticalCount} hallazgo(s) crítico(s).`;
  } else if (criticalCount === 0) {
    summaryMessage = `Validación completada con éxito: 0 hallazgos críticos. Alícuotas al 100.00%.`;
  }

  const updatedCase: OnboardingCase = {
    ...onboardingCase,
    findings: updatedFindings,
    updatedAt: now,
  };

  return {
    updatedCase,
    criticalCount,
    warningCount,
    summaryMessage,
    aliquotSum: roundedAliquot,
  };
}
