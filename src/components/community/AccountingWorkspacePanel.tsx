import { useEffect, useMemo, useRef, useState, type FormEvent, type ReactNode } from 'react';
import { safeRandomUUID } from '../../utils/uuid';
import { ChevronDown, ChevronRight, ChevronsDownUp, ChevronsUpDown, LoaderCircle, RotateCcw, X, HelpCircle, Pencil, Plus, Download, Upload, Printer } from 'lucide-react';
import { CommunityWorkspaceService, type AccountingSnapshot, type ReceivablesSnapshot, type TreasurySnapshot } from '../../services/CommunityWorkspaceService';
import { strFromU8, strToU8, unzipSync, zipSync } from 'fflate';

type Dialog = 'account' | 'period' | 'entry' | 'post' | 'reverse' | 'close' | null;
type EntryLine = { id: string; accountId: string; description: string; debit: string; credit: string };

const inputClass = 'mt-1.5 w-full rounded-xl border border-[#071a33]/12 bg-white px-3.5 py-3 text-sm outline-none transition focus:border-[#b08a3c] focus:ring-2 focus:ring-[#b08a3c]/15';
const accountTypes = { ASSET: 'Activo', LIABILITY: 'Pasivo', EQUITY: 'Patrimonio', INCOME: 'Ingreso', EXPENSE: 'Gasto' } as const;
const statusLabels = { OPEN: 'Abierto', CLOSED: 'Cerrado', LOCKED: 'Bloqueado', DRAFT: 'Borrador', POSTED: 'Contabilizado', REVERSED: 'Reversado' } as const;
const money = new Intl.NumberFormat('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const blankLine = (): EntryLine => ({ id: safeRandomUUID(), accountId: '', description: '', debit: '', credit: '' });

function formatDateTime(value: string | null) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  const parts = new Intl.DateTimeFormat('es-VE', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: false,
    timeZone: 'America/Caracas',
  }).formatToParts(date);
  const part = (type: Intl.DateTimeFormatPartTypes) => parts.find((item) => item.type === type)?.value ?? '';
  return `${part('day')}-${part('month')}-${part('year')} ${part('hour')}:${part('minute')}`;
}

export type AccountingSection = 'accounts' | 'periods' | 'receivables' | 'journal';

export function AccountingWorkspacePanel({ canWrite, canPost, treasury: treasuryProp, section = 'accounts' }: { canWrite: boolean; canPost: boolean; treasury?: TreasurySnapshot | null; section?: AccountingSection }) {
  const [snapshot, setSnapshot] = useState<AccountingSnapshot | null>(null);
  const [treasury, setTreasury] = useState<TreasurySnapshot | null>(treasuryProp ?? null);
  const [dialog, setDialog] = useState<Dialog>(null);
  const [targetId, setTargetId] = useState('');
  const [lines, setLines] = useState<EntryLine[]>([blankLine(), blankLine()]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [view, setView] = useState<'dashboard' | 'create-account' | 'edit-account'>('dashboard');
  const [editingAccount, setEditingAccount] = useState<AccountingSnapshot['ledgerAccounts'][number] | null>(null);
  const [createParentId, setCreateParentId] = useState('');
  const [editParentId, setEditParentId] = useState('');
  const [createType, setCreateType] = useState<keyof typeof accountTypes>('ASSET');
  const [editType, setEditType] = useState<keyof typeof accountTypes>('ASSET');
  const [collapsedAccountIds, setCollapsedAccountIds] = useState<Set<string>>(new Set());
  const accountFormTitleRef = useRef<HTMLHeadingElement>(null);
  const accountImportRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (treasuryProp) {
      setTreasury(treasuryProp);
    } else {
      CommunityWorkspaceService.treasurySnapshot().then(setTreasury).catch(() => null);
    }
  }, [treasuryProp]);

  const createParent = useMemo(() => 
    snapshot?.ledgerAccounts.find((item) => item.id === createParentId),
    [createParentId, snapshot]
  );
  
  const editParent = useMemo(() => 
    snapshot?.ledgerAccounts.find((item) => item.id === editParentId),
    [editParentId, snapshot]
  );

  useEffect(() => {
    if (editingAccount) {
      setEditParentId(editingAccount.parentId || '');
      setEditType(editingAccount.type);
    } else {
      setEditParentId('');
      setEditType('ASSET');
    }
  }, [editingAccount]);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      setSnapshot(await CommunityWorkspaceService.accountingSnapshot());
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No fue posible cargar la contabilidad.');
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timer);
  }, []);

  const openPeriods = snapshot?.accountingPeriods.filter((item) => item.status === 'OPEN') ?? [];
  const postingAccounts = snapshot?.ledgerAccounts.filter((item) => item.status === 'ACTIVE' && item.acceptsEntries) ?? [];
  const ledgerAccountTree = useMemo(() => {
    const accounts = snapshot?.ledgerAccounts ?? [];
    const byParent = new Map<string | null, typeof accounts>();
    const ids = new Set(accounts.map((account) => account.id));
    for (const account of accounts) {
      const parentId = account.parentId && ids.has(account.parentId) ? account.parentId : null;
      byParent.set(parentId, [...(byParent.get(parentId) ?? []), account]);
    }
    const rows: Array<{ account: typeof accounts[number]; depth: number; isLast: boolean; hasChildren: boolean }> = [];
    const visit = (parentId: string | null, depth: number, ancestry: Set<string>) => {
      const children = [...(byParent.get(parentId) ?? [])].sort((a, b) => a.code.localeCompare(b.code, undefined, { numeric: true }));
      children.forEach((account, index) => {
        const hasChildren = (byParent.get(account.id)?.length ?? 0) > 0;
        rows.push({ account, depth, isLast: index === children.length - 1, hasChildren });
        if (hasChildren && !collapsedAccountIds.has(account.id) && !ancestry.has(account.id)) {
          visit(account.id, depth + 1, new Set([...ancestry, account.id]));
        }
      });
    };
    visit(null, 0, new Set());
    return rows;
  }, [snapshot?.ledgerAccounts, collapsedAccountIds]);
  const collapsibleAccountIds = useMemo(
    () => snapshot?.ledgerAccounts
      .filter((account) => snapshot.ledgerAccounts.some((candidate) => candidate.parentId === account.id))
      .map((account) => account.id) ?? [],
    [snapshot?.ledgerAccounts],
  );
  const allAccountsExpanded = collapsedAccountIds.size === 0;
  const toggleAccountChildren = (accountId: string) => {
    setCollapsedAccountIds((current) => {
      const next = new Set(current);
      if (next.has(accountId)) next.delete(accountId);
      else next.add(accountId);
      return next;
    });
  };

  useEffect(() => {
    const createAccount = () => {
      if (!canWrite) return;
      setView('create-account');
      setError('');
      setCreateParentId('');
    };
    const openPeriod = () => canWrite && setDialog('period');
    const prepareEntry = () => {
      if (!canWrite) return;
      if (!openPeriods.length || postingAccounts.length < 2) {
        setError('Necesitas un período abierto y al menos dos cuentas de movimiento activas para preparar un asiento.');
        return;
      }
      setLines([blankLine(), blankLine()]);
      setDialog('entry');
    };
    window.addEventListener('accounting:create-account', createAccount);
    window.addEventListener('accounting:open-period', openPeriod);
    window.addEventListener('accounting:prepare-entry', prepareEntry);
    return () => {
      window.removeEventListener('accounting:create-account', createAccount);
      window.removeEventListener('accounting:open-period', openPeriod);
      window.removeEventListener('accounting:prepare-entry', prepareEntry);
    };
  }, [canWrite, openPeriods.length, postingAccounts.length]);

  useEffect(() => {
    if (view === 'dashboard') return;
    const frame = window.requestAnimationFrame(() => {
      accountFormTitleRef.current?.scrollIntoView({ block: 'start' });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [view]);
  const totals = useMemo(() => lines.reduce((sum, line) => ({
    debit: sum.debit + (Number(line.debit) || 0),
    credit: sum.credit + (Number(line.credit) || 0),
  }), { debit: 0, credit: 0 }), [lines]);
  const balanced = totals.debit > 0 && Math.abs(totals.debit - totals.credit) < 0.005;

  const execute = async (action: () => Promise<unknown>, success: string) => {
    setSaving(true);
    setError('');
    setNotice('');
    try {
      await action();
      setDialog(null);
      setView('dashboard');
      setTargetId('');
      setNotice(success);
      await load();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No fue posible completar la operación contable.');
    } finally {
      setSaving(false);
    }
  };

  const printJournal = () => {
    if (!snapshot) return;
    const popup = window.open('', '_blank', 'width=1100,height=800');
    if (!popup) {
      setError('El navegador bloqueó la ventana de impresión. Permite ventanas emergentes para generar el PDF.');
      return;
    }
    const entries = snapshot.journalEntries.map((entry) => `<tr><td>${entry.entryNumber ?? '—'}</td><td>${escapeHtml(formatDateTime(entry.entryDate))}</td><td>${escapeHtml(entry.description)}</td><td>${entry.lines.map((line) => `${escapeHtml(line.account.code)} · ${escapeHtml(line.account.name)}<br><small>${Number(line.debit) !== 0 ? `Debe ${money.format(Number(line.debit))}` : `Haber ${money.format(Number(line.credit))}`}</small>`).join('<hr>')}</td></tr>`).join('');
    popup.document.write(`<!doctype html><html lang="es"><head><meta charset="utf-8"><title>Libro diario · ${escapeHtml(snapshot.name)}</title><style>body{font-family:Arial,sans-serif;color:#071a33;margin:28px}h1{margin:0 0 4px;font-size:24px}h2{margin:24px 0 8px;font-size:18px}p{margin:3px 0;color:#475569;font-size:12px}table{border-collapse:collapse;width:100%;margin-top:18px;font-size:11px}th,td{border:1px solid #cbd5e1;padding:7px;text-align:left;vertical-align:top}th{background:#071a33;color:#fff}hr{border:0;border-top:1px solid #e2e8f0;margin:5px 0}@media print{body{margin:12mm}}</style></head><body><h1>Libro diario de contabilidad</h1><p><b>${escapeHtml(snapshot.name)}</b> · ${escapeHtml(snapshot.legalName)}</p><p>RIF: ${escapeHtml(snapshot.rif)} · Dirección: ${escapeHtml(snapshot.address)}, ${escapeHtml(snapshot.city)}, ${escapeHtml(snapshot.state)}</p><p>Correo: ${escapeHtml(snapshot.email)} · Código postal: ${escapeHtml(snapshot.postalCode)}</p><h2>Registro cronológico y partida doble</h2><table><thead><tr><th>N.º</th><th>Fecha</th><th>Descripción</th><th>Debe / Haber</th></tr></thead><tbody>${entries || '<tr><td colspan="4">No existen asientos registrados.</td></tr>'}</tbody></table><p style="margin-top:24px">Generado por CASA · ${escapeHtml(new Date().toLocaleString('es-VE'))}</p></body></html>`);
    popup.document.close();
    popup.focus();
    popup.print();
  };

  const accountExportRows = () => (snapshot?.ledgerAccounts ?? [])
    .slice()
    .sort((a, b) => a.code.localeCompare(b.code, undefined, { numeric: true }))
    .map((account) => ({
      Código: account.code,
      Cuenta: account.name,
      Tipo: account.type,
      Moneda: account.currency ?? '',
      Naturaleza: account.normalBalance,
      Uso: account.acceptsEntries ? 'MOVIMIENTO' : 'AGRUPADORA',
      'Código padre': snapshot?.ledgerAccounts.find((candidate) => candidate.id === account.parentId)?.code ?? '',
      Descripción: account.description ?? '',
      Estado: account.status,
    }));

  const exportAccounts = (format: 'xlsx' | 'json') => {
    if (!snapshot) return;
    const rows = accountExportRows();
    const filename = `plan-de-cuentas-${new Date().toISOString().slice(0, 10)}`;
    if (format === 'json') {
      downloadBlob(new Blob([JSON.stringify(rows.map((row) => ({
        code: row['Código'], name: row.Cuenta, type: row.Tipo, currency: row.Moneda || null,
        normalBalance: row.Naturaleza, acceptsEntries: row.Uso === 'MOVIMIENTO', parentCode: row['Código padre'] || null,
        description: row.Descripción || null, status: row.Estado,
      })), null, 2)], { type: 'application/json;charset=utf-8' }), `${filename}.json`);
      return;
    }
    downloadBlob(new Blob([createXlsx(rows)], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }), `${filename}.xlsx`);
  };

  const printAccounts = () => {
    if (!snapshot) return;
    const accounts = snapshot.ledgerAccounts;
    const byParent = new Map<string | null, typeof accounts>();
    const ids = new Set(accounts.map((account) => account.id));
    for (const account of accounts) {
      const parentId = account.parentId && ids.has(account.parentId) ? account.parentId : null;
      byParent.set(parentId, [...(byParent.get(parentId) ?? []), account]);
    }
    const rows: string[] = [];
    const visit = (parentId: string | null, depth: number, ancestors: Set<string>) => {
      for (const account of [...(byParent.get(parentId) ?? [])].sort((a, b) => a.code.localeCompare(b.code, undefined, { numeric: true }))) {
        rows.push(`<tr><td>${escapeHtml(account.code)}</td><td style="padding-left:${12 + depth * 20}px">${escapeHtml(account.name)}</td><td>${escapeHtml(accountTypes[account.type])}</td><td>${escapeHtml(account.currency ?? '—')}</td><td>${account.normalBalance === 'DEBIT' ? 'Deudora' : 'Acreedora'}</td><td>${account.acceptsEntries ? 'Movimiento' : 'Agrupadora'}</td><td>${escapeHtml(account.status)}</td><td>${escapeHtml(account.description ?? '')}</td></tr>`);
        if (!ancestors.has(account.id)) visit(account.id, depth + 1, new Set([...ancestors, account.id]));
      }
    };
    visit(null, 0, new Set());
    const popup = window.open('', '_blank', 'width=1100,height=800');
    if (!popup) {
      setError('El navegador bloqueó la ventana de impresión. Permite ventanas emergentes para imprimir el plan de cuentas.');
      return;
    }
    popup.document.write(`<!doctype html><html lang="es"><head><meta charset="utf-8"><title>Plan de cuentas · ${escapeHtml(snapshot.name)}</title><style>body{font-family:Arial,sans-serif;color:#071a33;margin:28px}h1{margin:0 0 4px;font-size:24px}p{margin:3px 0;color:#475569;font-size:12px}table{border-collapse:collapse;width:100%;margin-top:18px;font-size:10px}th,td{border:1px solid #cbd5e1;padding:6px;text-align:left;vertical-align:top}th{background:#071a33;color:#fff}tr{break-inside:avoid}@media print{body{margin:12mm}}</style></head><body><h1>Plan de cuentas contables</h1><p><b>${escapeHtml(snapshot.name)}</b> · ${escapeHtml(snapshot.legalName)}</p><p>RIF: ${escapeHtml(snapshot.rif)} · ${escapeHtml(snapshot.address)}, ${escapeHtml(snapshot.city)}, ${escapeHtml(snapshot.state)}</p><p>${accounts.length} cuentas · Generado ${escapeHtml(new Date().toLocaleString('es-VE'))}</p><table><thead><tr><th>Código</th><th>Cuenta</th><th>Tipo</th><th>Moneda</th><th>Naturaleza</th><th>Uso</th><th>Estado</th><th>Descripción</th></tr></thead><tbody>${rows.join('') || '<tr><td colspan="8">No hay cuentas en el plan.</td></tr>'}</tbody></table></body></html>`);
    popup.document.close();
    popup.focus();
    popup.print();
  };

  const importAccounts = async (file: File) => {
    if (!snapshot) return;
    setSaving(true);
    setError('');
    setNotice('');
    let importedCount = 0;
    try {
      const extension = file.name.split('.').pop()?.toLowerCase();
      let rawRows: unknown[];
      if (extension === 'json') {
        const parsed: unknown = JSON.parse(await file.text());
        rawRows = Array.isArray(parsed) ? parsed : (parsed as { accounts?: unknown[] } | null)?.accounts ?? [];
      } else if (extension === 'xlsx') {
        rawRows = parseXlsx(await file.arrayBuffer());
      } else {
        throw new Error('Selecciona un archivo XLSX o JSON.');
      }
      if (!rawRows.length) throw new Error('El archivo no contiene cuentas para importar.');
      const rows = rawRows.map((raw, index) => {
        if (!raw || typeof raw !== 'object') throw new Error(`La fila ${index + 1} no tiene un formato válido.`);
        const item = raw as Record<string, unknown>;
        const get = (...keys: string[]) => keys.map((key) => item[key]).find((value) => value !== undefined && value !== null && String(value).trim() !== '');
        const code = String(get('code', 'Código', 'Codigo') ?? '').trim().toUpperCase().replace(/\s+/g, '');
        const name = String(get('name', 'Cuenta') ?? '').trim();
        const type = String(get('type', 'Tipo') ?? '').trim().toUpperCase();
        const currencyValue = String(get('currency', 'Moneda') ?? '').trim().toUpperCase();
        const parentCode = String(get('parentCode', 'Código padre', 'Codigo padre') ?? '').trim().toUpperCase().replace(/\s+/g, '');
        const acceptsValue = get('acceptsEntries', 'Acepta movimientos') ?? String(get('Uso') ?? '').toUpperCase() !== 'AGRUPADORA';
        const acceptsEntries = typeof acceptsValue === 'boolean' ? acceptsValue : ['TRUE', '1', 'SI', 'SÍ', 'MOVIMIENTO'].includes(String(acceptsValue).trim().toUpperCase());
        if (!code || !name || !(type in accountTypes)) throw new Error(`La fila ${index + 1} debe tener código, cuenta y un tipo válido.`);
        if (currencyValue && !['VES', 'USD', 'EUR'].includes(currencyValue)) throw new Error(`La moneda de la cuenta ${code} debe ser VES, USD o EUR.`);
        return { code, name, type: type as keyof typeof accountTypes, currency: currencyValue as 'VES' | 'USD' | 'EUR' | '', parentCode, acceptsEntries, description: String(get('description', 'Descripción') ?? '').trim() };
      });
      const codes = new Set<string>();
      for (const row of rows) {
        if (codes.has(row.code) || snapshot.ledgerAccounts.some((account) => account.code.trim().toUpperCase() === row.code)) throw new Error(`El código ${row.code} ya existe en el archivo o en el plan de cuentas.`);
        codes.add(row.code);
      }
      for (const row of rows) if (row.parentCode && !codes.has(row.parentCode) && !snapshot.ledgerAccounts.some((account) => account.code === row.parentCode)) throw new Error(`No se encontró la cuenta padre ${row.parentCode} de ${row.code}.`);

      const idsByCode = new Map(snapshot.ledgerAccounts.map((account) => [account.code, account.id]));
      const pending = [...rows];
      while (pending.length) {
        const index = pending.findIndex((row) => !row.parentCode || idsByCode.has(row.parentCode));
        if (index < 0) throw new Error('La jerarquía del archivo tiene una referencia circular entre cuentas padre.');
        const [row] = pending.splice(index, 1);
        if (!row) continue;
        const created = await CommunityWorkspaceService.createLedgerAccount({ code: row.code, name: row.name, type: row.type, currency: row.currency || undefined, parentId: row.parentCode ? idsByCode.get(row.parentCode) : undefined, description: row.description || undefined, acceptsEntries: row.acceptsEntries });
        idsByCode.set(row.code, created.id);
        importedCount += 1;
      }
      setNotice(`Se importaron ${importedCount} cuentas contables.`);
      await load();
    } catch (cause) {
      setError(`${cause instanceof Error ? cause.message : 'No fue posible importar el archivo.'}${importedCount ? ` Se alcanzaron a importar ${importedCount} cuentas; revisa el plan antes de volver a intentarlo.` : ''}`);
    } finally {
      setSaving(false);
      if (accountImportRef.current) accountImportRef.current.value = '';
    }
  };

  const submitAccount = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const code = String(form.get('code')).trim().toUpperCase().replace(/\s+/g, '');

    // Duplicate check in frontend
    const exists = snapshot?.ledgerAccounts.some(
      (item) => item.code.trim().toUpperCase().replace(/\s+/g, '') === code
    );
    if (exists) {
      setError('Ya existe una cuenta contable en el catálogo con este código.');
      return;
    }

    void execute(() => CommunityWorkspaceService.createLedgerAccount({
      code,
      name: String(form.get('name')).trim(),
      description: String(form.get('description')).trim() || undefined,
      type: String(form.get('type')) as keyof typeof accountTypes,
      currency: (String(form.get('currency') || 'USD') as 'VES' | 'USD' | 'EUR'),
      parentId: String(form.get('parentId')) || undefined,
      bankAccountId: String(form.get('bankAccountId') || '').trim() || undefined,
      acceptsEntries: form.get('acceptsEntries') === 'true',
    }), 'Cuenta contable creada.');
  };

  const submitEditAccount = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editingAccount) return;
    const form = new FormData(event.currentTarget);
    const code = String(form.get('code')).trim().toUpperCase().replace(/\s+/g, '');

    // Duplicate check excluding self in frontend
    const exists = snapshot?.ledgerAccounts.some(
      (item) => item.id !== editingAccount.id && item.code.trim().toUpperCase().replace(/\s+/g, '') === code
    );
    if (exists) {
      setError('Ya existe otra cuenta contable en el catálogo con este código.');
      return;
    }

    void execute(() => CommunityWorkspaceService.updateLedgerAccount(editingAccount.id, {
      code,
      name: String(form.get('name')).trim(),
      description: String(form.get('description')).trim() || undefined,
      type: String(form.get('type')) as keyof typeof accountTypes,
      currency: (String(form.get('currency') || 'USD') as 'VES' | 'USD' | 'EUR'),
      parentId: String(form.get('parentId')) || undefined,
      bankAccountId: String(form.get('bankAccountId') || '').trim() || undefined,
      acceptsEntries: form.get('acceptsEntries') === 'true',
    }), 'Cuenta contable actualizada.');
  };

  const submitPeriod = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    void execute(() => CommunityWorkspaceService.createAccountingPeriod({
      periodKey: String(form.get('periodKey')),
      label: String(form.get('label')).trim(),
    }), 'Período contable abierto.');
  };

  const submitEntry = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!balanced) {
      setError('El asiento debe tener débitos y créditos iguales.');
      return;
    }
    const form = new FormData(event.currentTarget);
    void execute(() => CommunityWorkspaceService.createJournalEntry({
      accountingPeriodId: String(form.get('accountingPeriodId')),
      entryDate: new Date(`${String(form.get('entryDate'))}T12:00:00-04:00`).toISOString(),
      description: String(form.get('description')).trim(),
      source: 'MANUAL',
      lines: lines.map((line) => ({
        accountId: line.accountId,
        description: line.description.trim() || undefined,
        debit: Number(line.debit) || 0,
        credit: Number(line.credit) || 0,
      })),
    }), 'Asiento guardado en borrador.');
  };

  const updateLine = (id: string, patch: Partial<EntryLine>) =>
    setLines((current) => current.map((line) => line.id === id ? { ...line, ...patch } : line));

  if (loading && !snapshot) {
    return <div className="flex min-h-[320px] items-center justify-center rounded-[1.75rem] border border-[#071a33]/8 bg-white"><LoaderCircle className="animate-spin text-[#9c7532]" /></div>;
  }

  if (view === 'edit-account') {
    return (
      <div className="animate-fadeIn">
        {/* Custom Help Modal for Accounting Beginners */}
        {showHelpModal && (
          <div className="fixed inset-0 z-[110] overflow-y-auto bg-[#071a33]/70 p-4 backdrop-blur-sm flex items-center justify-center">
            <div className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full mx-auto my-8 overflow-hidden transition-all transform duration-300 scale-100">
              <header className="flex items-center justify-between border-b border-[#071a33]/8 px-6 py-5 bg-white">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-[#b08a3c]/10 text-[#9c7532] rounded-lg"><HelpCircle size={18} /></div>
                  <h3 className="font-bold text-[#071a33] text-lg">Guía Contable para No Expertos</h3>
                </div>
                <button type="button" onClick={() => setShowHelpModal(false)} className="rounded-full hover:bg-[#071a33]/5 p-2 transition">
                  <X size={18} />
                </button>
              </header>
              
              <div className="p-6 overflow-y-auto max-h-[70vh] space-y-6 text-sm leading-relaxed text-slate-600">
                <p className="text-slate-500">
                  La contabilidad es simplemente un registro ordenado de lo que la comunidad posee, debe, recibe y gasta. Aquí te explicamos los tipos de cuenta con ejemplos sencillos:
                </p>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="p-5 rounded-2xl bg-white border border-[#071a33]/8 hover:border-[#b08a3c]/40 transition">
                    <span className="inline-flex items-center text-[10px] font-bold tracking-wider uppercase bg-[#b08a3c]/10 text-[#9c7532] px-2.5 py-1 rounded mb-3">Activo</span>
                    <h4 className="font-bold text-[#071a33] text-sm">Lo que la comunidad tiene o le deben</h4>
                    <p className="text-xs text-slate-500 mt-1">Recursos económicos con valor comercial.</p>
                    <ul className="text-xs text-slate-600 mt-3 space-y-1 list-disc pl-4">
                      <li>Dinero en banco (ej: Banesco Cuenta Corriente)</li>
                      <li>Caja chica del conserje</li>
                      <li>Cuotas de condominio pendientes por cobrar</li>
                    </ul>
                  </div>

                  <div className="p-5 rounded-2xl bg-white border border-[#071a33]/8 hover:border-[#b08a3c]/40 transition">
                    <span className="inline-block text-[10px] font-bold tracking-wider uppercase bg-[#071a33]/10 text-[#071a33] px-2.5 py-1 rounded mb-3">Pasivo</span>
                    <h4 className="font-bold text-[#071a33] text-sm">Lo que la comunidad debe a terceros</h4>
                    <p className="text-xs text-slate-500 mt-1">Obligaciones pendientes de pago.</p>
                    <ul className="text-xs text-slate-600 mt-3 space-y-1 list-disc pl-4">
                      <li>Facturas por pagar a proveedores (ej: compañía de ascensores)</li>
                      <li>Prestaciones sociales acumuladas del personal</li>
                      <li>Retenciones de impuestos</li>
                    </ul>
                  </div>

                  <div className="p-5 rounded-2xl bg-white border border-[#071a33]/8 hover:border-[#b08a3c]/40 transition">
                    <span className="inline-block text-[10px] font-bold tracking-wider uppercase bg-[#b08a3c]/10 text-[#9c7532] px-2.5 py-1 rounded mb-3">Patrimonio</span>
                    <h4 className="font-bold text-[#071a33] text-sm">El fondo acumulado de la comunidad</h4>
                    <p className="text-xs text-slate-500 mt-1">Fondos acumulados y reserva de capital.</p>
                    <ul className="text-xs text-slate-600 mt-3 space-y-1 list-disc pl-4">
                      <li>Fondo de reserva para emergencias</li>
                      <li>Superávit (sobrantes) acumulados de años anteriores</li>
                    </ul>
                  </div>

                  <div className="p-5 rounded-2xl bg-white border border-[#071a33]/8 hover:border-[#b08a3c]/40 transition">
                    <span className="inline-block text-[10px] font-bold tracking-wider uppercase bg-[#071a33]/10 text-[#071a33] px-2.5 py-1 rounded mb-3">Ingreso</span>
                    <h4 className="font-bold text-[#071a33] text-sm">El dinero que entra a la comunidad</h4>
                    <p className="text-xs text-slate-500 mt-1">Recaudación y cobros recurrentes o extras.</p>
                    <ul className="text-xs text-slate-600 mt-3 space-y-1 list-disc pl-4">
                      <li>Facturación mensual del condominio (Cuota común)</li>
                      <li>Intereses ganados en cuentas bancarias</li>
                      <li>Alquiler de salones de fiesta o áreas comunes</li>
                    </ul>
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-white border border-[#071a33]/8 hover:border-[#b08a3c]/40 transition">
                  <span className="inline-block text-[10px] font-bold tracking-wider uppercase bg-[#b08a3c]/10 text-[#9c7532] px-2.5 py-1 rounded mb-3">Gasto</span>
                  <h4 className="font-bold text-[#071a33] text-sm">Costos operativos necesarios para funcionar</h4>
                  <p className="text-xs text-slate-500 mt-1">Egresos permanentes que no se recuperan pero mantienen la comunidad operativa.</p>
                  <ul className="text-xs text-slate-600 mt-3 grid gap-x-4 sm:grid-cols-2 list-disc pl-4">
                    <li>Servicio de vigilancia</li>
                    <li>Sueldo y nómina del conserje</li>
                    <li>Mantenimiento de áreas verdes y piscinas</li>
                    <li>Servicios públicos (Luz, agua común)</li>
                  </ul>
                </div>

                <div className="border-t border-[#071a33]/8 pt-5 space-y-3">
                  <h4 className="font-bold text-[#071a33] flex items-center gap-1.5">
                    Cuentas de Movimiento vs. Agrupadoras
                  </h4>
                  <p className="text-xs text-slate-600">
                    Imagínate el plan de cuentas como un archivador de oficina:
                  </p>
                  <div className="grid gap-3 sm:grid-cols-2 text-xs">
                    <div className="p-4 bg-[#071a33] rounded-xl border border-white/5 text-white">
                      <p className="font-bold text-[#d9b76d]">Cuenta Agrupadora (Padre)</p>
                      <p className="text-slate-200 mt-1 leading-relaxed">Es como la etiqueta de la carpeta. No contiene dinero directamente, solo sirve para sumar los totales de las hojas que metes dentro. <span className="block mt-1.5 text-white/60">Ejemplo: <strong className="text-[#d9b76d] font-bold">1.1.00 - Bancos nacionales</strong></span></p>
                    </div>
                    <div className="p-4 bg-[#071a33] rounded-xl border border-white/5 text-white">
                      <p className="font-bold text-[#d9b76d]">Cuenta de Movimiento (Hija)</p>
                      <p className="text-slate-200 mt-1 leading-relaxed">Es cada una de las hojas de papel reales donde escribes montos específicos. Aquí sí se registran transferencias o retiros. <span className="block mt-1.5 text-white/60">Ejemplo: <strong className="text-[#d9b76d] font-bold">1.1.01.01 - Banco Mercantil Cta. 1234</strong></span></p>
                    </div>
                  </div>
                </div>
              </div>
              
              <footer className="border-t border-[#071a33]/8 px-6 py-4 bg-white flex justify-end">
                <button type="button" onClick={() => setShowHelpModal(false)} className="rounded-xl bg-[#071a33] px-5 py-2.5 text-xs font-bold text-white hover:bg-opacity-90 transition">
                  Entendido, cerrar
                </button>
              </footer>
            </div>
          </div>
        )}

        {/* Subpage Header */}
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-5">
          <div>
            <button 
              type="button" 
              onClick={() => { setView('dashboard'); setError(''); setEditingAccount(null); }} 
              className="text-xs font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1.5 mb-2 transition"
            >
              ← Volver a la contabilidad
            </button>
            <h2 ref={accountFormTitleRef} className="text-2xl font-bold tracking-tight text-[#071a33] sm:text-3xl">Editar Cuenta Contable</h2>
            <p className="text-sm text-slate-500 mt-1">Modifica la configuración de la cuenta contable en tu comunidad.</p>
          </div>
          
          <button 
            type="button" 
            onClick={() => setShowHelpModal(true)} 
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#b08a3c]/10 border border-[#b08a3c]/20 px-4 py-2.5 text-sm font-bold text-[#9c7532] hover:bg-[#b08a3c]/20 transition"
          >
            <HelpCircle size={16} />
            Guía y Ejemplos Prácticos
          </button>
        </header>

        <div className="mt-8 grid gap-8 lg:grid-cols-3">
          {/* Main Form */}
          <div className="lg:col-span-2 bg-white rounded-3xl border border-[#071a33]/8 p-6 sm:p-8 shadow-[0_14px_45px_rgba(7,26,51,.03)]">
            <form onSubmit={submitEditAccount} className="space-y-6">
              {error && <div role="alert" className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">{error}</div>}
              <div className="grid gap-6 sm:grid-cols-2">
                <Field label="Código">
                  <FieldHelp text="Ejemplo: 1.1.01. Es la nomenclatura numérica ordenada para la contabilidad." />
                  <input name="code" className={inputClass} placeholder="Ej. 1.1.01" defaultValue={editingAccount?.code} required />
                </Field>
                
                <Field label="Tipo de cuenta">
                  <FieldHelp text="Define la naturaleza del saldo. Ej. Activo para cuentas bancarias, Gasto para egresos." />
                  <select name="type" className={inputClass} defaultValue={editingAccount?.type} onChange={(e) => setEditType(e.target.value as keyof typeof accountTypes)}>
                    {Object.entries(accountTypes).map(([key, label]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </select>
                </Field>
                
                {editType === 'ASSET' && (
                  <Field label="Cuenta bancaria de Tesorería (Opcional)">
                    <FieldHelp text="Vincula esta cuenta contable de activo con la cuenta receptora en Tesorería." />
                    <select name="bankAccountId" className={inputClass} defaultValue={editingAccount?.bankAccountId || ''}>
                      <option value="">Sin cuenta bancaria vinculada</option>
                      {(treasury?.bankAccounts ?? []).map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.bankName} · {b.currency} · •••• {b.accountNumber.slice(-4)} (Cuenta {b.accountType})
                        </option>
                      ))}
                    </select>
                  </Field>
                )}
                
                <Field label="Nombre de la cuenta" span>
                  <FieldHelp text="El nombre de la cuenta. Ej: Banco Provincial, Caja Chica, Fondo de Reserva." />
                  <input name="name" className={inputClass} placeholder="Ej. Banco Mercantil Principal" defaultValue={editingAccount?.name} required />
                </Field>
                
                <Field label="Cuenta padre (Superior)">
                  <FieldHelp text="Si es una subcuenta, elígela aquí. Ej: Banco Mercantil va bajo la cuenta padre 'Bancos'." />
                  <select name="parentId" className={inputClass} defaultValue={editingAccount?.parentId || ''} onChange={(e) => setEditParentId(e.target.value)}>
                    <option value="">Sin cuenta padre (Nivel principal)</option>
                    {snapshot?.ledgerAccounts
                      .filter((item) => item.id !== editingAccount?.id)
                      .map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.code} · {item.name}
                        </option>
                      ))
                    }
                  </select>
                  {editParent && (
                    <div className="mt-2.5 flex items-center gap-2">
                      <span className="text-[11px] font-semibold text-slate-400">Tipo de cuenta:</span>
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#fbf7ee] text-[#8d672a] border border-[#d7bb7c]/50 shadow-sm">
                        <span className="h-1.5 w-1.5 rounded-full bg-[#b08a3c]"></span>
                        {editParent.acceptsEntries ? 'Cuenta de movimiento' : 'Cuenta agrupadora'}
                      </span>
                    </div>
                  )}
                </Field>
                
                <Field label="Moneda de registro">
                  <FieldHelp text="Elige la moneda en la que opera esta cuenta. CASA conserva el importe en su moneda de origen y lo consolida en USD, que es la moneda funcional del sistema." />
                  <select name="currency" className={inputClass} defaultValue={editingAccount?.currency || 'USD'}>
                    <option value="USD">USD (Dólares)</option>
                    <option value="VES">VES (Bolívares)</option>
                  </select>
                </Field>
                
                <Field label="Descripción interna / Notas" span>
                  <FieldHelp text="Explicación detallada de para qué sirve esta cuenta." />
                  <textarea name="description" className={`${inputClass} min-h-24`} placeholder="Ej. Cuenta para recibir cuotas de condominio ordinarias." defaultValue={editingAccount?.description || ''} />
                </Field>
              </div>

              <div className="border-t border-slate-100 pt-6">
                <Field label="Función de la cuenta">
                  <FieldHelp text="Las cuentas agrupadoras (padre) no reciben asientos directos, solo consolidan el saldo de sus cuentas hijas. Las cuentas de movimiento sí reciben transacciones directamente." />
                  <select name="acceptsEntries" className={inputClass} defaultValue={String(editingAccount?.acceptsEntries)}>
                    <option value="true">Cuenta de movimiento (Acepta registros y asientos contables)</option>
                    <option value="false">Cuenta padre agrupadora (Solo agrupa subcuentas)</option>
                  </select>
                </Field>
              </div>

              <div className="flex gap-3 pt-4 justify-end">
                <button 
                  type="button" 
                  onClick={() => { setView('dashboard'); setError(''); setEditingAccount(null); }} 
                  className="rounded-xl border border-slate-200 bg-white px-5 py-3.5 text-sm font-bold hover:bg-slate-50 transition"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  disabled={saving} 
                  className="rounded-xl bg-[#071a33] px-6 py-3.5 text-sm font-bold text-white hover:bg-opacity-90 disabled:opacity-50 transition"
                >
                  {saving ? 'Guardando cambios...' : 'Guardar Cambios'}
                </button>
              </div>
            </form>
          </div>

          {/* Quick tips sidebar */}
          <div className="space-y-6">
            <div className="bg-[#fcfbf9] border border-[#d7bb7c]/25 rounded-3xl p-6 shadow-sm">
              <h3 className="font-bold text-[#8d672a] text-sm tracking-wide uppercase">Consejos Rápidos</h3>
              <ul className="mt-4 space-y-3.5 text-xs leading-relaxed text-slate-600 list-disc pl-4">
                <li>Las <b>cuentas agrupadoras</b> (como "Total Activos") no aceptan transacciones directas.</li>
                <li>Sigue la estructura jerárquica de tu plan. Ejemplo: <b>1.0.0 (Activo)</b> → <b>1.1.00 (Efectivo y Equivalentes)</b> → <b>1.1.01 (Bancos)</b>.</li>
                <li>Si configuras cuentas en dólares, especifica la moneda <b>USD</b> para facilitar las conciliaciones de divisas.</li>
              </ul>
            </div>
            
            <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6">
              <h3 className="font-bold text-slate-800 text-sm">¿Cómo estructurar?</h3>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                Elige la cuenta padre correcta para que los reportes de balance general se generen balanceados y agrupados de forma automática.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (view === 'create-account') {
    return (
      <div className="animate-fadeIn">
        {/* Custom Help Modal for Accounting Beginners */}
        {showHelpModal && (
          <div className="fixed inset-0 z-[110] overflow-y-auto bg-[#071a33]/70 p-4 backdrop-blur-sm flex items-center justify-center">
            <div className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full mx-auto my-8 overflow-hidden transition-all transform duration-300 scale-100">
              <header className="flex items-center justify-between border-b border-[#071a33]/8 px-6 py-5 bg-white">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-[#b08a3c]/10 text-[#9c7532] rounded-lg"><HelpCircle size={18} /></div>
                  <h3 className="font-bold text-[#071a33] text-lg">Guía Contable para No Expertos</h3>
                </div>
                <button type="button" onClick={() => setShowHelpModal(false)} className="rounded-full hover:bg-[#071a33]/5 p-2 transition">
                  <X size={18} />
                </button>
              </header>
              
              <div className="p-6 overflow-y-auto max-h-[70vh] space-y-6 text-sm leading-relaxed text-slate-600">
                <p className="text-slate-500">
                  La contabilidad es simplemente un registro ordenado de lo que la comunidad posee, debe, recibe y gasta. Aquí te explicamos los tipos de cuenta con ejemplos sencillos:
                </p>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="p-5 rounded-2xl bg-white border border-[#071a33]/8 hover:border-[#b08a3c]/40 transition">
                    <span className="inline-flex items-center text-[10px] font-bold tracking-wider uppercase bg-[#b08a3c]/10 text-[#9c7532] px-2.5 py-1 rounded mb-3">Activo</span>
                    <h4 className="font-bold text-[#071a33] text-sm">Lo que la comunidad tiene o le deben</h4>
                    <p className="text-xs text-slate-500 mt-1">Recursos económicos con valor comercial.</p>
                    <ul className="text-xs text-slate-600 mt-3 space-y-1 list-disc pl-4">
                      <li>Dinero en banco (ej: Banesco Cuenta Corriente)</li>
                      <li>Caja chica del conserje</li>
                      <li>Cuotas de condominio pendientes por cobrar</li>
                    </ul>
                  </div>

                  <div className="p-5 rounded-2xl bg-white border border-[#071a33]/8 hover:border-[#b08a3c]/40 transition">
                    <span className="inline-block text-[10px] font-bold tracking-wider uppercase bg-[#071a33]/10 text-[#071a33] px-2.5 py-1 rounded mb-3">Pasivo</span>
                    <h4 className="font-bold text-[#071a33] text-sm">Lo que la comunidad debe a terceros</h4>
                    <p className="text-xs text-slate-500 mt-1">Obligaciones pendientes de pago.</p>
                    <ul className="text-xs text-slate-600 mt-3 space-y-1 list-disc pl-4">
                      <li>Facturas por pagar a proveedores (ej: compañía de ascensores)</li>
                      <li>Prestaciones sociales acumuladas del personal</li>
                      <li>Retenciones de impuestos</li>
                    </ul>
                  </div>

                  <div className="p-5 rounded-2xl bg-white border border-[#071a33]/8 hover:border-[#b08a3c]/40 transition">
                    <span className="inline-block text-[10px] font-bold tracking-wider uppercase bg-[#b08a3c]/10 text-[#9c7532] px-2.5 py-1 rounded mb-3">Patrimonio</span>
                    <h4 className="font-bold text-[#071a33] text-sm">El fondo acumulado de la comunidad</h4>
                    <p className="text-xs text-slate-500 mt-1">Fondos acumulados y reserva de capital.</p>
                    <ul className="text-xs text-slate-600 mt-3 space-y-1 list-disc pl-4">
                      <li>Fondo de reserva para emergencias</li>
                      <li>Superávit (sobrantes) acumulados de años anteriores</li>
                    </ul>
                  </div>

                  <div className="p-5 rounded-2xl bg-white border border-[#071a33]/8 hover:border-[#b08a3c]/40 transition">
                    <span className="inline-block text-[10px] font-bold tracking-wider uppercase bg-[#071a33]/10 text-[#071a33] px-2.5 py-1 rounded mb-3">Ingreso</span>
                    <h4 className="font-bold text-[#071a33] text-sm">El dinero que entra a la comunidad</h4>
                    <p className="text-xs text-slate-500 mt-1">Recaudación y cobros recurrentes o extras.</p>
                    <ul className="text-xs text-slate-600 mt-3 space-y-1 list-disc pl-4">
                      <li>Facturación mensual del condominio (Cuota común)</li>
                      <li>Intereses ganados en cuentas bancarias</li>
                      <li>Alquiler de salones de fiesta o áreas comunes</li>
                    </ul>
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-white border border-[#071a33]/8 hover:border-[#b08a3c]/40 transition">
                  <span className="inline-block text-[10px] font-bold tracking-wider uppercase bg-[#b08a3c]/10 text-[#9c7532] px-2.5 py-1 rounded mb-3">Gasto</span>
                  <h4 className="font-bold text-[#071a33] text-sm">Costos operativos necesarios para funcionar</h4>
                  <p className="text-xs text-slate-500 mt-1">Egresos permanentes que no se recuperan pero mantienen la comunidad operativa.</p>
                  <ul className="text-xs text-slate-600 mt-3 grid gap-x-4 sm:grid-cols-2 list-disc pl-4">
                    <li>Servicio de vigilancia</li>
                    <li>Sueldo y nómina del conserje</li>
                    <li>Mantenimiento de áreas verdes y piscinas</li>
                    <li>Servicios públicos (Luz, agua común)</li>
                  </ul>
                </div>

                <div className="border-t border-[#071a33]/8 pt-5 space-y-3">
                  <h4 className="font-bold text-[#071a33] flex items-center gap-1.5">
                    Cuentas de Movimiento vs. Agrupadoras
                  </h4>
                  <p className="text-xs text-slate-600">
                    Imagínate el plan de cuentas como un archivador de oficina:
                  </p>
                  <div className="grid gap-3 sm:grid-cols-2 text-xs">
                    <div className="p-4 bg-[#071a33] rounded-xl border border-white/5 text-white">
                      <p className="font-bold text-[#d9b76d]">Cuenta Agrupadora (Padre)</p>
                      <p className="text-slate-200 mt-1 leading-relaxed">Es como la etiqueta de la carpeta. No contiene dinero directamente, solo sirve para sumar los totales de las hojas que metes dentro. <span className="block mt-1.5 text-white/60">Ejemplo: <strong className="text-[#d9b76d] font-bold">1.1.00 - Bancos nacionales</strong></span></p>
                    </div>
                    <div className="p-4 bg-[#071a33] rounded-xl border border-white/5 text-white">
                      <p className="font-bold text-[#d9b76d]">Cuenta de Movimiento (Hija)</p>
                      <p className="text-slate-200 mt-1 leading-relaxed">Es cada una de las hojas de papel reales donde escribes montos específicos. Aquí sí se registran transferencias o retiros. <span className="block mt-1.5 text-white/60">Ejemplo: <strong className="text-[#d9b76d] font-bold">1.1.01.01 - Banco Mercantil Cta. 1234</strong></span></p>
                    </div>
                  </div>
                </div>
              </div>
              
              <footer className="border-t border-[#071a33]/8 px-6 py-4 bg-white flex justify-end">
                <button type="button" onClick={() => setShowHelpModal(false)} className="rounded-xl bg-[#071a33] px-5 py-2.5 text-xs font-bold text-white hover:bg-opacity-90 transition">
                  Entendido, cerrar
                </button>
              </footer>
            </div>
          </div>
        )}

        {/* Subpage Header */}
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-5">
          <div>
            <button 
              type="button" 
              onClick={() => { setView('dashboard'); setError(''); }} 
              className="text-xs font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1.5 mb-2 transition"
            >
              ← Volver a la contabilidad
            </button>
            <h2 ref={accountFormTitleRef} className="text-2xl font-bold tracking-tight text-[#071a33] sm:text-3xl">Crear Cuenta Contable</h2>
            <p className="text-sm text-slate-500 mt-1">Configura una cuenta contable en el catálogo único de tu comunidad.</p>
          </div>
          
          <button 
            type="button" 
            onClick={() => setShowHelpModal(true)} 
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#b08a3c]/10 border border-[#b08a3c]/20 px-4 py-2.5 text-sm font-bold text-[#9c7532] hover:bg-[#b08a3c]/20 transition"
          >
            <HelpCircle size={16} />
            Guía y Ejemplos Prácticos
          </button>
        </header>

        <div className="mt-8 grid gap-8 lg:grid-cols-3">
          {/* Main Form */}
          <div className="lg:col-span-2 bg-white rounded-3xl border border-[#071a33]/8 p-6 sm:p-8 shadow-[0_14px_45px_rgba(7,26,51,.03)]">
            <form onSubmit={submitAccount} className="space-y-6">
              {error && <div role="alert" className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">{error}</div>}
              <div className="grid gap-6 sm:grid-cols-2">
                <Field label="Código">
                  <FieldHelp text="Ejemplo: 1.1.01. Es la nomenclatura numérica ordenada para la contabilidad." />
                  <input name="code" className={inputClass} placeholder="Ej. 1.1.01" required />
                </Field>
                
                <Field label="Tipo de cuenta">
                  <FieldHelp text="Define la naturaleza del saldo. Ej. Activo para cuentas bancarias, Gasto para egresos." />
                  <select name="type" className={inputClass} defaultValue="ASSET" onChange={(e) => setCreateType(e.target.value as keyof typeof accountTypes)}>
                    {Object.entries(accountTypes).map(([key, label]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </select>
                </Field>
                
                {createType === 'ASSET' && (
                  <Field label="Cuenta bancaria de Tesorería (Opcional)">
                    <FieldHelp text="Vincula esta cuenta contable de activo con la cuenta receptora en Tesorería." />
                    <select name="bankAccountId" className={inputClass} defaultValue="">
                      <option value="">Sin cuenta bancaria vinculada</option>
                      {(treasury?.bankAccounts ?? []).map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.bankName} · {b.currency} · •••• {b.accountNumber.slice(-4)} (Cuenta {b.accountType})
                        </option>
                      ))}
                    </select>
                  </Field>
                )}
                
                <Field label="Nombre de la cuenta" span>
                  <FieldHelp text="El nombre de la cuenta. Ej: Banco Provincial, Caja Chica, Fondo de Reserva." />
                  <input name="name" className={inputClass} placeholder="Ej. Banco Mercantil Principal" required />
                </Field>
                
                <Field label="Cuenta padre (Superior)">
                  <FieldHelp text="Si es una subcuenta, elígela aquí. Ej: Banco Mercantil va bajo la cuenta padre 'Bancos'." />
                  <select name="parentId" className={inputClass} onChange={(e) => setCreateParentId(e.target.value)}>
                    <option value="">Sin cuenta padre (Nivel principal)</option>
                    {snapshot?.ledgerAccounts.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.code} · {item.name}
                      </option>
                    ))}
                  </select>
                  {createParent && (
                    <div className="mt-2.5 flex items-center gap-2">
                      <span className="text-[11px] font-semibold text-slate-400">Tipo de cuenta:</span>
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#fbf7ee] text-[#8d672a] border border-[#d7bb7c]/50 shadow-sm">
                        <span className="h-1.5 w-1.5 rounded-full bg-[#b08a3c]"></span>
                        {createParent.acceptsEntries ? 'Cuenta de movimiento' : 'Cuenta agrupadora'}
                      </span>
                    </div>
                  )}
                </Field>
                
                <Field label="Moneda de registro">
                  <FieldHelp text="Elige la moneda en la que opera esta cuenta. CASA conserva el importe en su moneda de origen y lo consolida en USD, que es la moneda funcional del sistema." />
                  <select name="currency" className={inputClass} defaultValue="USD">
                    <option value="USD">USD (Dólares)</option>
                    <option value="VES">VES (Bolívares)</option>
                  </select>
                </Field>
                
                <Field label="Descripción interna / Notas" span>
                  <FieldHelp text="Explicación detallada de para qué sirve esta cuenta." />
                  <textarea name="description" className={`${inputClass} min-h-24`} placeholder="Ej. Cuenta para recibir cuotas de condominio ordinarias." />
                </Field>
              </div>

              <div className="border-t border-slate-100 pt-6">
                <Field label="Función de la cuenta">
                  <FieldHelp text="Las cuentas agrupadoras (padre) no reciben asientos directos, solo consolidan el saldo de sus cuentas hijas. Las cuentas de movimiento sí reciben transacciones directamente." />
                  <select name="acceptsEntries" className={inputClass}>
                    <option value="true">Cuenta de movimiento (Acepta registros y asientos contables)</option>
                    <option value="false">Cuenta padre agrupadora (Solo agrupa subcuentas)</option>
                  </select>
                </Field>
              </div>

              <div className="flex gap-3 pt-4 justify-end">
                <button 
                  type="button" 
                  onClick={() => { setView('dashboard'); setError(''); }} 
                  className="rounded-xl border border-slate-200 bg-white px-5 py-3.5 text-sm font-bold hover:bg-slate-50 transition"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  disabled={saving} 
                  className="rounded-xl bg-[#071a33] px-6 py-3.5 text-sm font-bold text-white hover:bg-opacity-90 disabled:opacity-50 transition"
                >
                  {saving ? 'Creando cuenta...' : 'Crear Cuenta Contable'}
                </button>
              </div>
            </form>
          </div>

          {/* Quick tips sidebar */}
          <div className="space-y-6">
            <div className="bg-[#fcfbf9] border border-[#d7bb7c]/25 rounded-3xl p-6 shadow-sm">
              <h3 className="font-bold text-[#8d672a] text-sm tracking-wide uppercase">Consejos Rápidos</h3>
              <ul className="mt-4 space-y-3.5 text-xs leading-relaxed text-slate-600 list-disc pl-4">
                <li>Las <b>cuentas agrupadoras</b> (como "Total Activos") no aceptan transacciones directas. Desactiva la casilla correspondiente para estas.</li>
                <li>Sigue la estructura jerárquica de tu plan. Ejemplo: <b>1.0.0 (Activo)</b> → <b>1.1.00 (Efectivo y Equivalentes)</b> → <b>1.1.01 (Bancos)</b>.</li>
                <li>Si configuras cuentas en dólares, especifica la moneda <b>USD</b> para facilitar las conciliaciones de divisas.</li>
              </ul>
            </div>
            
            <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6">
              <h3 className="font-bold text-slate-800 text-sm">¿Cómo estructurar?</h3>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                Elige la cuenta padre correcta para que los reportes de balance general se generen balanceados y agrupados de forma automática.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <div>
    <header className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
      <div className="max-w-3xl">
        <p className="text-xs font-bold uppercase tracking-[.22em] text-[#9c7532]">Núcleo financiero · Doble partida</p>
        <h2 className="mt-3 text-3xl font-semibold tracking-[-.035em] sm:text-4xl">{section === 'accounts' ? 'Cuentas contables de la comunidad' : section === 'periods' ? 'Asientos contables' : section === 'receivables' ? 'Cuentas por cobrar' : 'Libro diario'}</h2>
        <p className="mt-4 leading-7 text-slate-500">{section === 'accounts' ? 'Crea y organiza el plan de cuentas de la comunidad.' : section === 'periods' ? 'Gestiona los períodos de trabajo y revisa los asientos pendientes, contabilizados o reversados.' : section === 'receivables' ? 'Consulta la deuda de los propietarios y el avance de los avisos de cobro.' : 'Consulta los asientos y movimientos contables registrados.'}</p>
      </div>
    </header>

    {error && <div role="alert" className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">{error}</div>}
    {notice && <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">{notice}</div>}

    {section === 'accounts' && <>
    <Panel eyebrow="Estructura contable" title="Plan de cuentas">
      <div className="mb-5 flex flex-col gap-3 rounded-2xl bg-[#f8f6f1] p-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-slate-600">Descarga, imprime o carga el catálogo completo con su jerarquía.</p>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => exportAccounts('xlsx')} disabled={!snapshot || loading} className="inline-flex items-center gap-2 rounded-xl border border-[#071a33]/12 bg-white px-3 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"><Download size={15} /> Exportar XLSX</button>
          <button type="button" onClick={() => exportAccounts('json')} disabled={!snapshot || loading} className="inline-flex items-center gap-2 rounded-xl border border-[#071a33]/12 bg-white px-3 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"><Download size={15} /> Exportar JSON</button>
          <button type="button" onClick={printAccounts} disabled={!snapshot || loading} className="inline-flex items-center gap-2 rounded-xl border border-[#071a33]/12 bg-white px-3 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"><Printer size={15} /> Imprimir</button>
          {canWrite && <button type="button" onClick={() => accountImportRef.current?.click()} disabled={!snapshot || loading || saving} className="inline-flex items-center gap-2 rounded-xl bg-[#071a33] px-3 py-2 text-xs font-bold text-white transition hover:bg-[#14365d] disabled:opacity-50"><Upload size={15} /> {saving ? 'Importando…' : 'Importar'}</button>}
          <input ref={accountImportRef} type="file" accept=".xlsx,.json,application/json,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" className="hidden" onChange={(event) => { const file = event.currentTarget.files?.[0]; if (file) void importAccounts(file); }} />
        </div>
      </div>
      {collapsibleAccountIds.length > 0 && (
        <div className="mb-4 flex justify-end">
          <button
            type="button"
            onClick={() => setCollapsedAccountIds(allAccountsExpanded ? new Set(collapsibleAccountIds) : new Set())}
            className="inline-flex items-center gap-1.5 rounded-xl border border-[#071a33]/12 bg-white px-3 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-50"
          >
            {allAccountsExpanded ? <ChevronsDownUp size={15} /> : <ChevronsUpDown size={15} />}
            {allAccountsExpanded ? 'Contraer todo' : 'Desplegar todo'}
          </button>
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            <tr>
              <th className="pb-3">Código</th>
              <th className="pb-3">Cuenta</th>
              <th className="pb-3">Tipo</th>
              <th className="pb-3">Moneda</th>
              <th className="pb-3">Naturaleza</th>
              <th className="pb-3">Uso</th>
              {canWrite && <th className="pb-3 text-right">Acciones</th>}
            </tr>
          </thead>
          <tbody>
            {ledgerAccountTree.map(({ account, depth, isLast, hasChildren }) => (
              <tr key={account.id} className={`border-b border-slate-100 transition-colors hover:bg-slate-50/50 ${account.acceptsEntries ? '' : 'bg-[#faf6ec]/70'}`}>
                <td className="py-2 pl-2.5 font-mono text-xs font-bold">
                  <div className="flex items-center" style={{ paddingLeft: `${depth * 1.25}rem` }}>
                    {depth > 0 && <span aria-hidden="true" className="mr-1.5 select-none text-[#b08a3c]">{isLast ? '└──' : '├──'}</span>}
                    {hasChildren ? (
                      <button
                        type="button"
                        onClick={() => toggleAccountChildren(account.id)}
                        aria-label={`${collapsedAccountIds.has(account.id) ? 'Desplegar' : 'Contraer'} cuentas hijas de ${account.name}`}
                        title={collapsedAccountIds.has(account.id) ? 'Desplegar cuentas hijas' : 'Contraer cuentas hijas'}
                        className="mr-1 inline-flex h-5 w-5 items-center justify-center rounded text-[#75551e] transition hover:bg-[#b08a3c]/15"
                      >
                        {collapsedAccountIds.has(account.id) ? <ChevronRight size={15} /> : <ChevronDown size={15} />}
                      </button>
                    ) : <span className="mr-1 inline-block w-5" />}
                    <span>{account.code}</span>
                  </div>
                </td>
                <td className="py-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className={`font-semibold ${account.acceptsEntries ? 'text-slate-800' : 'text-[#75551e]'}`}>{account.name}</p>
                    {account.bankAccount && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-[#071a33]/5 text-[#8d672a] text-[11px] font-bold border border-[#d7bb7c]/50">
                        {account.bankAccount.bankName} (•••• {account.bankAccount.accountNumber.slice(-4)})
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 text-xs text-slate-400">{account.description || 'Sin descripción'}</p>
                </td>
                <td className="py-2 text-slate-600">{accountTypes[account.type]}</td>
                <td className="py-2 text-slate-600">{account.currency || 'USD (Dólares)'}</td>
                <td className="py-2 text-slate-600">{account.normalBalance === 'DEBIT' ? 'Deudora' : 'Acreedora'}</td>
                <td className="py-2">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${account.acceptsEntries ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-blue-50 text-blue-700 border border-blue-100'}`}>
                    {account.acceptsEntries ? 'Movimiento' : 'Agrupadora'}
                  </span>
                </td>
                {canWrite && (
                  <td className="py-2 text-right">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingAccount(account);
                        setView('edit-account');
                        setError('');
                      }}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-bold text-slate-600 hover:bg-slate-50 transition"
                    >
                      <Pencil size={12} />
                      Editar
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
        {!snapshot?.ledgerAccounts.length && <Empty text="Crea el plan de cuentas antes de preparar asientos." />}
      </div>
    </Panel>
    </>}

    {section === 'periods' && <Panel eyebrow="Registro y cierre" title="Períodos y asientos">
      <div className="mb-5 flex flex-col gap-4 rounded-2xl bg-[#f8f6f1] p-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="max-w-2xl text-sm leading-6 text-slate-600">Cada período organiza los asientos de un mes. Desde aquí el contador puede abrir el mes, revisar borradores y cerrar el período cuando todo esté contabilizado.</p>
        {canWrite && <button type="button" onClick={() => setDialog('period')} className="shrink-0 rounded-xl bg-[#071a33] px-4 py-2.5 text-sm font-bold text-white">Crear período contable</button>}
      </div>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {snapshot?.accountingPeriods.map((period) => <article key={period.id} className="rounded-2xl border border-slate-200 p-4">
          <div className="flex items-start justify-between gap-3"><div><p className="font-bold">{period.label}</p><p className="mt-1 text-xs text-slate-400">{period.periodKey}</p></div><Status value={period.status} /></div>
          <p className="mt-3 text-xs leading-5 text-slate-500">{period.status === 'OPEN' ? 'Este mes admite nuevos movimientos contables.' : period.status === 'CLOSED' ? 'Este mes ya fue cerrado y no admite nuevos movimientos.' : 'Este mes está bloqueado temporalmente.'}</p>
          <div className="mt-3 flex gap-2 text-xs font-semibold text-slate-600"><span>{snapshot?.journalEntries.filter((entry) => entry.accountingPeriodId === period.id).length ?? 0} asientos</span><span>·</span><span>{snapshot?.journalEntries.filter((entry) => entry.accountingPeriodId === period.id && entry.status === 'DRAFT').length ?? 0} pendientes</span></div>
          {period.closedAt && <p className="mt-3 text-xs text-slate-500">Cerrado: {formatDateTime(period.closedAt)}</p>}
          {period.status === 'OPEN' && canPost && <button type="button" onClick={() => { setTargetId(period.id); setDialog('close'); }} className="mt-4 rounded-xl border border-rose-200 px-3 py-2 text-xs font-bold text-rose-700">Cerrar período</button>}
        </article>)}
        {!snapshot?.accountingPeriods.length && <Empty text="Aún no existen períodos contables. Aquí se mostrarán los meses abiertos, cerrados o bloqueados." />}
      </div>
    </Panel>}

    {section === 'receivables' && <ReceivablesMockup />}

    {section === 'journal' && <Panel eyebrow="Asientos y trazabilidad" title="Libro diario">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-[#fffaf0] p-4"><p className="max-w-2xl text-sm leading-6 text-slate-600">El reporte incluye la identificación legal del condominio, RIF, dirección y cada asiento con sus líneas de debe y haber.</p><button type="button" onClick={printJournal} className="rounded-xl bg-[#071a33] px-4 py-2.5 text-sm font-bold text-white">Imprimir / guardar PDF</button></div>
      <div className="space-y-3">
        {snapshot?.journalEntries.map((entry) => <article key={entry.id} className="rounded-2xl border border-slate-200 p-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <div><div className="flex flex-wrap items-center gap-2"><p className="font-bold">{entry.entryNumber ? `Asiento N.º ${entry.entryNumber}` : 'Asiento sin numerar'}</p><Status value={entry.status} /></div><p className="mt-2 text-sm">{entry.description}</p><p className="mt-1 text-xs text-slate-400">{formatDateTime(entry.entryDate)} · {entry.source}</p></div>
            <div className="flex gap-2">
              {entry.status === 'DRAFT' && canPost && <button type="button" onClick={() => { setTargetId(entry.id); setDialog('post'); }} className="rounded-xl bg-[#071a33] px-3 py-2 text-xs font-bold text-white">Contabilizar</button>}
              {entry.status === 'POSTED' && canPost && <button type="button" onClick={() => { setTargetId(entry.id); setDialog('reverse'); }} className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 px-3 py-2 text-xs font-bold text-rose-700"><RotateCcw size={13} /> Reversar</button>}
            </div>
          </div>
          <div className="mt-4 grid gap-2 lg:grid-cols-2">{entry.lines.map((line) => <div key={line.id} className="grid grid-cols-[1fr_auto_auto] gap-3 rounded-xl bg-[#f8f6f1] px-3 py-2 text-xs"><span>{line.account.code} · {line.account.name}</span><span>D {money.format(Number(line.debit))}</span><span>C {money.format(Number(line.credit))}</span></div>)}</div>
        </article>)}
        {!snapshot?.journalEntries.length && <Empty text="Aún no existen asientos contables." />}
      </div>
    </Panel>}

    {/* Cuenta contable dialog has been migrated to a dedicated view */}

    {dialog === 'period' && (
      <DialogFrame title="Abrir período contable" wide onClose={() => setDialog(null)}>
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_21rem] lg:items-start">
          <form onSubmit={submitPeriod} className="rounded-2xl border border-[#071a33]/8 bg-white p-5 sm:p-6">
            <p className="text-sm leading-6 text-slate-600">Selecciona el mes que vas a registrar y asígnale un nombre fácil de reconocer.</p>
            <div className="mt-5 space-y-4">
              <Field label="Mes"><input name="periodKey" type="month" className={inputClass} required /></Field>
              <Field label="Nombre visible"><input name="label" className={inputClass} required placeholder="Ej.: Julio 2026" /></Field>
            </div>
            <Submit saving={saving} label="Abrir período" />
          </form>

          <aside aria-label="Ayuda sobre períodos contables" className="rounded-2xl border border-[#d7bb7c]/70 bg-[#fffaf0] p-5 text-sm text-slate-700">
            <div className="flex items-center gap-2 text-[#805d20]"><HelpCircle size={19} /><h4 className="font-bold">Ayuda rápida</h4></div>
            <h5 className="mt-5 text-base font-bold text-[#071a33]">¿Qué es un período contable?</h5>
            <p className="mt-2 leading-6">Es el espacio de tiempo en el que ordenamos los movimientos de dinero de la comunidad. Normalmente corresponde a un mes.</p>
            <h5 className="mt-5 text-base font-bold text-[#071a33]">¿Para qué sirve?</h5>
            <p className="mt-2 leading-6">Permite saber qué ingresos y gastos pertenecen a cada mes, preparar reportes claros y evitar que se mezclen movimientos de fechas distintas.</p>
            <div className="mt-5 rounded-xl border border-[#d7bb7c]/60 bg-white/80 p-4">
              <p className="font-bold text-[#805d20]">Ejemplo</p>
              <p className="mt-1.5 leading-6">Si vas a registrar pagos, facturas y gastos de julio, abre el período <b>Julio 2026</b>. Todo lo registrado allí quedará organizado como parte de ese mes.</p>
            </div>
            <p className="mt-5 border-t border-[#d7bb7c]/50 pt-4 text-xs leading-5 text-slate-600"><b>Antes de continuar:</b> abre un período solo cuando vayas a comenzar a registrar movimientos de ese mes.</p>
          </aside>
        </div>
      </DialogFrame>
    )}

    {dialog === 'entry' && <DialogFrame title="Preparar asiento de doble partida" wide onClose={() => setDialog(null)}><form onSubmit={submitEntry}><div className="grid gap-4 sm:grid-cols-2"><Field label="Período"><select name="accountingPeriodId" className={inputClass} required>{openPeriods.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</select></Field><Field label="Fecha"><input name="entryDate" type="date" className={inputClass} required /></Field><Field label="Descripción" span><input name="description" className={inputClass} required /></Field></div>
      <div className="mt-6 space-y-3">{lines.map((line, index) => <div key={line.id} className="grid gap-3 rounded-2xl border border-slate-200 p-4 md:grid-cols-[1.5fr_1fr_.7fr_.7fr_auto] md:items-end"><Field label={`Cuenta ${index + 1}`}><select value={line.accountId} onChange={(event) => updateLine(line.id, { accountId: event.target.value })} className={inputClass} required><option value="">Seleccionar</option>{postingAccounts.map((item) => <option key={item.id} value={item.id}>{item.code} · {item.name}</option>)}</select></Field><Field label="Detalle"><input value={line.description} onChange={(event) => updateLine(line.id, { description: event.target.value })} className={inputClass} /></Field><Field label="Débito"><input value={line.debit} onChange={(event) => updateLine(line.id, { debit: event.target.value, credit: event.target.value ? '' : line.credit })} type="number" min="0" step="0.01" className={inputClass} /></Field><Field label="Crédito"><input value={line.credit} onChange={(event) => updateLine(line.id, { credit: event.target.value, debit: event.target.value ? '' : line.debit })} type="number" min="0" step="0.01" className={inputClass} /></Field><button type="button" disabled={lines.length <= 2} onClick={() => setLines((current) => current.filter((item) => item.id !== line.id))} className="rounded-xl border border-rose-200 p-3 text-rose-700 disabled:opacity-30"><X size={16} /></button></div>)}</div>
      <button type="button" onClick={() => setLines((current) => [...current, blankLine()])} className="mt-3 inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold"><Plus size={15} />Agregar línea</button>
      <div className={`mt-5 grid gap-2 rounded-2xl p-4 sm:grid-cols-3 ${balanced ? 'bg-emerald-50 text-emerald-800' : 'bg-amber-50 text-amber-900'}`}><p>Débitos: <b>{money.format(totals.debit)}</b></p><p>Créditos: <b>{money.format(totals.credit)}</b></p><p>{balanced ? 'Asiento balanceado' : `Diferencia: ${money.format(Math.abs(totals.debit - totals.credit))}`}</p></div><Submit saving={saving || !balanced} label="Guardar borrador" /></form></DialogFrame>}

    {dialog === 'post' && <Confirm title="Contabilizar asiento" copy="Se asignará un número definitivo. Después solo podrá corregirse mediante un asiento de reverso." label="Contabilizar definitivamente" saving={saving} onClose={() => setDialog(null)} onConfirm={() => void execute(() => CommunityWorkspaceService.postJournalEntry(targetId), 'Asiento contabilizado.')} />}
    {dialog === 'close' && <Confirm title="Cerrar período" copy="CASA impedirá el cierre si existen borradores. Un período cerrado no admite nuevos movimientos." label="Cerrar período" saving={saving} danger onClose={() => setDialog(null)} onConfirm={() => void execute(() => CommunityWorkspaceService.closeAccountingPeriod(targetId), 'Período contable cerrado.')} />}
    {dialog === 'reverse' && <DialogFrame title="Reversar asiento" onClose={() => setDialog(null)}><form onSubmit={(event) => { event.preventDefault(); const form = new FormData(event.currentTarget); void execute(() => CommunityWorkspaceService.reverseJournalEntry(targetId, { accountingPeriodId: String(form.get('accountingPeriodId')), entryDate: new Date(`${String(form.get('entryDate'))}T12:00:00-04:00`).toISOString(), reason: String(form.get('reason')).trim() }), 'Asiento reversado mediante un movimiento compensatorio.'); }}><p className="rounded-2xl bg-amber-50 p-4 text-sm leading-6 text-amber-900">El asiento original no se elimina. CASA creará otro con débitos y créditos invertidos.</p><Field label="Período"><select name="accountingPeriodId" className={inputClass} required>{openPeriods.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</select></Field><Field label="Fecha"><input name="entryDate" type="date" className={inputClass} required /></Field><Field label="Justificación"><textarea name="reason" className={`${inputClass} min-h-24`} required /></Field><Submit saving={saving} label="Generar reverso" /></form></DialogFrame>}
  </div>;
}

function ReceivablesMockup() {
  const [snapshot, setSnapshot] = useState<ReceivablesSnapshot | null>(null);
  const [error, setError] = useState('');
  useEffect(() => { CommunityWorkspaceService.receivablesSnapshot().then(setSnapshot).catch((cause: unknown) => setError(cause instanceof Error ? cause.message : 'No fue posible cargar las cuentas por cobrar.')); }, []);
  const currentNotice = snapshot?.currentPeriod;
  const amount = (value: string | undefined) => value === undefined ? '—' : `USD ${money.format(Number(value))}`;
  const metrics = [
    { label: 'Deuda total de la comunidad', value: amount(snapshot?.totalPendingUsd), detail: 'Todos los avisos emitidos menos los pagos ya aplicados.' },
    { label: 'Pendiente del período actual', value: amount(currentNotice?.pendingUsd), detail: currentNotice ? `Saldo pendiente de ${currentNotice.billingPeriod.label}.` : 'No hay avisos de cobro emitidos.' },
    { label: 'Pagado en el período actual', value: amount(currentNotice?.paidUsd), detail: currentNotice ? `Pagos aplicados a ${currentNotice.billingPeriod.label}.` : 'No hay avisos de cobro emitidos.' },
    { label: 'Total emitido', value: amount(snapshot?.totalIssuedUsd), detail: 'Total de los avisos de cobro vigentes de la comunidad.' },
  ];

  return (
    <section className="mt-6 rounded-[1.6rem] border border-[#071a33]/8 bg-white p-5 sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[.16em] text-[#9c7532]">Maqueta de cartera</p>
          <h3 className="mt-2 text-xl font-semibold">Cuentas por cobrar</h3>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">Aquí podrás ver cuánto deben los propietarios en total y cómo avanza el cobro del período actual.</p>
        </div>
        <span className="w-fit rounded-full border border-[#d7bb7c]/60 bg-[#fffaf0] px-3 py-1.5 text-xs font-bold text-[#805d20]">USD · moneda funcional CASA</span>
      </div>

      {error && <div role="alert" className="mt-5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">{error}</div>}

      <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <article key={metric.label} className="rounded-2xl border border-slate-200 bg-[#fcfcfb] p-4">
            <p className="text-xs font-bold text-slate-500">{metric.label}</p>
            <p className="mt-3 text-2xl font-bold text-[#071a33]">{metric.value}</p>
            <p className="mt-2 text-xs leading-5 text-slate-500">{metric.detail}</p>
          </article>
        ))}
      </div>

      {currentNotice && <div className="mt-6 rounded-2xl border border-[#d7bb7c]/50 bg-[#fffaf0] p-5"><div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-xs font-bold uppercase tracking-wide text-[#805d20]">Avance del período actual</p><p className="mt-1 font-semibold">{currentNotice.billingPeriod.label}</p></div><p className="text-2xl font-bold text-[#071a33]">{currentNotice.collectionRate.toFixed(2)}%</p></div><div className="mt-4 h-3 overflow-hidden rounded-full bg-[#e8dec9]"><div className="h-full rounded-full bg-[#b08a3c]" style={{ width: `${Math.min(100, Math.max(0, currentNotice.collectionRate))}%` }} /></div><div className="mt-3 flex justify-between text-xs text-slate-500"><span>Pagado: {amount(currentNotice.paidUsd)}</span><span>Pendiente: {amount(currentNotice.pendingUsd)}</span></div></div>}

      <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200">
        <div className="grid grid-cols-[1.2fr_.8fr_.8fr_.8fr] gap-3 border-b border-slate-200 bg-slate-50 px-4 py-3 text-[11px] font-bold uppercase tracking-wide text-slate-500">
          <span>Aviso de cobro</span><span>Emitido</span><span>Pagado</span><span>Pendiente</span>
        </div>
        {snapshot?.notices.length ? snapshot.notices.map((notice) => <div key={notice.id} className="grid grid-cols-[1.2fr_.8fr_.8fr_.8fr] gap-3 border-b border-slate-100 px-4 py-3 text-sm last:border-0"><span className="font-semibold text-slate-800">{notice.billingPeriod.label}</span><span>{amount(notice.issuedUsd)}</span><span className="text-emerald-700">{amount(notice.paidUsd)}</span><span className="font-semibold text-[#805d20]">{amount(notice.pendingUsd)}</span></div>) : <div className="px-4 py-8 text-center text-sm leading-6 text-slate-500">No hay avisos de cobro emitidos para esta comunidad.</div>}
      </div>
      <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200">
        <div className="border-b border-slate-200 bg-slate-50 px-4 py-3 text-[11px] font-bold uppercase tracking-wide text-slate-500">Deuda detallada por inmueble</div>
        <div className="overflow-x-auto"><table className="w-full min-w-[640px] text-left text-sm"><thead className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-400"><tr><th className="px-4 py-3">Inmueble</th><th className="px-4 py-3">Emitido</th><th className="px-4 py-3">Pagado</th><th className="px-4 py-3">Pendiente</th></tr></thead><tbody>{snapshot?.propertyBalances?.map((item) => <tr key={item.id} className="border-t border-slate-100"><td className="px-4 py-3 font-semibold">{item.property}</td><td className="px-4 py-3">{amount(item.issuedUsd)}</td><td className="px-4 py-3 text-emerald-700">{amount(item.paidUsd)}</td><td className="px-4 py-3 font-bold text-[#805d20]">{amount(item.pendingUsd)}</td></tr>)}{!snapshot?.propertyBalances?.length && <tr><td colSpan={4} className="px-4 py-8 text-center text-sm text-slate-500">Aún no hay deuda asignada a inmuebles.</td></tr>}</tbody></table></div>
      </div>
    </section>
  );
}
function escapeHtml(value: string) { return value.replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character] ?? character)); }
function downloadBlob(blob: Blob, filename: string) { const url = URL.createObjectURL(blob); const link = document.createElement('a'); link.href = url; link.download = filename; link.click(); URL.revokeObjectURL(url); }
function xmlEscape(value: string) { return value.replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' }[character] ?? character)); }
function createXlsx(rows: Array<Record<string, unknown>>) {
  const columns = Object.keys(rows[0] ?? {});
  const allRows = [columns, ...rows.map((row) => columns.map((column) => String(row[column] ?? '')))];
  const columnName = (index: number) => { let result = ''; for (let value = index + 1; value; value = Math.floor((value - 1) / 26)) result = String.fromCharCode(65 + ((value - 1) % 26)) + result; return result; };
  const sheetRows = allRows.map((row, rowIndex) => `<row r="${rowIndex + 1}">${row.map((value, columnIndex) => `<c r="${columnName(columnIndex)}${rowIndex + 1}" t="inlineStr"><is><t xml:space="preserve">${xmlEscape(String(value ?? ''))}</t></is></c>`).join('')}</row>`).join('');
  return zipSync({
    '[Content_Types].xml': strToU8('<?xml version="1.0" encoding="UTF-8"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/></Types>'),
    '_rels/.rels': strToU8('<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>'),
    'xl/workbook.xml': strToU8('<?xml version="1.0" encoding="UTF-8"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="Plan de cuentas" sheetId="1" r:id="rId1"/></sheets></workbook>'),
    'xl/_rels/workbook.xml.rels': strToU8('<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/></Relationships>'),
    'xl/worksheets/sheet1.xml': strToU8(`<?xml version="1.0" encoding="UTF-8"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData>${sheetRows}</sheetData></worksheet>`),
  });
}
function parseXlsx(buffer: ArrayBuffer): Array<Record<string, unknown>> {
  const files = unzipSync(new Uint8Array(buffer));
  const readXml = (path: string) => {
    const content = files[path];
    if (!content) throw new Error('El XLSX no tiene una estructura válida.');
    const document = new DOMParser().parseFromString(strFromU8(content), 'application/xml');
    if (document.getElementsByTagName('parsererror').length) throw new Error('No se pudo leer el contenido del archivo XLSX.');
    return document;
  };
  const elements = (document: Document, name: string) => Array.from(document.getElementsByTagName('*')).filter((element) => element.localName === name);
  const workbook = readXml('xl/workbook.xml');
  const sheet = elements(workbook, 'sheet')[0];
  if (!sheet) throw new Error('El XLSX no contiene hojas de cálculo.');
  const relationId = sheet.getAttribute('r:id') ?? sheet.getAttributeNS('http://schemas.openxmlformats.org/officeDocument/2006/relationships', 'id');
  const relations = readXml('xl/_rels/workbook.xml.rels');
  const relation = elements(relations, 'Relationship').find((item) => item.getAttribute('Id') === relationId);
  if (!relation) throw new Error('No se pudo encontrar la primera hoja del XLSX.');
  const target = relation.getAttribute('Target') ?? '';
  const sheetPath = target.startsWith('/') ? target.slice(1) : target.startsWith('xl/') ? target : `xl/${target}`;
  const worksheet = readXml(sheetPath);
  const sharedFile = files['xl/sharedStrings.xml'];
  const shared = sharedFile ? elements(new DOMParser().parseFromString(strFromU8(sharedFile), 'application/xml'), 'si').map((item) => elements(item as unknown as Document, 't').map((part) => part.textContent ?? '').join('')) : [];
  const xmlRows = elements(worksheet, 'row');
  const values = xmlRows.map((row) => {
    const cells = elements(row as unknown as Document, 'c');
    const result: string[] = [];
    for (const cell of cells) {
      const reference = cell.getAttribute('r') ?? '';
      const letters = reference.match(/^[A-Z]+/)?.[0] ?? '';
      const index = letters.split('').reduce((value, letter) => value * 26 + letter.charCodeAt(0) - 64, 0) - 1;
      const type = cell.getAttribute('t');
      const value = elements(cell as unknown as Document, type === 'inlineStr' ? 't' : 'v').map((part) => part.textContent ?? '').join('');
      result[index] = type === 's' ? shared[Number(value)] ?? '' : value;
    }
    return result;
  }).filter((row) => row.some((value) => value !== undefined && value !== ''));
  const [headers, ...data] = values;
  return data.map((row) => Object.fromEntries((headers ?? []).map((header, index) => [header, row[index] ?? ''])));
}
function Panel({ eyebrow, title, children }: { eyebrow: string; title: string; children: ReactNode }) { return <section className="mt-6 rounded-[1.6rem] border border-[#071a33]/8 bg-white p-5 sm:p-6"><p className="text-xs font-bold uppercase tracking-[.16em] text-[#9c7532]">{eyebrow}</p><h3 className="mb-5 mt-2 text-xl font-semibold">{title}</h3>{children}</section>; }
function Status({ value }: { value: keyof typeof statusLabels }) { const tone = value === 'OPEN' || value === 'POSTED' ? 'bg-emerald-50 text-emerald-700' : value === 'DRAFT' ? 'bg-amber-50 text-amber-700' : 'bg-slate-100 text-slate-600'; return <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${tone}`}>{statusLabels[value]}</span>; }
function Empty({ text }: { text: string }) { return <p className="rounded-2xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">{text}</p>; }
function Field({ label, children, span = false }: { label: string; children: ReactNode; span?: boolean }) { return <label className={`block text-sm font-bold ${span ? 'sm:col-span-2' : ''}`}>{label}{children}</label>; }
function DialogFrame({ title, children, onClose, wide = false }: { title: string; children: ReactNode; onClose: () => void; wide?: boolean }) { return <div className="fixed inset-0 z-[100] overflow-y-auto bg-[#071a33]/65 p-4 backdrop-blur-sm"><div className={`mx-auto mt-6 rounded-[1.6rem] bg-[#f8f6f0] shadow-2xl ${wide ? 'max-w-6xl' : 'max-w-xl'}`}><header className="sticky top-0 z-10 flex items-center justify-between border-b border-[#071a33]/8 bg-[#f8f6f0] px-5 py-4"><h3 className="font-semibold">{title}</h3><button type="button" onClick={onClose} aria-label="Cerrar" className="rounded-full bg-white p-2"><X size={17} /></button></header><div className="p-5 sm:p-6">{children}</div></div></div>; }
function Submit({ saving, label }: { saving: boolean; label: string }) { return <button disabled={saving} className="mt-6 w-full rounded-xl bg-[#071a33] px-5 py-3.5 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-50">{saving ? 'Procesando…' : label}</button>; }
function Confirm({ title, copy, label, saving, danger = false, onClose, onConfirm }: { title: string; copy: string; label: string; saving: boolean; danger?: boolean; onClose: () => void; onConfirm: () => void }) { return <DialogFrame title={title} onClose={onClose}><p className="text-sm leading-7 text-slate-600">{copy}</p><div className="mt-6 grid gap-2 sm:grid-cols-2"><button type="button" disabled={saving} onClick={onClose} className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold">Cancelar</button><button type="button" disabled={saving} onClick={onConfirm} className={`rounded-xl px-4 py-3 text-sm font-bold text-white disabled:opacity-50 ${danger ? 'bg-rose-700' : 'bg-[#071a33]'}`}>{saving ? 'Procesando…' : label}</button></div></DialogFrame>; }

function FieldHelp({ text }: { text: string }) {
  return (
    <div className="group relative ml-1.5 inline-block align-middle">
      <span className="flex h-4 w-4 cursor-help items-center justify-center rounded-full bg-slate-200 text-[10px] font-bold text-slate-500 hover:bg-[#b08a3c] hover:text-white transition">
        ?
      </span>
      <div className="absolute bottom-full left-1/2 z-50 mb-2 w-60 -translate-x-1/2 scale-95 rounded-lg bg-slate-900 px-3 py-2 text-xs font-normal leading-relaxed text-white opacity-0 transition-all duration-200 group-hover:scale-100 group-hover:opacity-100 pointer-events-none shadow-lg">
        {text}
        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900"></div>
      </div>
    </div>
  );
}
