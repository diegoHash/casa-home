export type ClientStanding = 'solvent' | 'due-soon' | 'past-due' | 'suspended' | 'onboarding';
export type LicenseStatus = 'active' | 'grace' | 'suspended' | 'revoked' | 'expired';
export type PaymentStatus = 'pending' | 'reconciled' | 'rejected';
export type LicensePaymentMethod = 'BANK_TRANSFER' | 'MOBILE_PAYMENT' | 'CASH' | 'OTHER';
export type LicenseBillingStatus = 'current' | 'due-soon' | 'overdue';

export interface ClientLicense {
  id?: string;
  status: LicenseStatus;
  autoRenewOnReconciliation: boolean;
  monthlyFee: number;
  currency: 'USD' | 'VES' | 'EUR';
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

export interface LicensePaymentRecord {
  id: string;
  licenseId?: string;
  amount: number;
  exchangeRate: number;
  currency: 'USD' | 'VES' | 'EUR';
  paymentMethod: LicensePaymentMethod;
  reference: string;
  paidAt: string;
  notes?: string | null;
  createdAt: string;
}

export interface PlatformClientDetail extends PlatformClient {
  licenses: ClientLicense[];
  licensePayments: LicensePaymentRecord[];
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
  currency: 'USD' | 'VES' | 'EUR';
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
