import { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import QRCode from 'qrcode';
import ChargeNotice from '../components/owner/ChargeNotice';
import { casaApi, casaErrorMessage, CasaAuthService } from '../services/CasaAuthService';
import {
  AlertTriangle,
  ArrowRight,
  BadgeCheck,
  Bell,
  Building2,
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
  ArrowDownLeft,
  ArrowUpRight,
  CheckCircle2,
  Clock3,
  Eye,
  Download,
  Copy,
  QrCode,
  LockKeyhole,
} from 'lucide-react';

type PortalSection = 'inicio' | 'finanzas' | 'pagos' | 'inmueble' | 'familia' | 'autorizaciones' | 'incidencias' | 'comunidad' | 'reuniones' | 'participacion' | 'perfil';

const navItems = [
  { id: 'inicio', label: 'Inicio', icon: Home, disabled: false },
  { id: 'finanzas', label: 'Estado de cuenta', icon: ReceiptText, disabled: false },
  { id: 'pagos', label: 'Pagar condominio', icon: HandCoins, disabled: false },
  { id: 'inmueble', label: 'Mi apartamento', icon: Building2, disabled: false },
  { id: 'familia', label: 'Carga familiar', icon: Users, disabled: false },
  { id: 'autorizaciones', label: 'Autorizaciones', icon: FileCheck2, disabled: false },
  { id: 'incidencias', label: 'Incidencias', icon: MessageSquareWarning, disabled: true },
  { id: 'comunidad', label: 'Comunidad', icon: Newspaper, disabled: true },
  { id: 'reuniones', label: 'Asambleas y reuniones', icon: Video, disabled: true },
  { id: 'participacion', label: 'Consultas y elecciones', icon: Vote, disabled: true },
  { id: 'perfil', label: 'Mi perfil y pagos', icon: UserRound, disabled: false },
] as const;

const disabledPortalSections = new Set<PortalSection>(['incidencias', 'comunidad', 'reuniones', 'participacion']);

const authorizationTypeLabels: Record<string, string> = {
  ACCESS: 'Ingreso de visitante',
  WORK: 'Trabajo o proveedor',
  EXIT: 'Salida de bienes',
};

function localDateTimeValue(date: Date) {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 16);
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat('es-VE', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

function caracasDateKey(date: Date) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Caracas',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map(({ type, value }) => [type, value]));
  return `${values.year}-${values.month}-${values.day}`;
}

function newVehicleForm() {
  return { brand: '', model: '', color: '', plate: '' };
}

function newAuthorizationForm() {
  const from = new Date();
  const until = new Date(from.getTime() + 24 * 60 * 60 * 1000);
  return {
    type: 'ACCESS',
    subject: '',
    validFrom: localDateTimeValue(from),
    validUntil: localDateTimeValue(until),
    authorizedPeople: [{ firstName: '', lastName: '', documentNumber: '' }],
    vehicles: [newVehicleForm()],
    workDescription: '',
  };
}



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

function ComingSoonCard({
  children,
  label,
}: {
  children: React.ReactNode;
  label: string;
}) {
  return (
    <div
      aria-disabled="true"
      aria-label={`${label}: próximamente`}
      className="relative overflow-hidden rounded-3xl border border-slate-200 bg-slate-100 p-6 text-left text-slate-400 shadow-[0_12px_40px_rgba(8,29,51,0.025)]"
    >
      <div className="opacity-55">{children}</div>
      <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-3xl">
        <span className="absolute left-[-34%] top-[43%] flex w-[168%] rotate-45 items-center justify-center bg-[#0b1d33]/75 py-2 text-[10px] font-black uppercase tracking-[0.3em] text-[#f0cf77] shadow-lg">
          Próximamente
        </span>
      </div>
    </div>
  );
}

export default function OwnerPortal() {
  const [active, setActive] = useState<PortalSection>('inicio');
  const [menuOpen, setMenuOpen] = useState(false);
  const [toast, setToast] = useState('');
  const [vote, setVote] = useState<string | null>(null);
  const [incidentStatus, setIncidentStatus] = useState('En seguimiento');

  const [portalData, setPortalData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Payment reporting states
  const [selectedMethodId, setSelectedMethodId] = useState('');
  const [amount, setAmount] = useState('');
  const [amountManuallyEdited, setAmountManuallyEdited] = useState(false);
  const [exchangeRate, setExchangeRate] = useState('1');
  const [exchangeRateDate, setExchangeRateDate] = useState('');
  const [exchangeRateLoading, setExchangeRateLoading] = useState(false);
  const [reference, setReference] = useState('');
  const [paidAt, setPaidAt] = useState(() => caracasDateKey(new Date()));
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [selectedNoticeId, setSelectedNoticeId] = useState('');
  const [selectedPayment, setSelectedPayment] = useState<any>(null);
  const [authorizations, setAuthorizations] = useState<any[]>([]);
  const [authorizationLoading, setAuthorizationLoading] = useState(false);
  const [authorizationModalOpen, setAuthorizationModalOpen] = useState(false);
  const [authorizationSubmitting, setAuthorizationSubmitting] = useState(false);
  const [authorizationForm, setAuthorizationForm] = useState(newAuthorizationForm);
  const [generatedQr, setGeneratedQr] = useState<{
    authorization: any;
    payload: string;
    dataUrl: string;
  } | null>(null);
  const [authorizationReferenceTime] = useState(() => Date.now());

  const activeAuthorizations = useMemo(() => {
    return authorizations.filter((authorization) => (
      authorization.status !== 'REJECTED'
      && new Date(authorization.validUntil).getTime() >= authorizationReferenceTime
    ));
  }, [authorizations, authorizationReferenceTime]);

  const authorizationsExpiringSoon = useMemo(() => {
    const nextWeek = authorizationReferenceTime + 7 * 24 * 60 * 60 * 1000;
    return activeAuthorizations.filter((authorization) => new Date(authorization.validUntil).getTime() <= nextWeek).length;
  }, [activeAuthorizations, authorizationReferenceTime]);

  const getSession = () => {
    const sessionStr = sessionStorage.getItem('casa_owner_session');
    if (!sessionStr) return null;
    try {
      return JSON.parse(sessionStr);
    } catch {
      return null;
    }
  };

  const session = getSession();

  // Memos for multiple notices selection
  const allNotices = useMemo(() => {
    return portalData?.notices || (portalData?.latestNotice ? [portalData.latestNotice] : []);
  }, [portalData]);

  const activeNotice = useMemo(() => {
    if (!allNotices.length) return null;
    return allNotices.find((n: any) => n.id === selectedNoticeId) || allNotices[0];
  }, [allNotices, selectedNoticeId]);

  const totalOutstandingUsd = useMemo(() => {
    if (!allNotices.length) return 0;
    return allNotices.reduce((sum: number, n: any) => {
      const out = n.allocation?.outstandingUsd ?? n.allocation?.totalUsd ?? 0;
      return sum + out;
    }, 0);
  }, [allNotices]);

  const expiredNoticesCount = useMemo(() => {
    if (!allNotices.length) return 0;
    return allNotices.filter((n: any) => {
      const out = n.allocation?.outstandingUsd ?? n.allocation?.totalUsd ?? 0;
      return out > 0;
    }).length;
  }, [allNotices]);

  const paymentOptions = useMemo(() => {
    if (!portalData?.community?.paymentMethods) return [];
    return portalData.community.paymentMethods.map((p: any) => ({
      id: `method_${p.id}`,
      type: p.type,
      label: p.type === 'MOBILE_PAYMENT' ? `Pago Móvil · ${p.label}` : p.label,
      currency: p.currency,
      bankAccountId: p.bankAccountId,
      paymentMethodId: p.id,
      details: p,
    }));
  }, [portalData]);

  const selectedPaymentOption = useMemo(
    () => paymentOptions.find((item: any) => item.id === selectedMethodId),
    [paymentOptions, selectedMethodId],
  );
  const amountLabel = selectedPaymentOption?.currency === 'VES'
    ? 'Monto Bs'
    : selectedPaymentOption?.currency === 'USD'
      ? 'Monto $'
      : 'Monto';
  const amountUsdEquivalent = selectedPaymentOption?.currency === 'VES' && Number(exchangeRate) > 0 && Number(amount) > 0
    ? Number(amount) / Number(exchangeRate)
    : null;

  // Initialize values when portalData is loaded
  useEffect(() => {
    if (portalData) {
      if (paymentOptions.length > 0 && !selectedMethodId) {
        setSelectedMethodId(paymentOptions[0].id);
      }
      if (portalData.notices?.length) {
        if (!selectedNoticeId) {
          setSelectedNoticeId(portalData.notices[0].id);
        }
      }
      const pendingTotal = portalData.notices
        ? portalData.notices.reduce((s: number, n: any) => s + (n.allocation?.outstandingUsd ?? n.allocation?.totalUsd ?? 0), 0)
        : (portalData.latestNotice?.allocation?.totalUsd ?? 0);
      setAmount(pendingTotal.toString());
      setAmountManuallyEdited(false);
    }
  }, [portalData]);

  useEffect(() => {
    if (!selectedPaymentOption) return;
    if (selectedPaymentOption.currency === 'USD') {
      setExchangeRate('1');
      setExchangeRateDate('');
      if (!amountManuallyEdited) setAmount(totalOutstandingUsd.toFixed(2));
      return;
    }
    if (selectedPaymentOption.currency !== 'VES') return;

    let cancelled = false;
    setExchangeRateLoading(true);
    setExchangeRate('');
    setExchangeRateDate('');
    casaApi.get('/owner-service/portal/exchange-rate', {
      params: { date: paidAt },
      headers: { Authorization: `Bearer ${session?.token}` },
    }).then((res) => {
      if (cancelled) return;
      setExchangeRate(String(Number(res.data.promedio).toFixed(2)));
      setExchangeRateDate(res.data.fechaActualizacion ?? '');
      if (!amountManuallyEdited) {
        setAmount((totalOutstandingUsd * Number(res.data.promedio)).toFixed(2));
      }
    }).catch((err: any) => {
      if (!cancelled) notify(casaErrorMessage(err, 'No se pudo consultar la tasa oficial del día.'));
    }).finally(() => {
      if (!cancelled) setExchangeRateLoading(false);
    });

    return () => { cancelled = true; };
  }, [selectedPaymentOption?.currency, session?.token, amountManuallyEdited, totalOutstandingUsd, paidAt]);

  const handleReportPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    const selectedOption = paymentOptions.find((o: any) => o.id === selectedMethodId);
    if (!selectedOption) {
      notify('Por favor, selecciona un método de pago.');
      return;
    }
    
    if (!amount || Number(amount) <= 0) {
      notify('Por favor, introduce un monto válido.');
      return;
    }
    if (!exchangeRate || Number(exchangeRate) <= 0) {
      notify('Por favor, introduce una tasa de cambio válida.');
      return;
    }
    if (selectedOption.currency === 'VES' && (exchangeRateLoading || !exchangeRateDate)) {
      notify('Espera a que CASA consulte la tasa oficial de la fecha del pago.');
      return;
    }
    if (selectedOption.currency === 'USD' && Number(exchangeRate) !== 1) {
      notify('Los pagos en USD deben reportarse con tasa 1.');
      return;
    }
    if (!reference) {
      notify('Por favor, ingresa el número de referencia.');
      return;
    }
    setSubmitting(true);
    try {
      await casaApi.post(
        '/owner-service/portal/payments',
        {
          paymentMethodId: selectedOption.paymentMethodId || undefined,
          amount: Number(amount),
          currency: selectedOption.currency,
          exchangeRate: Number(exchangeRate),
          reference,
          paidAt,
          notes: notes.trim() || undefined,
        },
        {
          headers: { Authorization: `Bearer ${session.token}` },
        }
      );
      notify('Pago reportado. Queda pendiente de conciliación por la administración.');
      setReference('');
      setNotes('');
      // Reload portal data to reflect new balances
      const res = await casaApi.get('/owner-service/portal/overview', {
        headers: { Authorization: `Bearer ${session.token}` },
      });
      setPortalData(res.data);
    } catch (err: any) {
      notify(casaErrorMessage(err, 'Error al reportar el pago. Intenta de nuevo.'));
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    if (!session) {
      navigate('/login', { replace: true });
      return;
    }

    const loadData = async () => {
      setLoading(true);
      setAuthorizationLoading(true);
      setError('');
      try {
        const headers = { Authorization: `Bearer ${session.token}` };
        const [overview, ownerAuthorizations] = await Promise.all([
          casaApi.get('/owner-service/portal/overview', { headers }),
          casaApi.get('/owner-service/portal/authorizations', { headers }),
        ]);
        setPortalData(overview.data);
        setAuthorizations(ownerAuthorizations.data);
      } catch (err: any) {
        setError(casaErrorMessage(err, 'No se pudo cargar la información del portal.'));
      } finally {
        setAuthorizationLoading(false);
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const formatUSD = (value: number) => new Intl.NumberFormat('es-VE', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(value);
  const formatBsInput = (value: string) => {
    if (!value) return '';
    const [integer, decimals] = value.replace(',', '.').split('.');
    const grouped = integer.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return decimals !== undefined ? `${grouped},${decimals.slice(0, 2)}` : grouped;
  };
  const formatDate = (value: string) => new Intl.DateTimeFormat('es-VE', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(value.includes('T') ? value : `${value}T12:00:00`));
  const formatDateTimeShort = (value?: string | null) => value ? new Intl.DateTimeFormat('es-VE', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value)) : 'Pendiente de aplicación';

  const statementPayments = useMemo(() => (portalData?.payments ?? []).map((payment: any) => ({
    ...payment,
    date: payment.paidAt,
    amount: Number(payment.functionalAmount ?? 0),
    status: payment.status === 'RECONCILED' ? 'Conciliado' : payment.status === 'REPORTED' ? 'Reportado' : payment.status,
    reportedAtLabel: formatDateTimeShort(payment.reportedAt),
    reconciledAt: payment.appliedAt,
    applications: payment.applications.map((application: any) => ({ ...application, remaining: 0, note: 'Aplicado' })),
  })), [portalData]);

  const title = useMemo(() => navItems.find((item) => item.id === active)?.label ?? 'Inicio', [active]);
  const notify = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(''), 3200);
  };
  const go = (section: PortalSection) => {
    if (disabledPortalSections.has(section)) return;
    setActive(section);
    setMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const buildQr = async (authorization: any, payload: string) => {
    const dataUrl = await QRCode.toDataURL(payload, {
      errorCorrectionLevel: 'M',
      margin: 2,
      width: 420,
      color: { dark: '#0b1d33', light: '#ffffff' },
    });
    setGeneratedQr({ authorization, payload, dataUrl });
  };

  const handleCreateAuthorization = async (event: React.FormEvent) => {
    event.preventDefault();
    const people = authorizationForm.authorizedPeople
      .map((person) => ({
        firstName: person.firstName.trim(),
        lastName: person.lastName.trim(),
        documentNumber: person.documentNumber.trim(),
      }))
      .filter((person) => person.firstName || person.lastName || person.documentNumber);
    const vehicles = authorizationForm.vehicles
      .map((vehicle) => ({
        brand: vehicle.brand.trim(),
        model: vehicle.model.trim(),
        color: vehicle.color.trim(),
        plate: vehicle.plate.trim().toUpperCase(),
      }))
      .filter((vehicle) => vehicle.brand || vehicle.model || vehicle.color || vehicle.plate);
    if (!authorizationForm.subject.trim()) {
      notify('Indica el motivo o asunto de la autorización.');
      return;
    }
    if (!people.length || people.some((person) => !person.firstName || !person.lastName || !person.documentNumber)) {
      notify('Completa nombre, apellido y documento de al menos una persona autorizada.');
      return;
    }
    if (vehicles.some((vehicle) => !vehicle.brand || !vehicle.model || !vehicle.color || !vehicle.plate)) {
      notify('Completa marca, modelo, color y placa de cada vehículo o elimina la fila vacía.');
      return;
    }
    if (new Date(authorizationForm.validUntil) <= new Date(authorizationForm.validFrom)) {
      notify('La fecha de salida debe ser posterior a la fecha de ingreso.');
      return;
    }

    setAuthorizationSubmitting(true);
    try {
      const response = await casaApi.post('/owner-service/portal/authorizations', {
        ...authorizationForm,
        propertyId: portalData.property.id,
        validFrom: new Date(authorizationForm.validFrom).toISOString(),
        validUntil: new Date(authorizationForm.validUntil).toISOString(),
        authorizedPeople: people,
        vehicles,
        workDescription: authorizationForm.workDescription.trim() || undefined,
      }, {
        headers: { Authorization: `Bearer ${session.token}` },
      });
      const created = response.data;
      setAuthorizations((current) => [created, ...current]);
      setAuthorizationModalOpen(false);
      setAuthorizationForm(newAuthorizationForm());
      await buildQr(created, created.qrPayload);
      notify('Autorización emitida y código QR generado.');
    } catch (err: any) {
      notify(casaErrorMessage(err, 'No se pudo emitir la autorización.'));
    } finally {
      setAuthorizationSubmitting(false);
    }
  };

  const handleRegenerateQr = async (authorization: any) => {
    try {
      const response = await casaApi.post(`/owner-service/portal/authorizations/${authorization.id}/qr`, {}, {
        headers: { Authorization: `Bearer ${session.token}` },
      });
      const updated = response.data;
      setAuthorizations((current) => current.map((item) => item.id === updated.id ? updated : item));
      await buildQr(updated, updated.qrPayload);
      notify('Se generó un nuevo QR; el anterior quedó invalidado.');
    } catch (err: any) {
      notify(casaErrorMessage(err, 'No se pudo generar el código QR.'));
    }
  };

  const downloadQr = () => {
    if (!generatedQr) return;
    const link = document.createElement('a');
    link.href = generatedQr.dataUrl;
    link.download = `casa-autorizacion-${generatedQr.authorization.id}.png`;
    link.click();
  };



  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7f6f2] flex flex-col items-center justify-center p-6">
        <div className="flex flex-col items-center gap-4">
          <div className="relative flex items-center justify-center">
            <div className="h-16 w-16 animate-spin rounded-full border-4 border-slate-200 border-t-[#b08a3c]"></div>
            <div className="absolute font-black text-xs text-[#0b1d33]">CASA</div>
          </div>
          <p className="text-sm font-bold text-[#0b1d33] animate-pulse tracking-wide">
            Cargando Portal del Propietario...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#f7f6f2] flex flex-col items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-3xl border border-[#0b1d33]/8 p-8 shadow-2xl space-y-6 text-center">
          <div className="flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
              <AlertTriangle size={32} />
            </div>
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-[#0b1d33]">No se pudo cargar tu portal</h2>
            <p className="text-xs text-rose-800 font-semibold bg-rose-50 border border-rose-100 rounded-xl p-3 leading-relaxed">
              {error}
            </p>
          </div>
          <div className="flex gap-3 pt-2">
            <button
              onClick={() => window.location.reload()}
              className="flex-1 rounded-full bg-[#0b1d33] hover:bg-[#b08a3c] text-white py-3 text-xs font-bold transition cursor-pointer"
            >
              Reintentar
            </button>
            <button
              onClick={async () => {
                try {
                  const raw = sessionStorage.getItem('casa_owner_session');
                  const ownerSession = raw ? JSON.parse(raw) : null;
                  await CasaAuthService.logout(ownerSession?.refreshToken || '');
                } finally {
                  sessionStorage.removeItem('casa_owner_session');
                  navigate('/login', { replace: true });
                }
              }}
              className="flex-1 rounded-full border border-slate-200 bg-white hover:bg-slate-50 text-[#0b1d33] py-3 text-xs font-bold transition cursor-pointer"
            >
              Cerrar Sesión
            </button>
          </div>
        </div>
      </div>
    );
  }

  const renderOverview = () => {
    const hasNotice = allNotices.length > 0;
    const noticeAmount = totalOutstandingUsd;
    const isSolvent = !(noticeAmount > 0);

    return (
      <>
        <SectionTitle eyebrow="Resumen del propietario" title={`Buenos días, ${portalData.owner.fullName}`} description="Todo lo importante de tu apartamento y comunidad, en un solo lugar." />
        <div className="grid gap-5 xl:grid-cols-[1.25fr_0.75fr]">
          <section className="overflow-hidden rounded-3xl border border-[#0b1d33]/8 text-white shadow-[0_12px_40px_rgba(8,29,51,0.045)]" style={{ backgroundColor: '#0b1d33' }}>
            <div className="relative p-7 sm:p-9">
              <div className="absolute right-0 top-0 h-48 w-48 rounded-full bg-[#d6af57]/15 blur-3xl" />
              <div className="relative flex flex-col justify-between gap-8 sm:flex-row sm:items-start">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#f0cf77]">
                    {hasNotice ? `Deuda total acumulada (${allNotices.length} avisos)` : 'Sin cuotas pendientes'}
                  </p>
                  <p className="mt-4 text-5xl font-semibold tracking-tight">
                    {formatUSD(noticeAmount)}
                  </p>
                  <p className="mt-3 text-sm text-white/65">
                    {hasNotice ? `${expiredNoticesCount} aviso(s) pendiente(s) por pagar` : 'Tu cuenta está al día'}
                  </p>
                </div>
              </div>
              <div className="relative mt-8 flex flex-wrap gap-3">
                {hasNotice && <button onClick={() => go('pagos')} className="rounded-full bg-[#f0cf77] px-5 py-3 text-sm font-bold text-[#0b1d33] transition hover:bg-white cursor-pointer">Pagar condominio</button>}
                <button onClick={() => go('finanzas')} className="rounded-full border border-white/20 px-5 py-3 text-sm font-bold transition hover:bg-white/10 cursor-pointer">
                  {hasNotice ? 'Ver avisos de cobro' : 'Historial de avisos'}
                </button>
              </div>
            </div>
          </section>
          <section className="rounded-3xl border border-[#0b1d33]/8 bg-white p-6 text-left shadow-[0_12px_40px_rgba(8,29,51,0.045)]">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#a47f32]">Tu inmueble</p>
                <h2 className="mt-2 text-xl font-semibold">Apartamento {portalData.property.code}</h2>
              </div>
              <div className="rounded-2xl bg-[#f8f3e8] p-3 text-[#a47f32]"><Building2 size={22} /></div>
            </div>
            <dl className="mt-6 grid grid-cols-2 gap-4 text-sm">
              <div><dt className="text-slate-400">Alícuota</dt><dd className="mt-1 font-bold">{portalData.property.aliquot.toFixed(4).replace('.', ',')}%</dd></div>
              <div><dt className="text-slate-400">Torre</dt><dd className="mt-1 font-bold">{portalData.property.tower}</dd></div>
              <div><dt className="text-slate-400">Solvencia</dt><dd className="mt-1">{isSolvent ? <Pill tone="green">Solvente</Pill> : <Pill tone="amber">Pendiente ({expiredNoticesCount})</Pill>}</dd></div>
            </dl>
            <button type="button" onClick={() => go('inmueble')} className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-[#0b1d33] transition hover:text-[#a47f32] cursor-pointer" aria-label={`Ver detalles del apartamento ${portalData.property.code}`}>
              Ver detalles <ArrowRight size={16} />
            </button>
          </section>
        </div>
        <div className="mt-5 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {[
            { label: 'Autorizaciones activas', value: String(activeAuthorizations.length), detail: authorizationsExpiringSoon ? `${authorizationsExpiringSoon} vence esta semana` : activeAuthorizations.length ? 'Vigentes en tu inmueble' : 'Sin autorizaciones vigentes', icon: ShieldCheck, to: 'autorizaciones' as PortalSection },
            { label: 'Incidencias abiertas', value: '1', detail: 'En seguimiento', icon: MessageSquareWarning, to: 'incidencias' as PortalSection },
            { label: 'Próxima asamblea', value: '16 Ago', detail: 'Convocatoria publicada', icon: Video, to: 'reuniones' as PortalSection },
            { label: 'Consulta disponible', value: '1', detail: 'Participa hasta el 24 Jul', icon: Vote, to: 'participacion' as PortalSection },
          ].map((item) => item.to === 'autorizaciones' ? <button key={item.label} onClick={() => go(item.to)} className="rounded-3xl border border-[#0b1d33]/8 bg-white p-6 text-left shadow-[0_12px_40px_rgba(8,29,51,0.04)] transition hover:-translate-y-0.5 hover:border-[#b08a3c]/40 cursor-pointer"><item.icon className="text-[#b08a3c]" size={22} /><p className="mt-5 text-sm text-slate-500">{item.label}</p><p className="mt-1 text-3xl font-semibold">{item.value}</p><p className="mt-2 text-xs text-slate-400">{item.detail}</p></button> : <ComingSoonCard key={item.label} label={item.label}><item.icon className="text-[#b08a3c]" size={22} /><p className="mt-5 text-sm text-slate-500">{item.label}</p><p className="mt-1 text-3xl font-semibold">{item.value}</p><p className="mt-2 text-xs text-slate-400">{item.detail}</p></ComingSoonCard>)}
        </div>
        <div className="mt-5 grid gap-5 xl:grid-cols-2">
          <Card className="p-6">
            <div className="flex items-center justify-between"><h2 className="text-lg font-semibold">Avisos importantes</h2><Bell size={19} className="text-[#b08a3c]" /></div>
            <div className="mt-5 space-y-4">
              {hasNotice ? (
                <button onClick={() => go('finanzas')} className="w-full rounded-2xl border border-amber-200 bg-amber-50 p-4 text-left transition hover:border-amber-400 cursor-pointer">
                  <Pill tone="amber">Cobros pendientes ({expiredNoticesCount})</Pill>
                  <p className="mt-3 font-semibold">Tienes {allNotices.length} aviso(s) emitido(s)</p>
                  <p className="mt-1 text-sm text-slate-500">Deuda total: {formatUSD(noticeAmount)}</p>
                  <p className="mt-3 text-xs font-bold text-amber-800">Ver desgloses y elegir aviso →</p>
                </button>
              ) : (
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="font-semibold text-slate-700">No tienes cobros pendientes</p>
                  <p className="mt-1 text-sm text-slate-500">Tu cuenta se encuentra totalmente solvente al día de hoy.</p>
                </div>
              )}
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="font-semibold">Mantenimiento programado del ascensor</p>
                <p className="mt-1 text-sm text-slate-500">Torre {portalData.property.tower} · 22 de julio, 9:00 a. m.</p>
              </div>
            </div>
          </Card>
          <Card className="p-6"><div className="flex items-center justify-between"><h2 className="text-lg font-semibold">Noticias de la comunidad</h2><Newspaper size={19} className="text-[#b08a3c]" /></div><div className="mt-5 space-y-5"><article><p className="text-xs font-bold uppercase tracking-wider text-[#a47f32]">Comunidad · 18 Jul</p><h3 className="mt-2 font-semibold">Avances del plan de paisajismo de áreas comunes</h3><p className="mt-1 text-sm leading-6 text-slate-500">Conoce las mejoras realizadas durante la primera fase.</p></article><div className="h-px bg-slate-100" /><article><p className="text-xs font-bold uppercase tracking-wider text-[#a47f32]">Administración · 15 Jul</p><h3 className="mt-2 font-semibold">Nuevo horario de atención al propietario</h3></article></div><button onClick={() => go('comunidad')} className="mt-6 text-sm font-bold cursor-pointer">Ver todas las noticias →</button></Card>
        </div>
      </>
    );
  };

  const renderFinances = () => {
    const hasNotice = allNotices.length > 0;
    const noticeAmount = totalOutstandingUsd;
    const demoBalance = statementPayments.reduce((sum: number, payment: any) => sum + payment.amount, 0);
    return (
      <>
        <SectionTitle
          eyebrow="Finanzas"
          title="Estado de cuenta"
          description="Consulta tus avisos, pagos y la forma en que cada abono fue aplicado a tu saldo."
          action={<div className="flex gap-2"><span className="hidden items-center gap-2 rounded-full bg-[#f8f3e8] px-4 py-3 text-xs font-bold text-[#8a6827] sm:flex"><CheckCircle2 size={15} /> Datos de demostración</span><button onClick={() => window.print()} className="rounded-full border border-[#0b1d33]/15 bg-white px-5 py-3 text-sm font-bold cursor-pointer"><FileText className="mr-2 inline" size={16} />Imprimir</button></div>}
        />
        <div className="grid gap-4 md:grid-cols-4">
          <section className="relative min-w-0 overflow-hidden rounded-3xl border border-[#d6af57]/25 p-5 text-white shadow-[0_18px_45px_rgba(8,29,51,.15)]" style={{ backgroundColor: '#0b1d33' }}>
            <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-[#d6af57]/15 blur-2xl" />
            <p className="relative text-sm text-white/60">Saldo total pendiente</p>
            <p className="relative mt-2 break-words text-2xl font-semibold text-[#f0cf77]">{formatUSD(noticeAmount)}</p>
            <p className="relative mt-2 text-[11px] text-white/50">
              {hasNotice ? `${expiredNoticesCount} aviso(s) vencido(s) / pendiente(s)` : 'Sin avisos pendientes'}
            </p>
          </section>
          <Card className="min-w-0 p-5">
            <p className="text-xs text-slate-500">Último pago</p>
            <p className="mt-2 break-words text-2xl font-semibold">{statementPayments[0] ? formatUSD(statementPayments[0].amount) : '—'}</p>
            <p className="mt-2 text-[11px] text-slate-400">{statementPayments[0] ? formatDate(statementPayments[0].date) : 'Sin pagos registrados'}</p>
          </Card>
          <Card className="min-w-0 p-5">
            <p className="text-xs text-slate-500">Avisos pendientes</p>
            <p className="mt-2 text-2xl font-semibold">{expiredNoticesCount}</p>
            <div className="mt-2 text-[11px]">
              {expiredNoticesCount > 0 ? <Pill tone="amber">{expiredNoticesCount} por cancelar</Pill> : <Pill tone="green">Sin mora vencida</Pill>}
            </div>
          </Card>
          <Card className="min-w-0 p-5">
            <p className="text-xs text-slate-500">Pagos registrados</p>
            <p className="mt-2 text-2xl font-semibold">{statementPayments.length}</p>
            <p className="mt-2 text-[11px] text-slate-400">{formatUSD(demoBalance)} aplicados</p>
          </Card>
        </div>

        <Card className="mt-6 overflow-hidden">
          <div className="flex flex-col gap-2 border-b border-slate-100 p-6 sm:flex-row sm:items-center sm:justify-between">
            <div><h2 className="text-lg font-semibold text-[#0b1d33]">Historial de pagos</h2><p className="mt-1 text-sm text-slate-500">Cada pago conserva su trazabilidad hasta el aviso de cobro.</p></div>
            <span className="inline-flex w-fit items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700"><CheckCircle2 size={14} /> Conciliación visible</span>
          </div>
          <div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left text-xs"><thead className="bg-[#fbfaf7] text-[11px] uppercase tracking-wider text-slate-400"><tr><th className="px-5 py-3">Fecha</th><th className="px-5 py-3">Referencia</th><th className="px-5 py-3">Método</th><th className="px-5 py-3">Monto USD</th><th className="px-5 py-3">Estado</th><th className="px-5 py-3 text-right">Detalle</th></tr></thead><tbody className="divide-y divide-slate-100">{statementPayments.map((payment: any) => <tr key={payment.id} className="transition hover:bg-[#fcfbf8]"><td className="px-5 py-3 font-semibold text-[#0b1d33]">{formatDate(payment.date)}<span className="mt-1 block text-[11px] font-normal text-slate-400">Reportado {payment.reportedAtLabel}</span></td><td className="px-5 py-3 font-mono text-[11px] text-slate-600">{payment.reference}</td><td className="px-5 py-3 text-slate-600">{payment.method}</td><td className="px-5 py-3 font-bold text-emerald-700">+{formatUSD(payment.amount)}</td><td className="px-5 py-3"><Pill tone="green">{payment.status}</Pill></td><td className="px-5 py-3 text-right"><button onClick={() => setSelectedPayment(payment)} className="inline-flex items-center gap-2 rounded-full border border-[#0b1d33]/15 px-3 py-2 text-[11px] font-bold text-[#0b1d33] transition hover:border-[#b08a3c] hover:text-[#8a6827] cursor-pointer"><Eye size={14} /> Ver detalle</button></td></tr>)}</tbody></table></div>
        </Card>

        <Card className="mt-6 overflow-hidden">
          <div className="border-b border-slate-100 p-6"><h2 className="text-lg font-semibold text-[#0b1d33]">Avisos de cobro</h2><p className="mt-1 text-sm text-slate-500">Saldo original, pagos aplicados y saldo pendiente por período.</p></div>
          <div className="overflow-x-auto"><table className="w-full min-w-[700px] text-left text-sm"><thead className="bg-[#fbfaf7] text-xs uppercase tracking-wider text-slate-400"><tr><th className="px-6 py-4">Período</th><th className="px-6 py-4">Emitido</th><th className="px-6 py-4 text-right">Monto</th><th className="px-6 py-4 text-right">Aplicado</th><th className="px-6 py-4 text-right">Pendiente</th><th className="px-6 py-4">Estado</th></tr></thead><tbody className="divide-y divide-slate-100">{(allNotices.length ? allNotices : [{ billingPeriod: 'Septiembre 2026', allocation: { totalUsd: 100, outstandingUsd: 50 } }]).map((notice: any, index: number) => { const total = notice.allocation?.totalUsd ?? 100; const pending = notice.allocation?.outstandingUsd ?? total; return <tr key={notice.id ?? index} className="hover:bg-[#fcfbf8]"><td className="px-6 py-4"><button onClick={() => notice.id && setSelectedNoticeId(notice.id)} className="font-semibold text-[#0b1d33] hover:text-[#a47f32] cursor-pointer">{notice.billingPeriod}</button><span className="mt-1 block text-xs text-slate-400">Aviso de cobro</span></td><td className="px-6 py-4 text-slate-500">{formatDate('2026-08-01')}</td><td className="px-6 py-4 text-right font-medium">{formatUSD(total)}</td><td className="px-6 py-4 text-right font-semibold text-emerald-700">{formatUSD(Math.max(0, total - pending))}</td><td className="px-6 py-4 text-right font-bold text-amber-700">{formatUSD(pending)}</td><td className="px-6 py-4">{pending > 0 ? <Pill tone="amber">Pendiente</Pill> : <Pill tone="green">Pagado</Pill>}</td></tr> })}</tbody></table></div>
        </Card>

        {allNotices.length > 0 && (
          <div className="mt-6 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between shadow-sm">
            <div className="flex items-center gap-2">
              <ReceiptText className="text-[#b08a3c]" size={20} />
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-[#0b1d33]">Avisos de cobro disponibles ({allNotices.length})</p>
                <p className="text-xs text-slate-500">Haz clic en un período para visualizar su desglose oficial</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {allNotices.map((n: any) => {
                const isSelected = (activeNotice?.id === n.id);
                const unpaidAmount = n.allocation?.outstandingUsd ?? n.allocation?.totalUsd ?? 0;
                const isUnpaid = unpaidAmount > 0;
                return (
                  <button
                    key={n.id}
                    onClick={() => setSelectedNoticeId(n.id)}
                    className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition cursor-pointer ${
                      isSelected
                        ? 'bg-[#0b1d33] text-white shadow-md'
                        : 'bg-[#fbfaf7] text-slate-700 hover:bg-slate-100 border border-slate-200'
                    }`}
                  >
                    <span>{n.billingPeriod}</span>
                    {isUnpaid ? (
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold ${isSelected ? 'bg-amber-400 text-[#0b1d33]' : 'bg-amber-100 text-amber-800'}`}>
                        ${unpaidAmount.toFixed(2)}
                      </span>
                    ) : (
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold ${isSelected ? 'bg-emerald-400 text-[#0b1d33]' : 'bg-emerald-100 text-emerald-800'}`}>
                        Al día
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {activeNotice ? (
          <div className="mt-4">
            <ChargeNotice
              notice={activeNotice}
              community={portalData.community}
              ownerName={portalData.owner.fullName}
              propertyCode={portalData.property.code}
              towerName={portalData.property.tower}
              communityRif={portalData.community.rif}
              communityName={portalData.community.name}
            />
          </div>
        ) : (
          <Card className="mt-6 p-8 text-center border border-[#0b1d33]/8 bg-white rounded-3xl">
            <FileText className="mx-auto text-slate-300 mb-4" size={48} />
            <h3 className="text-lg font-bold text-[#0b1d33]">No hay avisos de cobro emitidos</h3>
            <p className="text-slate-500 text-sm mt-1">La administración no ha emitido avisos de cobro para esta comunidad aún.</p>
          </Card>
        )}

        {selectedPayment && <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#071a33]/55 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" onClick={() => setSelectedPayment(null)}><div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-3xl bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}><div className="flex items-start justify-between border-b border-slate-100 p-6 sm:p-8"><div><p className="text-xs font-bold uppercase tracking-[0.2em] text-[#a47f32]">Trazabilidad del pago</p><h2 className="mt-2 text-2xl font-semibold text-[#0b1d33]">{formatUSD(selectedPayment.amount)} · {formatDate(selectedPayment.date)}</h2><p className="mt-2 text-sm text-slate-500">Referencia {selectedPayment.reference} · {selectedPayment.method}</p></div><div className="flex items-center gap-2"><button type="button" onClick={() => window.print()} className="inline-flex items-center gap-2 rounded-full bg-[#0b1d33] px-4 py-2 text-xs font-bold text-white"><Download size={14} /> Imprimir recibo</button><button onClick={() => setSelectedPayment(null)} className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-[#0b1d33] cursor-pointer" aria-label="Cerrar detalle"><X size={20} /></button></div></div><div className="border-b border-slate-100 px-6 py-5 text-xs text-slate-600 sm:px-8"><p className="font-bold uppercase tracking-wider text-[#a47f32]">{portalData.community.name}</p><p className="mt-1">RIF: {portalData.community.rif} · {portalData.community.address}, {portalData.community.city}</p><p className="mt-1">Teléfono: {portalData.community.phone || 'No registrado'}</p><div className="mt-3 flex flex-wrap gap-2">{(portalData.community.bankAccounts ?? []).map((account: any) => <span key={account.id} className="rounded-full bg-slate-50 px-3 py-1">{account.bankName} · {account.accountNumber} · {account.currency}</span>)}</div></div><div className="grid gap-3 p-6 sm:grid-cols-3 sm:p-8"><div className="rounded-2xl bg-slate-50 p-4"><Clock3 className="text-[#a47f32]" size={18} /><p className="mt-3 text-xs text-slate-400">Fecha reportado</p><p className="mt-1 text-sm font-bold">{selectedPayment.reportedAtLabel}</p></div><div className="rounded-2xl bg-slate-50 p-4"><CheckCircle2 className="text-emerald-600" size={18} /><p className="mt-3 text-xs text-slate-400">Fecha aplicado</p><p className="mt-1 text-sm font-bold">{formatDateTimeShort(selectedPayment.appliedAt)}</p></div><div className="rounded-2xl bg-[#f8f3e8] p-4"><ArrowUpRight className="text-[#a47f32]" size={18} /><p className="mt-3 text-xs text-slate-400">Conversión funcional</p><p className="mt-1 text-sm font-bold">{selectedPayment.originalCurrency} {Number(selectedPayment.originalAmount ?? 0).toLocaleString('es-VE', { minimumFractionDigits: 2 })} · tasa {Number(selectedPayment.exchangeRate).toLocaleString('es-VE', { minimumFractionDigits: 6 })} · {formatUSD(selectedPayment.amount)}</p></div></div><div className="px-6 pb-8 sm:px-8"><h3 className="mb-4 font-semibold text-[#0b1d33]">Distribución por aviso de cobro</h3><div className="overflow-hidden rounded-2xl border border-slate-200"><table className="w-full text-left text-sm"><thead className="bg-[#fbfaf7] text-xs uppercase tracking-wider text-slate-400"><tr><th className="px-4 py-3">Aviso afectado</th><th className="px-4 py-3 text-right">Aplicado</th><th className="px-4 py-3">Fecha aplicado</th></tr></thead><tbody className="divide-y divide-slate-100">{selectedPayment.applications.length ? selectedPayment.applications.map((item: any) => <tr key={item.noticeId}><td className="px-4 py-4"><p className="font-semibold text-[#0b1d33]">{item.notice}</p><p className="mt-1 font-mono text-[11px] text-slate-400">{item.noticeId}</p></td><td className="px-4 py-4 text-right font-bold text-emerald-700">{formatUSD(item.applied)}</td><td className="px-4 py-4 text-xs text-slate-500">{formatDateTimeShort(item.appliedAt)}</td></tr>) : <tr><td colSpan={3} className="px-4 py-6 text-center text-sm text-slate-500">Aún no existen aplicaciones conciliadas.</td></tr>}</tbody></table></div><div className="mt-4 flex items-center gap-2 rounded-2xl bg-sky-50 p-4 text-sm text-sky-800"><ArrowDownLeft size={17} /><span>La aplicación se muestra exclusivamente para este inmueble y esta comunidad.</span></div></div></div></div>}
      </>
    );
  };

  const renderPayments = () => {
    return (
      <>
        <SectionTitle eyebrow="Pagos" title="Reportar un pago" description="Registra tu transferencia o pago móvil para que la administración pueda validarlo." />
        <div className="grid gap-5">
          <Card className="order-2 p-6 sm:p-8">
            <div className="mb-5 rounded-2xl border border-[#d6af57]/30 bg-[#fbf7ed] px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Saldo pendiente de avisos</p>
              <p className="mt-1 text-xl font-bold text-[#0b1d33]">{formatUSD(totalOutstandingUsd)}</p>
            </div>
            <form onSubmit={handleReportPayment} className="grid gap-5 sm:grid-cols-2">
              <label className="text-sm font-semibold">Método de Pago
                <select
                  required
                  value={selectedMethodId}
                  onChange={(e) => {
                    const option = paymentOptions.find((item: any) => item.id === e.target.value);
                    setSelectedMethodId(e.target.value);
                    if (option?.currency === 'USD') setExchangeRate('1');
                  }}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-[#fbfaf7] px-4 py-3 font-normal outline-none"
                >
                  <option value="">Seleccionar método de pago</option>
                  {paymentOptions.map((opt: any) => (
                    <option key={opt.id} value={opt.id}>
                      {opt.label} ({opt.currency})
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-sm font-semibold">{amountLabel}
                <input
                  type={selectedPaymentOption?.currency === 'VES' ? 'text' : 'number'}
                  step="0.01"
                  inputMode="decimal"
                  required
                  value={selectedPaymentOption?.currency === 'VES' ? formatBsInput(amount) : amount}
                  onChange={(e) => {
                    setAmountManuallyEdited(true);
                    const raw = selectedPaymentOption?.currency === 'VES'
                      ? e.target.value.replace(/\./g, '').replace(',', '.').replace(/[^\d.]/g, '')
                      : e.target.value;
                    setAmount(raw);
                  }}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-[#fbfaf7] px-4 py-3 font-normal outline-none"
                />
                {amountUsdEquivalent !== null && (
                  <span className="mt-1 block text-xs font-normal text-slate-500">
                    Equivale aproximadamente a {formatUSD(amountUsdEquivalent)} con la tasa indicada.
                  </span>
                )}
              </label>
              <label className="text-sm font-semibold">Fecha de Pago
                <input
                  type="date"
                  required
                  value={paidAt}
                  onChange={(e) => setPaidAt(e.target.value)}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-[#fbfaf7] px-4 py-3 font-normal outline-none"
                />
              </label>
              <label className="text-sm font-semibold">
                {selectedPaymentOption?.currency === 'VES' ? 'Tasa oficial de la fecha del pago (Bs por USD)' : 'Tasa (por USD)'}
                <input
                  type="text"
                  inputMode="decimal"
                  step="0.01"
                  min="0.01"
                  required
                  disabled={selectedPaymentOption?.currency !== 'VES' || exchangeRateLoading}
                  readOnly
                  value={exchangeRate}
                  className="mt-2 w-full max-w-[190px] rounded-xl border border-slate-200 bg-[#fbfaf7] px-3 py-2 text-sm font-normal outline-none disabled:cursor-not-allowed disabled:opacity-60"
                />
                {selectedPaymentOption?.currency === 'VES' && exchangeRateDate && (
                  <span className="mt-1 block text-xs font-normal text-slate-400">Actualizada: {exchangeRateDate}</span>
                )}
              </label>
              <label className="text-sm font-semibold">Referencia
                <input
                  type="text"
                  required
                  placeholder="Número de referencia bancaria o móvil"
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-[#fbfaf7] px-4 py-3 font-normal outline-none"
                />
              </label>
              <label className="text-sm font-semibold sm:col-span-2">Notas / Comentarios (Opcional)
                <textarea
                  placeholder="Agrega información adicional sobre tu pago si es necesario..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-[#fbfaf7] px-4 py-3 font-normal outline-none h-24 resize-none"
                />
              </label>
              <button
                disabled={submitting}
                className="rounded-full bg-[#0b1d33] hover:bg-[#b08a3c] transition text-white px-6 py-3.5 text-sm font-bold sm:col-span-2 cursor-pointer disabled:opacity-55"
              >
                {submitting ? 'Enviando reporte...' : 'Enviar reporte de pago'}
              </button>
            </form>
          </Card>
          <div className="order-first grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6">
            {paymentOptions.map((opt: any) => {
              if (opt.type === 'BANK_TRANSFER' && opt.details.bankAccount) {
                const b = opt.details.bankAccount;
                return (
                  <Card key={opt.id} className="min-w-0 p-4">
                    <Landmark size={18} className="text-[#b08a3c]" />
                    <h2 className="mt-3 truncate text-sm font-semibold">{opt.label} · {b.currency}</h2>
                    <dl className="mt-3 space-y-1.5 text-xs">
                      <div><dt className="text-slate-400">Banco</dt><dd className="truncate font-semibold">{b.bankName} · {b.accountType === 'SAVINGS' ? 'Ahorros' : 'Corriente'}</dd></div>
                      <div><dt className="text-slate-400">Cuenta</dt><dd className="truncate font-mono font-semibold select-all">{b.accountNumber}</dd></div>
                      <div><dt className="text-slate-400">Titular / RIF</dt><dd className="truncate font-semibold">{b.holder} · {b.holderRif}</dd></div>
                    </dl>
                  </Card>
                );
              } else if (opt.type === 'MOBILE_PAYMENT') {
                const p = opt.details;
                return (
                  <Card key={opt.id} className="min-w-0 p-4">
                    <Smartphone size={18} className="text-[#b08a3c]" />
                    <h2 className="mt-3 truncate text-sm font-semibold">{opt.label} · {p.currency}</h2>
                    <dl className="mt-3 space-y-1.5 text-xs">
                      <div><dt className="text-slate-400">Teléfono</dt><dd className="truncate font-mono font-semibold select-all">{p.mobilePhone}</dd></div>
                      <div><dt className="text-slate-400">Cédula / RIF</dt><dd className="truncate font-semibold">{p.mobileDocument}</dd></div>
                      {p.instructions && <div><dt className="text-slate-400">Instrucciones</dt><dd className="mt-1 line-clamp-2 text-slate-500">{p.instructions}</dd></div>}
                    </dl>
                  </Card>
                );
              } else {
                const p = opt.details;
                return (
                  <Card key={opt.id} className="min-w-0 p-4">
                    <CreditCard size={18} className="text-[#b08a3c]" />
                    <h2 className="mt-3 truncate text-sm font-semibold">{p.label} · {p.currency}</h2>
                    <dl className="mt-3 space-y-1.5 text-xs">
                      {p.instructions && <div><dt className="text-slate-400">Instrucciones</dt><dd className="mt-1 line-clamp-3 whitespace-pre-wrap text-slate-500">{p.instructions}</dd></div>}
                    </dl>
                  </Card>
                );
              }
            })}
            
            {paymentOptions.length === 0 && (
               <Card className="p-6">
                <Landmark className="text-[#b08a3c]" />
                <h2 className="mt-4 font-semibold">Datos para pago</h2>
                <p className="mt-3 text-sm leading-6 text-slate-500">No hay métodos de pago configurados. Contacta a la administración.</p>
              </Card>
            )}
          </div>
        </div>
      </>
    );
  };

  const renderProperty = () => (
    <>
      <SectionTitle eyebrow="Patrimonio" title={`Apartamento ${portalData.property.code}`} description="Información registral y participación del inmueble en el condominio." />
      <div className="grid gap-5 xl:grid-cols-[1fr_0.8fr]">
          <Card className="p-7">
          <div className="flex h-48 items-end rounded-3xl bg-gradient-to-br from-[#0b1d33] to-[#23507a] p-6 text-white">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-[#f0cf77]">{portalData.property.tower}</p>
              <p className="mt-2 text-2xl font-semibold">Apto. {portalData.property.code}</p>
            </div>
          </div>
          <dl className="mt-6 grid gap-5 sm:grid-cols-2">
            <div><dt className="text-sm text-slate-400">Alícuota</dt><dd className="mt-1 font-bold">{portalData.property.aliquot.toFixed(4).replace('.', ',')}%</dd></div>
            <div><dt className="text-sm text-slate-400">Estacionamientos</dt><dd className="mt-1 font-bold">{portalData.property.parkingSpace || 'No asignado'}</dd></div>
          </dl>
        </Card>
        <div className="space-y-5">
          <Card className="p-6">
            <PieChart className="text-[#b08a3c]" />
            <h2 className="mt-4 font-semibold">¿Qué es la alícuota?</h2>
            <p className="mt-3 text-sm leading-6 text-slate-500">Es el porcentaje asignado a tu apartamento para distribuir los gastos comunes y calcular tu participación en decisiones del condominio.</p>
          </Card>
          <Card className="p-6">
            <BadgeCheck className="text-emerald-600" />
            <h2 className="mt-4 font-semibold">Propiedad verificada</h2>
            <p className="mt-2 text-sm text-slate-500">
              Titular: {portalData.owner.fullName}
              <br />Documento de identidad verificado.
            </p>
          </Card>
        </div>
      </div>
    </>
  );

  const renderFamily = () => (
    <><SectionTitle eyebrow="Núcleo familiar" title="Carga familiar" description="Personas vinculadas a tu apartamento y habilitadas ante el condominio." action={<button onClick={() => notify('Formulario para agregar familiar abierto en modo demo.')} className="rounded-full bg-[#0b1d33] px-5 py-3 text-sm font-bold text-white"><Plus className="mr-2 inline" size={16} />Agregar persona</button>} /><div className="grid gap-4">{family.map((person) => <Card key={person.document} className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between"><div className="flex items-center gap-4"><div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#f8f3e8] font-bold text-[#9b752c]">{person.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}</div><div><h2 className="font-semibold">{person.name}</h2><p className="mt-1 text-sm text-slate-500">{person.relation} · {person.document}</p></div></div><div className="flex items-center gap-3"><Pill tone={person.status === 'Verificada' ? 'green' : 'amber'}>{person.status}</Pill><button aria-label={`Editar ${person.name}`} className="rounded-full border border-slate-200 p-2"><ChevronRight size={17} /></button></div></Card>)}</div></>
  );

  const renderAuthorizations = () => {
    const statusLabel = (authorization: any) => {
      if (authorization.status === 'RECEIVED') return 'Pendiente de aprobación';
      if (authorization.status === 'APPROVED') return 'Aprobada';
      return 'Rechazada';
    };
    const statusTone = (authorization: any) => {
      if (authorization.status === 'APPROVED') return 'green' as const;
      if (authorization.status === 'REJECTED') return 'red' as const;
      return 'amber' as const;
    };
    const isExpired = (authorization: any) => new Date(authorization.validUntil) < new Date();

    return (
      <>
        <SectionTitle
          eyebrow="Control de acceso"
          title="Autorizaciones"
          description="Emite permisos temporales para visitantes, proveedores y salidas. El QR contiene solo una llave, nunca los datos de las personas."
          action={
            <button
              onClick={() => setAuthorizationModalOpen(true)}
              className="rounded-full bg-[#0b1d33] px-5 py-3 text-sm font-bold text-white"
            >
              <Plus className="mr-2 inline" size={16} />Crear autorización
            </button>
          }
        />
        <div className="mb-5 flex items-start gap-3 rounded-2xl border border-sky-100 bg-sky-50 p-4 text-sm text-sky-900">
          <LockKeyhole className="mt-0.5 shrink-0 text-sky-700" size={18} />
          <p><b>Privacidad:</b> el código QR es una llave persistente asociada a tu autorización. En el escaneo, el personal de control consulta los datos protegidos en CASA dentro de esta comunidad.</p>
        </div>
        {authorizationLoading ? (
          <Card className="flex min-h-40 items-center justify-center p-6"><Clock3 className="animate-pulse text-[#b08a3c]" /></Card>
        ) : !authorizations.length ? (
          <Card className="p-10 text-center">
            <QrCode className="mx-auto text-slate-300" size={42} />
            <h2 className="mt-4 font-semibold">Aún no tienes autorizaciones</h2>
            <p className="mt-2 text-sm text-slate-500">Crea una autorización para generar el QR que entregarás al visitante.</p>
          </Card>
        ) : (
          <div className="grid gap-5 md:grid-cols-2">
            {authorizations.map((authorization) => (
              <Card key={authorization.id} className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <Pill tone={isExpired(authorization) ? 'red' : statusTone(authorization)}>
                      {isExpired(authorization) ? 'Vencida' : statusLabel(authorization)}
                    </Pill>
                    <h2 className="mt-5 text-lg font-semibold">{authorization.subject}</h2>
                    <p className="mt-1 text-sm text-slate-500">{authorizationTypeLabels[authorization.type] ?? authorization.type}</p>
                  </div>
                  <ShieldCheck className="text-[#b08a3c]" />
                </div>
                <dl className="mt-5 grid gap-3 rounded-2xl bg-slate-50 p-4 text-sm sm:grid-cols-2">
                  <div><dt className="text-slate-400">Desde</dt><dd className="font-semibold">{formatDateTime(authorization.validFrom)}</dd></div>
                  <div><dt className="text-slate-400">Hasta</dt><dd className="font-semibold">{formatDateTime(authorization.validUntil)}</dd></div>
                  <div><dt className="text-slate-400">Personas</dt><dd className="font-semibold">{authorization.authorizedPeople?.length ?? 0}</dd></div>
                    <div><dt className="text-slate-400">Vehículos</dt><dd className="font-semibold">{authorization.vehicles?.length ? authorization.vehicles.map((vehicle: { plate?: string | null }) => vehicle.plate).filter(Boolean).join(', ') : authorization.vehiclePlate || 'No indicado'}</dd></div>
                </dl>
                <div className="mt-5 flex flex-wrap gap-3">
                  <button
                    onClick={() => handleRegenerateQr(authorization)}
                    disabled={authorization.status === 'REJECTED'}
                    className="inline-flex items-center gap-2 rounded-xl bg-[#0b1d33] px-4 py-2.5 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <QrCode size={16} />Generar QR
                  </button>
                  <span className="self-center text-xs text-slate-400">Generar uno nuevo invalida el anterior.</span>
                </div>
              </Card>
            ))}
          </div>
        )}
        {authorizationModalOpen && (
          <div className="fixed inset-0 z-[60] overflow-y-auto bg-[#0b1d33]/70 p-4 backdrop-blur-sm sm:p-8">
            <form onSubmit={handleCreateAuthorization} className="mx-auto max-w-3xl rounded-[1.75rem] bg-[#f7f6f2] shadow-2xl">
              <header className="flex items-start justify-between gap-5 rounded-t-[1.75rem] bg-[#0b1d33] px-6 py-6 text-white sm:px-8">
                <div><p className="text-xs font-bold uppercase tracking-[0.2em] text-[#f0cf77]">Nueva emisión</p><h2 className="mt-2 text-2xl font-semibold">Crear autorización</h2><p className="mt-2 text-sm text-white/60">La llave QR se genera al guardar y se muestra una sola vez en este formulario.</p></div>
                <button type="button" onClick={() => setAuthorizationModalOpen(false)} className="rounded-full border border-white/15 p-2 text-white/70"><X size={18} /></button>
              </header>
              <div className="space-y-5 p-6 sm:p-8">
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="text-sm font-semibold">Tipo<select value={authorizationForm.type} onChange={(event) => setAuthorizationForm((current) => ({ ...current, type: event.target.value }))} className="mt-2 w-full rounded-xl border border-slate-200 bg-white p-3 font-normal"><option value="ACCESS">Ingreso de visitante</option><option value="WORK">Trabajo o proveedor</option><option value="EXIT">Salida de bienes</option></select></label>
                  <label className="text-sm font-semibold">Motivo / asunto<input required maxLength={220} value={authorizationForm.subject} onChange={(event) => setAuthorizationForm((current) => ({ ...current, subject: event.target.value }))} placeholder="Visita familiar, mantenimiento…" className="mt-2 w-full rounded-xl border border-slate-200 bg-white p-3 font-normal" /></label>
                  <label className="text-sm font-semibold">Válida desde<input required type="datetime-local" value={authorizationForm.validFrom} onChange={(event) => setAuthorizationForm((current) => ({ ...current, validFrom: event.target.value }))} className="mt-2 w-full rounded-xl border border-slate-200 bg-white p-3 font-normal" /></label>
                  <label className="text-sm font-semibold">Válida hasta<input required type="datetime-local" value={authorizationForm.validUntil} onChange={(event) => setAuthorizationForm((current) => ({ ...current, validUntil: event.target.value }))} className="mt-2 w-full rounded-xl border border-slate-200 bg-white p-3 font-normal" /></label>
                </div>
                <section className="rounded-2xl border border-slate-200 bg-white p-5">
                  <div className="flex items-center justify-between gap-3"><div><h3 className="font-semibold">Personas autorizadas</h3><p className="mt-1 text-xs text-slate-500">Estos datos quedan en CASA y no dentro del QR.</p></div><Users size={18} className="text-[#b08a3c]" /></div>
                  <div className="mt-4 space-y-3">
                    {authorizationForm.authorizedPeople.map((person, index) => (
                      <div key={index} className="grid gap-3 sm:grid-cols-[1fr_1fr_1fr_auto]">
                        {(['firstName', 'lastName', 'documentNumber'] as const).map((field) => <input key={field} required={index === 0} value={person[field]} onChange={(event) => setAuthorizationForm((current) => ({ ...current, authorizedPeople: current.authorizedPeople.map((item, itemIndex) => itemIndex === index ? { ...item, [field]: event.target.value } : item) }))} placeholder={field === 'firstName' ? 'Nombre' : field === 'lastName' ? 'Apellido' : 'Documento'} className="rounded-xl border border-slate-200 p-3 text-sm" />)}
                        {authorizationForm.authorizedPeople.length > 1 && <button type="button" onClick={() => setAuthorizationForm((current) => ({ ...current, authorizedPeople: current.authorizedPeople.filter((_, itemIndex) => itemIndex !== index) }))} className="rounded-xl border border-rose-200 px-3 text-rose-600" aria-label="Eliminar persona"><X size={16} /></button>}
                      </div>
                    ))}
                  </div>
                  <button type="button" onClick={() => setAuthorizationForm((current) => ({ ...current, authorizedPeople: [...current.authorizedPeople, { firstName: '', lastName: '', documentNumber: '' }] }))} className="mt-4 text-sm font-bold text-[#8c6b28]">+ Agregar otra persona</button>
                </section>
                <section className="rounded-2xl border border-slate-200 bg-white p-5">
                  <h3 className="font-semibold">Vehículo <span className="font-normal text-slate-400">(opcional)</span></h3>
                    <div className="mt-4 space-y-3">
                      {authorizationForm.vehicles.map((vehicle, index) => (
                        <div key={index} className="rounded-xl border border-slate-200 p-3">
                          <div className="grid gap-3 sm:grid-cols-2">
                            <input value={vehicle.brand} onChange={(event) => setAuthorizationForm((current) => ({ ...current, vehicles: current.vehicles.map((item, itemIndex) => itemIndex === index ? { ...item, brand: event.target.value } : item) }))} placeholder="Marca" className="rounded-xl border border-slate-200 p-3 text-sm" />
                            <input value={vehicle.model} onChange={(event) => setAuthorizationForm((current) => ({ ...current, vehicles: current.vehicles.map((item, itemIndex) => itemIndex === index ? { ...item, model: event.target.value } : item) }))} placeholder="Modelo" className="rounded-xl border border-slate-200 p-3 text-sm" />
                            <input value={vehicle.color} onChange={(event) => setAuthorizationForm((current) => ({ ...current, vehicles: current.vehicles.map((item, itemIndex) => itemIndex === index ? { ...item, color: event.target.value } : item) }))} placeholder="Color" className="rounded-xl border border-slate-200 p-3 text-sm" />
                            <input value={vehicle.plate} onChange={(event) => setAuthorizationForm((current) => ({ ...current, vehicles: current.vehicles.map((item, itemIndex) => itemIndex === index ? { ...item, plate: event.target.value.toUpperCase() } : item) }))} placeholder="Placa" className="rounded-xl border border-slate-200 p-3 text-sm uppercase" />
                          </div>
                          {authorizationForm.vehicles.length > 1 && <button type="button" onClick={() => setAuthorizationForm((current) => ({ ...current, vehicles: current.vehicles.filter((_, itemIndex) => itemIndex !== index) }))} className="mt-3 inline-flex items-center gap-2 text-sm font-bold text-rose-600"><X size={15} />Eliminar vehículo</button>}
                        </div>
                      ))}
                    </div>
                    <button type="button" onClick={() => setAuthorizationForm((current) => ({ ...current, vehicles: [...current.vehicles, newVehicleForm()] }))} className="mt-3 inline-flex items-center gap-2 text-sm font-bold text-[#0b1d33]">+ Agregar otro vehículo</button>
                </section>
                {authorizationForm.type === 'WORK' && <label className="block text-sm font-semibold">Descripción del trabajo<textarea value={authorizationForm.workDescription} onChange={(event) => setAuthorizationForm((current) => ({ ...current, workDescription: event.target.value }))} maxLength={10000} rows={3} className="mt-2 w-full rounded-xl border border-slate-200 bg-white p-3 font-normal" /></label>}
              </div>
              <footer className="flex flex-col-reverse gap-3 rounded-b-[1.75rem] border-t border-slate-200 bg-white px-6 py-5 sm:flex-row sm:justify-end sm:px-8"><button type="button" onClick={() => setAuthorizationModalOpen(false)} className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold">Cancelar</button><button disabled={authorizationSubmitting} className="rounded-xl bg-[#0b1d33] px-5 py-3 text-sm font-bold text-white disabled:opacity-40">{authorizationSubmitting ? 'Emitiendo…' : 'Emitir y generar QR'}</button></footer>
            </form>
          </div>
        )}
        {generatedQr && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center overflow-y-auto bg-[#0b1d33]/75 p-4 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-[1.75rem] bg-white p-6 text-center shadow-2xl sm:p-8">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f8f3e8] text-[#a47f32]"><QrCode /></div>
              <h2 className="mt-4 text-xl font-semibold">Código QR listo</h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">Descárgalo y entrégaselo a las personas autorizadas. El QR no contiene nombres, documentos ni datos del vehículo.</p>
              <img src={generatedQr.dataUrl} alt="Código QR de la autorización" className="mx-auto mt-5 h-64 w-64 rounded-xl border border-slate-100 p-2" />
              <p className="mt-3 text-xs font-semibold text-slate-400">{generatedQr.authorization.subject}</p>
              <div className="mt-5 flex flex-col gap-3 sm:flex-row"><button onClick={downloadQr} className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#0b1d33] px-4 py-3 text-sm font-bold text-white"><Download size={16} />Descargar QR</button><button onClick={() => { navigator.clipboard.writeText(generatedQr.payload); notify('Llave QR copiada.'); }} className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold"><Copy size={16} />Copiar llave</button></div>
              <button onClick={() => setGeneratedQr(null)} className="mt-4 text-sm font-bold text-slate-500">Cerrar</button>
            </div>
          </div>
        )}
      </>
    );
  };

  const renderIncidents = () => (
    <><SectionTitle eyebrow="Atención al propietario" title="Incidencias" description="Reporta situaciones en áreas comunes y sigue la respuesta de la administración." action={<button onClick={() => notify('Incidencia registrada con el número INC-2026-048.')} className="rounded-full bg-[#0b1d33] px-5 py-3 text-sm font-bold text-white"><Plus className="mr-2 inline" size={16} />Reportar incidencia</button>} /><Card className="p-6"><div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between"><div><div className="flex flex-wrap items-center gap-3"><Pill tone="blue">{incidentStatus}</Pill><span className="text-xs font-semibold text-slate-400">INC-2026-041</span></div><h2 className="mt-4 text-lg font-semibold">Iluminación intermitente en pasillo del piso 4</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">Reportado el 16 Jul 2026 · Área común · Torre B</p></div><button onClick={() => { setIncidentStatus('Resuelta'); notify('La incidencia fue marcada como resuelta.'); }} className="rounded-full border border-slate-200 px-4 py-2 text-sm font-bold">Marcar resuelta</button></div><div className="mt-6 grid gap-3 sm:grid-cols-3">{['Reporte recibido', 'Asignada a mantenimiento', incidentStatus === 'Resuelta' ? 'Resuelta' : 'Visita programada'].map((step, index) => <div key={step} className="rounded-2xl bg-[#faf9f6] p-4"><div className={`flex h-7 w-7 items-center justify-center rounded-full ${index < 2 || incidentStatus === 'Resuelta' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>{index < 2 || incidentStatus === 'Resuelta' ? <Check size={15} /> : index + 1}</div><p className="mt-3 text-sm font-semibold">{step}</p></div>)}</div></Card></>
  );

  const renderCommunity = () => (
    <><SectionTitle eyebrow="Tu comunidad" title="Noticias, junta y datos de pago" description="Información oficial publicada por la administración del condominio." /><div className="grid gap-5 xl:grid-cols-[1.15fr_0.85fr]"><div className="space-y-5"><Card className="overflow-hidden"><div className="h-44 bg-gradient-to-r from-[#153d61] via-[#316f86] to-[#d4b36b]" /><article className="p-6"><Pill tone="blue">Destacada</Pill><h2 className="mt-4 text-xl font-semibold">Avances del plan de paisajismo de áreas comunes</h2><p className="mt-2 text-sm leading-6 text-slate-500">La primera fase contempla recuperación de jardines, iluminación de senderos y nuevas especies adaptadas al entorno costero.</p><button onClick={() => notify('Noticia abierta in modo demo.')} className="mt-5 text-sm font-bold">Leer noticia completa →</button></article></Card><Card className="p-6"><p className="text-xs font-bold uppercase tracking-[0.2em] text-[#a47f32]">Avisos oficiales</p><div className="mt-5 divide-y divide-slate-100"><div className="pb-4"><h3 className="font-semibold">Mantenimiento programado del ascensor</h3><p className="mt-1 text-sm text-slate-500">22 Jul · Torre B · 9:00 a. m.</p></div><div className="pt-4"><h3 className="font-semibold">Jornada especial de actualización de datos</h3><p className="mt-1 text-sm text-slate-500">26 Jul · Salón de usos múltiples</p></div></div></Card></div><div className="space-y-5"><Card className="p-6"><Users className="text-[#b08a3c]" /><h2 className="mt-4 text-lg font-semibold">Junta de condominio</h2><div className="mt-5 space-y-4 text-sm"><div><p className="font-semibold">Ing. Valentina Suárez</p><p className="text-slate-500">Presidenta · Torre A</p></div><div><p className="font-semibold">Carlos Padrón</p><p className="text-slate-500">Vicepresidente · Torre C</p></div><div><p className="font-semibold">María Elena Soto</p><p className="text-slate-500">Tesorera · Torre B</p></div></div></Card>{portalData.community.bankAccounts && portalData.community.bankAccounts.length > 0 ? (
            portalData.community.bankAccounts.map((b: any) => (
              <Card key={b.id} className="p-6">
                <Landmark className="text-[#b08a3c]" />
                <h2 className="mt-4 text-lg font-semibold">Cuenta del condominio ({b.currency})</h2>
                <p className="mt-1 text-xs text-slate-400">Datos suministrados por la administración</p>
                <dl className="mt-5 space-y-3 text-sm">
                  <div><dt className="text-slate-400">Banco</dt><dd className="font-semibold">{b.bankName} · {b.accountType === 'SAVINGS' ? 'Ahorros' : 'Corriente'}</dd></div>
                  <div><dt className="text-slate-400">Cuenta corriente</dt><dd className="font-semibold font-mono select-all">{b.accountNumber}</dd></div>
                  <div><dt className="text-slate-400">Titular / RIF</dt><dd className="font-semibold">{b.holder}<br />{b.holderRif}</dd></div>
                </dl>
                <button onClick={() => {
                  navigator.clipboard.writeText(`${b.bankName} ${b.accountNumber} ${b.holder} ${b.holderRif}`);
                  notify('Datos bancarios copiados.');
                }} className="mt-5 rounded-full border border-[#b08a3c]/40 px-4 py-2 text-sm font-bold cursor-pointer">
                  Copiar datos
                </button>
              </Card>
            ))
          ) : (
            <Card className="p-6">
              <Landmark className="text-[#b08a3c]" />
              <h2 className="mt-4 text-lg font-semibold">Cuenta del condominio</h2>
              <p className="mt-1 text-xs text-slate-400">Datos suministrados por la administración</p>
              <dl className="mt-5 space-y-3 text-sm">
                <div><dt className="text-slate-400">Banco</dt><dd className="font-semibold">Banesco</dd></div>
                <div><dt className="text-slate-400">Cuenta corriente</dt><dd className="font-semibold">0134-0028-45-0281047691</dd></div>
                <div><dt className="text-slate-400">Titular / RIF</dt><dd className="font-semibold">Condominio {portalData.community.name}<br />{portalData.community.rif || 'J-41234567-8'}</dd></div>
              </dl>
              <button onClick={() => notify('Datos bancarios copiados.')} className="mt-5 rounded-full border border-[#b08a3c]/40 px-4 py-2 text-sm font-bold cursor-pointer">
                Copiar datos
              </button>
            </Card>
          )}</div></div></>
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
            <a href="/conferencias" className="inline-flex shrink-0 items-center justify-center rounded-full bg-[#f0cf77] px-6 py-3.5 text-sm font-bold text-[#0b1d33] transition hover:bg-white">
              <Video className="mr-2" size={18} /> Ir a la sala digital
            </a>
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
            <button onClick={() => notify('Documentos preparados para descargar en modo demo.')} className="mt-5 text-sm font-bold cursor-pointer">Revisar documentos →</button>
          </Card>
          <Card className="p-6">
            <Users className="text-[#b08a3c]" />
            <h2 className="mt-4 font-semibold">Participación del inmueble</h2>
            <p className="mt-2 text-sm text-slate-500">Apartamento {portalData.property.code} · Alícuota {portalData.property.aliquot.toFixed(4).replace('.', ',')}%</p>
            <div className="mt-4 flex items-center justify-between rounded-2xl bg-emerald-50 px-4 py-3 text-sm"><span className="text-emerald-700">Derecho a participación</span><b className="text-emerald-800">Verificado</b></div>
          </Card>
        </div>
      </div>
    </>
  );

  const renderParticipation = () => (
    <><SectionTitle eyebrow="Participación vecinal" title="Consultas y elecciones" description="Tu alícuota habilita tu participación en los procesos abiertos por la administración." /><Card className="p-6 sm:p-8"><div className="flex flex-col gap-5 sm:flex-row sm:justify-between"><div><Pill tone="green">Votación abierta</Pill><h2 className="mt-4 text-xl font-semibold">Consulta: horario de uso de la piscina</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">Selecciona la propuesta que consideres más conveniente. La administración publicará el resultado al finalizar la consulta.</p></div><div className="text-sm text-slate-500">Cierra en <b className="text-[#0b1d33]">5 días</b></div></div><div className="mt-7 grid gap-3">{['7:00 a. m. a 9:00 p. m.', '8:00 a. m. a 10:00 p. m.'].map((option) => <button key={option} onClick={() => setVote(option)} className={`flex items-center justify-between rounded-2xl border p-4 text-left text-sm font-semibold transition ${vote === option ? 'border-[#b08a3c] bg-[#f8f3e8]' : 'border-slate-200 hover:border-[#b08a3c]/50'}`}><span>{option}</span>{vote === option && <Check size={18} className="text-[#9b752c]" />}</button>)}</div><button disabled={!vote} onClick={() => notify('Tu voto fue registrado de forma demostrativa.')} className="mt-5 rounded-full bg-[#0b1d33] px-6 py-3 text-sm font-bold text-white disabled:opacity-35 cursor-pointer">Confirmar voto</button></Card><div className="mt-5 grid gap-5 md:grid-cols-2"><Card className="p-6"><ClipboardCheck className="text-[#b08a3c]" /><p className="mt-4 text-xs font-bold uppercase tracking-wider text-slate-400">Carta consulta cerrada</p><h2 className="mt-2 font-semibold">Renovación del gimnasio</h2><div className="mt-5 space-y-3 text-sm"><div><div className="flex justify-between"><span>Aprobada</span><b>68%</b></div><div className="mt-2 h-2 rounded-full bg-slate-100"><div className="h-full w-[68%] rounded-full bg-emerald-500" /></div></div><div><div className="flex justify-between"><span>No aprobada</span><b>32%</b></div><div className="mt-2 h-2 rounded-full bg-slate-100"><div className="h-full w-[32%] rounded-full bg-slate-400" /></div></div></div></Card><Card className="p-6"><Vote className="text-[#b08a3c]" /><p className="mt-4 text-xs font-bold uppercase tracking-wider text-slate-400">Proceso electoral 2026</p><h2 className="mt-2 font-semibold">Elección de junta de condominio</h2><p className="mt-3 text-sm leading-6 text-slate-500">Postulaciones: 01–10 Ago<br />Elección: 16 Ago · 8:00 a. m. a 6:00 p. m.<br />Resultados: al cierre, sujeto a decisión del administrador.</p><button onClick={() => notify('Calendario electoral agregado.')} className="mt-5 text-sm font-bold cursor-pointer">Ver candidatos y proceso →</button></Card></div></>
  );

  const renderProfile = () => {
    const initials = portalData.owner.fullName.split(' ').map((n: string) => n[0]).slice(0, 2).join('').toUpperCase();
    return (
      <>
        <SectionTitle eyebrow="Panel del propietario" title="Mi perfil y métodos de pago" description="Administra tus datos de contacto y las cuentas desde las que realizas tus pagos." />
        <div className="grid gap-5 xl:grid-cols-[0.8fr_1.2fr]">
          <Card className="p-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#0b1d33] text-xl font-bold text-white">
              {initials}
            </div>
            <h2 className="mt-5 text-xl font-semibold">{portalData.owner.fullName}</h2>
            <p className="mt-1 text-sm text-slate-500">Propietario verificado · Apto. {portalData.property.code}</p>
            <dl className="mt-6 space-y-4 text-sm">
              <div><dt className="text-slate-400">Documento</dt><dd className="font-semibold">{portalData.owner.docType}-{portalData.owner.docNumber}</dd></div>
              <div><dt className="text-slate-400">Correo</dt><dd className="font-semibold">{portalData.owner.email}</dd></div>
              <div><dt className="text-slate-400">Teléfono</dt><dd className="font-semibold">{portalData.owner.phone || 'No registrado'}</dd></div>
            </dl>
            <button onClick={() => notify('Edición de perfil habilitada en modo demo.')} className="mt-6 rounded-full border border-slate-200 px-5 py-2.5 text-sm font-bold cursor-pointer">Editar perfil</button>
          </Card>
          <div className="space-y-5">
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#a47f32]">Cuenta bancaria vinculada</p>
                  <h2 className="mt-2 font-semibold">Banesco · Corriente</h2>
                </div>
                <CreditCard className="text-[#b08a3c]" />
              </div>
              <p className="mt-4 text-sm text-slate-500">**** **** **** 4381 · Titular: {portalData.owner.fullName}</p>
              <div className="mt-4 flex gap-3">
                <Pill>Verificada</Pill>
                <button onClick={() => notify('Cuenta bancaria actualizada en modo demo.')} className="text-sm font-bold cursor-pointer">Editar</button>
              </div>
            </Card>
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#a47f32]">Pago móvil vinculado</p>
                  <h2 className="mt-2 font-semibold">Mercantil · {portalData.owner.phone || 'No registrado'}</h2>
                </div>
                <Smartphone className="text-[#b08a3c]" />
              </div>
              <p className="mt-4 text-sm text-slate-500">Documento: {portalData.owner.docType}-{portalData.owner.docNumber} · Titular verificado</p>
              <div className="mt-4 flex gap-3">
                <Pill>Activo</Pill>
                <button onClick={() => notify('Pago móvil actualizado en modo demo.')} className="text-sm font-bold cursor-pointer">Editar</button>
              </div>
            </Card>
            <button onClick={() => notify('Formulario para vincular método abierto en modo demo.')} className="flex w-full items-center justify-center gap-2 rounded-3xl border border-dashed border-[#b08a3c]/60 bg-[#f8f3e8] p-5 text-sm font-bold text-[#8c6b28] cursor-pointer">
              <Plus size={18} /> Vincular otra cuenta o pago móvil
            </button>
          </div>
        </div>
      </>
    );
  };

  const content: Record<PortalSection, React.ReactNode> = { inicio: renderOverview(), finanzas: renderFinances(), pagos: renderPayments(), inmueble: renderProperty(), familia: renderFamily(), autorizaciones: renderAuthorizations(), incidencias: renderIncidents(), comunidad: renderCommunity(), reuniones: renderMeetings(), participacion: renderParticipation(), perfil: renderProfile() };

  const ownerInitials = portalData.owner.fullName.split(' ').map((n: string) => n[0]).slice(0, 2).join('').toUpperCase();

  return (
    <div className="min-h-screen bg-[#f7f6f2] text-[#0b1d33]">
      <aside className={`fixed inset-y-0 left-0 z-50 flex w-[286px] flex-col bg-[#0b1d33] text-white transition-transform lg:translate-x-0 ${menuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex h-24 items-center justify-between border-b border-white/10 px-6"><img src="/casa-wordmark-dark.png" alt="CASA" className="h-9 w-auto max-w-[170px] object-contain" /><button onClick={() => setMenuOpen(false)} className="lg:hidden" aria-label="Cerrar menú"><X /></button></div>
        <div className="border-b border-white/10 px-5 py-5"><p className="text-xs uppercase tracking-[0.2em] text-[#f0cf77]">Propietario</p><p className="mt-2 text-sm font-semibold">{portalData.owner.fullName}</p><p className="mt-1 text-xs text-white/45">{portalData.community.name} · Apto. {portalData.property.code}</p></div>
        <nav className="flex-1 space-y-1 overflow-y-auto p-3" aria-label="Navegación del propietario">
          {navItems.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => go(item.id)}
              disabled={item.disabled}
              aria-disabled={item.disabled}
              className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm transition ${
                item.disabled
                  ? 'cursor-not-allowed text-white/35'
                  : active === item.id
                    ? 'bg-[#f0cf77] font-bold text-[#0b1d33]'
                    : 'text-white/65 hover:bg-white/8 hover:text-white'
              }`}
            >
              <item.icon size={18} />
              {item.disabled ? (
                <span className="flex min-w-0 flex-1 items-center justify-between gap-2">
                  <span className="line-through decoration-white/50">{item.label}</span>
                  <span className="shrink-0 rounded-full bg-white/10 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-[#f0cf77]">Próximamente</span>
                </span>
              ) : item.label}
            </button>
          ))}
        </nav>
        <div className="border-t border-white/10 p-4">
          <button 
            onClick={async () => {
              try {
                const raw = sessionStorage.getItem('casa_owner_session');
                const ownerSession = raw ? JSON.parse(raw) : null;
                await CasaAuthService.logout(ownerSession?.refreshToken || '');
              } finally {
                sessionStorage.removeItem('casa_owner_session');
                navigate('/login', { replace: true });
              }
            }} 
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm text-white/60 transition hover:bg-white/8 hover:text-white cursor-pointer"
          >
            <LogOut size={18} />Cerrar Sesión
          </button>
        </div>
      </aside>
      {menuOpen && <button aria-label="Cerrar menú" className="fixed inset-0 z-40 bg-black/40 lg:hidden" onClick={() => setMenuOpen(false)} />}
      <div className="lg:pl-[286px]">
        <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-[#0b1d33]/8 bg-[#f7f6f2]/90 px-5 backdrop-blur-xl sm:px-8"><div className="flex items-center gap-3"><button onClick={() => setMenuOpen(true)} className="rounded-xl border border-slate-200 bg-white p-2 lg:hidden" aria-label="Abrir menú"><Menu /></button><div><p className="text-xs text-slate-400">Portal del propietario · CASA</p><p className="text-sm font-bold">{title}</p></div></div><div className="flex items-center gap-3"><span className="hidden rounded-full bg-[#f1eadb] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-[#8c6b28] sm:inline">Propietario</span><button className="relative rounded-full border border-slate-200 bg-white p-2.5" aria-label="Notificaciones"><Bell size={18} /><span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500" /></button><button onClick={() => go('perfil')} className="flex h-10 w-10 items-center justify-center rounded-full bg-[#0b1d33] text-xs font-bold text-white uppercase">{ownerInitials}</button></div></header>
        <main className="mx-auto max-w-[1400px] p-5 sm:p-8 lg:p-10">{content[active]}</main>
      </div>
      {toast && <div role="status" className="fixed bottom-5 right-5 z-[70] flex max-w-sm items-center gap-3 rounded-2xl bg-[#0b1d33] px-5 py-4 text-sm font-semibold text-white shadow-2xl"><Check className="shrink-0 text-[#f0cf77]" size={18} />{toast}</div>}
    </div>
  );
}
