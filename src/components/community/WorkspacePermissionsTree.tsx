import React, { useState } from 'react';
import {
  ChevronDown,
  ChevronRight,
  Shield,
  Building2,
  BookOpenCheck,
  ShoppingCart,
  Headphones,
  HandCoins,
  ScanLine,
  Watch,
  Network,
  Check,
} from 'lucide-react';
import { workspaceCatalog } from '../../config/workspaceCatalog';
import {
  communityFullAccessScope,
  explicitScopeCatalog,
  type AccessMode,
} from '../../config/communityAccessCatalog';

const workspaceIcons: Record<string, React.ElementType> = {
  ADMINISTRATION: Building2,
  ACCOUNTING: BookOpenCheck,
  PURCHASES: ShoppingCart,
  OWNER_SERVICE: Headphones,
  COLLECTIONS: HandCoins,
  CONTROL_PRINCIPAL: ScanLine,
  WRISTBANDS: Watch,
  BOARD: Network,
};

interface WorkspacePermissionsTreeProps {
  accessMode: AccessMode;
  selectedWorkspaces: string[];
  selectedScopes: string[];
  onToggleWorkspace: (workspaceCode: string) => void;
  onToggleScope: (scopeCode: string) => void;
  onSelectAllInWorkspace?: (workspaceCode: string, scopeCodes: string[]) => void;
  onDeselectAllInWorkspace?: (workspaceCode: string, scopeCodes: string[]) => void;
}

export const WorkspacePermissionsTree: React.FC<WorkspacePermissionsTreeProps> = ({
  accessMode,
  selectedWorkspaces,
  selectedScopes,
  onToggleWorkspace,
  onToggleScope,
  onSelectAllInWorkspace,
  onDeselectAllInWorkspace,
}) => {
  const [expandedWorkspaces, setExpandedWorkspaces] = useState<Record<string, boolean>>({
    ADMINISTRATION: true,
    ACCOUNTING: true,
    PURCHASES: false,
    OWNER_SERVICE: false,
    COLLECTIONS: false,
    CONTROL_PRINCIPAL: false,
    WRISTBANDS: false,
    BOARD: false,
  });

  const toggleExpand = (wsCode: string) => {
    setExpandedWorkspaces(prev => ({
      ...prev,
      [wsCode]: !prev[wsCode],
    }));
  };

  const expandAll = () => {
    const allExpanded = workspaceCatalog.reduce((acc, ws) => {
      acc[ws.code] = true;
      return acc;
    }, {} as Record<string, boolean>);
    setExpandedWorkspaces(allExpanded);
  };

  const collapseAll = () => {
    const allCollapsed = workspaceCatalog.reduce((acc, ws) => {
      acc[ws.code] = false;
      return acc;
    }, {} as Record<string, boolean>);
    setExpandedWorkspaces(allCollapsed);
  };

  const hasCommunityFullAccess = selectedScopes.includes(communityFullAccessScope);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between px-1">
        <p className="text-xs font-bold uppercase tracking-[.14em] text-[#9a742b]">
          Árbol de Espacios de Trabajo y Permisos ({workspaceCatalog.length} espacios)
        </p>
        <div className="flex gap-3 text-xs font-semibold text-slate-500">
          <button type="button" onClick={expandAll} className="hover:text-[#071a33] transition">
            Desplegar todos
          </button>
          <span>·</span>
          <button type="button" onClick={collapseAll} className="hover:text-[#071a33] transition">
            Plegar todos
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {workspaceCatalog.map(workspace => {
          const wsCode = workspace.code;
          const Icon = workspaceIcons[wsCode] || Shield;
          const isExpanded = !!expandedWorkspaces[wsCode];

          const workspaceScopes = explicitScopeCatalog.filter(
            s =>
              s.workspaceCode === wsCode ||
              (wsCode === 'ADMINISTRATION' &&
                (s.code.startsWith('core.') ||
                  s.code.startsWith('treasury.') ||
                  s.code.startsWith('billing.'))) ||
              (wsCode === 'ACCOUNTING' &&
                (s.code.startsWith('accounting.') || s.code.startsWith('treasury.'))) ||
              (wsCode === 'OWNER_SERVICE' && s.code.startsWith('owner_service.')) ||
              (wsCode === 'PURCHASES' && s.code.startsWith('purchases.')) ||
              (wsCode === 'COLLECTIONS' && s.code.startsWith('collections.')) ||
              (wsCode === 'CONTROL_PRINCIPAL' && s.code.startsWith('access_control.')) ||
              (wsCode === 'WRISTBANDS' && s.code.startsWith('wristbands.')) ||
              (wsCode === 'BOARD' && s.code.startsWith('board.'))
          );

          const checkedScopesCount = workspaceScopes.filter(s => {
            if (hasCommunityFullAccess) return true;
            if (accessMode === 'COMMUNITY_FULL') return true;
            if (accessMode === 'WORKSPACE_FULL') {
              return (
                selectedWorkspaces.includes(wsCode)
              );
            }
            return selectedScopes.includes(s.code);
          }).length;

          const isWorkspaceSelected =
            hasCommunityFullAccess || accessMode === 'COMMUNITY_FULL' || selectedWorkspaces.includes(wsCode);
          const isAllScopesChecked =
            workspaceScopes.length > 0 && checkedScopesCount === workspaceScopes.length;
          const isSomeScopesChecked =
            checkedScopesCount > 0 && checkedScopesCount < workspaceScopes.length;

          const handleWorkspaceCheckClick = (e: React.MouseEvent) => {
            e.stopPropagation();
            if (hasCommunityFullAccess || accessMode === 'COMMUNITY_FULL') return;

            if (accessMode === 'WORKSPACE_FULL') {
              onToggleWorkspace(wsCode);
            } else if (accessMode === 'CUSTOM') {
              onToggleWorkspace(wsCode);
              const scopeCodes = workspaceScopes.map(s => s.code);
              if (isAllScopesChecked) {
                if (onDeselectAllInWorkspace) {
                  onDeselectAllInWorkspace(wsCode, scopeCodes);
                } else {
                  scopeCodes.forEach(code => {
                    if (selectedScopes.includes(code)) onToggleScope(code);
                  });
                }
              } else {
                if (onSelectAllInWorkspace) {
                  onSelectAllInWorkspace(wsCode, scopeCodes);
                } else {
                  scopeCodes.forEach(code => {
                    if (!selectedScopes.includes(code)) onToggleScope(code);
                  });
                }
              }
            }
          };

          return (
            <div
              key={wsCode}
              className={`rounded-2xl border transition-all ${
                isWorkspaceSelected
                  ? 'border-[#071a33]/15 bg-white shadow-sm'
                  : 'border-slate-200/80 bg-[#fcfbf9]'
              }`}
            >
              {/* Workspace Tree Node Header */}
              <div
                onClick={() => toggleExpand(wsCode)}
                className="flex cursor-pointer items-center justify-between p-4 select-none hover:bg-slate-50/60 rounded-2xl"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <button
                    type="button"
                    aria-label={isExpanded ? `Plegar ${workspace.label}` : `Desplegar ${workspace.label}`}
                    className="p-1 text-slate-400 hover:text-slate-700 transition"
                  >
                    {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                  </button>

                  <div
                    onClick={handleWorkspaceCheckClick}
                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition cursor-pointer ${
                      isAllScopesChecked || isWorkspaceSelected
                        ? 'border-[#071a33] bg-[#071a33] text-white'
                        : isSomeScopesChecked
                        ? 'border-[#b08a3c] bg-[#f6f0e4] text-[#85631f]'
                        : 'border-slate-300 bg-white hover:border-slate-400'
                    }`}
                  >
                    {isAllScopesChecked ||
                    hasCommunityFullAccess ||
                    accessMode === 'COMMUNITY_FULL' ||
                    (accessMode === 'WORKSPACE_FULL' && isWorkspaceSelected) ? (
                      <Check size={13} strokeWidth={3} />
                    ) : isSomeScopesChecked ? (
                      <div className="h-2 w-2 rounded-sm bg-[#85631f]" />
                    ) : null}
                  </div>

                  <span
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                      isWorkspaceSelected
                        ? 'bg-[#071a33] text-[#e4c26f]'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    <Icon size={18} />
                  </span>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-sm text-[#071a33]">
                        {workspace.label}
                      </span>
                      <span className="text-xs font-semibold text-slate-400">
                        ({checkedScopesCount}/{workspaceScopes.length} permisos)
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 truncate max-w-lg hidden sm:block">
                      {workspace.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {hasCommunityFullAccess || accessMode === 'COMMUNITY_FULL' ? (
                    <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-700 ring-1 ring-emerald-200">
                      Integral (100%)
                    </span>
                  ) : accessMode === 'WORKSPACE_FULL' && isWorkspaceSelected ? (
                    <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-blue-700 ring-1 ring-blue-200">
                      Espacio Total
                    </span>
                  ) : checkedScopesCount > 0 ? (
                    <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#85631f] ring-1 ring-amber-200">
                      {checkedScopesCount} activo{checkedScopesCount > 1 ? 's' : ''}
                    </span>
                  ) : (
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Sin acceso
                    </span>
                  )}
                </div>
              </div>

              {/* Collapsible Scopes Child Grid */}
              {isExpanded && (
                <div className="border-t border-slate-100 bg-[#fcfaf7] p-4 rounded-b-2xl">
                  {workspaceScopes.length === 0 ? (
                    <p className="text-xs text-slate-400 italic">
                      No hay permisos individuales configurados para este espacio.
                    </p>
                  ) : (
                    <div className="grid gap-2 sm:grid-cols-2">
                      {workspaceScopes.map(scope => {
                        const isChecked =
                          hasCommunityFullAccess ||
                          accessMode === 'COMMUNITY_FULL' ||
                          (accessMode === 'WORKSPACE_FULL' && isWorkspaceSelected) ||
                          selectedScopes.includes(scope.code);

                        return (
                          <label
                            key={scope.code}
                            className={`flex items-start gap-3 rounded-xl border p-3 text-xs font-semibold transition select-none ${
                              isChecked
                                ? 'border-[#b08a3c] bg-white shadow-sm ring-1 ring-[#b08a3c]/15 text-[#071a33]'
                                : 'border-slate-200 bg-white/70 text-slate-500 hover:border-slate-300 hover:text-slate-700'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => onToggleScope(scope.code)}
                              disabled={accessMode !== 'CUSTOM'}
                              className="mt-0.5 h-4 w-4 accent-[#071a33] shrink-0 cursor-pointer disabled:cursor-not-allowed"
                            />
                            <div className="min-w-0 flex-1">
                              <span className="block font-bold text-sm text-[#071a33]">{scope.label}</span>
                              <span className="mt-1 block text-xs font-normal leading-4 text-slate-500">
                                {scope.description || 'Permiso operativo del espacio.'}
                              </span>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
