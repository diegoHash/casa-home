import { casaApi } from './CasaAuthService';
import { RootSession } from './RootSession';

export interface MonitoringError {
  id: string; occurredAt: string; statusCode: number; method: string; path: string;
  message: string; stack: string | null; stackTruncated: boolean; requestId: string;
  ipAddress: string | null; userId: string | null; userEmail: string | null;
  communityId: string | null; communityName: string | null;
}
export interface MonitoringSnapshot {
  services: { api: { status: string; checkedAt: string }; database: { status: string; checkedAt: string } };
  sessions: { active: number; uniqueUsers: number };
  errors: { retained: number; last24Hours: number };
  retentionDays: number;
  generatedAt: string;
}

const authConfig = () => ({ headers: { Authorization: `Bearer ${RootSession.token()}` } });

export const MonitoringService = {
  async dashboard() {
    return (await casaApi.get<MonitoringSnapshot>('/monitoring/dashboard', authConfig())).data;
  },
  async errors(filters: { from?: string; to?: string; kind?: string; communityId?: string; userId?: string }) {
    const params: Record<string, string> = {};
    if (filters.from) params.from = filters.from;
    if (filters.to) params.to = filters.to;
    if (filters.kind === 'client') params.kind = 'client';
    if (filters.kind === 'server') params.kind = 'server';
    if (filters.communityId) params.communityId = filters.communityId;
    if (filters.userId) params.userId = filters.userId;
    return (await casaApi.get<MonitoringError[]>('/monitoring/errors', { ...authConfig(), params })).data;
  },
  async communities() {
    return (await casaApi.get<Array<{ id: string; name: string }>>('/monitoring/filters/communities', authConfig())).data;
  },
  async users() {
    return (await casaApi.get<Array<{ id: string; email: string }>>('/monitoring/filters/users', authConfig())).data;
  },
  async openStream(onError: (error: MonitoringError) => void, onState: (state: 'live' | 'reconnecting') => void, filters: { kind?: string; communityId?: string; userId?: string; from?: string; to?: string }) {
    let source: EventSource | undefined;
    let stopped = false;
    let retry: number | undefined;
    const params = new URLSearchParams();
    if (filters.kind) params.set('kind', filters.kind);
    if (filters.communityId) params.set('communityId', filters.communityId);
    if (filters.userId) params.set('userId', filters.userId);
    if (filters.from) params.set('from', filters.from);
    if (filters.to) params.set('to', filters.to);
    const urlFor = () => {
      const base = casaApi.defaults.baseURL || '/v1';
      const url = new URL(`${base.replace(/\/$/, '')}/monitoring/events`, window.location.origin);
      if (params.toString()) url.search = params.toString();
      return url;
    };
    const connect = async () => {
      try {
        const grant = (await casaApi.post<{ token: string }>('/monitoring/stream-token', {}, authConfig())).data;
        if (stopped) return;
        const url = urlFor();
        url.searchParams.set('token', grant.token);
        source = new EventSource(url.toString());
        source.addEventListener('error', event => {
          try { onError(JSON.parse((event as MessageEvent).data) as MonitoringError); } catch { /* native connection error */ }
        });
        source.onopen = () => onState('live');
        source.onerror = () => { onState('reconnecting'); source?.close(); if (!stopped) retry = window.setTimeout(connect, 3000); };
      } catch { onState('reconnecting'); if (!stopped) retry = window.setTimeout(connect, 5000); }
    };
    await connect();
    return { close() { stopped = true; source?.close(); if (retry) window.clearTimeout(retry); } };
  },
};
