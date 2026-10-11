import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { BrowserQRCodeReader, type IScannerControls } from '@zxing/browser';
import { ClipboardList, QrCode, ScanLine, ShieldCheck, UserRound, X } from 'lucide-react';
import {
  CommunityWorkspaceService,
  type AccessEventRecord,
  type ServiceAuthorizationRecord,
} from '../../services/CommunityWorkspaceService';

type Authorization = {
  id: string;
  person: string;
  property: string;
  type: ServiceAuthorizationRecord['type'];
  validFrom: string;
  validUntil: string;
  issuedAt: string;
  status: 'APROBADA' | 'PENDIENTE';
  vehicleBrand: string | null;
  vehicleModel: string | null;
  vehicleColor: string | null;
  vehiclePlate: string | null;
  vehicles: Array<{
    id: string;
    brand: string | null;
    model: string | null;
    color: string | null;
    plate: string | null;
  }>;
  workDescription: string | null;
  exitPurpose: string | null;
  exitItems: string | null;
  rejectionReason: string | null;
  decidedAt: string | null;
  decidedBy: string | null;
  owner: string;
  ownerDocument: string;
  authorizedPeople: string[];
};

const authorizationTypeLabels: Record<Authorization['type'], string> = {
  ACCESS: 'Acceso',
  WORK: 'Trabajo',
  EXIT: 'Salida',
};

function formatDate(value: string) {
  return new Date(value).toLocaleString('es-VE');
}

function personName(person: { firstName: string; lastName: string }) {
  return `${person.firstName} ${person.lastName}`.trim();
}

function isToday(value: string) {
  const date = new Date(value);
  const today = new Date();
  return date.getFullYear() === today.getFullYear()
    && date.getMonth() === today.getMonth()
    && date.getDate() === today.getDate();
}

function maskAuthorizationId(value: string) {
  return value.length > 4 ? `${value.slice(0, 2)}****${value.slice(-2)}` : '****';
}

function mapAuthorization(item: ServiceAuthorizationRecord): Authorization {
  return {
    id: item.id,
    person: item.subject,
    property: item.property.code,
    type: item.type,
    validFrom: formatDate(item.validFrom),
    validUntil: formatDate(item.validUntil),
    issuedAt: formatDate(item.issuedAt),
    status: item.status === 'APPROVED' ? 'APROBADA' : 'PENDIENTE',
    vehicleBrand: item.vehicleBrand,
    vehicleModel: item.vehicleModel,
    vehicleColor: item.vehicleColor,
    vehiclePlate: item.vehiclePlate,
    vehicles: item.vehicles ?? [],
    workDescription: item.workDescription,
    exitPurpose: item.exitPurpose,
    exitItems: item.exitItems,
    rejectionReason: item.rejectionReason,
    decidedAt: item.decidedAt ? formatDate(item.decidedAt) : null,
    decidedBy: item.decidedBy?.person ? personName(item.decidedBy.person) : item.decidedBy?.email || null,
    owner: personName(item.owner),
    ownerDocument: `${item.owner.documentType}-${item.owner.documentNumber}`,
    authorizedPeople: item.authorizedPeople.map((authorizedPerson) => `${authorizedPerson.firstName} ${authorizedPerson.lastName} · ${authorizedPerson.documentNumber}`),
  };
}

export function ControlPrincipalPanel() {
  const [authorizations, setAuthorizations] = useState<Authorization[]>([]);
  const [selected, setSelected] = useState<Authorization | null>(null);
  const [scannedAuthorization, setScannedAuthorization] = useState<Authorization | null>(null);
  const [tab, setTab] = useState<'authorization' | 'expired' | 'history' | 'register'>('authorization');
  const [scanResult, setScanResult] = useState('');
  const [qrPayload, setQrPayload] = useState('');
  const [accessEvents, setAccessEvents] = useState<AccessEventRecord[]>([]);
  const [loadError, setLoadError] = useState('');
  const [cameraError, setCameraError] = useState('');
  const [cameraStatus, setCameraStatus] = useState('Solicitando acceso a la cámara…');
  const [cameraDevices, setCameraDevices] = useState<MediaDeviceInfo[]>([]);
  const [cameraId, setCameraId] = useState('');
  const [cameraActive, setCameraActive] = useState(false);
  const [showManualValidation, setShowManualValidation] = useState(false);
  const [name, setName] = useState('');
  const [documentNumber, setDocumentNumber] = useState('');
  const [kind, setKind] = useState('Particular');
  const [referenceTime] = useState(() => Date.now());
  const videoRef = useRef<HTMLVideoElement>(null);
  const controlsRef = useRef<IScannerControls | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const loadControlData = useCallback(async () => {
    const [authorizationResult, eventsResult] = await Promise.allSettled([
      CommunityWorkspaceService.ownerServiceAuthorizations({ page: 1, pageSize: 100 }),
      CommunityWorkspaceService.securityAccessEvents(),
    ]);

    const errors: string[] = [];
    if (authorizationResult.status === 'fulfilled') {
      setAuthorizations(authorizationResult.value.items.map(mapAuthorization));
    } else {
      errors.push(
        authorizationResult.reason instanceof Error
          ? authorizationResult.reason.message
          : 'No fue posible cargar las autorizaciones.',
      );
    }
    if (eventsResult.status === 'fulfilled') {
      setAccessEvents(eventsResult.value);
    } else {
      errors.push(
        eventsResult.reason instanceof Error
          ? eventsResult.reason.message
          : 'No fue posible cargar el historial de accesos.',
      );
    }
    setLoadError(errors.join(' '));
  }, []);

  useEffect(() => {
    void loadControlData();
    const refreshOnFocus = () => void loadControlData();
    const refreshOnVisibility = () => {
      if (globalThis.document.visibilityState === 'visible') void loadControlData();
    };
    const interval = window.setInterval(() => void loadControlData(), 30_000);
    window.addEventListener('focus', refreshOnFocus);
    globalThis.document.addEventListener('visibilitychange', refreshOnVisibility);
    return () => {
      window.clearInterval(interval);
      window.removeEventListener('focus', refreshOnFocus);
      globalThis.document.removeEventListener('visibilitychange', refreshOnVisibility);
    };
  }, [loadControlData]);

  const history = useMemo(() => [
    { date: 'Hoy · 2:14 p. m.', person: 'Mariana Pérez', detail: 'Visita general · Placa AB123CD', result: 'Entrada registrada' },
    { date: 'Ayer · 9:03 a. m.', person: 'Aqua Servicios, C.A.', detail: 'Trabajo · Torre B', result: 'Salida registrada' },
    ...accessEvents.map((item) => ({ date: new Date(item.occurredAt).toLocaleString('es-VE'), person: item.subject, detail: `${item.source} · ${item.direction}`, result: item.qrValidated ? 'QR validado' : 'Entrada registrada' })),
  ], [accessEvents]);

  const scanQr = useCallback(async (payload: string) => {
    if (!payload.trim()) return;
    try {
      const result = await CommunityWorkspaceService.scanAuthorizationQr(payload.trim());
      const authorization = mapAuthorization(result.authorization);
      setScannedAuthorization(authorization);
      setSelected(authorization);
      setQrPayload(payload.trim());
      setScanResult('QR leído. Revisa la información y confirma la llegada.');
      setShowManualValidation(false);
    } catch (error: unknown) {
      setCameraStatus('La llave fue leída, pero no pudo validarse.');
      setShowManualValidation(true);
      setScanResult('');
      setCameraError(error instanceof Error ? error.message : 'El QR no pudo validarse.');
    }
  }, []);

  const confirmArrival = useCallback(async () => {
    if (!qrPayload.trim() || !scannedAuthorization) return;
    try {
      const result = await CommunityWorkspaceService.confirmAuthorizationArrival(qrPayload.trim());
      setAccessEvents((items) => [result.event, ...items]);
      setScanResult(`Llegada confirmada para ${result.event.subject}.`);
      setQrPayload('');
      setScannedAuthorization(null);
      setSelected(null);
      setTab('history');
    } catch (error: unknown) {
      setCameraError(error instanceof Error ? error.message : 'No fue posible confirmar la llegada.');
    }
  }, [qrPayload, scannedAuthorization]);

  const stopCamera = useCallback(() => {
    controlsRef.current?.stop();
    controlsRef.current = null;
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setCameraActive(false);
  }, []);

  const startCamera = useCallback(async (requestedCameraId = cameraId) => {
    const video = videoRef.current;
    if (!video || !navigator.mediaDevices?.getUserMedia) {
      setCameraError('Este navegador no expone la cámara. Abre CASA desde HTTPS o usa la validación manual.');
      setShowManualValidation(true);
      return;
    }
    if (!window.isSecureContext && !['localhost', '127.0.0.1'].includes(window.location.hostname)) {
      setCameraError('La cámara solo funciona en una conexión HTTPS. Abre el enlace seguro de CASA y vuelve a intentar.');
      setShowManualValidation(true);
      return;
    }

    stopCamera();
    setCameraError('');
    setCameraStatus('Solicitando permiso para usar la cámara…');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: requestedCameraId
          ? { deviceId: { exact: requestedCameraId } }
          : { facingMode: { ideal: 'environment' }, width: { ideal: 1280 } },
      });
      streamRef.current = stream;
      video.srcObject = stream;
      await video.play();

      const devices = await BrowserQRCodeReader.listVideoInputDevices().catch(() => []);
      setCameraDevices(devices);
      const reader = new BrowserQRCodeReader(undefined, {
        delayBetweenScanAttempts: 250,
        delayBetweenScanSuccess: 1500,
      });
      const controls = await reader.decodeFromStream(stream, video, (result, _error, callbackControls) => {
        if (!result) return;
        controlsRef.current = callbackControls;
        const payload = result.getText().trim();
        if (!payload) return;
        setQrPayload(payload);
        setCameraStatus('QR detectado. Validando llave…');
        stopCamera();
        void scanQr(payload);
      });
      controlsRef.current = controls;
      setCameraActive(true);
      setCameraStatus('Apunta la cámara al código QR para leer la llave.');
    } catch (error: unknown) {
      stopCamera();
      const errorName = error instanceof DOMException ? error.name : '';
      setCameraError(errorName === 'NotAllowedError' || errorName === 'SecurityError'
        ? 'Permiso de cámara bloqueado. Toca el candado o el icono de permisos del navegador, permite la cámara y vuelve a pulsar “Activar cámara”.'
        : errorName === 'NotFoundError'
          ? 'No encontramos una cámara disponible en este dispositivo.'
          : 'No fue posible iniciar el lector QR en este dispositivo. Puedes validar la llave manualmente.');
      setCameraStatus('La cámara no está activa.');
      setShowManualValidation(true);
    }
  }, [cameraId, scanQr, stopCamera]);

  useEffect(() => () => stopCamera(), [stopCamera]);

  const submitVisit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!name.trim() || !documentNumber.trim()) return;
    try {
      const created = await CommunityWorkspaceService.registerSecurityAccess({ subject: name.trim(), documentNumber: documentNumber.trim(), direction: 'ENTRY', notes: kind });
      setAccessEvents((items) => [created, ...items]);
    } catch (error: unknown) {
      setScanResult(error instanceof Error ? error.message : 'No fue posible registrar el acceso.');
    }
    setName('');
    setDocumentNumber('');
    setTab('history');
  };

  const accessesToday = 1 + accessEvents.filter((item) => isToday(item.occurredAt)).length;
  const expiredAuthorizations = authorizations.filter((item) => new Date(item.validUntil).getTime() < referenceTime);
  const visibleAuthorizations = tab === 'expired'
    ? expiredAuthorizations
    : authorizations.filter((item) => new Date(item.validUntil).getTime() >= referenceTime);

  return (
    <div>
      {loadError && <div role="alert" className="mb-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">{loadError}</div>}

      <div className="grid max-w-3xl gap-3 sm:grid-cols-3">
        {[
          ['Autorizaciones activas', String(authorizations.filter((item) => item.status === 'APROBADA' && new Date(item.validUntil).getTime() >= referenceTime).length), ShieldCheck],
          ['Pendientes de revisión', String(authorizations.filter((item) => item.status === 'PENDIENTE' && new Date(item.validUntil).getTime() >= referenceTime).length), ClipboardList],
          ['Accesos de hoy', String(accessesToday), UserRound],
        ].map(([label, value, Icon]) => (
          <div key={String(label)} className="rounded-2xl border border-[#071a33]/8 bg-white px-4 py-3 shadow-[0_8px_24px_rgba(7,26,51,.04)]">
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-semibold leading-4 text-slate-500">{label}</p>
              <Icon size={17} className="shrink-0 text-[#9c7532]" />
            </div>
            <p className="mt-1 text-2xl font-semibold text-[#071a33]">{value}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 flex flex-wrap gap-2 border-b border-slate-200">
        {([['authorization', 'Autorizaciones'], ['expired', `Vencidas (${expiredAuthorizations.length})`], ['history', 'Historial de accesos'], ['register', 'Registrar visita']] as const).map(([value, label]) => <button key={value} onClick={() => setTab(value)} className={`border-b-2 px-4 py-3 text-sm font-bold ${tab === value ? 'border-[#9c7532] text-[#071a33]' : 'border-transparent text-slate-400'}`}>{label}</button>)}
      </div>

      {(tab === 'authorization' || tab === 'expired') && <div className="mt-5 grid gap-4 lg:grid-cols-2">{visibleAuthorizations.map((item) => <article key={item.id} className="rounded-3xl border border-[#071a33]/8 bg-white p-6"><div className="flex items-start justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-wider text-slate-400">{maskAuthorizationId(item.id)} · {authorizationTypeLabels[item.type]}</p><h3 className="mt-2 text-xl font-semibold">{item.person}</h3><p className="mt-1 text-sm text-slate-500">{item.property}</p></div><span className={`rounded-full px-3 py-1 text-xs font-bold ${new Date(item.validUntil).getTime() < referenceTime ? 'bg-rose-50 text-rose-700' : item.status === 'APROBADA' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>{new Date(item.validUntil).getTime() < referenceTime ? 'Vencida' : item.status === 'APROBADA' ? 'Aprobada' : 'Pendiente'}</span></div><p className="mt-5 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">Vigente hasta: <b>{item.validUntil}</b></p><button type="button" onClick={() => { stopCamera(); setScannedAuthorization(null); setQrPayload(''); setCameraError(''); setCameraStatus('Pulsa “Activar cámara” para solicitar permiso.'); setShowManualValidation(false); setSelected(item); }} className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#071a33] px-4 py-2.5 text-sm font-bold text-white"><QrCode size={16} /> Ver detalle</button></article>)}{!visibleAuthorizations.length && <div className="lg:col-span-2 rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-500">{tab === 'expired' ? 'No hay autorizaciones vencidas.' : 'No hay autorizaciones activas.'}</div>}</div>}

      {tab === 'history' && <div className="mt-5 overflow-x-auto rounded-3xl border border-[#071a33]/8 bg-white p-5"><table className="w-full min-w-[650px] text-left text-sm"><thead className="text-xs uppercase tracking-wider text-slate-400"><tr><th className="pb-3">Fecha</th><th className="pb-3">Persona</th><th className="pb-3">Detalle</th><th className="pb-3">Resultado</th></tr></thead><tbody>{history.map((item, index) => <tr key={`${item.person}-${index}`} className="border-t border-slate-100"><td className="py-4 text-slate-500">{item.date}</td><td className="py-4 font-semibold">{item.person}</td><td className="py-4 text-slate-500">{item.detail}</td><td className="py-4 font-semibold text-emerald-700">{item.result}</td></tr>)}</tbody></table></div>}

      {tab === 'register' && <form onSubmit={submitVisit} className="mt-5 max-w-2xl rounded-3xl border border-[#071a33]/8 bg-white p-6"><div className="grid gap-5 sm:grid-cols-2"><label className="text-sm font-semibold">Nombre o empresa<input value={name} onChange={(event) => setName(event.target.value)} required className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-3 font-normal" placeholder="Ej. María González" /></label><label className="text-sm font-semibold">Documento / RIF<input value={documentNumber} onChange={(event) => setDocumentNumber(event.target.value)} required className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-3 font-normal" placeholder="V-12345678" /></label></div><label className="mt-5 block text-sm font-semibold">Tipo de acceso<select value={kind} onChange={(event) => setKind(event.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-3 font-normal"><option>Particular</option><option>Empresa</option><option>Visita general</option></select></label><button className="mt-6 rounded-xl bg-[#071a33] px-5 py-3 text-sm font-bold text-white">Registrar entrada</button></form>}

      {scanResult && <p className="mt-5 rounded-2xl bg-emerald-50 p-4 text-sm font-semibold text-emerald-700">{scanResult}</p>}

      {selected && <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto overscroll-contain bg-[#071a33]/70 p-2 sm:p-4" role="presentation"><div role="dialog" aria-modal="true" aria-labelledby="authorization-detail-title" className="my-2 max-h-[calc(100dvh-1rem)] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-4 text-left shadow-2xl sm:my-6 sm:max-h-[calc(100dvh-3rem)] sm:rounded-3xl sm:p-8"><div className="flex items-start justify-between gap-3"><div className="flex min-w-0 items-center gap-3"><div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#f8f3e7] text-[#9c7532]"><ScanLine size={22} /></div><div className="min-w-0"><p className="text-xs font-bold uppercase tracking-[.16em] text-[#9c7532]">Detalle de autorización</p><h3 id="authorization-detail-title" className="mt-1 break-words text-lg font-semibold text-[#071a33] sm:text-xl">{selected.person}</h3></div></div><button type="button" onClick={() => { stopCamera(); setSelected(null); }} className="shrink-0 text-slate-400 hover:text-slate-700" aria-label="Cerrar detalle"><X size={21} /></button></div>

        <dl className="mt-6 grid gap-4 rounded-2xl bg-slate-50 p-5 sm:grid-cols-2"><Detail label="Código" value={selected.id} /><Detail label="Estado" value={selected.status === 'APROBADA' ? 'Aprobada' : 'Pendiente'} /><Detail label="Tipo" value={authorizationTypeLabels[selected.type]} /><Detail label="Inmueble" value={selected.property} /><Detail label="Vigencia desde" value={selected.validFrom} /><Detail label="Vigencia hasta" value={selected.validUntil} /><Detail label="Emitida" value={selected.issuedAt} /><Detail label="Propietario" value={`${selected.owner} · ${selected.ownerDocument}`} /></dl>

        {(selected.vehicleBrand || selected.vehicleModel || selected.vehicleColor || selected.vehiclePlate || selected.vehicles.length > 0 || selected.workDescription || selected.exitPurpose || selected.exitItems || selected.rejectionReason || selected.decidedAt || selected.decidedBy || selected.authorizedPeople.length > 0) && <div className="mt-4 grid gap-4 rounded-2xl border border-slate-100 p-5 sm:grid-cols-2"><Detail label="Cantidad de personas" value={selected.authorizedPeople.length ? String(selected.authorizedPeople.length) : undefined} /><Detail label="Personas autorizadas" value={selected.authorizedPeople.join(' | ')} /><Detail label="Vehículos" value={selected.vehicles.length ? selected.vehicles.map((vehicle) => [vehicle.brand, vehicle.model, vehicle.color, vehicle.plate].filter(Boolean).join(' · ')).join(' | ') : [selected.vehicleBrand, selected.vehicleModel, selected.vehicleColor].filter(Boolean).join(' · ')} /><Detail label="Placa principal" value={selected.vehiclePlate || selected.vehicles[0]?.plate || undefined} /><Detail label="Descripción del trabajo" value={selected.workDescription || undefined} /><Detail label="Motivo de salida" value={selected.exitPurpose || undefined} /><Detail label="Bienes / artículos" value={selected.exitItems || undefined} /><Detail label="Motivo de rechazo" value={selected.rejectionReason || undefined} /><Detail label="Decidida el" value={selected.decidedAt || undefined} /><Detail label="Decidida por" value={selected.decidedBy || undefined} /></div>}

        <div className="mt-6 rounded-2xl border border-[#071a33]/10 bg-[#071a33] p-4 text-white"><div className="flex items-center justify-between gap-3"><div><h4 className="font-semibold">Leer llave QR</h4><p className="mt-1 text-xs text-slate-300">Activa la cámara solo cuando estés listo para escanear.</p></div><QrCode size={21} className="shrink-0 text-[#d7bb7c]" /></div><div className="relative mt-4 aspect-video overflow-hidden rounded-xl bg-slate-900"><video ref={videoRef} className="h-full w-full object-cover" autoPlay playsInline muted /><div className="pointer-events-none absolute inset-0 flex items-center justify-center"><div className="h-32 w-32 rounded-2xl border-2 border-[#d7bb7c]/90 shadow-[0_0_0_999px_rgba(7,26,51,.22)]" /></div></div><div className="mt-3 flex flex-wrap items-center gap-2"><button type="button" onClick={() => { if (cameraActive) stopCamera(); else void startCamera(); }} className="rounded-xl bg-[#d7bb7c] px-4 py-2.5 text-xs font-bold text-[#071a33]">{cameraActive ? 'Detener cámara' : 'Activar cámara'}</button><p className="text-xs text-slate-300">{cameraStatus}</p></div>{cameraDevices.length > 1 && <label className="mt-3 block text-xs font-semibold text-slate-300">Cámara<select value={cameraId} onChange={(event) => { setCameraId(event.target.value); void startCamera(event.target.value); }} className="mt-1 w-full rounded-lg border border-white/15 bg-white/10 px-3 py-2 text-xs text-white"><option value="" className="text-[#071a33]">Cámara principal</option>{cameraDevices.map((device, index) => <option key={device.deviceId} value={device.deviceId}>{device.label || `Cámara ${index + 1}`}</option>)}</select></label>}{cameraError && <p role="alert" className="mt-3 rounded-xl bg-rose-400/15 px-3 py-2 text-xs font-semibold text-rose-200">{cameraError}</p>}</div>

        {scannedAuthorization && qrPayload && <button type="button" onClick={() => void confirmArrival()} className="mt-5 w-full rounded-xl bg-emerald-700 px-5 py-3.5 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-800">Confirmar llegada</button>}

        <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between"><button type="button" onClick={() => setShowManualValidation((visible) => !visible)} className="rounded-xl border border-[#071a33]/15 px-4 py-2.5 text-sm font-bold text-[#071a33]">{showManualValidation ? 'Ocultar validación manual' : 'Validar manualmente'}</button><button type="button" onClick={() => { stopCamera(); setSelected(null); setScannedAuthorization(null); setQrPayload(''); }} className="rounded-xl bg-slate-100 px-4 py-2.5 text-sm font-bold text-slate-700">Cerrar</button></div>

        {showManualValidation && <div className="mt-4 rounded-2xl border border-[#d7bb7c]/50 bg-[#f8f3e7] p-4"><label className="text-sm font-bold text-[#071a33]">Llave o payload del QR<input autoFocus value={qrPayload} onChange={(event) => setQrPayload(event.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-xs font-normal" placeholder="Pega aquí la llave de autorización" /></label><button type="button" disabled={!qrPayload.trim()} onClick={() => void scanQr(qrPayload)} className="mt-3 w-full rounded-xl bg-[#071a33] px-5 py-3 text-sm font-bold text-white disabled:opacity-40">Validar acceso</button></div>}
      </div></div>}
    </div>
  );
}

function Detail({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return <div className="min-w-0"><dt className="text-[11px] font-bold uppercase tracking-[.12em] text-slate-400">{label}</dt><dd className="mt-1 break-words text-sm font-semibold text-[#071a33]">{value}</dd></div>;
}
