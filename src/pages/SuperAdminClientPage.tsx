import { useCallback, useEffect, useMemo, useState, type FormEvent, type ReactNode } from 'react';
import { ArrowLeft, CheckCircle2, Clock3, KeyRound, PauseCircle, PlayCircle, Plus, ShieldAlert, Sparkles, X } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import type { LicenseBillingStatus, LicensePaymentMethod, PlatformClientDetail, SuperAdminState } from '../domain/superAdmin';
import { SuperAdminRepository } from '../services/SuperAdminRepository';
import { CasaPlatformService } from '../services/CasaPlatformService';

const date = new Intl.DateTimeFormat('es-VE', { day: '2-digit', month: 'short', year: 'numeric' });
const money = new Intl.NumberFormat('es-VE', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 });
const inputClass = 'mt-2 w-full rounded-xl border border-slate-200 bg-[#fbfaf7] px-3.5 py-3 text-sm text-[#0b1d33] outline-none transition focus:border-[#b08a3c] focus:ring-4 focus:ring-[#b08a3c]/10';

const statusCopy = {
  ACTIVE: { label: 'Activa', tone: 'bg-emerald-50 text-emerald-700 ring-emerald-600/15' },
  GRACE: { label: 'En gracia', tone: 'bg-amber-50 text-amber-700 ring-amber-600/15' },
  SUSPENDED: { label: 'Suspendida', tone: 'orange' },
  REVOKED: { label: 'Revocada', tone: 'bg-rose-50 text-rose-700 ring-rose-600/15' },
  EXPIRED: { label: 'Vencida', tone: 'bg-slate-100 text-slate-600 ring-slate-500/15' },
} as const;

function Badge({ label, tone }: { label: string; tone: string }) {
  return <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold ring-1 ring-inset ${tone === 'orange' ? 'bg-orange-50 text-orange-700 ring-orange-600/15' : tone}`}><span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-current" />{label}</span>;
}

function Field({ label, children, hint }: { label: string; children: ReactNode; hint?: string }) {
  return <label className="block text-sm font-semibold text-slate-700">{label}{children}{hint && <span className="mt-1.5 block text-xs font-normal leading-5 text-slate-400">{hint}</span>}</label>;
}

function isoDate(value: Date) {
  return value.toISOString().slice(0, 10);
}

function demoDetail(clientId: string, state: SuperAdminState): PlatformClientDetail | null {
  const client = state.clients.find((item) => item.id === clientId);
  if (!client) return null;
  return {
    ...client,
    licenses: [{ ...client.license, id: client.license.id ?? `demo-license-${client.id}` }],
    licensePayments: state.payments.filter((payment) => payment.clientId === clientId).map((payment) => ({
      id: payment.id,
      amount: payment.amount,
      exchangeRate: 1,
      currency: payment.currency,
      paymentMethod: payment.bank ? 'BANK_TRANSFER' : 'OTHER',
      reference: payment.reference,
      paidAt: payment.reportedAt,
      notes: null,
      createdAt: payment.reportedAt,
    })),
  };
}

export default function SuperAdminClientPage() {
  const navigate = useNavigate();
  const { clientId = '' } = useParams();
  const demoMode = import.meta.env.DEV && new URLSearchParams(window.location.search).get('demo') === '1';
  const [detail, setDetail] = useState<PlatformClientDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');
  const [showPayment, setShowPayment] = useState(false);
  const [showRevoke, setShowRevoke] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const next = demoMode ? demoDetail(clientId, SuperAdminRepository.load()) : await CasaPlatformService.getClient(clientId);
      if (!next) throw new Error('No se encontró el cliente solicitado.');
      setDetail(next);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'No fue posible cargar la ficha del cliente.');
    } finally {
      setLoading(false);
    }
  }, [clientId, demoMode]);

  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timer);
  }, [load]);
  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(''), 3500);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const license = detail?.license;
  const billingStatus = useMemo<LicenseBillingStatus>(() => {
    if (!license) return 'overdue';
    const today = new Date();
    const end = new Date(`${license.periodEnd}T23:59:59`);
    const days = Math.ceil((end.getTime() - today.getTime()) / 86400000);
    if (days < 0) return 'overdue';
    if (days <= 7) return 'due-soon';
    return 'current';
  }, [license]);

  const persistDemo = (next: PlatformClientDetail) => {
    const state = SuperAdminRepository.load();
    const client: PlatformClientDetail['license'] = next.license;
    SuperAdminRepository.save({
      ...state,
      clients: state.clients.map((item) => item.id === next.id ? { ...item, ...next, license: client } : item),
      payments: [
        ...state.payments.filter((item) => item.clientId !== next.id),
        ...next.licensePayments.map((payment) => ({
          id: payment.id,
          clientId: next.id,
          reference: payment.reference,
          amount: payment.amount,
          currency: payment.currency,
          bank: payment.paymentMethod === 'BANK_TRANSFER' ? 'Transferencia' : payment.paymentMethod,
          reportedAt: payment.paidAt,
          reconciledAt: null,
          status: 'reconciled' as const,
        })),
      ],
    });
  };

  const submitSettings = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!detail || !license) return;
    const form = new FormData(event.currentTarget);
    const isTrial = form.get('isTrial') === 'on';
    const values = {
      autoRenewOnReconciliation: form.get('autoRenew') === 'on',
      graceDays: Number(form.get('graceDays')),
      isTrial,
      trialFrom: String(form.get('trialFrom') || ''),
      trialUntil: String(form.get('trialUntil') || ''),
    };
    setSaving(true); setError('');
    try {
      if (demoMode) {
        const next = { ...detail, license: { ...license, ...values, graceUntil: isoDate(new Date(new Date(`${license.periodEnd}T12:00:00`).getTime() + values.graceDays * 86400000)), trialFrom: values.trialFrom || null, trialUntil: values.trialUntil || null } };
        setDetail(next); persistDemo(next);
      } else {
        await CasaPlatformService.updateLicenseSettings(detail.id, { ...values, trialFrom: values.trialFrom || undefined, trialUntil: values.trialUntil || undefined });
        await load();
      }
      setToast('Configuración de licencia actualizada.');
    } catch (saveError) { setError(saveError instanceof Error ? saveError.message : 'No fue posible guardar la configuración.'); }
    finally { setSaving(false); }
  };

  const changeStatus = async (status: 'ACTIVE' | 'SUSPENDED') => {
    if (!detail || !license || license.status === 'revoked') return;
    const label = status === 'SUSPENDED' ? 'suspender' : 'reactivar';
    if (!window.confirm(`¿Confirmas ${label} la licencia de ${detail.name}?`)) return;
    setSaving(true); setError('');
    try {
      if (demoMode) {
        const next = { ...detail, standing: status === 'ACTIVE' ? 'solvent' as const : 'suspended' as const, license: { ...license, status: status === 'ACTIVE' ? 'active' as const : 'suspended' as const } };
        setDetail(next); persistDemo(next);
      } else { await CasaPlatformService.updateLicenseStatus(detail.id, status, `${status === 'ACTIVE' ? 'Reactivación' : 'Suspensión'} manual desde CASA Control`); await load(); }
      setToast(status === 'ACTIVE' ? 'Licencia reactivada.' : 'Licencia suspendida.');
    } catch (saveError) { setError(saveError instanceof Error ? saveError.message : 'No fue posible actualizar el estado.'); }
    finally { setSaving(false); }
  };

  const submitPayment = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!detail) return;
    const form = new FormData(event.currentTarget);
    const input = {
      amount: Number(form.get('amount')),
      exchangeRate: Number(form.get('exchangeRate')),
      currency: String(form.get('currency')) as 'USD' | 'VES' | 'EUR',
      paymentMethod: String(form.get('paymentMethod')) as LicensePaymentMethod,
      reference: String(form.get('reference')).trim(),
      paidAt: String(form.get('paidAt')),
      notes: String(form.get('notes') || '').trim() || undefined,
    };
    setSaving(true); setError('');
    try {
      if (demoMode) {
        const payment = { id: `demo-payment-${Date.now()}`, ...input, createdAt: new Date().toISOString() };
        const next = { ...detail, licensePayments: [payment, ...detail.licensePayments] };
        setDetail(next); persistDemo(next);
      } else { await CasaPlatformService.createLicensePayment(detail.id, input); await load(); }
      setShowPayment(false); setToast('Pago manual registrado.');
    } catch (saveError) { setError(saveError instanceof Error ? saveError.message : 'No fue posible registrar el pago.'); }
    finally { setSaving(false); }
  };

  const submitRevoke = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!detail || !license) return;
    const reason = String(new FormData(event.currentTarget).get('reason') || '').trim();
    setSaving(true); setError('');
    try {
      if (demoMode) {
        const next = { ...detail, standing: 'suspended' as const, license: { ...license, status: 'revoked' as const, revokedAt: new Date().toISOString(), autoRenewOnReconciliation: false } };
        setDetail(next); persistDemo(next);
      } else { await CasaPlatformService.revokeLicense(detail.id, reason); await load(); }
      setShowRevoke(false); setToast('Licencia revocada.');
    } catch (saveError) { setError(saveError instanceof Error ? saveError.message : 'No fue posible revocar la licencia.'); }
    finally { setSaving(false); }
  };

  if (loading) return <main className="flex min-h-screen items-center justify-center bg-[#f5f3ee] text-[#071a33]"><div className="text-center"><div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-[#071a33]/15 border-t-[#b08a3c]" /><p className="mt-4 text-sm font-semibold">Cargando ficha integral…</p></div></main>;
  if (!detail || !license) return <main className="min-h-screen bg-[#f5f3ee] p-8 text-[#071a33]"><button onClick={() => navigate('/dashboard')} className="inline-flex items-center gap-2 text-sm font-bold"><ArrowLeft size={16} />Volver a CASA Control</button><div className="mx-auto mt-20 max-w-xl rounded-2xl border border-rose-200 bg-rose-50 p-6 text-sm font-semibold text-rose-700">{error || 'No se encontró la ficha.'}</div></main>;
  const licenseStatus = statusCopy[license.status.toUpperCase() as keyof typeof statusCopy] ?? statusCopy.EXPIRED;
  const billingCopy = billingStatus === 'current' ? 'Al día' : billingStatus === 'due-soon' ? 'Por vencer' : 'Vencida';

  return <div className="min-h-screen bg-[#f5f3ee] text-[#071a33]">
    <header className="sticky top-0 z-30 border-b border-[#071a33]/8 bg-[#f5f3ee]/90 px-4 py-4 backdrop-blur-xl sm:px-8"><div className="mx-auto flex max-w-[1400px] items-center justify-between gap-4"><button onClick={() => navigate('/dashboard')} className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-[#071a33]"><ArrowLeft size={17} />Volver a CASA Control</button><span className="hidden text-xs font-bold uppercase tracking-[.18em] text-[#9a742b] sm:block">Ficha dedicada · Super Admin</span></div></header>
    <main className="mx-auto max-w-[1400px] px-4 py-7 sm:px-8 lg:py-10">
      {error && <div role="alert" className="mb-6 rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm font-semibold text-rose-700">{error}</div>}
      <section className="rounded-[1.75rem] bg-[#071a33] p-6 text-white shadow-[0_20px_60px_rgba(7,26,51,.14)] sm:p-8"><div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between"><div><p className="text-xs font-bold uppercase tracking-[.18em] text-[#e4c26f]">{detail.rif} · {detail.location || 'Comunidad sin ubicación'}</p><h1 className="mt-3 text-3xl font-semibold tracking-[-.04em] sm:text-4xl">{detail.name}</h1><p className="mt-2 text-sm text-white/55">{detail.legalName}</p></div><div className="flex flex-wrap gap-2"><Badge label={licenseStatus.label} tone={licenseStatus.tone} /><Badge label={billingCopy} tone={billingStatus === 'current' ? 'bg-blue-50 text-blue-700 ring-blue-600/15' : billingStatus === 'due-soon' ? 'bg-amber-50 text-amber-700 ring-amber-600/15' : 'bg-rose-50 text-rose-700 ring-rose-600/15'} /></div></div><div className="mt-8 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl bg-white/[.07] p-4"><p className="text-xs text-white/45">Vigencia actual</p><p className="mt-2 font-semibold">{date.format(new Date(`${license.periodStart}T12:00:00`))} — {date.format(new Date(`${license.periodEnd}T12:00:00`))}</p></div><div className="rounded-2xl bg-white/[.07] p-4"><p className="text-xs text-white/45">Mensualidad</p><p className="mt-2 text-xl font-semibold text-[#e4c26f]">{money.format(license.monthlyFee)}</p></div><div className="rounded-2xl bg-white/[.07] p-4"><p className="text-xs text-white/45">Comunidad aislada</p><p className="mt-2 font-semibold">{detail.propertyCount} inmuebles · {detail.communityId ?? 'Contexto pendiente'}</p></div></div></section>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.15fr_.85fr]">
        <div className="space-y-6">
          <section className="rounded-[1.5rem] border border-[#071a33]/8 bg-white p-5 shadow-[0_14px_40px_rgba(7,26,51,.04)] sm:p-6"><div className="flex items-start justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[.16em] text-[#9a742b]">Gobierno de acceso</p><h2 className="mt-2 text-2xl font-semibold">Control de la licencia</h2><p className="mt-2 text-sm leading-6 text-slate-500">Las acciones afectan únicamente a la licencia de esta comunidad y quedan registradas en auditoría.</p></div><KeyRound className="text-[#9a742b]" size={24} /></div><div className="mt-6 grid gap-3 sm:grid-cols-2"><button disabled={saving || license.status === 'revoked' || license.status === 'suspended'} onClick={() => void changeStatus('SUSPENDED')} className="inline-flex items-center justify-center gap-2 rounded-xl border border-orange-200 px-4 py-3 text-sm font-bold text-orange-700 disabled:cursor-not-allowed disabled:opacity-40"><PauseCircle size={17} />Suspender licencia</button><button disabled={saving || license.status === 'revoked' || license.status !== 'suspended'} onClick={() => void changeStatus('ACTIVE')} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#071a33] px-4 py-3 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-40"><PlayCircle size={17} />Reactivar licencia</button></div></section>

          <section className="rounded-[1.5rem] border border-[#071a33]/8 bg-white p-5 shadow-[0_14px_40px_rgba(7,26,51,.04)] sm:p-6"><div className="flex items-center justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-[.16em] text-[#9a742b]">Historial de pagos</p><h2 className="mt-2 text-2xl font-semibold">Pagos de licencia</h2></div><button onClick={() => setShowPayment(true)} disabled={license.status === 'revoked'} className="inline-flex items-center gap-2 rounded-xl bg-[#071a33] px-3.5 py-2.5 text-xs font-bold text-white disabled:opacity-40"><Plus size={15} />Registrar pago</button></div><div className="mt-5 overflow-x-auto"><table className="w-full min-w-[680px] text-left text-sm"><thead className="border-b border-slate-100 text-[10px] font-bold uppercase tracking-[.14em] text-slate-400"><tr><th className="pb-3">Fecha</th><th className="pb-3">Referencia</th><th className="pb-3">Método</th><th className="pb-3">Monto</th><th className="pb-3">Tasa</th></tr></thead><tbody>{detail.licensePayments.map((payment) => <tr key={payment.id} className="border-b border-slate-100"><td className="py-4 text-slate-500">{date.format(new Date(payment.paidAt))}</td><td className="py-4 font-mono text-xs font-semibold">{payment.reference}</td><td className="py-4 text-slate-600">{payment.paymentMethod === 'BANK_TRANSFER' ? 'Transferencia' : payment.paymentMethod === 'MOBILE_PAYMENT' ? 'Pago móvil' : payment.paymentMethod === 'CASH' ? 'Efectivo' : 'Otro'}</td><td className="py-4 font-bold">{payment.currency} {payment.amount.toLocaleString('es-VE', { minimumFractionDigits: 2 })}</td><td className="py-4 text-slate-500">{payment.exchangeRate.toLocaleString('es-VE', { minimumFractionDigits: 2 })}</td></tr>)}{!detail.licensePayments.length && <tr><td colSpan={5} className="py-10 text-center text-slate-400">Aún no hay pagos manuales registrados.</td></tr>}</tbody></table></div></section>
        </div>

        <div className="space-y-6">
          <form onSubmit={submitSettings} className="rounded-[1.5rem] border border-[#071a33]/8 bg-white p-5 shadow-[0_14px_40px_rgba(7,26,51,.04)] sm:p-6"><div className="flex items-start justify-between"><div><p className="text-xs font-bold uppercase tracking-[.16em] text-[#9a742b]">Parámetros comerciales</p><h2 className="mt-2 text-2xl font-semibold">Gracia y prueba</h2></div><Clock3 className="text-[#9a742b]" size={24} /></div><div className="mt-5 space-y-4"><Field label="Días de gracia" hint={`La gracia actual termina el ${date.format(new Date(`${license.graceUntil}T12:00:00`))}.`}><input name="graceDays" type="number" min="0" max="365" defaultValue={license.graceDays ?? 5} className={inputClass} required /></Field><label className="flex items-center gap-3 rounded-xl border border-slate-100 bg-[#fbfaf7] p-3 text-sm font-semibold"><input name="autoRenew" type="checkbox" defaultChecked={license.autoRenewOnReconciliation} className="h-4 w-4 accent-[#9a742b]" />Renovar al conciliar un pago</label><label className="flex items-center gap-3 rounded-xl border border-slate-100 bg-[#fbfaf7] p-3 text-sm font-semibold"><input name="isTrial" type="checkbox" defaultChecked={license.isTrial} className="h-4 w-4 accent-[#9a742b]" />Periodo de prueba habilitado</label><div className="grid gap-4 sm:grid-cols-2"><Field label="Desde"><input name="trialFrom" type="date" defaultValue={license.trialFrom?.slice(0, 10) ?? ''} className={inputClass} /></Field><Field label="Hasta"><input name="trialUntil" type="date" defaultValue={license.trialUntil?.slice(0, 10) ?? ''} className={inputClass} /></Field></div></div><button disabled={saving} className="mt-5 w-full rounded-xl bg-[#071a33] py-3 text-sm font-bold text-white disabled:opacity-50">{saving ? 'Guardando…' : 'Guardar configuración'}</button></form>
          <section className="rounded-[1.5rem] border border-rose-200 bg-rose-50/60 p-5 sm:p-6"><div className="flex gap-3"><ShieldAlert className="shrink-0 text-rose-700" size={21} /><div><p className="font-bold text-rose-900">Acción irreversible</p><p className="mt-1 text-sm leading-6 text-rose-800/75">Revocar impide reactivar esta licencia. Para volver a operar se deberá emitir una nueva licencia.</p></div></div><button onClick={() => setShowRevoke(true)} disabled={saving || license.status === 'revoked'} className="mt-5 w-full rounded-xl border border-rose-300 bg-white py-3 text-sm font-bold text-rose-700 disabled:opacity-40">{license.status === 'revoked' ? 'Licencia revocada' : 'Revocar licencia'}</button></section>
          <section className="rounded-[1.5rem] border border-[#d6af57]/30 bg-[#fffaf0] p-5 sm:p-6"><div className="flex gap-3"><Sparkles className="shrink-0 text-[#9a742b]" size={21} /><div><p className="font-bold">Contexto operativo</p><p className="mt-1 text-sm leading-6 text-slate-600">El acceso de personal, inmuebles y módulos operativos continúa administrándose dentro del contexto de esta comunidad.</p><button onClick={() => navigate('/dashboard')} className="mt-3 text-sm font-bold text-[#9a742b]">Ir al Núcleo CASA →</button></div></div></section>
        </div>
      </div>
    </main>

    {showPayment && <div className="fixed inset-0 z-[100] flex items-end justify-center bg-[#061529]/65 p-0 backdrop-blur-sm sm:items-center sm:p-5"><form onSubmit={submitPayment} className="max-h-[94vh] w-full max-w-2xl overflow-y-auto rounded-t-[1.75rem] bg-white p-6 shadow-2xl sm:rounded-[1.75rem]"><div className="flex items-start justify-between"><div><p className="text-xs font-bold uppercase tracking-[.16em] text-[#9a742b]">Tesorería de plataforma</p><h2 className="mt-2 text-2xl font-semibold">Registrar pago manual</h2><p className="mt-1 text-sm text-slate-500">El pago quedará ligado a la licencia y comunidad seleccionadas.</p></div><button type="button" onClick={() => setShowPayment(false)} className="rounded-full border border-slate-200 p-2 text-slate-500"><X size={18} /></button></div><div className="mt-6 grid gap-4 sm:grid-cols-2"><Field label="Monto"><input name="amount" type="number" step="0.01" min="0.01" className={inputClass} required /></Field><Field label="Tasa de cambio"><input name="exchangeRate" type="number" step="0.000001" min="0.000001" defaultValue="1" className={inputClass} required /></Field><Field label="Moneda"><select name="currency" className={inputClass} defaultValue="USD"><option>USD</option><option>VES</option><option>EUR</option></select></Field><Field label="Método de pago"><select name="paymentMethod" className={inputClass} required><option value="BANK_TRANSFER">Transferencia bancaria</option><option value="MOBILE_PAYMENT">Pago móvil</option><option value="CASH">Efectivo</option><option value="OTHER">Otro</option></select></Field><Field label="Referencia"><input name="reference" className={inputClass} required maxLength={160} /></Field><Field label="Fecha"><input name="paidAt" type="date" defaultValue={isoDate(new Date())} className={inputClass} required /></Field><Field label="Nota" hint="Opcional"><input name="notes" className={inputClass} maxLength={500} /></Field></div><button disabled={saving} className="mt-6 w-full rounded-xl bg-[#071a33] py-3.5 text-sm font-bold text-white disabled:opacity-50">{saving ? 'Registrando…' : 'Guardar pago'}</button></form></div>}
    {showRevoke && <div className="fixed inset-0 z-[100] flex items-end justify-center bg-[#061529]/65 p-0 backdrop-blur-sm sm:items-center sm:p-5"><form onSubmit={submitRevoke} className="w-full max-w-lg rounded-t-[1.75rem] bg-white p-6 shadow-2xl sm:rounded-[1.75rem]"><div className="flex items-start justify-between"><div><h2 className="text-xl font-semibold">Revocar licencia</h2><p className="mt-1 text-sm text-slate-500">Esta acción no puede deshacerse.</p></div><button type="button" onClick={() => setShowRevoke(false)} className="rounded-full border border-slate-200 p-2 text-slate-500"><X size={18} /></button></div><Field label="Justificación"><textarea name="reason" className={`${inputClass} min-h-28`} required minLength={5} maxLength={500} /></Field><button disabled={saving} className="mt-5 w-full rounded-xl bg-rose-700 py-3.5 text-sm font-bold text-white disabled:opacity-50">Confirmar revocación</button></form></div>}
    {toast && <div className="fixed bottom-5 left-1/2 z-[150] flex -translate-x-1/2 items-center gap-3 rounded-full bg-[#071a33] px-5 py-3 text-sm font-semibold text-white shadow-2xl"><CheckCircle2 size={18} className="text-[#e4c26f]" />{toast}</div>}
  </div>;
}
