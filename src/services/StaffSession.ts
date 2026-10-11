import type { CasaUser, CommunityContext } from './CasaAuthService';
import {
  normalizeWorkspaceCode,
  normalizeWorkspaceCodes,
} from '../config/workspaceCatalog';

const ACCESS_KEY = 'casa_staff_access_token';
const REFRESH_KEY = 'casa_staff_refresh_token';
const USER_KEY = 'casa_staff_user';
const CONTEXT_KEY = 'casa_staff_context';
const WORKSPACE_KEY = 'casa_staff_workspace';
const ACTIVITY_KEY = 'casa_last_activity';

function decodeJwt(token: string): Record<string, unknown> | null {
  try {
    const payload = token.split('.')[1];
    if (!payload) return null;
    return JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
  } catch {
    return null;
  }
}

function read<T>(key: string): T | null {
  try {
    return JSON.parse(sessionStorage.getItem(key) || 'null') as T | null;
  } catch {
    return null;
  }
}

function normalizeContext(context: CommunityContext): CommunityContext {
  const workspaces = normalizeWorkspaceCodes(context.workspaces);
  return context.workspaces.length === workspaces.length &&
    context.workspaces.every((workspace, index) => workspace === workspaces[index])
    ? context
    : { ...context, workspaces };
}

export const StaffSession = {
  saveIdentity(accessToken: string, refreshToken: string, user: CasaUser) {
    sessionStorage.setItem(ACCESS_KEY, accessToken);
    sessionStorage.setItem(REFRESH_KEY, refreshToken);
    sessionStorage.setItem(USER_KEY, JSON.stringify(user));
  },
  selectContext(accessToken: string, context: CommunityContext) {
    sessionStorage.setItem(ACCESS_KEY, accessToken);
    sessionStorage.setItem(CONTEXT_KEY, JSON.stringify(normalizeContext(context)));
    sessionStorage.removeItem(WORKSPACE_KEY);
  },
  updateContext(context: CommunityContext) {
    sessionStorage.setItem(CONTEXT_KEY, JSON.stringify(normalizeContext(context)));
  },
  selectWorkspace(workspaceCode: string) {
    sessionStorage.setItem(WORKSPACE_KEY, workspaceCode);
    window.dispatchEvent(new CustomEvent('casa:workspace-changed'));
  },
  clearWorkspace() {
    sessionStorage.removeItem(WORKSPACE_KEY);
  },
  updateTokens(accessToken: string, refreshToken: string) {
    sessionStorage.setItem(ACCESS_KEY, accessToken);
    sessionStorage.setItem(REFRESH_KEY, refreshToken);
  },
  clearContext() {
    sessionStorage.removeItem(CONTEXT_KEY);
    sessionStorage.removeItem(WORKSPACE_KEY);
  },
  clear() {
    sessionStorage.removeItem(ACCESS_KEY);
    sessionStorage.removeItem(REFRESH_KEY);
    sessionStorage.removeItem(USER_KEY);
    sessionStorage.removeItem(CONTEXT_KEY);
    sessionStorage.removeItem(WORKSPACE_KEY);
    sessionStorage.removeItem(ACTIVITY_KEY);
  },
  token: () => sessionStorage.getItem(ACCESS_KEY) || '',
  refreshToken: () => sessionStorage.getItem(REFRESH_KEY) || '',
  lastActivityAt: () => Number(sessionStorage.getItem(ACTIVITY_KEY)) || Date.now(),
  touch: () => sessionStorage.setItem(ACTIVITY_KEY, String(Date.now())),
  user: () => read<CasaUser>(USER_KEY),
  context: () => {
    const stored = read<CommunityContext>(CONTEXT_KEY);
    if (!stored) return null;
    const normalized = normalizeContext(stored);
    if (normalized !== stored) {
      sessionStorage.setItem(CONTEXT_KEY, JSON.stringify(normalized));
    }
    return normalized;
  },
  workspace: () => {
    const stored = sessionStorage.getItem(WORKSPACE_KEY) || '';
    const normalized = normalizeWorkspaceCode(stored);
    if (stored && stored !== normalized) sessionStorage.setItem(WORKSPACE_KEY, normalized);
    return normalized;
  },
  accessExpiresAt() {
    const claims = decodeJwt(this.token());
    return typeof claims?.exp === 'number' ? claims.exp * 1000 : null;
  },
  accessExpired() {
    const expiration = this.accessExpiresAt();
    return !expiration || expiration <= Date.now();
  },
};
