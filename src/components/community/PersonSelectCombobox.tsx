import { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronDown, Search, X, ShieldAlert, Check } from 'lucide-react';
import type { CoreSnapshot } from '../../services/CommunityWorkspaceService';

interface Props {
  label: string;
  name: string;
  required?: boolean;
  core: CoreSnapshot | null;
  ownerIds: Set<string>;
  activeEmployeeIds: Set<string>;
  activeBoardIds: Set<string>;
  mode: 'employment' | 'board' | 'ownership';
  value: string;
  onChange: (personId: string) => void;
}

export function PersonSelectCombobox({
  label,
  name,
  required,
  core,
  ownerIds,
  activeEmployeeIds,
  activeBoardIds,
  mode,
  value,
  onChange,
}: Props) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  const people = useMemo(() => core?.people ?? [], [core?.people]);

  const selectedPerson = useMemo(
    () => people.find((p) => p.person.id === value)?.person ?? null,
    [people, value],
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredPeople = useMemo(() => {
    let list = people;
    if (mode === 'board') {
      list = list.filter(({ person }) => ownerIds.has(person.id));
    }
    const q = search.trim().toLowerCase();
    if (!q) return list;

    return list.filter(({ person }) => {
      const fullName = `${person.firstName} ${person.lastName}`.toLowerCase();
      const doc = `${person.documentType}-${person.documentNumber}`.toLowerCase();
      return fullName.includes(q) || doc.includes(q);
    });
  }, [people, mode, ownerIds, search]);

  return (
    <div className="relative sm:col-span-2" ref={containerRef}>
      <label className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input type="hidden" name={name} value={value} required={required} />

      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="mt-2 flex w-full items-center justify-between rounded-xl border border-[#071a33]/12 bg-white px-3.5 py-3 text-left text-sm text-[#071a33] outline-none transition focus:border-[#b08a3c] focus:ring-2 focus:ring-[#b08a3c]/15 hover:border-[#b08a3c]/50"
      >
        {selectedPerson ? (
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-semibold">
              {selectedPerson.firstName} {selectedPerson.lastName}
            </span>
            <span className="text-xs text-slate-400">
              ({selectedPerson.documentType}-{selectedPerson.documentNumber})
            </span>
            {ownerIds.has(selectedPerson.id) && (
              <span className="inline-flex items-center gap-1 rounded-full border border-[#d9b76d]/60 bg-[#fef9eb] px-2.5 py-0.5 text-xs font-bold text-[#85631f]">
                👑 Propietario
              </span>
            )}
            {activeEmployeeIds.has(selectedPerson.id) && (
              <span className="inline-flex items-center gap-1 rounded-full border border-[#b08a3c]/60 bg-[#f7f0df] px-2.5 py-0.5 text-xs font-bold text-[#6b4e19]">
                💼 Trabajador activo
              </span>
            )}
            {activeBoardIds.has(selectedPerson.id) && (
              <span className="inline-flex items-center gap-1 rounded-full border border-[#d9b76d]/60 bg-[#fef9eb] px-2.5 py-0.5 text-xs font-bold text-[#85631f]">
                🏛️ Junta Directiva
              </span>
            )}
          </div>
        ) : (
          <span className="text-slate-400 font-medium">
            Selecciona una persona...
          </span>
        )}
        <ChevronDown size={18} className="shrink-0 text-slate-400" />
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-full z-[100] mt-1.5 max-h-80 w-full overflow-hidden rounded-2xl border border-[#071a33]/15 bg-white p-2.5 shadow-2xl backdrop-blur-xl">
          <div className="relative mb-2">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nombre o documento..."
              className="w-full rounded-xl border border-[#071a33]/10 bg-slate-50 py-2.5 pl-9 pr-8 text-xs outline-none transition focus:border-[#b08a3c] focus:bg-white"
              autoFocus
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X size={14} />
              </button>
            )}
          </div>

          <div className="max-h-60 overflow-y-auto space-y-1 pr-1">
            {filteredPeople.length === 0 && (
              <div className="p-4 text-center text-xs font-semibold text-slate-400">
                No se encontraron personas registradas.
              </div>
            )}
            {filteredPeople.length > 0 &&
              filteredPeople.map(({ person }) => {
                const isOwner = ownerIds.has(person.id);
                const isEmployee = activeEmployeeIds.has(person.id);
                const isBoard = activeBoardIds.has(person.id);

                let unavailable = false;
                let unavailableReason = '';

                if (mode === 'employment') {
                  if (isEmployee) {
                    unavailable = true;
                    unavailableReason = 'Ya incorporado al equipo';
                  } else if (isBoard) {
                    unavailable = true;
                    unavailableReason = 'Integrante de la junta';
                  }
                } else if (mode === 'board') {
                  if (isBoard) {
                    unavailable = true;
                    unavailableReason = 'Ya integra la junta vigente';
                  } else if (isEmployee) {
                    unavailable = true;
                    unavailableReason = 'Trabajador activo';
                  }
                }

                const selected = person.id === value;

                return (
                  <button
                    key={person.id}
                    type="button"
                    disabled={unavailable}
                    onClick={() => {
                      onChange(person.id);
                      setOpen(false);
                    }}
                    className={`group flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-left transition ${
                      unavailable
                        ? 'cursor-not-allowed bg-slate-50/80 opacity-60'
                        : selected
                        ? 'bg-[#071a33] text-white'
                        : 'hover:bg-[#fbf9f3] text-[#071a33]'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 min-w-0 flex-1 pr-2">
                      <div className="truncate">
                        <span className="text-sm font-bold">
                          {person.firstName} {person.lastName}
                        </span>
                        <span
                          className={`ml-2 text-xs ${
                            selected ? 'text-white/60' : 'text-slate-400'
                          }`}
                        >
                          ({person.documentType}-{person.documentNumber})
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-1.5">
                        {isOwner && (
                          <span
                            className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-bold shadow-xs ${
                              selected
                                ? 'border-[#d9b76d] bg-[#d9b76d] text-[#071a33]'
                                : 'border-[#d9b76d]/60 bg-[#fef9eb] text-[#85631f]'
                            }`}
                          >
                            👑 Propietario
                          </span>
                        )}
                        {isEmployee && (
                          <span
                            className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-bold shadow-xs ${
                              selected
                                ? 'border-[#b08a3c] bg-[#b08a3c] text-white'
                                : 'border-[#b08a3c]/60 bg-[#f7f0df] text-[#6b4e19]'
                            }`}
                          >
                            💼 Trabajador activo
                          </span>
                        )}
                        {isBoard && (
                          <span
                            className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-bold shadow-xs ${
                              selected
                                ? 'border-[#d9b76d] bg-[#d9b76d] text-[#071a33]'
                                : 'border-[#d9b76d]/60 bg-[#fef9eb] text-[#85631f]'
                            }`}
                          >
                            🏛️ Junta Directiva
                          </span>
                        )}
                        {!isOwner && !isEmployee && !isBoard && (
                          <span
                            className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${
                              selected
                                ? 'border-white/20 bg-white/10 text-white'
                                : 'border-slate-200 bg-slate-100 text-slate-500'
                            }`}
                          >
                            👤 Sin propiedad/cargo
                          </span>
                        )}
                      </div>
                    </div>

                    {unavailable && (
                      <span className="shrink-0 inline-flex items-center gap-1 rounded-full border border-red-200 bg-red-50 px-2.5 py-0.5 text-[10px] font-bold text-red-700">
                        <ShieldAlert size={12} /> {unavailableReason}
                      </span>
                    )}

                    {selected && !unavailable && (
                      <Check size={16} className="shrink-0 text-[#d9b76d]" />
                    )}
                  </button>
                );
              })}
          </div>
        </div>
      )}
    </div>
  );
}
