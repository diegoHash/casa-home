import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { BellPlus, Check, Clock3, Plus, X } from 'lucide-react';
import { CommunityWorkspaceService, type AccountingSnapshot, type PayableRecord, type VendorRecord } from '../../services/CommunityWorkspaceService';

const categories: Array<[PayableRecord['category'], string]> = [
  ['SECURITY', 'Vigilancia privada'],
  ['ELEVATOR_MAINTENANCE', 'Mantenimiento de ascensores'],
  ['WASTE_COLLECTION', 'Recolección de basura'],
  ['GARDENING', 'Jardinería'],
  ['UTILITIES', 'Servicios públicos'],
  ['PAYROLL', 'Nómina y personal'],
  ['PROFESSIONAL_FEES', 'Honorarios profesionales'],
  ['REPAIRS_MATERIALS', 'Reparaciones y materiales'],
  ['TAXES', 'Impuestos y tasas'],
  ['SOCIAL_SECURITY', 'Seguridad social y retenciones'],
  ['INSURANCE', 'Seguros'],
  ['RENT', 'Alquileres y arrendamientos'],
  ['TELECOMMUNICATIONS', 'Telefonía e internet'],
  ['LEGAL_SERVICES', 'Servicios legales'],
  ['ACCOUNTING_SERVICES', 'Servicios contables'],
  ['SUPPLIES', 'Suministros y compras'],
  ['TRANSPORT', 'Transporte y logística'],
  ['OTHER', 'Otros'],
];
const categoryLabel = (item: Pick<PayableRecord, 'category' | 'categoryLabel'>) => item.categoryLabel || categories.find(([key]) => key === item.category)?.[1] || item.category;
const money = new Intl.NumberFormat('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const inputClass = 'mt-1.5 w-full rounded-xl border border-[#071a33]/12 bg-white px-3.5 py-3 text-sm outline-none focus:border-[#b08a3c] focus:ring-2 focus:ring-[#b08a3c]/15';
const today = () => new Date().toISOString().slice(0, 10);
const localDateTime = (date: Date) => {
  const pad = (value: number) => String(value).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

export function PayablesWorkspacePanel({ canWrite }: { canWrite: boolean }) {
  const [items, setItems] = useState<PayableRecord[]>([]);
  const [vendors, setVendors] = useState<VendorRecord[]>([]);
  const [accounts, setAccounts] = useState<AccountingSnapshot['ledgerAccounts']>([]);
  const [showForm, setShowForm] = useState(false);
  const [paying, setPaying] = useState<PayableRecord | null>(null);
  const [reminding, setReminding] = useState<PayableRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const [payables, vendorRows, accounting] = await Promise.all([
        CommunityWorkspaceService.payables(),
        CommunityWorkspaceService.vendors(),
        CommunityWorkspaceService.accountingSnapshot(),
      ]);
      setItems(payables);
      setVendors(vendorRows);
      setAccounts(accounting.ledgerAccounts);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No fue posible cargar las cuentas por pagar.');
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { void load(); }, []);

  const pending = useMemo(() => items.filter((item) => item.status === 'PENDING' || item.status === 'PARTIALLY_PAID'), [items]);
  const totalPending = pending.reduce((sum, item) => sum + Math.max(0, Number(item.amount) - Number(item.amountPaid)), 0);
  const overdue = pending.filter((item) => item.dueDate.slice(0, 10) < today()).length;
  const expenseAccounts = accounts.filter((account) => account.type === 'EXPENSE' && account.acceptsEntries);
  const liabilityAccounts = accounts.filter((account) => account.type === 'LIABILITY' && account.acceptsEntries);
  const paymentAccounts = accounts.filter((account) => account.type === 'ASSET' && account.acceptsEntries);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setError(''); setNotice('');
    try {
      await CommunityWorkspaceService.createPayable({
        category: String(form.get('category')) as PayableRecord['category'],
        categoryLabel: String(form.get('categoryLabel') || '').trim() || undefined,
        supplierName: String(form.get('supplierName')).trim(),
        supplierDocument: String(form.get('supplierDocument') || '').trim() || undefined,
        vendorId: String(form.get('vendorId') || '').trim() || undefined,
        description: String(form.get('description')).trim(),
        invoiceNumber: String(form.get('invoiceNumber') || '').trim() || undefined,
        issueDate: String(form.get('issueDate')),
        dueDate: String(form.get('dueDate')),
        amount: Number(form.get('amount')),
        currency: String(form.get('currency')) as PayableRecord['currency'],
        notes: String(form.get('notes') || '').trim() || undefined,
        expenseAccountId: String(form.get('expenseAccountId') || '').trim() || undefined,
        liabilityAccountId: String(form.get('liabilityAccountId') || '').trim() || undefined,
      });
      setShowForm(false); setNotice('Cuenta por pagar registrada.'); await load();
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'No fue posible registrar la obligación.'); }
  };

  const submitPayment = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!paying) return;
    const form = new FormData(event.currentTarget);
    setError(''); setNotice('');
    try {
      await CommunityWorkspaceService.payPayable(paying.id, {
        amount: Number(form.get('amount')),
        paidAt: String(form.get('paidAt')),
        paymentAccountId: String(form.get('paymentAccountId') || '').trim() || undefined,
        paymentReference: String(form.get('paymentReference') || '').trim() || undefined,
      });
      setPaying(null); setNotice('Pago aplicado a la cuenta por pagar.'); await load();
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'No fue posible aplicar el pago.'); }
  };

  const submitReminder = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!reminding) return;
    const form = new FormData(event.currentTarget);
    setError(''); setNotice('');
    try {
      const remindAt = new Date(String(form.get('remindAt')));
      await CommunityWorkspaceService.createPayableReminder(reminding.id, {
        remindAt: remindAt.toISOString(),
        message: String(form.get('message') || '').trim() || undefined,
      });
      setReminding(null); setNotice('Recordatorio configurado.'); await load();
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'No fue posible configurar el recordatorio.'); }
  };

  return <div className="space-y-6">
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div><p className="text-xs font-bold uppercase tracking-[.2em] text-[#9c7532]">Obligaciones de la comunidad</p><h2 className="mt-2 text-3xl font-semibold">Cuentas por pagar</h2><p className="mt-3 max-w-3xl text-sm leading-6 text-slate-500">Registra facturas y compromisos de vigilancia, ascensores, servicios, nómina, honorarios y reparaciones. Cada comunidad consulta y administra únicamente sus propias obligaciones.</p></div>
      {canWrite && <button type="button" onClick={() => setShowForm(true)} className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-[#071a33] px-5 py-3 text-sm font-bold text-white"><Plus size={16} /> Registrar obligación</button>}
    </div>
    {error && <div role="alert" className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">{error}</div>}
    {notice && <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">{notice}</div>}
    <div className="grid gap-3 sm:grid-cols-3"><Metric label="Saldo pendiente" value={`USD ${money.format(totalPending)}`} /><Metric label="Obligaciones abiertas" value={String(pending.length)} /><Metric label="Vencidas" value={String(overdue)} /></div>
    <section className="overflow-hidden rounded-[1.5rem] border border-[#071a33]/8 bg-white">
      <div className="overflow-x-auto"><table className="w-full min-w-[980px] text-left text-sm"><thead className="bg-[#071a33] text-xs uppercase tracking-wide text-white"><tr>{['Categoría', 'Proveedor', 'Detalle', 'Vencimiento', 'Monto', 'Pendiente', 'Estado', 'Acciones'].map((heading) => <th key={heading} className="px-4 py-4">{heading}</th>)}</tr></thead><tbody>{loading ? <tr><td colSpan={8} className="px-4 py-10 text-center text-slate-500">Cargando obligaciones…</td></tr> : items.map((item) => { const remaining = Math.max(0, Number(item.amount) - Number(item.amountPaid)); const nextReminder = item.reminders?.[0]; return <tr key={item.id} className="border-t border-slate-100"><td className="px-4 py-4 font-semibold">{categoryLabel(item)}</td><td className="px-4 py-4">{item.supplierName}<span className="mt-1 block text-xs text-slate-400">{item.supplierDocument || 'Sin documento'}</span></td><td className="max-w-xs px-4 py-4 text-slate-600">{item.description}{item.invoiceNumber && <span className="mt-1 block text-xs text-slate-400">Factura {item.invoiceNumber}</span>}{nextReminder && <span className="mt-1 flex items-center gap-1 text-xs font-semibold text-[#9c7532]"><Clock3 size={12} /> Recordatorio: {new Date(nextReminder.remindAt).toLocaleString('es-VE')}</span>}</td><td className={`px-4 py-4 ${item.status !== 'PAID' && item.dueDate.slice(0, 10) < today() ? 'font-bold text-rose-700' : 'text-slate-600'}`}>{item.dueDate.slice(0, 10)}</td><td className="px-4 py-4">{item.currency} {money.format(Number(item.amount))}</td><td className="px-4 py-4 font-bold text-[#805d20]">{item.currency} {money.format(remaining)}</td><td className="px-4 py-4"><span className={`rounded-full px-2.5 py-1 text-xs font-bold ${item.status === 'PAID' ? 'bg-emerald-50 text-emerald-700' : item.status === 'PARTIALLY_PAID' ? 'bg-amber-50 text-amber-700' : 'bg-slate-100 text-slate-700'}`}>{item.status === 'PAID' ? 'Pagada' : item.status === 'PARTIALLY_PAID' ? 'Abono parcial' : 'Pendiente'}</span></td><td className="px-4 py-4"><div className="flex flex-wrap gap-2">{canWrite && item.status !== 'PAID' && <><button type="button" onClick={() => setReminding(item)} className="inline-flex items-center gap-1 rounded-lg border border-[#b08a3c]/40 px-3 py-1.5 text-xs font-bold text-[#805d20] hover:bg-[#f8f3e7]"><BellPlus size={13} /> Recordar</button><button type="button" onClick={() => setPaying(item)} className="rounded-lg border border-[#071a33]/15 px-3 py-1.5 text-xs font-bold text-[#071a33] hover:bg-slate-50">Aplicar pago</button></>}</div></td></tr>; })}{!loading && !items.length && <tr><td colSpan={8} className="px-4 py-12 text-center text-slate-500">No hay cuentas por pagar registradas.</td></tr>}</tbody></table></div>
    </section>
    {showForm && <Dialog title="Registrar cuenta por pagar" onClose={() => setShowForm(false)}><form onSubmit={submit} className="grid gap-4 sm:grid-cols-2"><Select label="Categoría" name="category" options={categories} /><Input label="Nombre específico de la categoría (opcional)" name="categoryLabel" placeholder="Ej. Permiso municipal, combustible, cuota gremial" wide /><Select label="Proveedor registrado (opcional)" name="vendorId" options={vendors.map((vendor) => [vendor.id, vendor.legalName] as [string, string])} empty="Registrar manualmente" /><Input label="Proveedor / beneficiario" name="supplierName" required placeholder="Empresa de vigilancia, organismo público o trabajador" /><Input label="RIF o documento" name="supplierDocument" /><Input label="Factura o referencia" name="invoiceNumber" /><Input label="Fecha de emisión" name="issueDate" type="date" defaultValue={today()} required /><Input label="Vencimiento" name="dueDate" type="date" defaultValue={today()} required /><Input label="Monto" name="amount" type="number" min="0.01" step="0.01" required /><Select label="Moneda" name="currency" options={[['USD', 'USD'], ['VES', 'VES'], ['EUR', 'EUR']]} /><Input label="Descripción" name="description" required placeholder="Describe la obligación" wide /><Select label="Cuenta de gasto (opcional)" name="expenseAccountId" options={expenseAccounts.map((account) => [account.id, `${account.code} · ${account.name}`] as [string, string])} empty="Sin contabilizar automáticamente" /><Select label="Pasivo / cuenta por pagar (opcional)" name="liabilityAccountId" options={liabilityAccounts.map((account) => [account.id, `${account.code} · ${account.name}`] as [string, string])} empty="Sin contabilizar automáticamente" /><TextArea label="Notas" name="notes" /><div className="sm:col-span-2 flex justify-end gap-2 border-t border-slate-200 pt-4"><button type="button" onClick={() => setShowForm(false)} className="rounded-xl border px-4 py-2.5 text-sm font-bold">Cancelar</button><button className="inline-flex items-center gap-2 rounded-xl bg-[#071a33] px-4 py-2.5 text-sm font-bold text-white"><Check size={15} /> Guardar obligación</button></div></form></Dialog>}
    {paying && <Dialog title={`Aplicar pago · ${paying.supplierName}`} onClose={() => setPaying(null)}><form onSubmit={submitPayment} className="space-y-4"><p className="rounded-xl bg-[#f8f3e7] p-4 text-sm text-slate-600">Saldo pendiente: <strong>{paying.currency} {money.format(Number(paying.amount) - Number(paying.amountPaid))}</strong></p><Input label="Monto del pago" name="amount" type="number" min="0.01" max={String(Number(paying.amount) - Number(paying.amountPaid))} step="0.01" defaultValue={String(Number(paying.amount) - Number(paying.amountPaid))} required /><Input label="Fecha de pago" name="paidAt" type="date" defaultValue={today()} required /><Select label="Cuenta de salida (opcional)" name="paymentAccountId" options={paymentAccounts.map((account) => [account.id, `${account.code} · ${account.name}`] as [string, string])} empty="Registrar pago operativo" /><Input label="Referencia" name="paymentReference" placeholder="Transferencia / cheque / recibo" /><div className="flex justify-end gap-2 border-t border-slate-200 pt-4"><button type="button" onClick={() => setPaying(null)} className="rounded-xl border px-4 py-2.5 text-sm font-bold">Cancelar</button><button className="rounded-xl bg-[#071a33] px-4 py-2.5 text-sm font-bold text-white">Aplicar pago</button></div></form></Dialog>}
    {reminding && <Dialog title={`Configurar recordatorio · ${reminding.supplierName}`} onClose={() => setReminding(null)}><form onSubmit={submitReminder} className="space-y-4"><p className="rounded-xl bg-[#f8f3e7] p-4 text-sm leading-6 text-slate-600">El recordatorio aparecerá en <strong>Notificaciones</strong> cuando llegue la fecha y hora indicada. La obligación vence el <strong>{reminding.dueDate.slice(0, 10)}</strong>.</p><Input label="Fecha y hora del recordatorio" name="remindAt" type="datetime-local" min={localDateTime(new Date())} defaultValue={localDateTime(new Date(Date.now() + 60 * 60 * 1000))} required /><TextArea label="Mensaje personalizado (opcional)" name="message" /><div className="flex justify-end gap-2 border-t border-slate-200 pt-4"><button type="button" onClick={() => setReminding(null)} className="rounded-xl border px-4 py-2.5 text-sm font-bold">Cancelar</button><button className="inline-flex items-center gap-2 rounded-xl bg-[#071a33] px-4 py-2.5 text-sm font-bold text-white"><BellPlus size={15} /> Guardar recordatorio</button></div></form></Dialog>}
  </div>;
}

function Metric({ label, value }: { label: string; value: string }) { return <article className="rounded-2xl border border-[#071a33]/8 bg-white p-5"><p className="text-xs font-bold uppercase tracking-wide text-slate-400">{label}</p><p className="mt-3 text-2xl font-bold text-[#071a33]">{value}</p></article>; }
function Dialog({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) { return <div className="fixed inset-0 z-[100] overflow-y-auto bg-[#071a33]/65 p-4 backdrop-blur-sm"><div className="mx-auto mt-6 max-w-3xl rounded-[1.6rem] bg-[#f8f6f0] shadow-2xl"><header className="flex items-center justify-between border-b border-[#071a33]/8 px-5 py-4"><h3 className="font-semibold">{title}</h3><button type="button" onClick={onClose} aria-label="Cerrar" className="rounded-full bg-white p-2"><X size={17} /></button></header><div className="p-5 sm:p-6">{children}</div></div></div>; }
function Input({ label, name, type = 'text', defaultValue, placeholder, required, min, max, step, wide = false }: { label: string; name: string; type?: string; defaultValue?: string; placeholder?: string; required?: boolean; min?: string; max?: string; step?: string; wide?: boolean }) { return <label className={`text-xs font-bold uppercase tracking-wide text-slate-500 ${wide ? 'sm:col-span-2' : ''}`}>{label}<input className={inputClass} name={name} type={type} defaultValue={defaultValue} placeholder={placeholder} required={required} min={min} max={max} step={step} /></label>; }
function TextArea({ label, name }: { label: string; name: string }) { return <label className="text-xs font-bold uppercase tracking-wide text-slate-500 sm:col-span-2">{label}<textarea className={`${inputClass} min-h-24`} name={name} /></label>; }
function Select({ label, name, options, empty }: { label: string; name: string; options: Array<[string, string]>; empty?: string }) { return <label className="text-xs font-bold uppercase tracking-wide text-slate-500">{label}<select className={inputClass} name={name} required={!empty}>{empty && <option value="">{empty}</option>}{options.map(([value, text]) => <option key={value} value={value}>{text}</option>)}</select></label>; }
