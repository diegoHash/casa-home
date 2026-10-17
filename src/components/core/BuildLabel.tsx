import { useEffect, useState } from 'react';
import { casaApi } from '../../services/CasaAuthService';

type HealthResponse = { build?: string };

function shortSha(value: string | null) {
  if (!value || value === 'unknown' || value === 'local') return value ?? '…';
  return value.slice(0, 7);
}

export function BuildLabel() {
  const [apiBuild, setApiBuild] = useState<string | null>(null);
  const frontendBuild = __CASA_BUILD_SHA__ || 'local';

  useEffect(() => {
    let active = true;
    const refreshApiBuild = async () => {
      try {
        const { data } = await casaApi.get<HealthResponse>('/health', { timeout: 5_000 });
        if (active) setApiBuild(data.build || 'unknown');
      } catch {
        if (active) setApiBuild('unavailable');
      }
    };

    void refreshApiBuild();
    const interval = window.setInterval(() => void refreshApiBuild(), 60_000);
    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, []);

  const title = `Frontend: ${frontendBuild}\nAPI: ${apiBuild ?? 'consultando…'}`;
  return (
    <div
      title={title}
      aria-label={`Versión de CASA. Frontend ${shortSha(frontendBuild)}; API ${shortSha(apiBuild)}`}
      className="pointer-events-none fixed bottom-2 right-2 z-[100] rounded-md border border-white/15 bg-slate-950/85 px-2 py-1 font-mono text-[9px] leading-none text-white/80 shadow-lg backdrop-blur-sm"
    >
      CASA · web {shortSha(frontendBuild)} · api {shortSha(apiBuild)}
    </div>
  );
}
