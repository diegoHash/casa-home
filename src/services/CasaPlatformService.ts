import axios, { type AxiosRequestConfig } from 'axios';
import type {
  ClientStanding,
  ClientLicense,
  LicensePaymentMethod,
  LicensePaymentRecord,
  LicenseStatus,
  PlatformClient,
  PlatformClientDetail,
} from '../domain/superAdmin';
import { casaApi, CasaAuthService } from './CasaAuthService';
import { RootSession } from './RootSession';

interface ApiLicense {
  id: string;
  status: string;
  autoRenewOnReconciliation: boolean;
  monthlyFee: string | number;
  currency: string;
  periodStart: string;
  periodEnd: string;
  graceUntil: string;
  graceDays?: number;
  isTrial?: boolean;
  trialFrom?: string | null;
  trialUntil?: string | null;
  lastReconciledAt: string | null;
  revokedAt: string | null;
}

interface ApiClient {
  id: string;
  name: string;
  legalName: string;
  rif: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  standing: string;
  onboardingProgress: number;
  joinedAt: string;
  updatedAt: string;
  community: {
    id: string;
    address: string;
    state: string;
    city: string;
    postalCode: string;
    activeLicense: ApiLicense | null;
    properties: Array<{
      id: string;
      code: string;
      kind: 'APARTMENT' | 'TOWNHOUSE' | 'COMMERCIAL';
      maximumOccupancy: number | null;
      braceletQuota: number;
      location: { name: string; code: string } | null;
    }>;
  } | null;
  licenses?: ApiLicense[];
  licensePayments?: Array<{
    id: string;
    licenseId: string;
    amount: string | number;
    exchangeRate: string | number;
    currency: 'USD' | 'VES' | 'EUR';
    paymentMethod: LicensePaymentMethod;
    reference: string;
    paidAt: string;
    notes: string | null;
    createdAt: string;
  }>;
}

export interface CreatePlatformClientInput {
  name: string;
  legalName: string;
  rif: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  state: string;
  city: string;
  postalCode: string;
  monthlyFee: number;
  onboardingProgress: number;
}

export interface CreatedPlatformClient {
  clientId: string;
  communityId: string;
  licenseId: string;
}

export interface CreateCommunityAccessInput {
  personId: string;
  roleCode: string;
  scopes: string[];
  workspaceCodes: string[];
  temporaryPassword?: string;
}

export interface AccessPersonnelRecord {
  employmentId: string;
  personId: string;
  firstName: string;
  lastName: string;
  documentType: 'V' | 'E' | 'J' | 'P';
  documentNumber: string;
  email: string | null;
  phone: string | null;
  position: string;
  department: string;
  engagementType: string;
  startsOn: string;
  hasCasaUser: boolean;
  loginEmail: string | null;
  access: CommunityAccessRecord | null;
  canCreateAccess: boolean;
  blockingReason: string | null;
}

export interface CommunityAccessRecord {
  id: string;
  roleCode: string;
  scopes: string[];
  status: string;
  employmentActive: boolean;
  workspaces: Array<{
    id: string;
    workspaceCode: string;
    status: string;
    startsOn: string;
    endsOn: string | null;
    endReason: string | null;
  }>;
  user: {
    id: string;
    email: string;
    status: string;
    lastAccessAt: string | null;
    person: {
      id?: string;
      firstName: string;
      lastName: string;
      documentType: string;
      documentNumber: string;
    } | null;
  };
}

export interface PlatformAuditRecord {
  id: string;
  communityId: string | null;
  actorUserId: string | null;
  requestId: string;
  action: string;
  entityType: string;
  entityId: string | null;
  detail: string;
  reason: string | null;
  before: unknown;
  after: unknown;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
  community: { id: string; name: string; clientId: string } | null;
  actor: {
    id: string;
    email: string;
    platformRole: string | null;
    person: {
      id: string;
      firstName: string;
      lastName: string;
      documentType: string;
      documentNumber: string;
    } | null;
  } | null;
}

const standingMap: Record<string, ClientStanding> = {
  ONBOARDING: 'onboarding',
  SOLVENT: 'solvent',
  DUE_SOON: 'due-soon',
  PAST_DUE: 'past-due',
  SUSPENDED: 'suspended',
};

const licenseMap: Record<string, LicenseStatus> = {
  ACTIVE: 'active',
  GRACE: 'grace',
  SUSPENDED: 'suspended',
  REVOKED: 'revoked',
  EXPIRED: 'expired',
};

function mapClient(client: ApiClient): PlatformClient {
  const license = client.community?.activeLicense;
  if (!license) {
    throw new Error(`El cliente ${client.name} no tiene licencia asociada.`);
  }
  return {
    id: client.id,
    name: client.name,
    legalName: client.legalName,
    rif: client.rif,
    location: [client.community?.city, client.community?.state]
      .filter(Boolean)
      .join(', '),
    contactName: client.contactName,
    contactEmail: client.contactEmail,
    contactPhone: client.contactPhone,
    standing: standingMap[client.standing] ?? 'onboarding',
    propertyCount: client.community?.properties.length ?? 0,
    composition: client.community?.properties.length
      ? `${client.community.properties.length} inmuebles registrados`
      : 'Estructura pendiente de levantamiento en el Núcleo CASA',
    onboardingProgress: client.onboardingProgress,
    joinedAt: client.joinedAt.slice(0, 10),
    lastActivityAt: client.updatedAt,
    license: {
      id: license.id,
      status: licenseMap[license.status] ?? 'expired',
      autoRenewOnReconciliation: license.autoRenewOnReconciliation,
      monthlyFee: Number(license.monthlyFee),
      currency: 'USD',
      periodStart: license.periodStart.slice(0, 10),
      periodEnd: license.periodEnd.slice(0, 10),
      graceUntil: license.graceUntil.slice(0, 10),
      graceDays: license.graceDays ?? 5,
      isTrial: license.isTrial ?? false,
      trialFrom: license.trialFrom,
      trialUntil: license.trialUntil,
      lastReconciledAt: license.lastReconciledAt,
      revokedAt: license.revokedAt,
    },
    communityId: client.community?.id ?? null,
    properties: (client.community?.properties ?? []).map((property) => ({
      id: property.id,
      code: property.code,
      kind:
        property.kind === 'TOWNHOUSE'
          ? 'townhouse'
          : property.kind === 'COMMERCIAL'
            ? 'commercial'
            : 'apartment',
      location: property.location
        ? `${property.location.name} · ${property.location.code}`
        : null,
      maximumOccupancy: property.maximumOccupancy,
      braceletQuota: property.braceletQuota,
    })),
  };
}

function mapLicense(license: ApiLicense): ClientLicense {
  return {
    id: license.id,
    status: licenseMap[license.status] ?? 'expired',
    autoRenewOnReconciliation: license.autoRenewOnReconciliation,
    monthlyFee: Number(license.monthlyFee),
    currency: (license.currency === 'EUR' || license.currency === 'VES' ? license.currency : 'USD') as ClientLicense['currency'],
    periodStart: license.periodStart.slice(0, 10),
    periodEnd: license.periodEnd.slice(0, 10),
    graceUntil: license.graceUntil.slice(0, 10),
    graceDays: license.graceDays ?? 5,
    isTrial: license.isTrial ?? false,
    trialFrom: license.trialFrom,
    trialUntil: license.trialUntil,
    lastReconciledAt: license.lastReconciledAt,
    revokedAt: license.revokedAt,
  };
}

async function refreshSession() {
  const refreshToken = RootSession.refreshToken();
  if (!refreshToken) throw new Error('La sesión de CASA venció.');
  const refreshed = await CasaAuthService.refresh(refreshToken);
  if (!refreshed.success) {
    RootSession.clear();
    throw new Error(refreshed.error);
  }
  RootSession.updateTokens(
    refreshed.data.accessToken,
    refreshed.data.refreshToken,
  );
  return refreshed.data.accessToken;
}

export async function authorizedRequest<T>(config: AxiosRequestConfig) {
  let accessToken = RootSession.token();
  if (!accessToken || RootSession.accessExpired()) {
    accessToken = await refreshSession();
  }
  try {
    return await casaApi.request<T>({
      ...config,
      headers: {
        ...config.headers,
        Authorization: `Bearer ${accessToken}`,
      },
    });
  } catch (error: unknown) {
    const status = axios.isAxiosError(error) ? error.response?.status : null;
    if (status !== 401) throw platformError(error);
    accessToken = await refreshSession();
    try {
      return await casaApi.request<T>({
        ...config,
        headers: {
          ...config.headers,
          Authorization: `Bearer ${accessToken}`,
        },
      });
    } catch (retryError) {
      throw platformError(retryError);
    }
  }
}

function platformError(error: unknown) {
  if (!axios.isAxiosError(error)) {
    return error instanceof Error
      ? error
      : new Error('CASA no pudo completar la operación.');
  }
  const message = error.response?.data?.message;
  if (Array.isArray(message)) return new Error(message.join(' '));
  if (typeof message === 'string') return new Error(message);
  if (!error.response) {
    return new Error('No fue posible conectar con CASA API.');
  }
  return new Error('CASA no pudo completar la operación solicitada.');
}

export const CasaPlatformService = {
  async listClients() {
    const { data } = await authorizedRequest<ApiClient[]>({
      method: 'GET',
      url: '/platform/clients',
    });
    return data.map(mapClient);
  },

  async createClient(input: CreatePlatformClientInput) {
    const { data } = await authorizedRequest<{
      client: { id: string };
      community: { id: string };
      license: { id: string };
    }>({
      method: 'POST',
      url: '/platform/clients',
      data: input,
    });
    return {
      clientId: data.client.id,
      communityId: data.community.id,
      licenseId: data.license.id,
    } satisfies CreatedPlatformClient;
  },

  async getClient(clientId: string): Promise<PlatformClientDetail> {
    const { data } = await authorizedRequest<ApiClient>({
      method: 'GET',
      url: `/platform/clients/${clientId}`,
    });
    const client = mapClient(data);
    return {
      ...client,
      licenses: (data.licenses ?? (data.community?.activeLicense ? [data.community.activeLicense] : [])).map(mapLicense),
      licensePayments: (data.licensePayments ?? []).map((payment): LicensePaymentRecord => ({
        id: payment.id,
        licenseId: payment.licenseId,
        amount: Number(payment.amount),
        exchangeRate: Number(payment.exchangeRate),
        currency: payment.currency,
        paymentMethod: payment.paymentMethod,
        reference: payment.reference,
        paidAt: payment.paidAt,
        notes: payment.notes,
        createdAt: payment.createdAt,
      })),
    };
  },

  async revokeLicense(clientId: string, reason: string) {
    await authorizedRequest({
      method: 'POST',
      url: `/platform/clients/${clientId}/license/revoke`,
      data: { reason },
    });
  },

  async updateAutoRenew(clientId: string, enabled: boolean) {
    await authorizedRequest({
      method: 'PATCH',
      url: `/platform/clients/${clientId}/license/auto-renew`,
      data: { enabled, reason: enabled ? 'Renovación automática activada desde CASA Control' : 'Renovación automática desactivada desde CASA Control' },
    });
  },

  async updateLicenseStatus(clientId: string, status: 'ACTIVE' | 'SUSPENDED', reason: string) {
    await authorizedRequest({
      method: 'PATCH',
      url: `/platform/clients/${clientId}/license/status`,
      data: { status, reason },
    });
  },

  async updateLicenseSettings(clientId: string, input: {
    autoRenewOnReconciliation?: boolean;
    isTrial?: boolean;
    trialFrom?: string;
    trialUntil?: string;
    graceDays?: number;
  }) {
    await authorizedRequest({
      method: 'PATCH',
      url: `/platform/clients/${clientId}/license/settings`,
      data: input,
    });
  },

  async createLicensePayment(clientId: string, input: {
    amount: number;
    exchangeRate: number;
    currency: 'USD' | 'VES' | 'EUR';
    paymentMethod: LicensePaymentMethod;
    reference: string;
    paidAt: string;
    notes?: string;
  }) {
    await authorizedRequest({
      method: 'POST',
      url: `/platform/clients/${clientId}/license/payments`,
      data: input,
    });
  },

  async toggleClientEnabled(clientId: string, enabled: boolean) {
    return authorizedRequest<PlatformClient>({
      method: 'PATCH',
      url: `/platform/clients/${clientId}/status`,
      data: {
        enabled,
        reason: enabled
          ? 'Activación manual desde CASA Control'
          : 'Desactivación manual desde CASA Control',
      },
    });
  },

  async createCommunityAccess(
    clientId: string,
    input: CreateCommunityAccessInput,
  ) {
    const { data } = await authorizedRequest<{
      access: { id: string; roleCode: string };
      createdUser: boolean;
    }>({
      method: 'POST',
      url: `/platform/clients/${clientId}/access-users`,
      data: input,
    });
    return data;
  },

  async listCommunityAccess(clientId: string) {
    const { data } = await authorizedRequest<CommunityAccessRecord[]>({
      method: 'GET',
      url: `/platform/clients/${clientId}/access-users`,
    });
    return data;
  },

  async listAuditEvents(communityId?: string) {
    const { data } = await authorizedRequest<PlatformAuditRecord[]>({
      method: 'GET',
      url: '/platform/clients/audit',
      params: communityId ? { communityId } : undefined,
    });
    return data;
  },

  async listAccessPersonnel(clientId: string) {
    const { data } = await authorizedRequest<AccessPersonnelRecord[]>({
      method: 'GET',
      url: `/platform/clients/${clientId}/access-personnel`,
    });
    return data;
  },

  async updateCommunityAccess(
    clientId: string,
    accessId: string,
    input: {
      roleCode: string;
      scopes: string[];
      workspaceCodes: string[];
      reason: string;
    },
  ) {
    const { data } = await authorizedRequest<CommunityAccessRecord>({
      method: 'PATCH',
      url: `/platform/clients/${clientId}/access-users/${accessId}`,
      data: input,
    });
    return data;
  },

  async updateCommunityWorkspaces(
    clientId: string,
    accessId: string,
    workspaceCodes: string[],
    reason: string,
  ) {
    const { data } = await authorizedRequest<CommunityAccessRecord>({
      method: 'PATCH',
      url: `/platform/clients/${clientId}/access-users/${accessId}/workspaces`,
      data: { workspaceCodes, reason },
    });
    return data;
  },

  async revokeCommunityAccess(
    clientId: string,
    accessId: string,
    reason: string,
  ) {
    const { data } = await authorizedRequest<CommunityAccessRecord>({
      method: 'POST',
      url: `/platform/clients/${clientId}/access-users/${accessId}/revoke`,
      data: { reason },
    });
    return data;
  },
};
