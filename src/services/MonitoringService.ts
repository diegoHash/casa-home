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
  async openStream(onError: (error: MonitoringError) => void, onState: (state: 'connecting' | 'live' | 'reconnecting' | 'unauthorized') => void, filters: { kind?: string; communityId?: string; userId?: string; from?: string; to?: string }) {
    let controller: AbortController | undefined;
    let stopped = false;
    let retry: number | undefined;
    let retryDelay = 3000;
    let recoveredUnauthorizedOnce = false;
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
    const url = urlFor();
    const connect = async () => {
      if (stopped) return;
      onState(retryDelay === 3000 ? 'connecting' : 'reconnecting');
      controller = new AbortController();
      try {
        const response = await fetch(url, {
          headers: { ...authConfig().headers, Accept: 'text/event-stream' },
          signal: controller.signal,
        });
        if (response.status === 401 || response.status === 403) {
          if (response.status === 401 && !recoveredUnauthorizedOnce) {
            recoveredUnauthorizedOnce = true;
            try {
              // This authenticated Axios request runs the shared refresh flow.
              await MonitoringService.dashboard();
              if (!stopped) { void connect(); return; }
            } catch { /* the session refresh interceptor will report expiry */ }
          }
          onState('unauthorized');
          return;
        }
        if (!response.ok || !response.body) throw new Error(`No se pudo abrir el monitoreo (${response.status}).`);

        onState('live');
        recoveredUnauthorizedOnce = false;
        retryDelay = 3000;
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        while (!stopped) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const frames = buffer.split(/\r?\n\r?\n/);
          buffer = frames.pop() ?? '';
          for (const frame of frames) {
            const lines = frame.split(/\r?\n/);
            const eventType = lines.find(line => line.startsWith('event:'))?.slice(6).trim();
            const data = lines.filter(line => line.startsWith('data:')).map(line => line.slice(5).trimStart()).join('\n');
            if (eventType === 'error' && data) {
              try { onError(JSON.parse(data) as MonitoringError); } catch { /* ignore malformed stream events */ }
            }
          }
        }
        if (!stopped) throw new Error('El flujo de monitoreo se cerró.');
      } catch {
        if (stopped || controller.signal.aborted) return;
        onState('reconnecting');
        retry = window.setTimeout(connect, retryDelay);
        retryDelay = Math.min(retryDelay * 2, 30_000);
      }
    };
    void connect();
    return { close() { stopped = true; controller?.abort(); if (retry) window.clearTimeout(retry); } };
  },
};
