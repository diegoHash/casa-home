import { useEffect, useState, type FormEvent } from 'react';
import {
  AlertCircle,
  FolderPlus,
  LoaderCircle,
  Pencil,
  Plus,
  Search,
  X,
} from 'lucide-react';
import {
  CommunityWorkspaceService,
  type BillingSnapshot,
  type ExpenseConceptRecord,
  type PageResult,
} from '../../services/CommunityWorkspaceService';

const inputClass =
  'w-full rounded-xl border border-[#071a33]/12 bg-white px-3.5 py-3 text-sm outline-none transition focus:border-[#b08a3c] focus:ring-2 focus:ring-[#b08a3c]/15';

type Category = BillingSnapshot['expenseCategories'][number];
type EditTarget =
  | { type: 'category'; record: Category }
  | { type: 'concept'; record: ExpenseConceptRecord }
  | null;

function normalizedCode(value: string) {
  return value.trim().toUpperCase().replace(/\s+/g, '-');
}

export function ExpenseCatalogPanel({
  categories,
  canWrite,
  onNewCategory,
  onNewConcept,
  onChanged,
}: {
  categories: BillingSnapshot['expenseCategories'];
  canWrite: boolean;
  onNewCategory: () => void;
  onNewConcept: () => void;
  onChanged: () => Promise<void> | void;
}) {
  const [directory, setDirectory] =
    useState<PageResult<ExpenseConceptRecord> | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [search, setSearch] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [status, setStatus] = useState<'ACTIVE' | 'INACTIVE' | ''>('ACTIVE');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [edit, setEdit] = useState<EditTarget>(null);
  const [saving, setSaving] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const catalogSignature = categories
    .map((category) => `${category.id}:${category._count.concepts}`)
    .join('|');

  useEffect(() => {
    let active = true;
    const timer = window.setTimeout(() => {
      setLoading(true);
      setError('');
      CommunityWorkspaceService.expenseConcepts({
        page,
        pageSize,
        search: search.trim() || undefined,
        categoryId: categoryId || undefined,
        status: status || undefined,
      })
        .then((result) => {
          if (active) setDirectory(result);
        })
        .catch((loadError: unknown) => {
          if (!active) return;
          setError(
            loadError instanceof Error
              ? loadError.message
              : 'No fue posible cargar los conceptos.',
          );
        })
        .finally(() => {
          if (active) setLoading(false);
        });
    }, 250);
    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [
    catalogSignature,
    categoryId,
    page,
    pageSize,
    refreshKey,
    search,
    status,
  ]);

  const save = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!edit) return;
    setSaving(true);
    setError('');
    const form = new FormData(event.currentTarget);
    try {
      const code = normalizedCode(String(form.get('code')));
      if (edit.type === 'category') {
        const duplicate = categories.find(
          (category) =>
            category.id !== edit.record.id &&
            normalizedCode(category.code) === code,
        );
        if (duplicate) {
          setError(
            `El código ${code} ya pertenece a la categoría “${duplicate.name}”.`,
          );
          return;
        }
      } else {
        const matches = await CommunityWorkspaceService.expenseConcepts({
          page: 1,
          pageSize: 100,
          search: code,
        });
        const duplicate = matches.items.find(
          (concept) =>
            concept.id !== edit.record.id &&
            normalizedCode(concept.code) === code,
        );
        if (duplicate) {
          setError(
            `El código ${code} ya pertenece al concepto “${duplicate.name}” en ${duplicate.category.name}.`,
          );
          return;
        }
      }
      const input = {
        code,
        name: String(form.get('name')).trim(),
        description: String(form.get('description')).trim(),
        status: String(form.get('status')) as 'ACTIVE' | 'INACTIVE',
      };
      if (edit.type === 'category') {
        await CommunityWorkspaceService.updateExpenseCategory(
          edit.record.id,
          input,
        );
      } else {
        await CommunityWorkspaceService.updateExpenseConcept(edit.record.id, {
          ...input,
          categoryId: String(form.get('categoryId')),
        });
      }
      setEdit(null);
      await onChanged();
      setRefreshKey((current) => current + 1);
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : 'No fue posible actualizar el registro.',
      );
    } finally {
      setSaving(false);
    }
  };

  const pageCount = Math.max(
    1,
    Math.ceil((directory?.total ?? 0) / pageSize),
  );

  return (
    <div className="mt-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h3 className="text-2xl font-semibold">Catálogo de gastos</h3>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            Administra categorías generales y sus conceptos específicos sin
            cargar todo el catálogo dentro del resumen mensual.
          </p>
        </div>
        {canWrite && (
          <div className="flex flex-wrap gap-2">
            <Action
              icon={FolderPlus}
              label="Nueva categoría"
              onClick={onNewCategory}
            />
            <Action
              icon={Plus}
              label="Nuevo concepto"
              disabled={!categories.some((item) => item.status === 'ACTIVE')}
              onClick={onNewConcept}
            />
          </div>
        )}
      </div>

      {error && (
        <div className="mt-5 flex gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
          <AlertCircle size={18} className="shrink-0" />
          {error}
        </div>
      )}

      <section className="mt-6 overflow-hidden rounded-[1.5rem] border border-[#071a33]/8 bg-white">
        <div className="border-b border-[#071a33]/8 px-5 py-4">
          <h4 className="font-semibold">Categorías</h4>
          <p className="mt-1 text-xs text-slate-500">
            Grupos principales del aviso de cobro.
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[680px] text-left text-sm">
            <thead className="bg-[#f7f4ed] text-xs uppercase tracking-wide text-slate-400">
              <tr>
                <th className="px-5 py-3">Código</th>
                <th className="px-5 py-3">Categoría</th>
                <th className="px-5 py-3">Conceptos activos</th>
                <th className="px-5 py-3">Estado</th>
                <th className="px-5 py-3 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#071a33]/6">
              {categories.map((category) => (
                <tr key={category.id}>
                  <td className="px-5 py-4 font-bold">{category.code}</td>
                  <td className="px-5 py-4">
                    <b>{category.name}</b>
                    {category.description && (
                      <span className="mt-1 block text-xs text-slate-500">
                        {category.description}
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-4">{category._count.concepts}</td>
                  <td className="px-5 py-4">
                    <Status value={category.status} />
                  </td>
                  <td className="px-5 py-4 text-right">
                    {canWrite && (
                      <button
                        type="button"
                        onClick={() => setEdit({ type: 'category', record: category })}
                        className="inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-bold"
                      >
                        <Pencil size={14} /> Editar
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-6 overflow-hidden rounded-[1.5rem] border border-[#071a33]/8 bg-white">
        <div className="grid gap-3 border-b border-[#071a33]/8 p-5 lg:grid-cols-[1fr_240px_160px_110px]">
          <label className="relative block">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              className={`${inputClass} pl-9`}
              placeholder="Buscar código, concepto o categoría"
            />
          </label>
          <select
            value={categoryId}
            onChange={(event) => {
              setCategoryId(event.target.value);
              setPage(1);
            }}
            className={inputClass}
          >
            <option value="">Todas las categorías</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.code} · {category.name}
              </option>
            ))}
          </select>
          <select
            value={status}
            onChange={(event) => {
              setStatus(event.target.value as typeof status);
              setPage(1);
            }}
            className={inputClass}
          >
            <option value="">Todos los estados</option>
            <option value="ACTIVE">Activos</option>
            <option value="INACTIVE">Inactivos</option>
          </select>
          <select
            value={pageSize}
            onChange={(event) => {
              setPageSize(Number(event.target.value));
              setPage(1);
            }}
            className={inputClass}
            aria-label="Registros por página"
          >
            {[20, 50, 100].map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] text-left text-sm">
            <thead className="bg-[#f7f4ed] text-xs uppercase tracking-wide text-slate-400">
              <tr>
                <th className="px-5 py-3">Categoría</th>
                <th className="px-5 py-3">Código</th>
                <th className="px-5 py-3">Concepto</th>
                <th className="px-5 py-3">Estado</th>
                <th className="px-5 py-3 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#071a33]/6">
              {(directory?.items ?? []).map((concept) => (
                <tr key={concept.id}>
                  <td className="px-5 py-4">
                    <b>{concept.category.code}</b>
                    <span className="mt-1 block text-xs text-slate-500">
                      {concept.category.name}
                    </span>
                  </td>
                  <td className="px-5 py-4 font-bold">{concept.code}</td>
                  <td className="px-5 py-4">
                    <b>{concept.name}</b>
                    {concept.description && (
                      <span className="mt-1 block text-xs text-slate-500">
                        {concept.description}
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    <Status value={concept.status} />
                  </td>
                  <td className="px-5 py-4 text-right">
                    {canWrite && (
                      <button
                        type="button"
                        onClick={() => setEdit({ type: 'concept', record: concept })}
                        className="inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-bold"
                      >
                        <Pencil size={14} /> Editar
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {!loading && !directory?.items.length && (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center text-slate-500">
                    No hay conceptos que coincidan con los filtros.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between border-t border-[#071a33]/8 px-5 py-4 text-sm">
          <span className="text-slate-500">
            {loading ? (
              <LoaderCircle size={17} className="animate-spin" />
            ) : (
              `${directory?.total ?? 0} concepto(s) · Página ${page} de ${pageCount}`
            )}
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={page <= 1 || loading}
              onClick={() => setPage((current) => current - 1)}
              className="rounded-full border px-4 py-2 font-bold disabled:opacity-35"
            >
              Anterior
            </button>
            <button
              type="button"
              disabled={page >= pageCount || loading}
              onClick={() => setPage((current) => current + 1)}
              className="rounded-full border px-4 py-2 font-bold disabled:opacity-35"
            >
              Siguiente
            </button>
          </div>
        </div>
      </section>

      {edit && (
        <div className="fixed inset-0 z-[110] overflow-y-auto bg-[#071a33]/65 p-4 backdrop-blur-sm">
          <form
            onSubmit={save}
            className="mx-auto my-10 max-w-xl rounded-[1.5rem] bg-[#f8f6f0] shadow-2xl"
          >
            <header className="flex items-center justify-between border-b border-[#071a33]/8 px-5 py-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-[#9c7532]">
                  Catálogo de gastos
                </p>
                <h3 className="mt-1 font-semibold">
                  Editar {edit.type === 'category' ? 'categoría' : 'concepto'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEdit(null)}
                className="rounded-full bg-white p-2"
              >
                <X size={17} />
              </button>
            </header>
            <div className="space-y-4 p-5">
              {error && (
                <div
                  role="alert"
                  className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700"
                >
                  {error}
                </div>
              )}
              {edit.type === 'concept' && (
                <Field label="Categoría">
                  <select
                    name="categoryId"
                    className={inputClass}
                    defaultValue={edit.record.categoryId}
                    required
                  >
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.code} · {category.name}
                      </option>
                    ))}
                  </select>
                </Field>
              )}
              <Field label="Código">
                <input
                  name="code"
                  className={inputClass}
                  defaultValue={edit.record.code}
                  required
                />
              </Field>
              <Field label="Nombre">
                <input
                  name="name"
                  className={inputClass}
                  defaultValue={edit.record.name}
                  required
                />
              </Field>
              <Field label="Descripción">
                <textarea
                  name="description"
                  className={inputClass}
                  defaultValue={edit.record.description ?? ''}
                  rows={3}
                />
              </Field>
              <Field label="Estado">
                <select
                  name="status"
                  className={inputClass}
                  defaultValue={edit.record.status}
                >
                  <option value="ACTIVE">Activo</option>
                  <option value="INACTIVE">Inactivo</option>
                </select>
              </Field>
              <button
                type="submit"
                disabled={saving}
                className="w-full rounded-xl bg-[#071a33] px-5 py-3.5 text-sm font-bold text-white disabled:opacity-50"
              >
                {saving ? 'Guardando…' : 'Guardar cambios'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block text-sm font-bold">
      {label}
      <span className="mt-1.5 block">{children}</span>
    </label>
  );
}

function Status({ value }: { value: string }) {
  return (
    <span
      className={`rounded-full px-2.5 py-1 text-xs font-bold ${
        value === 'ACTIVE'
          ? 'bg-emerald-50 text-emerald-700'
          : 'bg-slate-100 text-slate-500'
      }`}
    >
      {value === 'ACTIVE' ? 'Activo' : 'Inactivo'}
    </span>
  );
}

function Action({
  icon: Icon,
  label,
  onClick,
  disabled,
}: {
  icon: typeof Plus;
  label: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="inline-flex items-center gap-2 rounded-full border border-[#071a33]/10 bg-white px-4 py-2.5 text-sm font-bold shadow-sm disabled:opacity-40"
    >
      <Icon size={16} /> {label}
    </button>
  );
}
