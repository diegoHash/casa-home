import { useCallback, useEffect, useMemo, useState } from 'react';
import { Activity, AlertTriangle, Database, RefreshCw, Server, UsersRound } from 'lucide-react';
import { MonitoringService, type MonitoringError, type MonitoringSnapshot } from '../../services/MonitoringService';

const fmt = new Intl.DateTimeFormat('es-VE', { dateStyle: 'medium', timeStyle: 'medium' });
const card = 'rounded-2xl border border-[#071a33]/8 bg-white p-5 shadow-[0_12px_35px_rgba(7,26,51,.04)]';

export default function MonitoringDashboard() {
  const [snapshot, setSnapshot] = useState<MonitoringSnapshot | null>(null);
  const [errors, setErrors] = useState<MonitoringError[]>([]);
  const [communities, setCommunities] = useState<Array<{ id: string; name: string }>>([]);
  const [users, setUsers] = useState<Array<{ id: string; email: string }>>([]);
  const [kind, setKind] = useState('all');
  const [communityId, setCommunityId] = useState('');
  const [userId, setUserId] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [busy, setBusy] = useState(false);
  const [connection, setConnection] = useState<'connecting' | 'live' | 'reconnecting'>('connecting');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [message, setMessage] = useState('');

  const reloadErrors = useCallback(async () => {
    const data = await MonitoringService.errors({ kind, communityId, userId, from: from ? new Date(from).toISOString() : undefined, to: to ? new Date(to).toISOString() : undefined });
    setErrors(data);
  }, [kind, communityId, userId, from, to]);

  const load = useCallback(async () => {
    setBusy(true); setMessage('');
    try {
      const [health] = await Promise.all([MonitoringService.dashboard(), reloadErrors()]);
      setSnapshot(health);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'No se pudo cargar el monitoreo.');
    } finally { setBusy(false); }
  }, [reloadErrors]);

  useEffect(() => { void load(); }, [load]);
  useEffect(() => {
    let stream: { close(): void } | undefined;
    let cancelled = false;
    let retry: number | undefined;
    const connect = async () => {
      try {
        stream = await MonitoringService.openStream((event) => {
          setErrors((current) => [event, ...current.filter((item) => item.id !== event.id)].slice(0, 200));
          setSnapshot((current) => current ? { ...current, errors: { ...current.errors, retained: current.errors.retained + 1, last24Hours: current.errors.last24Hours + 1 } } : current);
        }, setConnection, { kind: kind === 'all' ? undefined : kind, communityId: communityId || undefined, userId: userId || undefined, from: from ? new Date(from).toISOString() : undefined, to: to ? new Date(to).toISOString() : undefined });
        if (cancelled) { stream.close(); return; }
      } catch { setConnection('reconnecting'); if (!cancelled) retry = window.setTimeout(connect, 5000); }
    };
    void connect();
    return () => { cancelled = true; stream?.close(); if (retry) window.clearTimeout(retry); };
  }, [kind, communityId, userId, from, to]);
  useEffect(() => { const timer = window.setInterval(() => { void MonitoringService.dashboard().then(setSnapshot).catch(() => setSnapshot((current) => current ? { ...current, services: { ...current.services, api: { status: 'error', checkedAt: new Date().toISOString() } } } : current)); }, 15_000); return () => window.clearInterval(timer); }, []);
  useEffect(() => { void Promise.all([MonitoringService.communities(), MonitoringService.users()]).then(([c, u]) => { setCommunities(c); setUsers(u); }).catch(() => undefined); }, []);

  const countLabel = useMemo(() => connection === 'live' ? 'En vivo' : connection === 'connecting' ? 'Conectando' : 'Reconectando', [connection]);
  return <div className="space-y-6">
    <header className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs font-extrabold uppercase tracking-[.2em] text-[#9a742b]">Operaciones</p><h2 className="mt-2 text-3xl font-semibold tracking-[-.04em]">Monitoreo del sistema</h2><p className="mt-2 text-sm text-slate-500">Salud, sesiones y errores de los últimos {snapshot?.retentionDays ?? 30} días.</p></div><div className="flex items-center gap-3"><span className={`rounded-full px-3 py-1.5 text-xs font-bold ${connection === 'live' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}><span className="mr-2 inline-block h-2 w-2 rounded-full bg-current" />{countLabel}</span><button onClick={() => void load()} disabled={busy} className="inline-flex items-center gap-2 rounded-xl bg-[#071a33] px-4 py-2.5 text-sm font-bold text-white disabled:opacity-60"><RefreshCw size={16} className={busy ? 'animate-spin' : ''} />Actualizar</button></div></header>
    {message && <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{message}</div>}
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <Metric icon={<Server size={19} />} label="Backend API" status={snapshot?.services.api.status} detail={snapshot?.services.api.checkedAt ? `Chequeado ${fmt.format(new Date(snapshot.services.api.checkedAt))}` : 'Consultando'} />
      <Metric icon={<Database size={19} />} label="Base de datos" status={snapshot?.services.database.status} detail={snapshot?.services.database.checkedAt ? `Chequeado ${fmt.format(new Date(snapshot.services.database.checkedAt))}` : 'Consultando'} />
      <article className={card}><div className="flex justify-between text-slate-500"><span className="text-sm font-semibold">Sesiones vigentes</span><UsersRound size={19} /></div><p className="mt-5 text-3xl font-semibold">{snapshot?.sessions.active ?? '—'}</p><p className="mt-2 text-xs text-slate-400">{snapshot?.sessions.uniqueUsers ?? '—'} usuarios únicos</p></article>
      <article className={card}><div className="flex justify-between text-slate-500"><span className="text-sm font-semibold">Errores conservados</span><AlertTriangle size={19} /></div><p className="mt-5 text-3xl font-semibold">{snapshot?.errors.last24Hours ?? '—'}</p><p className="mt-2 text-xs text-slate-400">Últimas 24 h · {snapshot?.errors.retained ?? 0} en retención</p></article>
    </section>
    <section className={card}>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-[.16em] text-[#9a742b]">Registro de errores</p><h3 className="mt-1 text-xl font-semibold">Eventos HTTP</h3></div><div className="flex items-center gap-2 text-xs font-semibold text-slate-400"><Activity size={15} />Actualizaciones en vivo</div></div>
      <div className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <select aria-label="Tipo de error" value={kind} onChange={e => setKind(e.target.value)} className="rounded-xl border border-slate-200 bg-[#fbfaf7] px-3 py-2.5 text-sm"><option value="all">Todos los tipos</option><option value="client">Cliente (4xx)</option><option value="server">Servidor (5xx)</option></select>
        <input aria-label="Desde" type="datetime-local" value={from} onChange={e => setFrom(e.target.value)} className="rounded-xl border border-slate-200 bg-[#fbfaf7] px-3 py-2.5 text-sm" />
        <input aria-label="Hasta" type="datetime-local" value={to} onChange={e => setTo(e.target.value)} className="rounded-xl border border-slate-200 bg-[#fbfaf7] px-3 py-2.5 text-sm" />
        <select aria-label="Comunidad" value={communityId} onChange={e => setCommunityId(e.target.value)} className="rounded-xl border border-slate-200 bg-[#fbfaf7] px-3 py-2.5 text-sm"><option value="">Todas las comunidades</option>{communities.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}</select>
        <select aria-label="Usuario" value={userId} onChange={e => setUserId(e.target.value)} className="rounded-xl border border-slate-200 bg-[#fbfaf7] px-3 py-2.5 text-sm"><option value="">Todos los usuarios</option>{users.map(item => <option key={item.id} value={item.id}>{item.email}</option>)}</select>
      </div>
      <div className="overflow-x-auto"><table className="w-full min-w-[1050px] text-left text-sm"><thead className="border-b border-slate-100 text-[10px] font-bold uppercase tracking-wider text-slate-400"><tr><th className="pb-3">Fecha y hora</th><th className="pb-3">Código</th><th className="pb-3">Solicitud</th><th className="pb-3">Usuario / comunidad</th><th className="pb-3">IP</th><th className="pb-3">Detalle</th></tr></thead><tbody>{errors.map(error => <tr key={error.id} className="border-b border-slate-100 align-top"><td className="py-3 pr-3 whitespace-nowrap text-xs text-slate-500">{fmt.format(new Date(error.occurredAt))}</td><td className="py-3 pr-3"><span className={`rounded-lg px-2 py-1 font-mono text-xs font-bold ${error.statusCode >= 500 ? 'bg-rose-50 text-rose-700' : 'bg-amber-50 text-amber-700'}`}>{error.statusCode}</span></td><td className="py-3 pr-3"><p className="font-mono text-xs font-semibold">{error.method} {error.path}</p><p className="mt-1 max-w-sm truncate text-xs text-slate-500" title={error.message}>{error.message}</p><p className="mt-1 font-mono text-[10px] text-slate-400">{error.requestId}</p></td><td className="py-3 pr-3 text-xs"><p>{error.userEmail ?? 'Anónimo'}</p><p className="mt-1 text-slate-400">{error.communityName ?? 'Sin comunidad'}</p></td><td className="py-3 pr-3 font-mono text-xs text-slate-500">{error.ipAddress ?? '—'}</td><td className="py-3"><button onClick={() => setExpanded(expanded === error.id ? null : error.id)} className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-bold">{expanded === error.id ? 'Ocultar' : 'Ver'} traza</button>{expanded === error.id && <pre className="mt-2 max-h-72 max-w-[480px] overflow-auto whitespace-pre-wrap break-all rounded-lg bg-slate-950 p-3 text-[11px] leading-5 text-slate-100">{error.message}{error.stack ? `\n\n${error.stack}` : '\n\nSin stack disponible.'}{error.stackTruncated ? '\n\n[Traza truncada por alcanzar el límite de almacenamiento.]' : ''}</pre>}</td></tr>)}</tbody></table>{errors.length === 0 && <p className="py-12 text-center text-sm text-slate-400">No hay errores para los filtros seleccionados.</p>}</div>
      <p className="mt-4 text-xs text-slate-400">Se conservan como máximo 30 días. Mostrando hasta 200 eventos; usa los filtros para acotar el historial.</p>
    </section>
  </div>;
}

function Metric({ icon, label, status, detail }: { icon: React.ReactNode; label: string; status?: string; detail: string }) {
  return <article className={card}><div className="flex items-center justify-between"><span className="text-sm font-semibold text-slate-500">{label}</span><span className="text-[#9a742b]">{icon}</span></div><span className={`mt-5 inline-flex rounded-full px-3 py-1.5 text-xs font-bold ${status === undefined ? 'bg-slate-100 text-slate-500' : status === 'ok' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>{status === undefined ? 'Consultando' : status === 'ok' ? 'Operativo' : 'Con errores'}</span><p className="mt-2 text-xs text-slate-400">{detail}</p></article>;
}
