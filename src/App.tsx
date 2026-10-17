import { useEffect, useLayoutEffect, useState } from 'react';
import { Link, Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';

import './index.css';
import { HeroSection } from '@/components/blocks/hero-section-5';
import Conferences from './pages/Conferences';
import CommunityWorkspace from './pages/CommunityWorkspace';
import ContextSelection from './pages/ContextSelection';
import WorkspaceSelection from './pages/WorkspaceSelection';
import DemoRequest from './pages/DemoRequest';
import Login from './pages/Login';
import OwnerLogin from './pages/OwnerLogin';
import OwnerPortal from './pages/OwnerPortal';
import PrivacyPolicy from './pages/PrivacyPolicy';
import PasswordReset from './pages/PasswordReset';
import SuperAdmin from './pages/SuperAdmin';
import SuperAdminClientPage from './pages/SuperAdminClientPage';
import TermsOfService from './pages/TermsOfService';
import { RootSession } from './services/RootSession';
import { StaffSession } from './services/StaffSession';
import { CasaAuthService } from './services/CasaAuthService';
import { SessionTimeoutGuard } from './components/auth/SessionTimeoutGuard';
import WorkspaceSwitcher from './components/workspace/WorkspaceSwitcher';
import { workspaceIsEnabled } from './config/workspaceCatalog';
import { BuildLabel } from './components/core/BuildLabel';

function PublicDocumentLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-[#0a0a0a]">
    <header className="fixed left-0 right-0 top-0 z-50 border-b border-white/10 bg-[#0a0a0a]/85 backdrop-blur-xl">
      <nav className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4 text-sm text-white/70">
        <Link to="/" className="font-semibold text-white">CASA</Link>
        <div className="flex items-center gap-5">
          <Link to="/privacy" className="transition hover:text-white">Política de privacidad</Link>
          <Link to="/terms" className="transition hover:text-white">Términos y condiciones</Link>
          <Link to="/login" className="rounded-md border border-white/15 px-3 py-2 text-white transition hover:border-white/40">Iniciar sesión</Link>
        </div>
      </nav>
    </header>
    {children}
  </div>;
}

function ScrollToTop() {
  const { pathname } = useLocation();
  useLayoutEffect(() => {
    const root = document.documentElement;
    const previousScrollBehavior = root.style.scrollBehavior;
    root.style.scrollBehavior = 'auto';
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    root.style.scrollBehavior = previousScrollBehavior;
  }, [pathname]);
  return null;
}

function RootOnlyRoute({ children }: { children: React.ReactNode }) {
  const localPreview =
    import.meta.env.DEV &&
    new URLSearchParams(window.location.search).get('demo') === '1';
  const [status, setStatus] = useState<
    'checking' | 'authorized' | 'denied'
  >(localPreview ? 'authorized' : 'checking');

  useEffect(() => {
    if (localPreview) return;
    let active = true;

    const validate = async () => {
      const params = new URLSearchParams(window.location.search);
      const urlToken = params.get('sso');
      if (urlToken && !RootSession.token()) RootSession.save(urlToken, null);

      let accessToken = RootSession.token();
      if (!accessToken) {
        if (active) setStatus('denied');
        return;
      }

      if (RootSession.accessExpired()) {
        const refreshToken = RootSession.refreshToken();
        if (!refreshToken) {
          RootSession.clear();
          if (active) setStatus('denied');
          return;
        }
        const refreshed = await CasaAuthService.refresh(refreshToken);
        if (!refreshed.success) {
          RootSession.clear();
          if (active) setStatus('denied');
          return;
        }
        accessToken = refreshed.data.accessToken;
        RootSession.updateTokens(
          refreshed.data.accessToken,
          refreshed.data.refreshToken,
        );
      }

      const identity = await CasaAuthService.me(accessToken);
      if (
        !identity.success ||
        identity.data.user.platformRole !== 'ROOT'
      ) {
        RootSession.clear();
        if (active) setStatus('denied');
        return;
      }
      RootSession.save(
        RootSession.token() || accessToken,
        identity.data.user,
        RootSession.refreshToken(),
      );
      if (active) setStatus('authorized');
    };

    void validate();
    return () => {
      active = false;
    };
  }, [localPreview]);

  if (status === 'denied') {
    return (
      <Navigate
        to="/"
        replace
        state={{ reason: 'root-required' }}
      />
    );
  }
  if (status === 'checking') {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f4f1e9] text-[#071a33]">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-[#071a33]/15 border-t-[#b08a3c]" />
          <p className="mt-4 text-sm font-semibold">Validando acceso seguro…</p>
        </div>
      </main>
    );
  }
  return children;
}

function StaffOnlyRoute({
  children,
  requireContext = true,
  requireWorkspace = false,
}: {
  children: React.ReactNode;
  requireContext?: boolean;
  requireWorkspace?: boolean;
}) {
  const [status, setStatus] = useState<'checking' | 'authorized' | 'denied' | 'root'>(
    'checking',
  );

  useEffect(() => {
    let active = true;
    const validate = async () => {
      let accessToken = StaffSession.token();
      if (!accessToken || !StaffSession.refreshToken()) {
        if (active) setStatus('denied');
        return;
      }

      if (StaffSession.accessExpired()) {
        const refreshed = await CasaAuthService.refresh(
          StaffSession.refreshToken(),
          StaffSession.context()?.communityId,
        );
        if (!refreshed.success) {
          StaffSession.clear();
          if (active) setStatus('denied');
          return;
        }
        accessToken = refreshed.data.accessToken;
        StaffSession.updateTokens(
          refreshed.data.accessToken,
          refreshed.data.refreshToken,
        );
      }

      const identity = await CasaAuthService.me(accessToken);
      if (!identity.success) {
        StaffSession.clear();
        if (active) setStatus('denied');
        return;
      }
      if (identity.data.user.platformRole === 'ROOT') {
        const refreshToken = StaffSession.refreshToken();
        const currentAccessToken = StaffSession.token() || accessToken;
        StaffSession.clear();
        RootSession.save(currentAccessToken, identity.data.user, refreshToken);
        if (active) setStatus('root');
        return;
      }
      if (requireContext) {
        const localContext = StaffSession.context();
        if (
          !localContext ||
          identity.data.selectedContext?.communityId !==
            localContext.communityId
        ) {
          StaffSession.clearContext();
          if (active) setStatus('denied');
          return;
        }
        if (requireWorkspace) {
          const selectedWorkspace = StaffSession.workspace();
          const grantedWorkspaces = localContext.workspaces ?? [];
          if (
            !selectedWorkspace ||
            !workspaceIsEnabled(selectedWorkspace) ||
            (!grantedWorkspaces.includes('*') &&
              !grantedWorkspaces.includes(selectedWorkspace))
          ) {
            StaffSession.clearWorkspace();
            if (active) setStatus('denied');
            return;
          }
        }
      }
      if (active) setStatus('authorized');
    };
    void validate();
    return () => {
      active = false;
    };
  }, [requireContext, requireWorkspace]);

  if (status === 'root') {
    return <Navigate to="/dashboard" replace />;
  }
  if (status === 'denied') {
    const target = !StaffSession.token()
      ? '/staff-login'
      : !StaffSession.context()
        ? '/seleccionar-comunidad'
        : '/seleccionar-espacio';
    return (
      <Navigate
        to={target}
        replace
      />
    );
  }
  if (status === 'checking') {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f4f1e9] text-[#071a33]">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-[#071a33]/15 border-t-[#b08a3c]" />
          <p className="mt-4 text-sm font-semibold">Validando acceso seguro…</p>
        </div>
      </main>
    );
  }
  return children;
}

export default function App() {
  const navigate = useNavigate();

  useEffect(() => {
    if (
      RootSession.isRoot() &&
      ['/', '/login', '/staff-login', '/control-login'].includes(
        window.location.pathname,
      )
    ) {
      navigate('/dashboard', { replace: true });
      return;
    }
    const params = new URLSearchParams(window.location.search);
    const recoveryToken = params.get('recoveryToken');
    if (recoveryToken && window.location.pathname !== '/staff-login') {
      navigate(`/staff-login?recoveryToken=${encodeURIComponent(recoveryToken)}`, { replace: true });
    }
  }, [navigate]);

  return (
    <SessionTimeoutGuard>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<HeroSection onLoginClick={() => navigate('/login')} />} />
        <Route path="/login" element={<OwnerLogin />} />
        <Route path="/portal" element={<OwnerPortal />} />
        <Route path="/staff-login" element={<Login />} />
        <Route
          path="/seleccionar-comunidad"
          element={<StaffOnlyRoute requireContext={false}><ContextSelection /></StaffOnlyRoute>}
        />
        <Route
          path="/seleccionar-espacio"
          element={<StaffOnlyRoute><WorkspaceSelection /></StaffOnlyRoute>}
        />
        <Route
          path="/workspace"
          element={<StaffOnlyRoute requireWorkspace><CommunityWorkspace /></StaffOnlyRoute>}
        />
        <Route
          path="/workspace/inmuebles/:propertyId/editar"
          element={<StaffOnlyRoute requireWorkspace><CommunityWorkspace /></StaffOnlyRoute>}
        />
        <Route path="/control-login" element={<Navigate to="/" replace />} />
        <Route path="/restablecer-clave" element={<PasswordReset />} />
        <Route path="/dashboard" element={<RootOnlyRoute><SuperAdmin /></RootOnlyRoute>} />
        <Route path="/dashboard/clientes/:clientId" element={<RootOnlyRoute><SuperAdminClientPage /></RootOnlyRoute>} />
        <Route path="/settings" element={<RootOnlyRoute><SuperAdmin /></RootOnlyRoute>} />
        <Route path="/privacy" element={<PublicDocumentLayout><PrivacyPolicy /></PublicDocumentLayout>} />
        <Route path="/terms" element={<PublicDocumentLayout><TermsOfService /></PublicDocumentLayout>} />
        <Route path="/conferencias" element={<Conferences />} />
        <Route path="/conferencias/:roomId" element={<Conferences />} />
        <Route path="/solicitar-demo" element={<DemoRequest />} />
      </Routes>
      <WorkspaceSwitcher />
      <BuildLabel />
    </SessionTimeoutGuard>
  );
}
