import { useEffect, useMemo, useState, type FormEvent } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  BadgeCheck,
  Columns3,
  Database,
  FileKey2,
  FileSpreadsheet,
  FileUp,
  LoaderCircle,
  RefreshCw,
  ShieldCheck,
  Table2,
  Trash2,
} from 'lucide-react';
import type {
  ImportBatch,
  ImportTable,
  ImportTargetEntity,
} from '../../domain/imports';
import { CasaImportService } from '../../services/CasaImportService';

const statusLabel: Record<ImportBatch['status'], string> = {
  SCANNING: 'Escaneando',
  SCANNED: 'Escaneado',
  MAPPING: 'Mapeo en curso',
  MAPPED: 'Mapeado',
  VALIDATING: 'Validando',
  READY: 'Listo',
  IMPORTING: 'Importando',
  IMPORTED: 'Importado',
  FAILED: 'Falló',
};

const mappingLabel: Record<ImportTable['mappingStatus'], string> = {
  UNMAPPED: 'Sin mapear',
  DRAFT: 'Borrador',
  COMPLETE: 'Mapeada',
  IGNORED: 'Ignorada',
};

function formatBytes(value: string) {
  const bytes = Number(value);
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 ** 2) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 ** 2).toFixed(1)} MB`;
}

function displayValue(value: unknown) {
  if (value === null || value === undefined || value === '') return '—';
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}

function normalize(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/gi, '')
    .toLowerCase();
}

function MappingEditor({
  clientId,
  batchId,
  table,
  catalog,
  onSaved,
}: {
  clientId: string;
  batchId: string;
  table: ImportTable;
  catalog: ImportTargetEntity[];
  onSaved: (batch: ImportBatch) => void;
}) {
  const [targetKey, setTargetKey] = useState(table.targetEntity ?? '');
  const [mapping, setMapping] = useState<Record<string, string>>(() =>
    Object.fromEntries(table.columnMappings.map(item => [item.sourceColumn, item.targetField])),
  );
  const [notes, setNotes] = useState(table.notes ?? '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const target = catalog.find(item => item.key === targetKey) ?? null;

  const suggest = () => {
    if (!target) return;
    const suggested = { ...mapping };
    table.columns.forEach(column => {
      const exact = target.fields.find(field => normalize(field.key) === normalize(column.name)
        || normalize(field.label) === normalize(column.name));
      if (exact) suggested[column.name] = exact.key;
    });
    setMapping(suggested);
  };

  const save = async () => {
    if (!target) return;
    setSaving(true);
    setError('');
    try {
      const batch = await CasaImportService.saveMapping(clientId, batchId, table.id, {
        targetEntity: target.key,
        mode: 'complete',
        notes,
        columns: table.columns
          .filter(column => mapping[column.name])
          .map(column => {
            const field = target.fields.find(item => item.key === mapping[column.name]);
            return {
              sourceColumn: column.name,
              targetField: mapping[column.name],
              required: field?.required ?? false,
            };
          }),
      });
      onSaved(batch);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'No fue posible guardar el mapeo.');
    } finally {
      setSaving(false);
    }
  };

  const ignore = async () => {
    setSaving(true);
    setError('');
    try {
      const batch = await CasaImportService.saveMapping(clientId, batchId, table.id, {
        targetEntity: '',
        mode: 'ignore',
        notes,
        columns: [],
      });
      onSaved(batch);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'No fue posible ignorar la tabla.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-w-0">
      <header className="border-b border-slate-100 p-5 sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[.15em] text-[#9a742b]">Tabla legacy seleccionada</p>
            <h3 className="mt-2 text-2xl font-semibold tracking-[-.025em]">{table.sourceName}</h3>
            <p className="mt-1 text-sm text-slate-500">{table.rowCount.toLocaleString('es-VE')} filas · {table.columns.length} columnas</p>
          </div>
          <span className={`w-fit rounded-full px-3 py-1 text-xs font-bold ${table.mappingStatus === 'COMPLETE' ? 'bg-emerald-50 text-emerald-700' : table.mappingStatus === 'IGNORED' ? 'bg-slate-100 text-slate-500' : 'bg-amber-50 text-amber-700'}`}>
            {mappingLabel[table.mappingStatus]}
          </span>
        </div>
      </header>

      <div className="p-5 sm:p-6">
        <label className="block text-sm font-bold text-slate-700">
          ¿Qué representa esta tabla dentro de CASA?
          <select
            value={targetKey}
            onChange={event => { setTargetKey(event.target.value); setMapping({}); setError(''); }}
            className="mt-2 w-full rounded-xl border border-slate-200 bg-[#fbfaf7] px-4 py-3 text-sm outline-none focus:border-[#b08a3c]"
          >
            <option value="">Selecciona una entidad CASA</option>
            {catalog.map(entity => <option key={entity.key} value={entity.key}>{entity.label}</option>)}
          </select>
        </label>
        {target && <p className="mt-2 text-xs leading-5 text-slate-400">{target.description}</p>}

        {target && (
          <section className="mt-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[.14em] text-[#9a742b]">Mapeo de columnas</p>
                <p className="mt-1 text-sm text-slate-500">ROOT confirma cada correspondencia. Las sugerencias nunca se guardan solas.</p>
              </div>
              <button type="button" onClick={suggest} className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold hover:border-[#b08a3c]">
                <RefreshCw size={14} /> Sugerir coincidencias
              </button>
            </div>
            <div className="mt-4 space-y-3">
              {table.columns.map(column => (
                <div key={column.name} className="grid gap-3 rounded-2xl border border-slate-100 bg-[#fcfbf8] p-4 md:grid-cols-[1fr_auto_1fr] md:items-center">
                  <div className="min-w-0">
                    <p className="truncate font-mono text-sm font-bold">{column.name}</p>
                    <p className="mt-1 text-xs text-slate-400">{column.sourceType} · {column.nullable ? 'acepta vacío' : 'requerida en origen'}</p>
                    <p className="mt-2 truncate text-xs text-slate-500">{column.sampleValues.slice(0, 2).map(displayValue).join(' · ') || 'Sin muestra'}</p>
                  </div>
                  <ArrowRight className="hidden text-slate-300 md:block" size={17} />
                  <select
                    value={mapping[column.name] ?? ''}
                    onChange={event => setMapping(current => ({ ...current, [column.name]: event.target.value }))}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-[#b08a3c]"
                  >
                    <option value="">No utilizar esta columna</option>
                    {target.fields.map(field => (
                      <option
                        key={field.key}
                        value={field.key}
                        disabled={Object.entries(mapping).some(([source, value]) => source !== column.name && value === field.key)}
                      >
                        {field.label}{field.required ? ' · obligatorio' : ''}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </section>
        )}

        <label className="mt-6 block text-sm font-bold text-slate-700">
          Notas del mapeo
          <textarea value={notes} onChange={event => setNotes(event.target.value)} className="mt-2 min-h-24 w-full resize-y rounded-xl border border-slate-200 bg-[#fbfaf7] px-4 py-3 text-sm outline-none focus:border-[#b08a3c]" placeholder="Decisiones, excepciones o dudas por revisar…" />
        </label>

        {error && <div role="alert" className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">{error}</div>}

        <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
          <button type="button" onClick={ignore} disabled={saving} className="rounded-full border border-slate-200 px-5 py-3 text-sm font-bold text-slate-500 disabled:opacity-40">
            Ignorar esta tabla
          </button>
          <button type="button" onClick={save} disabled={!target || saving} className="inline-flex items-center justify-center gap-2 rounded-full bg-[#071a33] px-6 py-3 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-35">
            {saving ? <LoaderCircle className="animate-spin" size={17} /> : <BadgeCheck size={17} />} Guardar mapeo
          </button>
        </div>

        {!!table.sampleRows.length && (
          <section className="mt-8 border-t border-slate-100 pt-6">
            <p className="text-xs font-bold uppercase tracking-[.14em] text-[#9a742b]">Vista previa protegida · máximo 5 filas</p>
            <div className="mt-3 overflow-x-auto rounded-2xl border border-slate-200">
              <table className="min-w-full text-left text-xs">
                <thead className="bg-[#f8f6f1] text-slate-500"><tr>{table.columns.map(column => <th key={column.name} className="whitespace-nowrap px-3 py-3 font-bold">{column.name}</th>)}</tr></thead>
                <tbody>{table.sampleRows.map((row, index) => <tr key={index} className="border-t border-slate-100">{table.columns.map(column => <td key={column.name} className="max-w-56 truncate whitespace-nowrap px-3 py-3 text-slate-600">{displayValue(row[column.name])}</td>)}</tr>)}</tbody>
              </table>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

export default function ImportAssistant({ clientId }: { clientId: string }) {
  const [batches, setBatches] = useState<ImportBatch[]>([]);
  const [catalog, setCatalog] = useState<ImportTargetEntity[]>([]);
  const [selectedBatchId, setSelectedBatchId] = useState('');
  const [selectedTableId, setSelectedTableId] = useState('');
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadFileName, setUploadFileName] = useState('');
  const [retryPassword, setRetryPassword] = useState('');
  const [error, setError] = useState('');
  const [showDelete, setShowDelete] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [deleteReason, setDeleteReason] = useState('');
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const [nextBatches, nextCatalog] = await Promise.all([
          CasaImportService.list(clientId),
          CasaImportService.catalog(clientId),
        ]);
        if (!active) return;
        setBatches(nextBatches);
        setCatalog(nextCatalog);
        setSelectedBatchId(nextBatches[0]?.id ?? '');
        setSelectedTableId(nextBatches[0]?.tables[0]?.id ?? '');
      } catch (caught) {
        if (active) setError(caught instanceof Error ? caught.message : 'No fue posible cargar el asistente.');
      } finally {
        if (active) setLoading(false);
      }
    };
    void load();
    return () => { active = false; };
  }, [clientId]);

  const selectedBatch = batches.find(batch => batch.id === selectedBatchId) ?? batches[0] ?? null;
  const selectedTable = selectedBatch?.tables.find(table => table.id === selectedTableId) ?? selectedBatch?.tables[0] ?? null;
  const mappedTables = selectedBatch?.tables.filter(table => ['COMPLETE', 'IGNORED'].includes(table.mappingStatus)).length ?? 0;
  const mappedPercentage = selectedBatch?.tables.length ? Math.round((mappedTables / selectedBatch.tables.length) * 100) : 0;

  const updateBatch = (batch: ImportBatch) => {
    setBatches(current => current.map(item => item.id === batch.id ? batch : item));
  };

  const rescan = async () => {
    if (!selectedBatch) return;
    setUploading(true);
    setError('');
    try {
      const batch = await CasaImportService.rescan(clientId, selectedBatch.id, retryPassword);
      updateBatch(batch);
      setSelectedTableId(batch.tables[0]?.id ?? '');
      setRetryPassword('');
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'No fue posible repetir el escaneo.');
    } finally {
      setUploading(false);
    }
  };

  const upload = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const value = form.get('file');
    if (!(value instanceof File) || !value.name) {
      setError('Selecciona un archivo MDB o CSV.');
      return;
    }
    setUploading(true);
    setError('');
    try {
      const batch = await CasaImportService.scan(clientId, value, String(form.get('password') ?? ''));
      setBatches(current => [batch, ...current]);
      setSelectedBatchId(batch.id);
      setSelectedTableId(batch.tables[0]?.id ?? '');
      event.currentTarget.reset();
      setUploadFileName('');
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'No fue posible escanear el archivo.');
    } finally {
      setUploading(false);
    }
  };

  const removeBatch = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedBatch) return;
    setDeleting(true);
    setError('');
    try {
      await CasaImportService.remove(
        clientId,
        selectedBatch.id,
        deleteConfirmation,
        deleteReason,
      );
      const remaining = batches.filter(batch => batch.id !== selectedBatch.id);
      setBatches(remaining);
      setSelectedBatchId(remaining[0]?.id ?? '');
      setSelectedTableId(remaining[0]?.tables[0]?.id ?? '');
      setShowDelete(false);
      setDeleteConfirmation('');
      setDeleteReason('');
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'No fue posible eliminar el lote.');
    } finally {
      setDeleting(false);
    }
  };

  const batchOptions = useMemo(() => batches.map(batch => ({
    id: batch.id,
    label: `${batch.originalName} · ${statusLabel[batch.status]}`,
  })), [batches]);

  if (loading) {
    return <div className="flex min-h-72 items-center justify-center rounded-[1.6rem] border border-[#071a33]/8 bg-white"><LoaderCircle className="animate-spin text-[#9a742b]" size={28} /></div>;
  }

  return (
    <div className="space-y-5">
      <section className="overflow-hidden rounded-[1.7rem] bg-[#071a33] text-white">
        <div className="grid gap-7 p-6 sm:p-8 xl:grid-cols-[1fr_420px] xl:items-center">
          <div>
            <div className="flex items-center gap-3"><span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#d8b25a] text-[#071a33]"><Database size={21} /></span><div><p className="text-xs font-bold uppercase tracking-[.16em] text-[#e4c26f]">Asistente de importación</p><h2 className="mt-1 text-2xl font-semibold">Escanear primero. Importar después.</h2></div></div>
            <p className="mt-5 max-w-2xl text-sm leading-6 text-white/55">CASA inventaría la estructura legacy y permite que ROOT decida manualmente qué representa cada tabla y columna. Ningún dato se incorpora durante este proceso.</p>
            <div className="mt-5 flex flex-wrap gap-2 text-xs font-semibold text-white/60">
              <span className="rounded-full bg-white/8 px-3 py-1.5">MDB · Access</span>
              <span className="rounded-full bg-white/8 px-3 py-1.5">CSV</span>
              <span className="rounded-full bg-white/8 px-3 py-1.5">SHA-256</span>
              <span className="rounded-full bg-white/8 px-3 py-1.5">Solo ROOT</span>
            </div>
          </div>
          <form onSubmit={upload} className="rounded-2xl border border-white/10 bg-white/[.055] p-4">
            <label className="flex cursor-pointer items-center justify-center gap-3 rounded-xl border border-dashed border-white/20 px-4 py-5 text-sm font-bold text-white/75 hover:border-[#e4c26f]/60">
              <FileUp size={19} /> {uploadFileName || 'Seleccionar MDB o CSV'}
              <input type="file" name="file" accept=".mdb,.csv" className="sr-only" required onChange={event => setUploadFileName(event.target.files?.[0]?.name ?? '')} />
            </label>
            <input type="password" name="password" placeholder="Contraseña del MDB, si aplica" className="mt-3 w-full rounded-xl border border-white/10 bg-white/8 px-4 py-3 text-sm text-white outline-none placeholder:text-white/30" />
            <button type="submit" disabled={uploading} className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#d8b25a] px-4 py-3 text-sm font-bold text-[#071a33] disabled:opacity-50">
              {uploading ? <LoaderCircle className="animate-spin" size={17} /> : <FileKey2 size={17} />} {uploading ? 'Custodiando y escaneando…' : 'Cargar y escanear estructura'}
            </button>
          </form>
        </div>
      </section>

      {error && <div role="alert" className="rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm font-semibold text-rose-700">{error}</div>}

      {!batches.length ? (
        <section className="rounded-[1.6rem] border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
          <FileSpreadsheet className="mx-auto text-[#9a742b]" size={31} />
          <h3 className="mt-4 text-lg font-bold">Todavía no existen lotes escaneados</h3>
          <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-500">Selecciona el archivo original. CASA conservará su huella y mostrará su estructura antes de permitir cualquier mapeo.</p>
        </section>
      ) : (
        <>
          <section className="rounded-[1.5rem] border border-[#071a33]/8 bg-white p-5">
            <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-center">
              <label className="text-sm font-bold text-slate-600">
                Lote de trabajo
                <select value={selectedBatch?.id ?? ''} onChange={event => { const batch = batches.find(item => item.id === event.target.value); setSelectedBatchId(event.target.value); setSelectedTableId(batch?.tables[0]?.id ?? ''); }} className="mt-2 w-full rounded-xl border border-slate-200 bg-[#fbfaf7] px-4 py-3 text-sm font-semibold outline-none lg:min-w-[480px]">
                  {batchOptions.map(option => <option key={option.id} value={option.id}>{option.label}</option>)}
                </select>
              </label>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="rounded-xl bg-[#f8f6f1] px-4 py-3"><p className="text-lg font-bold">{selectedBatch?.tableCount ?? 0}</p><p className="text-[10px] uppercase text-slate-400">Tablas</p></div>
                <div className="rounded-xl bg-[#f8f6f1] px-4 py-3"><p className="text-lg font-bold">{selectedBatch?.rowCount.toLocaleString('es-VE') ?? 0}</p><p className="text-[10px] uppercase text-slate-400">Filas</p></div>
                <div className="rounded-xl bg-[#f8f6f1] px-4 py-3"><p className="text-lg font-bold text-[#9a742b]">{mappedPercentage}%</p><p className="text-[10px] uppercase text-slate-400">Mapeado</p></div>
              </div>
            </div>
            {selectedBatch && <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 border-t border-slate-100 pt-4 text-xs text-slate-400"><span>{formatBytes(selectedBatch.byteSize)}</span><span>SHA-256 {selectedBatch.checksumSha256.slice(0, 16)}…</span><span>{statusLabel[selectedBatch.status]}</span></div>}
            {selectedBatch && selectedBatch.status !== 'IMPORTED' && <div className="mt-4 border-t border-slate-100 pt-4"><button type="button" onClick={() => { setShowDelete(current => !current); setDeleteConfirmation(''); setDeleteReason(''); }} className="inline-flex items-center gap-2 rounded-xl border border-rose-200 px-3 py-2 text-xs font-bold text-rose-700"><Trash2 size={14} />Descartar fuente legacy</button>{showDelete && <form onSubmit={removeBatch} className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 p-4"><p className="text-sm font-bold text-rose-900">El archivo privado, su escaneo y todo el mapeo serán eliminados.</p><p className="mt-1 text-xs leading-5 text-rose-800/70">La acción queda auditada y solo está permitida antes de importar datos operativos. Escribe exactamente <strong>{selectedBatch.originalName}</strong>.</p><input value={deleteConfirmation} onChange={event => setDeleteConfirmation(event.target.value)} className="mt-3 w-full rounded-xl border border-rose-200 bg-white px-3 py-2.5 text-sm outline-none" required placeholder={selectedBatch.originalName} /><textarea value={deleteReason} onChange={event => setDeleteReason(event.target.value)} minLength={12} maxLength={500} className="mt-3 min-h-20 w-full resize-y rounded-xl border border-rose-200 bg-white px-3 py-2.5 text-sm outline-none" required placeholder="Motivo por el que esta fuente no es viable" /><button type="submit" disabled={deleting || deleteConfirmation !== selectedBatch.originalName} className="mt-3 inline-flex items-center gap-2 rounded-xl bg-rose-700 px-4 py-2.5 text-sm font-bold text-white disabled:opacity-40">{deleting ? <LoaderCircle className="animate-spin" size={16} /> : <Trash2 size={16} />}Eliminar definitivamente este lote</button></form>}</div>}
          </section>

          {selectedBatch?.status === 'FAILED' && (
            <section className="rounded-[1.5rem] border border-rose-200 bg-rose-50 p-5">
              <div className="flex gap-3">
                <AlertTriangle className="shrink-0 text-rose-700" size={20} />
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-rose-950">El lote quedó aislado y no importó información</p>
                  <p className="mt-1 text-sm leading-6 text-rose-900/70">{selectedBatch.errorMessage || 'El escaneo no pudo finalizar.'}</p>
                  <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto]">
                    <input type="password" value={retryPassword} onChange={event => setRetryPassword(event.target.value)} placeholder="Contraseña MDB, si aplica" className="rounded-xl border border-rose-200 bg-white px-4 py-3 text-sm outline-none focus:border-rose-400" />
                    <button type="button" onClick={rescan} disabled={uploading} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#071a33] px-5 py-3 text-sm font-bold text-white disabled:opacity-50">
                      {uploading ? <LoaderCircle className="animate-spin" size={17} /> : <RefreshCw size={17} />} Reintentar escaneo
                    </button>
                  </div>
                </div>
              </div>
            </section>
          )}

          {selectedBatch?.status !== 'FAILED' && <section className="grid gap-5 xl:grid-cols-[310px_minmax(0,1fr)]">
            <aside className="rounded-[1.6rem] border border-[#071a33]/8 bg-white p-4">
              <div className="flex items-center gap-2 px-2 pb-3"><Table2 size={17} className="text-[#9a742b]" /><p className="text-xs font-bold uppercase tracking-[.14em] text-slate-500">Tablas detectadas</p></div>
              <div className="space-y-2">
                {selectedBatch?.tables.map(table => (
                  <button type="button" key={table.id} onClick={() => setSelectedTableId(table.id)} className={`w-full rounded-xl border p-3 text-left transition ${selectedTable?.id === table.id ? 'border-[#b08a3c]/50 bg-[#fbf7ed]' : 'border-slate-100 hover:border-slate-200'}`}>
                    <div className="flex items-start justify-between gap-2"><p className="min-w-0 truncate font-mono text-xs font-bold">{table.sourceName}</p>{table.mappingStatus === 'COMPLETE' ? <BadgeCheck className="shrink-0 text-emerald-600" size={15} /> : table.mappingStatus === 'IGNORED' ? <span className="text-xs text-slate-400">—</span> : <AlertTriangle className="shrink-0 text-amber-600" size={15} />}</div>
                    <p className="mt-2 text-[11px] text-slate-400">{table.rowCount.toLocaleString('es-VE')} filas · {table.columns.length} columnas</p>
                    <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">{mappingLabel[table.mappingStatus]}</p>
                  </button>
                ))}
              </div>
            </aside>

            <section className="overflow-hidden rounded-[1.6rem] border border-[#071a33]/8 bg-white shadow-[0_16px_45px_rgba(7,26,51,.04)]">
              {selectedBatch && selectedTable ? (
                <MappingEditor key={selectedTable.id} clientId={clientId} batchId={selectedBatch.id} table={selectedTable} catalog={catalog} onSaved={updateBatch} />
              ) : (
                <div className="flex min-h-72 flex-col items-center justify-center p-8 text-center">
                  <Columns3 className="text-[#9a742b]" size={30} />
                  <p className="mt-3 font-bold">Selecciona una tabla para comenzar</p>
                </div>
              )}
            </section>
          </section>}

          <section className="rounded-[1.5rem] border border-emerald-200 bg-emerald-50 p-5">
            <div className="flex gap-3"><ShieldCheck className="shrink-0 text-emerald-700" size={20} /><div><p className="font-bold text-emerald-950">Compuerta de seguridad activa</p><p className="mt-1 text-sm leading-6 text-emerald-900/70">Aunque todas las tablas queden mapeadas, este asistente no escribe todavía en las tablas operativas de CASA. El siguiente paso será una simulación con errores, duplicados y totales antes de autorizar la importación.</p></div></div>
          </section>
        </>
      )}
    </div>
  );
}
