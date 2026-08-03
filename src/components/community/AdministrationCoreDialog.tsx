import { useMemo, useState, type FormEvent } from 'react';
import { AlertCircle, Check, X } from 'lucide-react';
import {
  CommunityWorkspaceService,
  type CoreSnapshot,
  type TreasurySnapshot,
} from '../../services/CommunityWorkspaceService';
import { PersonSelectCombobox } from './PersonSelectCombobox';

export type AdministrationDialogMode =
  | 'person'
  | 'location'
  | 'property'
  | 'ownership'
  | 'employment'
  | 'board'
  | 'bank'
  | 'payment-method';

const today = () => new Date().toISOString().slice(0, 10);

const fieldClass =
  'mt-2 w-full rounded-xl border border-[#071a33]/12 bg-white px-3.5 py-3 text-sm text-[#071a33] outline-none transition focus:border-[#b08a3c] focus:ring-2 focus:ring-[#b08a3c]/15';

const labelClass =
  'text-xs font-bold uppercase tracking-[0.12em] text-slate-500';

function text(data: FormData, key: string) {
  return String(data.get(key) ?? '').trim();
}

function optional(data: FormData, key: string) {
  const value = text(data, key);
  return value || undefined;
}

function number(data: FormData, key: string) {
  const value = text(data, key);
  return value ? Number(value) : undefined;
}

const dialogCopy: Record<
  AdministrationDialogMode,
  { eyebrow: string; title: string; description: string; submit: string }
> = {
  person: {
    eyebrow: 'Directorio único',
    title: 'Registrar persona',
    description:
      'Crea la identidad una sola vez. Después podrás vincularla como propietaria, integrante de junta o trabajadora.',
    submit: 'Registrar persona',
  },
  location: {
    eyebrow: 'Estructura física',
    title: 'Crear ubicación',
    description:
      'Registra un edificio o centro comercial para organizar los inmuebles que contiene.',
    submit: 'Crear ubicación',
  },
  property: {
    eyebrow: 'Inventario',
    title: 'Registrar inmueble',
    description:
      'Crea el inmueble y sus parámetros operativos dentro de esta comunidad.',
    submit: 'Registrar inmueble',
  },
  ownership: {
    eyebrow: 'Relación jurídica',
    title: 'Vincular propietario e inmueble',
    description:
      'Selecciona una persona ya registrada y define su participación sobre el inmueble.',
    submit: 'Crear vinculación',
  },
  employment: {
    eyebrow: 'Equipo de trabajo',
    title: 'Incorporar al equipo',
    description:
      'Registra el cargo, área y modalidad de vinculación de una persona.',
    submit: 'Incorporar persona',
  },
  board: {
    eyebrow: 'Gobierno comunitario',
    title: 'Designar integrante de junta',
    description:
      'La persona debe ser propietaria y no puede mantener una relación laboral activa con la comunidad.',
    submit: 'Registrar designación',
  },
  bank: {
    eyebrow: 'Tesorería',
    title: 'Agregar cuenta bancaria',
    description:
      'Registra una cuenta oficial de la comunidad para sus operaciones y cobros.',
    submit: 'Agregar cuenta',
  },
  'payment-method': {
    eyebrow: 'Tesorería',
    title: 'Agregar método de pago',
    description:
      'Habilita transferencia, pago móvil o efectivo como canal aceptado por la comunidad.',
    submit: 'Agregar método',
  },
};

export function AdministrationCoreDialog({
  mode,
  core,
  treasury,
  onClose,
  onSaved,
}: {
  mode: AdministrationDialogMode;
  core: CoreSnapshot | null;
  treasury: TreasurySnapshot | null;
  onClose: () => void;
  onSaved: (message: string) => Promise<void> | void;
}) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [paymentType, setPaymentType] = useState<
    'BANK_TRANSFER' | 'MOBILE_PAYMENT' | 'CASH'
  >('BANK_TRANSFER');
  const copy = dialogCopy[mode];

  const ownershipCapacity = useMemo(() => {
    const result = new Map<string, number>();
    for (const ownership of core?.ownerships ?? []) {
      if (ownership.status !== 'ACTIVE') continue;
      result.set(
        ownership.propertyId,
        (result.get(ownership.propertyId) ?? 0) +
          Number(ownership.ownershipPercentage),
      );
    }
    return result;
  }, [core?.ownerships]);

  const activeEmployeeIds = useMemo(
    () =>
      new Set(
        (core?.employments ?? [])
          .filter((item) => item.status === 'ACTIVE')
          .map((item) => item.personId),
      ),
    [core?.employments],
  );
  const activeBoardIds = useMemo(
    () =>
      new Set(
        (core?.boardAppointments ?? [])
          .filter((item) => item.status === 'ACTIVE')
          .map((item) => item.personId),
      ),
    [core?.boardAppointments],
  );
  const ownerIds = useMemo(
    () =>
      new Set(
        (core?.ownerships ?? [])
          .filter((item) => item.status === 'ACTIVE')
          .map((item) => item.personId),
      ),
    [core?.ownerships],
  );

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    const data = new FormData(event.currentTarget);
    try {
      switch (mode) {
        case 'person':
          await CommunityWorkspaceService.createPerson({
            firstName: text(data, 'firstName').toLocaleUpperCase('es-VE'),
            lastName: text(data, 'lastName').toLocaleUpperCase('es-VE'),
            documentType: text(data, 'documentType') as 'V' | 'E' | 'J' | 'P',
            documentNumber: text(data, 'documentNumber'),
            phone: optional(data, 'phone'),
            email: optional(data, 'email')?.toLowerCase(),
          });
          break;
        case 'location':
          await CommunityWorkspaceService.createPropertyLocation({
            kind: text(data, 'kind') as 'BUILDING' | 'SHOPPING_CENTER',
            code: text(data, 'code'),
            name: text(data, 'name'),
          });
          break;
        case 'property': {
          const aliquot = number(data, 'aliquot');
          await CommunityWorkspaceService.createProperty({
            kind: text(data, 'kind') as
              | 'APARTMENT'
              | 'TOWNHOUSE'
              | 'COMMERCIAL',
            code: text(data, 'code'),
            locationId: optional(data, 'locationId'),
            aliquot,
            aliquotStartsOn: aliquot
              ? optional(data, 'aliquotStartsOn')
              : undefined,
            maximumOccupancy: number(data, 'maximumOccupancy'),
            braceletQuota: number(data, 'braceletQuota'),
          });
          break;
        }
        case 'ownership': {
          const propertyId = text(data, 'propertyId');
          const ownershipPercentage = Number(text(data, 'ownershipPercentage'));
          const assigned = ownershipCapacity.get(propertyId) ?? 0;
          const available = Math.max(0, 100 - assigned);
          if (!Number.isFinite(ownershipPercentage) || ownershipPercentage <= 0) {
            throw new Error('Indica una participación de propiedad válida.');
          }
          if (ownershipPercentage > available + 0.00005) {
            throw new Error(
              `La participación supera el porcentaje disponible. Restan ${available.toFixed(4)}% por vincular.`,
            );
          }
          await CommunityWorkspaceService.createOwnership({
            personId: text(data, 'personId'),
            propertyId,
            ownershipPercentage,
            startsOn: text(data, 'startsOn'),
          });
          break;
        }
        case 'employment': {
          const personId = text(data, 'personId');
          if (!personId) {
            throw new Error('Selecciona una persona para incorporar al equipo.');
          }
          if (activeEmployeeIds.has(personId)) {
            throw new Error('Esta persona ya posee una relación laboral activa en el equipo de este condominio.');
          }
          if (activeBoardIds.has(personId)) {
            throw new Error('Esta persona integra la Junta Directiva vigente y no puede incorporarse al equipo laboral.');
          }
          await CommunityWorkspaceService.createEmployment({
            personId,
            position: text(data, 'position'),
            department: text(data, 'department'),
            engagementType: text(data, 'engagementType') as
              | 'EMPLOYEE'
              | 'PROFESSIONAL_FEE'
              | 'CONTRACTOR',
            startsOn: text(data, 'startsOn'),
          });
          break;
        }
        case 'board': {
          const personId = text(data, 'personId');
          if (!personId) {
            throw new Error('Selecciona un propietario para la Junta Directiva.');
          }
          if (!ownerIds.has(personId)) {
            throw new Error('Solo un propietario verificado puede integrar la Junta Directiva.');
          }
          if (activeBoardIds.has(personId)) {
            throw new Error('Esta persona ya pertenece a la Junta Directiva vigente.');
          }
          if (activeEmployeeIds.has(personId)) {
            throw new Error('Un trabajador activo del condominio no puede integrar la Junta Directiva.');
          }
          await CommunityWorkspaceService.createBoardAppointment({
            personId,
            propertyId: optional(data, 'propertyId'),
            position: text(data, 'position'),
            startsOn: text(data, 'startsOn'),
            endsOn: optional(data, 'endsOn'),
          });
          break;
        }
        case 'bank':
          await CommunityWorkspaceService.createBankAccount({
            bankName: text(data, 'bankName'),
            holder: text(data, 'holder'),
            holderRif: text(data, 'holderRif'),
            accountNumber: text(data, 'accountNumber'),
            accountType: text(data, 'accountType'),
            currency: text(data, 'currency') as 'VES' | 'USD' | 'EUR',
          });
          break;
        case 'payment-method':
          await CommunityWorkspaceService.createPaymentMethod({
            type: paymentType,
            label: text(data, 'label'),
            currency: text(data, 'currency') as 'VES' | 'USD' | 'EUR',
            bankAccountId:
              paymentType === 'BANK_TRANSFER'
                ? text(data, 'bankAccountId')
                : undefined,
            mobilePhone:
              paymentType === 'MOBILE_PAYMENT'
                ? text(data, 'mobilePhone')
                : undefined,
            mobileDocument:
              paymentType === 'MOBILE_PAYMENT'
                ? text(data, 'mobileDocument')
                : undefined,
            instructions: optional(data, 'instructions'),
          });
          break;
      }
      await onSaved(`${copy.submit} completado correctamente.`);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : 'No fue posible guardar la información.',
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center bg-[#071a33]/60 p-0 backdrop-blur-sm sm:items-center sm:p-6">
      <button
        type="button"
        aria-label="Cerrar"
        className="absolute inset-0"
        onClick={onClose}
      />
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="administration-dialog-title"
        className="relative z-10 max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-t-[2rem] bg-[#f8f6f1] shadow-2xl sm:rounded-[2rem]"
      >
        <header className="sticky top-0 z-10 flex items-start justify-between gap-5 border-b border-[#071a33]/8 bg-[#f8f6f1]/95 px-6 py-5 backdrop-blur sm:px-8">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#9c7532]">
              {copy.eyebrow}
            </p>
            <h2
              id="administration-dialog-title"
              className="mt-2 text-2xl font-semibold"
            >
              {copy.title}
            </h2>
            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
              {copy.description}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-[#071a33]/10 bg-white p-2.5 text-slate-500 hover:text-[#071a33]"
          >
            <X size={18} />
          </button>
        </header>

        <form onSubmit={submit} className="space-y-5 px-6 py-6 sm:px-8">
          {mode === 'person' && <PersonFields />}
          {mode === 'location' && <LocationFields />}
          {mode === 'property' && (
            <PropertyFields locations={core?.locations ?? []} />
          )}
          {mode === 'ownership' && (
            <OwnershipFields
              core={core}
              ownershipCapacity={ownershipCapacity}
              ownerIds={ownerIds}
              activeEmployeeIds={activeEmployeeIds}
              activeBoardIds={activeBoardIds}
            />
          )}
          {mode === 'employment' && (
            <EmploymentFields
              core={core}
              activeEmployeeIds={activeEmployeeIds}
              activeBoardIds={activeBoardIds}
              ownerIds={ownerIds}
            />
          )}
          {mode === 'board' && (
            <BoardFields
              core={core}
              ownerIds={ownerIds}
              activeEmployeeIds={activeEmployeeIds}
              activeBoardIds={activeBoardIds}
            />
          )}
          {mode === 'bank' && <BankFields core={core} />}
          {mode === 'payment-method' && (
            <PaymentMethodFields
              treasury={treasury}
              type={paymentType}
              setType={setPaymentType}
            />
          )}

          {error && (
            <div
              role="alert"
              className="flex gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700"
            >
              <AlertCircle className="mt-0.5 shrink-0" size={17} />
              {error}
            </div>
          )}

          <footer className="flex flex-col-reverse gap-3 border-t border-[#071a33]/8 pt-5 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-[#071a33]/12 bg-white px-5 py-3 text-sm font-bold"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[#071a33] px-6 py-3 text-sm font-bold text-white disabled:opacity-50"
            >
              <Check size={17} />
              {saving ? 'Guardando…' : copy.submit}
            </button>
          </footer>
        </form>
      </section>
    </div>
  );
}

function Field({
  label,
  name,
  type = 'text',
  required,
  defaultValue,
  placeholder,
  min,
  max,
  step,
  className,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  defaultValue?: string | number;
  placeholder?: string;
  min?: string | number;
  max?: string | number;
  step?: string | number;
  className?: string;
}) {
  return (
    <label className={labelClass}>
      {label}
      <input
        className={`${fieldClass} ${className ?? ''}`}
        name={name}
        type={type}
        required={required}
        defaultValue={defaultValue}
        placeholder={placeholder}
        min={min}
        max={max}
        step={step}
      />
    </label>
  );
}

function Select({
  label,
  name,
  required,
  defaultValue,
  value,
  onChange,
  disabled,
  children,
  title,
}: {
  label: string;
  name: string;
  required?: boolean;
  defaultValue?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  disabled?: boolean;
  children: React.ReactNode;
  title?: string;
}) {
  return (
    <label className={labelClass} title={title}>
      {label}
      <select
        className={`${fieldClass} cursor-pointer disabled:cursor-not-allowed disabled:bg-slate-100 disabled:opacity-60`}
        name={name}
        required={required}
        defaultValue={defaultValue}
        value={value}
        onChange={onChange}
        disabled={disabled}
      >
        {children}
      </select>
    </label>
  );
}

function PersonFields() {
  return (
    <div className="grid gap-5 sm:grid-cols-2">
      <Field label="Nombres" name="firstName" required placeholder="PEDRO" />
      <Field label="Apellidos" name="lastName" required placeholder="PÉREZ" />
      <Select label="Tipo de documento" name="documentType" defaultValue="V">
        <option value="V">Venezolano (V)</option>
        <option value="E">Extranjero (E)</option>
        <option value="J">Jurídico (J)</option>
        <option value="P">Pasaporte (P)</option>
      </Select>
      <Field
        label="Número de documento"
        name="documentNumber"
        required
        placeholder="12345678"
      />
      <Field label="Teléfono (opcional)" name="phone" placeholder="0414-0000000" />
      <EmailInput label="Correo electrónico (opcional)" name="email" />
    </div>
  );
}

const commonEmailDomains = [
  'gmail.com',
  'hotmail.com',
  'outlook.com',
  'yahoo.com',
  'icloud.com',
  'live.com',
];

function levenshteinDistance(a: string, b: string): number {
  const matrix = Array.from({ length: a.length + 1 }, (_, i) => [i]);
  for (let j = 0; j <= b.length; j++) matrix[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      matrix[i][j] =
        a[i - 1] === b[j - 1]
          ? matrix[i - 1][j - 1]
          : Math.min(
              matrix[i - 1][j - 1],
              matrix[i][j - 1],
              matrix[i - 1][j],
            ) + 1;
    }
  }
  return matrix[a.length][b.length];
}

function isValidEmailAddress(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
}

function EmailInput({ label, name }: { label: string; name: string }) {
  const [value, setValue] = useState('');
  const [domainOverride, setDomainOverride] = useState<string | null>(null);

  const trimmed = value.trim();

  let recognized: string | null = null;
  if (trimmed.includes('@')) {
    const parts = trimmed.split('@');
    const domainPart = (parts[parts.length - 1] ?? '').toLowerCase();

    for (const d of commonEmailDomains) {
      if (domainPart === d) {
        recognized = d;
        break;
      }
    }
  }

  const effectiveDomain = domainOverride ?? recognized;

  const normalized = useMemo(() => {
    if (!trimmed) return '';
    if (trimmed.includes('@')) {
      const parts = trimmed.split('@');
      const localPart = parts.slice(0, -1).join('@');
      const domainPart = parts[parts.length - 1] ?? '';

      if (effectiveDomain) {
        return `${localPart}@${effectiveDomain}`.toLowerCase();
      }
      return `${localPart}@${domainPart}`.toLowerCase();
    }
    if (effectiveDomain) {
      return `${trimmed}@${effectiveDomain}`.toLowerCase();
    }
    return trimmed.toLowerCase();
  }, [trimmed, effectiveDomain]);

  const valid = useMemo(() => {
    if (!normalized) return true;
    return isValidEmailAddress(normalized);
  }, [normalized]);

  const correction = useMemo(() => {
    if (!trimmed.includes('@')) return null;
    const parts = trimmed.split('@');
    const domainPart = (parts[parts.length - 1] ?? '').toLowerCase();
    if (!domainPart || recognized) return null;

    let bestMatch: string | null = null;
    let lowestDistance = Infinity;

    for (const d of commonEmailDomains) {
      const dist = levenshteinDistance(domainPart, d);
      if (dist <= 2 && dist < lowestDistance) {
        lowestDistance = dist;
        bestMatch = d;
      }
    }

    return bestMatch;
  }, [trimmed, recognized]);

  const selectDomain = (d: string) => {
    setDomainOverride(d);
    if (!value.includes('@')) {
      setValue(`${value.trim()}@${d}`);
    } else {
      const parts = value.split('@');
      const localPart = parts.slice(0, -1).join('@');
      setValue(`${localPart}@${d}`);
    }
  };

  return (
    <div>
      <label className={labelClass}>
        {label}
        <input
          name={name}
          type="email"
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            setDomainOverride(null);
          }}
          className={fieldClass}
          placeholder="nombre@dominio.com"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          aria-invalid={!valid}
        />
      </label>
      {trimmed && !valid && (
        <p className="mt-1 text-xs text-red-600">
          Formato de correo inválido.
        </p>
      )}
      {correction && (
        <button
          type="button"
          onClick={() => selectDomain(correction)}
          className="mt-2 block rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-800"
        >
          ¿Quisiste escribir @{correction}?
        </button>
      )}
      <div className="mt-3 flex flex-wrap gap-2">
        <span className="self-center text-xs text-slate-400">Sugerir:</span>
        {commonEmailDomains.slice(0, 3).map((d) => (
          <button
            key={d}
            type="button"
            onClick={() => selectDomain(d)}
            className="rounded-full border border-[#071a33]/10 bg-white px-2.5 py-1 text-xs font-semibold text-slate-600 hover:border-[#b08a3c]"
          >
            @{d}
          </button>
        ))}
      </div>
    </div>
  );
}

function LocationFields() {
  return (
    <div className="grid gap-5 sm:grid-cols-2">
      <Select label="Tipo de ubicación" name="kind" defaultValue="BUILDING">
        <option value="BUILDING">Edificio o torre</option>
        <option value="SHOPPING_CENTER">Centro comercial</option>
      </Select>
      <Field label="Código" name="code" required placeholder="TORRE-A" />
      <div className="sm:col-span-2">
        <Field
          label="Nombre visible"
          name="name"
          required
          placeholder="Torre A"
        />
      </div>
    </div>
  );
}

function PropertyFields({
  locations,
}: {
  locations: CoreSnapshot['locations'];
}) {
  return (
    <div className="grid gap-5 sm:grid-cols-2">
      <Select label="Categoría" name="kind" defaultValue="APARTMENT">
        <option value="APARTMENT">Apartamento</option>
        <option value="TOWNHOUSE">Townhouse</option>
        <option value="COMMERCIAL">Local comercial</option>
      </Select>
      <Field label="Código del inmueble" name="code" required placeholder="A-101" />
      <Select label="Ubicación" name="locationId" defaultValue="">
        <option value="">Directo en la comunidad</option>
        {locations.map((location) => (
          <option key={location.id} value={location.id}>
            {location.name} · {location.code}
          </option>
        ))}
      </Select>
      <Field
        label="Alícuota (%)"
        name="aliquot"
        type="number"
        min={0}
        max={100}
        step="0.000001"
      />
      <Field
        label="Vigencia de alícuota"
        name="aliquotStartsOn"
        type="date"
        defaultValue={today()}
      />
      <Field
        label="Capacidad máxima de personas"
        name="maximumOccupancy"
        type="number"
        min={1}
        max={10000}
      />
      <Field
        label="Cupo de brazaletes"
        name="braceletQuota"
        type="number"
        min={0}
        max={10000}
        defaultValue={0}
      />
    </div>
  );
}

function OwnershipFields({
  core,
  ownershipCapacity,
  ownerIds,
  activeEmployeeIds,
  activeBoardIds,
}: {
  core: CoreSnapshot | null;
  ownershipCapacity: Map<string, number>;
  ownerIds: Set<string>;
  activeEmployeeIds: Set<string>;
  activeBoardIds: Set<string>;
}) {
  const [selectedPersonId, setSelectedPersonId] = useState<string>('');

  return (
    <div className="grid gap-5 sm:grid-cols-2">
      <PersonSelectCombobox
        label="Persona"
        name="personId"
        required
        core={core}
        ownerIds={ownerIds}
        activeEmployeeIds={activeEmployeeIds}
        activeBoardIds={activeBoardIds}
        mode="ownership"
        value={selectedPersonId}
        onChange={setSelectedPersonId}
      />
      <Select label="Inmueble" name="propertyId" required defaultValue="">
        <option value="" disabled>
          Selecciona un inmueble
        </option>
        {(core?.properties ?? []).map((property) => {
          const assigned = ownershipCapacity.get(property.id) ?? 0;
          const unavailable = assigned >= 100;
          return (
            <option
              key={property.id}
              value={property.id}
              disabled={unavailable}
            >
              {property.code}
              {property.location ? ` · ${property.location.name}` : ''}
              {unavailable
                ? ' · participación completa'
                : ` · ${Math.max(0, 100 - assigned).toFixed(4)}% por vincular`}
            </option>
          );
        })}
      </Select>

      <p className="rounded-xl border border-[#b08a3c]/20 bg-[#fffaf0] p-3 text-xs leading-5 text-[#75551e] sm:col-span-2">
        Cada inmueble indica el porcentaje pendiente en la lista. Por ejemplo,
        si ya tiene 50% vinculado, verás <strong>50.0000% por vincular</strong>.
      </p>
      <Field
        label="Participación (%)"
        name="ownershipPercentage"
        type="number"
        min="0.0001"
        max={100}
        step="0.0001"
        defaultValue={100}
        required
      />
      <Field
        label="Vigente desde"
        name="startsOn"
        type="date"
        defaultValue={today()}
        required
      />
      <p
        className="rounded-xl bg-[#f1ead9] p-4 text-xs leading-5 text-[#75551e] sm:col-span-2"
        title="Es el porcentaje legal que esta persona posee sobre el inmueble. La suma de propietarios activos no puede superar 100%."
      >
        <strong>¿Qué significa participación?</strong> Es el porcentaje de
        propiedad que corresponde a esta persona. Entre todos los propietarios
        activos del inmueble no puede superar 100%.
      </p>
    </div>
  );
}

function EmploymentFields({
  core,
  activeEmployeeIds,
  activeBoardIds,
  ownerIds,
}: {
  core: CoreSnapshot | null;
  activeEmployeeIds: Set<string>;
  activeBoardIds: Set<string>;
  ownerIds: Set<string>;
}) {
  const [selectedPersonId, setSelectedPersonId] = useState<string>('');

  return (
    <div className="grid gap-5 sm:grid-cols-2">
      <PersonSelectCombobox
        label="Persona a incorporar"
        name="personId"
        required
        core={core}
        ownerIds={ownerIds}
        activeEmployeeIds={activeEmployeeIds}
        activeBoardIds={activeBoardIds}
        mode="employment"
        value={selectedPersonId}
        onChange={setSelectedPersonId}
      />

      <Field label="Cargo" name="position" placeholder="Ej. Administrador, Conserje, Vigilante" required />
      <Field label="Área o departamento" name="department" placeholder="Ej. Operaciones, Mantenimiento" required />
      <Select
        label="Tipo de vinculación"
        name="engagementType"
        defaultValue="EMPLOYEE"
      >
        <option value="EMPLOYEE">Relación laboral</option>
        <option value="PROFESSIONAL_FEE">Honorarios profesionales</option>
        <option value="CONTRACTOR">Contratista</option>
      </Select>
      <Field
        label="Vigente desde"
        name="startsOn"
        type="date"
        defaultValue={today()}
        required
      />
    </div>
  );
}

function BoardFields({
  core,
  ownerIds,
  activeEmployeeIds,
  activeBoardIds,
}: {
  core: CoreSnapshot | null;
  ownerIds: Set<string>;
  activeEmployeeIds: Set<string>;
  activeBoardIds: Set<string>;
}) {
  const [selectedPersonId, setSelectedPersonId] = useState<string>('');

  return (
    <div className="grid gap-5 sm:grid-cols-2">
      <PersonSelectCombobox
        label="Propietario a designar"
        name="personId"
        required
        core={core}
        ownerIds={ownerIds}
        activeEmployeeIds={activeEmployeeIds}
        activeBoardIds={activeBoardIds}
        mode="board"
        value={selectedPersonId}
        onChange={setSelectedPersonId}
      />

      <Field label="Cargo en la junta" name="position" placeholder="Ej. Presidente, Secretario, Tesorero" required />
      <Field
        label="Vigente desde"
        name="startsOn"
        type="date"
        defaultValue={today()}
        required
      />
      <Field label="Vigente hasta (opcional)" name="endsOn" type="date" />
    </div>
  );
}

function BankFields({ core }: { core: CoreSnapshot | null }) {
  return (
    <div className="grid gap-5 sm:grid-cols-2">
      <Field label="Banco" name="bankName" required />
      <Field
        label="Titular"
        name="holder"
        required
        defaultValue={core?.legalName}
      />
      <Field
        label="RIF o identificación del titular"
        name="holderRif"
        required
        defaultValue={core?.rif}
      />
      <Field label="Número de cuenta" name="accountNumber" required />
      <Select
        label="Tipo de cuenta"
        name="accountType"
        defaultValue="CORRIENTE"
      >
        <option value="CORRIENTE">Corriente</option>
        <option value="AHORRO">Ahorro</option>
        <option value="CUSTODIA">Custodia / moneda extranjera</option>
        <option value="OTRA">Otra</option>
      </Select>
      <Select label="Moneda" name="currency" defaultValue="VES">
        <option value="VES">Bolívares (VES)</option>
        <option value="USD">Dólares (USD)</option>
        <option value="EUR">Euros (EUR)</option>
      </Select>
    </div>
  );
}

function PaymentMethodFields({
  treasury,
  type,
  setType,
}: {
  treasury: TreasurySnapshot | null;
  type: 'BANK_TRANSFER' | 'MOBILE_PAYMENT' | 'CASH';
  setType: (value: 'BANK_TRANSFER' | 'MOBILE_PAYMENT' | 'CASH') => void;
}) {
  return (
    <div className="grid gap-5 sm:grid-cols-2">
      <label className={labelClass}>
        Tipo de método
        <select
          className={fieldClass}
          value={type}
          onChange={(event) =>
            setType(
              event.target.value as
                | 'BANK_TRANSFER'
                | 'MOBILE_PAYMENT'
                | 'CASH',
            )
          }
        >
          <option value="BANK_TRANSFER">Transferencia bancaria</option>
          <option value="MOBILE_PAYMENT">Pago móvil</option>
          <option value="CASH">Efectivo</option>
        </select>
      </label>
      <Field
        label="Nombre visible"
        name="label"
        required
        placeholder={
          type === 'BANK_TRANSFER'
            ? 'Transferencia Banesco'
            : type === 'MOBILE_PAYMENT'
              ? 'Pago móvil'
              : 'Efectivo en caja'
        }
      />
      <Select label="Moneda" name="currency" defaultValue="VES">
        <option value="VES">Bolívares (VES)</option>
        <option value="USD">Dólares (USD)</option>
        <option value="EUR">Euros (EUR)</option>
      </Select>
      {type === 'BANK_TRANSFER' && (
        <Select
          label="Cuenta bancaria"
          name="bankAccountId"
          required
          defaultValue=""
        >
          <option value="" disabled>
            Selecciona una cuenta
          </option>
          {(treasury?.bankAccounts ?? [])
            .filter((account) => account.status === 'ACTIVE')
            .map((account) => (
              <option key={account.id} value={account.id}>
                {account.bankName} · {account.currency} · ••••{' '}
                {account.accountNumber.slice(-4)}
              </option>
            ))}
        </Select>
      )}
      {type === 'MOBILE_PAYMENT' && (
        <>
          <Field label="Teléfono afiliado" name="mobilePhone" required />
          <Field
            label="RIF o cédula afiliada"
            name="mobileDocument"
            required
          />
        </>
      )}
      <label className={`${labelClass} sm:col-span-2`}>
        Instrucciones para el propietario (opcional)
        <textarea
          className={`${fieldClass} min-h-28 resize-y`}
          name="instructions"
          placeholder="Indicaciones que verá el propietario al momento de pagar."
        />
      </label>
    </div>
  );
}
