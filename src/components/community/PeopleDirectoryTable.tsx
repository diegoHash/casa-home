import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import type { CoreSnapshot } from '../../services/CommunityWorkspaceService';

type RelationFilter = 'ALL' | 'OWNER' | 'BOARD' | 'STAFF' | 'GENERAL';
type SortBy = 'NAME_ASC' | 'NAME_DESC' | 'DOCUMENT_ASC' | 'EMAIL_ASC';

type PersonRow = CoreSnapshot['people'][number]['person'] & {
  relations: string[];
  relationTypes: Exclude<RelationFilter, 'ALL' | 'GENERAL'>[];
};

function makeRows(core: CoreSnapshot | null): PersonRow[] {
  if (!core) return [];
  return core.people.map(({ person }) => {
    const owners = core.ownerships
      .filter((item) => item.personId === person.id && item.status === 'ACTIVE')
      .map((item) => `Propietario · ${item.property.code}`);
    const board = core.boardAppointments
      .filter((item) => item.personId === person.id && item.status === 'ACTIVE')
      .map((item) => `Junta · ${item.position}`);
    const staff = core.employments
      .filter((item) => item.personId === person.id && item.status === 'ACTIVE')
      .map((item) => `Equipo · ${item.position}`);
    const relationTypes: PersonRow['relationTypes'] = [
      ...(owners.length ? ['OWNER' as const] : []),
      ...(board.length ? ['BOARD' as const] : []),
      ...(staff.length ? ['STAFF' as const] : []),
    ];
    return {
      ...person,
      relations: [...owners, ...board, ...staff],
      relationTypes,
    };
  });
}

export function PeopleDirectoryTable({ core, canWrite = false, onEdit, onDeactivate }: { core: CoreSnapshot | null; canWrite?: boolean; onEdit?: (person: PersonRow) => void; onDeactivate?: (person: PersonRow) => void }) {
  const [search, setSearch] = useState('');
  const [relation, setRelation] = useState<RelationFilter>('ALL');
  const [documentType, setDocumentType] = useState('ALL');
  const [sortBy, setSortBy] = useState<SortBy>('NAME_ASC');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const rows = useMemo(() => makeRows(core), [core]);

  const filteredRows = useMemo(() => {
    const term = search.trim().toLocaleLowerCase('es-VE');
    const result = rows.filter((person) => {
      const relationMatches =
        relation === 'ALL' ||
        (relation === 'GENERAL'
          ? person.relationTypes.length === 0
          : person.relationTypes.includes(relation));
      const documentMatches =
        documentType === 'ALL' || person.documentType === documentType;
      const textMatches =
        !term ||
        [
          person.firstName,
          person.lastName,
          person.documentType,
          person.documentNumber,
          person.email,
          person.phone,
          ...person.relations,
        ]
          .filter(Boolean)
          .join(' ')
          .toLocaleLowerCase('es-VE')
          .includes(term);
      return relationMatches && documentMatches && textMatches;
    });
    return result.sort((left, right) => {
      const fullName = (item: PersonRow) => `${item.firstName} ${item.lastName}`;
      if (sortBy === 'NAME_DESC') return fullName(right).localeCompare(fullName(left), 'es-VE');
      if (sortBy === 'DOCUMENT_ASC') {
        return `${left.documentType}-${left.documentNumber}`.localeCompare(
          `${right.documentType}-${right.documentNumber}`,
          'es-VE',
        );
      }
      if (sortBy === 'EMAIL_ASC') return (left.email ?? '').localeCompare(right.email ?? '', 'es-VE');
      return fullName(left).localeCompare(fullName(right), 'es-VE');
    });
  }, [documentType, relation, rows, search, sortBy]);

  const pageCount = Math.max(1, Math.ceil(filteredRows.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const visibleRows = filteredRows.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const updateFilters = (callback: () => void) => {
    callback();
    setPage(1);
  };

  return (
    <section className="overflow-hidden rounded-[1.5rem] border border-[#071a33]/8 bg-white shadow-sm">
      <div className="grid gap-3 border-b border-[#071a33]/8 p-5 xl:grid-cols-[minmax(250px,1fr)_180px_150px_190px_92px]">
        <label className="relative block">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(event) => updateFilters(() => setSearch(event.target.value))}
            placeholder="Buscar nombre, cédula, correo o relación"
            className="w-full rounded-xl border border-[#071a33]/12 bg-white py-3 pl-9 pr-3.5 text-sm outline-none focus:border-[#b08a3c] focus:ring-2 focus:ring-[#b08a3c]/15"
          />
        </label>
        <select value={relation} onChange={(event) => updateFilters(() => setRelation(event.target.value as RelationFilter))} className="rounded-xl border border-[#071a33]/12 bg-white px-3 text-sm outline-none focus:border-[#b08a3c]">
          <option value="ALL">Todas las relaciones</option>
          <option value="OWNER">Propietarios</option>
          <option value="BOARD">Junta directiva</option>
          <option value="STAFF">Equipo de trabajo</option>
          <option value="GENERAL">Sin relación vigente</option>
        </select>
        <select value={documentType} onChange={(event) => updateFilters(() => setDocumentType(event.target.value))} className="rounded-xl border border-[#071a33]/12 bg-white px-3 text-sm outline-none focus:border-[#b08a3c]">
          <option value="ALL">Documento</option>
          <option value="V">Venezolano</option>
          <option value="E">Extranjero</option>
          <option value="J">Jurídico</option>
          <option value="P">Pasaporte</option>
        </select>
        <select value={sortBy} onChange={(event) => updateFilters(() => setSortBy(event.target.value as SortBy))} className="rounded-xl border border-[#071a33]/12 bg-white px-3 text-sm outline-none focus:border-[#b08a3c]">
          <option value="NAME_ASC">Nombre: A a Z</option>
          <option value="NAME_DESC">Nombre: Z a A</option>
          <option value="DOCUMENT_ASC">Documento</option>
          <option value="EMAIL_ASC">Correo</option>
        </select>
        <select value={pageSize} onChange={(event) => updateFilters(() => setPageSize(Number(event.target.value)))} aria-label="Personas por página" className="rounded-xl border border-[#071a33]/12 bg-white px-3 text-sm outline-none focus:border-[#b08a3c]">
          {[20, 50, 100].map((size) => <option key={size} value={size}>{size}</option>)}
        </select>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[850px] text-left text-sm">
          <thead className="bg-[#071a33] text-white"><tr>
            {['Nombre', 'Documento', 'Relación en la comunidad', 'Correo', 'Teléfono'].map((heading) => <th key={heading} className="px-5 py-4 text-xs uppercase tracking-[0.13em]">{heading}</th>)}
            {canWrite && <th className="px-5 py-4 text-right text-xs uppercase tracking-[0.13em]">Acciones</th>}
          </tr></thead>
          <tbody>
            {visibleRows.map((person) => <tr key={person.id} className="border-t border-slate-100">
              <td className="px-5 py-4 font-semibold">{person.firstName} {person.lastName}</td>
              <td className="px-5 py-4 text-slate-500">{person.documentType}-{person.documentNumber}</td>
              <td className="px-5 py-4 text-slate-500">{person.relations.join(' / ') || 'Directorio general'}</td>
              <td className="px-5 py-4 text-slate-500">{person.email || '—'}</td>
              <td className="px-5 py-4 text-slate-500">{person.phone || '—'}</td>
              {canWrite && <td className="px-5 py-4 text-right"><div className="flex justify-end gap-2"><button type="button" onClick={() => onEdit?.(person)} className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-bold text-[#071a33] hover:bg-slate-50">Editar</button><button type="button" onClick={() => onDeactivate?.(person)} className="rounded-lg border border-rose-200 px-3 py-1.5 text-xs font-bold text-rose-700 hover:bg-rose-50">Retirar</button></div></td>}
            </tr>)}
            {!visibleRows.length && <tr><td colSpan={canWrite ? 6 : 5} className="px-5 py-12 text-center text-slate-500">No hay personas que coincidan con los filtros.</td></tr>}
          </tbody>
        </table>
      </div>
      <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-[#071a33]/8 px-5 py-4 text-sm">
        <span className="text-slate-500">{filteredRows.length} persona(s) · Página {currentPage} de {pageCount}</span>
        <div className="flex gap-2">
          <button type="button" disabled={currentPage <= 1} onClick={() => setPage((value) => Math.max(1, value - 1))} className="rounded-full border px-4 py-2 font-bold disabled:opacity-35">Anterior</button>
          <button type="button" disabled={currentPage >= pageCount} onClick={() => setPage((value) => Math.min(pageCount, value + 1))} className="rounded-full border px-4 py-2 font-bold disabled:opacity-35">Siguiente</button>
        </div>
      </footer>
    </section>
  );
}
