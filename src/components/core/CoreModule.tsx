import { useEffect, useMemo, useState, type Dispatch, type FormEvent, type ReactNode, type SetStateAction } from 'react';
import { safeRandomUUID } from '../../utils/uuid';
import {
  ArrowRight,
  ArrowLeftRight,
  BadgeCheck,
  Banknote,
  BookOpenCheck,
  BriefcaseBusiness,
  Building2,
  ChevronDown,
  CircleUserRound,
  CreditCard,
  Landmark,
  Link2,
  MapPinned,
  Info,
  Pencil,
  Plus,
  Settings2,
  ShieldCheck,
  Smartphone,
  Store,
  UsersRound,
  Upload,
  X,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  membershipKindLabels,
  propertyKindLabels,
  propertyLocationKindLabels,
  type AdministrationMode,
  type Community,
  type CoreState,
  type PropertyKind,
  type PropertyLocationKind,
} from '../../domain/core';
import { auditEntry, CoreRepository, createCoreId } from '../../services/CoreRepository';
import { RootSession } from '../../services/RootSession';
import { casaApi, CasaAuthService } from '../../services/CasaAuthService';
import { CasaPlatformService } from '../../services/CasaPlatformService';
import type { CommunityAccessRecord } from '../../services/CasaPlatformService';
import { CommunityWorkspaceService } from '../../services/CommunityWorkspaceService';
import { roleCatalog, roleLabel, scopeCatalog, scopesForWorkspaceFull } from '../../config/communityAccessCatalog';
import { workspaceCatalog, workspaceLabel } from '../../config/workspaceCatalog';

export type CoreSection = 'summary' | 'properties' | 'people' | 'ownership' | 'staff' | 'concessions' | 'board' | 'banking' | 'validation' | 'history' | 'settings' | 'audit';
type DialogKind = 'community' | 'location' | 'property' | 'person' | 'edit-person' | 'ownership' | 'employment' | 'employment-access' | 'concession' | 'edit-concession' | 'view-concession' | 'board' | 'bank' | 'edit-bank' | 'payment-method' | 'edit-payment-method' | null;

type LifecycleKind = 'ownership' | 'employment' | 'board' | 'concession';
type LifecycleTarget = { kind: LifecycleKind; id: string; label: string } | null;
type InitialBoardMember = {
  id: string;
  firstName: string;
  lastName: string;
  documentType: 'V' | 'E' | 'J' | 'P';
  documentNumber: string;
  phone: string;
  email: string;
  position: string;
  startsOn: string;
  endsOn: string;
  propertyKind: PropertyKind;
  propertyCode: string;
  ownershipPercentage: number;
  aliquot: string;
  maximumOccupancy: number;
  braceletQuota: number;
};

const inputClass = 'mt-2 w-full rounded-xl border border-slate-200 bg-[#fbfaf7] px-3.5 py-3 text-sm text-[#0b1d33] outline-none transition focus:border-[#b08a3c] focus:ring-4 focus:ring-[#b08a3c]/10';
const emptyCommunity = {
  name: '', legalName: '', rif: '', phone: '', email: '', address: '', state: '', city: '', postalCode: '',
  administrationMode: 'board' as AdministrationMode, administratorName: '', administratorRif: '',
};

const digitsOnly = (value: string) => value.replace(/\D/g, '');
const emailCharactersOnly = (value: string) => value.replace(/[^A-Za-z0-9@._]/g, '');
const aliquotCharactersOnly = (value: string) => {
  let separator = '';
  return Array.from(value).filter(character => {
    if (/\d/.test(character)) return true;
    if ((character === '.' || character === ',') && !separator) {
      separator = character;
      return true;
    }
    return false;
  }).join('');
};

function Field({ label, children, span = false, hint }: { label: ReactNode; children: ReactNode; span?: boolean; hint?: string }) {
  return <label className={`block text-sm font-semibold text-slate-700 ${span ? 'sm:col-span-2' : ''}`}>{label}{children}{hint && <span className="mt-1.5 block text-xs font-normal text-slate-400">{hint}</span>}</label>;
}

function HelpTooltip({ text }: { text: string }) {
  return <span className="group relative ml-1.5 inline-flex align-middle" tabIndex={0} aria-label={text}><Info size={15} className="cursor-help text-[#9a742b]" /><span role="tooltip" className="pointer-events-none absolute bottom-full left-1/2 z-30 mb-2 hidden w-72 -translate-x-1/2 rounded-xl bg-[#071a33] px-3 py-2.5 text-left text-xs font-normal leading-5 text-white shadow-xl group-hover:block group-focus:block">{text}</span></span>;
}

function Dialog({ title, description, onClose, children }: { title: string; description: string; onClose: () => void; children: ReactNode }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-[#071a33]/55 p-0 backdrop-blur-sm sm:items-center sm:p-5" role="dialog" aria-modal="true" aria-label={title}>
      <div className="max-h-[94vh] w-full overflow-y-auto rounded-t-[2rem] bg-white shadow-2xl sm:max-w-3xl sm:rounded-[2rem]">
        <div className="sticky top-0 z-10 flex items-start justify-between border-b border-slate-100 bg-white/95 px-6 py-5 backdrop-blur sm:px-8">
          <div><h3 className="text-xl font-semibold text-[#071a33]">{title}</h3><p className="mt-1 text-sm text-slate-500">{description}</p></div>
          <button type="button" onClick={onClose} className="rounded-full border border-slate-200 p-2 text-slate-500 transition hover:border-[#b08a3c] hover:text-[#071a33]" aria-label="Cerrar"><X size={18} /></button>
        </div>
        <div className="p-6 sm:p-8">{children}</div>
      </div>
    </div>
  );
}

function EmptyState({ icon, title, copy, action, onClick }: { icon: ReactNode; title: string; copy: string; action: string; onClick: () => void }) {
  return <div className="rounded-[1.5rem] border border-dashed border-slate-300 bg-white px-6 py-12 text-center"><div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f1eadb] text-[#9a742b]">{icon}</div><h3 className="mt-4 font-semibold">{title}</h3><p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">{copy}</p><button type="button" onClick={onClick} className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#071a33] px-5 py-2.5 text-sm font-bold text-white"><Plus size={16} />{action}</button></div>;
}

function Badge({ children, tone = 'navy' }: { children: ReactNode; tone?: 'navy' | 'gold' | 'green' }) {
  const styles = tone === 'green' ? 'bg-emerald-50 text-emerald-700' : tone === 'gold' ? 'bg-[#f4ead1] text-[#85631f]' : 'bg-[#edf1f5] text-[#31455e]';
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${styles}`}>{children}</span>;
}

function lifecycleLabel(kind: LifecycleKind) {
  return kind === 'ownership' ? 'Propiedad'
    : kind === 'employment' ? 'Relación laboral'
      : kind === 'board' ? 'Junta de condominio'
        : 'Concesión';
}

const auditActionLabels: Record<string, string> = {
  COMMUNITY_UPDATED: 'Actualizó la comunidad',
  PERSON_LINKED: 'Vinculó una persona',
  PERSON_UPDATED: 'Actualizó una persona',
  PERSON_CONTACT_CREATED: 'Agregó un contacto',
  PERSON_CONTACT_DELETED: 'Eliminó un contacto',
  APP_USER_EMAIL_SYNCHRONIZED: 'Sincronizó el correo de acceso',
  PROPERTY_LOCATION_CREATED: 'Registró una ubicación',
  PROPERTY_CREATED: 'Registró un inmueble',
  PROPERTY_UPDATED: 'Actualizó un inmueble',
  PROPERTY_DEACTIVATED: 'Desactivó un inmueble',
  PROPERTY_CAPACITY_UPDATED: 'Actualizó capacidad y cupos',
  PROPERTY_ALIQUOT_CHANGED: 'Cambió una alícuota',
  INITIAL_BOARD_CONFIGURED: 'Configuró la junta inicial',
  OWNERSHIP_CREATED: 'Vinculó un propietario',
  OWNERSHIP_TRANSFERRED: 'Transfirió la titularidad',
  EMPLOYMENT_CREATED: 'Registró una relación laboral',
  EMPLOYMENT_ENDED: 'Finalizó una relación laboral',
  EMPLOYMENT_ACCESS_RECONCILED: 'Ajustó el acceso de un extrabajador',
  BOARD_APPOINTMENT_CREATED: 'Designó un integrante de junta',
  CONCESSION_CREATED: 'Registró una concesión',
  CONCESSION_UPDATED: 'Actualizó una concesión',
  RELATIONSHIP_ENDED: 'Finalizó una relación',
  BANK_ACCOUNT_CREATED: 'Registró una cuenta bancaria',
  PAYMENT_METHOD_CREATED: 'Registró un método de pago',
  COMMUNITY_ACCESS_CREATED: 'Creó un acceso comunitario',
  COMMUNITY_ACCESS_REACTIVATED: 'Reactivó un acceso comunitario',
  COMMUNITY_ACCESS_DELEGATED_UPDATE: 'Actualizó permisos y espacios',
  COMMUNITY_WORKSPACES_CHANGED: 'Cambió espacios de trabajo',
  EXPENSE_CATEGORY_CREATED: 'Creó una categoría de gastos',
  BILLING_PERIOD_CREATED: 'Creó un período de cobro',
  EXPENSE_POSTED: 'Registró y contabilizó un egreso',
  CHARGE_NOTICE_PREPARED: 'Preparó un aviso de cobro',
  CHARGE_NOTICE_ISSUED: 'Emitió un aviso de cobro',
  LEDGER_ACCOUNT_CREATED: 'Creó una cuenta contable',
  ACCOUNTING_PERIOD_CREATED: 'Creó un período contable',
  JOURNAL_ENTRY_CREATED: 'Creó un asiento contable',
  JOURNAL_ENTRY_POSTED: 'Contabilizó un asiento',
  JOURNAL_ENTRY_REVERSED: 'Reversó un asiento',
  ACCOUNTING_PERIOD_CLOSED: 'Cerró un período contable',
};

const auditEntityLabels: Record<string, string> = {
  Community: 'Comunidad',
  Person: 'Persona',
  PersonContact: 'Contacto de persona',
  AppUser: 'Usuario de CASA',
  PropertyLocation: 'Ubicación inmobiliaria',
  Property: 'Inmueble',
  PropertyAliquotPeriod: 'Alícuota',
  Ownership: 'Propiedad',
  Employment: 'Relación laboral',
  BoardAppointment: 'Junta de condominio',
  Concession: 'Concesión',
  BankAccount: 'Cuenta bancaria',
  PaymentMethod: 'Método de pago',
  CommunityAccess: 'Acceso comunitario',
  CommunityWorkspaceAssignment: 'Espacio de trabajo',
  ExpenseCategory: 'Categoría de gasto',
  BillingPeriod: 'Período de cobro',
  PeriodExpense: 'Egreso',
  ChargeNotice: 'Aviso de cobro',
  LedgerAccount: 'Cuenta contable',
  AccountingPeriod: 'Período contable',
  JournalEntry: 'Asiento contable',
};

const auditFieldLabels: Record<string, string> = {
  status: 'Estado',
  roleCode: 'Rol operativo',
  scopes: 'Permisos',
  workspaceCodes: 'Espacios de trabajo',
  userId: 'Usuario',
  personId: 'Persona',
  communityId: 'Comunidad',
  email: 'Correo',
  firstName: 'Nombre',
  lastName: 'Apellido',
  phone: 'Teléfono',
  position: 'Cargo',
  department: 'Departamento',
  startsOn: 'Fecha de inicio',
  endsOn: 'Fecha de finalización',
  endReason: 'Motivo de finalización',
  maximumOccupancy: 'Capacidad máxima',
  braceletQuota: 'Cupos de brazaletes',
  aliquot: 'Alícuota',
};

function readableCode(value: string) {
  return value
    .replaceAll('_', ' ')
    .toLowerCase()
    .replace(/(^|\s)\p{L}/gu, (letter) => letter.toUpperCase());
}

function repairSpanishText(value: string) {
  const replacements: Record<string, string> = {
    'Ã¡': 'á', 'Ã©': 'é', 'Ã­': 'í', 'Ã³': 'ó', 'Ãº': 'ú',
    'Ã': 'Á', 'Ã‰': 'É', 'Ã': 'Í', 'Ã“': 'Ó', 'Ãš': 'Ú',
    'Ã±': 'ñ', 'Ã‘': 'Ñ', 'Ã¼': 'ü', 'Ãœ': 'Ü',
    'Â¿': '¿', 'Â¡': '¡', 'Â·': '·', 'Â²': '²',
    'â€¦': '…', 'â€”': '—', 'â€“': '–', 'â†’': '→',
  };
  return Object.entries(replacements).reduce(
    (text, [broken, corrected]) => text.replaceAll(broken, corrected),
    value,
  );
}

function auditActionLabel(action: string) {
  return repairSpanishText(auditActionLabels[action] ?? readableCode(action));
}

function auditEntityLabel(entity: string) {
  return repairSpanishText(auditEntityLabels[entity] ?? readableCode(entity));
}

function readableAuditPayload(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(readableAuditPayload);
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([key, child]) => [
        repairSpanishText(auditFieldLabels[key] ?? readableCode(key)),
        readableAuditPayload(child),
      ]),
    );
  }
  if (typeof value === 'string') {
    const repaired = repairSpanishText(value);
    if (/^[A-Z][A-Z0-9_]+$/.test(repaired)) return readableCode(repaired);
    return repaired;
  }
  return value;
}

function formatDateTime(dateStr: string | null | undefined): string {
  if (!dateStr) return 'fecha no definida';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const day = String(d.getUTCDate()).padStart(2, '0');
    const month = String(d.getUTCMonth() + 1).padStart(2, '0');
    const year = d.getUTCFullYear();
    return `${day}-${month}-${year}`;
  } catch {
    return dateStr;
  }
}

function formatAuditTimestamp(dateStr: string | null | undefined): string {
  if (!dateStr) return '—';
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return repairSpanishText(dateStr);
  const parts = new Intl.DateTimeFormat('es-VE', {
    timeZone: 'America/Caracas',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).formatToParts(date);
  const part = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((item) => item.type === type)?.value ?? '';
  return `${part('day')}-${part('month')}-${part('year')} ${part('hour')}:${part('minute')}:${part('second')}`;
}

function normalizeAdministrationMode(value: unknown): AdministrationMode {
  const normalized = String(value ?? '').trim().toLowerCase();
  if (normalized.includes('board') || normalized.includes('junta')) return 'board';
  if (normalized.includes('internal') || normalized.includes('interna')) return 'internal';
  return 'external';
}

export default function CoreModule({ initialSection = 'summary', clientId = null, canWriteTreasury = false, onManageAccess }: { initialSection?: CoreSection; clientId?: string | null; canWriteTreasury?: boolean; onManageAccess?: (clientId: string, accessId?: string) => void }) {
  const demoMode = import.meta.env.DEV && new URLSearchParams(window.location.search).get('demo') === '1';
  const [data, setData] = useState<CoreState>(() => CoreRepository.load());
  const [selectedCommunityId, setSelectedCommunityId] = useState(() => {
    if (!demoMode) return '';
    const stored = CoreRepository.load();
    return stored.communities.find(item => item.clientId === clientId)?.id ?? stored.communities[0]?.id ?? '';
  });
  const [section, setSection] = useState<CoreSection>(initialSection);
  const [dialog, setDialog] = useState<DialogKind>(null);
  const [editingCommunity, setEditingCommunity] = useState<Community | null>(null);
  const [lifecycleTarget, setLifecycleTarget] = useState<LifecycleTarget>(null);
  const [transferOwnershipId, setTransferOwnershipId] = useState<string | null>(null);
  const [aliquotPropertyId, setAliquotPropertyId] = useState<string | null>(null);
  const [capacityPropertyId, setCapacityPropertyId] = useState<string | null>(null);
  const [selectedPersonId, setSelectedPersonId] = useState<string | null>(null);
  const [selectedConcessionId, setSelectedConcessionId] = useState<string | null>(null);
  const [selectedBankAccountId, setSelectedBankAccountId] = useState<string | null>(null);
  const [selectedPaymentMethodId, setSelectedPaymentMethodId] = useState<string | null>(null);
  const [selectedEmploymentId, setSelectedEmploymentId] = useState<string | null>(null);
  const [paymentMethodFilter, setPaymentMethodFilter] = useState<'all' | 'mobile-payment' | 'bank-transfer' | 'cash'>('all');
  const [peopleSearch, setPeopleSearch] = useState('');
  const [communityAccesses, setCommunityAccesses] = useState<CommunityAccessRecord[]>([]);
  const [accountingAccounts, setAccountingAccounts] = useState<Array<{ id: string; bankAccountId?: string | null; code: string; name: string }>>([]);
  const [notice, setNotice] = useState('');
  const [loading, setLoading] = useState(!demoMode);

  const [error, setError] = useState('');
  const [communitySaveError, setCommunitySaveError] = useState('');
  const [communitySaving, setCommunitySaving] = useState(false);
  const [communitiesReady, setCommunitiesReady] = useState(demoMode);
  const [reloadVersion, setReloadVersion] = useState(0);

  useEffect(() => {
    if (!demoMode && selectedCommunityId) {
      CommunityWorkspaceService.accountingSnapshot()
        .then((snap: { ledgerAccounts: Array<{ id: string; bankAccountId?: string | null; code: string; name: string }> }) => setAccountingAccounts(snap.ledgerAccounts))
        .catch(() => null);
    }
  }, [demoMode, selectedCommunityId]);

  // 1. Efecto para inicializar la selección de comunidad en modo real
  useEffect(() => {
    if (demoMode) return;
    let active = true;
    const initSelected = async () => {
      setCommunitiesReady(false);
      setLoading(true);
      setError('');
      try {
        if (clientId) {
          const { data: client } = await casaApi.get<any>(`/platform/clients/${clientId}`, {
            headers: { Authorization: `Bearer ${RootSession.token()}` }
          });
          if (!active) return;
          if (!client.community) throw new Error('El cliente no tiene una comunidad vinculada.');
          setSelectedCommunityId(client.community.id);
          setData(current => ({
              ...current,
              communities: [{
                id: client.community.id,
                clientId: client.id,
                licenseId: `license_${client.id}`,
                name: client.name,
                legalName: client.legalName,
                rif: client.rif,
                phone: client.contactPhone ?? '',
                email: client.contactEmail ?? '',
                address: client.community.address ?? '',
                state: client.community.state ?? '',
                city: client.community.city ?? '',
                postalCode: client.community.postalCode ?? '',
                status: (client.standing === 'SUSPENDED' ? 'inactive' : 'active') as any,
                administrationMode: normalizeAdministrationMode(client.community.administrationMode),
                administratorName: client.community.administratorName ?? '',
                administratorRif: client.community.administratorRif ?? '',
                createdAt: client.joinedAt,
                updatedAt: client.updatedAt ?? client.joinedAt,
              }]
          }));
          setCommunitiesReady(true);
        } else {
          const { data: clients } = await casaApi.get<any[]>('/platform/clients', {
            headers: { Authorization: `Bearer ${RootSession.token()}` }
          });
          if (!active) return;
          const apiCommunities = clients.filter(c => c.community).map(c => ({
            id: c.community.id,
            clientId: c.id,
            licenseId: `license_${c.id}`,
            name: c.name,
            legalName: c.legalName,
            rif: c.rif,
            phone: c.contactPhone ?? '',
            email: c.contactEmail ?? '',
            address: c.community.address ?? '',
            state: c.community.state ?? '',
            city: c.community.city ?? '',
            postalCode: c.community.postalCode ?? '',
            status: (c.standing === 'SUSPENDED' ? 'inactive' : 'active') as any,
            administrationMode: normalizeAdministrationMode(c.community.administrationMode),
            administratorName: c.community.administratorName ?? '',
            administratorRif: c.community.administratorRif ?? '',
            createdAt: c.joinedAt,
            updatedAt: c.updatedAt ?? c.joinedAt,
          }));
          
          setData(current => ({ ...current, communities: apiCommunities }));
          if (apiCommunities.length > 0) {
            setSelectedCommunityId(apiCommunities[0].id);
            setCommunitiesReady(true);
          } else {
            setSelectedCommunityId('');
            setLoading(false);
            setCommunitiesReady(true);
          }
        }
      } catch (err: any) {
        if (active) {
          setSelectedCommunityId('');
          setError(err.response?.data?.message ?? err.message ?? 'No fue posible consultar las comunidades de CASA.');
          setLoading(false);
          setCommunitiesReady(true);
        }
        console.error('Error al inicializar comunidades del Núcleo:', err);
      }
    };
    void initSelected();
    return () => {
      active = false;
    };
  }, [clientId, demoMode, reloadVersion]);

  // 2. Efecto para cargar el snapshot de comunidad del Núcleo y la Tesorería
  useEffect(() => {
    if (demoMode) return;
    if (!communitiesReady) return;
    if (!selectedCommunityId) return;
    let active = true;
    const loadSnapshot = async () => {
      setLoading(true);
      setError('');
      try {
        const rootToken = RootSession.token();
        const selectRes = await CasaAuthService.selectContext(rootToken, selectedCommunityId);
        if (!selectRes.success) throw new Error(selectRes.error);
        
        const headers = { Authorization: `Bearer ${selectRes.data.accessToken}` };
        const [coreRes, treasuryRes] = await Promise.all([
          casaApi.get<any>('/core/snapshot', { headers }),
          casaApi.get<any>('/treasury/snapshot', { headers }).catch(() => ({ data: { bankAccounts: [], paymentMethods: [] } })),
        ]);

        if (!active) return;

        const core = coreRes.data;
        const treasury = treasuryRes.data;

        let currentCommunities = data.communities;
        if (currentCommunities.length === 0) {
          const { data: clients } = await casaApi.get<any[]>('/platform/clients', {
            headers: { Authorization: `Bearer ${RootSession.token()}` }
          });
          currentCommunities = clients.filter(c => c.community).map(c => ({
            id: c.community.id,
            clientId: c.id,
            licenseId: `license_${c.id}`,
            name: c.name,
            legalName: c.legalName,
            rif: c.rif,
            phone: c.contactPhone ?? '',
            email: c.contactEmail ?? '',
            address: c.community.address ?? '',
            state: c.community.state ?? '',
            city: c.community.city ?? '',
            postalCode: c.community.postalCode ?? '',
            status: (c.standing === 'SUSPENDED' ? 'inactive' : 'active') as any,
            administrationMode: normalizeAdministrationMode(c.community.administrationMode),
            administratorName: c.community.administratorName ?? '',
            administratorRif: c.community.administratorRif ?? '',
            createdAt: c.joinedAt,
            updatedAt: c.updatedAt ?? c.joinedAt,
          }));
        }

        const mappedData: CoreState = {
          communities: currentCommunities,
          bankAccounts: (treasury.bankAccounts ?? []).map((b: any) => ({
            id: b.id,
            communityId: selectedCommunityId,
            bankName: b.bankName,
            holder: b.holder ?? '',
            holderRif: b.holderRif ?? '',
            accountNumber: b.accountNumber,
            accountType: (b.accountType?.toLowerCase() ?? 'corriente') as any,
            currency: b.currency as any,
            active: b.status === 'ACTIVE',
          })),
          paymentMethods: (treasury.paymentMethods ?? []).map((p: any) => ({
            id: p.id,
            communityId: selectedCommunityId,
            type: (p.type?.toLowerCase()?.replace('_', '-') ?? 'cash') as any,
            label: p.label,
            currency: p.currency as any,
            bankAccountId: p.bankAccountId,
            mobilePhone: p.mobilePhone ?? '',
            mobileDocument: p.mobileDocument ?? '',
            instructions: p.instructions ?? '',
            active: p.status === 'ACTIVE',
          })),
          propertyLocations: (core.locations ?? []).map((l: any) => ({
            id: l.id,
            communityId: selectedCommunityId,
            kind: (l.kind?.toLowerCase()?.replace('_', '-') ?? 'building') as PropertyLocationKind,
            code: l.code,
            name: l.name,
            status: l.status === 'ACTIVE' ? 'active' : 'inactive',
          })),
          properties: (core.properties ?? []).map((p: any) => ({
            id: p.id,
            communityId: selectedCommunityId,
            locationId: p.locationId,
            kind: (p.kind?.toLowerCase() ?? 'apartment') as PropertyKind,
            code: p.code,
            aliquot: p.currentAliquot ? parseFloat(p.currentAliquot) : null,
            maximumOccupancy: p.maximumOccupancy ?? null,
            braceletQuota: p.braceletQuota ?? 0,
            status: p.status === 'ACTIVE' ? 'active' : 'inactive',
          })),
          propertyAliquotPeriods: (core.properties ?? []).flatMap((p: any) => 
            (p.aliquotPeriods ?? []).map((a: any) => ({
              id: a.id,
              communityId: selectedCommunityId,
              propertyId: p.id,
              aliquot: a.aliquot ? parseFloat(a.aliquot) : null,
              startsOn: a.startsOn,
              endsOn: a.endsOn,
              reason: a.reason ?? '',
              status: a.status === 'ACTIVE' ? 'active' : 'ended',
            }))
          ),
          people: (core.people ?? []).map((cp: any) => ({
            id: cp.person.id,
            firstName: cp.person.firstName,
            lastName: cp.person.lastName,
            documentType: cp.person.documentType,
            documentNumber: cp.person.documentNumber,
            phone: cp.person.phone ?? '',
            email: cp.person.email ?? '',
            createdAt: cp.person.createdAt,
            contacts: cp.person.contacts ?? [],
          })),
          communityPeople: (core.people ?? []).map((cp: any) => ({
            id: cp.id,
            communityId: selectedCommunityId,
            personId: cp.person.id,
            status: cp.status === 'ACTIVE' ? 'active' : 'inactive',
            registeredAt: cp.createdAt,
          })),
          ownerships: (core.ownerships ?? []).map((o: any) => ({
            id: o.id,
            communityId: selectedCommunityId,
            propertyId: o.propertyId,
            personId: o.personId,
            ownershipPercentage: o.ownershipPercentage ? parseFloat(o.ownershipPercentage) : 100,
            startsOn: o.startsOn,
            endsOn: o.endsOn,
            endReason: o.endReason,
            status: o.status === 'ACTIVE' ? 'active' : 'ended',
          })),
          employments: (core.employments ?? []).map((e: any) => ({
            id: e.id,
            communityId: selectedCommunityId,
            personId: e.personId,
            position: e.position,
            department: e.department,
            engagementType: (e.engagementType?.toLowerCase()?.replace('_', '-') ?? 'employee') as any,
            startsOn: e.startsOn,
            endsOn: e.endsOn,
            endReason: e.endReason,
            status: e.status === 'ACTIVE' ? 'active' : 'ended',
          })),
          memberships: [],
          boardAppointments: (core.boardAppointments ?? []).map((b: any) => ({
            id: b.id,
            communityId: selectedCommunityId,
            personId: b.personId,
            propertyId: b.propertyId,
            position: b.position,
            startsOn: b.startsOn,
            endsOn: b.endsOn,
            endReason: b.endReason,
            status: b.status === 'ACTIVE' ? 'active' : 'ended',
          })),
          concessions: (core.concessions ?? []).map((c: any) => ({
            id: c.id,
            communityId: selectedCommunityId,
            code: c.code,
            name: c.name,
            holderName: c.holderName,
            holderDocument: c.holderDocument,
            locationDescription: c.locationDescription ?? '',
            monthlyAmount: c.monthlyAmount ? parseFloat(c.monthlyAmount) : 0,
            currency: c.currency as any,
            startsOn: c.startsOn,
            endsOn: c.endsOn,
            endReason: c.endReason,
            status: c.status === 'ACTIVE' ? 'active' : 'ended',
          })),
          audit: (core.auditEvents ?? []).map((ae: any) => ({
            id: ae.id,
            communityId: ae.communityId,
            action: ae.action,
            entity: ae.entityType,
            detail: ae.detail,
            actor: ae.actor?.person
              ? `${ae.actor.person.firstName} ${ae.actor.person.lastName}`
              : ae.actor?.email,
            reason: ae.reason,
            before: ae.before,
            after: ae.after,
            createdAt: ae.createdAt,
          })),
        };

        setData(mappedData);
      } catch (err: any) {
        if (active) {
          setError(err.message || 'No fue posible conectar con la API de CASA.');
        }
      } finally {
        if (active) setLoading(false);
      }
    };
    void loadSnapshot();
    return () => {
      active = false;
    };
  }, [selectedCommunityId, demoMode, communitiesReady]);

  useEffect(() => {
    CoreRepository.save(data);
  }, [data]);

  useEffect(() => {
    if (!notice) return;
    const timeout = window.setTimeout(() => setNotice(''), 3500);
    return () => window.clearTimeout(timeout);
  }, [notice]);

  const community = data.communities.find(item => item.id === selectedCommunityId) ?? null;
  const locations = data.propertyLocations.filter(item => item.communityId === selectedCommunityId);
  const properties = data.properties.filter(item => item.communityId === selectedCommunityId);
  const bankAccounts = data.bankAccounts.filter(item => item.communityId === selectedCommunityId);
  const paymentMethods = data.paymentMethods.filter(item => item.communityId === selectedCommunityId);
  const memberships = data.memberships.filter(item => item.communityId === selectedCommunityId);
  const communityPeople = data.communityPeople.filter(item => item.communityId === selectedCommunityId && item.status === 'active');
  const ownerships = data.ownerships.filter(item => item.communityId === selectedCommunityId && item.status === 'active');
  const employments = useMemo(() => {
    const uniqueByPerson = new Map<string, (typeof data.employments)[number]>();
    data.employments
      .filter(
        (item) =>
          item.communityId === selectedCommunityId && item.status === 'active',
      )
      .forEach((item) => {
        if (!uniqueByPerson.has(item.personId)) {
          uniqueByPerson.set(item.personId, item);
        }
      });
    return Array.from(uniqueByPerson.values());
  }, [data.employments, selectedCommunityId]);
  const board = data.boardAppointments.filter(item => item.communityId === selectedCommunityId && item.status === 'active');
  const concessions = data.concessions.filter(item => item.communityId === selectedCommunityId && item.status === 'active');
  const audit = data.audit.filter(item => item.communityId === selectedCommunityId);
  const people = useMemo(() => data.people.filter(person => communityPeople.some(item => item.personId === person.id) || memberships.some(item => item.personId === person.id) || board.some(item => item.personId === person.id) || ownerships.some(item => item.personId === person.id)), [data.people, communityPeople, memberships, board, ownerships]);
  const filteredPeople = useMemo(() => {
    const term = peopleSearch.trim().toLowerCase();
    if (!term) return people;
    return people.filter((person) => {
      const ownedPropertyCodes = ownerships
        .filter((ownership) => ownership.personId === person.id)
        .map((ownership) => propertyName(ownership.propertyId))
        .join(' ');
      return `${person.firstName} ${person.lastName} ${person.documentType}-${person.documentNumber} ${person.documentNumber} ${ownedPropertyCodes}`
        .toLowerCase()
        .includes(term);
    });
  }, [people, peopleSearch, ownerships]);

  useEffect(() => {
    if (demoMode || !community?.clientId) {
      setCommunityAccesses([]);
      return;
    }
    let active = true;
    void CasaPlatformService.listCommunityAccess(community.clientId)
      .then((accesses) => {
        if (active) setCommunityAccesses(accesses);
      })
      .catch(() => {
        if (active) setCommunityAccesses([]);
      });
    return () => { active = false; };
  }, [community?.clientId, demoMode, reloadVersion]);
  const ownershipCoverageComplete = properties.length > 0 && properties.every(property => {
    const assigned = ownerships.filter(item => item.propertyId === property.id).reduce((sum, item) => sum + item.ownershipPercentage, 0);
    return Math.abs(assigned - 100) < 0.001;
  });
  const validationChecks = [
    { label: 'Identidad legal y ubicación', passed: Boolean(community?.legalName && community.rif && community.address && community.city && community.state) },
    { label: 'Inventario inmobiliario', passed: properties.length > 0 },
    { label: 'Titularidad completa por inmueble', passed: ownershipCoverageComplete },
    { label: 'Junta o esquema administrativo', passed: board.length > 0 || community?.administrationMode !== 'board' },
    { label: 'Cuenta bancaria receptora', passed: bankAccounts.length > 0 },
    { label: 'Método de pago habilitado', passed: paymentMethods.length > 0 },
  ];
  const canActivate = validationChecks.every(item => item.passed);

  const personName = (personId: string) => {
    const person = data.people.find(item => item.id === personId);
    return person ? `${person.firstName} ${person.lastName}` : 'Persona no disponible';
  };
  const propertyName = (propertyId: string | null) => {
    const property = data.properties.find(item => item.id === propertyId);
    return property?.code ?? 'Sin inmueble asociado';
  };
  const locationName = (locationId: string | null) => {
    const location = data.propertyLocations.find(item => item.id === locationId);
    return location ? `${location.name} · ${location.code}` : 'Ubicación directa';
  };
  const commit = (producer: (current: CoreState) => CoreState) => setData(current => producer(current));

  const openCommunity = (current?: Community) => {
    setCommunitySaveError('');
    setEditingCommunity(current ?? null);
    setDialog('community');
  };

  const saveCommunity = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const now = new Date().toISOString();
    let id = editingCommunity?.id ?? createCoreId('community');
    let record: Community = {
      id,
      clientId: editingCommunity?.clientId ?? null,
      licenseId: editingCommunity?.licenseId ?? null,
      name: String(form.get('name')).trim(),
      legalName: String(form.get('legalName')).trim(),
      rif: String(form.get('rif')).trim().toUpperCase(),
      phone: String(form.get('phone')).trim(),
      email: String(form.get('email')).trim().toLowerCase(),
      address: String(form.get('address')).trim(),
      state: String(form.get('state')).trim(),
      city: String(form.get('city')).trim(),
      postalCode: String(form.get('postalCode')).trim(),
      status: editingCommunity?.status ?? 'draft',
      administrationMode: String(form.get('administrationMode')) as AdministrationMode,
      administratorName: String(form.get('administratorName')).trim(),
      administratorRif: String(form.get('administratorRif')).trim().toUpperCase(),
      createdAt: editingCommunity?.createdAt ?? now,
      updatedAt: now,
    };
    const boardMembers = record.administrationMode === 'board'
      ? JSON.parse(String(form.get('boardMembers') || '[]')) as InitialBoardMember[]
      : [];

    const doSave = async () => {
      setCommunitySaving(true);
      setCommunitySaveError('');
      try {
        let setupMembers: Array<{ personId: string; propertyId: string; ownershipId: string; appointmentId: string }> = [];
        if (!demoMode) {
          if (!editingCommunity) {
            const created = await CasaPlatformService.createClient({
              name: record.name,
              legalName: record.legalName,
              rif: record.rif,
              contactName: String(form.get('contactName')).trim(),
              contactEmail: record.email,
              contactPhone: record.phone,
              address: record.address,
              state: record.state,
              city: record.city,
              postalCode: record.postalCode,
              monthlyFee: Number(form.get('monthlyFee')),
              onboardingProgress: 0,
            });
            id = created.communityId;
            record = {
              ...record,
              id,
              clientId: created.clientId,
              licenseId: created.licenseId,
            };
            // Si falla un paso posterior, el siguiente intento continúa sobre
            // la comunidad ya creada y no intenta duplicar el mismo RIF.
            setEditingCommunity(record);
          }

          const selectRes = await CasaAuthService.selectContext(
            RootSession.token(),
            id,
          );
          if (!selectRes.success) throw new Error(selectRes.error);
          const headers = { Authorization: `Bearer ${selectRes.data.accessToken}` };
          const communityResponse = await casaApi.patch('/core/community', {
            name: record.name,
            legalName: record.legalName,
            rif: record.rif,
            phone: record.phone,
            email: record.email || undefined,
            address: record.address,
            state: record.state,
            city: record.city,
            postalCode: record.postalCode,
            administrationMode: record.administrationMode.toUpperCase(),
            administratorName: record.administrationMode === 'board' ? undefined : record.administratorName || undefined,
            administratorRif: record.administrationMode === 'board' ? undefined : record.administratorRif || undefined,
          }, { headers });
          const persisted = communityResponse.data;
          record = {
            ...record,
            name: persisted.name,
            legalName: persisted.legalName,
            rif: persisted.rif,
            phone: persisted.phone,
            email: persisted.email,
            address: persisted.address,
            state: persisted.state,
            city: persisted.city,
            postalCode: persisted.postalCode,
            administrationMode: normalizeAdministrationMode(
              persisted.administrationMode,
            ),
            administratorName: persisted.administratorName ?? '',
            administratorRif: persisted.administratorRif ?? '',
            updatedAt: persisted.updatedAt ?? new Date().toISOString(),
          };
          if (boardMembers.length) {
            const response = await casaApi.post('/core/board-administration/setup', {
              members: boardMembers.map(member => ({
                ...member,
                id: undefined,
                propertyKind: member.propertyKind.toUpperCase(),
                aliquot: member.aliquot === '' ? undefined : Number(member.aliquot),
                endsOn: member.endsOn || undefined,
                phone: member.phone || undefined,
                email: member.email || undefined,
              })),
            }, { headers });
            setupMembers = response.data.members;
          }
        } else {
          setupMembers = boardMembers.map(() => ({
            personId: createCoreId('person'),
            propertyId: createCoreId('property'),
            ownershipId: createCoreId('ownership'),
            appointmentId: createCoreId('board'),
          }));
        }

        commit(current => {
          let next = {
            ...current,
            communities: editingCommunity
              ? current.communities.map(item => item.id === id ? record : item)
              : [...current.communities, record],
            audit: [auditEntry(id, editingCommunity ? 'Actualizó' : 'Creó', 'Condominio', record.name), ...current.audit],
          };
          boardMembers.forEach((member, index) => {
            const ids = setupMembers[index];
            if (!ids) return;
            const existingPerson = next.people.find(person =>
              person.documentType === member.documentType &&
              person.documentNumber === member.documentNumber,
            );
            const personId = ids.personId;
            if (!existingPerson) {
              next.people = [...next.people, {
                id: personId,
                firstName: member.firstName,
                lastName: member.lastName,
                documentType: member.documentType,
                documentNumber: member.documentNumber,
                phone: member.phone,
                email: member.email,
                contacts: [],
                createdAt: now,
              }];
            }
            if (!next.communityPeople.some(item => item.communityId === id && item.personId === personId)) {
              next.communityPeople = [...next.communityPeople, {
                id: createCoreId('community_person'),
                communityId: id,
                personId,
                status: 'active',
                registeredAt: now,
              }];
            }
            if (!next.properties.some(property => property.id === ids.propertyId)) {
              next.properties = [...next.properties, {
                id: ids.propertyId,
                communityId: id,
                locationId: null,
                kind: member.propertyKind,
                code: member.propertyCode.toUpperCase(),
                aliquot: member.aliquot === '' ? null : Number(member.aliquot),
                maximumOccupancy: member.maximumOccupancy,
                braceletQuota: member.braceletQuota,
                status: 'active',
              }];
            }
            next.ownerships = [...next.ownerships, {
              id: ids.ownershipId,
              communityId: id,
              propertyId: ids.propertyId,
              personId,
              ownershipPercentage: member.ownershipPercentage,
              startsOn: member.startsOn,
              endsOn: null,
              status: 'active',
            }];
            next.boardAppointments = [...next.boardAppointments, {
              id: ids.appointmentId,
              communityId: id,
              personId,
              propertyId: ids.propertyId,
              position: member.position,
              startsOn: member.startsOn,
              endsOn: member.endsOn,
              status: 'active',
            }];
          });
          return next;
        });
        setSelectedCommunityId(id);
        setDialog(null);
        setEditingCommunity(null);
        setCommunitySaveError('');
        setNotice(boardMembers.length ? 'Comunidad y junta administradora registradas.' : 'Información de la comunidad guardada.');
      } catch (err: any) {
        setCommunitySaveError(
          err.response?.data?.message ||
            err.message ||
            'No fue posible guardar la comunidad.',
        );
        setNotice(err.response?.data?.message || err.message || 'No fue posible guardar la comunidad.');
      } finally {
        setCommunitySaving(false);
      }
    };
    void doSave();
  };

  const saveLocation = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!community) return;
    const form = new FormData(event.currentTarget);
    const kind = String(form.get('kind')) as PropertyLocationKind;
    const code = String(form.get('code')).trim().toUpperCase();
    const name = String(form.get('name')).trim();

    const doSave = async () => {
      try {
        let locationId = createCoreId('location');
        if (!demoMode) {
          const rootToken = RootSession.token();
          const selectRes = await CasaAuthService.selectContext(rootToken, community.id);
          if (!selectRes.success) throw new Error(selectRes.error);
          
          const res = await casaApi.post<any>('/core/locations', {
            kind: kind.toUpperCase().replace('-', '_'),
            code,
            name,
          }, {
            headers: { Authorization: `Bearer ${selectRes.data.accessToken}` }
          });
          locationId = res.data.id;
        }

        const record = {
          id: locationId, communityId: community.id,
          kind, code, name, status: 'active' as const,
        };
        commit(current => ({ ...current, propertyLocations: [...current.propertyLocations, record], audit: [auditEntry(community.id, 'Registró', 'Ubicación inmobiliaria', `${name} · ${record.code}`), ...current.audit] }));
        setDialog(null);
      } catch (err: any) {
        console.error('Error al guardar ubicación:', err);
        setNotice(err.response?.data?.message || err.message || 'No fue posible registrar la ubicación.');
      }
    };

    void doSave();
  };

  const saveProperty = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!community) return;
    const form = new FormData(event.currentTarget);
    const code = String(form.get('code')).trim().toUpperCase();
    if (properties.some(item => item.code === code)) {
      setNotice(`Ya existe un inmueble con el código ${code}.`);
      return;
    }
    const kind = String(form.get('kind')) as PropertyKind;
    const locationId = String(form.get('locationId') || '') || null;
    const aliquotStr = form.get('aliquot') ? aliquotCharactersOnly(String(form.get('aliquot'))) : undefined;
    const aliquot = aliquotStr ? Number(aliquotStr.replace(',', '.')) : undefined;
    if (aliquot !== undefined && (!Number.isFinite(aliquot) || aliquot < 0 || aliquot > 100)) {
      setNotice('La alícuota debe ser un número entre 0 y 100.');
      return;
    }
    const maximumOccupancy = Number(form.get('maximumOccupancy')) || undefined;
    const braceletQuota = Number(form.get('braceletQuota')) || 0;

    const doSave = async () => {
      try {
        let propertyId = createCoreId('property');
        if (!demoMode) {
          const rootToken = RootSession.token();
          const selectRes = await CasaAuthService.selectContext(rootToken, community.id);
          if (!selectRes.success) throw new Error(selectRes.error);
          
          const res = await casaApi.post<any>('/core/properties', {
            kind: kind.toUpperCase(),
            code,
            locationId: locationId || undefined,
            aliquot: aliquot !== undefined ? aliquot : undefined,
            aliquotStartsOn: aliquot !== undefined ? new Date().toISOString().slice(0, 10) : undefined,
            maximumOccupancy,
            braceletQuota,
          }, {
            headers: { Authorization: `Bearer ${selectRes.data.accessToken}` }
          });
          propertyId = res.data.id;
        }

        const record = {
          id: propertyId, communityId: community.id, locationId,
          kind, code,
          aliquot: aliquot !== undefined ? aliquot : null, status: 'active' as const,
          maximumOccupancy: maximumOccupancy ?? null,
          braceletQuota,
        };
        commit(current => ({
          ...current,
          properties: [...current.properties, record],
          propertyAliquotPeriods: [...current.propertyAliquotPeriods, {
            id: createCoreId('aliquot'), communityId: community.id, propertyId: record.id,
            aliquot: record.aliquot, startsOn: new Date().toISOString().slice(0, 10),
            endsOn: null, reason: 'Valor inicial', status: 'active' as const,
          }],
          audit: [auditEntry(community.id, 'Registró', 'Inmueble', record.code, { after: record }), ...current.audit],
        }));
        setDialog(null);
      } catch (err: any) {
        console.error('Error al guardar inmueble:', err);
        setNotice(err.response?.data?.message || err.message || 'No fue posible registrar el inmueble.');
      }
    };

    void doSave();
  };

  const savePerson = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!community) return;
    const form = new FormData(event.currentTarget);
    const documentType = String(form.get('documentType')) as 'V' | 'E' | 'J' | 'P';
    const documentNumber = digitsOnly(String(form.get('documentNumber')));
    const existing = data.people.find(item => item.documentType === documentType && item.documentNumber === documentNumber);
    const firstName = String(form.get('firstName')).trim().toLocaleUpperCase('es-VE');
    const lastName = String(form.get('lastName')).trim().toLocaleUpperCase('es-VE');
    const phone = String(form.get('phone')).trim();
    const email = emailCharactersOnly(String(form.get('email'))).toLowerCase();
    const propertyId = String(form.get('propertyId') || '');
    const ownershipPercentage = Number(form.get('ownershipPercentage')) || 100;
    const startsOn = String(form.get('startsOn') || new Date().toISOString().slice(0, 10));
    const property = properties.find(item => item.id === propertyId);
    const assignedPercentage = propertyId ? ownerships.filter(item => item.propertyId === propertyId).reduce((sum, item) => sum + item.ownershipPercentage, 0) : 0;
    if (propertyId && !property) {
      setNotice('Selecciona un inmueble válido para crear el vínculo.');
      return;
    }
    if (propertyId && assignedPercentage + ownershipPercentage > 100) {
      setNotice(`La participación excede el 100%. Disponible: ${Math.max(0, 100 - assignedPercentage)}%.`);
      return;
    }

    const doSave = async () => {
      try {
        let personId = existing?.id ?? createCoreId('person');
        let ownershipId = createCoreId('ownership');
        let accessToken = '';
        if (!demoMode && !existing) {
          const rootToken = RootSession.token();
          const selectRes = await CasaAuthService.selectContext(rootToken, community.id);
          if (!selectRes.success) throw new Error(selectRes.error);
          accessToken = selectRes.data.accessToken;
          
          const res = await casaApi.post<any>('/core/people', {
            firstName,
            lastName,
            documentType,
            documentNumber,
            phone: phone || undefined,
            email: email || undefined,
          }, {
            headers: { Authorization: `Bearer ${accessToken}` }
          });
          personId = res.data.person.id;
        }
        if (!demoMode && propertyId) {
          if (!accessToken) {
            const selectRes = await CasaAuthService.selectContext(RootSession.token(), community.id);
            if (!selectRes.success) throw new Error(selectRes.error);
            accessToken = selectRes.data.accessToken;
          }
          const res = await casaApi.post<any>('/core/ownerships', { personId, propertyId, ownershipPercentage, startsOn }, { headers: { Authorization: `Bearer ${accessToken}` } });
          ownershipId = res.data.id;
        }


        const person = existing ?? { id: personId, firstName, lastName, documentType, documentNumber, phone, email, createdAt: new Date().toISOString(), contacts: [] };
        const alreadyLinked = data.communityPeople.some(item => item.communityId === community.id && item.personId === personId && item.status === 'active');
        commit(current => ({
          ...current,
          people: existing ? current.people : [...current.people, person],
          communityPeople: alreadyLinked ? current.communityPeople : [...current.communityPeople, {
            id: createCoreId('community_person'), communityId: community.id, personId,
            status: 'active' as const, registeredAt: new Date().toISOString(),
          }],
          ownerships: propertyId ? [...current.ownerships, { id: ownershipId, communityId: community.id, personId, propertyId, ownershipPercentage, startsOn, endsOn: null, status: 'active' as const }] : current.ownerships,
          audit: [auditEntry(community.id, propertyId ? 'Registró y vinculó' : 'Registró', propertyId ? 'Persona e inmueble' : 'Persona', propertyId ? `${firstName} ${lastName} · ${property!.code}` : `${firstName} ${lastName}`), ...current.audit],
        }));
        setDialog(null);
      } catch (err: any) {
        console.error('Error al guardar persona:', err);
        setNotice(err.response?.data?.message || err.message || 'No fue posible registrar la persona.');
      }
    };

    void doSave();
  };

  const updatePerson = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!community || !selectedPersonId) return;
    const form = new FormData(event.currentTarget);
    const firstName = String(form.get('firstName')).trim().toLocaleUpperCase('es-VE');
    const lastName = String(form.get('lastName')).trim().toLocaleUpperCase('es-VE');
    const phone = String(form.get('phone')).trim();
    const email = String(form.get('email')).trim().toLowerCase();

    const doSave = async () => {
      try {
        if (!demoMode) {
          const rootToken = RootSession.token();
          const selectRes = await CasaAuthService.selectContext(rootToken, community.id);
          if (!selectRes.success) throw new Error(selectRes.error);
          
          await casaApi.patch<any>(`/core/people/${selectedPersonId}`, {
            firstName,
            lastName,
            phone: phone || undefined,
            email: email || undefined,
          }, {
            headers: { Authorization: `Bearer ${selectRes.data.accessToken}` }
          });
        }

        commit(current => ({
          ...current,
          people: current.people.map(item => item.id === selectedPersonId ? { ...item, firstName, lastName, phone, email } : item),
          audit: [auditEntry(community.id, 'Actualizó', 'Persona', `${firstName} ${lastName}`), ...current.audit],
        }));
        setDialog(null);
        setSelectedPersonId(null);
        setNotice('Información de la persona actualizada correctamente.');
      } catch (err: any) {
        console.error('Error al actualizar persona:', err);
        setNotice(err.response?.data?.message || err.message || 'No fue posible actualizar los datos.');
      }
    };

    void doSave();
  };

  const addPersonContact = async (
    type: 'PHONE' | 'EMAIL' | 'WHATSAPP' | 'OTHER',
    label: string,
    value: string,
  ) => {
    if (!community || !selectedPersonId) return;
    try {
      let contact = {
        id: createCoreId('contact'),
        type,
        label,
        value,
      };
      if (!demoMode) {
        const selectRes = await CasaAuthService.selectContext(
          RootSession.token(),
          community.id,
        );
        if (!selectRes.success) throw new Error(selectRes.error);
        const response = await casaApi.post(
          `/core/people/${selectedPersonId}/contacts`,
          { type, label, value },
          { headers: { Authorization: `Bearer ${selectRes.data.accessToken}` } },
        );
        contact = response.data;
      }
      commit(current => ({
        ...current,
        people: current.people.map(person =>
          person.id === selectedPersonId
            ? { ...person, contacts: [...person.contacts, contact] }
            : person,
        ),
      }));
      setNotice('Forma de contacto secundaria agregada.');
    } catch (err: any) {
      setNotice(
        err.response?.data?.message ||
          err.message ||
          'No fue posible agregar el contacto.',
      );
      throw err;
    }
  };

  const deletePersonContact = async (contactId: string) => {
    if (!community || !selectedPersonId) return;
    try {
      if (!demoMode) {
        const selectRes = await CasaAuthService.selectContext(
          RootSession.token(),
          community.id,
        );
        if (!selectRes.success) throw new Error(selectRes.error);
        await casaApi.delete(
          `/core/people/${selectedPersonId}/contacts/${contactId}`,
          { headers: { Authorization: `Bearer ${selectRes.data.accessToken}` } },
        );
      }
      commit(current => ({
        ...current,
        people: current.people.map(person =>
          person.id === selectedPersonId
            ? {
                ...person,
                contacts: person.contacts.filter(
                  contact => contact.id !== contactId,
                ),
              }
            : person,
        ),
      }));
      setNotice('Forma de contacto eliminada.');
    } catch (err: any) {
      setNotice(
        err.response?.data?.message ||
          err.message ||
          'No fue posible eliminar el contacto.',
      );
    }
  };


  const saveOwnership = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!community) return;
    const form = new FormData(event.currentTarget);
    const personId = String(form.get('personId'));
    const propertyId = String(form.get('propertyId'));
    if (!personId || !propertyId) {
      setNotice('Selecciona una persona y un inmueble para crear el vínculo.');
      return;
    }
    const ownershipPercentage = Number(form.get('ownershipPercentage')) || 100;
    const existing = ownerships.find(item => item.personId === personId && item.propertyId === propertyId);
    if (existing) {
      setNotice('Esta persona ya figura como propietaria vigente del inmueble.');
      return;
    }
    const assignedPercentage = ownerships.filter(item => item.propertyId === propertyId).reduce((sum, item) => sum + item.ownershipPercentage, 0);
    if (assignedPercentage + ownershipPercentage > 100) {
      setNotice(`La participación excede el 100%. Disponible: ${Math.max(0, 100 - assignedPercentage)}%.`);
      return;
    }
    const startsOn = String(form.get('startsOn'));

    const doSave = async () => {
      try {
        let ownershipId = createCoreId('ownership');
        if (!demoMode) {
          const rootToken = RootSession.token();
          const selectRes = await CasaAuthService.selectContext(rootToken, community.id);
          if (!selectRes.success) throw new Error(selectRes.error);
          
          const res = await casaApi.post<any>('/core/ownerships', {
            personId,
            propertyId,
            ownershipPercentage,
            startsOn,
          }, {
            headers: { Authorization: `Bearer ${selectRes.data.accessToken}` }
          });
          ownershipId = res.data.id;
        }

        const record = {
          id: ownershipId, communityId: community.id, personId, propertyId,
          ownershipPercentage,
          startsOn, endsOn: null, status: 'active' as const,
        };
        commit(current => ({
          ...current,
          ownerships: [...current.ownerships, record],
          audit: [auditEntry(community.id, 'Vinculó', 'Propietario e inmueble', `${personName(personId)} · ${propertyName(propertyId)}`), ...current.audit],
        }));
        setDialog(null);
      } catch (err: any) {
        console.error('Error al guardar propiedad:', err);
        setNotice(err.response?.data?.message || err.message || 'No fue posible vincular el propietario.');
      }
    };

    void doSave();
  };

  const saveEmployment = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!community) return;
    const form = new FormData(event.currentTarget);
    const personId = String(form.get('personId'));
    if (!personId) {
      setNotice('Selecciona una persona para crear la relación laboral.');
      return;
    }
    if (board.some(item => item.personId === personId && item.status === 'active')) {
      setNotice('No puede registrarse como trabajador porque integra la junta vigente.');
      return;
    }
    if (employments.some(item => item.personId === personId && item.status === 'active')) {
      setNotice('Esta persona ya tiene una relación laboral vigente en la comunidad.');
      return;
    }
    const position = String(form.get('position')).trim();
    const department = String(form.get('department')).trim();
    const engagementType = String(form.get('engagementType')) as 'employee' | 'professional-fee' | 'contractor';
    const startsOn = String(form.get('startsOn'));
    const endsOn = String(form.get('endsOn')) || null;

    const doSave = async () => {
      try {
        let employmentId = createCoreId('employment');
        if (!demoMode) {
          const rootToken = RootSession.token();
          const selectRes = await CasaAuthService.selectContext(rootToken, community.id);
          if (!selectRes.success) throw new Error(selectRes.error);
          
          const res = await casaApi.post<any>('/core/employments', {
            personId,
            position,
            department,
            engagementType: engagementType.toUpperCase().replace('-', '_'),
            startsOn,
          }, {
            headers: { Authorization: `Bearer ${selectRes.data.accessToken}` }
          });
          employmentId = res.data.id;
        }

        const record = {
          id: employmentId, communityId: community.id, personId,
          position, department, engagementType, startsOn, endsOn, status: 'active' as const,
        };
        commit(current => ({
          ...current,
          employments: [...current.employments, record],
          audit: [auditEntry(community.id, 'Vinculó', 'Personal del condominio', `${personName(personId)} · ${record.position}`), ...current.audit],
        }));
        setDialog(null);
      } catch (err: any) {
        console.error('Error al guardar personal:', err);
        setNotice(err.response?.data?.message || err.message || 'No fue posible vincular al trabajador.');
      }
    };

    void doSave();
  };

  const createEmploymentAccess = async (input: { personId: string; roleCode: string; workspaceCodes: string[]; scopes: string[]; pin: string }) => {
    if (!community) return;
    try {
      if (!demoMode) {
        if (!community.clientId) throw new Error('La comunidad no está asociada a un cliente de CASA.');
        await CasaPlatformService.createCommunityAccess(community.clientId, {
          personId: input.personId,
          roleCode: input.roleCode,
          workspaceCodes: input.workspaceCodes,
          scopes: input.scopes,
          temporaryPassword: input.pin,
        });
      }
      setNotice('Acceso creado. Entrega el PIN temporal al trabajador por un canal seguro.');
    } catch (err: any) {
      setNotice(err.response?.data?.message || err.message || 'No fue posible crear el acceso del trabajador.');
      throw err;
    }
  };

  const saveConcession = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!community) return;
    const form = new FormData(event.currentTarget);
    const code = String(form.get('code')).trim().toUpperCase();
    const name = String(form.get('name')).trim();
    const holderName = String(form.get('holderName')).trim();
    const holderDocument = String(form.get('holderDocument')).trim().toUpperCase();
    const locationDescription = String(form.get('locationDescription')).trim();
    const monthlyAmount = Number(form.get('monthlyAmount')) || 0;
    const currency = String(form.get('currency')) as 'VES' | 'USD';
    const startsOn = String(form.get('startsOn'));
    const endsOn = String(form.get('endsOn')) || null;
    const editing = selectedConcessionId
      ? data.concessions.find(
          (item) =>
            item.id === selectedConcessionId &&
            item.communityId === community.id &&
            item.status === 'active',
        )
      : null;

    const doSave = async () => {
      try {
        let concessionId = editing?.id ?? createCoreId('concession');
        if (!demoMode) {
          const rootToken = RootSession.token();
          const selectRes = await CasaAuthService.selectContext(rootToken, community.id);
          if (!selectRes.success) throw new Error(selectRes.error);
          const payload = {
            code,
            name,
            holderName,
            holderDocument,
            locationDescription: locationDescription || undefined,
            monthlyAmount,
            currency,
            startsOn,
            endsOn: endsOn || undefined,
          };
          const res = editing
            ? await casaApi.patch<any>(`/core/concessions/${editing.id}`, payload, {
                headers: { Authorization: `Bearer ${selectRes.data.accessToken}` },
              })
            : await casaApi.post<any>('/core/concessions', payload, {
                headers: { Authorization: `Bearer ${selectRes.data.accessToken}` },
              });
          concessionId = res.data.id;
        }

        const record = {
          id: concessionId, communityId: community.id,
          code, name, holderName, holderDocument, locationDescription, monthlyAmount, currency, startsOn, endsOn, status: 'active' as const,
        };
        commit(current => ({
          ...current,
          concessions: editing
            ? current.concessions.map((item) =>
                item.id === editing.id ? record : item,
              )
            : [...current.concessions, record],
          audit: [
            auditEntry(
              community.id,
              editing ? 'Actualizó' : 'Registró',
              'Concesión',
              `${record.code} · ${record.name}`,
              editing
                ? { before: { ...editing }, after: { ...record } }
                : { after: { ...record } },
            ),
            ...current.audit,
          ],
        }));
        setDialog(null);
        setSelectedConcessionId(null);
        setNotice(
          editing
            ? 'La concesión fue actualizada correctamente.'
            : 'La concesión fue registrada correctamente.',
        );
      } catch (err: any) {
        console.error('Error al guardar concesión:', err);
        setNotice(err.response?.data?.message || err.message || 'No fue posible guardar la concesión.');
      }
    };

    void doSave();
  };

  const saveBoardAppointment = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!community) return;
    const form = new FormData(event.currentTarget);
    const personId = String(form.get('personId'));
    if (!personId) {
      setNotice('Selecciona una persona para designarla en la junta.');
      return;
    }
    if (employments.some(item => item.personId === personId && item.status === 'active')) {
      setNotice('No puede integrar la junta porque tiene una relación laboral vigente.');
      return;
    }
    if (board.some(item => item.personId === personId && item.status === 'active')) {
      setNotice('Esta persona ya tiene una designación vigente en la junta.');
      return;
    }
    const position = String(form.get('position')).trim();
    const propertyId = String(form.get('propertyId') || '') || null;
    const startsOn = String(form.get('startsOn'));
    const endsOn = String(form.get('endsOn')) || undefined;

    const doSave = async () => {
      try {
        let boardId = createCoreId('board');
        if (!demoMode) {
          const rootToken = RootSession.token();
          const selectRes = await CasaAuthService.selectContext(rootToken, community.id);
          if (!selectRes.success) throw new Error(selectRes.error);
          
          const res = await casaApi.post<any>('/core/board-appointments', {
            personId,
            propertyId: propertyId || undefined,
            position,
            startsOn,
            endsOn: endsOn || undefined,
          }, {
            headers: { Authorization: `Bearer ${selectRes.data.accessToken}` }
          });
          boardId = res.data.id;
        }

        const record = { id: boardId, communityId: community.id, personId, propertyId, position, startsOn, endsOn: endsOn || '', status: 'active' as const };
        commit(current => ({ ...current, boardAppointments: [...current.boardAppointments, record], audit: [auditEntry(community.id, 'Designó', 'Junta de condominio', `${personName(personId)} · ${position}`), ...current.audit] }));
        setDialog(null);

      } catch (err: any) {
        console.error('Error al designar integrante de junta:', err);
        setNotice(err.response?.data?.message || err.message || 'No fue posible registrar la designación de la junta.');
      }
    };

    void doSave();
  };

  const saveBank = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!community) return;
    const form = new FormData(event.currentTarget);
    const bankName = String(form.get('bankName')).trim();
    const holder = String(form.get('holder')).trim();
    const holderRif = String(form.get('holderRif')).trim().toUpperCase();
    const accountNumber = String(form.get('accountNumber')).replace(/\s/g, '');
    const accountType = String(form.get('accountType')) as 'corriente' | 'ahorro' | 'custodia' | 'otra';
    const currency = String(form.get('currency')) as 'VES' | 'USD' | 'EUR' | 'Otra';

    const doSave = async () => {
      try {
        let bankId = createCoreId('bank');
        if (!demoMode) {
          const rootToken = RootSession.token();
          const selectRes = await CasaAuthService.selectContext(rootToken, community.id);
          if (!selectRes.success) throw new Error(selectRes.error);
          
          const res = await casaApi.post<any>('/treasury/bank-accounts', {
            bankName,
            accountNumber,
            accountType: accountType.toUpperCase(),
            currency: currency === 'Otra' ? 'VES' : currency,
            holder,
            holderRif,
          }, {
            headers: { Authorization: `Bearer ${selectRes.data.accessToken}` }
          });
          bankId = res.data.id;
        }

        const record = { id: bankId, communityId: community.id, bankName, holder, holderRif, accountNumber, accountType, currency, active: true };
        commit(current => ({ ...current, bankAccounts: [...current.bankAccounts, record], audit: [auditEntry(community.id, 'Registró', 'Cuenta bancaria', `${bankName} · ${record.currency}`), ...current.audit] }));
        setDialog(null);
      } catch (err: any) {
        console.error('Error al guardar cuenta bancaria:', err);
        setNotice(err.response?.data?.message || err.message || 'No fue posible guardar la cuenta bancaria.');
      }
    };

    void doSave();
  };

  const savePaymentMethod = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!community) return;
    const form = new FormData(event.currentTarget);
    const type = String(form.get('type')) as 'bank-transfer' | 'mobile-payment' | 'cash';
    const label = String(form.get('label')).trim();
    const currency = String(form.get('currency')) as 'VES' | 'USD' | 'EUR';
    const bankAccountId = type === 'cash' ? null : String(form.get('bankAccountId') || '') || null;
    const mobilePhone = type === 'mobile-payment' ? String(form.get('mobilePhone')).trim() : '';
    const mobileDocument = type === 'mobile-payment' ? String(form.get('mobileDocument')).trim().toUpperCase() : '';
    const instructions = String(form.get('instructions')).trim();

    if (type !== 'cash' && !bankAccountId) {
      setNotice('Selecciona la cuenta bancaria asociada al método de pago.');
      return;
    }

    const doSave = async () => {
      try {
        let methodId = createCoreId('payment_method');
        if (!demoMode) {
          const rootToken = RootSession.token();
          const selectRes = await CasaAuthService.selectContext(rootToken, community.id);
          if (!selectRes.success) throw new Error(selectRes.error);
          
          const res = await casaApi.post<any>('/treasury/payment-methods', {
            label,
            type: type.toUpperCase().replace('-', '_'),
            currency,
            bankAccountId: bankAccountId || undefined,
            mobilePhone: mobilePhone || undefined,
            mobileDocument: mobileDocument || undefined,
            instructions: instructions || undefined,
          }, {
            headers: { Authorization: `Bearer ${selectRes.data.accessToken}` }
          });
          methodId = res.data.id;
        }

        const record = {
          id: methodId, communityId: community.id, type, label,
          currency, bankAccountId, mobilePhone, mobileDocument, instructions, active: true,
        };
        commit(current => ({ ...current, paymentMethods: [...current.paymentMethods, record], audit: [auditEntry(community.id, 'Registró', 'Método de pago', label), ...current.audit] }));
        setDialog(null);
      } catch (err: any) {
        console.error('Error al guardar método de pago:', err);
        setNotice(err.response?.data?.message || err.message || 'No fue posible guardar el método de pago.');
      }
    };

    void doSave();
  };

  const updateBankAccount = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!community || !selectedBankAccountId) return;
    const form = new FormData(event.currentTarget);
    const bankName = String(form.get('bankName')).trim();
    const holder = String(form.get('holder')).trim();
    const holderRif = String(form.get('holderRif')).trim().toUpperCase();
    const accountNumber = String(form.get('accountNumber')).replace(/\s/g, '');
    const accountType = String(form.get('accountType')).trim() as 'corriente' | 'ahorro' | 'custodia' | 'otra';
    const currency = String(form.get('currency')) as 'VES' | 'USD' | 'EUR';

    const doUpdate = async () => {
      try {
        if (!demoMode) {
          const rootToken = RootSession.token();
          const selectRes = await CasaAuthService.selectContext(rootToken, community.id);
          if (!selectRes.success) throw new Error(selectRes.error);

          await casaApi.patch(
            `/treasury/bank-accounts/${selectedBankAccountId}`,
            {
              bankName,
              holder,
              holderRif,
              accountNumber,
              accountType,
              currency,
            },
            {
              headers: { Authorization: `Bearer ${selectRes.data.accessToken}` },
            },
          );
        }

        commit((current) => ({
          ...current,
          bankAccounts: current.bankAccounts.map((item) =>
            item.id === selectedBankAccountId
              ? {
                  ...item,
                  bankName,
                  holder,
                  holderRif,
                  accountNumber,
                  accountType,
                  currency,
                }
              : item,
          ),
          audit: [
            auditEntry(
              community.id,
              'Actualizó',
              'Cuenta bancaria',
              `${bankName} · ${currency}`,
            ),
            ...current.audit,
          ],
        }));
        setDialog(null);
        setSelectedBankAccountId(null);
        setNotice('Cuenta bancaria actualizada correctamente.');
      } catch (err: any) {
        console.error('Error al actualizar cuenta bancaria:', err);
        setNotice(
          err.response?.data?.message ||
            err.message ||
            'No fue posible actualizar la cuenta bancaria.',
        );
      }
    };

    void doUpdate();
  };

  const updatePaymentMethod = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!community || !selectedPaymentMethodId) return;
    const form = new FormData(event.currentTarget);
    const type = String(form.get('type')) as 'bank-transfer' | 'mobile-payment' | 'cash';
    const label = String(form.get('label')).trim();
    const currency = String(form.get('currency')) as 'VES' | 'USD' | 'EUR';
    const bankAccountId = type === 'cash' ? null : String(form.get('bankAccountId') || '') || null;
    const mobilePhone = type === 'mobile-payment' ? String(form.get('mobilePhone')).trim() : '';
    const mobileDocument = type === 'mobile-payment' ? String(form.get('mobileDocument')).trim().toUpperCase() : '';
    const instructions = String(form.get('instructions')).trim();

    if (type !== 'cash' && !bankAccountId) {
      setNotice('Selecciona la cuenta bancaria asociada al método de pago.');
      return;
    }

    const doUpdate = async () => {
      try {
        if (!demoMode) {
          const rootToken = RootSession.token();
          const selectRes = await CasaAuthService.selectContext(rootToken, community.id);
          if (!selectRes.success) throw new Error(selectRes.error);

          await casaApi.patch(
            `/treasury/payment-methods/${selectedPaymentMethodId}`,
            {
              label,
              type: type.toUpperCase().replace('-', '_'),
              currency,
              bankAccountId: bankAccountId || undefined,
              mobilePhone: mobilePhone || undefined,
              mobileDocument: mobileDocument || undefined,
              instructions: instructions || undefined,
            },
            {
              headers: { Authorization: `Bearer ${selectRes.data.accessToken}` },
            },
          );
        }

        commit((current) => ({
          ...current,
          paymentMethods: current.paymentMethods.map((item) =>
            item.id === selectedPaymentMethodId
              ? {
                  ...item,
                  label,
                  type,
                  currency,
                  bankAccountId,
                  mobilePhone,
                  mobileDocument,
                  instructions,
                }
              : item,
          ),
          audit: [
            auditEntry(
              community.id,
              'Actualizó',
              'Método de pago',
              `${label} · ${currency}`,
            ),
            ...current.audit,
          ],
        }));
        setDialog(null);
        setSelectedPaymentMethodId(null);
        setNotice('Método de pago actualizado correctamente.');
      } catch (err: any) {
        console.error('Error al actualizar método de pago:', err);
        setNotice(
          err.response?.data?.message ||
            err.message ||
            'No fue posible actualizar el método de pago.',
        );
      }
    };

    void doUpdate();
  };


  const closeLifecycle = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!community || !lifecycleTarget) return;
    const form = new FormData(event.currentTarget);
    const endsOn = String(form.get('endsOn'));
    const reason = String(form.get('reason')).trim();
    const { kind, id, label } = lifecycleTarget;

    const persistClosure = async () => {
      try {
        if (!demoMode) {
          const rootToken = RootSession.token();
          const selectRes = await CasaAuthService.selectContext(rootToken, community.id);
          if (!selectRes.success) {
            throw new Error(selectRes.error || 'No fue posible seleccionar la comunidad.');
          }
          const endpoint = kind === 'ownership'
            ? `/core/ownerships/${id}/end`
            : kind === 'employment'
              ? `/core/employments/${id}/end`
              : kind === 'board'
                ? `/core/board-appointments/${id}/end`
                : `/core/concessions/${id}/end`;
          await casaApi.patch(endpoint, { endsOn, reason }, {
            headers: { Authorization: `Bearer ${selectRes.data.accessToken}` },
          });
        }

        commit(current => {
          const collection = kind === 'ownership' ? current.ownerships
            : kind === 'employment' ? current.employments
              : kind === 'board' ? current.boardAppointments
                : current.concessions;
          const before = collection.find(item => item.id === id);
          const close = <T extends { id: string; status: string; endsOn: string | null; endReason?: string }>(items: T[]) =>
            items.map(item => item.id === id ? { ...item, status: 'ended' as const, endsOn, endReason: reason } : item);
          return {
            ...current,
            ownerships: kind === 'ownership' ? close(current.ownerships) : current.ownerships,
            employments: kind === 'employment' ? close(current.employments) : current.employments,
            boardAppointments: kind === 'board' ? close(current.boardAppointments) : current.boardAppointments,
            concessions: kind === 'concession' ? close(current.concessions) : current.concessions,
            audit: [auditEntry(community.id, 'Finalizó', lifecycleLabel(kind), label, {
              reason,
              before: before ? { ...before } : null,
              after: before ? { ...before, status: 'ended', endsOn, endReason: reason } : null,
            }), ...current.audit],
          };
        });
        setLifecycleTarget(null);
        setNotice(kind === 'employment'
          ? 'La relación laboral fue finalizada. El acceso quedó suspendido y el historial permanece disponible.'
          : 'La relación fue finalizada y permanece en el historial.');
      } catch (error: any) {
        console.error('Error al finalizar la relación:', error);
        setNotice(error.response?.data?.message || error.message || 'No fue posible finalizar la relación.');
      }
    };

    void persistClosure();
  };

  const transferOwnership = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!community || !transferOwnershipId) return;
    const source = data.ownerships.find(item => item.id === transferOwnershipId && item.status === 'active');
    if (!source) return;
    const form = new FormData(event.currentTarget);
    const personId = String(form.get('personId'));
    const transferDate = String(form.get('transferDate'));
    const reason = String(form.get('reason')).trim();
    if (personId === source.personId) {
      setNotice('Selecciona una persona distinta al propietario actual.');
      return;
    }
    const persistTransfer = async () => {
      try {
        let replacementId = createCoreId('ownership');
        if (!demoMode) {
          const rootToken = RootSession.token();
          const selectRes = await CasaAuthService.selectContext(rootToken, community.id);
          if (!selectRes.success) throw new Error(selectRes.error);
          const response = await casaApi.post<any>(`/core/ownerships/${source.id}/transfer`, {
            personId,
            transferDate,
            reason,
          }, {
            headers: { Authorization: `Bearer ${selectRes.data.accessToken}` },
          });
          replacementId = response.data.ownership?.id ?? response.data.id ?? replacementId;
        }
        const replacement = {
          ...source,
          id: replacementId,
          personId,
          startsOn: transferDate,
          endsOn: null,
          endReason: undefined,
          status: 'active' as const,
        };
        commit(current => ({
          ...current,
          ownerships: [
            ...current.ownerships.map(item => item.id === source.id ? { ...item, status: 'ended' as const, endsOn: transferDate, endReason: reason } : item),
            replacement,
          ],
          audit: [auditEntry(community.id, 'Transfirió', 'Propiedad', propertyName(source.propertyId), {
            reason,
            before: { personId: source.personId, ownershipPercentage: source.ownershipPercentage, startsOn: source.startsOn },
            after: { personId, ownershipPercentage: replacement.ownershipPercentage, startsOn: transferDate },
          }), ...current.audit],
        }));
        setTransferOwnershipId(null);
        setNotice('Transferencia registrada sin perder la titularidad anterior.');
      } catch (error: any) {
        setNotice(error.response?.data?.message || error.message || 'No fue posible registrar la transferencia.');
      }
    };
    void persistTransfer();
  };

  const activateCommunity = () => {
    if (!community || !canActivate) {
      setNotice('Completa todas las validaciones obligatorias antes de activar.');
      return;
    }
    const before = { status: community.status };
    commit(current => ({
      ...current,
      communities: current.communities.map(item => item.id === community.id ? { ...item, status: 'active', updatedAt: new Date().toISOString() } : item),
      audit: [auditEntry(community.id, 'Activó', 'Comunidad', community.name, {
        reason: 'Validaciones de incorporación completadas',
        before,
        after: { status: 'active' },
      }), ...current.audit],
    }));
    setNotice('Comunidad activada. El núcleo quedó habilitado.');
  };

  const changeAliquot = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!community || !aliquotPropertyId) return;
    const property = data.properties.find(item => item.id === aliquotPropertyId);
    if (!property) return;
    const form = new FormData(event.currentTarget);
    const aliquot = Number(form.get('aliquot'));
    const startsOn = String(form.get('startsOn'));
    const reason = String(form.get('reason')).trim();

    const doUpdate = async () => {
      try {
        if (!demoMode) {
          const rootToken = RootSession.token();
          const selectRes = await CasaAuthService.selectContext(rootToken, community.id);
          if (!selectRes.success) throw new Error(selectRes.error);
          
          await casaApi.post(`/core/properties/${property.id}/aliquots`, {
            aliquot,
            startsOn,
            reason,
          }, {
            headers: { Authorization: `Bearer ${selectRes.data.accessToken}` }
          });
        }

        commit(current => ({
          ...current,
          properties: current.properties.map(item => item.id === property.id ? { ...item, aliquot } : item),
          propertyAliquotPeriods: [
            ...current.propertyAliquotPeriods.map(item => item.propertyId === property.id && item.status === 'active' ? { ...item, status: 'ended' as const, endsOn: startsOn } : item),
            { id: createCoreId('aliquot'), communityId: community.id, propertyId: property.id, aliquot, startsOn, endsOn: null, reason, status: 'active' as const },
          ],
          audit: [auditEntry(community.id, 'Cambió', 'Alícuota de inmueble', property.code, {
            reason,
            before: { aliquot: property.aliquot },
            after: { aliquot, startsOn },
          }), ...current.audit],
        }));
        setAliquotPropertyId(null);
        setNotice('Alícuota actualizada con vigencia e historial.');
      } catch (err: any) {
        console.error('Error al actualizar alícuota:', err);
        setNotice(err.response?.data?.message || err.message || 'No fue posible guardar los cambios en la alícuota.');
      }
    };

    void doUpdate();
  };

  const updatePropertyCapacity = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!community || !capacityPropertyId) return;
    const property = data.properties.find(item => item.id === capacityPropertyId);
    if (!property) return;
    const form = new FormData(event.currentTarget);
    const maximumOccupancy = Number(form.get('maximumOccupancy'));
    const braceletQuota = Number(form.get('braceletQuota'));

    const doUpdate = async () => {
      try {
        if (!demoMode) {
          const selectRes = await CasaAuthService.selectContext(
            RootSession.token(),
            community.id,
          );
          if (!selectRes.success) throw new Error(selectRes.error);
          await casaApi.patch(
            `/core/properties/${property.id}/capacity`,
            { maximumOccupancy, braceletQuota },
            { headers: { Authorization: `Bearer ${selectRes.data.accessToken}` } },
          );
        }
        commit(current => ({
          ...current,
          properties: current.properties.map(item =>
            item.id === property.id
              ? { ...item, maximumOccupancy, braceletQuota }
              : item,
          ),
          audit: [
            auditEntry(
              community.id,
              'Actualizó',
              'Capacidad del inmueble',
              property.code,
              {
                before: {
                  maximumOccupancy: property.maximumOccupancy,
                  braceletQuota: property.braceletQuota,
                },
                after: { maximumOccupancy, braceletQuota },
              },
            ),
            ...current.audit,
          ],
        }));
        setCapacityPropertyId(null);
        setNotice('Capacidad y cupos de brazaletes actualizados.');
      } catch (err: any) {
        setNotice(
          err.response?.data?.message ||
            err.message ||
            'No fue posible actualizar la capacidad.',
        );
      }
    };
    void doUpdate();
  };


  if (!demoMode && loading) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-3 rounded-[1.75rem] border border-[#071a33]/8 bg-white p-10 text-slate-500 shadow-md">
        <span className="h-8 w-8 animate-spin rounded-full border-4 border-[#071a33]/15 border-t-[#b08a3c]" />
        <p className="text-sm font-semibold text-[#071a33]">Cargando datos de la comunidad...</p>
      </div>
    );
  }

  if (!demoMode && error) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-3 rounded-[1.75rem] border border-rose-200 bg-rose-50 p-10 text-rose-700 shadow-md">
        <p className="text-sm font-bold">Error al cargar la comunidad</p>
        <p className="text-xs text-rose-500">{error}</p>
        <button
          type="button"
          onClick={() => {
            setError('');
            setReloadVersion(current => current + 1);
          }}
          className="mt-2 rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-rose-700"
        >
          Reintentar
        </button>
      </div>
    );
  }

  if (!data.communities.length) {
    return <><section className="rounded-[2rem] border border-[#071a33]/10 bg-white p-7 shadow-[0_24px_70px_rgba(7,26,51,.06)] sm:p-10"><p className="text-xs font-bold uppercase tracking-[.2em] text-[#a77e27]">Núcleo CASA</p><h2 className="mt-4 max-w-2xl text-3xl font-semibold tracking-[-.035em] sm:text-4xl">Comienza por registrar la primera comunidad.</h2><p className="mt-4 max-w-2xl text-sm leading-7 text-slate-500">CASA organizará su identidad legal, estructura inmobiliaria, personas, gobierno, administración y cuentas desde una única fuente de información.</p><div className="mt-8"><button type="button" onClick={() => openCommunity()} className="inline-flex items-center gap-2 rounded-full bg-[#071a33] px-6 py-3 text-sm font-bold text-white"><Plus size={17} /> Crear condominio</button></div></section>{dialog === 'community' && <CommunityDialog requireBoardSetup requireClientSetup={!demoMode} error={communitySaveError} saving={communitySaving} onSubmit={saveCommunity} onClose={() => { setDialog(null); setCommunitySaveError(''); }} />}</>;
  }

  const sections: Array<{ id: CoreSection; label: string }> = [
    { id: 'summary', label: 'Resumen' }, { id: 'properties', label: 'Inmuebles' }, { id: 'people', label: 'Personas' },
    { id: 'ownership', label: 'Propiedad' }, { id: 'staff', label: 'Personal' }, { id: 'concessions', label: 'Concesiones' },
    { id: 'board', label: 'Junta' }, { id: 'banking', label: 'Tesorería' },
    { id: 'validation', label: 'Validación' }, { id: 'history', label: 'Historial' },
    { id: 'settings', label: 'Configuración' }, { id: 'audit', label: 'Auditoría' },
  ];

  return (
    <div className="space-y-6">
      <section className="rounded-[1.75rem] border border-[#071a33]/10 bg-white p-5 shadow-[0_20px_60px_rgba(7,26,51,.05)] sm:p-7">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex min-w-0 items-center gap-4"><span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#071a33] text-[#e4c26f]"><Building2 size={23} /></span><div className="min-w-0"><p className="text-xs font-bold uppercase tracking-[.18em] text-[#a77e27]">Comunidad activa</p><h2 className="truncate text-2xl font-semibold tracking-[-.025em]">{community?.name}</h2><p className="mt-1 truncate text-sm text-slate-500">{community?.rif} · {community?.city || 'Ciudad pendiente'}, {community?.state || 'estado pendiente'}</p></div></div>
          <div className="flex flex-col gap-3 sm:flex-row"><span className="relative"><select value={selectedCommunityId} onChange={event => { setSelectedCommunityId(event.target.value); setSection('summary'); }} className="h-11 min-w-56 appearance-none rounded-xl border border-slate-200 bg-[#fbfaf7] pl-4 pr-10 text-sm font-semibold outline-none"><option value="" disabled>Seleccionar comunidad</option>{data.communities.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}</select><ChevronDown className="pointer-events-none absolute right-3 top-3.5 text-slate-400" size={16} /></span><button type="button" onClick={() => openCommunity()} className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-[#071a33]/15 px-4 text-sm font-bold"><Plus size={16} /> Otro condominio</button></div>
        </div>
        <nav className="mt-6 flex gap-1 overflow-x-auto border-t border-slate-100 pt-4" aria-label="Secciones del núcleo">{sections.map(item => <button type="button" key={item.id} onClick={() => setSection(item.id)} className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition ${section === item.id ? 'bg-[#071a33] text-white' : 'text-slate-500 hover:bg-slate-100 hover:text-[#071a33]'}`}>{item.label}</button>)}</nav>
      </section>

      {section === 'summary' && <Summary community={community!} properties={properties.length} people={people.length} owners={new Set(ownerships.map(item => item.personId)).size} staff={employments.length} concessions={concessions.length} board={board.length} banks={bankAccounts.length} methods={paymentMethods.length} onNavigate={setSection} />}

      {section === 'properties' && <ListSection icon={<Building2 size={20} />} eyebrow="Inventario inmobiliario" title={`${properties.length} inmuebles · ${locations.length} ubicaciones`} action="Registrar inmueble" onAction={() => setDialog('property')} secondaryAction="Agregar ubicación" onSecondaryAction={() => setDialog('location')}><CoreFlow active="properties" onNavigate={setSection} /><div className="mt-5 flex justify-end"><Link to="/workspace/inmuebles/importar" className="inline-flex items-center gap-2 rounded-xl border border-[#b08a3c]/35 bg-[#fbf7ed] px-4 py-2.5 text-sm font-bold text-[#76591f] transition hover:bg-[#f4ead2]"><Upload size={16} /> Importar desde Excel</Link></div><div className="mt-6">{locations.length > 0 && <div className="mb-5 flex flex-wrap gap-2">{locations.map(item => <span key={item.id} className="inline-flex items-center gap-2 rounded-full bg-[#f1eadb] px-3 py-2 text-xs font-semibold text-[#7b5c20]"><MapPinned size={14} />{item.name} · {propertyLocationKindLabels[item.kind]}</span>)}</div>}{properties.length ? <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">{properties.map(item => <article key={item.id} className="rounded-2xl border border-slate-200 p-4"><div className="flex items-start justify-between gap-3"><p className="text-lg font-semibold">{item.code}</p><Badge>{propertyKindLabels[item.kind]}</Badge></div><p className="mt-4 text-xs text-slate-400">{locationName(item.locationId)}</p><p className="mt-2 text-xs font-semibold text-slate-500">Alícuota: {item.aliquot ?? 'No definida'}{item.aliquot !== null ? '%' : ''}</p><div className="mt-3 grid grid-cols-2 gap-2 text-xs"><div className="rounded-xl bg-slate-50 p-2"><span className="block text-slate-400">Capacidad máxima</span><strong>{item.maximumOccupancy ?? 'Pendiente'}</strong></div><div className="rounded-xl bg-slate-50 p-2"><span className="block text-slate-400">Cupos brazaletes</span><strong>{item.braceletQuota}</strong></div></div><div className="mt-4 flex flex-wrap gap-2"><button type="button" onClick={() => setAliquotPropertyId(item.id)} className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600">Modificar alícuota</button><button type="button" onClick={() => setCapacityPropertyId(item.id)} className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600">Capacidad y cupos</button></div></article>)}</div> : <div className="rounded-2xl border border-dashed border-slate-300 px-6 py-10 text-center"><p className="font-semibold">Aún no hay inmuebles</p><p className="mt-2 text-sm text-slate-500">Registra apartamentos, townhouses o locales comerciales. La ubicación es opcional.</p></div>}</div></ListSection>}

      {section === 'people' && <ListSection icon={<CircleUserRound size={20} />} eyebrow="Directorio único" title={`${people.length} personas registradas`} action="Registrar persona" onAction={() => setDialog('person')}><CoreFlow active="people" onNavigate={setSection} /><div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center"><div className="relative flex-1 sm:max-w-md"><CircleUserRound className="absolute left-3.5 top-3 text-slate-400" size={17} /><input value={peopleSearch} onChange={event => setPeopleSearch(event.target.value)} placeholder="Buscar por nombre, cédula o propiedad" className="w-full rounded-xl border border-slate-200 bg-[#fbfaf7] py-2.5 pl-10 pr-4 text-sm outline-none focus:border-[#b08a3c]" /></div>{peopleSearch && <button type="button" onClick={() => setPeopleSearch('')} className="text-xs font-bold text-[#9a742b]">Limpiar búsqueda</button>}</div>{people.length && filteredPeople.length ? <div className="mt-6 overflow-x-auto"><table className="w-full min-w-[760px] text-left text-sm"><thead className="border-b border-slate-200 text-xs uppercase tracking-wider text-slate-400"><tr><th className="pb-3">Persona</th><th className="pb-3">Propiedades</th><th className="pb-3">Otras relaciones</th><th className="pb-3">Contacto</th><th className="pb-3 text-right">Acciones</th></tr></thead><tbody>{filteredPeople.map(person => { const owned = ownerships.filter(item => item.personId === person.id); const relations = memberships.filter(item => item.personId === person.id && item.kind !== 'owner'); const employment = employments.find(item => item.personId === person.id); const boardRole = board.find(item => item.personId === person.id && item.status === 'active'); return <tr key={person.id} className="border-b border-slate-100"><td className="py-4 font-semibold">{personName(person.id)}<span className="mt-1 block text-xs font-normal text-slate-400">{person.documentType}-{person.documentNumber}</span></td><td className="py-4 text-slate-500">{owned.map(item => propertyName(item.propertyId)).join(', ') || 'Sin vincular'}</td><td className="py-4"><div className="flex flex-wrap gap-1">{employment && <Badge tone="gold">Personal · {employment.position}</Badge>}{boardRole && <Badge tone="green">Junta · {boardRole.position}</Badge>}{relations.map(item => <Badge key={item.id} tone="gold">{membershipKindLabels[item.kind]}</Badge>)}{!employment && !boardRole && !relations.length && <span className="text-slate-400">—</span>}</div></td><td className="py-4 text-slate-500">{person.phone || person.email || '—'}{person.contacts.length > 0 && <span className="mt-1 block text-xs text-[#9a742b]">+{person.contacts.length} secundario(s)</span>}</td><td className="py-4 text-right"><button type="button" onClick={() => { setSelectedPersonId(person.id); setDialog('edit-person'); }} className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-50">Editar</button></td></tr>; })}</tbody></table></div> : people.length ? <div className="mt-6 rounded-2xl border border-dashed border-slate-300 px-6 py-10 text-center"><p className="font-semibold">Sin coincidencias</p><p className="mt-2 text-sm text-slate-500">Prueba con otro nombre, número de documento o código de inmueble.</p></div> : <div className="mt-6 rounded-2xl border border-dashed border-slate-300 px-6 py-10 text-center"><p className="font-semibold">Directorio sin personas</p><p className="mt-2 text-sm text-slate-500">Registra la identidad primero. Luego podrás cruzarla con uno o varios inmuebles.</p></div>}</ListSection>}


      {section === 'ownership' && <ListSection icon={<Link2 size={20} />} eyebrow="Relación histórica" title={`${ownerships.length} vínculos de propiedad vigentes`} action="Vincular propietario" onAction={() => setDialog('ownership')}><CoreFlow active="ownership" onNavigate={setSection} />{ownerships.length ? <div className="mt-6 grid gap-3 md:grid-cols-2">{ownerships.map(item => <article key={item.id} className="rounded-2xl border border-slate-200 p-5"><div className="flex items-start justify-between gap-3"><div><p className="font-semibold">{personName(item.personId)}</p><p className="mt-1 text-sm text-[#9a742b]">{propertyName(item.propertyId)}</p></div><Badge tone="green">{item.ownershipPercentage}%</Badge></div><p className="mt-4 text-xs text-slate-400">Vigente desde {formatDateTime(item.startsOn)}</p><div className="mt-4 flex gap-3"><div className="group relative"><button type="button" onClick={() => setTransferOwnershipId(item.id)} className="rounded-xl bg-[#071a33] px-3.5 py-2 text-xs font-bold text-white transition hover:bg-[#b08a3c]">Transferir</button><div className="pointer-events-none absolute bottom-full left-1/2 z-30 mb-2.5 hidden w-72 -translate-x-1/2 rounded-xl bg-[#071a33] p-3 text-xs font-normal leading-relaxed text-white shadow-2xl transition-all group-hover:block"><span className="block font-bold text-[#e4c26f] mb-1">Traspaso de Propiedad</span>Finaliza la relación de propiedad actual y abre una nueva vinculación para el nuevo adquirente, manteniendo el historial del inmueble.<div className="absolute top-full left-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1 rotate-45 bg-[#071a33]"></div></div></div><div className="group relative"><button type="button" onClick={() => setLifecycleTarget({ kind: 'ownership', id: item.id, label: `${personName(item.personId)} · ${propertyName(item.propertyId)}` })} className="rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-bold text-slate-600 transition hover:border-rose-400 hover:text-rose-600">Finalizar</button><div className="pointer-events-none absolute bottom-full left-1/2 z-30 mb-2.5 hidden w-72 -translate-x-1/2 rounded-xl bg-[#071a33] p-3 text-xs font-normal leading-relaxed text-white shadow-2xl transition-all group-hover:block"><span className="block font-bold text-rose-400 mb-1">Cierre de Vínculo</span>Retira formalmente a esta persona como propietaria. Registra la fecha de cese y el motivo (ej. venta o fallecimiento) sin vincular a un nuevo titular.<div className="absolute top-full left-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1 rotate-45 bg-[#071a33]"></div></div></div></div></article>)}</div> : <div className="mt-6 rounded-2xl border border-dashed border-slate-300 px-6 py-10 text-center"><p className="font-semibold">No existen propietarios vinculados</p><p className="mt-2 text-sm text-slate-500">{!properties.length ? 'Primero registra los inmuebles.' : !people.length ? 'Ahora registra las personas que serán propietarias.' : 'Selecciona una persona y un inmueble para crear la relación.'}</p></div>}</ListSection>}

      {section === 'staff' && (employments.length ? <ListSection icon={<BriefcaseBusiness size={20} />} eyebrow="Relaciones laborales" title={`${employments.length} trabajadores vigentes`} action="Vincular trabajador" onAction={() => setDialog('employment')}><div className="mb-5 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-800"><strong>Regla de incompatibilidad:</strong> una persona puede ser propietaria y trabajadora, pero no puede trabajar en el condominio e integrar simultáneamente su junta.</div><div className="grid gap-3 md:grid-cols-2">{employments.map(item => { const access = communityAccesses.find(candidate => candidate.user.person?.id === item.personId); const activeAccess = access?.status === 'ACTIVE'; return <article key={item.id} className="rounded-2xl border border-slate-200 p-5"><div className="flex items-start justify-between gap-3"><div><p className="font-semibold">{personName(item.personId)}</p><p className="mt-1 text-sm text-[#9a742b]">{item.position}</p></div><Badge tone="green">Vigente</Badge></div><div className={`mt-4 rounded-xl border px-3 py-2.5 text-xs ${activeAccess ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-amber-200 bg-amber-50 text-amber-800'}`}><p className="font-bold">{activeAccess ? `Acceso vigente · ${roleLabel(access?.roleCode ?? '')}` : access ? `Acceso ${access.status.toLowerCase()}` : 'Sin acceso configurado'}</p>{activeAccess && <p className="mt-1">{access.workspaces.filter(workspace => workspace.status === 'ACTIVE').map(workspace => workspaceLabel(workspace.workspaceCode)).join(' · ') || 'Sin espacios vigentes'}</p>}</div><p className="mt-4 text-sm text-slate-500">{item.department || 'Sin departamento'}</p><p className="mt-2 text-xs text-slate-400">{item.engagementType === 'employee' ? 'Relación laboral' : item.engagementType === 'professional-fee' ? 'Honorarios profesionales' : 'Contratista'} · Desde {formatDateTime(item.startsOn)}</p><div className="mt-4 flex flex-wrap gap-2"><button type="button" onClick={() => { if (access && onManageAccess && community?.clientId) onManageAccess(community.clientId, access.id); else { setSelectedEmploymentId(item.id); setDialog('employment-access'); } }} className="rounded-xl bg-[#071a33] px-3 py-2 text-xs font-bold text-white">{access && onManageAccess ? 'Administrar acceso' : 'Crear acceso'}</button><button type="button" onClick={() => setLifecycleTarget({ kind: 'employment', id: item.id, label: `${personName(item.personId)} · ${item.position}` })} className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600">Finalizar relación</button></div></article>; })}</div></ListSection> : <EmptyState icon={<BriefcaseBusiness />} title="No hay personal vinculado" copy="Una persona puede trabajar en el condominio sin ser propietaria. CASA verificará que no integre la junta vigente." action="Vincular primer trabajador" onClick={() => setDialog('employment')} />)}

      {section === 'concessions' && (concessions.length ? <ListSection icon={<Store size={20} />} eyebrow="Explotación autorizada" title={`${concessions.length} concesiones`} action="Registrar concesión" onAction={() => { setSelectedConcessionId(null); setDialog('concession'); }}><div className="grid gap-3 md:grid-cols-2">{concessions.map(item => <article key={item.id} className="rounded-2xl border border-slate-200 p-5"><div className="flex items-start justify-between gap-3"><div><p className="font-semibold">{item.code} · {item.name}</p><p className="mt-1 text-sm text-slate-500">{item.holderName}</p></div><Badge tone="gold">{item.currency} {item.monthlyAmount.toLocaleString('es-VE')}</Badge></div><p className="mt-4 text-xs text-slate-400">{item.locationDescription || 'Ubicación no especificada'} · Sin alícuota</p><div className="mt-4 flex flex-wrap gap-2"><button type="button" onClick={() => { setSelectedConcessionId(item.id); setDialog('view-concession'); }} className="rounded-xl bg-[#071a33] px-3 py-2 text-xs font-bold text-white">Ver</button><button type="button" onClick={() => { setSelectedConcessionId(item.id); setDialog('edit-concession'); }} className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600">Editar</button><button type="button" onClick={() => setLifecycleTarget({ kind: 'concession', id: item.id, label: `${item.code} · ${item.name}` })} className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600">Finalizar concesión</button></div></article>)}</div></ListSection> : <EmptyState icon={<Store />} title="No hay concesiones registradas" copy="Una concesión es contractual, puede no tener alícuota y puede generar un canon fijo mensual." action="Registrar primera concesión" onClick={() => { setSelectedConcessionId(null); setDialog('concession'); }} />)}

      {section === 'board' && (board.length ? <ListSection icon={<UsersRound size={20} />} eyebrow="Gobierno de la comunidad" title="Junta de condominio" action="Designar integrante" onAction={() => setDialog('board')}><div className="grid gap-3 md:grid-cols-2">{board.map(item => <article key={item.id} className="rounded-2xl border border-slate-200 p-5"><div className="flex items-start justify-between"><div><p className="font-semibold">{personName(item.personId)}</p><p className="mt-1 text-sm text-[#9a742b]">{item.position}</p></div><Badge tone="green">Vigente</Badge></div><p className="mt-4 text-sm text-slate-500">{propertyName(item.propertyId)}</p><p className="mt-2 text-xs text-slate-400">Periodo: {item.startsOn || 'sin inicio'} — {item.endsOn || 'sin vencimiento'}</p><button type="button" onClick={() => setLifecycleTarget({ kind: 'board', id: item.id, label: `${personName(item.personId)} · ${item.position}` })} className="mt-4 rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600">Finalizar designación</button></article>)}</div></ListSection> : <EmptyState icon={<UsersRound />} title="Junta pendiente de conformación" copy={people.length ? 'Asigna cargo, inmueble representado y período a las personas registradas.' : 'Primero vincula las personas que integrarán la junta y luego asigna sus cargos.'} action={people.length ? 'Designar integrante' : 'Registrar personas'} onClick={() => setDialog(people.length ? 'board' : 'person')} />)}

      {section === 'banking' && <ListSection icon={<Landmark size={20} />} eyebrow="Tesorería" title={`${bankAccounts.length} cuentas · ${paymentMethods.length} métodos`} action={canWriteTreasury ? "Agregar método de pago" : undefined} onAction={canWriteTreasury ? () => setDialog('payment-method') : undefined} secondaryAction={canWriteTreasury ? "Agregar cuenta" : undefined} onSecondaryAction={canWriteTreasury ? () => setDialog('bank') : undefined}>
        <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
          <section>
            <p className="text-xs font-bold uppercase tracking-[.14em] text-slate-400">Cuentas receptoras</p>
            {bankAccounts.length ? (
              <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-2">
                {bankAccounts.map((item) => (
                  <article key={item.id} className="rounded-2xl bg-[#071a33] border border-[#b08a3c]/35 p-4 text-white shadow-lg flex flex-col justify-between relative overflow-hidden group">
                    <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-[#b08a3c]/5 rounded-full blur-2xl pointer-events-none"></div>
                    <div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="p-2.5 rounded-2xl bg-[#b08a3c]/15 text-[#e5ca8f] border border-[#b08a3c]/30">
                            <Landmark size={20} />
                          </span>
                          <span className="text-[11px] font-bold uppercase tracking-[.14em] text-[#d7bb7c]/80">Cuenta Bancaria</span>
                        </div>
                        <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-[#b08a3c]/20 text-[#e5ca8f] border border-[#b08a3c]/40">
                          {item.currency}
                        </span>
                      </div>
                      
                      <div className="mt-3">
                        <h4 className="text-base font-bold text-[#e5ca8f] tracking-wide">{item.bankName}</h4>
                        <p className="mt-1 font-mono text-sm font-bold tracking-[.18em] text-[#d7bb7c]">
                          •••• {item.accountNumber.slice(-4)}
                        </p>
                        <p className="mt-1 text-xs font-bold text-[#d7bb7c]/70 capitalize">
                          Cuenta {item.accountType}
                        </p>
                        {(() => {
                          const linked = accountingAccounts.find((a) => a.bankAccountId === item.id);
                          return linked ? (
                            <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#b08a3c]/15 border border-[#b08a3c]/30 text-[#e5ca8f] text-xs font-bold shadow-sm">
                              <BookOpenCheck size={13} className="text-[#d7bb7c]" />
                              <span>Cuenta Contable: {linked.code} · {linked.name}</span>
                            </div>
                          ) : null;
                        })()}
                      </div>

                      <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between">
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-wider text-[#d7bb7c]/60">Titular</p>
                          <p className="text-xs font-bold text-[#e5ca8f] mt-0.5">{item.holder}</p>
                          <p className="text-[11px] font-bold text-[#d7bb7c]/80">{item.holderRif}</p>
                        </div>
                        
                        {canWriteTreasury && (
                          <button 
                            type="button" 
                            onClick={() => { setSelectedBankAccountId(item.id); setDialog('edit-bank'); }}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#b08a3c]/25 hover:bg-[#b08a3c]/40 text-[#e5ca8f] text-xs font-bold border border-[#b08a3c]/40 shadow-sm transition"
                          >
                            <Pencil size={13} />
                            Editar
                          </button>
                        )}
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="mt-3 rounded-2xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">
                No hay cuentas bancarias registradas.
              </div>
            )}
          </section>
          <section>
            <div className="flex flex-wrap items-center justify-between gap-2"><p className="text-xs font-bold uppercase tracking-[.14em] text-slate-400">Métodos aceptados</p><select value={paymentMethodFilter} onChange={event => setPaymentMethodFilter(event.target.value as typeof paymentMethodFilter)} className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700"><option value="all">Todos</option><option value="mobile-payment">Pago móvil</option><option value="bank-transfer">Transferencia</option><option value="cash">Efectivo</option></select></div>
            {paymentMethods.length ? (
              <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-2">
                {paymentMethods.filter(item => paymentMethodFilter === 'all' || item.type === paymentMethodFilter).map((item) => {
                  const account = bankAccounts.find((accountItem) => accountItem.id === item.bankAccountId);
                  const Icon = item.type === 'mobile-payment' ? Smartphone : item.type === 'cash' ? Banknote : ArrowLeftRight;
                  return (
                    <article key={item.id} className="rounded-xl border border-slate-200 p-3 bg-white shadow-sm flex items-start gap-3">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#f1eadb] text-[#9a742b]">
                        <Icon size={18} />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-3">
                          <p className="font-bold">{item.label}</p>
                          <Badge tone="green">{item.currency}</Badge>
                        </div>
                        <p className="mt-1 text-xs text-slate-500">
                          {item.type === 'mobile-payment'
                            ? `Pago móvil · ${item.mobilePhone} · ${item.mobileDocument}`
                            : item.type === 'cash'
                            ? 'Recepción de efectivo'
                            : `Transferencia · ${account?.bankName ?? 'Cuenta no disponible'}`}
                        </p>
                        <p className="mt-1 text-xs text-slate-400">Vinculado a: {account ? `${account.bankName} (•••• ${account.accountNumber.slice(-4)})` : 'Cuenta no encontrada'}</p>
                        {item.instructions && <p className="mt-2 text-xs leading-5 text-slate-400">{item.instructions}</p>}
                        
                        {canWriteTreasury && (
                          <div className="mt-3 flex justify-end">
                            <button
                              type="button"
                              onClick={() => { setSelectedPaymentMethodId(item.id); setDialog('edit-payment-method'); }}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
                            >
                              <Pencil size={13} />
                              Editar
                            </button>
                          </div>
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>
            ) : (
              <div className="mt-3 rounded-2xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">
                Agrega transferencia, pago móvil o efectivo.
              </div>
            )}
          </section>
        </div>
      </ListSection>}

      {section === 'validation' && <ListSection icon={<ShieldCheck size={20} />} eyebrow="Control de activación" title={community?.status === 'active' ? 'Comunidad activa' : 'Validaciones previas'}><div className="grid gap-3 md:grid-cols-2">{validationChecks.map(item => <article key={item.label} className={`flex items-center justify-between rounded-2xl border p-4 ${item.passed ? 'border-emerald-200 bg-emerald-50/60' : 'border-amber-200 bg-amber-50/60'}`}><div><p className="font-semibold">{item.label}</p><p className={`mt-1 text-xs ${item.passed ? 'text-emerald-700' : 'text-amber-700'}`}>{item.passed ? 'Validación superada' : 'Información pendiente o inconsistente'}</p></div><Badge tone={item.passed ? 'green' : 'gold'}>{item.passed ? 'Listo' : 'Pendiente'}</Badge></article>)}</div><div className="mt-6 rounded-2xl bg-[#071a33] p-5 text-white"><div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div><p className="font-semibold">Estado operativo: {community?.status === 'active' ? 'Activo' : 'Borrador'}</p><p className="mt-1 text-sm text-white/55">CASA impide la activación mientras exista una validación obligatoria pendiente.</p></div>{community?.status !== 'active' && <button type="button" onClick={activateCommunity} disabled={!canActivate} className="rounded-full bg-[#d6af57] px-5 py-3 text-sm font-bold text-[#071a33] disabled:cursor-not-allowed disabled:opacity-35">Activar comunidad</button>}</div></div></ListSection>}

      {section === 'history' && <ListSection icon={<ArrowLeftRight size={20} />} eyebrow="Vigencias cerradas" title="Historial de relaciones"><div className="space-y-3">{[
        ...data.propertyAliquotPeriods.filter(item => item.communityId === selectedCommunityId && item.status === 'ended').map(item => ({ id: item.id, type: 'Alícuota', subject: `${propertyName(item.propertyId)} · ${item.aliquot ?? 'No definida'}%`, period: `${formatAuditTimestamp(item.startsOn)} — ${item.endsOn ? formatAuditTimestamp(item.endsOn) : 'Sin cierre'}`, reason: item.reason })),
        ...data.ownerships.filter(item => item.communityId === selectedCommunityId && item.status === 'ended').map(item => ({ id: item.id, type: 'Propiedad', subject: `${personName(item.personId)} · ${propertyName(item.propertyId)}`, period: `${formatAuditTimestamp(item.startsOn)} — ${item.endsOn ? formatAuditTimestamp(item.endsOn) : 'Sin cierre'}`, reason: item.endReason })),
        ...data.employments.filter(item => item.communityId === selectedCommunityId && item.status === 'ended').map(item => ({ id: item.id, type: 'Personal', subject: `${personName(item.personId)} · ${item.position}`, period: `${formatAuditTimestamp(item.startsOn)} — ${item.endsOn ? formatAuditTimestamp(item.endsOn) : 'Sin cierre'}`, reason: item.endReason })),
        ...data.boardAppointments.filter(item => item.communityId === selectedCommunityId && item.status === 'ended').map(item => ({ id: item.id, type: 'Junta', subject: `${personName(item.personId)} · ${item.position}`, period: `${formatAuditTimestamp(item.startsOn)} — ${item.endsOn ? formatAuditTimestamp(item.endsOn) : 'Sin cierre'}`, reason: item.endReason })),
        ...data.concessions.filter(item => item.communityId === selectedCommunityId && item.status === 'ended').map(item => ({ id: item.id, type: 'Concesión', subject: `${item.code} · ${item.name}`, period: `${formatAuditTimestamp(item.startsOn)} — ${item.endsOn ? formatAuditTimestamp(item.endsOn) : 'Sin cierre'}`, reason: item.endReason })),
      ].map(item => <article key={`${item.type}-${item.id}`} className="grid gap-2 rounded-2xl border border-slate-200 p-4 md:grid-cols-[120px_1fr_260px] md:items-center"><Badge tone="gold">{repairSpanishText(item.type)}</Badge><div><p className="font-semibold">{repairSpanishText(item.subject)}</p><p className="mt-1 text-xs text-slate-400">{repairSpanishText(item.reason || 'Sin motivo documentado')}</p></div><p className="whitespace-nowrap text-xs tabular-nums text-slate-500">{item.period}</p></article>)}{!data.propertyAliquotPeriods.some(item => item.communityId === selectedCommunityId && item.status === 'ended') && !data.ownerships.some(item => item.communityId === selectedCommunityId && item.status === 'ended') && !data.employments.some(item => item.communityId === selectedCommunityId && item.status === 'ended') && !data.boardAppointments.some(item => item.communityId === selectedCommunityId && item.status === 'ended') && !data.concessions.some(item => item.communityId === selectedCommunityId && item.status === 'ended') && <p className="py-10 text-center text-sm text-slate-500">Aún no hay relaciones finalizadas.</p>}</div></ListSection>}

      {section === 'settings' && <ListSection icon={<Settings2 size={20} />} eyebrow="Configuración de comunidad" title="Identidad y administración" action="Editar información" onAction={() => openCommunity(community!)}><dl className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">{[['Razón social', community?.legalName], ['RIF', community?.rif], ['Teléfono', community?.phone], ['Correo', community?.email || 'No registrado'], ['Dirección', community?.address], ['Ubicación', `${community?.city}, ${community?.state}`], ['Modelo administrativo', community?.administrationMode === 'board' ? 'Administrada por la junta' : community?.administrationMode === 'internal' ? 'Administración interna del condominio (Honorarios profesionales)' : 'Administradora externa'], ['Administrador', community?.administratorName || 'La propia junta'], ['RIF del administrador', community?.administratorRif || 'No aplica']].map(([label, value]) => <div key={label} className="rounded-2xl bg-[#f8f6f1] p-4"><dt className="text-xs font-bold uppercase tracking-wider text-slate-400">{label}</dt><dd className="mt-2 text-sm font-semibold">{value || 'Pendiente'}</dd></div>)}</dl></ListSection>}

      {section === 'audit' && <ListSection icon={<ShieldCheck size={20} />} eyebrow="Trazabilidad exclusiva de la comunidad" title="Historial del núcleo"><div className="space-y-3">{audit.length ? audit.map(item => <article key={item.id} className="rounded-2xl border border-slate-200 p-4"><div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between"><div><div className="flex flex-wrap items-center gap-2"><Badge tone="gold">{auditActionLabel(item.action)}</Badge><p className="font-semibold">{auditEntityLabel(item.entity)} · {repairSpanishText(item.detail)}</p></div><p className="mt-2 text-xs text-slate-400">{repairSpanishText(item.actor || 'Sistema CASA')}{item.reason ? ` · Motivo: ${repairSpanishText(item.reason)}` : ''}</p></div><time className="whitespace-nowrap text-xs tabular-nums text-slate-400">{formatAuditTimestamp(item.createdAt)}</time></div>{(item.before || item.after) && <div className="mt-4 grid gap-3 sm:grid-cols-2"><div className="rounded-xl bg-rose-50 p-3"><p className="text-[10px] font-bold uppercase tracking-wider text-rose-700">Antes</p><pre className="mt-2 overflow-x-auto whitespace-pre-wrap text-xs text-rose-900">{item.before ? JSON.stringify(readableAuditPayload(item.before), null, 2) : '—'}</pre></div><div className="rounded-xl bg-emerald-50 p-3"><p className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">Después</p><pre className="mt-2 overflow-x-auto whitespace-pre-wrap text-xs text-emerald-900">{item.after ? JSON.stringify(readableAuditPayload(item.after), null, 2) : '—'}</pre></div></div>}</article>) : <p className="py-8 text-center text-sm text-slate-500">No hay actividad registrada para esta comunidad.</p>}</div></ListSection>}

      {dialog === 'community' && <CommunityDialog community={editingCommunity} requireBoardSetup={board.length === 0} requireClientSetup={!demoMode && !editingCommunity} error={communitySaveError} saving={communitySaving} onSubmit={saveCommunity} onClose={() => { setDialog(null); setEditingCommunity(null); setCommunitySaveError(''); }} />}
      {dialog === 'location' && <LocationDialog onSubmit={saveLocation} onClose={() => setDialog(null)} />}
      {dialog === 'property' && <PropertyDialog locations={locations} onSubmit={saveProperty} onClose={() => setDialog(null)} />}
      {dialog === 'person' && <PersonDialog properties={properties} ownerships={ownerships} onSubmit={savePerson} onClose={() => setDialog(null)} />}
      {dialog === 'edit-person' && selectedPersonId && <EditPersonDialog person={data.people.find(item => item.id === selectedPersonId)!} onSubmit={updatePerson} onAddContact={addPersonContact} onDeleteContact={deletePersonContact} onClose={() => { setDialog(null); setSelectedPersonId(null); }} />}
      {dialog === 'ownership' && <OwnershipDialog people={people} properties={properties} ownerships={ownerships} onSubmit={saveOwnership} onClose={() => setDialog(null)} />}

      {dialog === 'employment' && <EmploymentDialog people={people} board={board} employments={employments} onSubmit={saveEmployment} onClose={() => setDialog(null)} />}
      {dialog === 'employment-access' && selectedEmploymentId && <EmploymentAccessDialog person={data.people.find(person => person.id === employments.find(item => item.id === selectedEmploymentId)?.personId)!} onSubmit={createEmploymentAccess} onClose={() => { setDialog(null); setSelectedEmploymentId(null); }} />}
      {dialog === 'concession' && <ConcessionDialog onSubmit={saveConcession} onClose={() => { setDialog(null); setSelectedConcessionId(null); }} />}
      {dialog === 'edit-concession' && selectedConcessionId && <ConcessionDialog concession={data.concessions.find(item => item.id === selectedConcessionId)} onSubmit={saveConcession} onClose={() => { setDialog(null); setSelectedConcessionId(null); }} />}
      {dialog === 'view-concession' && selectedConcessionId && <ConcessionDetailDialog concession={data.concessions.find(item => item.id === selectedConcessionId)!} onEdit={() => setDialog('edit-concession')} onClose={() => { setDialog(null); setSelectedConcessionId(null); }} />}
      {dialog === 'board' && <BoardDialog people={people} properties={properties} employments={employments} ownerships={ownerships} onSubmit={saveBoardAppointment} onClose={() => setDialog(null)} />}
      {dialog === 'bank' && <BankDialog community={community!} onSubmit={saveBank} onClose={() => setDialog(null)} />}
      {dialog === 'edit-bank' && selectedBankAccountId && <EditBankAccountDialog bankAccount={bankAccounts.find(item => item.id === selectedBankAccountId)!} onSubmit={updateBankAccount} onClose={() => { setDialog(null); setSelectedBankAccountId(null); }} />}
      {dialog === 'payment-method' && <PaymentMethodDialog community={community!} bankAccounts={bankAccounts} onSubmit={savePaymentMethod} onClose={() => setDialog(null)} />}
      {dialog === 'edit-payment-method' && selectedPaymentMethodId && <EditPaymentMethodDialog method={paymentMethods.find(item => item.id === selectedPaymentMethodId)!} bankAccounts={bankAccounts} onSubmit={updatePaymentMethod} onClose={() => { setDialog(null); setSelectedPaymentMethodId(null); }} />}
      {lifecycleTarget && <EndLifecycleDialog target={lifecycleTarget} onSubmit={closeLifecycle} onClose={() => setLifecycleTarget(null)} />}
      {transferOwnershipId && <TransferOwnershipDialog people={people} source={data.ownerships.find(item => item.id === transferOwnershipId)!} personName={personName} propertyName={propertyName} onSubmit={transferOwnership} onClose={() => setTransferOwnershipId(null)} />}
      {aliquotPropertyId && <AliquotDialog property={data.properties.find(item => item.id === aliquotPropertyId)!} onSubmit={changeAliquot} onClose={() => setAliquotPropertyId(null)} />}
      {capacityPropertyId && <PropertyCapacityDialog property={data.properties.find(item => item.id === capacityPropertyId)!} onSubmit={updatePropertyCapacity} onClose={() => setCapacityPropertyId(null)} />}
      {notice && <div className="fixed bottom-5 left-1/2 z-[150] -translate-x-1/2 rounded-full bg-[#071a33] px-5 py-3 text-sm font-semibold text-white shadow-2xl">{notice}</div>}
    </div>
  );
}

function ListSection({ icon, eyebrow, title, action, onAction, secondaryAction, onSecondaryAction, children }: { icon: ReactNode; eyebrow: string; title: string; action?: string; onAction?: () => void; secondaryAction?: string; onSecondaryAction?: () => void; children: ReactNode }) {
  return <section className="rounded-[1.75rem] border border-[#071a33]/10 bg-white p-5 shadow-[0_20px_60px_rgba(7,26,51,.05)] sm:p-7"><header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div className="flex items-center gap-3"><span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#f1eadb] text-[#9a742b]">{icon}</span><div><p className="text-xs font-bold uppercase tracking-[.16em] text-[#a77e27]">{eyebrow}</p><h3 className="mt-1 text-xl font-semibold">{title}</h3></div></div><div className="flex flex-col gap-2 sm:flex-row">{secondaryAction && <button type="button" onClick={onSecondaryAction} className="inline-flex items-center justify-center gap-2 rounded-full border border-[#071a33]/15 px-5 py-2.5 text-sm font-bold text-[#071a33]"><Plus size={16} />{secondaryAction}</button>}{action && <button type="button" onClick={onAction} className="inline-flex items-center justify-center gap-2 rounded-full bg-[#071a33] px-5 py-2.5 text-sm font-bold text-white"><Plus size={16} />{action}</button>}</div></header>{children}</section>;
}

function CoreFlow({ active, onNavigate }: { active: 'properties' | 'people' | 'ownership'; onNavigate: (value: CoreSection) => void }) {
  const steps = [
    { id: 'properties' as const, number: '01', label: 'Crear inmuebles', copy: 'El código identifica cada unidad.' },
    { id: 'people' as const, number: '02', label: 'Registrar personas', copy: 'La identidad existe por separado.' },
    { id: 'ownership' as const, number: '03', label: 'Vincular propiedad', copy: 'Se cruza persona, inmueble y vigencia.' },
  ];
  return <div className="grid gap-2 rounded-2xl bg-[#f8f6f1] p-2 md:grid-cols-3">{steps.map(step => <button type="button" key={step.id} onClick={() => onNavigate(step.id)} className={`rounded-xl p-4 text-left transition ${active === step.id ? 'bg-[#071a33] text-white shadow-lg' : 'hover:bg-white'}`}><p className={`text-[10px] font-bold uppercase tracking-[.15em] ${active === step.id ? 'text-[#e4c26f]' : 'text-[#9a742b]'}`}>{step.number}</p><p className="mt-1 text-sm font-bold">{step.label}</p><p className={`mt-1 text-xs leading-5 ${active === step.id ? 'text-white/50' : 'text-slate-400'}`}>{step.copy}</p></button>)}</div>;
}

function Summary({ community, properties, people, owners, staff, concessions, board, banks, methods, onNavigate }: { community: Community; properties: number; people: number; owners: number; staff: number; concessions: number; board: number; banks: number; methods: number; onNavigate: (value: CoreSection) => void }) {
  const cards = [
    { label: 'Inmuebles', value: properties, section: 'properties' as const, icon: Building2 },
    { label: 'Personas', value: people, section: 'people' as const, icon: CircleUserRound },
    { label: 'Propietarios', value: owners, section: 'ownership' as const, icon: BadgeCheck },
    { label: 'Personal', value: staff, section: 'staff' as const, icon: BriefcaseBusiness },
    { label: 'Concesiones', value: concessions, section: 'concessions' as const, icon: Store },
    { label: 'Junta', value: board, section: 'board' as const, icon: UsersRound },
    { label: 'Cuentas', value: banks, section: 'banking' as const, icon: Banknote },
    { label: 'Métodos de pago', value: methods, section: 'banking' as const, icon: CreditCard },
  ];
  const readiness = [properties > 0, people > 0, owners > 0, board > 0, banks > 0, methods > 0].filter(Boolean).length;
  return <><section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{cards.map(card => { const Icon = card.icon; return <button type="button" key={card.label} onClick={() => onNavigate(card.section)} className="group rounded-[1.5rem] border border-[#071a33]/10 bg-white p-5 text-left shadow-[0_16px_45px_rgba(7,26,51,.04)] transition hover:-translate-y-0.5 hover:border-[#b08a3c]/50"><div className="flex items-center justify-between"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f1eadb] text-[#9a742b]"><Icon size={19} /></span><ArrowRight className="text-slate-300 transition group-hover:text-[#9a742b]" size={18} /></div><p className="mt-6 text-3xl font-semibold">{card.value}</p><p className="mt-1 text-sm text-slate-500">{card.label}</p></button>; })}</section><section className="mt-6 rounded-[1.75rem] bg-[#071a33] p-6 text-white sm:p-8"><div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-xs font-bold uppercase tracking-[.18em] text-[#e4c26f]">Preparación del núcleo</p><h3 className="mt-3 text-2xl font-semibold">{community.name}</h3><p className="mt-2 max-w-xl text-sm leading-6 text-white/55">Completa los seis componentes esenciales antes de activar procesos financieros y operativos.</p></div><p className="text-4xl font-semibold text-[#e4c26f]">{Math.round((readiness / 6) * 100)}%</p></div><div className="mt-6 h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-[#d6af57] transition-all" style={{ width: `${(readiness / 6) * 100}%` }} /></div></section></>;
}

function CommunityDialog({
  community,
  requireBoardSetup = false,
  requireClientSetup = false,
  error = '',
  saving = false,
  onSubmit,
  onClose,
}: {
  community?: Community | null;
  requireBoardSetup?: boolean;
  requireClientSetup?: boolean;
  error?: string;
  saving?: boolean;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onClose: () => void;
}) {
  const value = community ?? emptyCommunity;
  const [mode, setMode] = useState<AdministrationMode>(value.administrationMode);
  const blankMember = (): InitialBoardMember => ({
    id: safeRandomUUID(),
    firstName: '',
    lastName: '',
    documentType: 'V',
    documentNumber: '',
    phone: '',
    email: '',
    position: '',
    startsOn: new Date().toISOString().slice(0, 10),
    endsOn: '',
    propertyKind: 'apartment',
    propertyCode: '',
    ownershipPercentage: 100,
    aliquot: '',
    maximumOccupancy: 1,
    braceletQuota: 0,
  });
  const [members, setMembers] = useState<InitialBoardMember[]>([blankMember()]);
  const updateMember = <K extends keyof InitialBoardMember>(
    id: string,
    key: K,
    nextValue: InitialBoardMember[K],
  ) => {
    setMembers(current =>
      current.map(member =>
        member.id === id ? { ...member, [key]: nextValue } : member,
      ),
    );
  };
  const showBoardMembers = mode === 'board' && requireBoardSetup;

  return (
    <Dialog
      title={community ? 'Configurar condominio' : 'Crear condominio'}
      description="Identidad legal, contacto, modelo administrativo y conformación inicial."
      onClose={onClose}
    >
      <form onSubmit={onSubmit}>
        {error && (
          <div role="alert" className="mb-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold leading-6 text-rose-700">
            <p>No se pudo guardar la comunidad</p>
            <p className="mt-1 font-normal">{error}</p>
          </div>
        )}
        <input
          type="hidden"
          name="boardMembers"
          value={JSON.stringify(showBoardMembers ? members : [])}
        />
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Nombre del condominio" span>
            <input name="name" defaultValue={value.name} className={inputClass} required placeholder="Ej.: Conjunto Residencial Marina" />
          </Field>
          <Field label="Razón social">
            <input name="legalName" defaultValue={value.legalName} className={inputClass} required />
          </Field>
          <Field label="RIF">
            <input name="rif" defaultValue={value.rif} className={inputClass} required placeholder="J-12345678-9" pattern="[JjGgVvEePp]-?[0-9]{8}-?[0-9]" />
          </Field>
          <Field label="Teléfono">
            <input name="phone" defaultValue={value.phone} type="tel" className={inputClass} required />
          </Field>
          <Field label="Correo institucional">
            <input name="email" defaultValue={value.email} type="email" className={inputClass} required={requireClientSetup} />
          </Field>
          {requireClientSetup && (
            <>
              <Field label="Contacto principal" hint="Persona responsable de la relación comercial y la incorporación a CASA.">
                <input name="contactName" className={inputClass} required />
              </Field>
              <Field label="Licencia mensual (USD)" hint="Monto mensual acordado por el acceso integral al ecosistema CASA.">
                <input name="monthlyFee" type="number" min="0" step="0.01" className={inputClass} required />
              </Field>
            </>
          )}
          <Field label="Dirección" span>
            <textarea name="address" defaultValue={value.address} className={`${inputClass} min-h-24 resize-y`} required />
          </Field>
          <Field label="Estado">
            <input name="state" defaultValue={value.state} className={inputClass} required />
          </Field>
          <Field label="Ciudad">
            <input name="city" defaultValue={value.city} className={inputClass} required />
          </Field>
          <Field label="Código postal">
            <input name="postalCode" defaultValue={value.postalCode} inputMode="numeric" className={inputClass} />
          </Field>
          <Field label="Modelo administrativo" span>
            <select name="administrationMode" value={mode} onChange={event => setMode(event.target.value as AdministrationMode)} className={inputClass}>
              <option value="board">La junta administra directamente</option>
              <option value="internal">Administración interna del condominio (Honorarios profesionales)</option>
              <option value="external">Administradora externa</option>
            </select>
          </Field>
          {mode !== 'board' && <>
            <Field label="Nombre del administrador">
              <input name="administratorName" defaultValue={value.administratorName} className={inputClass} required />
            </Field>
            <Field label="RIF o cédula del administrador">
              <input name="administratorRif" defaultValue={value.administratorRif} className={inputClass} required />
            </Field>
          </>}
        </div>

        {showBoardMembers && (
          <section className="mt-8 border-t border-slate-100 pt-7">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[.16em] text-[#9a742b]">Junta administradora inicial</p>
                <h4 className="mt-2 text-lg font-semibold">Personas, propiedades y cargos</h4>
                <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">Cada integrante será registrado como persona, propietario del inmueble indicado y miembro vigente de la junta. La operación se guarda completa o no se guarda.</p>
              </div>
              <button type="button" onClick={() => setMembers(current => [...current, blankMember()])} className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full border border-[#071a33]/15 px-4 py-2.5 text-sm font-bold"><Plus size={16} />Agregar cargo</button>
            </div>
            <div className="mt-5 space-y-5">
              {members.map((member, index) => (
                <article key={member.id} className="rounded-2xl border border-slate-200 bg-[#fcfbf8] p-5">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-bold">Integrante {String(index + 1).padStart(2, '0')}</p>
                    {members.length > 1 && <button type="button" onClick={() => setMembers(current => current.filter(item => item.id !== member.id))} className="text-xs font-bold text-rose-700">Eliminar</button>}
                  </div>
                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <Field label="Nombre"><input value={member.firstName} onChange={event => updateMember(member.id, 'firstName', event.target.value)} className={inputClass} required /></Field>
                    <Field label="Apellido"><input value={member.lastName} onChange={event => updateMember(member.id, 'lastName', event.target.value)} className={inputClass} required /></Field>
                    <Field label="Documento"><div className="grid grid-cols-[78px_1fr] gap-2"><select value={member.documentType} onChange={event => updateMember(member.id, 'documentType', event.target.value as InitialBoardMember['documentType'])} className={inputClass}><option>V</option><option>E</option><option>J</option><option>P</option></select><input value={member.documentNumber} onChange={event => updateMember(member.id, 'documentNumber', event.target.value)} className={inputClass} required /></div></Field>
                    <Field label="Cargo en la junta"><input value={member.position} onChange={event => updateMember(member.id, 'position', event.target.value)} className={inputClass} required placeholder="Ej.: Presidente, tesorero, vocal" /></Field>
                    <Field label="Teléfono"><input type="tel" value={member.phone} onChange={event => updateMember(member.id, 'phone', event.target.value)} className={inputClass} /></Field>
                    <Field label="Correo"><input type="email" value={member.email} onChange={event => updateMember(member.id, 'email', event.target.value)} className={inputClass} /></Field>
                    <Field label="Inicio del cargo"><input type="date" value={member.startsOn} onChange={event => updateMember(member.id, 'startsOn', event.target.value)} className={inputClass} required /></Field>
                    <Field label="Fin previsto" hint="Puede quedar vacío si no existe vencimiento definido."><input type="date" value={member.endsOn} onChange={event => updateMember(member.id, 'endsOn', event.target.value)} className={inputClass} /></Field>
                    <Field label="Categoría del inmueble"><select value={member.propertyKind} onChange={event => updateMember(member.id, 'propertyKind', event.target.value as PropertyKind)} className={inputClass}>{Object.entries(propertyKindLabels).map(([kind, label]) => <option key={kind} value={kind}>{label}</option>)}</select></Field>
                    <Field label="Código del inmueble"><input value={member.propertyCode} onChange={event => updateMember(member.id, 'propertyCode', event.target.value)} className={inputClass} required placeholder="Ej.: A-101" /></Field>
                    <Field label="Participación de propiedad (%)"><input type="number" min="0.0001" max="100" step="0.0001" value={member.ownershipPercentage} onChange={event => updateMember(member.id, 'ownershipPercentage', Number(event.target.value))} className={inputClass} required /></Field>
                    <Field label="Alícuota del inmueble (%)" hint="Puede quedar pendiente."><input type="number" min="0" max="100" step="0.000001" value={member.aliquot} onChange={event => updateMember(member.id, 'aliquot', event.target.value)} className={inputClass} /></Field>
                    <Field label="Capacidad máxima de personas"><input type="number" min="1" max="10000" value={member.maximumOccupancy} onChange={event => updateMember(member.id, 'maximumOccupancy', Number(event.target.value))} className={inputClass} required /></Field>
                    <Field label="Cupos de brazaletes"><input type="number" min="0" max="10000" value={member.braceletQuota} onChange={event => updateMember(member.id, 'braceletQuota', Number(event.target.value))} className={inputClass} required /></Field>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}
        <SubmitButton disabled={saving}>{saving ? 'Guardando comunidad…' : showBoardMembers ? 'Guardar comunidad y conformar junta' : community ? 'Guardar cambios' : 'Crear condominio'}</SubmitButton>
      </form>
    </Dialog>
  );
}

function LocationDialog({ onSubmit, onClose }: { onSubmit: (event: FormEvent<HTMLFormElement>) => void; onClose: () => void }) {
  return <Dialog title="Agregar ubicación" description="Edificio y torre se consideran la misma ubicación. Un centro comercial puede contener varios locales." onClose={onClose}><form onSubmit={onSubmit}><div className="grid gap-5 sm:grid-cols-2"><Field label="Tipo de ubicación"><select name="kind" className={inputClass}>{Object.entries(propertyLocationKindLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></Field><Field label="Código"><input name="code" className={inputClass} required placeholder="Ej.: EDIF-A / CC-01" /></Field><Field label="Nombre visible" span><input name="name" className={inputClass} required placeholder="Ej.: Edificio A / Centro Comercial Marina" /></Field></div><SubmitButton>Guardar ubicación</SubmitButton></form></Dialog>;
}

function PropertyDialog({ locations, onSubmit, onClose }: { locations: CoreState['propertyLocations']; onSubmit: (event: FormEvent<HTMLFormElement>) => void; onClose: () => void }) {
  const [aliquot, setAliquot] = useState('');
  return <Dialog title="Registrar inmueble" description="El código es su identificador visible; no necesita repetirlo en un campo de nombre." onClose={onClose}><form onSubmit={onSubmit}><div className="grid gap-5 sm:grid-cols-2"><Field label="Categoría"><select name="kind" className={inputClass}>{Object.entries(propertyKindLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></Field><Field label="Código único"><input name="code" className={inputClass} required placeholder="Ej.: A-101 / TH-24 / LC-12" /></Field><Field label="Ubicación"><select name="locationId" className={inputClass}><option value="">Directamente en el condominio</option>{locations.map(item => <option key={item.id} value={item.id}>{item.name} · {item.code}</option>)}</select></Field><Field label="Alícuota (%)" hint="Solo números y un único punto o coma."><input name="aliquot" type="text" inputMode="decimal" value={aliquot} onChange={event => setAliquot(aliquotCharactersOnly(event.target.value))} className={inputClass} /></Field><Field label="Capacidad máxima de personas" hint="Máximo autorizado de personas dentro del inmueble."><input name="maximumOccupancy" type="number" min="1" max="10000" step="1" className={inputClass} required /></Field><Field label="Cupos de brazaletes" hint="Cantidad de brazaletes asignables según la política del condominio."><input name="braceletQuota" type="number" min="0" max="10000" step="1" defaultValue="0" className={inputClass} required /></Field></div><SubmitButton>Registrar inmueble</SubmitButton></form></Dialog>;
}

function PersonDialog({ properties, ownerships, onSubmit, onClose }: { properties: CoreState['properties']; ownerships: CoreState['ownerships']; onSubmit: (event: FormEvent<HTMLFormElement>) => void; onClose: () => void }) {
  const [documentNumber, setDocumentNumber] = useState('');
  const [email, setEmail] = useState('');
  const [propertyId, setPropertyId] = useState('');
  const assignedFor = (id: string) => ownerships.filter(item => item.propertyId === id && item.status === 'active').reduce((sum, item) => sum + item.ownershipPercentage, 0);
  return <Dialog title="Registrar persona" description="Puedes vincularla a un inmueble durante este mismo registro." onClose={onClose}><form onSubmit={onSubmit}><div className="grid gap-5 sm:grid-cols-2"><Field label="Nombre"><input name="firstName" className={inputClass} required /></Field><Field label="Apellido"><input name="lastName" className={inputClass} required /></Field><Field label="Documento"><div className="grid grid-cols-[78px_1fr] gap-2"><select name="documentType" className={inputClass}><option>V</option><option>E</option><option>J</option><option>P</option></select><input name="documentNumber" inputMode="numeric" value={documentNumber} onChange={event => setDocumentNumber(digitsOnly(event.target.value))} className={inputClass} required /></div></Field><Field label="Teléfono"><input name="phone" type="tel" className={inputClass} /></Field><Field label="Correo" span><input name="email" type="email" value={email} onChange={event => setEmail(emailCharactersOnly(event.target.value))} className={inputClass} /></Field><div className="sm:col-span-2 border-t border-slate-100 pt-5"><p className="text-sm font-semibold text-[#071a33]">Vinculación opcional a inmueble</p><p className="mt-1 text-xs text-slate-500">La persona quedará registrada y vinculada como propietaria en un solo paso.</p></div><Field label="Inmueble"><select name="propertyId" value={propertyId} onChange={event => setPropertyId(event.target.value)} className={inputClass}><option value="">No vincular por ahora</option>{properties.map(item => { const assigned = assignedFor(item.id); return <option key={item.id} value={item.id} disabled={assigned >= 100}>{item.code} · {assigned >= 100 ? 'Vinculado 100%' : `${100 - assigned}% disponible`}</option>; })}</select></Field>{propertyId && <><Field label="Participación (%)"><input name="ownershipPercentage" type="number" min="0.01" max="100" step="0.01" defaultValue="100" className={inputClass} required /></Field><Field label="Vigente desde" span><input name="startsOn" type="date" defaultValue={new Date().toISOString().slice(0, 10)} className={inputClass} required /></Field></>}</div><SubmitButton>{propertyId ? 'Registrar y vincular inmueble' : 'Registrar persona'}</SubmitButton></form></Dialog>;
}

function EditPersonDialog({ person, onSubmit, onAddContact, onDeleteContact, onClose }: { person: CoreState['people'][number]; onSubmit: (event: FormEvent<HTMLFormElement>) => void; onAddContact: (type: 'PHONE' | 'EMAIL' | 'WHATSAPP' | 'OTHER', label: string, value: string) => Promise<void>; onDeleteContact: (contactId: string) => Promise<void>; onClose: () => void }) {
  const [contactType, setContactType] = useState<'PHONE' | 'EMAIL' | 'WHATSAPP' | 'OTHER'>('PHONE');
  const [contactLabel, setContactLabel] = useState('');
  const [contactValue, setContactValue] = useState('');
  const [savingContact, setSavingContact] = useState(false);

  const submitContact = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSavingContact(true);
    try {
      await onAddContact(contactType, contactLabel.trim(), contactValue.trim());
      setContactLabel('');
      setContactValue('');
    } finally {
      setSavingContact(false);
    }
  };

  return (
    <Dialog title="Editar información de persona" description="Modifica los datos de contacto y datos identificativos básicos. Cualquier cambio quedará debidamente registrado en la auditoría detallada." onClose={onClose}>
      <form onSubmit={onSubmit}>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Nombre">
            <input name="firstName" defaultValue={person.firstName} className={inputClass} required />
          </Field>
          <Field label="Apellido">
            <input name="lastName" defaultValue={person.lastName} className={inputClass} required />
          </Field>
          <Field label="Documento (No editable)">
            <input defaultValue={`${person.documentType}-${person.documentNumber}`} className={`${inputClass} cursor-not-allowed bg-slate-100 opacity-60`} disabled />
          </Field>
          <Field label="Teléfono">
            <input name="phone" type="tel" defaultValue={person.phone || ''} className={inputClass} />
          </Field>
          <Field label="Correo" span>
            <input name="email" type="email" defaultValue={person.email || ''} className={inputClass} />
          </Field>
        </div>
        <SubmitButton>Guardar cambios</SubmitButton>
      </form>
      <section className="mt-8 border-t border-slate-100 pt-7">
        <p className="text-xs font-bold uppercase tracking-[.16em] text-[#9a742b]">Formas de contacto secundarias</p>
        <div className="mt-4 space-y-2">
          {person.contacts.map(contact => <div key={contact.id} className="flex items-center justify-between gap-3 rounded-xl bg-[#f8f6f1] px-4 py-3 text-sm"><div><p className="font-semibold">{contact.label}</p><p className="mt-1 text-xs text-slate-500">{contact.type} · {contact.value}</p></div><button type="button" onClick={() => void onDeleteContact(contact.id)} className="rounded-lg border border-rose-200 px-2.5 py-1.5 text-xs font-bold text-rose-700">Eliminar</button></div>)}
          {!person.contacts.length && <p className="rounded-xl border border-dashed border-slate-200 p-4 text-sm text-slate-400">No hay contactos secundarios registrados.</p>}
        </div>
        <form onSubmit={submitContact} className="mt-5 grid gap-3 sm:grid-cols-[150px_1fr_1fr_auto] sm:items-end">
          <Field label="Tipo"><select value={contactType} onChange={event => setContactType(event.target.value as typeof contactType)} className={inputClass}><option value="PHONE">Teléfono</option><option value="WHATSAPP">WhatsApp</option><option value="EMAIL">Correo</option><option value="OTHER">Otro</option></select></Field>
          <Field label="Etiqueta"><input value={contactLabel} onChange={event => setContactLabel(event.target.value)} className={inputClass} required placeholder="Ej.: Oficina" /></Field>
          <Field label="Dato"><input value={contactValue} onChange={event => setContactValue(event.target.value)} className={inputClass} required placeholder="Número, correo u otro" /></Field>
          <button type="submit" disabled={savingContact} className="h-[46px] rounded-xl bg-[#071a33] px-4 text-sm font-bold text-white disabled:opacity-50">{savingContact ? 'Guardando…' : 'Agregar'}</button>
        </form>
      </section>
    </Dialog>
  );
}


function PersonSearchSelect({ people, onSelect }: { people: CoreState['people']; onSelect?: (personId: string) => void }) {
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState('');
  const matches = people.filter(person => `${person.firstName} ${person.lastName} ${person.documentType} ${person.documentNumber}`.toLocaleLowerCase('es-VE').includes(query.toLocaleLowerCase('es-VE')));
  const selected = people.find(person => person.id === selectedId);
  return <div className="mt-2"><input type="hidden" name="personId" value={selectedId} /><input value={query} onChange={event => { setQuery(event.target.value); setSelectedId(''); onSelect?.(''); }} className={`${inputClass.replace('mt-2 ', '')} font-semibold`} placeholder="Buscar por nombre o cédula" aria-label="Buscar persona" /><div className="mt-2 max-h-48 overflow-y-auto rounded-xl border border-slate-200 bg-white p-1">{matches.length ? matches.map(person => <button type="button" key={person.id} onClick={() => { setSelectedId(person.id); setQuery(`${person.firstName} ${person.lastName} · ${person.documentType}-${person.documentNumber}`); onSelect?.(person.id); }} className={`block w-full rounded-lg px-3 py-2 text-left text-sm font-semibold transition hover:bg-[#f8f3e8] ${selectedId === person.id ? 'bg-[#f1eadb] text-[#071a33]' : 'text-slate-700'}`}>{person.firstName} {person.lastName} <span className="text-xs font-semibold text-slate-400">· {person.documentType}-{person.documentNumber}</span></button>) : <p className="px-3 py-3 text-sm text-slate-400">No hay personas que coincidan.</p>}</div>{selected && <p className="mt-2 text-xs font-semibold text-emerald-700">Seleccionada: {selected.firstName} {selected.lastName}</p>}</div>;
}

function OwnershipDialog({ people, properties, ownerships, onSubmit, onClose }: { people: CoreState['people']; properties: CoreState['properties']; ownerships: CoreState['ownerships']; onSubmit: (event: FormEvent<HTMLFormElement>) => void; onClose: () => void }) {
  const assignedFor = (propertyId: string) => ownerships.filter(item => item.propertyId === propertyId && item.status === 'active').reduce((sum, item) => sum + item.ownershipPercentage, 0);
  const hasAvailableProperty = properties.some(item => assignedFor(item.id) < 100);
  const unavailable = !people.length || !hasAvailableProperty;
  return <Dialog title="Vincular propietario e inmueble" description="La relación guarda porcentaje y vigencia sin modificar la identidad ni el inmueble." onClose={onClose}><form onSubmit={onSubmit}><div className="grid gap-5 sm:grid-cols-2">{unavailable && <div className="sm:col-span-2 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">{!people.length ? 'Necesitas registrar al menos una persona.' : 'Todos los inmuebles visibles ya tienen el 100% de su propiedad vinculado.'}</div>}<Field label="Persona propietaria" span><PersonSearchSelect people={people} /></Field><Field label="Inmueble"><select name="propertyId" className={`${inputClass} font-semibold`} required disabled={!hasAvailableProperty}><option value="">Selecciona un inmueble</option>{properties.map(item => { const assigned = assignedFor(item.id); const linked = assigned >= 100; return <option key={item.id} value={item.id} disabled={linked}>{item.code} · {propertyKindLabels[item.kind]} · {linked ? 'Vinculado 100%' : `${100 - assigned}% disponible`}</option>; })}</select></Field><Field label={<>Participación (%)<HelpTooltip text="Es el porcentaje de propiedad legal que le corresponde a esta persona sobre el inmueble. No es la alícuota usada para calcular el condominio. Si hay copropietarios, la suma de sus participaciones debe llegar a 100%." /></>}><input name="ownershipPercentage" type="number" min="0.01" max="100" step="0.01" defaultValue="100" className={inputClass} required /></Field><Field label="Vigente desde" span><input name="startsOn" type="date" className={inputClass} required /></Field></div><button type="submit" disabled={unavailable} className="mt-8 inline-flex w-full items-center justify-center rounded-full bg-[#071a33] px-6 py-3.5 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-35">Crear vínculo de propiedad</button></form></Dialog>;
}

function EmploymentAccessDialog({ person, onSubmit, onClose }: { person: CoreState['people'][number]; onSubmit: (input: { personId: string; roleCode: string; workspaceCodes: string[]; scopes: string[]; pin: string }) => Promise<void>; onClose: () => void }) {
  const makePin = () => String(Math.floor(10000000 + Math.random() * 90000000));
  const [pin, setPin] = useState(makePin);
  const [roleCode, setRoleCode] = useState('LECTURA');
  const [workspaces, setWorkspaces] = useState<string[]>([]);
  const [scopes, setScopes] = useState<string[]>([]);
  const [permissionQuery, setPermissionQuery] = useState('');
  const [saving, setSaving] = useState(false);
  const toggle = (value: string, setter: Dispatch<SetStateAction<string[]>>) => setter(current => current.includes(value) ? current.filter(item => item !== value) : [...current, value]);
  const visibleScopes = scopeCatalog.filter(scope => {
    const matchingWorkspace = scope.workspaceCode === '*' || workspaces.includes(scope.workspaceCode);
    const query = permissionQuery.trim().toLocaleLowerCase('es-VE');
    return matchingWorkspace && (!query || `${scope.label} ${scope.code} ${scope.description}`.toLocaleLowerCase('es-VE').includes(query));
  });
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    try {
      await onSubmit({ personId: person.id, roleCode, workspaceCodes: workspaces, scopes: Array.from(new Set([...scopesForWorkspaceFull(workspaces), ...scopes])), pin });
    } finally {
      setSaving(false);
    }
  };
  return <Dialog title="Crear acceso de trabajador" description="Configura el usuario, PIN temporal, rol, espacios y permisos de esta persona." onClose={onClose}><form onSubmit={submit}><div className="rounded-2xl bg-[#f8f6f1] p-4"><p className="font-semibold text-[#071a33]">{person.firstName} {person.lastName}</p><p className="mt-1 text-sm text-slate-500">Usuario: {person.email || 'Sin correo registrado'} · Teléfono: {person.phone || 'Sin teléfono registrado'}</p><p className="mt-2 text-xs leading-5 text-slate-500">El acceso se crea con el correo y teléfono registrados. El trabajador podrá modificar sus datos y PIN posteriormente.</p></div>{!person.email && <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">Registra un correo en la ficha de la persona antes de crear su acceso.</p>}<div className="mt-5 grid gap-5 sm:grid-cols-2"><Field label="PIN temporal visible"><div className="flex gap-2"><input value={pin} onChange={event => setPin(digitsOnly(event.target.value).slice(0, 8))} inputMode="numeric" minLength={8} maxLength={8} className={inputClass} required /><button type="button" onClick={() => setPin(makePin())} className="mt-2 rounded-xl border border-slate-200 px-3 text-xs font-bold text-slate-600">Generar</button></div></Field><Field label="Rol"><select value={roleCode} onChange={event => setRoleCode(event.target.value)} className={inputClass}>{roleCatalog.map(role => <option key={role.code} value={role.code}>{role.label}</option>)}</select></Field></div><fieldset className="mt-6"><legend className="text-sm font-bold text-slate-700">Espacios de trabajo</legend><div className="mt-3 grid gap-2 sm:grid-cols-2">{workspaceCatalog.map(workspace => <label key={workspace.code} className="flex gap-3 rounded-xl border border-slate-200 p-3 text-sm"><input type="checkbox" checked={workspaces.includes(workspace.code)} onChange={() => toggle(workspace.code, setWorkspaces)} className="mt-0.5 accent-[#071a33]" /><span><strong>{workspace.label}</strong><span className="mt-1 block text-xs text-slate-500">{workspace.description}</span></span></label>)}</div></fieldset><fieldset className="mt-6"><legend className="text-sm font-bold text-slate-700">Permisos adicionales</legend><input value={permissionQuery} onChange={event => setPermissionQuery(event.target.value)} className={`${inputClass} mt-2`} placeholder="Buscar permiso por nombre o código" /><div className="mt-3 grid max-h-56 gap-2 overflow-y-auto rounded-xl border border-slate-200 p-3">{visibleScopes.map(scope => <label key={scope.code} className="flex gap-3 text-sm"><input type="checkbox" checked={scopes.includes(scope.code)} onChange={() => toggle(scope.code, setScopes)} className="mt-0.5 accent-[#071a33]" /><span><strong>{scope.label}</strong><span className="mt-0.5 block text-xs text-slate-500">{scope.description}</span></span></label>)}{!visibleScopes.length && <p className="text-sm text-slate-400">No hay permisos para los espacios seleccionados.</p>}</div></fieldset><button type="submit" disabled={saving || !person.email || pin.length !== 8 || !workspaces.length} className="mt-7 inline-flex w-full items-center justify-center rounded-full bg-[#071a33] px-6 py-3.5 text-sm font-bold text-white disabled:opacity-40">{saving ? 'Creando acceso…' : 'Crear usuario y acceso'}</button></form></Dialog>;
}

function EmploymentDialog({ people, board, employments, onSubmit, onClose }: { people: CoreState['people']; board: CoreState['boardAppointments']; employments: CoreState['employments']; onSubmit: (event: FormEvent<HTMLFormElement>) => void; onClose: () => void }) {
  const activeBoardIds = new Set(board.filter(item => item.status === 'active').map(item => item.personId));
  const employedIds = new Set(employments.filter(item => item.status === 'active').map(item => item.personId));
  const eligible = people.some(item => !activeBoardIds.has(item.id) && !employedIds.has(item.id));
  const eligiblePeople = people.filter(item => !activeBoardIds.has(item.id) && !employedIds.has(item.id));
  return <Dialog title="Vincular trabajador" description="La relación laboral es independiente de la propiedad y conserva su vigencia histórica." onClose={onClose}><form onSubmit={onSubmit}><div className="grid gap-5 sm:grid-cols-2">{!eligible && <div className="sm:col-span-2 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">No hay personas elegibles. Los integrantes de junta y el personal ya vinculado aparecen visibles, pero no pueden seleccionarse.</div>}<Field label="Persona" span><PersonSearchSelect people={eligiblePeople} /></Field><Field label="Cargo"><input name="position" className={inputClass} required placeholder="Ej.: Coordinador de mantenimiento" /></Field><Field label="Departamento"><input name="department" className={inputClass} required placeholder="Ej.: Operaciones" /></Field><Field label="Tipo de vinculación"><select name="engagementType" className={inputClass}><option value="employee">Relación laboral</option><option value="professional-fee">Honorarios profesionales</option><option value="contractor">Contratista</option></select></Field><Field label="Inicio"><input name="startsOn" type="date" className={inputClass} required /></Field><Field label="Fin previsto"><input name="endsOn" type="date" className={inputClass} /></Field></div><button type="submit" disabled={!eligible} className="mt-8 inline-flex w-full items-center justify-center rounded-full bg-[#071a33] px-6 py-3.5 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-35">Crear relación laboral</button></form></Dialog>;
}

function ConcessionDialog({ concession, onSubmit, onClose }: { concession?: CoreState['concessions'][number]; onSubmit: (event: FormEvent<HTMLFormElement>) => void; onClose: () => void }) {
  return <Dialog title={concession ? 'Editar concesión' : 'Registrar concesión'} description="Las concesiones son contratos operativos: no son inmuebles, no tienen alícuota y pueden pagar un canon fijo." onClose={onClose}><form onSubmit={onSubmit}><div className="grid gap-5 sm:grid-cols-2"><Field label="Código"><input name="code" defaultValue={concession?.code} className={inputClass} required placeholder="Ej.: CONC-001" /></Field><Field label="Nombre"><input name="name" defaultValue={concession?.name} className={inputClass} required placeholder="Ej.: Operador de telecomunicaciones" /></Field><Field label="Titular"><input name="holderName" defaultValue={concession?.holderName} className={inputClass} required /></Field><Field label="RIF o cédula"><input name="holderDocument" defaultValue={concession?.holderDocument} className={inputClass} required /></Field><Field label="Ubicación" span><input name="locationDescription" defaultValue={concession?.locationDescription} className={inputClass} placeholder="Ej.: Azotea del Edificio A" /></Field><Field label="Canon mensual"><input name="monthlyAmount" type="number" min="0" step="0.01" defaultValue={concession?.monthlyAmount} className={inputClass} required /></Field><Field label="Moneda"><select name="currency" defaultValue={concession?.currency ?? 'USD'} className={inputClass}><option>USD</option><option>VES</option></select></Field><Field label="Inicio"><input name="startsOn" type="date" defaultValue={concession?.startsOn?.slice(0, 10)} className={inputClass} required /></Field><Field label="Fin previsto"><input name="endsOn" type="date" defaultValue={concession?.endsOn?.slice(0, 10)} className={inputClass} /></Field></div><SubmitButton>{concession ? 'Guardar cambios' : 'Registrar concesión'}</SubmitButton></form></Dialog>;
}

function ConcessionDetailDialog({ concession, onEdit, onClose }: { concession: CoreState['concessions'][number]; onEdit: () => void; onClose: () => void }) {
  const details = [
    ['Código', concession.code],
    ['Nombre', concession.name],
    ['Titular', concession.holderName],
    ['RIF o cédula', concession.holderDocument],
    ['Ubicación', concession.locationDescription || 'No especificada'],
    ['Canon mensual', `${concession.currency} ${concession.monthlyAmount.toLocaleString('es-VE', { minimumFractionDigits: 2 })}`],
    ['Inicio de vigencia', formatDateTime(concession.startsOn)],
    ['Fin previsto', concession.endsOn ? formatDateTime(concession.endsOn) : 'Sin vencimiento definido'],
    ['Estado', concession.status === 'active' ? 'Vigente' : 'Finalizada'],
    ['Motivo de cierre', concession.endReason || 'No aplica'],
  ];
  return <Dialog title={`${concession.code} · ${concession.name}`} description="Ficha contractual completa de la concesión dentro de esta comunidad." onClose={onClose}><dl className="grid gap-4 sm:grid-cols-2">{details.map(([label, value]) => <div key={label} className="rounded-2xl bg-[#f8f6f1] p-4"><dt className="text-xs font-bold uppercase tracking-wider text-slate-400">{label}</dt><dd className="mt-2 text-sm font-semibold text-[#071a33]">{value}</dd></div>)}</dl>{concession.status === 'active' && <button type="button" onClick={onEdit} className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-[#071a33] px-6 py-3.5 text-sm font-bold text-white">Editar concesión</button>}</Dialog>;
}

function BoardDialog({
  people,
  properties,
  employments,
  ownerships,
  onSubmit,
  onClose,
}: {
  people: CoreState['people'];
  properties: CoreState['properties'];
  employments: CoreState['employments'];
  ownerships: CoreState['ownerships'];
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onClose: () => void;
}) {
  const [selectedPersonId, setSelectedPersonId] = useState<string>('');
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>('');

  const employeeIds = useMemo(
    () => new Set(employments.filter((item) => item.status === 'active').map((item) => item.personId)),
    [employments],
  );

  const personProperties = useMemo(() => {
    if (!selectedPersonId) return [];
    const ownedPropertyIds = new Set(
      ownerships
        .filter((item) => item.personId === selectedPersonId && item.status === 'active')
        .map((item) => item.propertyId),
    );
    return properties.filter((item) => ownedPropertyIds.has(item.id));
  }, [selectedPersonId, ownerships, properties]);

  useEffect(() => {
    if (personProperties.length === 1) {
      setSelectedPropertyId(personProperties[0].id);
    } else if (!personProperties.some((p) => p.id === selectedPropertyId)) {
      setSelectedPropertyId('');
    }
  }, [selectedPersonId, personProperties]);

  const selectedPersonIsEmployee = Boolean(selectedPersonId && employeeIds.has(selectedPersonId));
  const selectedPersonHasNoProperties = Boolean(selectedPersonId && personProperties.length === 0);
  const isSelectedPersonValid = Boolean(selectedPersonId && !selectedPersonIsEmployee && personProperties.length > 0);

  return (
    <Dialog
      title="Designar integrante de junta"
      description="El cargo se registra con la persona, el inmueble que representa y el período de vigencia."
      onClose={onClose}
    >
      <form onSubmit={onSubmit}>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Persona / Propietario" span>
            <PersonSearchSelect people={people} onSelect={setSelectedPersonId} />
          </Field>

          {selectedPersonIsEmployee && (
            <div className="sm:col-span-2 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
              Esta persona es <strong>trabajador vigente</strong> del condominio y no puede ser designada como integrante de la junta de condominio mientras su relación laboral esté activa.
            </div>
          )}

          {selectedPersonId && !selectedPersonIsEmployee && selectedPersonHasNoProperties && (
            <div className="sm:col-span-2 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
              Esta persona no posee un inmueble registrado a su nombre. Para integrar la junta debe ser propietaria de al menos un inmueble en la comunidad.
            </div>
          )}

          <Field label="Cargo">
            <input name="position" className={inputClass} required placeholder="Ej.: Presidente" />
          </Field>

          <Field label="Inmueble que representa">
            <select
              name="propertyId"
              className={inputClass}
              required
              disabled={!selectedPersonId || personProperties.length === 0 || selectedPersonIsEmployee}
              value={selectedPropertyId}
              onChange={(e) => setSelectedPropertyId(e.target.value)}
            >
              <option value="">
                {!selectedPersonId
                  ? 'Selecciona una persona primero'
                  : personProperties.length === 0
                  ? 'Sin inmueble asociado a esta persona'
                  : 'Selecciona el inmueble'}
              </option>
              {personProperties.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.code} · {propertyKindLabels[item.kind]}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Inicio del período">
            <input
              name="startsOn"
              type="date"
              className={inputClass}
              required
              defaultValue={new Date().toISOString().slice(0, 10)}
            />
          </Field>

          <Field label="Fin del período">
            <input name="endsOn" type="date" className={inputClass} />
          </Field>
        </div>

        <button
          type="submit"
          disabled={!isSelectedPersonValid || !selectedPropertyId}
          className="mt-8 inline-flex w-full items-center justify-center rounded-full bg-[#071a33] px-6 py-3.5 text-sm font-bold text-white transition hover:bg-[#12335a] disabled:cursor-not-allowed disabled:opacity-35"
        >
          Registrar designación
        </button>
      </form>
    </Dialog>
  );
}

function BankDialog({ community, onSubmit, onClose }: { community: Community; onSubmit: (event: FormEvent<HTMLFormElement>) => void; onClose: () => void }) {
  return <Dialog title="Agregar cuenta bancaria" description="Registra únicamente los datos de la cuenta. Después podrás habilitar uno o varios métodos de pago sobre ella." onClose={onClose}><form onSubmit={onSubmit}><div className="grid gap-5 sm:grid-cols-2"><Field label="Banco"><input name="bankName" className={inputClass} required /></Field><Field label="Moneda"><select name="currency" className={inputClass}><option>VES</option><option>USD</option><option>EUR</option><option>Otra</option></select></Field><Field label="Titular"><input name="holder" defaultValue={community.legalName} className={inputClass} required /></Field><Field label="RIF del titular"><input name="holderRif" defaultValue={community.rif} className={inputClass} required /></Field><Field label="Número de cuenta" span><input name="accountNumber" inputMode="numeric" className={inputClass} required minLength={10} /></Field><Field label="Tipo de cuenta"><select name="accountType" className={inputClass}><option value="corriente">Corriente</option><option value="ahorro">Ahorro</option><option value="custodia">Custodia</option><option value="otra">Otra</option></select></Field></div><SubmitButton>Guardar cuenta</SubmitButton></form></Dialog>;
}

function PaymentMethodDialog({ community, bankAccounts, onSubmit, onClose }: { community: Community; bankAccounts: CoreState['bankAccounts']; onSubmit: (event: FormEvent<HTMLFormElement>) => void; onClose: () => void }) {
  const [type, setType] = useState<'bank-transfer' | 'mobile-payment' | 'cash'>('bank-transfer');
  const [currency, setCurrency] = useState<'VES' | 'USD' | 'EUR'>('VES');
  const compatibleAccounts = bankAccounts.filter(item => item.active && item.currency === currency);
  const requiresAccount = type !== 'cash';
  return <Dialog title="Agregar método de pago" description="Define cómo puede pagar el propietario y, cuando corresponda, qué cuenta recibirá el dinero." onClose={onClose}><form onSubmit={onSubmit}><div className="grid gap-5 sm:grid-cols-2"><Field label="Tipo de método"><select name="type" value={type} onChange={event => { const next = event.target.value as typeof type; setType(next); if (next === 'mobile-payment') setCurrency('VES'); }} className={inputClass}><option value="bank-transfer">Transferencia bancaria</option><option value="mobile-payment">Pago móvil</option><option value="cash">Efectivo</option></select></Field><Field label="Nombre visible"><input name="label" className={inputClass} required placeholder="Ej.: Banesco bolívares" /></Field><Field label="Moneda">{type === 'mobile-payment' ? <input name="currency" value="VES" readOnly className={`${inputClass} cursor-not-allowed opacity-60`} /> : <select name="currency" value={currency} onChange={event => setCurrency(event.target.value as typeof currency)} className={inputClass}><option>VES</option><option>USD</option><option>EUR</option></select>}</Field>{requiresAccount && <Field label="Cuenta receptora"><select name="bankAccountId" className={inputClass} required><option value="">Selecciona una cuenta</option>{compatibleAccounts.map(item => <option key={item.id} value={item.id}>{item.bankName} · {item.currency} · •••• {item.accountNumber.slice(-4)}</option>)}</select>{!compatibleAccounts.length && <span className="mt-2 block text-xs font-normal text-amber-700">Primero debes registrar una cuenta activa en {currency}.</span>}</Field>}{type === 'mobile-payment' && <><Field label="Teléfono afiliado"><input name="mobilePhone" type="tel" className={inputClass} required placeholder="0412-1234567" /></Field><Field label="RIF o cédula afiliada"><input name="mobileDocument" defaultValue={community.rif} className={inputClass} required placeholder="J-12345678-9" /></Field></>}{type === 'cash' && <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-800">El efectivo requerirá posteriormente un recibo de caja y la identificación de quien lo recibió.</div>}<Field label="Instrucciones para el propietario" span><textarea name="instructions" className={`${inputClass} min-h-24 resize-y`} placeholder="Datos o indicaciones que se mostrarán al momento de pagar." /></Field></div><button type="submit" disabled={requiresAccount && !compatibleAccounts.length} className="mt-8 inline-flex w-full items-center justify-center rounded-full bg-[#071a33] px-6 py-3.5 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-35">Guardar método de pago</button></form></Dialog>;
}

function EndLifecycleDialog({ target, onSubmit, onClose }: { target: NonNullable<LifecycleTarget>; onSubmit: (event: FormEvent<HTMLFormElement>) => void; onClose: () => void }) {
  return <Dialog title={`Finalizar ${lifecycleLabel(target.kind).toLowerCase()}`} description="La relación no se elimina: se cierra su vigencia y permanece disponible para consulta y auditoría." onClose={onClose}><form onSubmit={onSubmit}><div className="rounded-2xl bg-[#f8f6f1] p-4"><p className="text-xs font-bold uppercase tracking-wider text-slate-400">Relación seleccionada</p><p className="mt-2 font-semibold">{target.label}</p></div><div className="mt-5 grid gap-5 sm:grid-cols-2"><Field label="Fecha efectiva"><input name="endsOn" type="date" defaultValue={new Date().toISOString().slice(0, 10)} className={inputClass} required /></Field><Field label="Motivo del cierre"><input name="reason" className={inputClass} required placeholder="Ej.: fin de contrato, renuncia, venta" /></Field></div><SubmitButton>Confirmar cierre histórico</SubmitButton></form></Dialog>;
}

function TransferOwnershipDialog({ people, source, personName, propertyName, onSubmit, onClose }: { people: CoreState['people']; source: CoreState['ownerships'][number]; personName: (id: string) => string; propertyName: (id: string | null) => string; onSubmit: (event: FormEvent<HTMLFormElement>) => void; onClose: () => void }) {
  const eligible = people.filter(item => item.id !== source.personId);
  return <Dialog title="Transferir propiedad" description="Cierra la titularidad actual y abre una nueva con el mismo porcentaje, preservando toda la cadena histórica." onClose={onClose}><form onSubmit={onSubmit}><div className="rounded-2xl bg-[#f8f6f1] p-4"><p className="text-xs font-bold uppercase tracking-wider text-slate-400">Titularidad actual</p><p className="mt-2 font-semibold">{propertyName(source.propertyId)} · {personName(source.personId)} · {source.ownershipPercentage}%</p></div><div className="mt-5 grid gap-5 sm:grid-cols-2"><Field label="Nuevo propietario" span><select name="personId" className={inputClass} required><option value="">Selecciona una persona</option>{eligible.map(item => <option key={item.id} value={item.id}>{item.firstName} {item.lastName} · {item.documentType}-{item.documentNumber}</option>)}</select></Field><Field label="Fecha efectiva"><input name="transferDate" type="date" defaultValue={new Date().toISOString().slice(0, 10)} className={inputClass} required /></Field><Field label="Motivo o soporte"><input name="reason" className={inputClass} required placeholder="Ej.: compraventa protocolizada" /></Field></div><button type="submit" disabled={!eligible.length} className="mt-8 inline-flex w-full items-center justify-center rounded-full bg-[#071a33] px-6 py-3.5 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-35">Registrar transferencia</button></form></Dialog>;
}

function AliquotDialog({ property, onSubmit, onClose }: { property: CoreState['properties'][number]; onSubmit: (event: FormEvent<HTMLFormElement>) => void; onClose: () => void }) {
  return <Dialog title="Modificar alícuota" description="El valor anterior se cierra por fecha y permanece en el historial. La modificación requiere una justificación." onClose={onClose}><form onSubmit={onSubmit}><div className="rounded-2xl bg-[#f8f6f1] p-4"><p className="text-xs font-bold uppercase tracking-wider text-slate-400">Inmueble</p><p className="mt-2 font-semibold">{property.code} · Valor actual: {property.aliquot ?? 'No definido'}{property.aliquot !== null ? '%' : ''}</p></div><div className="mt-5 grid gap-5 sm:grid-cols-2"><Field label="Nueva alícuota (%)"><input name="aliquot" type="number" min="0" max="100" step="0.000001" className={inputClass} required /></Field><Field label="Vigente desde"><input name="startsOn" type="date" defaultValue={new Date().toISOString().slice(0, 10)} className={inputClass} required /></Field><Field label="Motivo del cambio" span><input name="reason" className={inputClass} required placeholder="Ej.: actualización del documento de condominio" /></Field></div><SubmitButton>Guardar nueva vigencia</SubmitButton></form></Dialog>;
}

function PropertyCapacityDialog({ property, onSubmit, onClose }: { property: CoreState['properties'][number]; onSubmit: (event: FormEvent<HTMLFormElement>) => void; onClose: () => void }) {
  return <Dialog title="Capacidad y brazaletes" description={`Configura los límites operativos de ${property.code}. Ambos valores son independientes.`} onClose={onClose}><form onSubmit={onSubmit}><div className="grid gap-5 sm:grid-cols-2"><Field label="Capacidad máxima de personas" hint="Máximo autorizado de personas dentro del inmueble."><input name="maximumOccupancy" type="number" min="1" max="10000" step="1" defaultValue={property.maximumOccupancy ?? ''} className={inputClass} required /></Field><Field label="Cupos de brazaletes" hint="No se recalcula automáticamente a partir de la capacidad."><input name="braceletQuota" type="number" min="0" max="10000" step="1" defaultValue={property.braceletQuota} className={inputClass} required /></Field></div><SubmitButton>Guardar límites</SubmitButton></form></Dialog>;
}

function SubmitButton({ children, disabled = false }: { children: ReactNode; disabled?: boolean }) {
  return <button type="submit" disabled={disabled} className="mt-8 inline-flex w-full items-center justify-center rounded-full bg-[#071a33] px-6 py-3.5 text-sm font-bold text-white transition hover:bg-[#12335a] disabled:cursor-wait disabled:opacity-60">{children}</button>;
}

function EditBankAccountDialog({ bankAccount, onSubmit, onClose }: { bankAccount: CoreState['bankAccounts'][number]; onSubmit: (event: FormEvent<HTMLFormElement>) => void; onClose: () => void }) {
  return <Dialog title="Editar cuenta bancaria" description="Modifica los datos identificativos de esta cuenta." onClose={onClose}><form onSubmit={onSubmit}><div className="grid gap-5 sm:grid-cols-2"><Field label="Banco"><input name="bankName" defaultValue={bankAccount.bankName} className={inputClass} required /></Field><Field label="Moneda"><select name="currency" defaultValue={bankAccount.currency} className={inputClass}><option>VES</option><option>USD</option><option>EUR</option><option>Otra</option></select></Field><Field label="Titular"><input name="holder" defaultValue={bankAccount.holder} className={inputClass} required /></Field><Field label="RIF del titular"><input name="holderRif" defaultValue={bankAccount.holderRif} className={inputClass} required /></Field><Field label="Número de cuenta" span><input name="accountNumber" defaultValue={bankAccount.accountNumber} inputMode="numeric" className={inputClass} required minLength={10} /></Field><Field label="Tipo de cuenta"><select name="accountType" defaultValue={bankAccount.accountType} className={inputClass}><option value="corriente">Corriente</option><option value="ahorro">Ahorro</option><option value="custodia">Custodia</option><option value="otra">Otra</option></select></Field></div><SubmitButton>Guardar cambios</SubmitButton></form></Dialog>;
}

function EditPaymentMethodDialog({ method, bankAccounts, onSubmit, onClose }: { method: CoreState['paymentMethods'][number]; bankAccounts: CoreState['bankAccounts']; onSubmit: (event: FormEvent<HTMLFormElement>) => void; onClose: () => void }) {
  const [type, setType] = useState(method.type);
  const [currency, setCurrency] = useState(method.currency);
  const compatibleAccounts = bankAccounts.filter(item => item.active && item.currency === currency);
  const requiresAccount = type !== 'cash';
  return <Dialog title="Editar método de pago" description="Modifica la configuración y los datos visibles de este método de pago." onClose={onClose}><form onSubmit={onSubmit}><div className="grid gap-5 sm:grid-cols-2"><Field label="Tipo de método"><select name="type" value={type} onChange={event => { const next = event.target.value as typeof type; setType(next); if (next === 'mobile-payment') setCurrency('VES'); }} className={inputClass}><option value="bank-transfer">Transferencia bancaria</option><option value="mobile-payment">Pago móvil</option><option value="cash">Efectivo</option></select></Field><Field label="Nombre visible"><input name="label" defaultValue={method.label} className={inputClass} required placeholder="Ej.: Banesco bolívares" /></Field><Field label="Moneda">{type === 'mobile-payment' ? <input name="currency" value="VES" readOnly className={`${inputClass} cursor-not-allowed opacity-60`} /> : <select name="currency" value={currency} onChange={event => setCurrency(event.target.value as typeof currency)} className={inputClass}><option>VES</option><option>USD</option><option>EUR</option></select>}</Field>{requiresAccount && <Field label="Cuenta receptora"><select name="bankAccountId" defaultValue={method.bankAccountId || ''} className={inputClass} required><option value="">Selecciona una cuenta</option>{compatibleAccounts.map(item => <option key={item.id} value={item.id}>{item.bankName} · {item.currency} · •••• {item.accountNumber.slice(-4)}</option>)}</select>{!compatibleAccounts.length && <span className="mt-2 block text-xs font-normal text-amber-700">Primero debes registrar una cuenta activa en {currency}.</span>}</Field>}{type === 'mobile-payment' && <><Field label="Teléfono afiliado"><input name="mobilePhone" defaultValue={method.mobilePhone || ''} type="tel" className={inputClass} required placeholder="0412-1234567" /></Field><Field label="RIF o cédula afiliada"><input name="mobileDocument" defaultValue={method.mobileDocument || ''} className={inputClass} required placeholder="J-12345678-9" /></Field></>}{type === 'cash' && <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-800">El efectivo requerirá posteriormente un recibo de caja y la identificación de quien lo recibió.</div>}<Field label="Instrucciones para el propietario" span><textarea name="instructions" defaultValue={method.instructions || ''} className={`${inputClass} min-h-24 resize-y`} placeholder="Datos o indicaciones que se mostrarán al momento de pagar." /></Field></div><button type="submit" disabled={requiresAccount && !compatibleAccounts.length} className="mt-8 inline-flex w-full items-center justify-center rounded-full bg-[#071a33] px-6 py-3.5 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-35">Guardar cambios</button></form></Dialog>;
}
