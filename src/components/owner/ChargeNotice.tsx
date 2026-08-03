import { AlertCircle, Building2, CheckCircle2, Landmark, Printer, ReceiptText, Smartphone } from 'lucide-react';

const aliquot = 1.2846;
const bcvRate = 151;
const bcvRateDate = '17/07/2026';
const formatUSD = (value: number) => new Intl.NumberFormat('es-VE', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(value);
const formatVES = (value: number) => new Intl.NumberFormat('es-VE', { style: 'currency', currency: 'VES', minimumFractionDigits: 2 }).format(value);

type Expense = {
  id: string;
  categoryId: string;
  description: string;
  supplier: string;
  document: string;
  monthlyTotal: number;
};

type Category = {
  id: string;
  name: string;
  description: string;
  expenses: Expense[];
};

const categories: Category[] = [
  {
    id: 'CAT-001',
    name: 'Personal y obligaciones laborales',
    description: 'Remuneraciones, vigilancia, beneficios y dotación del personal que presta servicios a la comunidad.',
    expenses: [
      { id: 'G-0001', categoryId: 'CAT-001', description: 'Nómina mensual del personal operativo', supplier: 'Personal del condominio', document: 'NOM-2026-07', monthlyTotal: 4200 },
      { id: 'G-0002', categoryId: 'CAT-001', description: 'Servicio de vigilancia y control perimetral', supplier: 'Seguridad Costera, C.A.', document: 'FAC-8841', monthlyTotal: 2150 },
      { id: 'G-0003', categoryId: 'CAT-001', description: 'Provisión de prestaciones y obligaciones laborales', supplier: 'Fondo laboral', document: 'PROV-0726', monthlyTotal: 950 },
      { id: 'G-0004', categoryId: 'CAT-001', description: 'Uniformes e implementos de seguridad laboral', supplier: 'Suministros Atlas', document: 'FAC-1087', monthlyTotal: 620 },
    ],
  },
  {
    id: 'CAT-002',
    name: 'Mantenimiento y conservación',
    description: 'Servicios preventivos y correctivos aplicados a equipos, instalaciones y áreas comunes.',
    expenses: [
      { id: 'G-0005', categoryId: 'CAT-002', description: 'Mantenimiento preventivo de ascensores', supplier: 'Ascensores del Caribe', document: 'FAC-4419', monthlyTotal: 1450 },
      { id: 'G-0006', categoryId: 'CAT-002', description: 'Tratamiento y mantenimiento de piscinas', supplier: 'Aqua Servicios, C.A.', document: 'FAC-2294', monthlyTotal: 900 },
      { id: 'G-0007', categoryId: 'CAT-002', description: 'Paisajismo y conservación de jardines', supplier: 'Verde Vivo', document: 'FAC-7810', monthlyTotal: 780 },
      { id: 'G-0008', categoryId: 'CAT-002', description: 'Reparaciones eléctricas en áreas comunes', supplier: 'ElectroMar', document: 'FAC-3318', monthlyTotal: 720 },
    ],
  },
  {
    id: 'CAT-003',
    name: 'Servicios básicos y comunicaciones',
    description: 'Consumos y servicios compartidos necesarios para el funcionamiento ordinario del complejo.',
    expenses: [
      { id: 'G-0009', categoryId: 'CAT-003', description: 'Electricidad de áreas y equipos comunes', supplier: 'Corpoelec', document: 'SER-0726-01', monthlyTotal: 980 },
      { id: 'G-0010', categoryId: 'CAT-003', description: 'Agua, bombeo y distribución interna', supplier: 'Hidrológica regional', document: 'SER-0726-02', monthlyTotal: 620 },
      { id: 'G-0011', categoryId: 'CAT-003', description: 'Internet dedicado y conectividad CCTV', supplier: 'Proveedor de telecomunicaciones', document: 'FAC-6901', monthlyTotal: 380 },
      { id: 'G-0012', categoryId: 'CAT-003', description: 'Recolección especial de desechos', supplier: 'Servicios Municipales', document: 'SER-0726-03', monthlyTotal: 200 },
    ],
  },
  {
    id: 'CAT-004',
    name: 'Administración y cumplimiento',
    description: 'Gestión administrativa, contable, bancaria y documental del condominio.',
    expenses: [
      { id: 'G-0013', categoryId: 'CAT-004', description: 'Honorarios de administración', supplier: 'Administración Caribbean Marina', document: 'HON-0726', monthlyTotal: 450 },
      { id: 'G-0014', categoryId: 'CAT-004', description: 'Servicios contables y obligaciones fiscales', supplier: 'Contadores Asociados', document: 'HON-184', monthlyTotal: 260 },
      { id: 'G-0015', categoryId: 'CAT-004', description: 'Comisiones y servicios bancarios', supplier: 'Instituciones financieras', document: 'BAN-0726', monthlyTotal: 180 },
      { id: 'G-0016', categoryId: 'CAT-004', description: 'Papelería, archivo y comunicaciones', supplier: 'Caja chica administrativa', document: 'REL-0726', monthlyTotal: 120 },
    ],
  },
];

const adjustments = [
  { id: 'AJ-001', label: 'Fondo de reserva', description: 'Aporte mensual para reparaciones mayores y contingencias patrimoniales.', communityAmount: 739.54, propertyAmount: 9.50, applies: true },
  { id: 'AJ-002', label: 'Provisiones', description: 'Previsión aprobada para compromisos laborales y servicios próximos.', communityAmount: 467.08, propertyAmount: 6.00, applies: true },
  { id: 'AJ-003', label: 'Cuota extra', description: 'No fue emitida una cuota extra durante este período.', communityAmount: 0, propertyAmount: 0, applies: false },
  { id: 'AJ-004', label: 'Cuota extraordinaria', description: 'Primera fracción aprobada para modernización del sistema de bombeo.', communityAmount: 934.14, propertyAmount: 12.00, applies: true },
  { id: 'AJ-005', label: 'Cuota de emergencia', description: 'No se emitieron cuotas de emergencia durante este período.', communityAmount: 0, propertyAmount: 0, applies: false },
];

// Esta política pertenece a la configuración financiera de cada condominio.
// Cuando está desactivada, el concepto y su monto no forman parte del aviso.
const showIncomeInChargeNotice = true;

const credits = [
  { id: 'CR-001', label: 'Cruce de cuenta aplicado', description: 'Saldo a favor confirmado en conciliación del período anterior.', amount: -15.00 },
];

const communityIncome = {
  id: 'ING-001',
  label: 'Ingresos',
  description: 'Ingreso del condominio por venta de brazaletes, distribuido a favor de los inmuebles según la política aprobada.',
  amount: -19.67616,
};

function categoryTotal(category: Category) {
  return category.expenses.reduce((sum, expense) => sum + expense.monthlyTotal, 0);
}

function propertyShare(value: number) {
  return value * (aliquot / 100);
}

export default function ChargeNotice() {
  const appliedCredits = showIncomeInChargeNotice ? [...credits, communityIncome] : credits;
  const appliedAdjustments = adjustments.filter(item => item.applies && (item.communityAmount > 0 || item.propertyAmount > 0));
  const ordinaryTotal = categories.reduce((sum, category) => sum + categoryTotal(category), 0);
  const ordinaryPropertyTotal = categories.reduce((sum, category) => sum + propertyShare(categoryTotal(category)), 0);
  const adjustmentsTotal = appliedAdjustments.reduce((sum, item) => sum + item.communityAmount, 0);
  const propertyAdjustmentsTotal = appliedAdjustments.reduce((sum, item) => sum + item.propertyAmount, 0);
  const creditsTotal = appliedCredits.reduce((sum, item) => sum + item.amount, 0);
  const noticeTotal = ordinaryTotal + adjustmentsTotal;
  const grossPropertyTotal = ordinaryPropertyTotal + propertyAdjustmentsTotal;
  const propertyPayable = grossPropertyTotal + creditsTotal;
  const propertyPayableVES = propertyPayable * bcvRate;

  return <article id="charge-notice" className="overflow-hidden rounded-[2rem] border border-[#0b1d33]/10 bg-white shadow-[0_24px_70px_rgba(8,29,51,.08)] print:rounded-none print:border-0 print:shadow-none">
    <header className="relative overflow-hidden bg-[#0b1d33] px-6 py-7 text-white sm:px-9 sm:py-9 print:bg-white print:px-0 print:text-[#0b1d33]">
      <div className="absolute -right-16 -top-16 h-52 w-52 rounded-full bg-[#d6af57]/15 blur-2xl print:hidden" />
      <div className="relative flex flex-col gap-7 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-[#e6c66f]/35 bg-white/10 text-xl font-black tracking-[-.08em] text-[#f0cf77] print:border-[#0b1d33]/15 print:bg-[#0b1d33]">CM</div>
          <div><p className="text-[10px] font-bold uppercase tracking-[.24em] text-[#f0cf77] print:text-[#9b752c]">Caribbean Marina</p><h1 className="mt-1 text-xl font-semibold">Condominio Caribbean Marina</h1><p className="mt-1 text-xs text-white/50 print:text-slate-500">RIF J-41234567-8 · La Guaira, Venezuela</p></div>
        </div>
        <div className="sm:text-right"><p className="text-[10px] font-bold uppercase tracking-[.22em] text-[#f0cf77] print:text-[#9b752c]">Aviso de cobro</p><p className="mt-2 text-2xl font-semibold">Julio 2026</p><p className="mt-1 font-mono text-xs text-white/50 print:text-slate-500">AC-2026-07-B402</p></div>
      </div>
      <div className="relative mt-7 grid gap-3 border-t border-white/10 pt-6 text-sm sm:grid-cols-4 print:border-slate-200">
        <div><p className="text-xs text-white/45 print:text-slate-400">Propietario</p><p className="mt-1 font-semibold">Alejandro Mendoza R.</p></div>
        <div><p className="text-xs text-white/45 print:text-slate-400">Inmueble</p><p className="mt-1 font-semibold">Torre B · Apto. B-402</p></div>
        <div><p className="text-xs text-white/45 print:text-slate-400">Alícuota</p><p className="mt-1 font-semibold">{aliquot.toFixed(4).replace('.', ',')}%</p></div>
        <div><p className="text-xs text-white/45 print:text-slate-400">Fecha de vencimiento</p><p className="mt-1 font-semibold text-[#f0cf77] print:text-[#9b752c]">31 de julio de 2026</p></div>
      </div>
    </header>

    <div className="p-6 sm:p-9 print:p-0 print:pt-6">
      <section className="charge-section mt-3">
        <div className="flex items-start gap-3"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#f1eadb] text-[#9b752c]"><ReceiptText size={19} /></span><div><p className="text-xs font-bold uppercase tracking-[.16em] text-[#9b752c]">01 · Gastos ordinarios</p><h2 className="mt-1 text-xl font-semibold">¿En qué se utilizó el dinero?</h2><p className="mt-1 text-sm leading-6 text-slate-500">Cada gasto conserva su categoría, proveedor, soporte y cálculo para el inmueble.</p></div></div>
        <div className="mt-5 space-y-5">{categories.map(category => {
          const total = categoryTotal(category);
          return <section key={category.id} className="charge-category overflow-hidden rounded-2xl border border-slate-200 break-inside-avoid">
            <header className="grid gap-4 bg-[#f8f6f1] p-4 sm:grid-cols-[110px_1fr_auto_auto] sm:items-center">
              <p className="font-mono text-xs font-bold text-[#9b752c]">{category.id}</p>
              <div><h3 className="font-semibold">{category.name}</h3><p className="mt-1 text-xs leading-5 text-slate-500">{category.description}</p></div>
              <div className="sm:text-right"><p className="text-[10px] uppercase tracking-wider text-slate-400">Total categoría</p><p className="mt-1 text-sm font-bold">{formatUSD(total)}</p></div>
              <div className="sm:text-right"><p className="text-[10px] uppercase tracking-wider text-slate-400">Tu inmueble</p><p className="mt-1 text-sm font-bold text-[#9b752c]">{formatUSD(propertyShare(total))}</p></div>
            </header>
            <div className="charge-scroll overflow-x-auto"><table className="charge-expense-table w-full min-w-[650px] text-left text-xs"><thead className="border-y border-slate-100 bg-white text-[10px] font-bold uppercase tracking-[.12em] text-slate-400"><tr><th className="px-4 py-3">ID</th><th className="px-4 py-3">Categoría</th><th className="px-4 py-3">Descripción</th><th className="px-4 py-3 text-right">Total mes</th><th className="px-4 py-3 text-right">B-402</th></tr></thead><tbody className="divide-y divide-slate-100">{category.expenses.map(expense => <tr key={expense.id}><td className="px-4 py-3 font-mono text-slate-500">{expense.id}</td><td className="px-4 py-3 font-mono text-slate-500">{expense.categoryId}</td><td className="px-4 py-3 font-semibold">{expense.description}</td><td className="px-4 py-3 text-right font-semibold">{formatUSD(expense.monthlyTotal)}</td><td className="px-4 py-3 text-right font-bold text-[#9b752c]">{formatUSD(propertyShare(expense.monthlyTotal))}</td></tr>)}</tbody><tfoot className="border-t border-slate-200 bg-[#fbfaf7] font-bold"><tr><td colSpan={3} className="px-4 py-3 text-right">Subtotal {category.name}</td><td className="px-4 py-3 text-right">{formatUSD(total)}</td><td className="px-4 py-3 text-right text-[#9b752c]">{formatUSD(propertyShare(total))}</td></tr></tfoot></table></div>
          </section>;
        })}</div>
        <div className="mt-4 flex flex-col gap-3 rounded-2xl bg-[#071a33] p-5 text-white sm:flex-row sm:items-center sm:justify-between"><div><p className="text-xs text-white/50">Total de gastos ordinarios de la comunidad</p><p className="mt-1 text-xl font-semibold">{formatUSD(ordinaryTotal)}</p></div><div className="sm:text-right"><p className="text-xs text-white/50">Participación del inmueble · {aliquot.toFixed(4).replace('.', ',')}%</p><p className="mt-1 text-xl font-semibold text-[#f0cf77]">{formatUSD(ordinaryPropertyTotal)}</p></div></div>
      </section>

      <section className="charge-section mt-9 break-inside-avoid">
        <p className="text-xs font-bold uppercase tracking-[.16em] text-[#9b752c]">02 · Fondos, provisiones y cuotas especiales</p>
        <h2 className="mt-1 text-xl font-semibold">Conceptos adicionales del período</h2>
        <div className="charge-scroll mt-4 overflow-x-auto rounded-2xl border border-slate-200"><table className="charge-adjustment-table w-full min-w-[760px] text-left text-sm"><thead className="bg-[#f8f6f1] text-[10px] font-bold uppercase tracking-[.12em] text-slate-400"><tr><th className="px-4 py-3">ID</th><th className="px-4 py-3">Concepto</th><th className="px-4 py-3">Descripción</th><th className="px-4 py-3 text-right">Comunidad</th><th className="px-4 py-3 text-right">Tu inmueble</th></tr></thead><tbody className="divide-y divide-slate-100">{appliedAdjustments.map(item => <tr key={item.id}><td className="px-4 py-4 font-mono text-xs">{item.id}</td><td className="px-4 py-4 font-semibold">{item.label}</td><td className="px-4 py-4 text-xs leading-5">{item.description}</td><td className="px-4 py-4 text-right font-semibold">{formatUSD(item.communityAmount)}</td><td className="px-4 py-4 text-right font-bold text-[#9b752c]">{formatUSD(item.propertyAmount)}</td></tr>)}</tbody></table></div>
      </section>

      <section className="charge-totals mt-4 grid gap-3 sm:grid-cols-2 break-inside-avoid">
        <div className="rounded-2xl bg-[#071a33] p-5 text-white">
          <p className="text-xs font-bold uppercase tracking-[.14em] text-[#f0cf77]">Total a pagar por la comunidad</p>
          <p className="mt-2 text-3xl font-semibold text-[#f0cf77]">{formatUSD(noticeTotal)}</p>
          <p className="mt-2 text-xs text-white/50">{formatUSD(ordinaryTotal)} en gastos + {formatUSD(adjustmentsTotal)} en fondos y cuotas aplicables.</p>
        </div>
        <div className="rounded-2xl bg-[#f1eadb] p-5 text-[#071a33]">
          <p className="text-xs font-bold uppercase tracking-[.14em] text-[#85631f]">Total asignado al inmueble</p>
          <p className="mt-2 text-3xl font-semibold">{formatUSD(grossPropertyTotal)}</p>
          <p className="mt-2 text-xs text-[#85631f]">Apartamento B-402 · alícuota {aliquot.toFixed(4).replace('.', ',')}% · antes de créditos e ingresos.</p>
        </div>
      </section>

      <section className="charge-section mt-9 break-inside-avoid">
        <p className="text-xs font-bold uppercase tracking-[.16em] text-[#9b752c]">03 · Créditos e ingresos</p>
        <h2 className="mt-1 text-xl font-semibold">Valores aplicados a favor del propietario</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">{appliedCredits.map(item => <div key={item.id} className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4"><div className="flex items-center justify-between gap-3"><p className="font-semibold text-emerald-900">{item.label}</p><p className="font-bold text-emerald-800">{formatUSD(item.amount)}</p></div><p className="mt-2 text-xs leading-5 text-emerald-800/70">{item.id} · {item.description}</p></div>)}</div>
      </section>

      <section className="mt-9 grid gap-5 lg:grid-cols-[1fr_.8fr] break-inside-avoid">
        <div className="rounded-2xl border border-slate-200 p-5"><div className="flex items-center gap-3"><Building2 className="text-[#9b752c]" size={20} /><h2 className="font-semibold">Cálculo del inmueble</h2></div><dl className="mt-5 space-y-3 text-sm"><div className="flex justify-between gap-4"><dt className="text-slate-500">Gastos ordinarios por alícuota</dt><dd className="font-semibold">{formatUSD(ordinaryPropertyTotal)}</dd></div><div className="flex justify-between gap-4"><dt className="text-slate-500">Fondos, provisiones y cuotas</dt><dd className="font-semibold">+ {formatUSD(propertyAdjustmentsTotal)}</dd></div><div className="flex justify-between gap-4"><dt className="text-slate-500">Subtotal bruto del inmueble</dt><dd className="font-semibold">{formatUSD(grossPropertyTotal)}</dd></div><div className="flex justify-between gap-4 text-emerald-700"><dt>Créditos e ingresos aplicados</dt><dd className="font-semibold">− {formatUSD(Math.abs(creditsTotal))}</dd></div><div className="border-t border-slate-200 pt-3 text-xs leading-5 text-slate-400">Fórmula: total general distribuible × 1,2846%, menos créditos e ingresos aprobados a favor del inmueble.</div></dl></div>
        <div className="rounded-2xl bg-[#071a33] p-6 text-white"><p className="text-xs font-bold uppercase tracking-[.15em] text-[#f0cf77]">Monto total a pagar</p><p className="mt-3 text-4xl font-semibold tracking-[-.04em] text-[#f0cf77]">{formatUSD(propertyPayable)}</p><p className="mt-3 text-sm text-white/55">Apartamento B-402 · vence 31/07/2026</p><div className="mt-5 rounded-xl bg-white/[.06] p-3 text-xs leading-5 text-white/65"><p>Equivalente: <strong className="text-white">{formatVES(propertyPayableVES)}</strong></p><p className="mt-1">Tasa BCV aplicada: <strong className="text-white">{bcvRate.toFixed(4).replace('.', ',')} Bs/USD</strong> · referencia {bcvRateDate}.</p></div></div>
      </section>

      <section className="mt-9 border-t border-slate-200 pt-8 break-inside-avoid">
        <div className="flex items-center gap-3"><Landmark className="text-[#9b752c]" size={21} /><div><p className="text-xs font-bold uppercase tracking-[.14em] text-[#9b752c]">Datos de pago</p><h2 className="mt-1 text-xl font-semibold">Cuenta receptora del condominio</h2></div></div>
        <div className="mt-5 grid gap-4 md:grid-cols-2"><div className="rounded-2xl bg-[#f8f6f1] p-5"><p className="font-semibold">Transferencia bancaria</p><dl className="mt-4 space-y-2 text-sm"><div className="flex justify-between gap-3"><dt className="text-slate-400">Banco</dt><dd className="font-semibold">Banesco · 0134</dd></div><div className="flex justify-between gap-3"><dt className="text-slate-400">Cuenta corriente</dt><dd className="font-mono text-xs font-semibold">0134-0028-45-0281047691</dd></div><div className="flex justify-between gap-3"><dt className="text-slate-400">Titular</dt><dd className="text-right font-semibold">Condominio Caribbean Marina</dd></div><div className="flex justify-between gap-3"><dt className="text-slate-400">RIF</dt><dd className="font-semibold">J-41234567-8</dd></div></dl></div><div className="rounded-2xl bg-[#f8f6f1] p-5"><div className="flex items-center gap-2"><Smartphone size={18} className="text-[#9b752c]" /><p className="font-semibold">Pago móvil</p></div><dl className="mt-4 space-y-2 text-sm"><div className="flex justify-between gap-3"><dt className="text-slate-400">Banco</dt><dd className="font-semibold">Banesco · 0134</dd></div><div className="flex justify-between gap-3"><dt className="text-slate-400">Teléfono</dt><dd className="font-semibold">0414-555-0182</dd></div><div className="flex justify-between gap-3"><dt className="text-slate-400">Documento</dt><dd className="font-semibold">J-41234567-8</dd></div></dl></div></div>
        <div className="mt-4 flex gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900"><AlertCircle className="mt-0.5 shrink-0" size={18} /><p>Después de realizar el pago, repórtalo en CASA indicando la referencia bancaria. El saldo cambiará cuando la administración confirme la conciliación.</p></div>
      </section>

      <footer className="mt-10 flex flex-col gap-5 border-t border-slate-200 pt-7 text-center sm:flex-row sm:items-end sm:justify-between sm:text-left break-inside-avoid">
        <div><div className="inline-flex items-center gap-2"><span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#071a33] text-xs font-black text-[#f0cf77]">C</span><span className="text-lg font-black tracking-[.18em]">CASA</span></div><p className="mt-2 text-xs font-semibold text-slate-500">Central de Administración y Servicios Automatizados</p><p className="mt-1 text-xs text-[#9b752c]">Toda tu comunidad. Un solo sistema.</p></div><div className="text-xs leading-5 text-slate-400"><div className="flex items-center justify-center gap-2 sm:justify-end"><CheckCircle2 size={14} className="text-emerald-600" />Aviso emitido digitalmente el 19/07/2026</div><p className="mt-1">Identificador verificable: AC-2026-07-B402</p></div>
      </footer>
    </div>

    <button onClick={() => window.print()} className="no-print fixed bottom-5 right-5 z-40 inline-flex items-center gap-2 rounded-full bg-[#071a33] px-5 py-3 text-sm font-bold text-white shadow-2xl"><Printer size={17} />Imprimir aviso</button>
  </article>;
}
