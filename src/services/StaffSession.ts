import type { CasaUser, CommunityContext } from './CasaAuthService';

const ACCESS_KEY = 'casa_staff_access_token';
const REFRESH_KEY = 'casa_staff_refresh_token';
const USER_KEY = 'casa_staff_user';
const CONTEXT_KEY = 'casa_staff_context';
const WORKSPACE_KEY = 'casa_staff_workspace';

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

export const StaffSession = {
  saveIdentity(accessToken: string, refreshToken: string, user: CasaUser) {
    sessionStorage.setItem(ACCESS_KEY, accessToken);
    sessionStorage.setItem(REFRESH_KEY, refreshToken);
    sessionStorage.setItem(USER_KEY, JSON.stringify(user));
  },
  selectContext(accessToken: string, context: CommunityContext) {
    sessionStorage.setItem(ACCESS_KEY, accessToken);
    sessionStorage.setItem(CONTEXT_KEY, JSON.stringify(context));
    sessionStorage.removeItem(WORKSPACE_KEY);
  },
  updateContext(context: CommunityContext) {
    sessionStorage.setItem(CONTEXT_KEY, JSON.stringify(context));
  },
  selectWorkspace(workspaceCode: string) {
    sessionStorage.setItem(WORKSPACE_KEY, workspaceCode);
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
  },
  token: () => sessionStorage.getItem(ACCESS_KEY) || '',
  refreshToken: () => sessionStorage.getItem(REFRESH_KEY) || '',
  user: () => read<CasaUser>(USER_KEY),
  context: () => read<CommunityContext>(CONTEXT_KEY),
  workspace: () => sessionStorage.getItem(WORKSPACE_KEY) || '',
  accessExpired() {
    const claims = decodeJwt(this.token());
    const expiration =
      typeof claims?.exp === 'number' ? claims.exp * 1000 : null;
    return !expiration || expiration <= Date.now();
  },
};
