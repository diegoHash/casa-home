import { useEffect, useRef, useState, type ClipboardEvent, type KeyboardEvent } from 'react';
import { ArrowLeft, FileSpreadsheet, Import, LoaderCircle, Upload, WandSparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { WorkBook } from 'xlsx';
import { CommunityWorkspaceService } from '../services/CommunityWorkspaceService';
import { StaffSession } from '../services/StaffSession';

type Kind = 'APARTMENT' | 'TOWNHOUSE' | 'COMMERCIAL' | 'HOUSE' | 'QUINTA' | 'PENTHOUSE';
type DocType = 'V' | 'E' | 'J' | 'P';
type ImportRow = {
  sourceId: string; sourceRow: number; include: boolean; code: string; kind: Kind | '';
  ownerName: string; documentType: DocType; documentNumber: string; email: string; phone: string;
  aliquot: string; ownershipPercentage: string; maximumOccupancy: string; braceletQuota: string;
  parkingSpace: string; parkingCapacity: string;
};
type FieldKey = Exclude<keyof ImportRow, 'sourceId' | 'sourceRow' | 'include'>;
type Selection = { startRow: number; startCol: number; endRow: number; endCol: number };

const fields: Array<{ key: FieldKey; label: string; required?: boolean; numeric?: boolean }> = [
  { key: 'code', label: 'Código del inmueble', required: true },
  { key: 'kind', label: 'Categoría', required: true },
  { key: 'ownerName', label: 'Propietario' },
  { key: 'documentType', label: 'Tipo de documento' },
  { key: 'documentNumber', label: 'N.º de documento' },
  { key: 'email', label: 'Correo' },
  { key: 'phone', label: 'Teléfono' },
  { key: 'aliquot', label: 'Alícuota (%)', numeric: true },
  { key: 'ownershipPercentage', label: 'Participación legal (%)', numeric: true },
  { key: 'maximumOccupancy', label: 'Capacidad', numeric: true },
  { key: 'braceletQuota', label: 'Cupos de brazaletes', numeric: true },
  { key: 'parkingSpace', label: 'Estacionamiento' },
  { key: 'parkingCapacity', label: 'Capacidad de estacionamiento', numeric: true },
];
const gridFields: FieldKey[] = fields.map(({ key }) => key);
const inputClass = 'w-full rounded-lg border border-[#071a33]/12 bg-white px-3 py-2.5 text-sm text-[#071a33] outline-none focus:border-[#b08a3c] focus:ring-2 focus:ring-[#b08a3c]/15';
const today = new Date().toISOString().slice(0, 10);

function hasScope(scopes: string[], required: string) {
  return scopes.some((scope) => scope === '*' || scope === 'community.full_access' || scope === required || scope === `ADMINISTRATION:${required}` || (scope.endsWith('.*') && required.startsWith(scope.slice(0, -1))));
}

function parseRange(value: string): { column: number; firstRow: number; lastRow: number } | null {
  const match = value.trim().toUpperCase().match(/^\$?([A-Z]{1,3})\$?(\d+)(?::\$?([A-Z]{1,3})\$?(\d+))?$/);
  if (!match) return null;
  const toColumn = (letters: string) => [...letters].reduce((column, character) => column * 26 + character.charCodeAt(0) - 64, 0) - 1;
  const startCol = toColumn(match[1]);
  const endCol = toColumn(match[3] ?? match[1]);
  const firstRow = Number(match[2]);
  const lastRow = Number(match[4] ?? match[2]);
  if (startCol !== endCol || firstRow < 1 || lastRow < firstRow) return null;
  return { column: startCol, firstRow, lastRow };
}

function category(value: string): Kind | '' {
  const normalized = value.trim().toLocaleLowerCase('es');
  if (!normalized) return '';
  if (/local|comercial|oficina|tienda/.test(normalized)) return 'COMMERCIAL';
  if (/quinta/.test(normalized)) return 'QUINTA';
  if (/penthouse|penth/.test(normalized)) return 'PENTHOUSE';
  if (/town|townhouse/.test(normalized)) return 'TOWNHOUSE';
  if (/\bcasa\b|house|chalet/.test(normalized)) return 'HOUSE';
  if (/apart|apto|vivienda|residencial/.test(normalized)) return 'APARTMENT';
  return '';
}

function normalizeDocumentType(value: string): DocType {
  const normalized = value.trim().toUpperCase();
  if (normalized.startsWith('E')) return 'E';
  if (normalized.startsWith('J')) return 'J';
  if (normalized.startsWith('P')) return 'P';
  return 'V';
}

function splitOwnerName(value: string) {
  const parts = value.trim().replace(/\s+/g, ' ').split(' ').filter(Boolean);
  if (parts.length < 2) return { firstName: parts[0] ?? '', lastName: '' };
  return { firstName: parts.slice(0, Math.ceil(parts.length / 2)).join(' '), lastName: parts.slice(Math.ceil(parts.length / 2)).join(' ') };
}

function parseNumeric(value: string, allowZero = true): number | undefined {
  const normalized = value.trim().replace(/\s/g, '').replace(',', '.').replace(/%$/, '');
  if (!normalized) return undefined;
  const parsed = Number(normalized);
  return Number.isFinite(parsed) && (allowZero ? parsed >= 0 : parsed > 0) ? parsed : undefined;
}

export default function PropertyImportPage() {
  const navigate = useNavigate();
  const tableRef = useRef<HTMLDivElement>(null);
  const context = StaffSession.context();
  const [fileName, setFileName] = useState('');
  const [workbook, setWorkbook] = useState<WorkBook | null>(null);
  const [sheetName, setSheetName] = useState('');
  const [mapping, setMapping] = useState<Record<FieldKey, string>>(() => Object.fromEntries(fields.map(({ key }) => [key, ''])) as Record<FieldKey, string>);
  const [sourceIdRange, setSourceIdRange] = useState('');
  const [rows, setRows] = useState<ImportRow[]>([]);
  const [existingCodes, setExistingCodes] = useState<Set<string>>(() => new Set());
  const [effectiveDate, setEffectiveDate] = useState(today);
  const [selection, setSelection] = useState<Selection | null>(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [parsing, setParsing] = useState(false);
  const [saving, setSaving] = useState(false);
  const canImport = ['core.properties.write', 'core.people.write', 'core.ownerships.write'].every((scope) => hasScope(context?.scopes ?? [], scope));

  useEffect(() => {
    let active = true;
    CommunityWorkspaceService.coreSnapshot()
      .then((snapshot) => { if (active) setExistingCodes(new Set(snapshot.properties.map((property) => property.code.trim().toLocaleUpperCase()))); })
      .catch(() => undefined);
    return () => { active = false; };
  }, []);

  const updateCell = (rowIndex: number, key: FieldKey, value: string) => {
    const normalized = key === 'kind' ? category(value) : key === 'documentType' ? normalizeDocumentType(value) : value;
    setRows((current) => current.map((row, index) => index === rowIndex ? { ...row, [key]: normalized } : row));
  };

  const normalizeGridValue = (key: FieldKey, value: string) => key === 'kind' ? category(value) : key === 'documentType' ? normalizeDocumentType(value) : value;

  const readFile = async (file?: File) => {
    if (!file) return;
    setError(''); setNotice(''); setRows([]); setParsing(true);
    try {
      const XLSX = await import('xlsx');
      const parsed = XLSX.read(await file.arrayBuffer(), { type: 'array', cellDates: false, dense: true });
      if (!parsed.SheetNames.length) throw new Error('El archivo no contiene hojas legibles.');
      setWorkbook(parsed); setSheetName(parsed.SheetNames[0]); setFileName(file.name);
    } catch (cause) {
      setWorkbook(null); setFileName('');
      setError(cause instanceof Error ? cause.message : 'No se pudo leer el archivo seleccionado.');
    } finally { setParsing(false); }
  };

  const buildPreview = async () => {
    if (!workbook || !sheetName) return;
    setError(''); setNotice('');
    const XLSX = await import('xlsx');
    const sheet = workbook.Sheets[sheetName];
    const source = XLSX.utils.sheet_to_json<unknown[]>(sheet, { header: 1, raw: false, defval: '' });
    const mapped: Array<{ key: FieldKey | 'sourceId'; bounds: { column: number; firstRow: number; lastRow: number } }> = fields.flatMap(({ key }) => {
      const range = mapping[key].trim();
      if (!range) return [];
      const bounds = parseRange(range);
      if (!bounds) throw new Error(`El rango de ${fields.find((field) => field.key === key)?.label} debe tener forma G50:G80 y usar una sola columna.`);
      return [{ key, bounds }];
    });
    if (sourceIdRange.trim()) {
      const bounds = parseRange(sourceIdRange);
      if (!bounds) throw new Error('El rango del serial de origen debe tener forma A2:A50 y usar una sola columna.');
      mapped.push({ key: 'sourceId', bounds });
    }
    if (!mapped.some(({ key }) => key === 'code')) throw new Error('Indica el rango de la columna Código del inmueble.');
    const count = Math.max(...mapped.map(({ bounds }) => bounds.lastRow - bounds.firstRow + 1));
    if (!Number.isFinite(count) || count > 20000) throw new Error('El rango supera el máximo de 20.000 filas.');
    const result: ImportRow[] = Array.from({ length: count }, (_, index) => {
      const values = Object.fromEntries(mapped.map(({ key, bounds }) => [key, String(source[bounds.firstRow - 1 + index]?.[bounds.column] ?? '').trim()])) as Partial<Record<FieldKey | 'sourceId', string>>;
      const rawKind = values.kind ?? '';
      return {
        sourceId: values.sourceId ?? '', sourceRow: (mapped.find(({ key }) => key === 'code')?.bounds.firstRow ?? 1) + index, include: true,
        code: values.code ?? '', kind: category(rawKind), ownerName: values.ownerName ?? '',
      documentType: values.documentType ? normalizeDocumentType(values.documentType) : 'V',
        documentNumber: values.documentNumber ?? '', email: values.email ?? '', phone: values.phone ?? '',
        aliquot: values.aliquot ?? '', ownershipPercentage: values.ownershipPercentage || '100',
        maximumOccupancy: values.maximumOccupancy ?? '', braceletQuota: values.braceletQuota ?? '',
        parkingSpace: values.parkingSpace ?? '', parkingCapacity: values.parkingCapacity ?? '',
      };
    }).filter((_row, index) => Object.values(Object.fromEntries(mapped.map(({ key, bounds }) => [key, String(source[bounds.firstRow - 1 + index]?.[bounds.column] ?? '').trim()]))).some((value) => typeof value === 'string' && value.length > 0));
    if (!result.length) throw new Error('Los rangos seleccionados no encontraron filas con datos.');
    setRows(result); setSelection(null);
    setNotice(`Vista previa lista: ${result.length} filas leídas. Las filas y celdas se pueden editar antes de guardar.`);
  };

  const cellValue = (row: ImportRow, key: FieldKey) => row[key];
  const applyMatrix = (start: Selection, matrix: string[][]) => {
    if (!matrix.length) return;
    const rowEnd = Math.min(rows.length - 1, start.startRow + matrix.length - 1);
    const colEnd = Math.min(gridFields.length - 1, start.startCol + Math.max(...matrix.map((line) => line.length), 1) - 1);
    setRows((current) => current.map((row, rowIndex) => {
      const line = matrix[rowIndex - start.startRow];
      if (!line || rowIndex > rowEnd) return row;
      let updated = row;
      line.slice(0, gridFields.length - start.startCol).forEach((value, offset) => {
        const key = gridFields[start.startCol + offset];
        updated = { ...updated, [key]: normalizeGridValue(key, value) };
      });
      return updated;
    }));
    setSelection({ startRow: start.startRow, endRow: rowEnd, startCol: start.startCol, endCol: colEnd });
  };

  const onCopy = (event: ClipboardEvent<HTMLDivElement>) => {
    if (!selection) return;
    event.preventDefault();
    const top = Math.min(selection.startRow, selection.endRow), bottom = Math.max(selection.startRow, selection.endRow);
    const left = Math.min(selection.startCol, selection.endCol), right = Math.max(selection.startCol, selection.endCol);
    const content = rows.slice(top, bottom + 1).map((row) => gridFields.slice(left, right + 1).map((key) => cellValue(row, key)).join('\t')).join('\n');
    event.clipboardData.setData('text/plain', content);
  };

  const onPaste = (event: ClipboardEvent<HTMLDivElement>) => {
    if (!selection) return;
    const text = event.clipboardData.getData('text/plain');
    if (!text) return;
    event.preventDefault();
    const matrix = text.replace(/\r/g, '').replace(/\n$/, '').split('\n').map((line) => line.split('\t'));
    applyMatrix({ ...selection, endRow: selection.startRow, endCol: selection.startCol }, matrix);
  };

  const onGridKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!selection || !(event.ctrlKey || event.metaKey) || event.key.toLowerCase() !== 'd') return;
    const top = Math.min(selection.startRow, selection.endRow), bottom = Math.max(selection.startRow, selection.endRow);
    const left = Math.min(selection.startCol, selection.endCol), right = Math.max(selection.startCol, selection.endCol);
    if (bottom <= top) return;
    event.preventDefault();
    setRows((current) => current.map((row, rowIndex) => {
      if (rowIndex <= top || rowIndex > bottom) return row;
      let updated = row;
      for (let col = left; col <= right; col += 1) {
        const key = gridFields[col]; updated = { ...updated, [key]: current[top][key] };
      }
      return updated;
    }));
  };

  const setRectSelection = (row: number, col: number, extend: boolean) => {
    setSelection((current) => extend && current ? { ...current, endRow: row, endCol: col } : { startRow: row, startCol: col, endRow: row, endCol: col });
  };

  const importRows = async () => {
    const included = rows.filter((row) => row.include);
    if (!included.length) { setError('Selecciona al menos una fila para importar.'); return; }
    const problems: string[] = [];
    const grouped = new Map<string, { code: string; kind: Kind; aliquot?: number; maximumOccupancy?: number; braceletQuota?: number; parkingSpace?: string; parkingCapacity?: number; owners: Array<{ firstName: string; lastName: string; documentType: DocType; documentNumber: string; phone?: string; email?: string; ownershipPercentage: number }>; signatures: Set<string> }>();
    included.forEach((row) => {
      const code = row.code.trim().toUpperCase();
      if (!code) { problems.push(`Fila ${row.sourceRow}: falta el código del inmueble.`); return; }
      if (!row.kind) { problems.push(`Fila ${row.sourceRow}: elige una categoría de inmueble.`); return; }
      const aliquot = parseNumeric(row.aliquot);
      if (row.aliquot.trim() && (aliquot === undefined || aliquot > 100)) problems.push(`Fila ${row.sourceRow}: alícuota inválida.`);
      const occupancy = parseNumeric(row.maximumOccupancy, false);
      const braceletQuota = parseNumeric(row.braceletQuota);
      const parkingCapacity = parseNumeric(row.parkingCapacity, false);
      if (row.maximumOccupancy.trim() && (occupancy === undefined || !Number.isInteger(occupancy) || occupancy > 10000)) problems.push(`Fila ${row.sourceRow}: la capacidad debe ser un entero entre 1 y 10.000.`);
      if (row.braceletQuota.trim() && (braceletQuota === undefined || !Number.isInteger(braceletQuota) || braceletQuota > 10000)) problems.push(`Fila ${row.sourceRow}: los cupos de brazaletes deben ser un entero entre 0 y 10.000.`);
      if (row.parkingCapacity.trim() && (parkingCapacity === undefined || !Number.isInteger(parkingCapacity) || parkingCapacity > 100)) problems.push(`Fila ${row.sourceRow}: la capacidad de estacionamiento debe ser un entero entre 1 y 100.`);
      if (row.parkingCapacity.trim() && !row.parkingSpace.trim()) problems.push(`Fila ${row.sourceRow}: indica el espacio de estacionamiento antes de asignarle capacidad.`);
      const owners = grouped.get(code);
      const signature = [row.kind, row.aliquot, row.maximumOccupancy, row.braceletQuota, row.parkingSpace, row.parkingCapacity].join('|');
      const target = owners ?? { code, kind: row.kind, aliquot, maximumOccupancy: occupancy, braceletQuota, parkingSpace: row.parkingSpace.trim() || undefined, parkingCapacity, owners: [], signatures: new Set<string>() };
      target.signatures.add(signature);
      if (row.ownerName.trim()) {
        const { firstName, lastName } = splitOwnerName(row.ownerName);
        const documentNumber = row.documentNumber.trim();
        if (!firstName || !lastName) problems.push(`Fila ${row.sourceRow}: completa nombre y apellido del propietario.`);
        if (!documentNumber) problems.push(`Fila ${row.sourceRow}: falta el documento del propietario para poder registrarlo.`);
        if (row.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(row.email.trim())) problems.push(`Fila ${row.sourceRow}: correo inválido.`);
        const share = parseNumeric(row.ownershipPercentage, false);
        if (share === undefined || share > 100) problems.push(`Fila ${row.sourceRow}: participación legal inválida; debe ser mayor que 0 y hasta 100%.`);
        else if (documentNumber && firstName && lastName) target.owners.push({ firstName, lastName, documentType: row.documentType, documentNumber, phone: row.phone.trim() || undefined, email: row.email.trim() || undefined, ownershipPercentage: share });
      }
      grouped.set(code, target);
    });
    for (const target of grouped.values()) {
      if (target.signatures.size > 1) problems.push(`Inmueble ${target.code}: sus filas tienen datos de inmueble diferentes.`);
      const total = target.owners.reduce((sum, owner) => sum + owner.ownershipPercentage, 0);
      if (total > 100.00005) problems.push(`Inmueble ${target.code}: participación legal acumulada ${total.toFixed(2)}%; debe ser máximo 100%.`);
    }
    const alreadyRegistered = [...grouped.keys()].filter((code) => existingCodes.has(code));
    if (alreadyRegistered.length) problems.push(`Estos códigos ya existen en la comunidad: ${alreadyRegistered.join(', ')}. Desmarca esas filas o corrige sus códigos antes de importar.`);
    if (problems.length) { setError(problems.slice(0, 8).join(' ')); return; }
    setSaving(true); setError(''); setNotice('');
    try {
      const payload = [...grouped.values()].map(({ signatures: _signatures, ...row }) => ({ ...row, effectiveDate }));
      const result = await CommunityWorkspaceService.importProperties({ rows: payload });
      setNotice(`Importación completada: ${result.importedProperties} inmuebles y ${result.importedOwners} vínculos de propietarios.`);
      setRows([]);
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'No se pudo completar la importación.'); }
    finally { setSaving(false); }
  };

  if (!context || !canImport) return <PageShell><p className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm font-semibold text-amber-900">No tienes permisos para importar inmuebles y propietarios en esta comunidad.</p></PageShell>;

  return <PageShell>
    <button type="button" onClick={() => navigate('/workspace?section=inmuebles')} className="inline-flex items-center gap-2 rounded-full border border-[#071a33]/12 bg-white px-4 py-2.5 text-sm font-bold"><ArrowLeft size={16} /> Volver a inmuebles</button>
    <div className="mt-7 max-w-4xl"><p className="text-xs font-bold uppercase tracking-[.2em] text-[#9c7532]">Migración inicial · Inmuebles</p><h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">Importar desde Excel</h1><p className="mt-3 text-sm leading-6 text-slate-600">Carga el archivo del condominio, indica rangos de celdas como G50:G80 y revisa los datos antes de registrarlos. El archivo se procesa en el navegador y no se almacena.</p></div>

    <section className="mt-7 rounded-[1.75rem] border border-[#071a33]/8 bg-white p-5 shadow-[0_16px_50px_rgba(7,26,51,.05)] sm:p-7">
      <div className="flex items-start gap-3"><span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#f1eadb] text-[#9a742b]"><FileSpreadsheet size={21} /></span><div><h2 className="text-lg font-semibold">1. Archivo y hoja</h2><p className="mt-1 text-sm text-slate-500">Acepta Excel .xls/.xlsx y archivos .csv.</p></div></div>
      <label className="mt-5 flex min-h-28 cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-[#071a33]/20 bg-[#fbfaf7] px-5 py-6 text-center transition hover:border-[#b08a3c] hover:bg-[#fbf7ed]"><Upload size={20} className="text-[#9a742b]" /><span className="mt-2 text-sm font-bold">{fileName || 'Seleccionar archivo'}</span><span className="mt-1 text-xs text-slate-500">Busca el Excel exportado desde el sistema del condominio</span><input type="file" accept=".xls,.xlsx,.csv" className="sr-only" onChange={(event) => void readFile(event.target.files?.[0])} /></label>
      {parsing && <p className="mt-3 flex items-center gap-2 text-sm text-slate-500"><LoaderCircle className="animate-spin" size={15} /> Leyendo el libro…</p>}
      {workbook && <div className="mt-4 grid gap-4 sm:grid-cols-[1fr_1fr]"><label className="text-xs font-bold uppercase tracking-wider text-slate-500">Hoja<select value={sheetName} onChange={(event) => setSheetName(event.target.value)} className={`${inputClass} mt-2`}>{workbook.SheetNames.map((name) => <option key={name}>{name}</option>)}</select></label><label className="text-xs font-bold uppercase tracking-wider text-slate-500">Vigencia inicial de alícuota y propiedad<input type="date" value={effectiveDate} onChange={(event) => setEffectiveDate(event.target.value)} className={`${inputClass} mt-2`} /></label></div>}
    </section>

    {workbook && <section className="mt-5 rounded-[1.75rem] border border-[#071a33]/8 bg-white p-5 shadow-[0_16px_50px_rgba(7,26,51,.05)] sm:p-7">
      <div className="flex items-start gap-3"><span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#f1eadb] text-[#9a742b]">2</span><div><h2 className="text-lg font-semibold">2. Asocia columnas y rangos</h2><p className="mt-1 text-sm leading-6 text-slate-500">Cada campo puede venir de una columna distinta. El primer dato de cada rango forma la primera fila de la vista previa.</p></div></div>
      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{fields.map(({ key, label, required }) => <label key={key} className="text-xs font-bold text-slate-600">{label}{required && <span className="ml-1 text-rose-600">*</span>}<input value={mapping[key]} onChange={(event) => setMapping((current) => ({ ...current, [key]: event.target.value }))} className={`${inputClass} mt-1.5 font-mono`} placeholder="Ej.: G50:G80" /></label>)}<label className="text-xs font-bold text-slate-600">Serial / ID de origen<input value={sourceIdRange} onChange={(event) => setSourceIdRange(event.target.value)} className={`${inputClass} mt-1.5 font-mono`} placeholder="Ej.: A50:A80" /></label></div>
      <p className="mt-4 rounded-xl bg-[#fbf7ed] p-3 text-xs leading-5 text-[#76591f]">El serial de origen se conserva en la vista previa para identificar su fila durante la revisión. La identificación requerida por CASA es el documento del propietario.</p>
      <button type="button" onClick={() => void buildPreview().catch((cause: unknown) => setError(cause instanceof Error ? cause.message : 'Revisa los rangos configurados.'))} className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#071a33] px-5 py-3 text-sm font-bold text-white hover:bg-[#14365d]"><WandSparkles size={16} /> Leer y preparar vista previa</button>
    </section>}

    {rows.length > 0 && <section className="mt-5 rounded-[1.75rem] border border-[#071a33]/8 bg-white p-5 shadow-[0_16px_50px_rgba(7,26,51,.05)] sm:p-7">
      <div className="flex flex-col justify-between gap-3 xl:flex-row xl:items-end"><div><p className="text-xs font-bold uppercase tracking-[.18em] text-[#9c7532]">3. Revisión editable</p><h2 className="mt-1 text-xl font-semibold">{rows.filter((row) => row.include).length} filas seleccionadas</h2><p className="mt-1 text-sm text-slate-500">Copia y pega desde Excel con Ctrl+C/Ctrl+V. Selecciona varias filas de una columna y usa Ctrl+D para rellenar hacia abajo.</p><p className="mt-1 text-xs leading-5 text-slate-500">La alícuota distribuye gastos del condominio; la participación legal corresponde a cada propietario y, para copropietarios, debe sumar como máximo 100%.</p></div><div className="flex gap-2"><button type="button" onClick={() => setRows((current) => current.map((row) => ({ ...row, include: true })))} className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold">Seleccionar todo</button><button type="button" onClick={() => setRows((current) => current.map((row) => ({ ...row, include: false })))} className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold">Deseleccionar todo</button></div></div>
      <div ref={tableRef} tabIndex={0} onCopy={onCopy} onPaste={onPaste} onKeyDown={onGridKeyDown} className="mt-5 overflow-auto rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#b08a3c]/30"><table className="min-w-[2050px] border-collapse text-left text-xs"><thead className="sticky top-0 z-10 bg-[#071a33] text-white"><tr><th className="px-3 py-3">Importar</th><th className="px-3 py-3">Fila Excel</th><th className="px-3 py-3">Serial / ID</th><th className="px-3 py-3">Código *</th><th className="px-3 py-3">Categoría *</th><th className="px-3 py-3">Propietario</th><th className="px-3 py-3">Tipo doc.</th><th className="px-3 py-3">N.º documento</th><th className="px-3 py-3">Correo</th><th className="px-3 py-3">Teléfono</th><th className="px-3 py-3">Alícuota %</th><th className="px-3 py-3">Participación %</th><th className="px-3 py-3">Capacidad</th><th className="px-3 py-3">Cupos</th><th className="px-3 py-3">Estacionamiento</th><th className="px-3 py-3">Cap. estac.</th></tr></thead><tbody>{rows.map((row, rowIndex) => <tr key={`${row.sourceRow}-${rowIndex}`} className={!row.include ? 'bg-slate-50 opacity-55' : ''}><td className="border-b border-slate-100 px-3 py-2"><input aria-label={`Importar fila ${row.sourceRow}`} type="checkbox" checked={row.include} onChange={(event) => setRows((current) => current.map((item, index) => index === rowIndex ? { ...item, include: event.target.checked } : item))} /></td><td className="border-b border-slate-100 px-3 py-2 font-mono text-slate-500">{row.sourceRow}</td><td className="border-b border-slate-100 bg-slate-50 px-3 py-2 font-mono text-slate-500">{row.sourceId || '—'}</td>{gridFields.map((key, colIndex) => <td key={key} onMouseDown={(event) => { tableRef.current?.focus(); setRectSelection(rowIndex, colIndex, event.shiftKey); }} onMouseEnter={(event) => { if (event.buttons === 1) setRectSelection(rowIndex, colIndex, true); }} className={`border-b border-slate-100 px-1.5 py-1 ${selection && rowIndex >= Math.min(selection.startRow, selection.endRow) && rowIndex <= Math.max(selection.startRow, selection.endRow) && colIndex >= Math.min(selection.startCol, selection.endCol) && colIndex <= Math.max(selection.startCol, selection.endCol) ? 'bg-[#dce8f5]' : ''}`}><CellEditor row={row} rowIndex={rowIndex} colIndex={colIndex} field={key} existing={key === 'code' && existingCodes.has(row.code.trim().toUpperCase())} mapped={Boolean(mapping[key].trim())} onFocus={() => setRectSelection(rowIndex, colIndex, false)} onChange={(value) => updateCell(rowIndex, key, value)} /></td>)}</tr>)}</tbody></table></div>
      <div className="mt-4 flex flex-col gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between"><p className="text-xs text-slate-500"><span className="mr-1 inline-block h-3 w-3 rounded-sm bg-amber-200 align-middle" /> Amarillo: falta un dato o no pudo leerse. Los propietarios requieren nombre, apellido y documento.</p><button type="button" onClick={() => void importRows()} disabled={saving} className="inline-flex items-center justify-center gap-2 rounded-full bg-[#b08a3c] px-6 py-3 text-sm font-bold text-white hover:bg-[#98742f] disabled:cursor-wait disabled:opacity-60"><Import size={16} />{saving ? 'Importando…' : 'Importar filas seleccionadas'}</button></div>
    </section>}

    {error && <p role="alert" className="mt-5 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-semibold leading-6 text-rose-800">{error}</p>}
    {notice && <p role="status" className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold leading-6 text-emerald-800">{notice}</p>}
  </PageShell>;
}

function CellEditor({ row, rowIndex, colIndex, field, existing, mapped, onChange, onFocus }: { row: ImportRow; rowIndex: number; colIndex: number; field: FieldKey; existing: boolean; mapped: boolean; onChange: (value: string) => void; onFocus: () => void }) {
  const value = row[field];
  const isRequired = field === 'code' || field === 'kind' || (!!row.ownerName && (field === 'documentNumber'));
  const missing = (isRequired || mapped) && !value;
  const className = `min-w-28 rounded-md border px-2 py-2 text-xs outline-none focus:border-[#b08a3c] focus:ring-2 focus:ring-[#b08a3c]/20 ${missing || existing ? 'border-amber-300 bg-amber-100' : 'border-slate-200 bg-white'}`;
  const common = { onFocus, className, 'data-grid-cell': `${rowIndex}:${colIndex}` };
  if (field === 'kind') return <select {...common} value={row.kind} onChange={(event) => onChange(event.target.value)}><option value="">Elegir…</option><option value="APARTMENT">Apartamento</option><option value="TOWNHOUSE">Townhouse</option><option value="HOUSE">Casa</option><option value="QUINTA">Quinta</option><option value="PENTHOUSE">Penthouse</option><option value="COMMERCIAL">Local comercial</option></select>;
  if (field === 'documentType') return <select {...common} value={row.documentType} onChange={(event) => onChange(event.target.value)}><option value="V">V</option><option value="E">E</option><option value="J">J</option><option value="P">P</option></select>;
  return <input {...common} value={value} onChange={(event) => onChange(event.target.value)} aria-label={`${fields.find((item) => item.key === field)?.label} fila ${row.sourceRow}`} />;
}

function PageShell({ children }: { children: React.ReactNode }) { return <main className="min-h-screen bg-[#f4f1e9] px-4 py-6 text-[#071a33] sm:px-8 sm:py-9"><div className="mx-auto max-w-[1500px]">{children}</div></main>; }
