import axios from 'axios';

/**
 * ============================================================================
 * CLIENTE HTTP OFICIAL DE CASA (casaApi)
 * ============================================================================
 * `casaApi` es una instancia pre-configurada del cliente de red Axios.
 *
 * - ¿Para qué sirve?: Permite que cualquier componente React de la interfaz (casa-home)
 *   envíe peticiones HTTP (GET, POST, PATCH) al servidor backend NestJS (casa-api).
 * - Ruta base predeterminada: `http://localhost:3001/v1` en entorno local.
 * - Parámetros: Tiempo límite de espera de 15 segundos y formato de datos JSON.
 * ============================================================================
 */
const CASA_API_URL =
  import.meta.env.VITE_CASA_API_URL ||
  '/v1';

export const casaApi = axios.create({
  baseURL: CASA_API_URL,
  timeout: 15_000,
});

export interface CasaUser {
  id: string;
  email: string;
  platformRole: string | null;
  status: string;
  lastAccessAt: string | null;
  person: {
    firstName: string;
    lastName: string;
    documentType: string;
    documentNumber: string;
  } | null;
}

export interface CommunityContext {
  communityId: string;
  name: string;
  legalName: string;
  rif: string;
  address?: string;
  status: string;
  roleCode: string;
  relationTypes?: Array<
    'OWNER' | 'STAFF' | 'BOARD_MEMBER' | 'ADMINISTRATOR' | 'PLATFORM_ROOT'
  >;
  scopes: string[];
  workspaces: string[];
  standing?: string;
  license?: {
    status: string;
    periodEnd: string;
  } | null;
}

export interface CasaLoginResponse {
  accessToken: string;
  expiresIn: number;
  refreshToken: string;
  refreshExpiresAt: string;
  user: CasaUser;
}

interface RefreshResponse {
  accessToken: string;
  expiresIn: number;
  refreshToken: string;
  refreshExpiresAt: string;
}

export function casaErrorMessage(error: unknown, fallback: string) {
  if (!axios.isAxiosError(error)) return fallback;
  if (error.code === 'ECONNABORTED') {
    return 'CASA está tardando demasiado en responder. Intenta nuevamente.';
  }
  if (!error.response) {
    return 'No fue posible conectar con CASA. Verifica que la API esté activa.';
  }
  if (error.response.status === 403) {
    return (
      error.response.data?.message ||
      'Acceso Denegado (403): No tienes permisos suficientes para realizar esta operación.'
    );
  }
  const message = error.response.data?.message;
  return Array.isArray(message) ? message.join(' ') : message || fallback;
}

export const CasaAuthService = {
  async requestPasswordReset(email: string, type?: string) {
    try {
      await casaApi.post('/auth/password-reset/request', {
        email: email.trim().toLowerCase(),
        type,
      });
      return { success: true as const };
    } catch (error) {
      return {
        success: false as const,
        error: casaErrorMessage(
          error,
          'No fue posible procesar la recuperación.',
        ),
      };
    }
  },

  async resetPassword(input: {
    token?: string;
    email?: string;
    pin?: string;
    newPassword: string;
  }) {
    try {
      await casaApi.post('/auth/password-reset/complete', input);
      return { success: true as const };
    } catch (error) {
      return {
        success: false as const,
        error: casaErrorMessage(
          error,
          'No fue posible restablecer la contraseña.',
        ),
      };
    }
  },

  async login(email: string, password: string) {
    try {
      const { data } = await casaApi.post<CasaLoginResponse>('/auth/login', {
        email: email.trim().toLowerCase(),
        password,
      });
      return { success: true as const, data };
    } catch (error) {
      return {
        success: false as const,
        error: casaErrorMessage(error, 'Correo o contraseña incorrectos.'),
      };
    }
  },

  async refresh(refreshToken: string, communityId?: string) {
    try {
      const { data } = await casaApi.post<RefreshResponse>('/auth/refresh', {
        refreshToken,
        communityId,
      });
      return { success: true as const, data };
    } catch (error) {
      return {
        success: false as const,
        error: casaErrorMessage(
          error,
          'La sesión venció. Inicia sesión nuevamente.',
        ),
      };
    }
  },

  async me(accessToken: string) {
    try {
      const { data } = await casaApi.get<{
        user: CasaUser;
        selectedContext: {
          communityId: string;
          roleCode: string;
          scopes: string[];
          workspaces: string[];
        } | null;
      }>('/auth/me', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      return { success: true as const, data };
    } catch (error) {
      return {
        success: false as const,
        error: casaErrorMessage(error, 'No fue posible validar la sesión.'),
      };
    }
  },

  async contexts(accessToken: string) {
    try {
      const { data } = await casaApi.get<CommunityContext[]>('/auth/contexts', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      return { success: true as const, data };
    } catch (error) {
      return {
        success: false as const,
        error: casaErrorMessage(
          error,
          'No fue posible consultar tus comunidades.',
        ),
      };
    }
  },

  async selectContext(accessToken: string, communityId: string) {
    try {
      const { data } = await casaApi.post<{
        accessToken: string;
        expiresIn: number;
      }>(
        '/auth/select-context',
        { communityId },
        { headers: { Authorization: `Bearer ${accessToken}` } },
      );
      return { success: true as const, data };
    } catch (error) {
      return {
        success: false as const,
        error: casaErrorMessage(error, 'No fue posible abrir esta comunidad.'),
      };
    }
  },

  async logout(refreshToken: string) {
    if (!refreshToken) return;
    try {
      await casaApi.post('/auth/logout', { refreshToken });
    } catch {
      // La sesión local se elimina aunque el token ya haya sido revocado.
    }
  },
};
