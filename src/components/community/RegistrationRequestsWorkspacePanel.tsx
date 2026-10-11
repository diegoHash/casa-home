import { useState, useMemo, useEffect, type FormEvent } from 'react';
import {
  Mail,
  Phone,
  RefreshCw,
  Search,
  ShieldCheck,
  UserCheck,
  XCircle,
  AlertTriangle,
  User,
  Info,
  KeyRound,
  LockKeyhole,
  Eye,
} from 'lucide-react';
import { type OwnerAccessRequest } from '../../pages/OwnerLogin';
import { casaApi, casaErrorMessage } from '../../services/CasaAuthService';
import { StaffSession } from '../../services/StaffSession';
import {
  renderOwnerRegistrationEmailHtml,
  renderOwnerApprovalEmailHtml,
} from '../../utils/emailTemplates';
import { CommunityWorkspaceService } from '../../services/CommunityWorkspaceService';

/**
 * ============================================================================
 * PANEL DEDICADO: GESTIÓN DE SOLICITUDES DE REGISTRO EN ADMINISTRACIÓN
 * ============================================================================
 * Ubicación: Espacio de Trabajo de Administración (ADMINISTRATION).
 * 
 * Responsabilidades:
 * 1. Presentar las solicitudes de registro enviadas por los propietarios.
 * 2. Permitir al administrador o personal autorizado verificar la titularidad catastral.
 * 3. Ejecutar las acciones de Aprobación, Rechazo y Reenvío de PIN.
 * 4. Comunicarse mediante la API de cliente HTTP `casaApi` con el backend NestJS (casa-api)
 *    para que el servidor genere criptográficamente el PIN y envíe los correos reales.
 * 5. Privacidad Estricta: Ningún PIN temporal se muestra en texto plano al Administrador.
 * ============================================================================
 */
export function RegistrationRequestsWorkspacePanel() {
  const [requests, setRequests] = useState<OwnerAccessRequest[]>([]);
  const [statusFilter, setStatusFilter] = useState<
    'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'
  >('ALL');
  const [search, setSearch] = useState('');
  const [rejectingReq, setRejectingReq] = useState<OwnerAccessRequest | null>(
    null,
  );
  const [rejectReason, setRejectReason] = useState('');
  const [selectedHtmlMailRequest, setSelectedHtmlMailRequest] =
    useState<OwnerAccessRequest | null>(null);
  const [selectedApprovalMailRequest, setSelectedApprovalMailRequest] =
    useState<{
      request: OwnerAccessRequest;
      tempPin: string;
      hasExistingAccount: boolean;
      message: string;
    } | null>(null);

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [manualLinkReq, setManualLinkReq] = useState<OwnerAccessRequest | null>(null);
  const [approvingReq, setApprovingReq] = useState<OwnerAccessRequest | null>(null);
  const [peopleList, setPeopleList] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPerson, setSelectedPerson] = useState<any | null>(null);
  const [selectedProperty, setSelectedProperty] = useState<any | null>(null);
  const [communityProperties, setCommunityProperties] = useState<any[]>([]);
  const [modalLoading, setModalLoading] = useState(false);
  const [identityDocumentPreview, setIdentityDocumentPreview] = useState<string | null>(null);
  const [identityDocumentLoadingId, setIdentityDocumentLoadingId] = useState<string | null>(null);

  const [activeInvite, setActiveInvite] = useState<any>(null);
  const [ttlHours, setTtlHours] = useState(24);

  const fetchActiveInvite = async () => {
    try {
      const res = await casaApi.get('/owner-service/invitations/active', {
        headers: getAuthHeaders(),
      });
      setActiveInvite(res.data || null);
    } catch (err) {
      console.warn('Error fetching active invite:', err);
    }
  };

  useEffect(() => {
    fetchActiveInvite();
    loadCommunityPeople();
    reloadRequests();
  }, []);

  useEffect(() => () => {
    if (identityDocumentPreview) URL.revokeObjectURL(identityDocumentPreview);
  }, [identityDocumentPreview]);

  const handleViewIdentityDocument = async (requestId: string) => {
    setError('');
    setIdentityDocumentLoadingId(requestId);
    try {
      const response = await casaApi.get(
        `/owner-service/registration-requests/${encodeURIComponent(requestId)}/identity-document`,
        { headers: getAuthHeaders(), responseType: 'blob' },
      );
      const contentType = response.headers['content-type'];
      if (typeof contentType !== 'string' || contentType.split(';')[0].trim().toLowerCase() !== 'image/webp') {
        throw new Error('Unexpected document format');
      }
      const nextPreview = URL.createObjectURL(response.data as Blob);
      setIdentityDocumentPreview(nextPreview);
    } catch {
      setError('No se pudo abrir la foto. Verifica que la solicitud siga dentro de su período de conservación.');
    } finally {
      setIdentityDocumentLoadingId(null);
    }
  };

  const handleGenerateInvite = async () => {
    setError('');
    setLoading(true);
    try {
      const res = await casaApi.post(
        '/owner-service/invitations/generate',
        { ttlHours },
        { headers: getAuthHeaders() },
      );
      setActiveInvite(res.data);
    } catch (err: any) {
      setError(casaErrorMessage(err, 'No se pudo generar el código de invitación.'));
    } finally {
      setLoading(false);
    }
  };

  const handleRevokeInvite = async () => {
    if (!window.confirm('¿Estás seguro de que deseas revocar el código de invitación activo? Los nuevos registros fallarán hasta que generes uno nuevo.')) {
      return;
    }
    setError('');
    setLoading(true);
    try {
      await casaApi.post(
        '/owner-service/invitations/revoke',
        {},
        { headers: getAuthHeaders() },
      );
      setActiveInvite(null);
    } catch (err: any) {
      setError(casaErrorMessage(err, 'No se pudo revocar el código de invitación.'));
    } finally {
      setLoading(false);
    }
  };

  const reloadRequests = async () => {
    try {
      const res = await casaApi.get('/owner-service/registration-requests', { headers: getAuthHeaders() });
      setRequests(res.data || []);
    } catch (err) {
      setError(casaErrorMessage(err, 'No se pudieron cargar las solicitudes de esta comunidad.'));
    }
  };

  const pendingCount = useMemo(
    () => requests.filter((r) => r.status === 'PENDING').length,
    [requests],
  );
  const approvedCount = useMemo(
    () => requests.filter((r) => r.status === 'APPROVED').length,
    [requests],
  );
  const rejectedCount = useMemo(
    () => requests.filter((r) => r.status === 'REJECTED').length,
    [requests],
  );

  const matchingPerson = useMemo(() => {
    if (!approvingReq || !peopleList.length) return null;
    const reqDoc = String(approvingReq.docNumber || '').trim().toLowerCase().replace(/[^0-9]/g, '');
    const reqName = String(approvingReq.fullName || '').trim().toLowerCase();

    // 1. Try exact document match
    const byDoc = peopleList.find((p) => {
      const pDoc = String(p.documentNumber || '').trim().toLowerCase().replace(/[^0-9]/g, '');
      return pDoc && pDoc === reqDoc;
    });
    if (byDoc) return byDoc;

    // 2. Fallback to name partial match
    return peopleList.find((p) => {
      const pFullName = `${p.firstName} ${p.lastName}`.trim().toLowerCase();
      return pFullName.includes(reqName) || reqName.includes(pFullName);
    });
  }, [approvingReq, peopleList]);

  const filtered = useMemo(() => {
    return requests.filter((req) => {
      if (statusFilter !== 'ALL' && req.status !== statusFilter) return false;
      if (!search.trim()) return true;
      const q = search.toLowerCase().trim();
      return (
        req.folioNumber?.toLowerCase().includes(q) ||
        req.fullName.toLowerCase().includes(q) ||
        req.propertyCode.toLowerCase().includes(q) ||
        req.email.toLowerCase().includes(q) ||
        req.docNumber.toLowerCase().includes(q)
      );
    });
  }, [requests, statusFilter, search]);

  const getAuthHeaders = () => {
    const token = StaffSession.token();
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const loadCommunityPeople = async () => {
    setModalLoading(true);
    try {
      const snapshot = await CommunityWorkspaceService.coreSnapshot();
      const activeOwnerships = snapshot.ownerships.filter(
        (o) => o.status === 'active' || o.status === 'ACTIVE'
      );
      // `/core/snapshot` returns CommunityPerson records, whose identity data is
      // nested in `person`.  Ownerships, however, reference Person.id.  Using the
      // wrapper id here made every ownership comparison fail and left the manual
      // linking dialog with an empty property list.
      const mappedPeople = snapshot.people.map(({ person, ...communityPerson }) => {
        const p = person;
        const personOwnerships = activeOwnerships.filter((o) => o.personId === p.id);
        const propertiesOwned = personOwnerships.map((o) => {
          const prop = snapshot.properties.find((pr) => pr.id === o.propertyId);
          return prop ? prop.code : '';
        }).filter(Boolean);
        return {
          ...p,
          communityPersonId: communityPerson.id,
          communityPersonStatus: communityPerson.status,
          properties: propertiesOwned,
        };
      });
      setPeopleList(mappedPeople);
      setCommunityProperties(
        snapshot.properties.filter((property) =>
          property.status === 'ACTIVE' || property.status === 'active'
        ),
      );
    } catch (err) {
      console.error('Error loading community snapshot:', err);
    } finally {
      setModalLoading(false);
    }
  };

  const handleApprove = async (req: OwnerAccessRequest, emailResolution?: 'KEEP_EXISTING' | 'USE_REQUEST_EMAIL') => {
    setError('');
    setLoading(true);
    try {
      const response = await casaApi.post(
        `/owner-service/registration-requests/${req.id}/approve`,
        {
          email: req.email,
          fullName: req.fullName,
          propertyCode: req.propertyCode,
          folioNumber: req.folioNumber || req.id,
          docType: req.docType,
          docNumber: req.docNumber,
          emailResolution,
        },
        { headers: getAuthHeaders() },
      );

      await reloadRequests();
      setApprovingReq(null);
      setSelectedApprovalMailRequest({
        request: { ...req, status: 'APPROVED' },
        tempPin: '••••••',
        hasExistingAccount: !response.data?.maskedPin,
        message: response.data?.message ?? 'Solicitud aprobada exitosamente.',
      });
    } catch (err: any) {
      const conflict = err?.response?.data;
      if (conflict?.code === 'OWNER_EMAIL_CONFLICT') {
        const useRequested = window.confirm(
          `La persona ya tiene registrado ${conflict.existingEmail}.\n\nAceptar: usar el correo de la solicitud (${conflict.requestedEmail}).\nCancelar: conservar el correo registrado.`,
        );
        await handleApprove(req, useRequested ? 'USE_REQUEST_EMAIL' : 'KEEP_EXISTING');
        return;
      }
      const msg = casaErrorMessage(err, 'No se pudo aprobar la solicitud de forma automática.');
      setError(msg);
      // Fallback: prompt manual linking by opening the modal
      setManualLinkReq(req);
      loadCommunityPeople();
    } finally {
      setLoading(false);
    }
  };

  const handleManualLinkSubmit = async (emailResolution?: 'KEEP_EXISTING' | 'USE_REQUEST_EMAIL') => {
    if (!manualLinkReq || !selectedPerson || !selectedProperty) return;
    setError('');
    setLoading(true);
    try {
      const response = await casaApi.post(
        `/owner-service/registration-requests/${manualLinkReq.id}/approve`,
        {
          email: manualLinkReq.email,
          fullName: manualLinkReq.fullName,
          propertyCode: manualLinkReq.propertyCode,
          folioNumber: manualLinkReq.folioNumber || manualLinkReq.id,
          docType: manualLinkReq.docType,
          docNumber: manualLinkReq.docNumber,
          personId: selectedPerson.id,
          propertyId: selectedProperty.id,
          emailResolution,
        },
        { headers: getAuthHeaders() },
      );

      await reloadRequests();

      setManualLinkReq(null);
      setSelectedPerson(null);
      setSelectedProperty(null);
      setSearchTerm('');
      setSelectedApprovalMailRequest({
        request: {
          ...manualLinkReq,
          fullName: `${selectedPerson.firstName} ${selectedPerson.lastName}`.trim(),
          docType: selectedPerson.documentType,
          docNumber: selectedPerson.documentNumber,
          propertyCode: selectedProperty.code,
          status: 'APPROVED',
        },
        tempPin: '••••••',
        hasExistingAccount: !response.data?.maskedPin,
        message: response.data?.message ?? 'Solicitud aprobada exitosamente.',
      });
    } catch (err: any) {
      const conflict = err?.response?.data;
      if (conflict?.code === 'OWNER_EMAIL_CONFLICT') {
        const useRequested = window.confirm(
          `La persona ya tiene registrado ${conflict.existingEmail}.\n\nAceptar: usar el correo de la solicitud (${conflict.requestedEmail}).\nCancelar: conservar el correo registrado.`,
        );
        await handleManualLinkSubmit(useRequested ? 'USE_REQUEST_EMAIL' : 'KEEP_EXISTING');
        return;
      }
      setError(casaErrorMessage(err, 'No se pudo realizar la vinculación manual.'));
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmReject = async (e: FormEvent) => {
    e.preventDefault();
    if (!rejectingReq) return;
    const reason =
      rejectReason.trim() || 'Documentación no coincide con el expediente catastral.';
    const target = rejectingReq;
    setRejectingReq(null);
    setRejectReason('');
    try {
      await casaApi.post(
        `/owner-service/registration-requests/${target.id}/reject`,
        {
          reason,
          email: target.email,
          fullName: target.fullName,
          propertyCode: target.propertyCode,
          folioNumber: target.folioNumber || target.id,
        },
        { headers: getAuthHeaders() },
      );
      await reloadRequests();
    } catch (err) {
      setError(casaErrorMessage(err, 'No se pudo rechazar la solicitud.'));
    }
  };

  const [resentSuccessId, setResentSuccessId] = useState<string | null>(null);

  const handleResendPin = async (req: OwnerAccessRequest) => {
    try {
      await casaApi.post(
        `/owner-service/registration-requests/${req.id}/resend-pin`,
        {
          email: req.email,
          fullName: req.fullName,
          propertyCode: req.propertyCode,
          folioNumber: req.folioNumber || req.id,
        },
        { headers: getAuthHeaders() },
      );
      setResentSuccessId(req.id);
      setTimeout(() => setResentSuccessId(null), 4000);
    } catch (err) {
      setError(casaErrorMessage(err, 'No se pudo reenviar el PIN.'));
    }
  };

  const handleRevokeAccess = async (req: OwnerAccessRequest) => {
    if (!window.confirm(`¿Estás seguro de que deseas revocar el acceso de comunidad para ${req.fullName}? Esto cerrará todas sus sesiones activas de inmediato.`)) {
      return;
    }
    try {
      await casaApi.post(
        `/owner-service/registration-requests/${req.id}/revoke`,
        {
          email: req.email,
        },
        { headers: getAuthHeaders() },
      );
      await reloadRequests();
    } catch (err) {
      setError(casaErrorMessage(err, 'No se pudo revocar el acceso.'));
    }
  };

  const formatDateTime = (value?: string | null) => {
    if (!value) return '—';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return new Intl.DateTimeFormat('es-VE', {
      timeZone: 'America/Caracas',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    })
      .format(date)
      .replace(/\//g, '-');
  };

  return (
    <section className="space-y-6">
      {error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs font-semibold text-rose-800 flex items-start gap-2.5">
          <AlertTriangle size={16} className="shrink-0 text-rose-600 mt-0.5" />
          <div className="flex-1">
            <span>{error}</span>
          </div>
          <button onClick={() => setError('')} className="text-rose-500 hover:text-rose-700 font-bold ml-2">✕</button>
        </div>
      )}
      {/* Header Banner */}
      <div className="flex flex-col gap-4 rounded-3xl border border-[#071a33]/10 bg-white p-6 shadow-xs sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#faf6ec] text-[#b08a3c]">
            <ShieldCheck size={24} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#b08a3c]">
                Espacio de Administración
              </p>
              <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-bold text-slate-600">
                Uso Restringido
              </span>
            </div>
            <h2 className="text-xl font-bold text-[#071a33]">
              Gestión de Solicitudes de Registro de Propietarios
            </h2>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-2 text-xs font-bold text-amber-800">
            {pendingCount} Pendiente(s) por verificar
          </span>
        </div>
      </div>

      {/* Invitations Management Card */}
      {activeInvite ? (
        <div className="rounded-3xl border border-[#071a33]/10 bg-white p-6 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#faf6ec] text-[#b08a3c] font-bold">
              <KeyRound size={24} />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#b08a3c]">
                Código de Invitación Activo
              </p>
              <div className="flex flex-wrap items-center gap-2.5 mt-0.5">
                <span className="text-2xl font-mono font-black text-[#071a33] tracking-widest bg-slate-100 px-3 py-1 rounded-xl border border-slate-200">
                  {activeInvite.code}
                </span>
                <span className="text-xs font-semibold text-slate-500">
                  Vence el {formatDateTime(activeInvite.expiresAt)}
                </span>
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={handleRevokeInvite}
            disabled={loading}
            className="inline-flex items-center gap-1.5 rounded-xl border border-rose-300 bg-rose-50 px-4 py-2.5 text-xs font-bold text-rose-800 transition hover:bg-rose-100 cursor-pointer shadow-2xs w-full md:w-auto justify-center"
          >
            <XCircle size={15} className="text-rose-700" /> Revocar Código
          </button>
        </div>
      ) : (
        <div className="rounded-3xl border border-[#071a33]/10 bg-white p-6 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 font-bold">
              <LockKeyhole size={24} />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-rose-600">
                Sin Código de Invitación Activo
              </p>
              <p className="text-xs font-medium text-slate-500 mt-0.5">
                Los nuevos propietarios no podrán registrarse hasta que generes un código temporal.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 w-full md:w-auto">
            <select
              value={ttlHours}
              onChange={(e) => setTtlHours(Number(e.target.value))}
              className="rounded-xl border border-slate-200 bg-[#fbfaf7] px-3 py-2.5 text-xs font-bold text-slate-700 outline-none focus:border-[#b08a3c]"
            >
              <option value={1}>Validez: 1 Hora</option>
              <option value={5}>Validez: 5 Horas</option>
              <option value={24}>Validez: 24 Horas</option>
              <option value={48}>Validez: 48 Horas</option>
            </select>
            <button
              type="button"
              onClick={handleGenerateInvite}
              disabled={loading}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#071a33] px-4 py-2.5 text-xs font-bold text-white transition hover:bg-[#b08a3c] shadow-xs cursor-pointer whitespace-nowrap"
            >
              Generar Código
            </button>
          </div>
        </div>
      )}

      {/* Metrics & Filter Bar */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between rounded-2xl border border-[#071a33]/10 bg-white p-4">
        {/* Search Input */}
        <div className="flex flex-1 items-center gap-2 rounded-xl border border-slate-200 bg-[#fbfaf7] px-3.5 py-2.5">
          <Search size={16} className="text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por folio, propietario, inmueble, cédula o correo…"
            className="w-full bg-transparent text-xs font-medium outline-none placeholder:text-slate-400"
          />
        </div>

        {/* Status Filters */}
        <div className="flex flex-wrap items-center gap-1.5 rounded-xl bg-slate-100 p-1 text-xs font-bold">
          <button
            type="button"
            onClick={() => setStatusFilter('ALL')}
            className={`rounded-lg px-3.5 py-2 transition ${
              statusFilter === 'ALL'
                ? 'bg-[#071a33] text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Todas ({requests.length})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('PENDING')}
            className={`rounded-lg px-3.5 py-2 transition ${
              statusFilter === 'PENDING'
                ? 'bg-amber-600 text-white shadow-2xs'
                : 'text-slate-600 hover:text-amber-700'
            }`}
          >
            Pendientes ({pendingCount})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('APPROVED')}
            className={`rounded-lg px-3.5 py-2 transition ${
              statusFilter === 'APPROVED'
                ? 'bg-emerald-600 text-white shadow-2xs'
                : 'text-slate-600 hover:text-emerald-700'
            }`}
          >
            Aprobadas ({approvedCount})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('REJECTED')}
            className={`rounded-lg px-3.5 py-2 transition ${
              statusFilter === 'REJECTED'
                ? 'bg-rose-600 text-white shadow-2xs'
                : 'text-slate-600 hover:text-rose-700'
            }`}
          >
            Rechazadas ({rejectedCount})
          </button>
        </div>
      </div>

      {/* Requests Cards List */}
      <div className="grid gap-4">
        {filtered.map((req) => {
          const isPending = req.status === 'PENDING';
          const isApproved = req.status === 'APPROVED';
          const isRejected = req.status === 'REJECTED';

          return (
            <article
              key={req.id}
              className="rounded-2xl border border-[#071a33]/10 bg-white p-5 shadow-2xs transition hover:border-[#b08a3c]/40"
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="space-y-2.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-[#faf6ec] px-3.5 py-1 text-xs font-bold text-[#725421] border border-[#d8c28e]">
                      Nº Folio: {req.folioNumber || req.id}
                    </span>

                    {isPending && (
                      <span className="rounded-full bg-amber-50 px-3 py-1 text-[11px] font-bold text-amber-700 border border-amber-200">
                        ● Pendiente de verificación por Administración
                      </span>
                    )}
                    {isApproved && (
                      <span className="rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-bold text-emerald-700 border border-emerald-200">
                        ✓ Aprobada y Vinculada
                      </span>
                    )}
                    {isRejected && (
                      <span className="rounded-full bg-rose-50 px-3 py-1 text-[11px] font-bold text-rose-700 border border-rose-200">
                        ✕ Rechazada
                      </span>
                    )}
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-[#071a33]">
                      {req.fullName}
                    </h3>
                    <p className="text-xs font-semibold text-slate-500 mt-0.5">
                      Inmueble: <b className="text-[#071a33]">{req.propertyCode}</b> · Documento: {req.docType}-{req.docNumber}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600">
                    <span className="inline-flex items-center gap-1.5">
                      <Mail size={14} className="text-[#b08a3c]" /> {req.email}
                    </span>
                    {req.phone && (
                      <span className="inline-flex items-center gap-1.5">
                        <Phone size={14} className="text-[#b08a3c]" /> {req.phone}
                      </span>
                    )}
                    <span className="text-slate-400">
                      Fecha solicitud: {formatDateTime(req.createdAt)}
                    </span>
                  </div>

                  {isApproved && (
                    <div className="inline-flex items-center gap-2 rounded-xl bg-emerald-50 px-3.5 py-2 text-xs font-bold text-emerald-800 border border-emerald-200">
                      <ShieldCheck size={15} /> PIN temporal enviado confidencialmente al correo del propietario (Protegido por privacidad)
                    </div>
                  )}

                  {isRejected && req.rejectionReason && (
                    <div className="rounded-xl bg-rose-50 px-3.5 py-2 text-xs font-semibold text-rose-800 border border-rose-200">
                      <b>Motivo del rechazo:</b> {req.rejectionReason}
                    </div>
                  )}
                </div>

                {/* Actions Panel */}
                <div className="flex flex-wrap items-center gap-2 lg:flex-col lg:items-end">
                  <button
                    type="button"
                    onClick={() => setSelectedHtmlMailRequest(req)}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-[#fbfaf7] px-4 py-2.5 text-xs font-bold text-slate-700 transition hover:bg-slate-100 cursor-pointer"
                  >
                    <Mail size={15} className="text-[#b08a3c]" /> Ver Correo HTML
                  </button>

                  {isApproved && (
                    <div className="flex flex-wrap items-center gap-2 lg:flex-col lg:items-end">
                      <button
                        type="button"
                        onClick={() => handleResendPin(req)}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-amber-300 bg-amber-50 px-3.5 py-2.5 text-xs font-bold text-amber-800 transition hover:bg-amber-100 cursor-pointer shadow-2xs"
                      >
                        <RefreshCw
                          size={14}
                          className={
                            resentSuccessId === req.id
                              ? 'animate-spin text-amber-700'
                              : 'text-amber-700'
                          }
                        />
                        {resentSuccessId === req.id
                          ? '¡PIN Reenviado al Correo!'
                          : 'Reenviar PIN Temporal'}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleRevokeAccess(req)}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-rose-300 bg-rose-50 px-3.5 py-2.5 text-xs font-bold text-rose-800 transition hover:bg-rose-100 cursor-pointer shadow-2xs"
                      >
                        <XCircle size={15} className="text-rose-700" />
                        Revocar Acceso
                      </button>
                    </div>
                  )}

                  {isPending && (
                    <div className="flex flex-wrap items-center gap-2 lg:flex-col lg:items-end">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setApprovingReq(req)}
                          className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-emerald-700 shadow-xs cursor-pointer"
                        >
                          <UserCheck size={15} /> Aprobar Solicitud
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setRejectingReq(req);
                            setRejectReason('');
                          }}
                          className="inline-flex items-center gap-1.5 rounded-xl bg-rose-600 px-3.5 py-2.5 text-xs font-bold text-white transition hover:bg-rose-700 shadow-xs cursor-pointer"
                        >
                          <XCircle size={15} /> Rechazar
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setManualLinkReq(req);
                          loadCommunityPeople();
                        }}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-[#fbfaf7] px-4 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-100 cursor-pointer w-full text-center justify-center lg:w-auto"
                      >
                        <User size={14} className="text-[#b08a3c]" /> Vincular Manualmente
                      </button>
                    </div>
                  )}
                  {req.status !== 'REJECTED' && req.identityDocumentExpiresAt &&
                    new Date(req.identityDocumentExpiresAt).getTime() > Date.now() && (
                      <button
                        type="button"
                        onClick={() => void handleViewIdentityDocument(req.id)}
                        disabled={identityDocumentLoadingId === req.id}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-[#b08a3c]/50 bg-[#faf6ec] px-3.5 py-2.5 text-xs font-bold text-[#725421] transition hover:bg-[#f3ead5] disabled:opacity-60"
                      >
                        <Eye size={14} />
                        {identityDocumentLoadingId === req.id ? 'Abriendo foto…' : 'Ver foto de cédula'}
                      </button>
                    )}
                </div>
              </div>
            </article>
          );
        })}

        {!filtered.length && (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white/60 p-12 text-center">
            <p className="text-sm font-semibold text-slate-500">
              No se encontraron solicitudes de registro en este estado.
            </p>
          </div>
        )}
      </div>

      {/* Modal Prompt para Motivo de Rechazo */}
      {rejectingReq && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#071a33]/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-[#071a33]">
                Rechazar Solicitud {rejectingReq.folioNumber}
              </h3>
              <button
                type="button"
                onClick={() => setRejectingReq(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleConfirmReject} className="space-y-3">
              <p className="text-xs text-slate-500 leading-5">
                Ingresa la justificación formal para rechazar la solicitud de <b>{rejectingReq.fullName}</b> para el inmueble <b>{rejectingReq.propertyCode}</b>:
              </p>

              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Ejemplo: La cédula de identidad adjunta no coincide con el propietario registrado en el expediente catastral."
                className="w-full h-24 rounded-xl border border-slate-200 p-3 text-xs outline-none focus:border-rose-500"
                required
              />

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRejectingReq(null)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-rose-700 cursor-pointer"
                >
                  Confirmar Rechazo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Visor Modal Correo HTML de Registro (Folio) */}
      {selectedHtmlMailRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#071a33]/70 p-4 backdrop-blur-sm">
          <div className="flex h-[88vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl">
            <header className="flex items-center justify-between border-b border-slate-200 bg-[#071a33] px-6 py-4 text-white">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#f0cf77]">
                  CASA Mail Dispatcher
                </p>
                <h3 className="text-sm font-bold text-white">
                  Comprobante de Correo Enviado al Propietario (Folio {selectedHtmlMailRequest.folioNumber})
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedHtmlMailRequest(null)}
                className="rounded-full bg-white/10 p-2 text-white transition hover:bg-white/20"
              >
                ✕
              </button>
            </header>
            <div className="flex-1 overflow-auto p-4 bg-slate-100">
              <iframe
                title="Vista previa correo HTML"
                srcDoc={renderOwnerRegistrationEmailHtml(selectedHtmlMailRequest)}
                className="h-full w-full rounded-xl border border-slate-200 shadow-xs bg-white"
              />
            </div>
            <footer className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-6 py-3 text-xs font-semibold text-slate-500">
              <span>Destinatario: <b>{selectedHtmlMailRequest.email}</b></span>
              <button
                type="button"
                onClick={() => setSelectedHtmlMailRequest(null)}
                className="rounded-xl bg-[#0b1d33] px-4 py-2 text-xs font-bold text-white transition hover:bg-[#14365d]"
              >
                Cerrar Visor
              </button>
            </footer>
          </div>
        </div>
      )}

      {/* Visor Modal Correo HTML de Aprobación */}
      {selectedApprovalMailRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#071a33]/70 p-4 backdrop-blur-sm">
          <div className="flex h-[88vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl">
            <header className="flex items-center justify-between border-b border-slate-200 bg-[#071a33] px-6 py-4 text-white">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#f0cf77]">
                  CASA Mail Dispatcher — Notificación de Aprobación
                </p>
                <h3 className="text-sm font-bold text-white">
                  Correo de Aprobación enviado a {selectedApprovalMailRequest.request.email}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedApprovalMailRequest(null)}
                className="rounded-full bg-white/10 p-2 text-white transition hover:bg-white/20"
              >
                ✕
              </button>
            </header>
            <div className="flex-1 overflow-auto bg-slate-100 p-4">
              {selectedApprovalMailRequest.hasExistingAccount ? (
                <div className="mx-auto max-w-xl rounded-2xl border border-amber-200 bg-white p-6 text-sm leading-6 text-slate-600 shadow-xs">
                  <div className="flex items-center gap-3 text-[#071a33]">
                    <ShieldCheck size={20} className="text-[#b08a3c]" />
                    <h4 className="font-bold">Cuenta CASA existente</h4>
                  </div>
                  <p className="mt-4">{selectedApprovalMailRequest.message}</p>
                  <p className="mt-3">El propietario debe ingresar con su contraseña actual tanto al acceso de personal como al Portal del Propietario.</p>
                </div>
              ) : (
                <iframe
                  title="Vista previa correo aprobación HTML"
                  srcDoc={renderOwnerApprovalEmailHtml(
                    selectedApprovalMailRequest.request,
                    '••••••',
                  )}
                  className="h-full w-full rounded-xl border border-slate-200 bg-white shadow-xs"
                />
              )}
            </div>
            <footer className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-6 py-3 text-xs font-semibold text-slate-500">
              <span>
                {selectedApprovalMailRequest.hasExistingAccount
                  ? 'Contraseña actual conservada; acceso de propietario vinculado.'
                  : <>PIN generado y enviado: <b className="font-mono tracking-widest text-slate-600">•••••• (Secreto del Propietario)</b></>}
              </span>
              <button
                type="button"
                onClick={() => setSelectedApprovalMailRequest(null)}
                className="rounded-xl bg-[#0b1d33] px-4 py-2 text-xs font-bold text-white transition hover:bg-[#14365d]"
              >
                Cerrar Visor
              </button>
            </footer>
          </div>
        </div>
      )}

      {/* Modal de Confirmación de Aprobación */}
      {approvingReq && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#071a33]/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl border border-slate-100">
            <header className="bg-[#071a33] px-6 py-5 text-white">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#f0cf77]">
                Confirmación de Aprobación
              </p>
              <h3 className="text-lg font-bold text-white mt-1">
                Validar Datos del Registro
              </h3>
            </header>
            
            <div className="p-6 space-y-6">
              {/* Solicitante */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Datos Solicitados</h4>
                <div className="rounded-2xl bg-slate-50 border border-slate-100 p-4 space-y-2.5 text-sm">
                  <div className="flex justify-between"><span className="text-slate-500">Nombre:</span><span className="font-semibold text-slate-800">{approvingReq.fullName}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Documento:</span><span className="font-semibold text-slate-800">{approvingReq.docType}-{approvingReq.docNumber}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Correo:</span><span className="font-semibold text-slate-800">{approvingReq.email}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Inmueble:</span><span className="font-bold text-[#b08a3c]">Apto. {approvingReq.propertyCode}</span></div>
                </div>
              </div>

              {/* Persona en Directorio */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Coincidencia en el Directorio</h4>
                {matchingPerson ? (
                  <div className="rounded-2xl bg-slate-50 border border-slate-100 p-4 space-y-3 text-sm">
                    <div className="flex justify-between"><span className="text-slate-500">Persona encontrada:</span><span className="font-semibold text-slate-800">{matchingPerson.firstName} {matchingPerson.lastName}</span></div>
                    <div className="flex justify-between"><span className="text-slate-500">Documento registrado:</span><span className="font-semibold text-slate-800">{matchingPerson.documentType}-{matchingPerson.documentNumber}</span></div>
                    <div className="flex justify-between"><span className="text-slate-500">Inmuebles asociados:</span><span className="font-semibold text-slate-800">{matchingPerson.properties?.join(', ') || 'Ninguno'}</span></div>
                    
                    {/* Alícuotas / Propiedad confirmada check */}
                    <div className="pt-2 border-t border-slate-200/60">
                      {matchingPerson.properties?.includes(approvingReq.propertyCode) ? (
                        <div className="flex items-center gap-2 text-xs text-emerald-800 bg-emerald-50 border border-emerald-100 rounded-xl p-2.5">
                          <ShieldCheck size={16} className="text-emerald-600 shrink-0" />
                          <span className="font-bold">Coincidencia de Inmueble Confirmada</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-xs text-amber-800 bg-amber-50 border border-amber-100 rounded-xl p-2.5">
                          <AlertTriangle size={16} className="text-amber-600 shrink-0" />
                          <span className="font-bold">Inmueble solicitado no coincide con los del directorio</span>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-xs text-rose-800 bg-rose-50 border border-rose-100 rounded-2xl p-4">
                    <AlertTriangle size={20} className="text-rose-600 shrink-0" />
                    <div>
                      <p className="font-bold">No se encontró ninguna coincidencia en el directorio</p>
                      <p className="text-slate-500 mt-1 leading-normal">Se recomienda realizar la vinculación manual para asociar a la persona correcta.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <footer className="bg-slate-50 border-t border-slate-100 px-6 py-4 flex flex-wrap gap-2 justify-end">
              <button
                type="button"
                onClick={() => setApprovingReq(null)}
                className="rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 px-4 py-2.5 text-xs font-bold transition cursor-pointer"
              >
                Cancelar
              </button>
              
              <button
                type="button"
                onClick={() => {
                  const req = approvingReq;
                  setApprovingReq(null);
                  setManualLinkReq(req);
                  loadCommunityPeople();
                }}
                className="rounded-xl border border-[#b08a3c] bg-amber-50 hover:bg-amber-100 text-[#8c6b28] px-4 py-2.5 text-xs font-bold transition cursor-pointer"
              >
                Vincular Manualmente
              </button>

              <button
                type="button"
                onClick={() => {
                  const req = approvingReq;
                  setApprovingReq(null);
                  setRejectingReq(req);
                  setRejectReason('');
                }}
                className="rounded-xl bg-rose-600 hover:bg-rose-700 text-white px-4 py-2.5 text-xs font-bold transition cursor-pointer"
              >
                Rechazar
              </button>

              <button
                type="button"
                onClick={() => {
                  const req = approvingReq;
                  setApprovingReq(null);
                  handleApprove(req);
                }}
                className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 text-xs font-bold transition cursor-pointer"
              >
                Confirmar Aprobación
              </button>
            </footer>
          </div>
        </div>
      )}

      {identityDocumentPreview && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-[#071a33]/85 p-4" role="dialog" aria-modal="true" aria-label="Foto de cédula adjunta">
          <div className="flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
            <header className="flex items-center justify-between border-b border-slate-200 px-5 py-3">
              <div>
                <h2 className="text-sm font-bold text-[#071a33]">Foto de cédula</h2>
                <p className="text-[11px] text-slate-500">Documento confidencial para evaluación de esta comunidad</p>
              </div>
              <button type="button" onClick={() => setIdentityDocumentPreview(null)} className="rounded-lg px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100">Cerrar</button>
            </header>
            <div className="flex min-h-0 flex-1 items-center justify-center overflow-auto bg-slate-100 p-3">
              <img src={identityDocumentPreview} alt="Documento de identidad adjunto a la solicitud" className="max-h-[78vh] max-w-full object-contain" />
            </div>
          </div>
        </div>
      )}

      {/* Modal de Vinculación Manual */}
      {manualLinkReq && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#071a33]/70 p-4 backdrop-blur-sm">
          <div className="flex h-[88vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl">
            <header className="flex items-center justify-between border-b border-slate-200 bg-[#071a33] px-6 py-4 text-white">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#f0cf77]">
                  VINCULACIÓN MANUAL DE PROPIETARIO
                </p>
                <h3 className="text-sm font-bold text-white">
                  Asociar solicitud Folio {manualLinkReq.folioNumber || manualLinkReq.id}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setManualLinkReq(null);
                  setSelectedPerson(null);
                  setSelectedProperty(null);
                  setSearchTerm('');
                }}
                className="rounded-full bg-white/10 p-2 text-white transition hover:bg-white/20"
              >
                ✕
              </button>
            </header>

            <div className="flex-1 overflow-auto p-6 space-y-6">
              {/* Context Summary */}
              <div className="rounded-2xl border border-[#b08a3c]/30 bg-[#faf6ec] p-4 text-xs">
                <h4 className="font-bold text-[#725421] mb-2 uppercase tracking-wider">
                  Datos de la Solicitud del Propietario
                </h4>
                <div className="grid gap-2 sm:grid-cols-2">
                  <div>
                    <span className="text-slate-400 block">Propietario registrado:</span>
                    <strong className="text-[#071a33] text-sm">{manualLinkReq.fullName}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Inmueble solicitado:</span>
                    <strong className="text-[#071a33] text-sm">{manualLinkReq.propertyCode}</strong>
                  </div>
                  <div className="sm:col-span-2 mt-1 pt-2 border-t border-[#b08a3c]/15">
                    <span className="text-slate-400 block">Cédula ingresada:</span>
                    <strong className="text-[#071a33]">{manualLinkReq.docType}-{manualLinkReq.docNumber}</strong>
                  </div>
                </div>
              </div>

              {selectedPerson ? (
                /* Confirmation Screen */
                <div className="space-y-4">
                  <div className="rounded-2xl border border-slate-200 p-5 space-y-4 bg-slate-50">
                    <h4 className="text-sm font-bold text-[#071a33] border-b border-slate-200 pb-2">
                      Confirmación y Asociación de Acceso
                    </h4>
                    <div className="space-y-3 text-xs leading-relaxed">
                      <div>
                        <span className="text-slate-400 block">Persona seleccionada del directorio:</span>
                        <strong className="text-[#071a33] text-sm">
                          {selectedPerson.firstName} {selectedPerson.lastName}
                        </strong>
                        <span className="text-slate-500 block">
                          Documento: {selectedPerson.documentType}-{selectedPerson.documentNumber}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Inmuebles vinculados en directorio:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {selectedPerson.properties.map((code: string) => (
                            <span key={code} className="rounded-full bg-slate-200 px-2.5 py-0.5 font-bold text-slate-700">
                              {code}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="text-slate-400 block" htmlFor="manual-property">Inmueble oficial a vincular:</label>
                        <select
                          id="manual-property"
                          value={selectedProperty?.id ?? ''}
                          onChange={(event) =>
                            setSelectedProperty(
                              communityProperties.find((property) => property.id === event.target.value) ?? null,
                            )
                          }
                          className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm font-bold text-[#071a33] outline-none focus:border-[#b08a3c]"
                          required
                        >
                          <option value="">Selecciona el inmueble correcto</option>
                          {communityProperties.map((property) => (
                            <option key={property.id} value={property.id}>{property.code}</option>
                          ))}
                        </select>
                      </div>
                      {(manualLinkReq.fullName.trim().toLowerCase() !== `${selectedPerson.firstName} ${selectedPerson.lastName}`.trim().toLowerCase() ||
                        `${manualLinkReq.docType}-${manualLinkReq.docNumber}`.replace(/[^a-z0-9]/gi, '').toLowerCase() !== `${selectedPerson.documentType}-${selectedPerson.documentNumber}`.replace(/[^a-z0-9]/gi, '').toLowerCase() ||
                        (selectedProperty && manualLinkReq.propertyCode.trim().toLowerCase() !== selectedProperty.code.trim().toLowerCase())) && (
                        <div className="rounded-xl border border-amber-300 bg-amber-50 p-3 text-[11px] text-amber-900">
                          <p className="font-bold">Se reemplazarán datos declarados por los registros oficiales:</p>
                          {manualLinkReq.fullName.trim().toLowerCase() !== `${selectedPerson.firstName} ${selectedPerson.lastName}`.trim().toLowerCase() && <p className="mt-1">Nombre: “{manualLinkReq.fullName}” → “{selectedPerson.firstName} {selectedPerson.lastName}”</p>}
                          {`${manualLinkReq.docType}-${manualLinkReq.docNumber}`.replace(/[^a-z0-9]/gi, '').toLowerCase() !== `${selectedPerson.documentType}-${selectedPerson.documentNumber}`.replace(/[^a-z0-9]/gi, '').toLowerCase() && <p className="mt-1">Documento: “{manualLinkReq.docType}-{manualLinkReq.docNumber}” → “{selectedPerson.documentType}-{selectedPerson.documentNumber}”</p>}
                          {selectedProperty && manualLinkReq.propertyCode.trim().toLowerCase() !== selectedProperty.code.trim().toLowerCase() && <p className="mt-1">Inmueble: “{manualLinkReq.propertyCode}” → “{selectedProperty.code}”</p>}
                        </div>
                      )}
                      <div className="rounded-xl bg-amber-50 border border-amber-200 p-3 text-amber-800 text-[11px] font-semibold flex gap-2">
                        <Info size={16} className="shrink-0 text-amber-600 mt-0.5" />
                        <div>
                          Se creará una cuenta de acceso para <strong>{manualLinkReq.email}</strong> vinculada a esta persona y se despachará el PIN temporal por correo.
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedPerson(null);
                        setSelectedProperty(null);
                      }}
                      className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
                    >
                      Volver a Buscar
                    </button>
                    <button
                      type="button"
                      onClick={() => handleManualLinkSubmit()}
                      disabled={loading || !selectedProperty}
                      className="flex-1 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-emerald-700 cursor-pointer transition disabled:opacity-50 text-center"
                    >
                      {loading ? 'Procesando...' : 'Aceptar y Vincular Acceso'}
                    </button>
                  </div>
                </div>
              ) : (
                /* Search / Directory List */
                <div className="space-y-4">
                  <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-[#fbfaf7] px-3.5 py-2.5">
                    <Search size={16} className="text-slate-400" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Buscar persona por nombre, cédula o apartamento…"
                      className="w-full bg-transparent text-xs font-medium outline-none placeholder:text-slate-400"
                    />
                  </div>

                  {modalLoading ? (
                    <div className="py-12 text-center text-xs font-medium text-slate-400">
                      Cargando directorio de la comunidad...
                    </div>
                  ) : (
                    <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white max-h-[40vh] overflow-y-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-bold border-b border-slate-200">
                          <tr>
                            <th className="px-4 py-2.5">Persona</th>
                            <th className="px-4 py-2.5">Documento</th>
                            <th className="px-4 py-2.5">Inmuebles</th>
                            <th className="px-4 py-2.5 text-right">Acción</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-medium">
                          {peopleList
                            .filter((p) => {
                              if (!searchTerm.trim()) return true;
                              const q = searchTerm.toLowerCase();
                              return (
                                `${p.firstName} ${p.lastName}`.toLowerCase().includes(q) ||
                                p.documentNumber.includes(q) ||
                                p.properties.some((code: string) => code.toLowerCase().includes(q))
                              );
                            })
                            .map((p) => {
                              return (
                                <tr key={p.id} className="hover:bg-slate-50 transition">
                                  <td className="px-4 py-3 font-semibold text-slate-800">
                                    {p.firstName} {p.lastName}
                                  </td>
                                  <td className="px-4 py-3 text-slate-500">
                                    {p.documentType}-{p.documentNumber}
                                  </td>
                                  <td className="px-4 py-3">
                                    <div className="flex flex-wrap gap-1">
                                      {p.properties.length > 0 ? (
                                        p.properties.map((code: string) => (
                                          <span key={code} className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] text-slate-600 font-bold border border-slate-200">
                                            {code}
                                          </span>
                                        ))
                                      ) : (
                                        <span className="text-rose-500 text-[10px]">Sin inmueble</span>
                                      )}
                                    </div>
                                  </td>
                                  <td className="px-4 py-3 text-right">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setSelectedPerson(p);
                                        const exactProperty = communityProperties.find(
                                          (property) =>
                                            p.properties.includes(property.code) &&
                                            property.code.trim().toLowerCase() === manualLinkReq.propertyCode.trim().toLowerCase(),
                                        );
                                        setSelectedProperty(exactProperty ?? null);
                                      }}
                                      className="rounded-lg bg-[#071a33] px-2.5 py-1 text-[11px] font-bold text-white transition hover:bg-[#b08a3c] cursor-pointer"
                                      title="Seleccionar esta persona y revisar el inmueble correcto"
                                    >
                                      Seleccionar
                                    </button>
                                  </td>
                                </tr>
                              );
                            })}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {selectedPerson === null && searchTerm.trim() && (
                    <div className="rounded-xl bg-amber-50 border border-amber-200 p-3 text-amber-800 text-[11px] font-medium flex gap-2">
                      <Info size={16} className="shrink-0 text-amber-600 mt-0.5" />
                      <div>
                        Si no encuentras al propietario, verifica primero que esté registrado en la pestaña <strong>Directorio</strong> del Núcleo de la comunidad y posea un vínculo de propiedad vigente.
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <footer className="flex items-center justify-end border-t border-slate-200 bg-slate-50 px-6 py-4">
              <button
                type="button"
                onClick={() => {
                  setManualLinkReq(null);
                  setSelectedPerson(null);
                  setSearchTerm('');
                }}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                Cerrar
              </button>
            </footer>
          </div>
        </div>
      )}
    </section>
  );
}
