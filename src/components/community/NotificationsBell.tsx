import { useEffect, useRef, useState } from 'react';
import { AlertTriangle, Bell, Clock3, X } from 'lucide-react';
import { CommunityWorkspaceService, type NotificationRecord } from '../../services/CommunityWorkspaceService';

function severityClass(severity: NotificationRecord['severity']) {
  if (severity === 'URGENT') return 'border-rose-200 bg-rose-50 text-rose-800';
  if (severity === 'WARNING') return 'border-amber-200 bg-amber-50 text-amber-900';
  return 'border-slate-200 bg-slate-50 text-slate-800';
}

export function NotificationsBell({ enabled, onOpenPayables }: { enabled: boolean; onOpenPayables: () => void }) {
  const [items, setItems] = useState<NotificationRecord[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const load = async () => {
    if (!enabled) return;
    setLoading(true);
    try {
      const snapshot = await CommunityWorkspaceService.notifications();
      setItems(snapshot.items);
    } catch {
      // Las notificaciones son auxiliares y no deben bloquear el espacio de trabajo.
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
    const timer = window.setInterval(() => void load(), 60_000);
    return () => window.clearInterval(timer);
  }, [enabled]);

  useEffect(() => {
    if (!open) return;
    const handleOutsidePointer = (event: PointerEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('pointerdown', handleOutsidePointer);
    return () => document.removeEventListener('pointerdown', handleOutsidePointer);
  }, [open]);

  if (!enabled) return null;
  return <div ref={containerRef} className="relative">
    <button type="button" onClick={() => setOpen((current) => !current)} className="relative inline-flex items-center gap-2 rounded-full border border-[#071a33]/10 bg-white px-3.5 py-2.5 text-sm font-bold shadow-sm hover:bg-slate-50" aria-label="Abrir notificaciones" aria-expanded={open}>
      <Bell size={16} /> <span className="hidden sm:inline">Notificaciones</span>
      {items.length > 0 && <span className="min-w-5 rounded-full bg-rose-600 px-1.5 py-0.5 text-center text-[10px] font-bold text-white">{items.length > 99 ? '99+' : items.length}</span>}
    </button>
    {open && <div className="absolute right-0 top-12 z-[80] w-[min(92vw,390px)] overflow-hidden rounded-2xl border border-[#071a33]/10 bg-white shadow-2xl">
      <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3"><div><p className="text-sm font-bold">Notificaciones</p><p className="text-xs text-slate-500">Recordatorios y vencimientos de cuentas por pagar</p></div><button type="button" onClick={() => setOpen(false)} className="rounded-full p-1 text-slate-400 hover:bg-slate-100" aria-label="Cerrar notificaciones"><X size={16} /></button></div>
      <div className="max-h-[min(65vh,460px)] space-y-2 overflow-y-auto p-3">
        {loading && !items.length && <p className="px-2 py-8 text-center text-sm text-slate-500">Consultando recordatorios…</p>}
        {!loading && !items.length && <p className="px-2 py-8 text-center text-sm text-slate-500">No tienes cuentas por pagar próximas ni recordatorios pendientes.</p>}
        {items.map((item) => <button type="button" key={item.id} onClick={() => { onOpenPayables(); setOpen(false); }} className={`flex w-full items-start gap-3 rounded-xl border p-3 text-left transition hover:brightness-95 ${severityClass(item.severity)}`}>
          <span className="mt-0.5 shrink-0">{item.severity === 'URGENT' ? <AlertTriangle size={17} /> : item.kind === 'PAYABLE_REMINDER' ? <Clock3 size={17} /> : <Bell size={17} />}</span>
          <span><strong className="block text-xs">{item.title}</strong><span className="mt-1 block text-xs leading-5">{item.message}</span></span>
        </button>)}
      </div>
    </div>}
  </div>;
}
