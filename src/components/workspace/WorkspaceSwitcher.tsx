import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Check, ChevronRight, Command, X } from 'lucide-react';
import {
  workspaceCatalog,
  workspaceLabel,
  type WorkspaceCode,
} from '../../config/workspaceCatalog';
import { StaffSession } from '../../services/StaffSession';

function assignedWorkspaceCodes() {
  const granted = StaffSession.context()?.workspaces ?? [];
  return workspaceCatalog
    .filter((workspace) => granted.includes('*') || granted.includes(workspace.code))
    .map((workspace) => workspace.code);
}

/**
 * Alt+Tab-style workspace preview. Shift+E advances immediately to the next
 * authorized workspace; Enter/click confirms the highlighted item and Escape
 * restores the workspace that was active when the visor opened.
 */
export default function WorkspaceSwitcher() {
  const location = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const [availableCodes, setAvailableCodes] = useState<WorkspaceCode[]>(() => assignedWorkspaceCodes());
  const [activeCode, setActiveCode] = useState(() => StaffSession.workspace());
  const [previewCode, setPreviewCode] = useState('');
  const startingCode = useRef('');
  const closeTimer = useRef<number | null>(null);

  const refreshSessionState = useCallback(() => {
    setAvailableCodes(assignedWorkspaceCodes());
    setActiveCode(StaffSession.workspace());
  }, []);

  useEffect(() => {
    window.addEventListener('casa:workspace-changed', refreshSessionState);
    return () => window.removeEventListener('casa:workspace-changed', refreshSessionState);
  }, [refreshSessionState]);

  const assignedWorkspaces = useMemo(
    () => workspaceCatalog.filter((workspace) => availableCodes.includes(workspace.code)),
    [availableCodes],
  );
  const availableWorkspaces = useMemo(
    () => assignedWorkspaces.filter((workspace) => workspace.enabled),
    [assignedWorkspaces],
  );

  const close = useCallback((restore = false) => {
    if (closeTimer.current !== null) window.clearTimeout(closeTimer.current);
    closeTimer.current = null;
    if (restore && startingCode.current) {
      StaffSession.selectWorkspace(startingCode.current);
    }
    startingCode.current = '';
    setPreviewCode('');
    setOpen(false);
  }, []);

  const selectWorkspace = useCallback(
    (code: WorkspaceCode) => {
      StaffSession.selectWorkspace(code);
      setActiveCode(code);
      if (location.pathname !== '/workspace') {
        navigate('/workspace', { replace: true });
      }
    },
    [location.pathname, navigate],
  );

  const preview = useCallback(
    (index: number) => {
      if (!availableWorkspaces.length) return;
      const nextIndex = (index + availableWorkspaces.length) % availableWorkspaces.length;
      const nextCode = availableWorkspaces[nextIndex].code;
      setHighlightedIndex(nextIndex);
      setPreviewCode(nextCode);
      selectWorkspace(nextCode);
    },
    [availableWorkspaces, selectWorkspace],
  );

  const openAndAdvance = useCallback(() => {
    if (location.pathname !== '/workspace' || !StaffSession.context() || !assignedWorkspaces.length) return;
    const currentCode = previewCode || StaffSession.workspace();
    const currentIndex = availableWorkspaces.findIndex(
      (workspace) => workspace.code === currentCode,
    );
    if (!open) startingCode.current = StaffSession.workspace();
    setOpen(true);
    if (availableWorkspaces.length) {
      preview(currentIndex >= 0 ? currentIndex + 1 : 0);
    }
    if (closeTimer.current !== null) window.clearTimeout(closeTimer.current);
    closeTimer.current = window.setTimeout(() => close(false), 1200);
  }, [assignedWorkspaces, availableWorkspaces, close, location.pathname, open, preview, previewCode]);

  const commit = useCallback(() => {
    const code = availableWorkspaces.find(
      (workspace) => workspace.code === previewCode,
    )?.code ?? availableWorkspaces[highlightedIndex]?.code;
    if (code) selectWorkspace(code);
    close(false);
  }, [availableWorkspaces, close, highlightedIndex, previewCode, selectWorkspace]);

  useEffect(() => {
    if (location.pathname !== '/workspace' && open) {
      window.setTimeout(() => close(false), 0);
    }
  }, [close, location.pathname, open]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      // Some browser extensions and synthetic keyboard events can omit `key`.
      // Keep the global listener harmless instead of crashing the workspace UI.
      const key = typeof event.key === 'string' ? event.key.toLowerCase() : '';
      if (event.shiftKey && key === 'e') {
        event.preventDefault();
        if (!event.repeat) openAndAdvance();
        return;
      }
      if (!open) return;
      if (key === 'escape') {
        event.preventDefault();
        close(true);
      } else if (key === 'enter') {
        event.preventDefault();
        commit();
      } else if (key === 'arrowdown' || key === 'arrowright' || key === 'tab') {
        event.preventDefault();
        preview(highlightedIndex + 1);
      } else if (key === 'arrowup' || key === 'arrowleft') {
        event.preventDefault();
        preview(highlightedIndex - 1);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [close, commit, highlightedIndex, open, openAndAdvance, preview]);

  useEffect(() => () => {
    if (closeTimer.current !== null) window.clearTimeout(closeTimer.current);
  }, []);

  if (
    !open ||
    location.pathname !== '/workspace' ||
    !StaffSession.context() ||
    !activeCode ||
    assignedWorkspaces.length === 0
  ) {
    return null;
  }

  const highlightedCode = previewCode || activeCode;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-[#071a33]/45 px-4 backdrop-blur-[3px]"
      onMouseDown={(event) => {
        if (event.currentTarget === event.target) close(true);
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="workspace-switcher-title"
        className="w-full max-w-xl overflow-hidden rounded-[1.75rem] border border-white/15 bg-[#071a33]/95 text-white shadow-[0_30px_100px_rgba(7,26,51,.35)]"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className="flex items-start justify-between border-b border-white/10 px-6 py-5">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#e3bf72]">
              Cambio rápido
            </p>
            <h2 id="workspace-switcher-title" className="mt-2 text-xl font-semibold">
              Espacios disponibles
            </h2>
            <p className="mt-1 text-sm text-white/55">
              {StaffSession.context()?.name}
            </p>
          </div>
          <button
            type="button"
            onClick={() => close(true)}
            className="rounded-full p-2 text-white/55 transition hover:bg-white/10 hover:text-white"
            aria-label="Cerrar selector de espacios"
          >
            <X size={18} />
          </button>
        </header>

        <div className="grid gap-2 p-4 sm:grid-cols-2">
          {assignedWorkspaces.map((workspace) => {
            const highlighted = workspace.code === highlightedCode;
            const active = workspace.code === activeCode;
            return (
              <button
                type="button"
                disabled={!workspace.enabled}
                key={workspace.code}
                aria-selected={highlighted}
                onMouseEnter={() => {
                  if (workspace.enabled) {
                    preview(availableWorkspaces.findIndex((item) => item.code === workspace.code));
                  }
                }}
                onClick={() => {
                  if (workspace.enabled) selectWorkspace(workspace.code);
                  close(false);
                }}
                className={`group relative flex min-h-[82px] items-center gap-3 overflow-hidden rounded-2xl border px-4 py-3 text-left transition ${
                  highlighted
                    ? 'border-[#e3bf72] bg-white/12 shadow-[0_0_0_1px_rgba(227,191,114,.2)]'
                    : workspace.enabled
                      ? 'border-white/10 bg-white/[.04] hover:border-white/25 hover:bg-white/[.08]'
                      : 'cursor-not-allowed border-white/10 bg-white/[.02] opacity-60'
                }`}
              >
                {!workspace.enabled && (
                  <span className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
                    <span className="w-[125%] -rotate-[18deg] bg-[#071a33]/90 px-2 py-1 text-center text-[9px] font-black uppercase tracking-[0.16em] text-[#e3bf72]">
                      Próximamente · En construcción
                    </span>
                  </span>
                )}
                <span className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl ${highlighted ? 'bg-[#e3bf72] text-[#071a33]' : 'bg-white/10 text-[#e3bf72]'}`}>
                  <Command size={18} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold">{workspace.label}</span>
                  <span className="mt-1 block truncate text-xs text-white/45">
                    {!workspace.enabled ? 'Disponible próximamente' : active ? 'Espacio activo' : workspaceLabel(workspace.code)}
                  </span>
                </span>
                {highlighted ? <ChevronRight size={17} className="text-[#e3bf72]" /> : active ? <Check size={16} className="text-emerald-300" /> : null}
              </button>
            );
          })}
        </div>

        <footer className="flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-white/10 px-6 py-4 text-xs text-white/45">
          <span><kbd className="rounded border border-white/20 px-1.5 py-0.5 text-white/75">Shift</kbd> + <kbd className="rounded border border-white/20 px-1.5 py-0.5 text-white/75">E</kbd> para recorrer</span>
          <span><kbd className="rounded border border-white/20 px-1.5 py-0.5 text-white/75">Enter</kbd> para elegir</span>
          <span><kbd className="rounded border border-white/20 px-1.5 py-0.5 text-white/75">Esc</kbd> para cancelar</span>
        </footer>
      </section>
    </div>
  );
}
