import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowRight,
  BadgeCheck,
  Bell,
  Building2,
  CalendarDays,
  Check,
  ChevronRight,
  ClipboardCheck,
  CreditCard,
  FileCheck2,
  FileText,
  HandCoins,
  Home,
  Landmark,
  LogOut,
  Menu,
  MessageSquareWarning,
  Newspaper,
  PieChart,
  Plus,
  ReceiptText,
  ShieldCheck,
  Smartphone,
  UserRound,
  Users,
  Video,
  Vote,
  X,
} from 'lucide-react';

type PortalSection = 'inicio' | 'finanzas' | 'pagos' | 'inmueble' | 'familia' | 'autorizaciones' | 'incidencias' | 'comunidad' | 'reuniones' | 'participacion' | 'perfil';

const navItems = [
  { id: 'inicio', label: 'Inicio', icon: Home },
  { id: 'finanzas', label: 'Estado de cuenta', icon: ReceiptText },
  { id: 'pagos', label: 'Reportar pago', icon: HandCoins },
  { id: 'inmueble', label: 'Mi apartamento', icon: Building2 },
  { id: 'familia', label: 'Carga familiar', icon: Users },
  { id: 'autorizaciones', label: 'Autorizaciones', icon: FileCheck2 },
  { id: 'incidencias', label: 'Incidencias', icon: MessageSquareWarning },
  { id: 'comunidad', label: 'Comunidad', icon: Newspaper },
  { id: 'reuniones', label: 'Asambleas y reuniones', icon: Video },
  { id: 'participacion', label: 'Consultas y elecciones', icon: Vote },
  { id: 'perfil', label: 'Mi perfil y pagos', icon: UserRound },
] as const;

const movements = [
  { date: '01 Jul 2026', detail: 'Cuota de condominio · Julio', charge: '$185,00', payment: '—', balance: '$185,00' },
  { date: '16 Jun 2026', detail: 'Pago confirmado · Ref. 839204', charge: '—', payment: '$180,00', balance: '$0,00' },
  { date: '01 Jun 2026', detail: 'Cuota de condominio · Junio', charge: '$180,00', payment: '—', balance: '$180,00' },
  { date: '14 May 2026', detail: 'Pago confirmado · Ref. 105781', charge: '—', payment: '$178,00', balance: '$0,00' },
];

const family = [
  { name: 'Mariana Pérez', relation: 'Cónyuge', document: 'V-14.562.881', status: 'Verificada' },
  { name: 'Sofía Mendoza', relation: 'Hija', document: 'V-31.709.214', status: 'Verificada' },
  { name: 'Mateo Mendoza', relation: 'Hijo', document: 'V-33.105.712', status: 'Pendiente' },
];

function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <section className={`rounded-3xl border border-[#0b1d33]/8 bg-white shadow-[0_12px_40px_rgba(8,29,51,0.045)] ${className}`}>{children}</section>;
}

function SectionTitle({ eyebrow, title, description, action }: { eyebrow: string; title: string; description?: string; action?: React.ReactNode }) {
  return (
    <header className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#a47f32]">{eyebrow}</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[#0b1d33]">{title}</h1>
        {description && <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">{description}</p>}
      </div>
      {action}
    </header>
  );
}

function Pill({ children, tone = 'green' }: { children: React.ReactNode; tone?: 'green' | 'amber' | 'blue' | 'red' }) {
  const colors = { green: 'bg-emerald-50 text-emerald-700', amber: 'bg-amber-50 text-amber-700', blue: 'bg-sky-50 text-sky-700', red: 'bg-red-50 text-red-700' };
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${colors[tone]}`}>{children}</span>;
}

export default function OwnerPortal() {
  const [active, setActive] = useState<PortalSection>('inicio');
  const [menuOpen, setMenuOpen] = useState(false);
  const [toast, setToast] = useState('');
  const [vote, setVote] = useState<string | null>(null);
  const [incidentStatus, setIncidentStatus] = useState('En seguimiento');

  const title = useMemo(() => navItems.find((item) => item.id === active)?.label ?? 'Inicio', [active]);
  const notify = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(''), 3200);
  };
  const go = (section: PortalSection) => {
    setActive(section);
    setMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderOverview = () => (
    <>
      <SectionTitle eyebrow="Resumen del propietario" title="Buenos días, Alejandro" description="Todo lo importante de tu apartamento y comunidad, en un solo lugar." />
      <div className="grid gap-5 xl:grid-cols-[1.25fr_0.75fr]">
        <Card className="overflow-hidden bg-[#0b1d33] text-white">
          <div className="relative p-7 sm:p-9">
            <div className="absolute right-0 top-0 h-48 w-48 rounded-full bg-[#d6af57]/15 blur-3xl" />
            <div className="relative flex flex-col justify-between gap-8 sm:flex-row sm:items-start">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#f0cf77]">Cuota pendiente · Julio</p>
                <p className="mt-4 text-5xl font-semibold tracking-tight">$185,00</p>
                <p className="mt-3 text-sm text-white/65">Vence el 31 de julio de 2026</p>
              </div>
              <div className="w-fit rounded-2xl border border-white/10 bg-white/8 px-4 py-3">
                <p className="text-xs text-white/55">Equivalente referencial</p>
                <p className="mt-1 font-semibold">Bs. 27.935,00</p>
              </div>
            </div>
            <div className="relative mt-8 flex flex-wrap gap-3">
              <button onClick={() => go('pagos')} className="rounded-full bg-[#f0cf77] px-5 py-3 text-sm font-bold text-[#0b1d33] transition hover:bg-white">Reportar pago</button>
              <button onClick={() => go('finanzas')} className="rounded-full border border-white/20 px-5 py-3 text-sm font-bold transition hover:bg-white/10">Ver estado de cuenta</button>
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-start justify-between">
            <div><p className="text-xs font-bold uppercase tracking-[0.2em] text-[#a47f32]">Tu inmueble</p><h2 className="mt-2 text-xl font-semibold">Apartamento B-402</h2></div>
            <div className="rounded-2xl bg-[#f8f3e8] p-3 text-[#a47f32]"><Building2 size={22} /></div>
          </div>
          <dl className="mt-6 grid grid-cols-2 gap-4 text-sm">
            <div><dt className="text-slate-400">Alícuota</dt><dd className="mt-1 font-bold">1,2846%</dd></div>
            <div><dt className="text-slate-400">Torre</dt><dd className="mt-1 font-bold">B · Coral</dd></div>
            <div><dt className="text-slate-400">Puestos</dt><dd className="mt-1 font-bold">P-114 / P-115</dd></div>
            <div><dt className="text-slate-400">Solvencia</dt><dd className="mt-1"><Pill tone="amber">Pendiente</Pill></dd></div>
          </dl>
          <button onClick={() => go('inmueble')} className="mt-6 flex items-center gap-2 text-sm font-bold text-[#0b1d33]">Ver detalles <ArrowRight size={16} /></button>
        </Card>
      </div>
      <div className="mt-5 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {[
          { label: 'Autorizaciones activas', value: '2', detail: '1 vence esta semana', icon: ShieldCheck, to: 'autorizaciones' as PortalSection },
          { label: 'Incidencias abiertas', value: '1', detail: 'En seguimiento', icon: MessageSquareWarning, to: 'incidencias' as PortalSection },
          { label: 'Próxima asamblea', value: '16 Ago', detail: 'Convocatoria publicada', icon: Video, to: 'reuniones' as PortalSection },
          { label: 'Consulta disponible', value: '1', detail: 'Participa hasta el 24 Jul', icon: Vote, to: 'participacion' as PortalSection },
        ].map((item) => <button key={item.label} onClick={() => go(item.to)} className="rounded-3xl border border-[#0b1d33]/8 bg-white p-6 text-left shadow-[0_12px_40px_rgba(8,29,51,0.04)] transition hover:-translate-y-0.5 hover:border-[#b08a3c]/40"><item.icon className="text-[#b08a3c]" size={22} /><p className="mt-5 text-sm text-slate-500">{item.label}</p><p className="mt-1 text-3xl font-semibold">{item.value}</p><p className="mt-2 text-xs text-slate-400">{item.detail}</p></button>)}
      </div>
      <div className="mt-5 grid gap-5 xl:grid-cols-2">
        <Card className="p-6"><div className="flex items-center justify-between"><h2 className="text-lg font-semibold">Avisos importantes</h2><Bell size={19} className="text-[#b08a3c]" /></div><div className="mt-5 space-y-4"><div className="rounded-2xl border border-amber-200 bg-amber-50 p-4"><Pill tone="amber">Cobro pendiente</Pill><p className="mt-3 font-semibold">Cuota de condominio · Julio 2026</p><p className="mt-1 text-sm text-slate-500">Monto: $185,00 · Vence el 31 de julio.</p></div><div className="rounded-2xl bg-slate-50 p-4"><p className="font-semibold">Mantenimiento programado del ascensor</p><p className="mt-1 text-sm text-slate-500">Torre B · 22 de julio, 9:00 a. m.</p></div></div></Card>
        <Card className="p-6"><div className="flex items-center justify-between"><h2 className="text-lg font-semibold">Noticias de la comunidad</h2><Newspaper size={19} className="text-[#b08a3c]" /></div><div className="mt-5 space-y-5"><article><p className="text-xs font-bold uppercase tracking-wider text-[#a47f32]">Comunidad · 18 Jul</p><h3 className="mt-2 font-semibold">Avances del plan de paisajismo de áreas comunes</h3><p className="mt-1 text-sm leading-6 text-slate-500">Conoce las mejoras realizadas durante la primera fase.</p></article><div className="h-px bg-slate-100" /><article><p className="text-xs font-bold uppercase tracking-wider text-[#a47f32]">Administración · 15 Jul</p><h3 className="mt-2 font-semibold">Nuevo horario de atención al propietario</h3></article></div><button onClick={() => go('comunidad')} className="mt-6 text-sm font-bold">Ver todas las noticias →</button></Card>
      </div>
    </>
  );

  const renderFinances = () => (
    <><SectionTitle eyebrow="Finanzas" title="Estado de cuenta" description="Consulta cargos, pagos confirmados y documentos de tu inmueble." action={<button onClick={() => notify('Estado de cuenta preparado para descargar.')} className="rounded-full border border-[#0b1d33]/15 bg-white px-5 py-3 text-sm font-bold"><FileText className="mr-2 inline" size={16} />Descargar PDF</button>} />
      <div className="grid gap-5 md:grid-cols-3"><Card className="p-6"><p className="text-sm text-slate-500">Saldo pendiente</p><p className="mt-2 text-3xl font-semibold text-amber-700">$185,00</p></Card><Card className="p-6"><p className="text-sm text-slate-500">Último pago</p><p className="mt-2 text-3xl font-semibold">$180,00</p><p className="mt-2 text-xs text-slate-400">16 Jun 2026</p></Card><Card className="p-6"><p className="text-sm text-slate-500">Avisos vencidos</p><p className="mt-2 text-3xl font-semibold">0</p><Pill>Al día</Pill></Card></div>
      <Card className="mt-5 overflow-hidden"><div className="border-b border-slate-100 p-6"><h2 className="font-semibold">Movimientos recientes</h2></div><div className="overflow-x-auto"><table className="w-full min-w-[720px] text-left text-sm"><thead className="bg-[#faf9f6] text-xs uppercase tracking-wider text-slate-400"><tr>{['Fecha', 'Descripción', 'Cargo', 'Pago', 'Saldo'].map((h) => <th key={h} className="px-6 py-4 font-bold">{h}</th>)}</tr></thead><tbody className="divide-y divide-slate-100">{movements.map((m) => <tr key={`${m.date}-${m.detail}`}><td className="px-6 py-5 text-slate-500">{m.date}</td><td className="px-6 py-5 font-semibold">{m.detail}</td><td className="px-6 py-5">{m.charge}</td><td className="px-6 py-5 text-emerald-700">{m.payment}</td><td className="px-6 py-5 font-bold">{m.balance}</td></tr>)}</tbody></table></div></Card>
      <Card className="mt-5 border-amber-200 bg-amber-50 p-6"><div className="flex gap-4"><AlertTriangle className="shrink-0 text-amber-700" /><div><h2 className="font-semibold text-amber-900">Avisos de cobro vencidos</h2><p className="mt-1 text-sm leading-6 text-amber-800/75">No tienes avisos vencidos. Tu única cuota pendiente corresponde al mes en curso.</p></div></div></Card></>
  );

  const renderPayments = () => (
    <><SectionTitle eyebrow="Pagos" title="Reportar un pago" description="Registra tu transferencia o pago móvil para que la administración pueda validarlo." />
      <div className="grid gap-5 xl:grid-cols-[1fr_0.8fr]"><Card className="p-6 sm:p-8"><form onSubmit={(e) => { e.preventDefault(); notify('Pago reportado. Recibirás una notificación al ser validado.'); }} className="grid gap-5 sm:grid-cols-2"><label className="text-sm font-semibold">Método<select className="mt-2 w-full rounded-2xl border border-slate-200 bg-[#fbfaf7] px-4 py-3 font-normal outline-none"><option>Transferencia bancaria</option><option>Pago móvil</option><option>Depósito</option></select></label><label className="text-sm font-semibold">Monto<input defaultValue="185,00" className="mt-2 w-full rounded-2xl border border-slate-200 bg-[#fbfaf7] px-4 py-3 font-normal outline-none" /></label><label className="text-sm font-semibold">Fecha<input type="date" defaultValue="2026-07-19" className="mt-2 w-full rounded-2xl border border-slate-200 bg-[#fbfaf7] px-4 py-3 font-normal outline-none" /></label><label className="text-sm font-semibold">Referencia<input required placeholder="Últimos 6 dígitos" className="mt-2 w-full rounded-2xl border border-slate-200 bg-[#fbfaf7] px-4 py-3 font-normal outline-none" /></label><label className="text-sm font-semibold sm:col-span-2">Comprobante<button type="button" onClick={() => notify('Comprobante adjunto en modo demo.')} className="mt-2 flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-[#b08a3c]/60 bg-[#f8f3e8] px-4 py-8 text-[#8c6b28]"><Plus size={18} /> Adjuntar imagen o PDF</button></label><button className="rounded-full bg-[#0b1d33] px-6 py-3.5 text-sm font-bold text-white sm:col-span-2">Enviar reporte de pago</button></form></Card>
      <div className="space-y-5"><Card className="p-6"><Landmark className="text-[#b08a3c]" /><h2 className="mt-4 font-semibold">Datos para transferencia</h2><dl className="mt-4 space-y-3 text-sm"><div><dt className="text-slate-400">Banco</dt><dd className="font-semibold">Banesco · Cuenta corriente</dd></div><div><dt className="text-slate-400">Cuenta</dt><dd className="font-semibold">0134-0028-45-0281047691</dd></div><div><dt className="text-slate-400">RIF</dt><dd className="font-semibold">J-41234567-8</dd></div><div><dt className="text-slate-400">Titular</dt><dd className="font-semibold">Condominio Caribbean Marina</dd></div></dl></Card><Card className="p-6"><Smartphone className="text-[#b08a3c]" /><h2 className="mt-4 font-semibold">Pago móvil</h2><p className="mt-3 text-sm leading-6 text-slate-500">Banesco (0134) · J-41234567-8<br />Teléfono: 0414-555-0182</p></Card></div></div></>
  );

  const renderProperty = () => (
    <><SectionTitle eyebrow="Patrimonio" title="Apartamento B-402" description="Información registral y participación del inmueble en el condominio." /><div className="grid gap-5 xl:grid-cols-[1fr_0.8fr]"><Card className="p-7"><div className="flex h-48 items-end rounded-3xl bg-gradient-to-br from-[#0b1d33] to-[#23507a] p-6 text-white"><div><p className="text-xs uppercase tracking-[0.2em] text-[#f0cf77]">Torre B · Coral</p><p className="mt-2 text-2xl font-semibold">Piso 4 · Apto. B-402</p></div></div><dl className="mt-6 grid gap-5 sm:grid-cols-2"><div><dt className="text-sm text-slate-400">Área total</dt><dd className="mt-1 font-bold">128,40 m²</dd></div><div><dt className="text-sm text-slate-400">Alícuota</dt><dd className="mt-1 font-bold">1,2846%</dd></div><div><dt className="text-sm text-slate-400">Habitaciones</dt><dd className="mt-1 font-bold">3 + servicio</dd></div><div><dt className="text-sm text-slate-400">Estacionamientos</dt><dd className="mt-1 font-bold">P-114 / P-115</dd></div><div><dt className="text-sm text-slate-400">Maletero</dt><dd className="mt-1 font-bold">M-B-22</dd></div><div><dt className="text-sm text-slate-400">Documento</dt><dd className="mt-1 font-bold">Registrado y verificado</dd></div></dl></Card><div className="space-y-5"><Card className="p-6"><PieChart className="text-[#b08a3c]" /><h2 className="mt-4 font-semibold">¿Qué es la alícuota?</h2><p className="mt-3 text-sm leading-6 text-slate-500">Es el porcentaje asignado a tu apartamento para distribuir los gastos comunes y calcular tu participación en decisiones del condominio.</p></Card><Card className="p-6"><BadgeCheck className="text-emerald-600" /><h2 className="mt-4 font-semibold">Propiedad verificada</h2><p className="mt-2 text-sm text-slate-500">Titular: Alejandro Mendoza R.<br />Documento actualizado el 12 Mar 2026.</p></Card></div></div></>
  );

  const renderFamily = () => (
    <><SectionTitle eyebrow="Núcleo familiar" title="Carga familiar" description="Personas vinculadas a tu apartamento y habilitadas ante el condominio." action={<button onClick={() => notify('Formulario para agregar familiar abierto en modo demo.')} className="rounded-full bg-[#0b1d33] px-5 py-3 text-sm font-bold text-white"><Plus className="mr-2 inline" size={16} />Agregar persona</button>} /><div className="grid gap-4">{family.map((person) => <Card key={person.document} className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between"><div className="flex items-center gap-4"><div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#f8f3e8] font-bold text-[#9b752c]">{person.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}</div><div><h2 className="font-semibold">{person.name}</h2><p className="mt-1 text-sm text-slate-500">{person.relation} · {person.document}</p></div></div><div className="flex items-center gap-3"><Pill tone={person.status === 'Verificada' ? 'green' : 'amber'}>{person.status}</Pill><button aria-label={`Editar ${person.name}`} className="rounded-full border border-slate-200 p-2"><ChevronRight size={17} /></button></div></Card>)}</div></>
  );

  const renderAuthorizations = () => (
    <><SectionTitle eyebrow="Control de acceso" title="Autorizaciones" description="Gestiona accesos temporales de familiares, visitas, proveedores y vehículos." action={<button onClick={() => notify('Nueva autorización creada en modo demo.')} className="rounded-full bg-[#0b1d33] px-5 py-3 text-sm font-bold text-white"><Plus className="mr-2 inline" size={16} />Crear autorización</button>} /><div className="grid gap-5 md:grid-cols-2"><Card className="p-6"><div className="flex justify-between"><Pill>Activa</Pill><ShieldCheck className="text-[#b08a3c]" /></div><h2 className="mt-5 text-lg font-semibold">Carlos Ramírez</h2><p className="mt-1 text-sm text-slate-500">Visita · C.I. V-18.207.441</p><div className="mt-5 rounded-2xl bg-slate-50 p-4 text-sm"><p><b>Válida:</b> 19 Jul · 2:00 p. m. a 8:00 p. m.</p><p className="mt-2"><b>Vehículo:</b> Toyota · AB123CD</p></div><button onClick={() => notify('Código de acceso compartido.')} className="mt-5 text-sm font-bold">Compartir código →</button></Card><Card className="p-6"><div className="flex justify-between"><Pill tone="blue">Programada</Pill><CalendarDays className="text-[#b08a3c]" /></div><h2 className="mt-5 text-lg font-semibold">Aqua Servicios, C.A.</h2><p className="mt-1 text-sm text-slate-500">Proveedor · Mantenimiento</p><div className="mt-5 rounded-2xl bg-slate-50 p-4 text-sm"><p><b>Válida:</b> 23 Jul · 9:00 a. m. a 12:00 p. m.</p><p className="mt-2"><b>Acceso:</b> Torre B, apartamento 402</p></div><button onClick={() => notify('Autorización cancelada en modo demo.')} className="mt-5 text-sm font-bold text-red-600">Cancelar autorización</button></Card></div></>
  );

  const renderIncidents = () => (
    <><SectionTitle eyebrow="Atención al propietario" title="Incidencias" description="Reporta situaciones en áreas comunes y sigue la respuesta de la administración." action={<button onClick={() => notify('Incidencia registrada con el número INC-2026-048.')} className="rounded-full bg-[#0b1d33] px-5 py-3 text-sm font-bold text-white"><Plus className="mr-2 inline" size={16} />Reportar incidencia</button>} /><Card className="p-6"><div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between"><div><div className="flex flex-wrap items-center gap-3"><Pill tone="blue">{incidentStatus}</Pill><span className="text-xs font-semibold text-slate-400">INC-2026-041</span></div><h2 className="mt-4 text-lg font-semibold">Iluminación intermitente en pasillo del piso 4</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">Reportado el 16 Jul 2026 · Área común · Torre B</p></div><button onClick={() => { setIncidentStatus('Resuelta'); notify('La incidencia fue marcada como resuelta.'); }} className="rounded-full border border-slate-200 px-4 py-2 text-sm font-bold">Marcar resuelta</button></div><div className="mt-6 grid gap-3 sm:grid-cols-3">{['Reporte recibido', 'Asignada a mantenimiento', incidentStatus === 'Resuelta' ? 'Resuelta' : 'Visita programada'].map((step, index) => <div key={step} className="rounded-2xl bg-[#faf9f6] p-4"><div className={`flex h-7 w-7 items-center justify-center rounded-full ${index < 2 || incidentStatus === 'Resuelta' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>{index < 2 || incidentStatus === 'Resuelta' ? <Check size={15} /> : index + 1}</div><p className="mt-3 text-sm font-semibold">{step}</p></div>)}</div></Card></>
  );

  const renderCommunity = () => (
    <><SectionTitle eyebrow="Tu comunidad" title="Noticias, junta y datos de pago" description="Información oficial publicada por la administración del condominio." /><div className="grid gap-5 xl:grid-cols-[1.15fr_0.85fr]"><div className="space-y-5"><Card className="overflow-hidden"><div className="h-44 bg-gradient-to-r from-[#153d61] via-[#316f86] to-[#d4b36b]" /><article className="p-6"><Pill tone="blue">Destacada</Pill><h2 className="mt-4 text-xl font-semibold">Avances del plan de paisajismo de áreas comunes</h2><p className="mt-2 text-sm leading-6 text-slate-500">La primera fase contempla recuperación de jardines, iluminación de senderos y nuevas especies adaptadas al entorno costero.</p><button onClick={() => notify('Noticia abierta en modo demo.')} className="mt-5 text-sm font-bold">Leer noticia completa →</button></article></Card><Card className="p-6"><p className="text-xs font-bold uppercase tracking-[0.2em] text-[#a47f32]">Avisos oficiales</p><div className="mt-5 divide-y divide-slate-100"><div className="pb-4"><h3 className="font-semibold">Mantenimiento programado del ascensor</h3><p className="mt-1 text-sm text-slate-500">22 Jul · Torre B · 9:00 a. m.</p></div><div className="pt-4"><h3 className="font-semibold">Jornada especial de actualización de datos</h3><p className="mt-1 text-sm text-slate-500">26 Jul · Salón de usos múltiples</p></div></div></Card></div><div className="space-y-5"><Card className="p-6"><Users className="text-[#b08a3c]" /><h2 className="mt-4 text-lg font-semibold">Junta de condominio</h2><div className="mt-5 space-y-4 text-sm"><div><p className="font-semibold">Ing. Valentina Suárez</p><p className="text-slate-500">Presidenta · Torre A</p></div><div><p className="font-semibold">Carlos Padrón</p><p className="text-slate-500">Vicepresidente · Torre C</p></div><div><p className="font-semibold">María Elena Soto</p><p className="text-slate-500">Tesorera · Torre B</p></div></div></Card><Card className="p-6"><Landmark className="text-[#b08a3c]" /><h2 className="mt-4 text-lg font-semibold">Cuenta del condominio</h2><p className="mt-1 text-xs text-slate-400">Datos suministrados por la administración</p><dl className="mt-5 space-y-3 text-sm"><div><dt className="text-slate-400">Banco</dt><dd className="font-semibold">Banesco</dd></div><div><dt className="text-slate-400">Cuenta corriente</dt><dd className="font-semibold">0134-0028-45-0281047691</dd></div><div><dt className="text-slate-400">Titular / RIF</dt><dd className="font-semibold">Condominio Caribbean Marina<br />J-41234567-8</dd></div></dl><button onClick={() => notify('Datos bancarios copiados.')} className="mt-5 rounded-full border border-[#b08a3c]/40 px-4 py-2 text-sm font-bold">Copiar datos</button></Card></div></div></>
  );

  const renderMeetings = () => (
    <>
      <SectionTitle
        eyebrow="Participación en vivo"
        title="Asambleas y reuniones"
        description="Consulta convocatorias, revisa la agenda y accede a las reuniones digitales habilitadas para tu inmueble."
      />
      <Card className="overflow-hidden bg-[#0b1d33] text-white">
        <div className="relative p-7 sm:p-9">
          <div className="absolute right-0 top-0 h-56 w-56 rounded-full bg-[#d6af57]/15 blur-3xl" />
          <div className="relative flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <Pill tone="green">Convocatoria publicada</Pill>
              <p className="mt-5 text-xs font-bold uppercase tracking-[0.22em] text-[#f0cf77]">16 de agosto de 2026 · 10:00 a. m.</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight">Asamblea general ordinaria</h2>
              <p className="mt-3 text-sm leading-7 text-white/65">Presentación del informe financiero, aprobación del presupuesto y elección de la nueva junta de condominio.</p>
            </div>
            <Link to="/conferencias" className="inline-flex shrink-0 items-center justify-center rounded-full bg-[#f0cf77] px-6 py-3.5 text-sm font-bold text-[#0b1d33] transition hover:bg-white">
              <Video className="mr-2" size={18} /> Ir a la sala digital
            </Link>
          </div>
        </div>
      </Card>
      <div className="mt-5 grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
        <Card className="p-6 sm:p-7">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#a47f32]">Orden del día</p>
          <ol className="mt-5 space-y-4 text-sm">
            {['Verificación del quórum', 'Presentación del informe de gestión', 'Aprobación del presupuesto 2026–2027', 'Elección de la junta de condominio'].map((item, index) => (
              <li key={item} className="flex gap-4 rounded-2xl bg-[#faf9f6] p-4"><span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#f0cf77] text-xs font-bold">{index + 1}</span><span className="pt-1 font-semibold">{item}</span></li>
            ))}
          </ol>
        </Card>
        <div className="space-y-5">
          <Card className="p-6">
            <FileText className="text-[#b08a3c]" />
            <h2 className="mt-4 font-semibold">Documentos de la convocatoria</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">Convocatoria formal, informe financiero y propuesta de presupuesto.</p>
            <button onClick={() => notify('Documentos preparados para descargar en modo demo.')} className="mt-5 text-sm font-bold">Revisar documentos →</button>
          </Card>
          <Card className="p-6">
            <Users className="text-[#b08a3c]" />
            <h2 className="mt-4 font-semibold">Participación del inmueble</h2>
            <p className="mt-2 text-sm text-slate-500">Apartamento B-402 · Alícuota 1,2846%</p>
            <div className="mt-4 flex items-center justify-between rounded-2xl bg-emerald-50 px-4 py-3 text-sm"><span className="text-emerald-700">Derecho a participación</span><b className="text-emerald-800">Verificado</b></div>
          </Card>
        </div>
      </div>
    </>
  );

  const renderParticipation = () => (
    <><SectionTitle eyebrow="Participación vecinal" title="Consultas y elecciones" description="Tu alícuota habilita tu participación en los procesos abiertos por la administración." /><Card className="p-6 sm:p-8"><div className="flex flex-col gap-5 sm:flex-row sm:justify-between"><div><Pill tone="green">Votación abierta</Pill><h2 className="mt-4 text-xl font-semibold">Consulta: horario de uso de la piscina</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">Selecciona la propuesta que consideres más conveniente. La administración publicará el resultado al finalizar la consulta.</p></div><div className="text-sm text-slate-500">Cierra en <b className="text-[#0b1d33]">5 días</b></div></div><div className="mt-7 grid gap-3">{['7:00 a. m. a 9:00 p. m.', '8:00 a. m. a 10:00 p. m.'].map((option) => <button key={option} onClick={() => setVote(option)} className={`flex items-center justify-between rounded-2xl border p-4 text-left text-sm font-semibold transition ${vote === option ? 'border-[#b08a3c] bg-[#f8f3e8]' : 'border-slate-200 hover:border-[#b08a3c]/50'}`}><span>{option}</span>{vote === option && <Check size={18} className="text-[#9b752c]" />}</button>)}</div><button disabled={!vote} onClick={() => notify('Tu voto fue registrado de forma demostrativa.')} className="mt-5 rounded-full bg-[#0b1d33] px-6 py-3 text-sm font-bold text-white disabled:opacity-35">Confirmar voto</button></Card><div className="mt-5 grid gap-5 md:grid-cols-2"><Card className="p-6"><ClipboardCheck className="text-[#b08a3c]" /><p className="mt-4 text-xs font-bold uppercase tracking-wider text-slate-400">Carta consulta cerrada</p><h2 className="mt-2 font-semibold">Renovación del gimnasio</h2><div className="mt-5 space-y-3 text-sm"><div><div className="flex justify-between"><span>Aprobada</span><b>68%</b></div><div className="mt-2 h-2 rounded-full bg-slate-100"><div className="h-full w-[68%] rounded-full bg-emerald-500" /></div></div><div><div className="flex justify-between"><span>No aprobada</span><b>32%</b></div><div className="mt-2 h-2 rounded-full bg-slate-100"><div className="h-full w-[32%] rounded-full bg-slate-400" /></div></div></div></Card><Card className="p-6"><Vote className="text-[#b08a3c]" /><p className="mt-4 text-xs font-bold uppercase tracking-wider text-slate-400">Proceso electoral 2026</p><h2 className="mt-2 font-semibold">Elección de junta de condominio</h2><p className="mt-3 text-sm leading-6 text-slate-500">Postulaciones: 01–10 Ago<br />Elección: 16 Ago · 8:00 a. m. a 6:00 p. m.<br />Resultados: al cierre, sujeto a decisión del administrador.</p><button onClick={() => notify('Calendario electoral agregado.')} className="mt-5 text-sm font-bold">Ver candidatos y proceso →</button></Card></div></>
  );

  const renderProfile = () => (
    <><SectionTitle eyebrow="Panel del propietario" title="Mi perfil y métodos de pago" description="Administra tus datos de contacto y las cuentas desde las que realizas tus pagos." /><div className="grid gap-5 xl:grid-cols-[0.8fr_1.2fr]"><Card className="p-6"><div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#0b1d33] text-xl font-bold text-white">AM</div><h2 className="mt-5 text-xl font-semibold">Alejandro Mendoza R.</h2><p className="mt-1 text-sm text-slate-500">Propietario verificado · B-402</p><dl className="mt-6 space-y-4 text-sm"><div><dt className="text-slate-400">Documento</dt><dd className="font-semibold">V-12.345.678</dd></div><div><dt className="text-slate-400">Correo</dt><dd className="font-semibold">alejandro@correo.com</dd></div><div><dt className="text-slate-400">Teléfono</dt><dd className="font-semibold">+58 414-555-0138</dd></div></dl><button onClick={() => notify('Edición de perfil habilitada en modo demo.')} className="mt-6 rounded-full border border-slate-200 px-5 py-2.5 text-sm font-bold">Editar perfil</button></Card><div className="space-y-5"><Card className="p-6"><div className="flex items-center justify-between"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-[#a47f32]">Cuenta bancaria vinculada</p><h2 className="mt-2 font-semibold">Banesco · Corriente</h2></div><CreditCard className="text-[#b08a3c]" /></div><p className="mt-4 text-sm text-slate-500">**** **** **** 4381 · Titular: Alejandro Mendoza</p><div className="mt-4 flex gap-3"><Pill>Verificada</Pill><button onClick={() => notify('Cuenta bancaria actualizada en modo demo.')} className="text-sm font-bold">Editar</button></div></Card><Card className="p-6"><div className="flex items-center justify-between"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-[#a47f32]">Pago móvil vinculado</p><h2 className="mt-2 font-semibold">Mercantil · 0414-555-0138</h2></div><Smartphone className="text-[#b08a3c]" /></div><p className="mt-4 text-sm text-slate-500">C.I. V-12.345.678 · Titular verificado</p><div className="mt-4 flex gap-3"><Pill>Activo</Pill><button onClick={() => notify('Pago móvil actualizado en modo demo.')} className="text-sm font-bold">Editar</button></div></Card><button onClick={() => notify('Formulario para vincular método abierto en modo demo.')} className="flex w-full items-center justify-center gap-2 rounded-3xl border border-dashed border-[#b08a3c]/60 bg-[#f8f3e8] p-5 text-sm font-bold text-[#8c6b28]"><Plus size={18} /> Vincular otra cuenta o pago móvil</button></div></div></>
  );

  const content: Record<PortalSection, React.ReactNode> = { inicio: renderOverview(), finanzas: renderFinances(), pagos: renderPayments(), inmueble: renderProperty(), familia: renderFamily(), autorizaciones: renderAuthorizations(), incidencias: renderIncidents(), comunidad: renderCommunity(), reuniones: renderMeetings(), participacion: renderParticipation(), perfil: renderProfile() };

  return (
    <div className="min-h-screen bg-[#f7f6f2] text-[#0b1d33]">
      <aside className={`fixed inset-y-0 left-0 z-50 flex w-[286px] flex-col bg-[#0b1d33] text-white transition-transform lg:translate-x-0 ${menuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex h-24 items-center justify-between border-b border-white/10 px-6"><img src="/casa-wordmark-dark.png" alt="CASA" className="h-9 w-auto max-w-[170px] object-contain" /><button onClick={() => setMenuOpen(false)} className="lg:hidden" aria-label="Cerrar menú"><X /></button></div>
        <div className="border-b border-white/10 px-5 py-5"><p className="text-xs uppercase tracking-[0.2em] text-[#f0cf77]">Demo interactiva</p><p className="mt-2 text-sm font-semibold">Alejandro Mendoza</p><p className="mt-1 text-xs text-white/45">Caribbean Marina · Apto. B-402</p></div>
        <nav className="flex-1 space-y-1 overflow-y-auto p-3" aria-label="Navegación del propietario">{navItems.map((item) => <button key={item.id} onClick={() => go(item.id)} className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm transition ${active === item.id ? 'bg-[#f0cf77] font-bold text-[#0b1d33]' : 'text-white/65 hover:bg-white/8 hover:text-white'}`}><item.icon size={18} />{item.label}</button>)}</nav>
        <div className="border-t border-white/10 p-4"><Link to="/login" className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-white/60 transition hover:bg-white/8 hover:text-white"><LogOut size={18} />Salir de la demo</Link></div>
      </aside>
      {menuOpen && <button aria-label="Cerrar menú" className="fixed inset-0 z-40 bg-black/40 lg:hidden" onClick={() => setMenuOpen(false)} />}
      <div className="lg:pl-[286px]">
        <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-[#0b1d33]/8 bg-[#f7f6f2]/90 px-5 backdrop-blur-xl sm:px-8"><div className="flex items-center gap-3"><button onClick={() => setMenuOpen(true)} className="rounded-xl border border-slate-200 bg-white p-2 lg:hidden" aria-label="Abrir menú"><Menu /></button><div><p className="text-xs text-slate-400">Portal del propietario · CASA</p><p className="text-sm font-bold">{title}</p></div></div><div className="flex items-center gap-3"><span className="hidden rounded-full bg-[#f1eadb] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-[#8c6b28] sm:inline">Modo demo</span><button className="relative rounded-full border border-slate-200 bg-white p-2.5" aria-label="Notificaciones"><Bell size={18} /><span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500" /></button><button onClick={() => go('perfil')} className="flex h-10 w-10 items-center justify-center rounded-full bg-[#0b1d33] text-xs font-bold text-white">AM</button></div></header>
        <main className="mx-auto max-w-[1400px] p-5 sm:p-8 lg:p-10">{content[active]}</main>
      </div>
      {toast && <div role="status" className="fixed bottom-5 right-5 z-[70] flex max-w-sm items-center gap-3 rounded-2xl bg-[#0b1d33] px-5 py-4 text-sm font-semibold text-white shadow-2xl"><Check className="shrink-0 text-[#f0cf77]" size={18} />{toast}</div>}
    </div>
  );
}
