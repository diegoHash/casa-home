const TOKEN_KEY = 'sso_token';
const USER_KEY = 'sso_user';

function decodeJwt(token: string): Record<string, unknown> | null {
  try {
    const payload = token.split('.')[1];
    if (!payload) return null;
    return JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
  } catch {
    return null;
  }
}

function readRole(value: unknown): string {
  if (!value || typeof value !== 'object') return '';
  const data = value as Record<string, unknown>;
  const role = data.role ?? data.userRole ?? data.authority;
  if (typeof role === 'string') return role.replace(/^ROLE_/, '').toUpperCase();
  if (data.user) return readRole(data.user);
  if (Array.isArray(data.roles)) return String(data.roles[0] ?? '').replace(/^ROLE_/, '').toUpperCase();
  if (Array.isArray(data.authorities)) return String(data.authorities[0] ?? '').replace(/^ROLE_/, '').toUpperCase();
  return '';
}

export const RootSession = {
  save(token: string, user: unknown) {
    sessionStorage.setItem(TOKEN_KEY, token);
    sessionStorage.setItem(USER_KEY, JSON.stringify(user));
  },
  clear() {
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(USER_KEY);
  },
  token() {
    return sessionStorage.getItem(TOKEN_KEY) || '';
  },
  isRoot() {
    const token = this.token();
    if (!token) return false;
    const claims = decodeJwt(token);
    const expiration = typeof claims?.exp === 'number' ? claims.exp * 1000 : null;
    if (expiration && expiration <= Date.now()) return false;
    let storedUser: unknown = null;
    try { storedUser = JSON.parse(sessionStorage.getItem(USER_KEY) || 'null'); } catch { /* invalid session */ }
    return readRole(storedUser) === 'ROOT' || readRole(claims) === 'ROOT';
  },
};
