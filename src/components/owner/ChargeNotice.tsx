import { useMemo } from 'react';
import { Landmark, Printer, ReceiptText, Smartphone } from 'lucide-react';

const aliquot = 1.2846;
const bcvRate = 151;
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

export interface ChargeNoticeProps {
  scope?: 'PROPERTY' | 'COMMUNITY';
  notice?: {
    id: string;
    billingPeriod: string;
    issuedAt: string;
    bcvRate?: number;
    totalExpensesVes?: number;
    totalComponentsVes?: number;
    totalCommunityVes?: number;
    totalCommunityUsd?: number;
    components: Array<{
      id: string;
      label: string;
      type: string;
      amountVes: number;
      propertyAmountVes: number;
      propertyAmountUsd: number;
      allocationMethod: 'ALIQUOT' | 'FIXED';
    }>;
    expenses?: Array<{
      id: string;
      description: string;
      amount: number;
      currency: string;
      propertyAmountVes: number;
      propertyAmountUsd: number;
      allocationMethod: 'ALIQUOT' | 'FIXED';
      concept: {
        id: string;
        name: string;
        category: {
          id: string;
          name: string;
        };
      };
    }>;
    allocation: {
      id: string;
      aliquotSnapshot: number;
      expenseShareVes: number;
      componentShareVes: number;
      totalVes: number;
      totalUsd: number;
    } | null;
  } | null;
  community?: {
    id?: string;
    name?: string;
    rif?: string;
    address?: string;
    city?: string;
    state?: string;
    phone?: string;
    bankAccounts?: Array<{
      id: string;
      bankName: string;
      holder: string;
      holderRif: string;
      accountNumber: string;
      accountType: string;
      currency: string;
    }>;
    paymentMethods?: Array<{
      id: string;
      type: string;
      label: string;
      currency: string;
      mobilePhone?: string | null;
      mobileDocument?: string | null;
      instructions?: string | null;
    }>;
  } | null;
  ownerName?: string;
  propertyCode?: string;
  towerName?: string;
  communityRif?: string;
  communityName?: string;
}

export default function ChargeNotice({
  notice,
  community,
  ownerName,
  propertyCode,
  towerName,
  communityRif,
  communityName,
  scope = 'PROPERTY',
}: ChargeNoticeProps) {
  const isDynamic = !!notice;
  const isCommunityScope = scope === 'COMMUNITY';
  const chargeTargetLabel = isCommunityScope ? 'Comunidad' : 'Tu inmueble';
  const dynamicBcvRate = isDynamic && notice?.bcvRate ? Number(notice.bcvRate) : bcvRate;

  const rawAliquot = isDynamic
    ? (notice?.allocation?.aliquotSnapshot ? Number(notice.allocation.aliquotSnapshot) : 0)
    : aliquot;
  const displayAliquot = rawAliquot;
  const dynamicAliquot = displayAliquot / 100;

  const propertyShare = (value: number) => {
    return value * dynamicAliquot;
  };

  const getExpenseUSD = (amount: number, currency: string) => {
    return currency === 'USD' ? amount : amount / dynamicBcvRate;
  };

  // Group and sort expenses by category for dynamic mode
  const dynamicCategories = useMemo(() => {
    if (!notice?.expenses) return [];
    const map: Record<string, { id: string; name: string; expenses: any[] }> = {};
    for (const exp of notice.expenses) {
      const cat = exp.concept.category;
      if (!map[cat.id]) {
        map[cat.id] = {
          id: cat.id,
          name: cat.name,
          expenses: [],
        };
      }
      map[cat.id].expenses.push({
        id: exp.id,
        description: exp.description,
        amount: exp.amount,
        currency: exp.currency,
        propertyAmountVes: exp.propertyAmountVes,
        propertyAmountUsd: exp.propertyAmountUsd,
        conceptName: exp.concept.name,
      });
    }
    return Object.values(map);
  }, [notice?.expenses]);

  // Let's compute totals
  const ordinaryPropertyTotal = isDynamic
    ? (notice!.allocation?.expenseShareVes ?? 0)
    : categories.reduce((sum, category) => sum + propertyShare(categoryTotal(category)), 0);

  // In dynamic mode, we display the notice allocations directly
  const propertyPayable = isDynamic
    ? (notice!.allocation?.totalUsd ?? 0)
    : (ordinaryPropertyTotal + adjustments.reduce((s, i) => s + (i.applies ? i.propertyAmount : 0), 0) + credits.reduce((s, i) => s + i.amount, 0) + (showIncomeInChargeNotice ? communityIncome.amount : 0));

  const propertyPayableVES = isDynamic
    ? (notice!.allocation?.totalVes ?? 0)
    : propertyPayable * bcvRate;

  const appliedAdjustments = adjustments.filter(item => item.applies && (item.communityAmount > 0 || item.propertyAmount > 0));

  const propertyAdjustmentsTotal = appliedAdjustments.reduce((sum, item) => sum + item.propertyAmount, 0);
  const grossPropertyTotal = isDynamic
    ? (notice!.allocation?.totalVes ?? (ordinaryPropertyTotal + (notice!.allocation?.componentShareVes ? Number(notice.allocation.componentShareVes) : 0)))
    : (ordinaryPropertyTotal + propertyAdjustmentsTotal);

  return (
    <article id="charge-notice" className="overflow-hidden rounded-[1.5rem] border border-[#0b1d33]/10 bg-white shadow-[0_20px_60px_rgba(8,29,51,.06)] print:rounded-none print:border-0 print:shadow-none print:m-0 print:p-0">
      <style>{`
        @media print {
          @page {
            size: letter;
            margin: 0.3cm;
          }
          body {
            background: white !important;
            color: #0b1d33 !important;
            font-size: 10px !important;
          }
          #charge-notice {
            border: 0 !important;
            box-shadow: none !important;
            margin: 0 !important;
            padding: 0 !important;
            width: 100% !important;
          }
          .no-print {
            display: none !important;
          }
          .charge-section {
            margin-top: 0.6rem !important;
          }
          .charge-category {
            border-radius: 0.5rem !important;
          }
          td, th {
            padding: 4px 6px !important;
          }
        }
      `}</style>

      <header className="relative overflow-hidden bg-[#0b1d33] px-5 py-5 text-white sm:px-7 sm:py-6 print:bg-white print:px-0 print:text-[#0b1d33]">
        <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-[#d6af57]/10 blur-2xl print:hidden" />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-[#e6c66f]/35 bg-white/10 text-sm font-black tracking-[-.08em] text-[#f0cf77] print:border-[#0b1d33]/15 print:bg-[#0b1d33]">CM</div>
            <div>
              <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#f0cf77] print:text-[#9b752c]">{communityName || community?.name || 'Condominio Caribbean Marina'}</p>
              <h1 className="mt-0.5 text-base font-semibold">{communityName || community?.name || 'Condominio Caribbean Marina'}</h1>
              <p className="mt-0.5 text-[11px] text-white/65 print:text-slate-500">RIF {communityRif || community?.rif || 'No registrado'}{community?.address ? ` · ${community.address}, ${[community.city, community.state].filter(Boolean).join(', ')}` : ''}{community?.phone ? ` · Tel. ${community.phone}` : ''}</p>
            </div>
          </div>
          <div className="sm:text-right">
            <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#f0cf77] print:text-[#9b752c]">Aviso de cobro</p>
            <p className="mt-1 text-lg font-semibold">{notice?.billingPeriod || 'Julio 2026'}</p>
            <p className="mt-0.5 font-mono text-[10px] text-white/45 print:text-slate-500">{notice?.id || 'AC-2026-07-B402'}</p>
          </div>
        </div>
        <div className="relative mt-5 grid gap-3 border-t border-white/10 pt-4 text-xs sm:grid-cols-4 print:border-slate-200">
          <div><p className="text-white/45 print:text-slate-400">{isCommunityScope ? 'Alcance' : 'Propietario'}</p><p className="mt-0.5 font-semibold">{ownerName || (isDynamic ? 'No registrado' : 'Alejandro Mendoza R.')}</p></div>
          <div><p className="text-white/45 print:text-slate-400">{isCommunityScope ? 'Inmuebles incluidos' : 'Inmueble'}</p><p className="mt-0.5 font-semibold">{isCommunityScope ? 'Todos los inmuebles' : `${towerName || 'Torre B'} · Apto. ${propertyCode || 'B-402'}`}</p></div>
          <div><p className="text-white/45 print:text-slate-400">{isCommunityScope ? 'Distribución' : 'Alícuota'}</p><p className="mt-0.5 font-semibold">{isCommunityScope ? 'Totales comunitarios' : `${displayAliquot.toFixed(4).replace('.', ',')}%`}</p></div>
          <div><p className="text-white/45 print:text-slate-400">Fecha de vencimiento</p><p className="mt-0.5 font-semibold text-[#f0cf77] print:text-[#9b752c]">{notice?.issuedAt ? new Date(new Date(notice.issuedAt).getTime() + 15 * 24 * 60 * 60 * 1000).toLocaleDateString('es-VE') : isDynamic ? 'Pendiente de emisión' : '31 de julio de 2026'}</p></div>
        </div>
      </header>

      <div className="p-5 sm:p-7 print:p-0 print:pt-4">
        <section className="charge-section mt-1">
          <div className="flex items-start gap-2.5">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#f1eadb] text-[#9b752c]"><ReceiptText size={16} /></span>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[.16em] text-[#9b752c]">01 · Detalle de Gastos de la Comunidad</p>
              <p className="text-xs text-slate-500">Gastos ordinarios del condominio correspondientes al periodo corriente.</p>
            </div>
          </div>
          <div className="mt-3.5 space-y-3">
            {isDynamic && notice.expenses && notice.expenses.length > 0 ? (
              dynamicCategories.map((category) => {
                const totalUSD = category.expenses.reduce((sum, e) => sum + getExpenseUSD(e.amount, e.currency), 0);
                return (
                  <section key={category.id} className="charge-category overflow-hidden rounded-xl border border-slate-200 break-inside-avoid">
                    <header className="grid gap-2 bg-[#f8f6f1] p-3 sm:grid-cols-[100px_1fr_auto_auto] sm:items-center">
                      <p className="font-mono text-[10px] font-bold text-[#9b752c]">{category.id.slice(-7).toUpperCase()}</p>
                      <div><h3 className="font-semibold text-xs text-slate-800">{category.name}</h3></div>
                      <div className="sm:text-right"><p className="text-[9px] uppercase tracking-wider text-slate-400">Total mes</p><p className="text-xs font-bold">{formatUSD(totalUSD)}</p></div>
                      <div className="sm:text-right"><p className="text-[9px] uppercase tracking-wider text-slate-400">{chargeTargetLabel}</p><p className="text-xs font-bold text-[#9b752c]">{formatUSD(category.expenses.reduce((sum, expense) => sum + expense.propertyAmountUsd, 0))}</p></div>
                    </header>
                    <div className="charge-scroll overflow-x-auto">
                      <table className="charge-expense-table w-full min-w-[600px] text-left text-xs">
                        <thead className="border-y border-slate-100 bg-white text-[9px] font-bold uppercase tracking-[.12em] text-slate-400">
                          <tr>
                            <th className="px-3 py-1.5">Concepto</th>
                            <th className="px-3 py-1.5 text-right">Total mes</th>
                            <th className="px-3 py-1.5 text-right">{chargeTargetLabel}</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {category.expenses.map((expense) => {
                            const usdAmount = getExpenseUSD(expense.amount, expense.currency);
                            return (
                              <tr key={expense.id}>
                                <td className="px-3 py-1.5 font-semibold text-slate-800">
                                  <span className="font-bold text-[#0b1d33]">{expense.conceptName}</span>
                                  {expense.description ? <span className="text-slate-500 font-normal"> — {expense.description}</span> : null}
                                </td>
                                <td className="px-3 py-1.5 text-right font-semibold">{formatUSD(usdAmount)}</td>
                                <td className="px-3 py-1.5 text-right font-bold text-[#9b752c]">{formatUSD(expense.propertyAmountUsd)}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </section>
                );
              })
            ) : isDynamic ? (
              <div className="rounded-xl border border-dashed border-slate-200 p-6 text-center text-slate-500 bg-white">
                No hay gastos ordinarios registrados para este periodo.
              </div>
            ) : (
              categories.map((category) => {
                const total = categoryTotal(category);
                return (
                  <section key={category.id} className="charge-category overflow-hidden rounded-xl border border-slate-200 break-inside-avoid">
                    <header className="grid gap-2 bg-[#f8f6f1] p-3 sm:grid-cols-[100px_1fr_auto_auto] sm:items-center">
                      <p className="font-mono text-[10px] font-bold text-[#9b752c]">{category.id}</p>
                      <div><h3 className="font-semibold text-xs text-slate-800">{category.name}</h3></div>
                      <div className="sm:text-right"><p className="text-[9px] uppercase tracking-wider text-slate-400">Total mes</p><p className="text-xs font-bold">{formatUSD(total)}</p></div>
                      <div className="sm:text-right"><p className="text-[9px] uppercase tracking-wider text-slate-400">{chargeTargetLabel}</p><p className="text-xs font-bold text-[#9b752c]">{formatUSD(propertyShare(total))}</p></div>
                    </header>
                    <div className="charge-scroll overflow-x-auto">
                      <table className="charge-expense-table w-full min-w-[600px] text-left text-xs">
                        <thead className="border-y border-slate-100 bg-white text-[9px] font-bold uppercase tracking-[.12em] text-slate-400">
                          <tr>
                            <th className="px-3 py-1.5">Concepto</th>
                            <th className="px-3 py-1.5 text-right">Total mes</th>
                            <th className="px-3 py-1.5 text-right">{chargeTargetLabel}</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {category.expenses.map((expense) => (
                            <tr key={expense.id}>
                              <td className="px-3 py-1.5 font-semibold text-slate-800">{expense.description}</td>
                              <td className="px-3 py-1.5 text-right font-semibold">{formatUSD(expense.monthlyTotal)}</td>
                              <td className="px-3 py-1.5 text-right font-bold text-[#9b752c]">{formatUSD(propertyShare(expense.monthlyTotal))}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </section>
                );
              })
            )}
          </div>
        </section>

        {/* Dynamic Components/Special Funds (Requirement 1) */}
        {isDynamic && notice.components && notice.components.length > 0 && (
          <section className="charge-section mt-5">
            <div className="flex items-start gap-2.5">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#f1eadb] text-[#9b752c]"><Landmark size={16} /></span>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[.16em] text-[#9b752c]">02 · Fondo de reserva, cuotas y otros</p>
                <p className="text-xs text-slate-500">Aportes a fondo de reserva y otros conceptos adicionales al gasto ordinario.</p>
              </div>
            </div>
            <div className="mt-3.5 space-y-3">
              <section className="charge-category overflow-hidden rounded-xl border border-slate-200 break-inside-avoid">
                <div className="charge-scroll overflow-x-auto">
                  <table className="charge-expense-table w-full min-w-[600px] text-left text-xs">
                    <thead className="border-b border-slate-100 bg-[#fbfaf7] text-[9px] font-bold uppercase tracking-[.12em] text-slate-400">
                      <tr>
                        <th className="px-3 py-2">Fondo / Componente</th>
                        <th className="px-3 py-2">Tipo</th>
                        <th className="px-3 py-2 text-right">Total Comunidad</th>
                        <th className="px-3 py-2 text-right">{chargeTargetLabel}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {notice.components.map((c) => {
                        return (
                          <tr key={c.id}>
                            <td className="px-3 py-1.5 font-semibold text-slate-800">{c.label}</td>
                            <td className="px-3 py-1.5 font-mono text-[10px] text-slate-400">{c.type}</td>
                            <td className="px-3 py-1.5 text-right font-semibold text-slate-700">{formatUSD(c.amountVes / dynamicBcvRate)}</td>
                            <td className="px-3 py-1.5 text-right font-bold text-[#9b752c]">{formatUSD(c.propertyAmountUsd)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </section>
            </div>
          </section>
        )}

        {/* Totales Resumidos del Periodo */}
        <section className="charge-totals mt-3.5 grid gap-3 sm:grid-cols-2 break-inside-avoid">
          <div className="rounded-xl border border-[#d8c28e] bg-[#faf6ec] p-3 text-[#0b1d33]">
            <p className="text-[9px] font-bold uppercase tracking-[.14em] text-[#85631f]">{chargeTargetLabel}</p>
            <p className="mt-1 text-lg font-bold text-[#8c6b28]">
              {isDynamic ? formatUSD(isCommunityScope ? Number(notice.totalExpensesVes ?? ordinaryPropertyTotal) / dynamicBcvRate : (notice.expenses ?? []).reduce((sum, expense) => sum + expense.propertyAmountUsd, 0)) : formatUSD(grossPropertyTotal)}
            </p>
            <p className="mt-0.5 text-[10px] text-[#85631f]">
              {isDynamic ? `Ref: ${formatVES(ordinaryPropertyTotal)}` : 'Cuota asignada'}
            </p>
          </div>
          <div className="rounded-xl bg-[#071a33] p-3 text-white">
            <p className="text-[9px] font-bold uppercase tracking-[.14em] text-[#f0cf77]">Monto a pagar</p>
            <p className="mt-1 text-lg font-bold text-[#f0cf77]">{formatUSD(propertyPayable)}</p>
            <p className="mt-0.5 text-[10px] text-white/55">
              <span>Ref: {formatVES(propertyPayableVES)}</span>
            </p>
          </div>
        </section>

        {/* Cuentas Receptoras */}
        <section className="mt-4 border-t border-slate-100 pt-4 break-inside-avoid">
          <div className="flex items-center gap-2">
            <Landmark className="text-[#9b752c]" size={18} />
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[.14em] text-[#9b752c]">Datos de pago</p>
              <p className="text-xs text-slate-500">Realiza tu depósito y repórtalo en el portal de propietarios.</p>
            </div>
          </div>
          
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            {/* Transferencias */}
            <div className="rounded-xl bg-[#fbfaf7] border border-slate-200/60 p-4">
              <p className="font-bold text-xs text-[#0b1d33] mb-2.5">Transferencia Bancaria</p>
              {community?.bankAccounts && community.bankAccounts.length > 0 ? (
                <div className="space-y-3.5">
                  {community.bankAccounts.slice(0, 2).map((b) => (
                    <dl key={b.id} className="space-y-1 text-xs">
                      <div className="flex justify-between"><dt className="text-slate-400">Banco:</dt><dd className="font-semibold text-slate-700">{b.bankName}</dd></div>
                      <div className="flex justify-between"><dt className="text-slate-400">Cuenta Corriente:</dt><dd className="font-mono text-slate-800 font-bold select-all">{b.accountNumber}</dd></div>
                      <div className="flex justify-between"><dt className="text-slate-400">Titular:</dt><dd className="font-semibold text-slate-700 truncate max-w-[170px]">{b.holder}</dd></div>
                      <div className="flex justify-between"><dt className="text-slate-400">Cédula / RIF:</dt><dd className="font-semibold text-slate-700">{b.holderRif}</dd></div>
                    </dl>
                  ))}
                </div>
              ) : isDynamic ? (
                <p className="text-xs text-slate-500">No hay cuentas bancarias activas registradas.</p>
              ) : (
                <dl className="space-y-1 text-xs">
                  <div className="flex justify-between"><dt className="text-slate-400">Banco:</dt><dd className="font-semibold text-slate-700">Banesco · 0134</dd></div>
                  <div className="flex justify-between"><dt className="text-slate-400">Cuenta Corriente:</dt><dd className="font-mono text-slate-800 font-bold select-all">0134-0028-45-0281047691</dd></div>
                  <div className="flex justify-between"><dt className="text-slate-400">Titular:</dt><dd className="font-semibold text-slate-700">Condominio Caribbean Marina</dd></div>
                  <div className="flex justify-between"><dt className="text-slate-400">RIF:</dt><dd className="font-semibold text-slate-700">{communityRif || 'J-41234567-8'}</dd></div>
                </dl>
              )}
            </div>

            {/* Pago Móvil */}
            <div className="rounded-xl bg-[#fbfaf7] border border-slate-200/60 p-4">
              <div className="flex items-center gap-1.5 mb-2.5">
                <Smartphone size={15} className="text-[#9b752c]" />
                <p className="font-bold text-xs text-[#0b1d33]">Pago Móvil Interbancario</p>
              </div>
              {community?.paymentMethods && community.paymentMethods.some(p => p.type === 'MOBILE_PAYMENT') ? (
                <div className="space-y-3.5">
                  {community.paymentMethods.filter(p => p.type === 'MOBILE_PAYMENT').slice(0, 2).map((p) => (
                    <dl key={p.id} className="space-y-1 text-xs">
                      <div className="flex justify-between"><dt className="text-slate-400">Banco / Destino:</dt><dd className="font-semibold text-slate-700">{p.label}</dd></div>
                      <div className="flex justify-between"><dt className="text-slate-400">Teléfono:</dt><dd className="font-semibold text-slate-800 font-bold select-all">{p.mobilePhone}</dd></div>
                      <div className="flex justify-between"><dt className="text-slate-400">Cédula / RIF:</dt><dd className="font-semibold text-slate-700">{p.mobileDocument}</dd></div>
                    </dl>
                  ))}
                </div>
              ) : isDynamic ? (
                <p className="text-xs text-slate-500">No hay métodos de pago móvil activos registrados.</p>
              ) : (
                <dl className="space-y-1 text-xs">
                  <div className="flex justify-between"><dt className="text-slate-400">Banco:</dt><dd className="font-semibold text-slate-700">Banesco · 0134</dd></div>
                  <div className="flex justify-between"><dt className="text-slate-400">Teléfono:</dt><dd className="font-semibold text-slate-800 font-bold select-all">0414-555-0182</dd></div>
                  <div className="flex justify-between"><dt className="text-slate-400">RIF / Cédula:</dt><dd className="font-semibold text-slate-700">{communityRif || 'J-41234567-8'}</dd></div>
                </dl>
              )}
            </div>
          </div>
        </section>

        <footer className="mt-6 flex flex-col gap-4 border-t border-slate-200 pt-5 text-center sm:flex-row sm:items-end sm:justify-between sm:text-left break-inside-avoid text-[11px] text-slate-400">
          <div>
            <div className="inline-flex items-center gap-1.5">
              <span className="flex h-6 w-6 items-center justify-center rounded bg-[#071a33] text-[10px] font-black text-[#f0cf77]">C</span>
              <span className="text-sm font-black tracking-[.18em] text-[#0b1d33]">CASA</span>
            </div>
            <p className="mt-1 font-semibold text-slate-500">Central de Administración y Servicios Automatizados · Aviso emitido digitalmente</p>
          </div>
          <div className="sm:text-right">
            <p className="font-mono text-[10px]">{notice?.id || 'AC-2026-07-B402'}</p>
          </div>
        </footer>
      </div>

      <button onClick={() => window.print()} className="no-print fixed bottom-5 right-5 z-40 inline-flex items-center gap-2 rounded-full bg-[#071a33] px-5 py-3 text-sm font-bold text-white shadow-2xl hover:bg-[#14365d] transition cursor-pointer">
        <Printer size={17} /> Imprimir aviso
      </button>
    </article>
  );
}
