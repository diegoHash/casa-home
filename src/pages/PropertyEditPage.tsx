import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from 'react';
import { ArrowLeft, Building2, CarFront, Check, Mail, Phone, Save, UserRound } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { CommunityWorkspaceService, type CoreSnapshot } from '../services/CommunityWorkspaceService';
import { StaffSession } from '../services/StaffSession';

const fieldClass = 'mt-2 w-full rounded-xl border border-[#071a33]/12 bg-white px-3.5 py-3 text-sm text-[#071a33] outline-none transition focus:border-[#b08a3c] focus:ring-2 focus:ring-[#b08a3c]/15';

function hasScope(scopes: string[], required: string) {
  return scopes.some((scope) => scope === '*' || scope === 'community.full_access' || scope === required || scope === `ADMINISTRATION:${required}` || (scope.endsWith('.*') && required.startsWith(scope.slice(0, -1))));
}

function PropertyOwnerCard({ property, core }: { property: CoreSnapshot['properties'][number]; core: CoreSnapshot }) {
  const owners = core.ownerships.filter((item) => item.propertyId === property.id && item.status === 'ACTIVE');
  return (
    <section className="relative self-start overflow-hidden rounded-[1.5rem] bg-gradient-to-br from-[#071a33] via-[#12345b] to-[#b08a3c] p-5 text-white shadow-[0_18px_50px_rgba(7,26,51,.18)] sm:p-6">
      <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-[#f0cf77]/20 blur-3xl" />
      <div className="relative">
        <div className="flex items-start justify-between gap-4"><div><p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#f0cf77]">Ficha de titularidad</p><h2 className="mt-2 text-2xl font-semibold">Propietario{owners.length === 1 ? '' : 's'}</h2></div><Building2 className="text-[#f0cf77]" size={28} /></div>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {owners.length ? owners.map((ownership) => {
            const person = ownership.person;
            return <div key={ownership.id} className="rounded-xl border border-white/20 bg-white/10 p-3 backdrop-blur-sm"><div className="grid gap-3 sm:grid-cols-2"><div className="flex items-center gap-3 sm:col-span-2"><span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/15 text-[#f0cf77]"><UserRound size={17} /></span><div><p className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/60">Nombre completo</p><p className="mt-1 text-sm font-semibold">{person.firstName} {person.lastName}</p></div></div><OwnerDetail label="Cédula" value={`${person.documentType}-${person.documentNumber}`} /><OwnerDetail label="Apartamento / inmueble" value={property.code} /><OwnerDetail label="Teléfono" value={person.phone || 'No registrado'} icon={<Phone size={14} />} /><OwnerDetail label="Correo asociado" value={person.email || 'No registrado'} icon={<Mail size={14} />} /></div></div>;
          }) : <p className="rounded-2xl border border-white/20 bg-white/10 p-4 text-sm text-white/75">Este inmueble aún no tiene un propietario vinculado.</p>}
        </div>
      </div>
    </section>
  );
}

function OwnerDetail({ label, value, icon }: { label: string; value: string; icon?: ReactNode }) {
  return <div><p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-white/60">{icon}{label}</p><p className="mt-1 text-sm font-medium text-white">{value}</p></div>;
}

export default function PropertyEditPage({ embedded = false }: { embedded?: boolean }) {
  const navigate = useNavigate();
  const { propertyId } = useParams();
  const context = StaffSession.context();
  const [core, setCore] = useState<CoreSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  useEffect(() => {
    let active = true;
    CommunityWorkspaceService.coreSnapshot()
      .then((snapshot) => { if (active) setCore(snapshot); })
      .catch((cause: unknown) => { if (active) setError(cause instanceof Error ? cause.message : 'No fue posible cargar el inmueble.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const property = useMemo(() => core?.properties.find((item) => item.id === propertyId) ?? null, [core, propertyId]);
  const canWrite = hasScope(context?.scopes ?? [], 'core.properties.write');

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!property) return;
    setSaving(true); setError(''); setNotice('');
    const form = new FormData(event.currentTarget);
    const parkingSpace = String(form.get('parkingSpace') ?? '').trim();
    try {
      await CommunityWorkspaceService.updateProperty(property.id, {
        kind: String(form.get('kind')) as 'APARTMENT' | 'TOWNHOUSE' | 'COMMERCIAL',
        code: String(form.get('code') ?? '').trim(),
        locationId: String(form.get('locationId') ?? ''),
        maximumOccupancy: Number(form.get('maximumOccupancy')) || null,
        braceletQuota: Number(form.get('braceletQuota')) || 0,
        parkingSpace,
        parkingCapacity: parkingSpace ? Number(form.get('parkingCapacity')) || null : null,
      });
      setNotice('Inmueble actualizado correctamente.');
      window.setTimeout(() => navigate('/workspace?section=inmuebles'), 500);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No fue posible guardar los cambios.');
    } finally { setSaving(false); }
  };

  if (loading) return <PageMessage>Preparando la ficha del inmueble…</PageMessage>;
  if (!context || !canWrite) return <PageMessage>No tienes permisos para editar inmuebles en esta comunidad.</PageMessage>;
  if (!property || !core) return <PageMessage>{error || 'No se encontró el inmueble solicitado.'}</PageMessage>;

  const content = <div className={`mx-auto max-w-5xl ${embedded ? '' : 'px-5 py-6 sm:px-8 sm:py-10'}`}>
      <button type="button" onClick={() => navigate('/workspace?section=inmuebles')} className="inline-flex items-center gap-2 rounded-full border border-[#071a33]/12 bg-white px-4 py-2.5 text-sm font-bold transition hover:border-[#b08a3c]"><ArrowLeft size={16} /> Volver a inmuebles</button>
      <div className="mt-8 max-w-3xl"><p className="text-xs font-bold uppercase tracking-[0.22em] text-[#9c7532]">Inventario comunitario</p><h1 className="mt-3 text-3xl font-semibold tracking-[-0.035em] sm:text-4xl">Editar inmueble {property.code}</h1><p className="mt-3 text-base leading-7 text-slate-500">Actualiza la ficha operativa de esta unidad. La información permanece aislada dentro de la comunidad activa.</p></div>
      <div className="mt-8 grid items-start gap-6 lg:grid-cols-[1.08fr_.92fr]"><PropertyOwnerCard property={property} core={core} />
        <section className="rounded-[2rem] border border-[#071a33]/8 bg-white p-6 shadow-[0_16px_50px_rgba(7,26,51,.06)] sm:p-8"><div className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f1eadb] text-[#9a742b]"><Building2 size={19} /></span><div><h2 className="text-xl font-semibold">Datos del inmueble</h2><p className="mt-1 text-sm text-slate-500">Parámetros de la unidad y estacionamiento.</p></div></div>
          <form onSubmit={submit} className="mt-7 space-y-5"><label className="block text-xs font-bold uppercase tracking-[0.12em] text-slate-500">Categoría<select name="kind" defaultValue={property.kind} className={fieldClass}><option value="APARTMENT">Apartamento</option><option value="TOWNHOUSE">Townhouse</option><option value="COMMERCIAL">Local comercial</option></select></label><label className="block text-xs font-bold uppercase tracking-[0.12em] text-slate-500">Código del inmueble<input name="code" defaultValue={property.code} className={fieldClass} required /></label><label className="block text-xs font-bold uppercase tracking-[0.12em] text-slate-500">Ubicación<select name="locationId" defaultValue={property.locationId ?? ''} className={fieldClass}><option value="">Directo en la comunidad</option>{core.locations.map((location) => <option key={location.id} value={location.id}>{location.name} · {location.code}</option>)}</select></label><div className="grid gap-5 sm:grid-cols-2"><label className="block text-xs font-bold uppercase tracking-[0.12em] text-slate-500">Capacidad de personas<input name="maximumOccupancy" type="number" min="1" max="10000" defaultValue={property.maximumOccupancy ?? ''} className={fieldClass} /></label><label className="block text-xs font-bold uppercase tracking-[0.12em] text-slate-500">Cupos de brazaletes<input name="braceletQuota" type="number" min="0" max="10000" defaultValue={property.braceletQuota} className={fieldClass} /></label></div><div className="border-t border-slate-100 pt-5"><p className="flex items-center gap-2 text-sm font-semibold"><CarFront size={17} className="text-[#9a742b]" /> Estacionamiento</p><div className="mt-4 grid gap-5 sm:grid-cols-2"><label className="block text-xs font-bold uppercase tracking-[0.12em] text-slate-500">Espacio(s) asignado(s)<input name="parkingSpace" defaultValue={property.parkingSpace ?? ''} placeholder={`Por defecto: ${property.code}`} className={fieldClass} /></label><label className="block text-xs font-bold uppercase tracking-[0.12em] text-slate-500">Capacidad (vehículos)<input name="parkingCapacity" type="number" min="1" max="100" defaultValue={property.parkingCapacity ?? ''} className={fieldClass} /></label></div><p className="mt-2 text-xs leading-5 text-slate-400">Si no se registra un espacio, la capacidad se guarda vacía. Normalmente puedes asignarlo usando el número del inmueble.</p></div>{error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700">{error}</p>}{notice && <p role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm font-semibold text-emerald-700">{notice}</p>}<button type="submit" disabled={saving} className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#071a33] px-5 py-3.5 text-sm font-bold text-white transition hover:bg-[#14365d] disabled:opacity-50"><Save size={17} />{saving ? 'Guardando…' : 'Guardar cambios'}</button></form>
        </section>
      </div>
    </div>;
  return embedded ? content : <main className="min-h-screen bg-[#f4f1e9] text-[#071a33]">{content}</main>;
}

function PageMessage({ children }: { children: ReactNode }) { return <main className="flex min-h-screen items-center justify-center bg-[#f4f1e9] px-6 text-center text-[#071a33]"><div><div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#071a33] text-[#f0cf77]"><Check size={22} /></div><p className="mt-4 text-sm font-semibold">{children}</p></div></main>; }
