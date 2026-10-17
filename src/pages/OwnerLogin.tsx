import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Eye,
  KeyRound,
  LockKeyhole,
  Mail,
  UploadCloud,
  ChevronRight,
} from 'lucide-react';
import { CasaAuthService } from '../services/CasaAuthService';
import { casaApi, casaErrorMessage } from '../services/CasaAuthService';

import {
  sanitizeText,
  sanitizeDocNumber,
  containsScriptInjection,
  isValidEmail,
  isValidRegistrationEmail,
} from '../utils/securityUtils';
import { renderOwnerRegistrationEmailHtml } from '../utils/emailTemplates';
import { prepareIdentityImage } from '../utils/identityImage';

export interface OwnerAccessRequest {
  id: string;
  folioNumber: string;
  docType: string;
  docNumber: string;
  fullName: string;
  propertyCode: string;
  email: string;
  phone: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
  identityDocumentExpiresAt?: string;
  identityDocumentSizeBytes?: number | null;
  tempPin?: string;
  approvedAt?: string;
  rejectedAt?: string;
  rejectionReason?: string;
  emailDispatched?: boolean;
}

export default function OwnerLogin() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<'login' | 'register'>('login');

  // Community selection state
  const [communityOptions, setCommunityOptions] = useState<any[]>([]);
  const [tempAuthToken, setTempAuthToken] = useState<string>('');
  const [tempRefreshToken, setTempRefreshToken] = useState<string>('');
  const [tempAuthUser, setTempAuthUser] = useState<any>(null);

  // Login form state
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Temporary PIN change password modal state
  const [showPasswordResetModal, setShowPasswordResetModal] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Register form state
  const [regDocType, setRegDocType] = useState('V');
  const [regDocNumber, setRegDocNumber] = useState('');
  const [regFullName, setRegFullName] = useState('');
  const [regPropertyCode, setRegPropertyCode] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regInviteCode, setRegInviteCode] = useState('');
  const [regSuccess, setRegSuccess] = useState<OwnerAccessRequest | null>(null);
  const [identityDocument, setIdentityDocument] = useState<File | null>(null);
  const [identityDocumentPreview, setIdentityDocumentPreview] = useState('');
  const [preparingIdentityDocument, setPreparingIdentityDocument] = useState(false);
  useEffect(() => {
    if (!identityDocumentPreview) return;
    return () => URL.revokeObjectURL(identityDocumentPreview);
  }, [identityDocumentPreview]);

  const handleIdentityDocumentChange = async (file: File | null) => {
    setError('');
    setIdentityDocument(null);
    setIdentityDocumentPreview('');
    if (!file) return;

    setPreparingIdentityDocument(true);
    try {
      const prepared = await prepareIdentityImage(file);
      setIdentityDocument(prepared);
      setIdentityDocumentPreview(URL.createObjectURL(prepared));
    } catch (prepareError) {
      setError(prepareError instanceof Error ? prepareError.message : 'No se pudo preparar la foto.');
    } finally {
      setPreparingIdentityDocument(false);
    }
  };
  const registrationEmailState = !regEmail.trim()
    ? 'idle'
    : isValidRegistrationEmail(regEmail)
      ? 'valid'
      : 'invalid';

  const handleLoginSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      const trimmedUser = username.trim().toLowerCase();
      const loginResult = await CasaAuthService.login(trimmedUser, password);
      
      if (!loginResult.success) {
        setError(loginResult.error || 'No pudimos validar tus credenciales o el PIN ingresado.');
        setLoading(false);
        return;
      }

      const user = loginResult.data.user;
      const ownerRoles = ['OWNER', 'PROPIETARIO', 'RESIDENT', 'RESIDENTE'];

      // Fetch contexts to verify if the user has an OWNER role in any community
      const contextsResult = await CasaAuthService.contexts(loginResult.data.accessToken);
      if (!contextsResult.success || !Array.isArray(contextsResult.data)) {
        setError(contextsResult.error || 'No se pudo obtener el listado de comunidades del usuario.');
        setLoading(false);
        return;
      }

      const ownerCtxs = contextsResult.data.filter(
        (c) =>
          c.relationTypes?.includes('OWNER') ||
          ownerRoles.includes(String(c.roleCode).trim().toUpperCase())
      );

      if (ownerCtxs.length === 0) {
        setError('Esta cuenta no tiene acceso al portal de propietarios en ninguna comunidad.');
      } else if (ownerCtxs.length === 1) {
        // Only one community - auto-select and login directly
        const targetCommunityId = ownerCtxs[0].communityId;
        const selectResult = await CasaAuthService.selectContext(loginResult.data.accessToken, targetCommunityId);
        if (selectResult.success) {
          sessionStorage.setItem(
            'casa_owner_session',
            JSON.stringify({ 
              token: selectResult.data.accessToken, 
              user,
              refreshToken: loginResult.data.refreshToken,
              communityId: targetCommunityId
            }),
          );
          navigate('/portal', { replace: true });
        } else {
          setError(selectResult.error || 'No se pudo vincular el contexto de la comunidad.');
        }
      } else {
        // Multiple communities - prompt user to select
        setCommunityOptions(ownerCtxs);
        setTempAuthToken(loginResult.data.accessToken);
        setTempRefreshToken(loginResult.data.refreshToken);
        setTempAuthUser(user);
      }
    } catch {
      setError('Ocurrió un error inesperado. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectCommunity = async (communityId: string) => {
    setError('');
    setLoading(true);
    try {
      const selectResult = await CasaAuthService.selectContext(tempAuthToken, communityId);
      if (selectResult.success) {
        sessionStorage.setItem(
          'casa_owner_session',
          JSON.stringify({ 
            token: selectResult.data.accessToken, 
            user: tempAuthUser,
            refreshToken: tempRefreshToken,
            communityId
          }),
        );
        navigate('/portal', { replace: true });
      } else {
        setError(selectResult.error || 'No se pudo vincular el contexto de la comunidad.');
      }
    } catch {
      setError('Ocurrió un error inesperado al seleccionar la comunidad.');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordResetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }
    sessionStorage.setItem(
      'casa_owner_session',
      JSON.stringify({ token: 'demo-approved-token', user: { email: username, role: 'PROPIETARIO' } }),
    );
    setShowPasswordResetModal(false);
    navigate('/portal', { replace: true });
  };

  const [showEmailModal, setShowEmailModal] = useState(false);

  const handleRegisterSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');

    const rawFields = [regDocNumber, regFullName, regPropertyCode, regEmail, regPhone, regInviteCode];
    if (rawFields.some((field) => containsScriptInjection(field))) {
      setError('Por seguridad, no se permiten caracteres especiales o scripts en el formulario.');
      return;
    }

    const cleanDoc = sanitizeDocNumber(regDocNumber);
    const cleanName = sanitizeText(regFullName);
    const cleanProperty = sanitizeText(regPropertyCode);
    const cleanEmail = sanitizeText(regEmail).toLowerCase();
    const cleanPhone = sanitizeText(regPhone);
    const cleanInviteCode = sanitizeText(regInviteCode).trim().toUpperCase();

    if (!cleanDoc || !cleanName || !cleanProperty || !cleanEmail || !cleanInviteCode) {
      setError('Por favor completa todos los campos requeridos correctamente.');
      return;
    }

    if (!identityDocument) {
      setError('Adjunta una foto de tu cédula en formato JPG o PNG para continuar.');
      return;
    }
    if (identityDocument.size > 2 * 1024 * 1024) {
      setError('La foto debe pesar como máximo 2 MB.');
      return;
    }
    if (identityDocument.type && !['image/jpeg', 'image/png'].includes(identityDocument.type)) {
      setError('Adjunta una foto JPG o PNG. No se aceptan archivos PDF.');
      return;
    }

    if (!isValidEmail(cleanEmail) || !isValidRegistrationEmail(cleanEmail)) {
      setError('Ingresa un correo con un dominio público válido (ejemplo: usuario@dominio.com).');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('docType', regDocType);
      formData.append('docNumber', cleanDoc);
      formData.append('fullName', cleanName);
      formData.append('propertyCode', cleanProperty);
      formData.append('email', cleanEmail);
      formData.append('phone', cleanPhone);
      formData.append('inviteCode', cleanInviteCode);
      formData.append('identityDocument', identityDocument);
      const response = await casaApi.post('/auth/registration-requests', formData);
      setRegSuccess({
        ...response.data.request,
        docType: regDocType,
        docNumber: cleanDoc,
        fullName: cleanName,
        propertyCode: cleanProperty,
        email: cleanEmail,
        phone: cleanPhone,
        emailDispatched: response.data.emailDispatched,
      });
      setIdentityDocument(null);
    } catch (backendErr: any) {
      const msg = casaErrorMessage(backendErr, 'No se pudo registrar la solicitud. Verifica el código de invitación.');
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#f8f6f1] text-[#0b1d33]">
      <div className="grid min-h-screen lg:grid-cols-[1.05fr_0.95fr]">
        {/* Left Panel: Tech Dark Mesh Grid Background with CASA Logo */}
        <section className="relative hidden flex-col items-center justify-center overflow-hidden bg-[#051326] p-10 text-white lg:flex">
          {/* Dark Grid Mesh Pattern */}
          <div
            className="absolute inset-0 opacity-25 pointer-events-none"
            style={{
              backgroundImage: `
                radial-gradient(circle at 50% 50%, rgba(176, 138, 60, 0.35) 0%, transparent 75%),
                linear-gradient(to right, rgba(255, 255, 255, 0.08) 1px, transparent 1px),
                linear-gradient(to bottom, rgba(255, 255, 255, 0.08) 1px, transparent 1px)
              `,
              backgroundSize: '100% 100%, 48px 48px, 48px 48px',
            }}
          />

          {/* Ambient Gold Radial Glow */}
          <div className="absolute h-[420px] w-[420px] rounded-full bg-[#b08a3c]/15 blur-3xl pointer-events-none" />

          {/* Centered Content */}
          <div className="relative z-10 flex flex-col items-center text-center max-w-lg">
            <div className="mb-6 rounded-3xl border border-[#b08a3c]/35 bg-[#071a33]/85 p-6 shadow-[0_24px_80px_rgba(0,0,0,0.6)] backdrop-blur-xl">
              <img
                src="/casa-logo-institucional-dark.png"
                alt="CASA"
                className="h-auto w-full max-w-[300px] drop-shadow-2xl"
              />
            </div>

            <p className="mt-1 text-xs font-bold uppercase tracking-[0.32em] text-[#f0cf77]">
              Portal del Propietario
            </p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Tu comunidad, más cerca de ti.
            </h1>
            <p className="mt-3 text-sm leading-6 text-white/75">
              Consulta tu inmueble, avisos de cobro, alícuotas y estado de cuenta. Recibe comunicados oficiales y gestiona tus trámites desde un entorno seguro y transparente.
            </p>
          </div>
        </section>

        {/* Right Panel: Compact Login & Registration Form */}
        <section className="flex items-center justify-center px-4 py-6">
          <div className="w-full max-w-md">
            <div className="mb-4 flex items-center justify-between">
              <Link
                to="/"
                className="inline-flex items-center text-xs font-semibold text-slate-500 transition hover:text-[#0b1d33]"
              >
                <ArrowLeft className="mr-1.5" size={14} /> Volver al inicio
              </Link>
              <span className="text-[11px] font-bold text-[#b08a3c] uppercase tracking-wider">
                CASA Residencial
              </span>
            </div>

            <div className="rounded-[1.75rem] border border-[#0b1d33]/10 bg-white p-6 shadow-[0_16px_50px_rgba(8,29,51,0.06)] sm:p-7">
              {/* Header Wordmark */}
              <div className="mb-5 text-center">
                <img
                  src="/casa-wordmark-light.png"
                  alt="CASA"
                  className="mx-auto h-auto w-full max-w-[170px]"
                />

                {communityOptions.length === 0 && (
                  /* Subtitle Tab Switcher */
                  <div className="mt-4 flex rounded-xl bg-slate-100 p-1 text-xs font-bold">
                    <button
                      type="button"
                      onClick={() => {
                        setTab('login');
                        setError('');
                      }}
                      className={`flex-1 rounded-lg py-2 transition ${
                        tab === 'login'
                          ? 'bg-[#0b1d33] text-white shadow-2xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Ingresar al Portal
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setTab('register');
                        setError('');
                        setRegSuccess(null);
                      }}
                      className={`flex-1 rounded-lg py-2 transition ${
                        tab === 'register'
                          ? 'bg-[#b08a3c] text-white shadow-2xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Solicitar Registro
                    </button>
                  </div>
                )}
              </div>

              {error && (
                <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-center text-xs font-semibold text-red-700">
                  {error}
                </div>
              )}

              {communityOptions.length > 0 ? (
                <div className="space-y-4">
                  <div className="text-center">
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#b08a3c] mb-1">
                      Múltiples Comunidades Encontradas
                    </p>
                    <h3 className="text-base font-bold text-[#0b1d33]">
                      Selecciona una Comunidad
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      Tu cuenta de propietario tiene accesos activos en más de un condominio.
                    </p>
                  </div>
                  
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                    {communityOptions.map((opt) => (
                      <button
                        key={opt.communityId}
                        type="button"
                        onClick={() => handleSelectCommunity(opt.communityId)}
                        disabled={loading}
                        className="w-full text-left rounded-2xl border border-[#0b1d33]/8 bg-slate-50 hover:bg-[#f8f3e8] hover:border-[#b08a3c]/40 p-4 transition shadow-2xs flex justify-between items-center cursor-pointer group disabled:opacity-50"
                      >
                        <div className="min-w-0 pr-3">
                          <p className="font-bold text-sm text-[#0b1d33] truncate group-hover:text-[#b08a3c] transition">
                            {opt.name}
                          </p>
                          <p className="text-xs text-slate-500 mt-0.5">
                            RIF: {opt.rif || '—'}
                          </p>
                        </div>
                        <ChevronRight size={18} className="text-[#b08a3c] group-hover:translate-x-0.5 transition shrink-0" />
                      </button>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setCommunityOptions([]);
                      setTempAuthToken('');
                      setTempAuthUser(null);
                      setError('');
                    }}
                    className="w-full rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 py-3 text-xs font-bold transition cursor-pointer"
                  >
                    Volver a Iniciar Sesión
                  </button>
                </div>
              ) : (
                <>
                  {/* TAB 1: LOGIN */}
                  {tab === 'login' && (
                    <form className="space-y-3.5" onSubmit={handleLoginSubmit}>
                      <label className="block">
                        <span className="mb-1 block text-xs font-bold text-slate-700">
                          Correo electrónico o usuario
                        </span>
                        <div className="flex items-center gap-2.5 rounded-xl border border-slate-200 bg-[#fbfaf7] px-3.5 py-2.5 focus-within:border-[#b08a3c]">
                          <Mail size={16} className="text-[#b08a3c]" />
                          <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full bg-transparent text-xs outline-none placeholder:text-slate-400"
                            placeholder="propietario@correo.com"
                            autoComplete="username"
                            required
                          />
                        </div>
                      </label>

                      <label className="block">
                        <div className="mb-1 flex items-center justify-between text-xs">
                          <span className="font-bold text-slate-700">
                              PIN temporal de 8 dígitos o Contraseña
                          </span>
                          <Link
                            to="/restablecer-clave?type=owner"
                            className="font-bold text-[#b08a3c] hover:underline"
                          >
                            ¿Olvidaste tu contraseña?
                          </Link>
                        </div>
                        <div className="flex items-center gap-2.5 rounded-xl border border-slate-200 bg-[#fbfaf7] px-3.5 py-2.5 focus-within:border-[#b08a3c]">
                          <LockKeyhole size={16} className="text-[#b08a3c]" />
                          <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-transparent text-xs outline-none placeholder:text-slate-400"
                            placeholder="Contraseña o PIN asignado"
                            autoComplete="current-password"
                            required
                          />
                        </div>
                      </label>

                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full rounded-xl bg-[#0b1d33] py-3 text-xs font-bold text-white transition hover:bg-[#14365d] disabled:opacity-70 cursor-pointer shadow-xs"
                      >
                        {loading ? 'Validando acceso…' : 'Acceder como Propietario'}
                      </button>

                      <div className="my-3 flex items-center gap-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                        <span className="h-px flex-1 bg-slate-200" />
                        o explora primero
                        <span className="h-px flex-1 bg-slate-200" />
                      </div>

                      <button
                        type="button"
                        onClick={() => navigate('/portal?demo=1')}
                        className="group flex w-full items-center justify-between rounded-xl border border-[#b08a3c]/40 bg-[#f8f3e8] px-4 py-2.5 text-xs font-bold text-[#0b1d33] transition hover:border-[#b08a3c]"
                      >
                        <span className="inline-flex items-center gap-2">
                          <Eye size={16} /> Ver demo interactiva
                        </span>
                        <ArrowRight size={15} className="transition group-hover:translate-x-1" />
                      </button>

                      <div className="pt-2 text-center border-t border-slate-100">
                        <Link
                          to="/staff-login"
                          className="text-[11px] font-bold text-slate-500 hover:text-[#0b1d33]"
                        >
                          Acceso para personal del condominio →
                        </Link>
                      </div>
                    </form>
                  )}

                  {/* TAB 2: REQUEST REGISTRATION */}
                  {tab === 'register' && (
                    <div>
                      {regSuccess ? (
                        <div className="space-y-4 text-center">
                          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                            <CheckCircle2 size={28} />
                          </div>
                          <div>
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#faf6ec] px-3.5 py-1 text-[11px] font-bold text-[#725421] border border-[#d8c28e]">
                              Nº Folio: {regSuccess.folioNumber}
                            </span>
                            <h3 className="mt-2.5 text-lg font-bold text-[#0b1d33]">
                              ¡Solicitud enviada exitosamente!
                            </h3>
                            <p className="mt-2 text-xs leading-5 text-slate-600">
                              Registramos tu solicitud para el inmueble <b>{regSuccess.propertyCode}</b> a nombre de <b>{regSuccess.fullName}</b> (Cédula: {regSuccess.docType}-{regSuccess.docNumber}).
                            </p>
                            <p className={`mt-2 rounded-xl p-3 text-[11px] leading-5 font-semibold ${regSuccess.emailDispatched === false ? 'bg-rose-50 text-rose-700' : 'bg-[#faf6ec] text-[#76571e]'}`}>
                              {regSuccess.emailDispatched === false
                                ? <>No se pudo enviar la confirmación a <u>{regSuccess.email}</u>. Tu solicitud y folio quedaron registrados; contacta a la administración para recibir la confirmación.</>
                                : <>Enviamos una confirmación por correo a <u>{regSuccess.email}</u> con tu folio asignado. Al ser aprobada por la administración, recibirás tu <b>PIN temporal de 8 dígitos</b>.</>}
                            </p>
                          </div>

                          <div className="space-y-2 pt-1">
                            <button
                              type="button"
                              onClick={() => setShowEmailModal(true)}
                              className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#b08a3c] bg-[#fffdfa] py-2.5 text-xs font-bold text-[#725421] transition hover:bg-[#faf6ec]"
                            >
                              <Mail size={15} /> Ver correo de confirmación (HTML)
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                setTab('login');
                                setUsername(regSuccess.email);
                                setRegSuccess(null);
                              }}
                              className="w-full rounded-xl bg-[#0b1d33] py-2.5 text-xs font-bold text-white transition hover:bg-[#14365d]"
                            >
                              Ir al Inicio de Sesión
                            </button>
                          </div>
                        </div>
                      ) : (
                        <form className="space-y-3" onSubmit={handleRegisterSubmit}>
                          <p className="text-xs text-slate-500 leading-4">
                            Ingresa tus datos para validar la titularidad de tu inmueble ante la administración.
                          </p>

                          <div className="grid grid-cols-[90px_1fr] gap-2">
                            <label className="block">
                              <span className="mb-1 block text-[11px] font-bold text-slate-700">Tipo</span>
                              <select
                                value={regDocType}
                                onChange={(e) => setRegDocType(e.target.value)}
                                className="w-full rounded-xl border border-slate-200 bg-[#fbfaf7] px-2.5 py-2 text-xs font-bold outline-none focus:border-[#b08a3c]"
                              >
                                <option value="V">V-</option>
                                <option value="E">E-</option>
                                <option value="J">J-</option>
                                <option value="P">P-</option>
                              </select>
                            </label>

                            <label className="block">
                              <span className="mb-1 block text-[11px] font-bold text-slate-700">
                                Cédula / RIF
                              </span>
                              <input
                                type="text"
                                value={regDocNumber}
                                onChange={(e) => setRegDocNumber(e.target.value)}
                                className="w-full rounded-xl border border-slate-200 bg-[#fbfaf7] px-3 py-2 text-xs outline-none focus:border-[#b08a3c]"
                                placeholder="12.345.678"
                                required
                              />
                            </label>
                          </div>

                          <label className="block">
                            <span className="mb-1 block text-[11px] font-bold text-slate-700">
                              Nombre y Apellido del Propietario
                            </span>
                            <input
                              type="text"
                              value={regFullName}
                              onChange={(e) => setRegFullName(e.target.value)}
                              className="w-full rounded-xl border border-slate-200 bg-[#fbfaf7] px-3 py-2 text-xs outline-none focus:border-[#b08a3c]"
                              placeholder="Ej.: Alejandro Mendoza"
                              required
                            />
                          </label>

                          <div className="grid grid-cols-2 gap-2">
                            <label className="block">
                              <span className="mb-1 block text-[11px] font-bold text-slate-700">
                                N.º / Código Inmueble
                              </span>
                              <input
                                type="text"
                                value={regPropertyCode}
                                onChange={(e) => setRegPropertyCode(e.target.value)}
                                className="w-full rounded-xl border border-slate-200 bg-[#fbfaf7] px-3 py-2 text-xs outline-none focus:border-[#b08a3c]"
                                placeholder="Ej.: B-402"
                                required
                              />
                            </label>

                            <label className="block">
                              <span className="mb-1 block text-[11px] font-bold text-slate-700">
                                Teléfono WhatsApp
                              </span>
                              <input
                                type="tel"
                                value={regPhone}
                                onChange={(e) => setRegPhone(e.target.value)}
                                className="w-full rounded-xl border border-slate-200 bg-[#fbfaf7] px-3 py-2 text-xs outline-none focus:border-[#b08a3c]"
                                placeholder="0414-5550138"
                                required
                              />
                            </label>
                          </div>

                          <label className="block">
                            <span className="mb-1 block text-[11px] font-bold text-slate-700">
                              Correo Electrónico
                            </span>
                            <input
                              type="email"
                              value={regEmail}
                              onChange={(e) => {
                                setRegEmail(e.target.value);
                                setError((current) =>
                                  current.startsWith('Ingresa un correo') ? '' : current,
                                );
                              }}
                              aria-invalid={registrationEmailState === 'invalid'}
                              className={`w-full rounded-xl border bg-[#fbfaf7] px-3 py-2 text-xs outline-none transition-colors ${registrationEmailState === 'valid' ? 'border-emerald-500 ring-1 ring-emerald-200 focus:border-emerald-600' : registrationEmailState === 'invalid' ? 'border-rose-500 ring-1 ring-rose-200 focus:border-rose-600' : 'border-slate-200 focus:border-[#b08a3c]'}`}
                              placeholder="propietario@correo.com"
                              required
                            />
                            {registrationEmailState === 'invalid' && (
                              <span className="mt-1 block text-[11px] font-semibold text-rose-600">
                                Ingresa un correo con un dominio público válido.
                              </span>
                            )}
                            {registrationEmailState === 'valid' && (
                              <span className="mt-1 block text-[11px] font-semibold text-emerald-600">
                                Formato válido. El dominio se comprobará al enviar.
                              </span>
                            )}
                          </label>

                          <label className="block">
                            <span className="mb-1 block text-[11px] font-bold text-slate-700">
                              Código de Invitación
                            </span>
                            <input
                              type="text"
                              value={regInviteCode}
                              onChange={(e) => setRegInviteCode(e.target.value)}
                              className="w-full rounded-xl border border-slate-200 bg-[#fbfaf7] px-3 py-2 text-xs outline-none focus:border-[#b08a3c] font-mono font-bold uppercase tracking-wider"
                              placeholder="Ej.: TR98WX"
                              maxLength={12}
                              required
                            />
                          </label>

                          <label className="block cursor-pointer">
                            <span className="mb-1 block text-[11px] font-bold text-slate-700">Foto de tu cédula</span>
                            <span className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50/80 p-3 text-center text-slate-600 transition hover:bg-slate-100">
                              <UploadCloud size={20} className="text-slate-400" />
                              <span className="mt-1 text-[11px] font-semibold">
                                {preparingIdentityDocument ? 'Preparando foto…' : identityDocument ? 'Foto JPG lista para enviar' : 'Selecciona una imagen JPG o PNG'}
                              </span>
                              <span className="mt-0.5 text-[10px]">JPG/PNG hasta 20 MB · se optimiza aquí, sin servicios externos</span>
                            </span>
                            <input
                              type="file"
                              accept="image/jpeg,image/png,.jpg,.jpeg,.png"
                              disabled={loading || preparingIdentityDocument}
                              onChange={(event) => { void handleIdentityDocumentChange(event.currentTarget.files?.[0] ?? null); event.currentTarget.value = ''; }}
                              className="sr-only"
                            />
                          </label>
                          {identityDocumentPreview && identityDocument && (
                            <div className="flex items-center gap-3 rounded-lg border border-emerald-200 bg-emerald-50 p-2.5">
                              <img src={identityDocumentPreview} alt="Vista previa de la foto preparada" className="h-14 w-20 rounded-md object-cover" />
                              <div className="min-w-0 text-[10px] text-emerald-900">
                                <p className="font-bold">Foto preparada en este dispositivo</p>
                                <p>{(identityDocument.size / 1024).toFixed(0)} KB · JPG</p>
                              </div>
                            </div>
                          )}
                          <p className="rounded-lg border border-amber-200 bg-amber-50 p-2.5 text-[10px] leading-4 text-amber-900">
                            Usaremos la foto únicamente para que la administración de este condominio evalúe tu solicitud. Se eliminará si la solicitud es rechazada o, como máximo, a los 30 días. Al enviar la solicitud no podrás reemplazar el archivo. Si solicitas registro en otra comunidad, deberás adjuntarlo nuevamente en esa solicitud.
                          </p>

                          <button
                            type="submit"
                            disabled={loading || preparingIdentityDocument}
                            className="w-full rounded-xl bg-[#b08a3c] py-2.5 text-xs font-bold text-white transition hover:bg-[#96732f] shadow-xs cursor-pointer"
                          >
                            Enviar Solicitud a la Administración
                          </button>
                        </form>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </section>
      </div>

      {/* Modal for setting new permanent password on First Login with Temp PIN */}
      {showPasswordResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#071a33]/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#faf6ec] text-[#b08a3c]">
                <KeyRound size={20} />
              </div>
              <div>
                <h3 className="font-bold text-[#071a33]">Primer Inicio con PIN Temporal</h3>
                <p className="text-xs text-slate-500">Crea tu contraseña definitiva para proteger tu cuenta</p>
              </div>
            </div>

            <form onSubmit={handlePasswordResetSubmit} className="space-y-3 pt-2">
              <label className="block">
                <span className="mb-1 block text-xs font-bold text-slate-700">
                  Nueva Contraseña Personal
                </span>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs outline-none focus:border-[#b08a3c]"
                  placeholder="Mínimo 6 caracteres"
                  required
                />
              </label>

              <label className="block">
                <span className="mb-1 block text-xs font-bold text-slate-700">
                  Confirmar Contraseña
                </span>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs outline-none focus:border-[#b08a3c]"
                  placeholder="Repite la nueva contraseña"
                  required
                />
              </label>

              <button
                type="submit"
                className="w-full rounded-xl bg-[#0b1d33] py-3 text-xs font-bold text-white hover:bg-[#14365d] transition shadow-xs"
              >
                Guardar Contraseña e Ingresar
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal Visor de Correo HTML Institucional enviado al Propietario */}
      {showEmailModal && regSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#071a33]/70 p-4 backdrop-blur-sm">
          <div className="flex h-[88vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl">
            <header className="flex items-center justify-between border-b border-slate-200 bg-[#071a33] px-6 py-4 text-white">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#f0cf77]">
                  CASA Mail Dispatcher
                </p>
                <h3 className="text-sm font-bold text-white">
                  Comprobante de Correo Enviado a {regSuccess.email}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowEmailModal(false)}
                className="rounded-full bg-white/10 p-2 text-white transition hover:bg-white/20"
              >
                ✕
              </button>
            </header>
            <div className="flex-1 overflow-auto p-4 bg-slate-100">
              <iframe
                title="Vista previa correo HTML"
                srcDoc={renderOwnerRegistrationEmailHtml(regSuccess)}
                className="h-full w-full rounded-xl border border-slate-200 shadow-xs bg-white"
              />
            </div>
            <footer className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-6 py-3 text-xs font-semibold text-slate-500">
              <span>Folio: <b>{regSuccess.folioNumber}</b></span>
              <button
                type="button"
                onClick={() => setShowEmailModal(false)}
                className="rounded-xl bg-[#0b1d33] px-4 py-2 text-xs font-bold text-white transition hover:bg-[#14365d]"
              >
                Cerrar Visor
              </button>
            </footer>
          </div>
        </div>
      )}
    </main>
  );
}
