export type ClientStanding = 'solvent' | 'due-soon' | 'past-due' | 'suspended' | 'onboarding';
export type LicenseStatus = 'active' | 'grace' | 'suspended' | 'revoked' | 'expired';
export type PaymentStatus = 'pending' | 'reconciled' | 'rejected';

export interface ClientLicense {
  status: LicenseStatus;
  autoRenewOnReconciliation: boolean;
  monthlyFee: number;
  currency: 'USD';
  periodStart: string;
  periodEnd: string;
  graceUntil: string;
  lastReconciledAt: string | null;
  revokedAt: string | null;
}

export interface PlatformClient {
  id: string;
  name: string;
  legalName: string;
  rif: string;
  location: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  standing: ClientStanding;
  propertyCount: number;
  composition: string;
  onboardingProgress: number;
  joinedAt: string;
  lastActivityAt: string;
  license: ClientLicense;
  communityId?: string | null;
  properties: Array<{
    id: string;
    code: string;
    kind: 'apartment' | 'townhouse' | 'commercial';
    location: string | null;
    maximumOccupancy: number | null;
    braceletQuota: number;
  }>;
}

export interface LicensePayment {
  id: string;
  clientId: string;
  reference: string;
  amount: number;
  currency: 'USD';
  bank: string;
  reportedAt: string;
  reconciledAt: string | null;
  status: PaymentStatus;
}

export interface PlatformUser {
  id: string;
  name: string;
  email: string;
  role: 'ROOT' | 'OPERACIONES' | 'FINANZAS' | 'SOPORTE' | 'AUDITOR';
  scope: string;
  status: 'active' | 'invited' | 'blocked';
  lastAccessAt: string | null;
}

export interface PlatformAuditEvent {
  id: string;
  action: string;
  actor: string;
  target: string;
  detail: string;
  severity: 'info' | 'warning' | 'critical';
  createdAt: string;
}

export interface SuperAdminState {
  clients: PlatformClient[];
  payments: LicensePayment[];
  users: PlatformUser[];
  audit: PlatformAuditEvent[];
}
