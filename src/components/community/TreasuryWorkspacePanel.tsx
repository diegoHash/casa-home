import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { Landmark, WalletCards, X } from 'lucide-react';
import { CommunityWorkspaceService, type TreasurySnapshot } from '../../services/CommunityWorkspaceService';
import { StaffSession } from '../../services/StaffSession';

const paymentTypeLabel: Record<string, string> = {
  CASH: 'Efectivo',
  MOBILE_PAYMENT: 'Pago móvil',
  BANK_TRANSFER: 'Transferencia bancaria',
};

function labelPaymentType(type: string) {
  return paymentTypeLabel[type] ?? type.replace(/_/g, ' ').toLocaleLowerCase('es');
}

export function TreasuryWorkspacePanel() {
  const [treasury, setTreasury] = useState<TreasurySnapshot | null>(null);
  const [error, setError] = useState('');
  const [methodSort, setMethodSort] = useState<{ key: 'label' | 'type' | 'bank' | 'status'; direction: 'asc' | 'desc' }>({ key: 'label', direction: 'asc' });
  const [selectedBank, setSelectedBank] = useState<TreasurySnapshot['bankAccounts'][number] | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<TreasurySnapshot['paymentMethods'][number] | null>(null);

  useEffect(() => {
    CommunityWorkspaceService.treasurySnapshot()
      .then(setTreasury)
      .catch((cause: unknown) => setError(cause instanceof Error ? cause.message : 'No fue posible cargar la información de tesorería.'));
  }, []);

  const banks = treasury?.bankAccounts ?? [];
  const methods = treasury?.paymentMethods ?? [];
  const communityName = StaffSession.context()?.name ?? 'La comunidad';
  const sortedMethods = useMemo(() => [...methods].sort((a, b) => {
    const bankA = banks.find((bank) => bank.id === a.bankAccountId)?.bankName ?? '';
    const bankB = banks.find((bank) => bank.id === b.bankAccountId)?.bankName ?? '';
    const values = { label: [a.label, b.label], type: [labelPaymentType(a.type), labelPaymentType(b.type)], bank: [bankA, bankB], status: [a.status, b.status] };
    const [left, right] = values[methodSort.key];
    return left.localeCompare(right, 'es') * (methodSort.direction === 'asc' ? 1 : -1);
  }), [banks, methods, methodSort]);
  const toggleMethodSort = (key: typeof methodSort.key) => setMethodSort((current) => ({ key, direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc' }));
  const sortLabel = (key: typeof methodSort.key, label: string) => `${label}${methodSort.key === key ? methodSort.direction === 'asc' ? ' ↑' : ' ↓' : ''}`;

  return (
    <div>
      <header className="max-w-3xl">
        <p className="text-xs font-bold uppercase tracking-[.22em] text-[#9c7532]">Operación financiera</p>
        <h2 className="mt-3 text-3xl font-semibold tracking-[-.035em] sm:text-4xl">Tesorería</h2>
        <p className="mt-4 leading-7 text-slate-500">Cuentas bancarias y métodos habilitados para recibir pagos de la comunidad.</p>
      </header>

      {error && <div role="alert" className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">{error}</div>}

      <section className="mt-8 rounded-[1.6rem] border border-[#071a33]/8 bg-white p-5 sm:p-6">
        <div className="flex items-center gap-3"><Landmark size={20} className="text-[#9c7532]" /><div><p className="text-xs font-bold uppercase tracking-[.16em] text-[#9c7532]">Bancos</p><h3 className="mt-1 text-xl font-semibold">Cuentas bancarias</h3></div></div>
        {banks.length ? <div className="mt-5 overflow-x-auto"><table className="w-full min-w-[680px] text-left text-sm"><thead className="border-b border-slate-200 text-[11px] font-bold uppercase tracking-wide text-slate-400"><tr><th className="pb-3">Banco</th><th className="pb-3">Cuenta</th><th className="pb-3">Moneda</th><th className="pb-3">Tipo</th><th className="pb-3">Estado</th><th className="pb-3 text-right">Acción</th></tr></thead><tbody>{banks.map((bank) => <tr key={bank.id} className="border-b border-slate-100"><td className="py-3 font-semibold text-slate-800">{bank.bankName}</td><td className="py-3 font-mono text-xs text-slate-600">•••• {bank.accountNumber.slice(-4)}</td><td className="py-3 text-slate-600">{bank.currency}</td><td className="py-3 text-slate-600">{bank.accountType}</td><td className="py-3"><span className={`rounded-full px-2.5 py-1 text-xs font-bold ${bank.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>{bank.status === 'ACTIVE' ? 'Activa' : 'Inactiva'}</span></td><td className="py-3 text-right"><button type="button" onClick={() => setSelectedBank(bank)} className="rounded-lg border border-[#071a33]/12 px-3 py-1.5 text-xs font-bold text-[#071a33] hover:bg-slate-50">Ver detalle</button></td></tr>)}</tbody></table></div> : <p className="mt-5 text-sm text-slate-500">No hay cuentas bancarias registradas.</p>}
      </section>

      <section className="mt-6 rounded-[1.6rem] border border-[#071a33]/8 bg-white p-5 sm:p-6">
        <div className="flex items-center gap-3"><WalletCards size={20} className="text-[#9c7532]" /><div><p className="text-xs font-bold uppercase tracking-[.16em] text-[#9c7532]">Recepción de pagos</p><h3 className="mt-1 text-xl font-semibold">Métodos de pago</h3></div></div>
        {methods.length ? <div className="mt-5 overflow-x-auto"><table className="w-full min-w-[720px] text-left text-sm"><thead className="border-b border-slate-200 text-[11px] font-bold uppercase tracking-wide text-slate-400"><tr>{([['label', 'Método'], ['type', 'Tipo'], ['bank', 'Banco receptor'], ['status', 'Estado']] as const).map(([key, label]) => <th key={key} className="pb-3"><button type="button" onClick={() => toggleMethodSort(key)} className="font-bold uppercase tracking-wide hover:text-[#805d20]">{sortLabel(key, label)}</button></th>)}<th className="pb-3 text-right">Acción</th></tr></thead><tbody>{sortedMethods.map((method) => { const bank = banks.find((item) => item.id === method.bankAccountId); return <tr key={method.id} className="border-b border-slate-100"><td className="py-3 font-semibold text-slate-800">{method.label}</td><td className="py-3"><span className="rounded-full bg-[#f2ecdf] px-2.5 py-1 text-xs font-bold text-[#805d20]">{labelPaymentType(method.type)}</span></td><td className="py-3 text-slate-600">{bank ? `${bank.bankName} · •••• ${bank.accountNumber.slice(-4)}` : 'No vinculado'}</td><td className="py-3"><span className={`rounded-full px-2.5 py-1 text-xs font-bold ${method.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>{method.status === 'ACTIVE' ? 'Activo' : 'Inactivo'}</span></td><td className="py-3 text-right"><button type="button" onClick={() => setSelectedMethod(method)} className="rounded-lg border border-[#071a33]/12 px-3 py-1.5 text-xs font-bold text-[#071a33] hover:bg-slate-50">Ver detalle</button></td></tr>; })}</tbody></table></div> : <p className="mt-5 text-sm text-slate-500">No hay métodos de pago registrados.</p>}
      </section>

      <p className="mt-6 text-sm text-slate-500">Próximas áreas de Tesorería: caja, ingresos, egresos y transferencias.</p>
      {selectedBank && <DetailDialog title="Cuenta bancaria" onClose={() => setSelectedBank(null)}><Info label="Banco" value={selectedBank.bankName} /><Info label="Número de cuenta" value={selectedBank.accountNumber} mono /><Info label="Tipo de cuenta" value={selectedBank.accountType} /><Info label="RIF" value={selectedBank.holderRif ?? 'No registrado'} /><Info label="Complejo" value={communityName} /><Info label="Estatus" value={selectedBank.status === 'ACTIVE' ? 'Activa' : 'Inactiva'} /></DetailDialog>}
      {selectedMethod && <DetailDialog title="Método de pago" onClose={() => setSelectedMethod(null)}><Info label="Método" value={selectedMethod.label} /><Info label="Tipo" value={labelPaymentType(selectedMethod.type)} /><Info label="Moneda" value={selectedMethod.currency} /><Info label="Instrucciones" value={selectedMethod.instructions ?? 'No registradas'} /><Info label="Cuenta bancaria vinculada" value={selectedMethod.bankAccountId ? (() => { const bank = banks.find((item) => item.id === selectedMethod.bankAccountId); return bank ? `${bank.bankName} · ${bank.accountNumber}` : 'Cuenta no disponible'; })() : 'No vinculado'} /><Info label="Estatus" value={selectedMethod.status === 'ACTIVE' ? 'Activo' : 'Inactivo'} /></DetailDialog>}
    </div>
  );
}

function DetailDialog({ title, children, onClose }: { title: string; children: ReactNode; onClose: () => void }) { return <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#071a33]/65 p-4 backdrop-blur-sm"><div role="dialog" aria-modal="true" aria-label={title} className="w-full max-w-lg rounded-[1.6rem] bg-[#f8f6f0] shadow-2xl"><header className="flex items-center justify-between border-b border-[#071a33]/8 px-5 py-4"><h3 className="font-semibold">{title}</h3><button type="button" onClick={onClose} aria-label="Cerrar" className="rounded-full bg-white p-2"><X size={17} /></button></header><dl className="grid gap-4 p-5 sm:grid-cols-2">{children}</dl></div></div>; }
function Info({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) { return <div><dt className="text-xs font-bold uppercase tracking-wide text-slate-400">{label}</dt><dd className={`mt-1 text-sm font-semibold text-slate-700 ${mono ? 'font-mono' : ''}`}>{value}</dd></div>; }
