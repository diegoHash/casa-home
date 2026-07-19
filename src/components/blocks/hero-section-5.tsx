import { useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BadgeCheck,
  BanknoteArrowDown,
  Building2,
  ChartNoAxesCombined,
  Check,
  ClipboardCheck,
  Fingerprint,
  Landmark,
  Menu,
  MessageSquareText,
  Network,
  ReceiptText,
  ShieldCheck,
  Sparkles,
  Users,
  Workflow,
  X,
} from 'lucide-react';

const capabilities = [
  {
    icon: Building2,
    title: 'Administración integral',
    description: 'Operación diaria, personal, inmuebles, documentos, proveedores, incidencias y reportes desde un centro de control único.',
  },
  {
    icon: Landmark,
    title: 'Contabilidad y finanzas',
    description: 'Conciliación bancaria, cuentas por cobrar y pagar, cuotas, comprobantes, cierres y reportes financieros verificables.',
  },
  {
    icon: BanknoteArrowDown,
    title: 'Gestión de cobranza',
    description: 'Cartera segmentada, compromisos de pago, recordatorios, seguimiento y trazabilidad de cada gestión realizada.',
  },
  {
    icon: Users,
    title: 'Portal del propietario',
    description: 'Estado de cuenta, pagos, autorizaciones, documentos, asambleas, consultas y elecciones desde una sola PWA.',
  },
  {
    icon: MessageSquareText,
    title: 'Atención al propietario',
    description: 'Solicitudes e incidencias organizadas por prioridad, responsable, evidencias, estado y tiempo de respuesta.',
  },
  {
    icon: ReceiptText,
    title: 'Compras y proveedores',
    description: 'Requisiciones, cotizaciones, comparativos, aprobaciones, órdenes de compra, recepción e inventario.',
  },
  {
    icon: Fingerprint,
    title: 'Control de accesos',
    description: 'Validación de residentes, visitantes, proveedores, vehículos y acreditaciones sin bitácoras de papel.',
  },
  {
    icon: BadgeCheck,
    title: 'Brazaletes y acreditaciones',
    description: 'Venta, activación, asignación, reposición y control de brazaletes vinculados a personas e inmuebles.',
  },
];

const operationSteps = [
  ['01', 'Centraliza', 'Reúne datos, solicitudes y responsables que antes estaban dispersos.'],
  ['02', 'Automatiza', 'Convierte tareas repetitivas en flujos con reglas, estados y alertas.'],
  ['03', 'Verifica', 'Registra cada movimiento para que la información sea confiable y auditable.'],
  ['04', 'Decide', 'Entrega indicadores claros a administración y junta para actuar a tiempo.'],
];

const audience = [
  ['Administración', 'Control diario de finanzas, personal, proveedores e incidencias.'],
  ['Junta de condominio', 'Visibilidad ejecutiva, aprobaciones y rendición de cuentas.'],
  ['Propietarios', 'Pagos, solicitudes, documentos y participación desde cualquier dispositivo.'],
  ['Equipo operativo', 'Tareas, accesos y protocolos claros, sin controles improvisados.'],
];

function SectionHeading({ eyebrow, title, children, light = false }: {
  eyebrow: string;
  title: string;
  children?: ReactNode;
  light?: boolean;
}) {
  return (
    <div className="max-w-3xl">
      <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#a77e27]">{eyebrow}</p>
      <h2 className={`mt-4 text-4xl font-semibold leading-[1.08] tracking-[-0.035em] md:text-6xl ${light ? 'text-white' : 'text-[#071a33]'}`}>
        {title}
      </h2>
      {children && <p className={`mt-6 max-w-2xl text-base leading-8 md:text-lg ${light ? 'text-white/68' : 'text-slate-600'}`}>{children}</p>}
    </div>
  );
}

function CasaLogo({
  compact = false,
  variant = 'wordmark',
  tone = 'light',
}: {
  compact?: boolean;
  variant?: 'wordmark' | 'institutional';
  tone?: 'light' | 'dark';
}) {
  const src = variant === 'institutional'
    ? `/casa-logo-institucional-${tone}.png`
    : `/casa-wordmark-${tone}.png`;

  return (
    <img
      src={src}
      alt={variant === 'institutional'
        ? 'CASA — Central de Administración y Servicios Automatizados'
        : 'CASA'}
      className={compact
        ? variant === 'institutional'
          ? 'h-auto w-full max-w-[390px] object-contain'
          : 'h-11 w-auto max-w-[220px] object-contain'
        : 'h-auto w-full max-w-[680px]'}
    />
  );
}

export function HeroSection({ onLoginClick }: { onLoginClick: () => void }) {
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);

  return (
    <div className="min-h-screen bg-[#f6f2e9] text-[#071a33] selection:bg-[#c9a24a]/25">
      <header className="fixed inset-x-0 top-0 z-50 border-b border-[#071a33]/10 bg-[#f6f2e9]/95 backdrop-blur-xl">
        <nav className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 lg:px-8" aria-label="Navegación principal">
          <Link to="/" className="flex items-center" aria-label="CASA, inicio">
            <CasaLogo compact />
          </Link>

          <div className="hidden items-center gap-7 text-sm font-semibold text-[#071a33]/68 lg:flex">
            <a href="#plataforma" className="transition hover:text-[#071a33]">Plataforma</a>
            <a href="#capacidades" className="transition hover:text-[#071a33]">Espacios de trabajo</a>
            <a href="#operacion" className="transition hover:text-[#071a33]">Cómo funciona</a>
            <a href="#licencia" className="transition hover:text-[#071a33]">Licencia integral</a>
            <Link to="/conferencias" className="transition hover:text-[#071a33]">Conferencias</Link>
          </div>

          <div className="hidden items-center gap-3 lg:flex">
            <Link to="/solicitar-demo" className="rounded-full px-4 py-2 text-sm font-bold text-[#071a33] transition hover:bg-white">Solicitar demo</Link>
            <button onClick={onLoginClick} className="rounded-full bg-[#071a33] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[#12335a]">
              Acceder
            </button>
          </div>

          <button
            type="button"
            aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(value => !value)}
            className="rounded-full border border-[#071a33]/15 bg-white p-2.5 lg:hidden"
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </nav>

        {menuOpen && (
          <div className="border-t border-[#071a33]/10 bg-[#f6f2e9] px-5 py-5 lg:hidden">
            <div className="mx-auto grid max-w-7xl gap-1 text-sm font-semibold">
              {[
                ['#plataforma', 'Plataforma'],
                ['#capacidades', 'Espacios de trabajo'],
                ['#operacion', 'Cómo funciona'],
                ['#licencia', 'Licencia integral'],
                ['/solicitar-demo', 'Solicitar demo'],
              ].map(([href, label]) => (
                <a key={href} href={href} onClick={closeMenu} className="rounded-xl px-3 py-3 hover:bg-white">{label}</a>
              ))}
              <Link to="/conferencias" onClick={closeMenu} className="rounded-xl px-3 py-3 hover:bg-white">Conferencias</Link>
              <button onClick={() => { closeMenu(); onLoginClick(); }} className="mt-2 rounded-xl bg-[#071a33] px-4 py-3 text-left text-white">Acceder</button>
            </div>
          </div>
        )}
      </header>

      <main>
        <section className="relative overflow-hidden bg-[#f6f2e9] pt-20">
          <div className="pointer-events-none absolute inset-0 opacity-50 [background-image:linear-gradient(rgba(7,26,51,.045)_1px,transparent_1px),linear-gradient(90deg,rgba(7,26,51,.045)_1px,transparent_1px)] [background-size:64px_64px]" />
          <div className="relative mx-auto grid min-h-[calc(100vh-5rem)] max-w-7xl gap-14 px-5 py-16 lg:grid-cols-[1.08fr_.92fr] lg:items-center lg:px-8 lg:py-24">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-[#c9a24a]/35 bg-white/80 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-[#7d5d1f] shadow-sm">
                <Sparkles size={14} /> Una plataforma. Toda la operación.
              </div>
              <h1 className="mt-8 max-w-4xl text-5xl font-semibold leading-[.98] tracking-[-0.055em] text-[#071a33] sm:text-6xl lg:text-[5.25rem]">
                La comunidad completa, <span className="text-[#a77e27]">bajo control.</span>
              </h1>
              <p className="mt-7 max-w-2xl text-lg leading-8 text-slate-600 md:text-xl">
                CASA reemplaza procesos manuales y herramientas dispersas por un sistema único para administrar finanzas, accesos, incidencias, compras y participación comunitaria.
              </p>
              <div className="mt-10 flex flex-col gap-3 sm:flex-row">
                <Link to="/solicitar-demo" className="inline-flex items-center justify-center rounded-full bg-[#071a33] px-7 py-3.5 text-sm font-bold text-white transition hover:bg-[#12335a]">
                  Solicitar una demo <ArrowRight className="ml-2" size={17} />
                </Link>
                <a href="#capacidades" className="inline-flex items-center justify-center rounded-full border border-[#071a33]/18 bg-white px-7 py-3.5 text-sm font-bold text-[#071a33] transition hover:border-[#c9a24a]">
                  Conocer la plataforma
                </a>
              </div>
              <div className="mt-10 flex flex-wrap gap-x-7 gap-y-3 text-sm font-medium text-[#071a33]/62">
                {['Implementación acompañada', 'Acceso multidispositivo', 'Actualizaciones incluidas'].map(item => (
                  <span key={item} className="flex items-center gap-2"><Check size={16} className="text-[#a77e27]" />{item}</span>
                ))}
              </div>
            </div>

            <div className="relative mx-auto w-full max-w-xl">
              <div className="absolute -inset-6 rounded-[2.5rem] bg-[#c9a24a]/12 blur-3xl" />
              <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[#071a33] p-5 text-white shadow-[0_35px_90px_rgba(7,26,51,.28)] sm:p-7">
                <div className="flex items-center justify-between border-b border-white/10 pb-5">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#e0bd69]">Vista unificada</p>
                    <h2 className="mt-1 text-xl font-semibold">Operación en tiempo real</h2>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-emerald-300"><span className="h-2 w-2 rounded-full bg-emerald-300" /> Sistema activo</div>
                </div>

                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  {[
                    ['Cobranza conciliada', '92%', BanknoteArrowDown],
                    ['Solicitudes resueltas', '38', ClipboardCheck],
                    ['Accesos registrados', '1.284', Fingerprint],
                    ['Procesos auditables', '100%', BadgeCheck],
                  ].map(([label, value, Icon]) => {
                    const MetricIcon = Icon as typeof BanknoteArrowDown;
                    return (
                      <div key={String(label)} className="rounded-2xl border border-white/10 bg-white/[.055] p-4">
                        <div className="flex items-center justify-between text-white/48"><span className="text-xs">{label as string}</span><MetricIcon size={16} className="text-[#e0bd69]" /></div>
                        <p className="mt-3 text-2xl font-semibold">{value as string}</p>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-3 rounded-2xl border border-white/10 bg-white/[.055] p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-white/48">Flujo operativo</p>
                      <p className="mt-1 text-sm font-semibold">Conciliación bancaria automatizada</p>
                    </div>
                    <span className="rounded-full bg-[#c9a24a]/15 px-3 py-1 text-xs font-bold text-[#e9c978]">En curso</span>
                  </div>
                  <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full w-[78%] rounded-full bg-[#c9a24a]" /></div>
                </div>
                <p className="mt-4 text-center text-[11px] uppercase tracking-[0.16em] text-white/35">Representación conceptual de la plataforma</p>
              </div>
            </div>
          </div>
        </section>

        <section id="plataforma" className="bg-white px-5 py-24 md:py-32 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="grid gap-12 lg:grid-cols-[.85fr_1.15fr] lg:items-end">
              <SectionHeading eyebrow="El problema que resolvemos" title="De controles manuales a una operación conectada." />
              <p className="max-w-2xl text-lg leading-8 text-slate-600 lg:justify-self-end">
                Hojas de cálculo, chats, comprobantes, llamadas y cuadernos crean retrasos y dependencia de demasiadas personas. CASA convierte ese trabajo fragmentado en procesos claros, medibles y disponibles para quienes los necesitan.
              </p>
            </div>
            <div className="mt-16 grid gap-px overflow-hidden rounded-[2rem] border border-[#071a33]/10 bg-[#071a33]/10 md:grid-cols-3">
              {[
                ['Menos reprocesos', 'La información se captura una vez y acompaña todo el flujo.'],
                ['Más trazabilidad', 'Cada solicitud, autorización y movimiento conserva su historial.'],
                ['Mejor respuesta', 'Responsables y prioridades quedan visibles desde el primer momento.'],
              ].map(([title, text]) => (
                <article key={title} className="bg-[#f9f7f1] p-8 md:p-10">
                  <h3 className="text-xl font-semibold">{title}</h3>
                  <p className="mt-4 text-sm leading-7 text-slate-600">{text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="capacidades" className="bg-[#f6f2e9] px-5 py-24 md:py-32 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <SectionHeading eyebrow="Espacios de trabajo conectados" title="Todo lo que la comunidad necesita. Sin piezas sueltas.">
              Cada espacio comparte usuarios, permisos, información y trazabilidad. La plataforma funciona como un solo sistema, no como aplicaciones desconectadas.
            </SectionHeading>
            <div className="mt-16 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {capabilities.map(({ icon: Icon, title, description }, index) => (
                <article key={title} className="group rounded-[1.75rem] border border-[#071a33]/10 bg-white p-7 transition duration-300 hover:-translate-y-1 hover:border-[#c9a24a]/60 hover:shadow-[0_22px_55px_rgba(7,26,51,.09)]">
                  <div className="flex items-start justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#071a33] text-[#e4c26f]"><Icon size={23} /></div>
                    <span className="text-xs font-bold tracking-[0.18em] text-[#071a33]/24">0{index + 1}</span>
                  </div>
                  <h3 className="mt-7 text-xl font-semibold">{title}</h3>
                  <p className="mt-3 text-sm leading-7 text-slate-600">{description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="licencia" className="overflow-hidden bg-[#071a33] px-5 py-24 text-white md:py-32 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <SectionHeading eyebrow="Licencia integral" title="Una licencia mensual. Toda la operación." light>
              CASA no se vende por piezas. La licencia habilita todos los espacios de trabajo para que administración, propietarios y equipos especializados operen sobre la misma información.
            </SectionHeading>

            <div className="mt-14 rounded-[2rem] border border-white/12 bg-white/[.055] p-7 md:p-9 lg:p-10">
              <div className="flex flex-col gap-3 border-b border-white/10 pb-7 md:flex-row md:items-end md:justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#e4c26f]">Espacios de trabajo incluidos</p>
                  <h3 className="mt-3 text-2xl font-semibold">Ocho espacios de trabajo. Un solo sistema.</h3>
                </div>
                <p className="max-w-md text-sm leading-6 text-white/55">No son complementos ni planes separados: forman parte de la misma licencia CASA.</p>
              </div>

              <div className="mt-8 grid gap-x-8 gap-y-5 sm:grid-cols-2 lg:grid-cols-4">
                {capabilities.map(({ icon: Icon, title }) => (
                  <div key={title} className="flex items-center gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#e4c26f]/12 text-[#e4c26f]"><Icon size={19} /></span>
                    <p className="text-sm font-semibold text-white/82">{title}</p>
                  </div>
                ))}
              </div>

              <div className="mt-9 grid gap-4 border-t border-white/10 pt-8 sm:grid-cols-2 lg:grid-cols-4">
                {[
                  'Usuarios, roles y permisos centralizados',
                  'Operación web y móvil mediante PWA',
                  'Actualizaciones y mejoras continuas',
                  'Acompañamiento de implementación',
                ].map(item => <p key={item} className="flex gap-3 text-sm leading-6 text-white/65"><Check className="mt-0.5 shrink-0 text-[#e4c26f]" size={18} />{item}</p>)}
              </div>

              <Link to="/solicitar-demo" className="mt-9 inline-flex items-center justify-center rounded-full bg-[#c9a24a] px-7 py-3.5 text-sm font-bold text-[#071a33] transition hover:bg-[#e0bd69]">
                Solicitar demo <ArrowRight className="ml-2" size={17} />
              </Link>
            </div>
          </div>
        </section>

        <section id="operacion" className="bg-white px-5 py-24 md:py-32 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <SectionHeading eyebrow="Método operativo" title="La información avanza. El control permanece.">
              CASA organiza el trabajo alrededor de flujos verificables para reducir tiempos, errores y dependencia de controles personales.
            </SectionHeading>
            <div className="mt-16 grid gap-4 lg:grid-cols-4">
              {operationSteps.map(([number, title, text]) => (
                <article key={number} className="relative overflow-hidden rounded-[1.75rem] border border-[#071a33]/10 bg-[#f9f7f1] p-7">
                  <p className="text-5xl font-semibold tracking-[-0.06em] text-[#c9a24a]">{number}</p>
                  <h3 className="mt-8 text-xl font-semibold">{title}</h3>
                  <p className="mt-3 text-sm leading-7 text-slate-600">{text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-[#f6f2e9] px-5 py-24 md:py-32 lg:px-8">
          <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[.8fr_1.2fr] lg:items-start">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#a77e27]">Una sola fuente de verdad</p>
              <h2 className="mt-4 text-4xl font-semibold leading-[1.08] tracking-[-0.035em] md:text-6xl">Todos trabajan sobre la misma operación.</h2>
              <p className="mt-6 text-lg leading-8 text-slate-600">Cada perfil ve lo que necesita, con permisos y responsabilidades definidos.</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {audience.map(([title, text], index) => {
                const icons = [Landmark, ChartNoAxesCombined, Users, Building2];
                const Icon = icons[index];
                return (
                  <article key={title} className="rounded-[1.75rem] border border-[#071a33]/10 bg-white p-7">
                    <Icon className="text-[#a77e27]" size={25} />
                    <h3 className="mt-5 text-lg font-semibold">{title}</h3>
                    <p className="mt-3 text-sm leading-7 text-slate-600">{text}</p>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section className="bg-white px-5 py-24 md:py-32 lg:px-8">
          <div className="mx-auto grid max-w-7xl overflow-hidden rounded-[2.25rem] border border-[#071a33]/10 lg:grid-cols-2">
            <div className="bg-[#071a33] p-8 text-white md:p-12">
              <ShieldCheck className="text-[#e4c26f]" size={34} />
              <h2 className="mt-7 text-3xl font-semibold tracking-[-0.03em] md:text-5xl">Confianza basada en trazabilidad.</h2>
              <p className="mt-5 max-w-xl leading-8 text-white/68">Permisos por rol, historial de actividad, procesos verificables y control central de usuarios para proteger la operación y facilitar la rendición de cuentas.</p>
            </div>
            <div className="grid content-center gap-5 bg-[#f9f7f1] p-8 md:p-12">
              {[
                [Network, 'Información centralizada'],
                [Workflow, 'Procesos estandarizados'],
                [BadgeCheck, 'Acciones verificables'],
                [ShieldCheck, 'Accesos por responsabilidad'],
              ].map(([Icon, text]) => {
                const ItemIcon = Icon as typeof Network;
                return <div key={String(text)} className="flex items-center gap-4 rounded-2xl bg-white p-4 font-semibold"><ItemIcon className="text-[#a77e27]" size={21} />{text as string}</div>;
              })}
            </div>
          </div>
        </section>

        <section id="contacto" className="bg-[#c9a24a] px-5 py-20 lg:px-8">
          <div className="mx-auto flex max-w-7xl flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-3xl">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#071a33]/60">Modernice su comunidad</p>
              <h2 className="mt-4 text-4xl font-semibold leading-tight tracking-[-0.04em] text-[#071a33] md:text-6xl">Cambie controles manuales por una operación que sí avanza.</h2>
            </div>
            <Link to="/solicitar-demo" className="inline-flex shrink-0 items-center justify-center rounded-full bg-[#071a33] px-8 py-4 text-sm font-bold text-white transition hover:bg-[#12335a]">
              Solicitar demo <ArrowRight className="ml-2" size={18} />
            </Link>
          </div>
        </section>
      </main>

      <footer className="bg-[#050f1e] px-5 py-12 text-white lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-10 md:flex-row md:items-end md:justify-between">
          <div className="max-w-xl">
            <CasaLogo compact variant="institutional" tone="dark" />
            <p className="mt-5 text-sm leading-7 text-white/48">El sistema operativo digital para comunidades residenciales y complejos inmobiliarios.</p>
          </div>
          <div className="flex flex-wrap gap-x-6 gap-y-3 text-sm text-white/58">
            <a href="#plataforma" className="hover:text-white">Plataforma</a>
            <a href="#capacidades" className="hover:text-white">Espacios de trabajo</a>
            <Link to="/conferencias" className="hover:text-white">Conferencias</Link>
            <button onClick={onLoginClick} className="hover:text-white">Acceder</button>
            <Link to="/privacy" className="hover:text-white">Privacidad</Link>
            <Link to="/terms" className="hover:text-white">Términos</Link>
          </div>
        </div>
        <div className="mx-auto mt-10 flex max-w-7xl flex-col gap-2 border-t border-white/10 pt-6 text-xs text-white/35 sm:flex-row sm:justify-between">
          <p>© {new Date().getFullYear()} CASA. Todos los derechos reservados.</p>
          <p>Central de Administración y Servicios Automatizados.</p>
        </div>
      </footer>

      <style>{`
        html { scroll-behavior: smooth; }
        @media (prefers-reduced-motion: reduce) { html { scroll-behavior: auto; } }
      `}</style>
    </div>
  );
}
