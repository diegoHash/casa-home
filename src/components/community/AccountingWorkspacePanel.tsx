import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from 'react';
import { BookOpenCheck, LoaderCircle, Plus, RotateCcw, X, HelpCircle, Pencil } from 'lucide-react';
import { CommunityWorkspaceService, type AccountingSnapshot, type TreasurySnapshot } from '../../services/CommunityWorkspaceService';

type Dialog = 'account' | 'period' | 'entry' | 'post' | 'reverse' | 'close' | null;
type EntryLine = { id: string; accountId: string; description: string; debit: string; credit: string };

const inputClass = 'mt-1.5 w-full rounded-xl border border-[#071a33]/12 bg-white px-3.5 py-3 text-sm outline-none transition focus:border-[#b08a3c] focus:ring-2 focus:ring-[#b08a3c]/15';
const accountTypes = { ASSET: 'Activo', LIABILITY: 'Pasivo', EQUITY: 'Patrimonio', INCOME: 'Ingreso', EXPENSE: 'Gasto' } as const;
const statusLabels = { OPEN: 'Abierto', CLOSED: 'Cerrado', LOCKED: 'Bloqueado', DRAFT: 'Borrador', POSTED: 'Contabilizado', REVERSED: 'Reversado' } as const;
const money = new Intl.NumberFormat('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const blankLine = (): EntryLine => ({ id: crypto.randomUUID(), accountId: '', description: '', debit: '', credit: '' });

function formatDateTime(value: string | null) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  const parts = new Intl.DateTimeFormat('es-VE', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: false,
    timeZone: 'America/Caracas',
  }).formatToParts(date);
  const part = (type: Intl.DateTimeFormatPartTypes) => parts.find((item) => item.type === type)?.value ?? '';
  return `${part('day')}-${part('month')}-${part('year')} ${part('hour')}:${part('minute')}`;
}

export function AccountingWorkspacePanel({ canWrite, canPost, treasury: treasuryProp }: { canWrite: boolean; canPost: boolean; treasury?: TreasurySnapshot | null }) {
  const [snapshot, setSnapshot] = useState<AccountingSnapshot | null>(null);
  const [treasury, setTreasury] = useState<TreasurySnapshot | null>(treasuryProp ?? null);
  const [dialog, setDialog] = useState<Dialog>(null);
  const [targetId, setTargetId] = useState('');
  const [lines, setLines] = useState<EntryLine[]>([blankLine(), blankLine()]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [view, setView] = useState<'dashboard' | 'create-account' | 'edit-account'>('dashboard');
  const [editingAccount, setEditingAccount] = useState<AccountingSnapshot['ledgerAccounts'][number] | null>(null);
  const [createParentId, setCreateParentId] = useState('');
  const [editParentId, setEditParentId] = useState('');
  const [createType, setCreateType] = useState<keyof typeof accountTypes>('ASSET');
  const [editType, setEditType] = useState<keyof typeof accountTypes>('ASSET');

  useEffect(() => {
    if (treasuryProp) {
      setTreasury(treasuryProp);
    } else {
      CommunityWorkspaceService.treasurySnapshot().then(setTreasury).catch(() => null);
    }
  }, [treasuryProp]);

  const createParent = useMemo(() => 
    snapshot?.ledgerAccounts.find((item) => item.id === createParentId),
    [createParentId, snapshot]
  );
  
  const editParent = useMemo(() => 
    snapshot?.ledgerAccounts.find((item) => item.id === editParentId),
    [editParentId, snapshot]
  );

  useEffect(() => {
    if (editingAccount) {
      setEditParentId(editingAccount.parentId || '');
      setEditType(editingAccount.type);
    } else {
      setEditParentId('');
      setEditType('ASSET');
    }
  }, [editingAccount]);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      setSnapshot(await CommunityWorkspaceService.accountingSnapshot());
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No fue posible cargar la contabilidad.');
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timer);
  }, []);

  const openPeriods = snapshot?.accountingPeriods.filter((item) => item.status === 'OPEN') ?? [];
  const postingAccounts = snapshot?.ledgerAccounts.filter((item) => item.status === 'ACTIVE' && item.acceptsEntries) ?? [];
  const totals = useMemo(() => lines.reduce((sum, line) => ({
    debit: sum.debit + (Number(line.debit) || 0),
    credit: sum.credit + (Number(line.credit) || 0),
  }), { debit: 0, credit: 0 }), [lines]);
  const balanced = totals.debit > 0 && Math.abs(totals.debit - totals.credit) < 0.005;

  const execute = async (action: () => Promise<unknown>, success: string) => {
    setSaving(true);
    setError('');
    setNotice('');
    try {
      await action();
      setDialog(null);
      setView('dashboard');
      setTargetId('');
      setNotice(success);
      await load();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No fue posible completar la operación contable.');
    } finally {
      setSaving(false);
    }
  };

  const submitAccount = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const code = String(form.get('code')).trim().toUpperCase().replace(/\s+/g, '');

    // Duplicate check in frontend
    const exists = snapshot?.ledgerAccounts.some(
      (item) => item.code.trim().toUpperCase().replace(/\s+/g, '') === code
    );
    if (exists) {
      setError('Ya existe una cuenta contable en el catálogo con este código.');
      return;
    }

    void execute(() => CommunityWorkspaceService.createLedgerAccount({
      code,
      name: String(form.get('name')).trim(),
      description: String(form.get('description')).trim() || undefined,
      type: String(form.get('type')) as keyof typeof accountTypes,
      currency: (String(form.get('currency')) as 'VES' | 'USD' | 'EUR') || undefined,
      parentId: String(form.get('parentId')) || undefined,
      bankAccountId: String(form.get('bankAccountId') || '').trim() || undefined,
      acceptsEntries: form.get('acceptsEntries') === 'true',
    }), 'Cuenta contable creada.');
  };

  const submitEditAccount = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editingAccount) return;
    const form = new FormData(event.currentTarget);
    const code = String(form.get('code')).trim().toUpperCase().replace(/\s+/g, '');

    // Duplicate check excluding self in frontend
    const exists = snapshot?.ledgerAccounts.some(
      (item) => item.id !== editingAccount.id && item.code.trim().toUpperCase().replace(/\s+/g, '') === code
    );
    if (exists) {
      setError('Ya existe otra cuenta contable en el catálogo con este código.');
      return;
    }

    void execute(() => CommunityWorkspaceService.updateLedgerAccount(editingAccount.id, {
      code,
      name: String(form.get('name')).trim(),
      description: String(form.get('description')).trim() || undefined,
      type: String(form.get('type')) as keyof typeof accountTypes,
      currency: (String(form.get('currency')) as 'VES' | 'USD' | 'EUR') || undefined,
      parentId: String(form.get('parentId')) || undefined,
      bankAccountId: String(form.get('bankAccountId') || '').trim() || undefined,
      acceptsEntries: form.get('acceptsEntries') === 'true',
    }), 'Cuenta contable actualizada.');
  };

  const submitPeriod = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    void execute(() => CommunityWorkspaceService.createAccountingPeriod({
      periodKey: String(form.get('periodKey')),
      label: String(form.get('label')).trim(),
    }), 'Período contable abierto.');
  };

  const submitEntry = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!balanced) {
      setError('El asiento debe tener débitos y créditos iguales.');
      return;
    }
    const form = new FormData(event.currentTarget);
    void execute(() => CommunityWorkspaceService.createJournalEntry({
      accountingPeriodId: String(form.get('accountingPeriodId')),
      entryDate: new Date(`${String(form.get('entryDate'))}T12:00:00-04:00`).toISOString(),
      description: String(form.get('description')).trim(),
      source: 'MANUAL',
      lines: lines.map((line) => ({
        accountId: line.accountId,
        description: line.description.trim() || undefined,
        debit: Number(line.debit) || 0,
        credit: Number(line.credit) || 0,
      })),
    }), 'Asiento guardado en borrador.');
  };

  const updateLine = (id: string, patch: Partial<EntryLine>) =>
    setLines((current) => current.map((line) => line.id === id ? { ...line, ...patch } : line));

  if (loading && !snapshot) {
    return <div className="flex min-h-[320px] items-center justify-center rounded-[1.75rem] border border-[#071a33]/8 bg-white"><LoaderCircle className="animate-spin text-[#9c7532]" /></div>;
  }

  if (view === 'edit-account') {
    return (
      <div className="animate-fadeIn">
        {/* Custom Help Modal for Accounting Beginners */}
        {showHelpModal && (
          <div className="fixed inset-0 z-[110] overflow-y-auto bg-[#071a33]/70 p-4 backdrop-blur-sm flex items-center justify-center">
            <div className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full mx-auto my-8 overflow-hidden transition-all transform duration-300 scale-100">
              <header className="flex items-center justify-between border-b border-[#071a33]/8 px-6 py-5 bg-white">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-[#b08a3c]/10 text-[#9c7532] rounded-lg"><HelpCircle size={18} /></div>
                  <h3 className="font-bold text-[#071a33] text-lg">Guía Contable para No Expertos</h3>
                </div>
                <button type="button" onClick={() => setShowHelpModal(false)} className="rounded-full hover:bg-[#071a33]/5 p-2 transition">
                  <X size={18} />
                </button>
              </header>
              
              <div className="p-6 overflow-y-auto max-h-[70vh] space-y-6 text-sm leading-relaxed text-slate-600">
                <p className="text-slate-500">
                  La contabilidad es simplemente un registro ordenado de lo que la comunidad posee, debe, recibe y gasta. Aquí te explicamos los tipos de cuenta con ejemplos sencillos:
                </p>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="p-5 rounded-2xl bg-white border border-[#071a33]/8 hover:border-[#b08a3c]/40 transition">
                    <span className="inline-flex items-center text-[10px] font-bold tracking-wider uppercase bg-[#b08a3c]/10 text-[#9c7532] px-2.5 py-1 rounded mb-3">Activo</span>
                    <h4 className="font-bold text-[#071a33] text-sm">Lo que la comunidad tiene o le deben</h4>
                    <p className="text-xs text-slate-500 mt-1">Recursos económicos con valor comercial.</p>
                    <ul className="text-xs text-slate-600 mt-3 space-y-1 list-disc pl-4">
                      <li>Dinero en banco (ej: Banesco Cuenta Corriente)</li>
                      <li>Caja chica del conserje</li>
                      <li>Cuotas de condominio pendientes por cobrar</li>
                    </ul>
                  </div>

                  <div className="p-5 rounded-2xl bg-white border border-[#071a33]/8 hover:border-[#b08a3c]/40 transition">
                    <span className="inline-block text-[10px] font-bold tracking-wider uppercase bg-[#071a33]/10 text-[#071a33] px-2.5 py-1 rounded mb-3">Pasivo</span>
                    <h4 className="font-bold text-[#071a33] text-sm">Lo que la comunidad debe a terceros</h4>
                    <p className="text-xs text-slate-500 mt-1">Obligaciones pendientes de pago.</p>
                    <ul className="text-xs text-slate-600 mt-3 space-y-1 list-disc pl-4">
                      <li>Facturas por pagar a proveedores (ej: compañía de ascensores)</li>
                      <li>Prestaciones sociales acumuladas del personal</li>
                      <li>Retenciones de impuestos</li>
                    </ul>
                  </div>

                  <div className="p-5 rounded-2xl bg-white border border-[#071a33]/8 hover:border-[#b08a3c]/40 transition">
                    <span className="inline-block text-[10px] font-bold tracking-wider uppercase bg-[#b08a3c]/10 text-[#9c7532] px-2.5 py-1 rounded mb-3">Patrimonio</span>
                    <h4 className="font-bold text-[#071a33] text-sm">El fondo acumulado de la comunidad</h4>
                    <p className="text-xs text-slate-500 mt-1">Fondos acumulados y reserva de capital.</p>
                    <ul className="text-xs text-slate-600 mt-3 space-y-1 list-disc pl-4">
                      <li>Fondo de reserva para emergencias</li>
                      <li>Superávit (sobrantes) acumulados de años anteriores</li>
                    </ul>
                  </div>

                  <div className="p-5 rounded-2xl bg-white border border-[#071a33]/8 hover:border-[#b08a3c]/40 transition">
                    <span className="inline-block text-[10px] font-bold tracking-wider uppercase bg-[#071a33]/10 text-[#071a33] px-2.5 py-1 rounded mb-3">Ingreso</span>
                    <h4 className="font-bold text-[#071a33] text-sm">El dinero que entra a la comunidad</h4>
                    <p className="text-xs text-slate-500 mt-1">Recaudación y cobros recurrentes o extras.</p>
                    <ul className="text-xs text-slate-600 mt-3 space-y-1 list-disc pl-4">
                      <li>Facturación mensual del condominio (Cuota común)</li>
                      <li>Intereses ganados en cuentas bancarias</li>
                      <li>Alquiler de salones de fiesta o áreas comunes</li>
                    </ul>
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-white border border-[#071a33]/8 hover:border-[#b08a3c]/40 transition">
                  <span className="inline-block text-[10px] font-bold tracking-wider uppercase bg-[#b08a3c]/10 text-[#9c7532] px-2.5 py-1 rounded mb-3">Gasto</span>
                  <h4 className="font-bold text-[#071a33] text-sm">Costos operativos necesarios para funcionar</h4>
                  <p className="text-xs text-slate-500 mt-1">Egresos permanentes que no se recuperan pero mantienen la comunidad operativa.</p>
                  <ul className="text-xs text-slate-600 mt-3 grid gap-x-4 sm:grid-cols-2 list-disc pl-4">
                    <li>Servicio de vigilancia</li>
                    <li>Sueldo y nómina del conserje</li>
                    <li>Mantenimiento de áreas verdes y piscinas</li>
                    <li>Servicios públicos (Luz, agua común)</li>
                  </ul>
                </div>

                <div className="border-t border-[#071a33]/8 pt-5 space-y-3">
                  <h4 className="font-bold text-[#071a33] flex items-center gap-1.5">
                    Cuentas de Movimiento vs. Agrupadoras
                  </h4>
                  <p className="text-xs text-slate-600">
                    Imagínate el plan de cuentas como un archivador de oficina:
                  </p>
                  <div className="grid gap-3 sm:grid-cols-2 text-xs">
                    <div className="p-4 bg-[#071a33] rounded-xl border border-white/5 text-white">
                      <p className="font-bold text-[#d9b76d]">Cuenta Agrupadora (Padre)</p>
                      <p className="text-slate-200 mt-1 leading-relaxed">Es como la etiqueta de la carpeta. No contiene dinero directamente, solo sirve para sumar los totales de las hojas que metes dentro. <span className="block mt-1.5 text-white/60">Ejemplo: <strong className="text-[#d9b76d] font-bold">1.1.00 - Bancos nacionales</strong></span></p>
                    </div>
                    <div className="p-4 bg-[#071a33] rounded-xl border border-white/5 text-white">
                      <p className="font-bold text-[#d9b76d]">Cuenta de Movimiento (Hija)</p>
                      <p className="text-slate-200 mt-1 leading-relaxed">Es cada una de las hojas de papel reales donde escribes montos específicos. Aquí sí se registran transferencias o retiros. <span className="block mt-1.5 text-white/60">Ejemplo: <strong className="text-[#d9b76d] font-bold">1.1.01.01 - Banco Mercantil Cta. 1234</strong></span></p>
                    </div>
                  </div>
                </div>
              </div>
              
              <footer className="border-t border-[#071a33]/8 px-6 py-4 bg-white flex justify-end">
                <button type="button" onClick={() => setShowHelpModal(false)} className="rounded-xl bg-[#071a33] px-5 py-2.5 text-xs font-bold text-white hover:bg-opacity-90 transition">
                  Entendido, cerrar
                </button>
              </footer>
            </div>
          </div>
        )}

        {/* Subpage Header */}
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-5">
          <div>
            <button 
              type="button" 
              onClick={() => { setView('dashboard'); setError(''); setEditingAccount(null); }} 
              className="text-xs font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1.5 mb-2 transition"
            >
              ← Volver a la contabilidad
            </button>
            <h2 className="text-2xl font-bold tracking-tight text-[#071a33] sm:text-3xl">Editar Cuenta Contable</h2>
            <p className="text-sm text-slate-500 mt-1">Modifica la configuración de la cuenta contable en tu comunidad.</p>
          </div>
          
          <button 
            type="button" 
            onClick={() => setShowHelpModal(true)} 
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#b08a3c]/10 border border-[#b08a3c]/20 px-4 py-2.5 text-sm font-bold text-[#9c7532] hover:bg-[#b08a3c]/20 transition"
          >
            <HelpCircle size={16} />
            Guía y Ejemplos Prácticos
          </button>
        </header>

        <div className="mt-8 grid gap-8 lg:grid-cols-3">
          {/* Main Form */}
          <div className="lg:col-span-2 bg-white rounded-3xl border border-[#071a33]/8 p-6 sm:p-8 shadow-[0_14px_45px_rgba(7,26,51,.03)]">
            <form onSubmit={submitEditAccount} className="space-y-6">
              {error && <div role="alert" className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">{error}</div>}
              <div className="grid gap-6 sm:grid-cols-2">
                <Field label="Código">
                  <FieldHelp text="Ejemplo: 1.1.01. Es la nomenclatura numérica ordenada para la contabilidad." />
                  <input name="code" className={inputClass} placeholder="Ej. 1.1.01" defaultValue={editingAccount?.code} required />
                </Field>
                
                <Field label="Tipo de cuenta">
                  <FieldHelp text="Define la naturaleza del saldo. Ej. Activo para cuentas bancarias, Gasto para egresos." />
                  <select name="type" className={inputClass} defaultValue={editingAccount?.type} onChange={(e) => setEditType(e.target.value as keyof typeof accountTypes)}>
                    {Object.entries(accountTypes).map(([key, label]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </select>
                </Field>
                
                {editType === 'ASSET' && (
                  <Field label="Cuenta bancaria de Tesorería (Opcional)">
                    <FieldHelp text="Vincula esta cuenta contable de activo con la cuenta receptora en Tesorería." />
                    <select name="bankAccountId" className={inputClass} defaultValue={editingAccount?.bankAccountId || ''}>
                      <option value="">Sin cuenta bancaria vinculada</option>
                      {(treasury?.bankAccounts ?? []).map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.bankName} · {b.currency} · •••• {b.accountNumber.slice(-4)} (Cuenta {b.accountType})
                        </option>
                      ))}
                    </select>
                  </Field>
                )}
                
                <Field label="Nombre de la cuenta" span>
                  <FieldHelp text="El nombre de la cuenta. Ej: Banco Provincial, Caja Chica, Fondo de Reserva." />
                  <input name="name" className={inputClass} placeholder="Ej. Banco Mercantil Principal" defaultValue={editingAccount?.name} required />
                </Field>
                
                <Field label="Cuenta padre (Superior)">
                  <FieldHelp text="Si es una subcuenta, elígela aquí. Ej: Banco Mercantil va bajo la cuenta padre 'Bancos'." />
                  <select name="parentId" className={inputClass} defaultValue={editingAccount?.parentId || ''} onChange={(e) => setEditParentId(e.target.value)}>
                    <option value="">Sin cuenta padre (Nivel principal)</option>
                    {snapshot?.ledgerAccounts
                      .filter((item) => item.id !== editingAccount?.id)
                      .map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.code} · {item.name}
                        </option>
                      ))
                    }
                  </select>
                  {editParent && (
                    <div className="mt-2.5 flex items-center gap-2">
                      <span className="text-[11px] font-semibold text-slate-400">Tipo de cuenta:</span>
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#fbf7ee] text-[#8d672a] border border-[#d7bb7c]/50 shadow-sm">
                        <span className="h-1.5 w-1.5 rounded-full bg-[#b08a3c]"></span>
                        {editParent.acceptsEntries ? 'Cuenta de movimiento' : 'Cuenta agrupadora'}
                      </span>
                    </div>
                  )}
                </Field>
                
                <Field label="Moneda de registro">
                  <FieldHelp text="Si opera exclusivamente en una moneda. 'Funcional' usa la moneda base local." />
                  <select name="currency" className={inputClass} defaultValue={editingAccount?.currency || ''}>
                    <option value="">Moneda funcional (Predeterminada)</option>
                    <option value="VES">VES (Bolívares)</option>
                    <option value="USD">USD (Dólares)</option>
                    <option value="EUR">EUR (Euros)</option>
                  </select>
                </Field>
                
                <Field label="Descripción interna / Notas" span>
                  <FieldHelp text="Explicación detallada de para qué sirve esta cuenta." />
                  <textarea name="description" className={`${inputClass} min-h-24`} placeholder="Ej. Cuenta para recibir cuotas de condominio ordinarias." defaultValue={editingAccount?.description || ''} />
                </Field>
              </div>

              <div className="border-t border-slate-100 pt-6">
                <Field label="Función de la cuenta">
                  <FieldHelp text="Las cuentas agrupadoras (padre) no reciben asientos directos, solo consolidan el saldo de sus cuentas hijas. Las cuentas de movimiento sí reciben transacciones directamente." />
                  <select name="acceptsEntries" className={inputClass} defaultValue={String(editingAccount?.acceptsEntries)}>
                    <option value="true">Cuenta de movimiento (Acepta registros y asientos contables)</option>
                    <option value="false">Cuenta padre agrupadora (Solo agrupa subcuentas)</option>
                  </select>
                </Field>
              </div>

              <div className="flex gap-3 pt-4 justify-end">
                <button 
                  type="button" 
                  onClick={() => { setView('dashboard'); setError(''); setEditingAccount(null); }} 
                  className="rounded-xl border border-slate-200 bg-white px-5 py-3.5 text-sm font-bold hover:bg-slate-50 transition"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  disabled={saving} 
                  className="rounded-xl bg-[#071a33] px-6 py-3.5 text-sm font-bold text-white hover:bg-opacity-90 disabled:opacity-50 transition"
                >
                  {saving ? 'Guardando cambios...' : 'Guardar Cambios'}
                </button>
              </div>
            </form>
          </div>

          {/* Quick tips sidebar */}
          <div className="space-y-6">
            <div className="bg-[#fcfbf9] border border-[#d7bb7c]/25 rounded-3xl p-6 shadow-sm">
              <h3 className="font-bold text-[#8d672a] text-sm tracking-wide uppercase">Consejos Rápidos</h3>
              <ul className="mt-4 space-y-3.5 text-xs leading-relaxed text-slate-600 list-disc pl-4">
                <li>Las <b>cuentas agrupadoras</b> (como "Total Activos") no aceptan transacciones directas.</li>
                <li>Sigue la estructura jerárquica de tu plan. Ejemplo: <b>1.0.0 (Activo)</b> → <b>1.1.00 (Efectivo y Equivalentes)</b> → <b>1.1.01 (Bancos)</b>.</li>
                <li>Si configuras cuentas en dólares, especifica la moneda <b>USD</b> para facilitar las conciliaciones de divisas.</li>
              </ul>
            </div>
            
            <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6">
              <h3 className="font-bold text-slate-800 text-sm">¿Cómo estructurar?</h3>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                Elige la cuenta padre correcta para que los reportes de balance general se generen balanceados y agrupados de forma automática.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (view === 'create-account') {
    return (
      <div className="animate-fadeIn">
        {/* Custom Help Modal for Accounting Beginners */}
        {showHelpModal && (
          <div className="fixed inset-0 z-[110] overflow-y-auto bg-[#071a33]/70 p-4 backdrop-blur-sm flex items-center justify-center">
            <div className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full mx-auto my-8 overflow-hidden transition-all transform duration-300 scale-100">
              <header className="flex items-center justify-between border-b border-[#071a33]/8 px-6 py-5 bg-white">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-[#b08a3c]/10 text-[#9c7532] rounded-lg"><HelpCircle size={18} /></div>
                  <h3 className="font-bold text-[#071a33] text-lg">Guía Contable para No Expertos</h3>
                </div>
                <button type="button" onClick={() => setShowHelpModal(false)} className="rounded-full hover:bg-[#071a33]/5 p-2 transition">
                  <X size={18} />
                </button>
              </header>
              
              <div className="p-6 overflow-y-auto max-h-[70vh] space-y-6 text-sm leading-relaxed text-slate-600">
                <p className="text-slate-500">
                  La contabilidad es simplemente un registro ordenado de lo que la comunidad posee, debe, recibe y gasta. Aquí te explicamos los tipos de cuenta con ejemplos sencillos:
                </p>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="p-5 rounded-2xl bg-white border border-[#071a33]/8 hover:border-[#b08a3c]/40 transition">
                    <span className="inline-flex items-center text-[10px] font-bold tracking-wider uppercase bg-[#b08a3c]/10 text-[#9c7532] px-2.5 py-1 rounded mb-3">Activo</span>
                    <h4 className="font-bold text-[#071a33] text-sm">Lo que la comunidad tiene o le deben</h4>
                    <p className="text-xs text-slate-500 mt-1">Recursos económicos con valor comercial.</p>
                    <ul className="text-xs text-slate-600 mt-3 space-y-1 list-disc pl-4">
                      <li>Dinero en banco (ej: Banesco Cuenta Corriente)</li>
                      <li>Caja chica del conserje</li>
                      <li>Cuotas de condominio pendientes por cobrar</li>
                    </ul>
                  </div>

                  <div className="p-5 rounded-2xl bg-white border border-[#071a33]/8 hover:border-[#b08a3c]/40 transition">
                    <span className="inline-block text-[10px] font-bold tracking-wider uppercase bg-[#071a33]/10 text-[#071a33] px-2.5 py-1 rounded mb-3">Pasivo</span>
                    <h4 className="font-bold text-[#071a33] text-sm">Lo que la comunidad debe a terceros</h4>
                    <p className="text-xs text-slate-500 mt-1">Obligaciones pendientes de pago.</p>
                    <ul className="text-xs text-slate-600 mt-3 space-y-1 list-disc pl-4">
                      <li>Facturas por pagar a proveedores (ej: compañía de ascensores)</li>
                      <li>Prestaciones sociales acumuladas del personal</li>
                      <li>Retenciones de impuestos</li>
                    </ul>
                  </div>

                  <div className="p-5 rounded-2xl bg-white border border-[#071a33]/8 hover:border-[#b08a3c]/40 transition">
                    <span className="inline-block text-[10px] font-bold tracking-wider uppercase bg-[#b08a3c]/10 text-[#9c7532] px-2.5 py-1 rounded mb-3">Patrimonio</span>
                    <h4 className="font-bold text-[#071a33] text-sm">El fondo acumulado de la comunidad</h4>
                    <p className="text-xs text-slate-500 mt-1">Fondos acumulados y reserva de capital.</p>
                    <ul className="text-xs text-slate-600 mt-3 space-y-1 list-disc pl-4">
                      <li>Fondo de reserva para emergencias</li>
                      <li>Superávit (sobrantes) acumulados de años anteriores</li>
                    </ul>
                  </div>

                  <div className="p-5 rounded-2xl bg-white border border-[#071a33]/8 hover:border-[#b08a3c]/40 transition">
                    <span className="inline-block text-[10px] font-bold tracking-wider uppercase bg-[#071a33]/10 text-[#071a33] px-2.5 py-1 rounded mb-3">Ingreso</span>
                    <h4 className="font-bold text-[#071a33] text-sm">El dinero que entra a la comunidad</h4>
                    <p className="text-xs text-slate-500 mt-1">Recaudación y cobros recurrentes o extras.</p>
                    <ul className="text-xs text-slate-600 mt-3 space-y-1 list-disc pl-4">
                      <li>Facturación mensual del condominio (Cuota común)</li>
                      <li>Intereses ganados en cuentas bancarias</li>
                      <li>Alquiler de salones de fiesta o áreas comunes</li>
                    </ul>
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-white border border-[#071a33]/8 hover:border-[#b08a3c]/40 transition">
                  <span className="inline-block text-[10px] font-bold tracking-wider uppercase bg-[#b08a3c]/10 text-[#9c7532] px-2.5 py-1 rounded mb-3">Gasto</span>
                  <h4 className="font-bold text-[#071a33] text-sm">Costos operativos necesarios para funcionar</h4>
                  <p className="text-xs text-slate-500 mt-1">Egresos permanentes que no se recuperan pero mantienen la comunidad operativa.</p>
                  <ul className="text-xs text-slate-600 mt-3 grid gap-x-4 sm:grid-cols-2 list-disc pl-4">
                    <li>Servicio de vigilancia</li>
                    <li>Sueldo y nómina del conserje</li>
                    <li>Mantenimiento de áreas verdes y piscinas</li>
                    <li>Servicios públicos (Luz, agua común)</li>
                  </ul>
                </div>

                <div className="border-t border-[#071a33]/8 pt-5 space-y-3">
                  <h4 className="font-bold text-[#071a33] flex items-center gap-1.5">
                    Cuentas de Movimiento vs. Agrupadoras
                  </h4>
                  <p className="text-xs text-slate-600">
                    Imagínate el plan de cuentas como un archivador de oficina:
                  </p>
                  <div className="grid gap-3 sm:grid-cols-2 text-xs">
                    <div className="p-4 bg-[#071a33] rounded-xl border border-white/5 text-white">
                      <p className="font-bold text-[#d9b76d]">Cuenta Agrupadora (Padre)</p>
                      <p className="text-slate-200 mt-1 leading-relaxed">Es como la etiqueta de la carpeta. No contiene dinero directamente, solo sirve para sumar los totales de las hojas que metes dentro. <span className="block mt-1.5 text-white/60">Ejemplo: <strong className="text-[#d9b76d] font-bold">1.1.00 - Bancos nacionales</strong></span></p>
                    </div>
                    <div className="p-4 bg-[#071a33] rounded-xl border border-white/5 text-white">
                      <p className="font-bold text-[#d9b76d]">Cuenta de Movimiento (Hija)</p>
                      <p className="text-slate-200 mt-1 leading-relaxed">Es cada una de las hojas de papel reales donde escribes montos específicos. Aquí sí se registran transferencias o retiros. <span className="block mt-1.5 text-white/60">Ejemplo: <strong className="text-[#d9b76d] font-bold">1.1.01.01 - Banco Mercantil Cta. 1234</strong></span></p>
                    </div>
                  </div>
                </div>
              </div>
              
              <footer className="border-t border-[#071a33]/8 px-6 py-4 bg-white flex justify-end">
                <button type="button" onClick={() => setShowHelpModal(false)} className="rounded-xl bg-[#071a33] px-5 py-2.5 text-xs font-bold text-white hover:bg-opacity-90 transition">
                  Entendido, cerrar
                </button>
              </footer>
            </div>
          </div>
        )}

        {/* Subpage Header */}
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-5">
          <div>
            <button 
              type="button" 
              onClick={() => { setView('dashboard'); setError(''); }} 
              className="text-xs font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1.5 mb-2 transition"
            >
              ← Volver a la contabilidad
            </button>
            <h2 className="text-2xl font-bold tracking-tight text-[#071a33] sm:text-3xl">Crear Cuenta Contable</h2>
            <p className="text-sm text-slate-500 mt-1">Configura una cuenta contable en el catálogo único de tu comunidad.</p>
          </div>
          
          <button 
            type="button" 
            onClick={() => setShowHelpModal(true)} 
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#b08a3c]/10 border border-[#b08a3c]/20 px-4 py-2.5 text-sm font-bold text-[#9c7532] hover:bg-[#b08a3c]/20 transition"
          >
            <HelpCircle size={16} />
            Guía y Ejemplos Prácticos
          </button>
        </header>

        <div className="mt-8 grid gap-8 lg:grid-cols-3">
          {/* Main Form */}
          <div className="lg:col-span-2 bg-white rounded-3xl border border-[#071a33]/8 p-6 sm:p-8 shadow-[0_14px_45px_rgba(7,26,51,.03)]">
            <form onSubmit={submitAccount} className="space-y-6">
              {error && <div role="alert" className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">{error}</div>}
              <div className="grid gap-6 sm:grid-cols-2">
                <Field label="Código">
                  <FieldHelp text="Ejemplo: 1.1.01. Es la nomenclatura numérica ordenada para la contabilidad." />
                  <input name="code" className={inputClass} placeholder="Ej. 1.1.01" required />
                </Field>
                
                <Field label="Tipo de cuenta">
                  <FieldHelp text="Define la naturaleza del saldo. Ej. Activo para cuentas bancarias, Gasto para egresos." />
                  <select name="type" className={inputClass} defaultValue="ASSET" onChange={(e) => setCreateType(e.target.value as keyof typeof accountTypes)}>
                    {Object.entries(accountTypes).map(([key, label]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </select>
                </Field>
                
                {createType === 'ASSET' && (
                  <Field label="Cuenta bancaria de Tesorería (Opcional)">
                    <FieldHelp text="Vincula esta cuenta contable de activo con la cuenta receptora en Tesorería." />
                    <select name="bankAccountId" className={inputClass} defaultValue="">
                      <option value="">Sin cuenta bancaria vinculada</option>
                      {(treasury?.bankAccounts ?? []).map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.bankName} · {b.currency} · •••• {b.accountNumber.slice(-4)} (Cuenta {b.accountType})
                        </option>
                      ))}
                    </select>
                  </Field>
                )}
                
                <Field label="Nombre de la cuenta" span>
                  <FieldHelp text="El nombre de la cuenta. Ej: Banco Provincial, Caja Chica, Fondo de Reserva." />
                  <input name="name" className={inputClass} placeholder="Ej. Banco Mercantil Principal" required />
                </Field>
                
                <Field label="Cuenta padre (Superior)">
                  <FieldHelp text="Si es una subcuenta, elígela aquí. Ej: Banco Mercantil va bajo la cuenta padre 'Bancos'." />
                  <select name="parentId" className={inputClass} onChange={(e) => setCreateParentId(e.target.value)}>
                    <option value="">Sin cuenta padre (Nivel principal)</option>
                    {snapshot?.ledgerAccounts.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.code} · {item.name}
                      </option>
                    ))}
                  </select>
                  {createParent && (
                    <div className="mt-2.5 flex items-center gap-2">
                      <span className="text-[11px] font-semibold text-slate-400">Tipo de cuenta:</span>
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#fbf7ee] text-[#8d672a] border border-[#d7bb7c]/50 shadow-sm">
                        <span className="h-1.5 w-1.5 rounded-full bg-[#b08a3c]"></span>
                        {createParent.acceptsEntries ? 'Cuenta de movimiento' : 'Cuenta agrupadora'}
                      </span>
                    </div>
                  )}
                </Field>
                
                <Field label="Moneda de registro">
                  <FieldHelp text="Si opera exclusivamente en una moneda. 'Funcional' usa la moneda base local." />
                  <select name="currency" className={inputClass}>
                    <option value="">Moneda funcional (Predeterminada)</option>
                    <option value="VES">VES (Bolívares)</option>
                    <option value="USD">USD (Dólares)</option>
                    <option value="EUR">EUR (Euros)</option>
                  </select>
                </Field>
                
                <Field label="Descripción interna / Notas" span>
                  <FieldHelp text="Explicación detallada de para qué sirve esta cuenta." />
                  <textarea name="description" className={`${inputClass} min-h-24`} placeholder="Ej. Cuenta para recibir cuotas de condominio ordinarias." />
                </Field>
              </div>

              <div className="border-t border-slate-100 pt-6">
                <Field label="Función de la cuenta">
                  <FieldHelp text="Las cuentas agrupadoras (padre) no reciben asientos directos, solo consolidan el saldo de sus cuentas hijas. Las cuentas de movimiento sí reciben transacciones directamente." />
                  <select name="acceptsEntries" className={inputClass}>
                    <option value="true">Cuenta de movimiento (Acepta registros y asientos contables)</option>
                    <option value="false">Cuenta padre agrupadora (Solo agrupa subcuentas)</option>
                  </select>
                </Field>
              </div>

              <div className="flex gap-3 pt-4 justify-end">
                <button 
                  type="button" 
                  onClick={() => { setView('dashboard'); setError(''); }} 
                  className="rounded-xl border border-slate-200 bg-white px-5 py-3.5 text-sm font-bold hover:bg-slate-50 transition"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  disabled={saving} 
                  className="rounded-xl bg-[#071a33] px-6 py-3.5 text-sm font-bold text-white hover:bg-opacity-90 disabled:opacity-50 transition"
                >
                  {saving ? 'Creando cuenta...' : 'Crear Cuenta Contable'}
                </button>
              </div>
            </form>
          </div>

          {/* Quick tips sidebar */}
          <div className="space-y-6">
            <div className="bg-[#fcfbf9] border border-[#d7bb7c]/25 rounded-3xl p-6 shadow-sm">
              <h3 className="font-bold text-[#8d672a] text-sm tracking-wide uppercase">Consejos Rápidos</h3>
              <ul className="mt-4 space-y-3.5 text-xs leading-relaxed text-slate-600 list-disc pl-4">
                <li>Las <b>cuentas agrupadoras</b> (como "Total Activos") no aceptan transacciones directas. Desactiva la casilla correspondiente para estas.</li>
                <li>Sigue la estructura jerárquica de tu plan. Ejemplo: <b>1.0.0 (Activo)</b> → <b>1.1.00 (Efectivo y Equivalentes)</b> → <b>1.1.01 (Bancos)</b>.</li>
                <li>Si configuras cuentas en dólares, especifica la moneda <b>USD</b> para facilitar las conciliaciones de divisas.</li>
              </ul>
            </div>
            
            <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6">
              <h3 className="font-bold text-slate-800 text-sm">¿Cómo estructurar?</h3>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                Elige la cuenta padre correcta para que los reportes de balance general se generen balanceados y agrupados de forma automática.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <div>
    <header className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
      <div className="max-w-3xl">
        <p className="text-xs font-bold uppercase tracking-[.22em] text-[#9c7532]">Núcleo financiero · Doble partida</p>
        <h2 className="mt-3 text-3xl font-semibold tracking-[-.035em] sm:text-4xl">Contabilidad de la comunidad</h2>
        <p className="mt-4 leading-7 text-slate-500">Plan de cuentas, períodos y asientos balanceados. Los anticipos, fondos y cobros se conectarán a este libro; no serán saldos aislados.</p>
      </div>
      {canWrite && <div className="grid shrink-0 gap-2 sm:grid-cols-3 xl:grid-cols-1">
        <Action label="Nueva cuenta" onClick={() => { setView('create-account'); setError(''); setCreateParentId(''); }} />
        <Action label="Abrir período" onClick={() => setDialog('period')} />
        <Action label="Preparar asiento" disabled={!openPeriods.length || postingAccounts.length < 2} onClick={() => { setLines([blankLine(), blankLine()]); setDialog('entry'); }} />
      </div>}
    </header>

    {error && <div role="alert" className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">{error}</div>}
    {notice && <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">{notice}</div>}

    <section className="mt-8 grid gap-4 sm:grid-cols-3">
      <Metric label="Cuentas activas" value={snapshot?.ledgerAccounts.filter((item) => item.status === 'ACTIVE').length ?? 0} />
      <Metric label="Períodos abiertos" value={openPeriods.length} />
      <Metric label="Asientos contabilizados" value={snapshot?.journalEntries.filter((item) => item.status === 'POSTED').length ?? 0} />
    </section>

    <Panel eyebrow="Apertura y cierre" title="Períodos contables">
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {snapshot?.accountingPeriods.map((period) => <article key={period.id} className="rounded-2xl border border-slate-200 p-4">
          <div className="flex items-start justify-between gap-3"><div><p className="font-bold">{period.label}</p><p className="mt-1 text-xs text-slate-400">{period.periodKey}</p></div><Status value={period.status} /></div>
          {period.closedAt && <p className="mt-3 text-xs text-slate-500">Cerrado: {formatDateTime(period.closedAt)}</p>}
          {period.status === 'OPEN' && canPost && <button type="button" onClick={() => { setTargetId(period.id); setDialog('close'); }} className="mt-4 rounded-xl border border-rose-200 px-3 py-2 text-xs font-bold text-rose-700">Cerrar período</button>}
        </article>)}
        {!snapshot?.accountingPeriods.length && <Empty text="Aún no existen períodos contables." />}
      </div>
    </Panel>

    <Panel eyebrow="Estructura contable" title="Plan de cuentas">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            <tr>
              <th className="pb-3">Código</th>
              <th className="pb-3">Cuenta</th>
              <th className="pb-3">Tipo</th>
              <th className="pb-3">Moneda</th>
              <th className="pb-3">Naturaleza</th>
              <th className="pb-3">Uso</th>
              {canWrite && <th className="pb-3 text-right">Acciones</th>}
            </tr>
          </thead>
          <tbody>
            {snapshot?.ledgerAccounts.map((account) => (
              <tr key={account.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                <td className="py-3 font-mono text-xs font-bold">{account.code}</td>
                <td className="py-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-slate-800">{account.name}</p>
                    {account.bankAccount && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-[#071a33]/5 text-[#8d672a] text-[11px] font-bold border border-[#d7bb7c]/50">
                        {account.bankAccount.bankName} (•••• {account.bankAccount.accountNumber.slice(-4)})
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-slate-400">{account.description || 'Sin descripción'}</p>
                </td>
                <td className="py-3 text-slate-600">{accountTypes[account.type]}</td>
                <td className="py-3 text-slate-600">{account.currency || 'Funcional'}</td>
                <td className="py-3 text-slate-600">{account.normalBalance === 'DEBIT' ? 'Deudora' : 'Acreedora'}</td>
                <td className="py-3">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${account.acceptsEntries ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-blue-50 text-blue-700 border border-blue-100'}`}>
                    {account.acceptsEntries ? 'Movimientos' : 'Agrupadora'}
                  </span>
                </td>
                {canWrite && (
                  <td className="py-3 text-right">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingAccount(account);
                        setView('edit-account');
                        setError('');
                      }}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-50 transition"
                    >
                      <Pencil size={12} />
                      Editar
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
        {!snapshot?.ledgerAccounts.length && <Empty text="Crea el plan de cuentas antes de preparar asientos." />}
      </div>
    </Panel>

    <Panel eyebrow="Asientos y trazabilidad" title="Libro diario">
      <div className="space-y-3">
        {snapshot?.journalEntries.map((entry) => <article key={entry.id} className="rounded-2xl border border-slate-200 p-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <div><div className="flex flex-wrap items-center gap-2"><p className="font-bold">{entry.entryNumber ? `Asiento N.º ${entry.entryNumber}` : 'Asiento sin numerar'}</p><Status value={entry.status} /></div><p className="mt-2 text-sm">{entry.description}</p><p className="mt-1 text-xs text-slate-400">{formatDateTime(entry.entryDate)} · {entry.source}</p></div>
            <div className="flex gap-2">
              {entry.status === 'DRAFT' && canPost && <button type="button" onClick={() => { setTargetId(entry.id); setDialog('post'); }} className="rounded-xl bg-[#071a33] px-3 py-2 text-xs font-bold text-white">Contabilizar</button>}
              {entry.status === 'POSTED' && canPost && <button type="button" onClick={() => { setTargetId(entry.id); setDialog('reverse'); }} className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 px-3 py-2 text-xs font-bold text-rose-700"><RotateCcw size={13} /> Reversar</button>}
            </div>
          </div>
          <div className="mt-4 grid gap-2 lg:grid-cols-2">{entry.lines.map((line) => <div key={line.id} className="grid grid-cols-[1fr_auto_auto] gap-3 rounded-xl bg-[#f8f6f1] px-3 py-2 text-xs"><span>{line.account.code} · {line.account.name}</span><span>D {money.format(Number(line.debit))}</span><span>C {money.format(Number(line.credit))}</span></div>)}</div>
        </article>)}
        {!snapshot?.journalEntries.length && <Empty text="Aún no existen asientos contables." />}
      </div>
    </Panel>

    {/* Cuenta contable dialog has been migrated to a dedicated view */}

    {dialog === 'period' && <DialogFrame title="Abrir período contable" onClose={() => setDialog(null)}><form onSubmit={submitPeriod}><Field label="Mes"><input name="periodKey" type="month" className={inputClass} required /></Field><Field label="Nombre visible"><input name="label" className={inputClass} required placeholder="Ej.: Julio 2026" /></Field><Submit saving={saving} label="Abrir período" /></form></DialogFrame>}

    {dialog === 'entry' && <DialogFrame title="Preparar asiento de doble partida" wide onClose={() => setDialog(null)}><form onSubmit={submitEntry}><div className="grid gap-4 sm:grid-cols-2"><Field label="Período"><select name="accountingPeriodId" className={inputClass} required>{openPeriods.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</select></Field><Field label="Fecha"><input name="entryDate" type="date" className={inputClass} required /></Field><Field label="Descripción" span><input name="description" className={inputClass} required /></Field></div>
      <div className="mt-6 space-y-3">{lines.map((line, index) => <div key={line.id} className="grid gap-3 rounded-2xl border border-slate-200 p-4 md:grid-cols-[1.5fr_1fr_.7fr_.7fr_auto] md:items-end"><Field label={`Cuenta ${index + 1}`}><select value={line.accountId} onChange={(event) => updateLine(line.id, { accountId: event.target.value })} className={inputClass} required><option value="">Seleccionar</option>{postingAccounts.map((item) => <option key={item.id} value={item.id}>{item.code} · {item.name}</option>)}</select></Field><Field label="Detalle"><input value={line.description} onChange={(event) => updateLine(line.id, { description: event.target.value })} className={inputClass} /></Field><Field label="Débito"><input value={line.debit} onChange={(event) => updateLine(line.id, { debit: event.target.value, credit: event.target.value ? '' : line.credit })} type="number" min="0" step="0.01" className={inputClass} /></Field><Field label="Crédito"><input value={line.credit} onChange={(event) => updateLine(line.id, { credit: event.target.value, debit: event.target.value ? '' : line.debit })} type="number" min="0" step="0.01" className={inputClass} /></Field><button type="button" disabled={lines.length <= 2} onClick={() => setLines((current) => current.filter((item) => item.id !== line.id))} className="rounded-xl border border-rose-200 p-3 text-rose-700 disabled:opacity-30"><X size={16} /></button></div>)}</div>
      <button type="button" onClick={() => setLines((current) => [...current, blankLine()])} className="mt-3 inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold"><Plus size={15} />Agregar línea</button>
      <div className={`mt-5 grid gap-2 rounded-2xl p-4 sm:grid-cols-3 ${balanced ? 'bg-emerald-50 text-emerald-800' : 'bg-amber-50 text-amber-900'}`}><p>Débitos: <b>{money.format(totals.debit)}</b></p><p>Créditos: <b>{money.format(totals.credit)}</b></p><p>{balanced ? 'Asiento balanceado' : `Diferencia: ${money.format(Math.abs(totals.debit - totals.credit))}`}</p></div><Submit saving={saving || !balanced} label="Guardar borrador" /></form></DialogFrame>}

    {dialog === 'post' && <Confirm title="Contabilizar asiento" copy="Se asignará un número definitivo. Después solo podrá corregirse mediante un asiento de reverso." label="Contabilizar definitivamente" saving={saving} onClose={() => setDialog(null)} onConfirm={() => void execute(() => CommunityWorkspaceService.postJournalEntry(targetId), 'Asiento contabilizado.')} />}
    {dialog === 'close' && <Confirm title="Cerrar período" copy="CASA impedirá el cierre si existen borradores. Un período cerrado no admite nuevos movimientos." label="Cerrar período" saving={saving} danger onClose={() => setDialog(null)} onConfirm={() => void execute(() => CommunityWorkspaceService.closeAccountingPeriod(targetId), 'Período contable cerrado.')} />}
    {dialog === 'reverse' && <DialogFrame title="Reversar asiento" onClose={() => setDialog(null)}><form onSubmit={(event) => { event.preventDefault(); const form = new FormData(event.currentTarget); void execute(() => CommunityWorkspaceService.reverseJournalEntry(targetId, { accountingPeriodId: String(form.get('accountingPeriodId')), entryDate: new Date(`${String(form.get('entryDate'))}T12:00:00-04:00`).toISOString(), reason: String(form.get('reason')).trim() }), 'Asiento reversado mediante un movimiento compensatorio.'); }}><p className="rounded-2xl bg-amber-50 p-4 text-sm leading-6 text-amber-900">El asiento original no se elimina. CASA creará otro con débitos y créditos invertidos.</p><Field label="Período"><select name="accountingPeriodId" className={inputClass} required>{openPeriods.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</select></Field><Field label="Fecha"><input name="entryDate" type="date" className={inputClass} required /></Field><Field label="Justificación"><textarea name="reason" className={`${inputClass} min-h-24`} required /></Field><Submit saving={saving} label="Generar reverso" /></form></DialogFrame>}
  </div>;
}

function Action({ label, onClick, disabled = false }: { label: string; onClick: () => void; disabled?: boolean }) { return <button type="button" disabled={disabled} onClick={onClick} className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#071a33]/12 bg-white px-4 py-3 text-sm font-bold shadow-sm disabled:cursor-not-allowed disabled:opacity-40"><Plus size={15} />{label}</button>; }
function Metric({ label, value }: { label: string; value: number }) { return <article className="rounded-[1.4rem] border border-[#071a33]/8 bg-white p-5"><BookOpenCheck className="text-[#9c7532]" size={20} /><p className="mt-4 text-xs font-semibold text-slate-500">{label}</p><p className="mt-1 text-2xl font-bold">{value}</p></article>; }
function Panel({ eyebrow, title, children }: { eyebrow: string; title: string; children: ReactNode }) { return <section className="mt-6 rounded-[1.6rem] border border-[#071a33]/8 bg-white p-5 sm:p-6"><p className="text-xs font-bold uppercase tracking-[.16em] text-[#9c7532]">{eyebrow}</p><h3 className="mb-5 mt-2 text-xl font-semibold">{title}</h3>{children}</section>; }
function Status({ value }: { value: keyof typeof statusLabels }) { const tone = value === 'OPEN' || value === 'POSTED' ? 'bg-emerald-50 text-emerald-700' : value === 'DRAFT' ? 'bg-amber-50 text-amber-700' : 'bg-slate-100 text-slate-600'; return <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${tone}`}>{statusLabels[value]}</span>; }
function Empty({ text }: { text: string }) { return <p className="rounded-2xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">{text}</p>; }
function Field({ label, children, span = false }: { label: string; children: ReactNode; span?: boolean }) { return <label className={`block text-sm font-bold ${span ? 'sm:col-span-2' : ''}`}>{label}{children}</label>; }
function DialogFrame({ title, children, onClose, wide = false }: { title: string; children: ReactNode; onClose: () => void; wide?: boolean }) { return <div className="fixed inset-0 z-[100] overflow-y-auto bg-[#071a33]/65 p-4 backdrop-blur-sm"><div className={`mx-auto mt-6 rounded-[1.6rem] bg-[#f8f6f0] shadow-2xl ${wide ? 'max-w-6xl' : 'max-w-xl'}`}><header className="sticky top-0 z-10 flex items-center justify-between border-b border-[#071a33]/8 bg-[#f8f6f0] px-5 py-4"><h3 className="font-semibold">{title}</h3><button type="button" onClick={onClose} aria-label="Cerrar" className="rounded-full bg-white p-2"><X size={17} /></button></header><div className="p-5 sm:p-6">{children}</div></div></div>; }
function Submit({ saving, label }: { saving: boolean; label: string }) { return <button disabled={saving} className="mt-6 w-full rounded-xl bg-[#071a33] px-5 py-3.5 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-50">{saving ? 'Procesando…' : label}</button>; }
function Confirm({ title, copy, label, saving, danger = false, onClose, onConfirm }: { title: string; copy: string; label: string; saving: boolean; danger?: boolean; onClose: () => void; onConfirm: () => void }) { return <DialogFrame title={title} onClose={onClose}><p className="text-sm leading-7 text-slate-600">{copy}</p><div className="mt-6 grid gap-2 sm:grid-cols-2"><button type="button" disabled={saving} onClick={onClose} className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold">Cancelar</button><button type="button" disabled={saving} onClick={onConfirm} className={`rounded-xl px-4 py-3 text-sm font-bold text-white disabled:opacity-50 ${danger ? 'bg-rose-700' : 'bg-[#071a33]'}`}>{saving ? 'Procesando…' : label}</button></div></DialogFrame>; }

function FieldHelp({ text }: { text: string }) {
  return (
    <div className="group relative ml-1.5 inline-block align-middle">
      <span className="flex h-4 w-4 cursor-help items-center justify-center rounded-full bg-slate-200 text-[10px] font-bold text-slate-500 hover:bg-[#b08a3c] hover:text-white transition">
        ?
      </span>
      <div className="absolute bottom-full left-1/2 z-50 mb-2 w-60 -translate-x-1/2 scale-95 rounded-lg bg-slate-900 px-3 py-2 text-xs font-normal leading-relaxed text-white opacity-0 transition-all duration-200 group-hover:scale-100 group-hover:opacity-100 pointer-events-none shadow-lg">
        {text}
        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900"></div>
      </div>
    </div>
  );
}
