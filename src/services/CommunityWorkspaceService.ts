import axios from 'axios';
import {
  casaApi,
  casaErrorMessage,
  CasaAuthService,
} from './CasaAuthService';
import { StaffSession } from './StaffSession';
import type {
  AccessPersonnelRecord,
  CommunityAccessRecord,
  CreateCommunityAccessInput,
} from './CasaPlatformService';

export interface CoreSnapshot {
  id: string;
  name: string;
  legalName: string;
  rif: string;
  phone: string;
  email: string;
  address: string;
  state: string;
  city: string;
  status: string;
  administrationMode: string;
  locations: Array<{ id: string; code: string; name: string; kind: string }>;
  properties: Array<{
    id: string;
    code: string;
    kind: string;
    status: string;
    currentAliquot: string | null;
    locationId: string | null;
    location: { id: string; code: string; name: string; kind: string } | null;
    maximumOccupancy: number | null;
    braceletQuota: number;
    parkingSpace: string | null;
    parkingCapacity: number | null;
  }>;
  people: Array<{
    id: string;
    status: string;
    person: {
      id: string;
      firstName: string;
      lastName: string;
      documentType: string;
      documentNumber: string;
      phone: string | null;
      email: string | null;
      contacts: Array<{
        id: string;
        type: 'PHONE' | 'EMAIL' | 'WHATSAPP' | 'OTHER';
        label: string;
        value: string;
      }>;
    };
  }>;
  ownerships: Array<{
    id: string;
    status: string;
    personId: string;
    propertyId: string;
    ownershipPercentage: string;
    startsOn: string;
    endsOn: string | null;
    person: {
      id: string;
      firstName: string;
      lastName: string;
      documentType: string;
      documentNumber: string;
      phone: string | null;
      email: string | null;
    };
    property: {
      id: string;
      code: string;
      kind: string;
      location: { id: string; code: string; name: string; kind: string } | null;
    };
  }>;
  employments: Array<{
    id: string;
    status: string;
    personId: string;
    position: string;
    department: string;
    engagementType: string;
    startsOn: string;
    endsOn: string | null;
    person: {
      id: string;
      firstName: string;
      lastName: string;
      documentType: string;
      documentNumber: string;
      phone: string | null;
      email: string | null;
    };
  }>;
  boardAppointments: Array<{
    id: string;
    status: string;
    personId: string;
    propertyId: string | null;
    position: string;
    startsOn: string;
    endsOn: string | null;
    person: {
      id: string;
      firstName: string;
      lastName: string;
      documentType: string;
      documentNumber: string;
      phone: string | null;
      email: string | null;
    };
    property: { id: string; code: string; kind: string } | null;
  }>;
  concessions: Array<{
    id: string;
    status: string;
    code: string;
    name: string;
    holderName: string;
    holderDocument: string;
    locationDescription: string | null;
    monthlyAmount: string;
    currency: string;
    startsOn: string;
    endsOn: string | null;
    endReason: string | null;
  }>;
}

export interface OwnerServiceDirectory {
  owners: Array<{
    person: {
      id: string;
      firstName: string;
      lastName: string;
      documentType: string;
      documentNumber: string;
      phone: string | null;
      email: string | null;
      contacts: Array<{
        id: string;
        type: 'PHONE' | 'EMAIL' | 'WHATSAPP' | 'OTHER';
        label: string;
        value: string;
      }>;
    };
    property: {
      id: string;
      code: string;
      kind: string;
      location: {
        id: string;
        code: string;
        name: string;
        kind: string;
      } | null;
    };
    sector: string;
  }>;
  staff: Array<{
    id: string;
    position: string;
    department: string;
    person: {
      id: string;
      firstName: string;
      lastName: string;
      documentType: string;
      documentNumber: string;
    };
  }>;
}

export interface PageResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
}

export type ServiceIncidentStatus =
  | 'RECEIVED'
  | 'IN_REVIEW'
  | 'WORKER_ASSIGNED'
  | 'IN_EXECUTION'
  | 'RESOLVED';

export interface ServiceIncidentRecord {
  id: string;
  title: string;
  description: string;
  status: ServiceIncidentStatus;
  reportedAt: string;
  assignedEmploymentId: string | null;
  assignedName: string | null;
  assignedAt: string | null;
  property: { id: string; code: string };
  reporter: {
    id: string;
    firstName: string;
    lastName: string;
    documentType: string;
    documentNumber: string;
  };
  history: Array<{
    id: string;
    status: ServiceIncidentStatus;
    note: string;
    assignedName: string | null;
    occurredAt: string;
    actor: {
      email: string;
      person: { firstName: string; lastName: string } | null;
    } | null;
  }>;
}

export type ServiceAuthorizationStatus = 'RECEIVED' | 'APPROVED' | 'REJECTED';
export type ServiceAuthorizationType = 'ACCESS' | 'WORK' | 'EXIT';

export interface ServiceAuthorizationRecord {
  id: string;
  type: ServiceAuthorizationType;
  subject: string;
  validFrom: string;
  validUntil: string;
  issuedAt: string;
  status: ServiceAuthorizationStatus;
  vehicleBrand: string | null;
  vehicleModel: string | null;
  vehicleColor: string | null;
  vehiclePlate: string | null;
  vehicles?: Array<{
    id: string;
    brand: string | null;
    model: string | null;
    color: string | null;
    plate: string | null;
  }>;
  workDescription: string | null;
  exitPurpose: string | null;
  exitItems: string | null;
  rejectionReason: string | null;
  decidedAt: string | null;
  property: { id: string; code: string };
  owner: {
    id: string;
    firstName: string;
    lastName: string;
    documentType: string;
    documentNumber: string;
  };
  authorizedPeople: Array<{
    id: string;
    firstName: string;
    lastName: string;
    documentNumber: string;
  }>;
  decidedBy: {
    email: string;
    person: { firstName: string; lastName: string } | null;
  } | null;
}

export interface ServiceOwnerRecord {
  person: OwnerServiceDirectory['owners'][number]['person'];
  property: OwnerServiceDirectory['owners'][number]['property'];
  sector: string;
}

export interface OwnerServiceOptions {
  sectors: Array<{ id: string; code: string; name: string; kind: string }>;
  owners: Array<{
    property: { id: string; code: string; locationId: string | null };
    person: { id: string; firstName: string; lastName: string };
  }>;
  staff: OwnerServiceDirectory['staff'];
}

export interface CommunicationRecord {
  id: string;
  title: string;
  body: string;
  audienceType: 'ALL' | 'SECTOR' | 'GROUP' | 'OWNER';
  audienceLabel: string;
  status: 'PUBLISHED';
  publishedAt: string;
  recipientCount: number;
  readCount: number;
  publishedBy: {
    email: string;
    person: { firstName: string; lastName: string } | null;
  };
}

export interface CommunicationDetailRecord
  extends Omit<CommunicationRecord, 'recipientCount' | 'readCount'> {
  recipients: PageResult<{
    id: string;
    status: 'RECEIVED' | 'READ';
    receivedAt: string;
    readAt: string | null;
    property: { id: string; code: string };
    person: { id: string; firstName: string; lastName: string };
  }>;
}

export interface TreasurySnapshot {
  id: string;
  bankAccounts: Array<{
    id: string;
    bankName: string;
    holder: string;
    accountNumber: string;
    accountType: string;
    currency: string;
    status: string;
    holderRif?: string;
  }>;
  paymentMethods: Array<{
    id: string;
    label: string;
    type: string;
    currency: string;
    status: string;
    bankAccountId?: string;
    mobilePhone?: string;
    mobileDocument?: string;
    instructions?: string;
  }>;
}

export interface OfficialExchangeRate {
  moneda: 'USD';
  fuente: string;
  nombre: string;
  promedio: number;
  fechaActualizacion: string;
  consultadaEn: string;
}

export interface ExpenseConceptRecord {
  id: string;
  communityId: string;
  categoryId: string;
  code: string;
  name: string;
  description: string | null;
  defaultExpenseAccountId: string | null;
  defaultExpenseAccount?: { id: string; code: string; name: string } | null;
  status: 'ACTIVE' | 'INACTIVE';
  category: {
    id: string;
    code: string;
    name: string;
    status: string;
  };
}

export interface VendorRecord {
  id: string;
  legalName: string;
  document: string;
  address: string | null;
  phone: string | null;
  email: string | null;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface BillingSnapshot {
  id: string;
  ownerPayments: Array<{
    id: string;
    receiptNumber: number | null;
    amount: string | null;
    currency: 'VES' | 'USD' | 'EUR' | null;
    exchangeRate: string;
    originalAmount: string | null;
    originalCurrency: string | null;
    functionalAmount: string | null;
    functionalCurrency: 'USD' | null;
    exchangeRateSource: string | null;
    exchangeRateEffectiveAt: string | null;
    exchangeRateReference: string | null;
    reportedAt: string | null;
    reportedById: string | null;
    reconciledAt: string | null;
    reconciledById: string | null;
    amountVes: string | null;
    appliedToNoticeVes: string;
    advanceVes: string;
    reference: string;
    paidAt: string;
    notes: string | null;
    status: 'REPORTED' | 'RECONCILED' | 'POSTED' | 'REVERSED';
    property: { id: string; code: string; kind: string };
    payerPerson: {
      id: string;
      firstName: string;
      lastName: string;
      documentType: string;
      documentNumber: string;
    } | null;
    chargeNoticeAllocation: {
      id: string;
      chargeNotice: {
        id: string;
        status: string;
        billingPeriod: { id: string; periodKey: string; label: string };
      };
    } | null;
    paymentMethod: { id: string; label: string; type: string } | null;
    bankAccount: { id: string; bankName: string; accountNumber: string } | null;
    receiptAccount: { id: string; code: string; name: string } | null;
    receivableAccount: { id: string; code: string; name: string } | null;
    advanceAccount: { id: string; code: string; name: string } | null;
    journalEntry: { id: string; entryNumber: number | null; status: string } | null;
  }>;
  expenseCategories: Array<{
    id: string;
    code: string;
    name: string;
    description: string | null;
    status: string;
    _count: { concepts: number };
  }>;
  billingPeriods: Array<{
    id: string;
    periodKey: string;
    label: string;
    startsOn: string;
    endsOn: string;
    bcvRate: string;
    status: string;
    canDelete: boolean;
    deleteBlockReason: string | null;
    expenses: Array<{
      id: string;
      conceptId: string;
      description: string;
      amount: string;
      currency: 'VES' | 'USD' | 'EUR';
      allocationMethod: 'ALIQUOT' | 'FIXED';
      notes: string | null;
      invoiceNumber: string | null;
      beneficiaryName: string | null;
      beneficiaryDocument: string | null;
      beneficiaryPhone: string | null;
      paymentSource: 'BANK_ACCOUNT' | 'CASH' | 'OTHER' | null;
      paymentReference: string | null;
      paidAt: string | null;
      concept: {
        id: string;
        categoryId: string;
        code: string;
        name: string;
        category: {
          id: string;
          code: string;
          name: string;
        };
      };
      bankAccount: { id: string; bankName: string; accountNumber: string } | null;
      paymentMethod: { id: string; label: string; type: string } | null;
      expenseAccount: { id: string; code: string; name: string } | null;
      paymentAccount: { id: string; code: string; name: string } | null;
      journalEntry: { id: string; entryNumber: number | null; status: string } | null;
    }>;
    chargeNotice: null | {
      id: string;
      status: 'DRAFT' | 'PREPARED' | 'ISSUED' | 'VOID';
      totalExpensesVes: string;
      totalComponentsVes: string;
      totalCommunityVes: string;
      totalCommunityUsd: string;
      receivableAccount: { id: string; code: string; name: string } | null;
      billingIncomeAccount: { id: string; code: string; name: string } | null;
      journalEntry: { id: string; entryNumber: number | null; status: string } | null;
      components: Array<{
        id: string;
        type: 'RESERVE_FUND' | 'PROVISION' | 'EXTRA_FEE' | 'EMERGENCY_FEE';
        label: string;
        amount: string;
        currency: 'VES' | 'USD' | 'EUR';
        amountVes: string;
        allocationMethod: 'ALIQUOT' | 'FIXED';
      }>;
      allocations: Array<{
        id: string;
        aliquotSnapshot: string;
        expenseShareVes: string;
        componentShareVes: string;
        totalVes: string;
        totalUsd: string;
        property: { id: string; code: string; kind: string };
      }>;
    };
  }>;
}

export interface AccountingSnapshot {
  id: string;
  name: string;
  legalName: string;
  rif: string;
  address: string;
  state: string;
  city: string;
  postalCode: string;
  email: string;
  accountingSettings: {
    functionalCurrency: 'VES' | 'USD' | 'EUR';
    nextJournalNumber: number;
  } | null;
  ledgerAccounts: Array<{
    id: string;
    parentId: string | null;
    bankAccountId: string | null;
    code: string;
    name: string;
    description: string | null;
    type: 'ASSET' | 'LIABILITY' | 'EQUITY' | 'INCOME' | 'EXPENSE';
    normalBalance: 'DEBIT' | 'CREDIT';
    currency: 'VES' | 'USD' | 'EUR' | null;
    acceptsEntries: boolean;
    status: string;
    bankAccount: {
      id: string;
      bankName: string;
      accountNumber: string;
      currency: string;
    } | null;
  }>;
  accountingPeriods: Array<{
    id: string;
    periodKey: string;
    label: string;
    startsOn: string;
    endsOn: string;
    status: 'OPEN' | 'CLOSED' | 'LOCKED';
    closedAt: string | null;
  }>;
  journalEntries: Array<{
    id: string;
    accountingPeriodId: string;
    entryNumber: number | null;
    entryDate: string;
    description: string;
    source: string;
    sourceId: string | null;
    status: 'DRAFT' | 'POSTED' | 'REVERSED';
    postedAt: string | null;
    reversedAt: string | null;
    lines: Array<{
      id: string;
      lineNumber: number;
      description: string | null;
      debit: string;
      credit: string;
      account: { id: string; code: string; name: string };
    }>;
  }>;
}

export interface AccessEventRecord {
  id: string;
  direction: 'ENTRY' | 'EXIT';
  subject: string;
  documentNumber: string | null;
  source: string;
  qrValidated: boolean;
  occurredAt: string;
  property: { id: string; code: string } | null;
}

export interface ReceivablesSnapshot {
  currency: 'USD';
  totalIssuedUsd: string;
  totalPaidUsd: string;
  totalPendingUsd: string;
  notices: Array<{
    id: string;
    issuedAt: string | null;
    billingPeriod: { id: string; label: string; periodKey: string };
    issuedUsd: string;
    paidUsd: string;
    pendingUsd: string;
  }>;
  propertyBalances: Array<{
    id: string;
    property: string;
    issuedUsd: string;
    paidUsd: string;
    pendingUsd: string;
  }>;
  currentPeriod: (ReceivablesSnapshot['notices'][number] & { collectionRate: number }) | null;
}

export interface PayableRecord {
  id: string;
  category: 'SECURITY' | 'ELEVATOR_MAINTENANCE' | 'WASTE_COLLECTION' | 'GARDENING' | 'UTILITIES' | 'PAYROLL' | 'PROFESSIONAL_FEES' | 'REPAIRS_MATERIALS' | 'TAXES' | 'SOCIAL_SECURITY' | 'INSURANCE' | 'RENT' | 'TELECOMMUNICATIONS' | 'LEGAL_SERVICES' | 'ACCOUNTING_SERVICES' | 'SUPPLIES' | 'TRANSPORT' | 'OTHER';
  categoryLabel: string | null;
  supplierName: string;
  supplierDocument: string | null;
  description: string;
  invoiceNumber: string | null;
  issueDate: string;
  dueDate: string;
  amount: string;
  amountPaid: string;
  currency: 'VES' | 'USD' | 'EUR';
  status: 'PENDING' | 'PARTIALLY_PAID' | 'PAID' | 'VOID';
  notes: string | null;
  vendor: VendorRecord | null;
  expenseAccount?: { id: string; code: string; name: string } | null;
  liabilityAccount?: { id: string; code: string; name: string } | null;
  paymentAccount?: { id: string; code: string; name: string } | null;
  reminders: Array<{ id: string; remindAt: string; message: string | null; status: 'ACTIVE' | 'COMPLETED' | 'CANCELLED' }>;
}

export interface NotificationRecord {
  id: string;
  kind: 'PAYABLE_SUMMARY' | 'PAYABLE_DUE' | 'PAYABLE_REMINDER';
  severity: 'INFO' | 'WARNING' | 'URGENT';
  title: string;
  message: string;
  createdAt: string;
  payableId?: string;
  reminderId?: string;
}

export interface NotificationsSnapshot {
  generatedAt: string;
  unreadCount: number;
  items: NotificationRecord[];
}

async function refreshSession() {
  const context = StaffSession.context();
  const refreshToken = StaffSession.refreshToken();
  if (!refreshToken) return false;
  const refreshed = await CasaAuthService.refresh(
    refreshToken,
    context?.communityId,
  );
  if (!refreshed.success) return false;
  StaffSession.updateTokens(
    refreshed.data.accessToken,
    refreshed.data.refreshToken,
  );
  return true;
}

async function get<T>(path: string, retry = true): Promise<T> {
  try {
    const { data } = await casaApi.get<T>(path, {
      headers: { Authorization: `Bearer ${StaffSession.token()}`, 'X-Casa-Workspace': StaffSession.workspace() },
    });
    return data;
  } catch (error) {
    if (retry && axios.isAxiosError(error) && error.response?.status === 401) {
      if (await refreshSession()) return get<T>(path, false);
    }
    throw new Error(
      casaErrorMessage(error, 'No fue posible cargar la información.'),
      { cause: error },
    );
  }
}

async function mutate<T>(
  method: 'POST' | 'PATCH' | 'DELETE',
  path: string,
  data: unknown,
  retry = true,
): Promise<T> {
  try {
    const response = await casaApi.request<T>({
      method,
      url: path,
      data,
      headers: { Authorization: `Bearer ${StaffSession.token()}`, 'X-Casa-Workspace': StaffSession.workspace() },
    });
    return response.data;
  } catch (error) {
    if (retry && axios.isAxiosError(error) && error.response?.status === 401) {
      if (await refreshSession()) return mutate<T>(method, path, data, false);
    }
    throw new Error(
      casaErrorMessage(error, 'No fue posible completar la operación.'),
      { cause: error },
    );
  }
}

export const CommunityWorkspaceService = {
  coreSnapshot: () => get<CoreSnapshot>('/core/snapshot'),
  createPerson: (input: {
    firstName: string;
    lastName: string;
    documentType: 'V' | 'E' | 'J' | 'P';
    documentNumber: string;
    phone?: string;
    email?: string;
  }) => mutate<CoreSnapshot['people'][number]>('POST', '/core/people', input),
  updatePerson: (id: string, input: { firstName?: string; lastName?: string; phone?: string; email?: string }) =>
    mutate<CoreSnapshot['people'][number]['person']>('PATCH', `/core/people/${id}`, input),
  deactivatePerson: (id: string) =>
    mutate<CoreSnapshot['people'][number]>('DELETE', `/core/people/${id}`, {}),
  createPropertyLocation: (input: {
    kind: 'BUILDING' | 'SHOPPING_CENTER';
    code: string;
    name: string;
  }) =>
    mutate<CoreSnapshot['locations'][number]>(
      'POST',
      '/core/locations',
      input,
    ),
  createProperty: (input: {
    kind: 'APARTMENT' | 'TOWNHOUSE' | 'COMMERCIAL';
    code: string;
    locationId?: string;
    aliquot?: number;
    aliquotStartsOn?: string;
    maximumOccupancy?: number;
    braceletQuota?: number;
    parkingSpace?: string;
    parkingCapacity?: number;
  }) =>
    mutate<CoreSnapshot['properties'][number]>(
      'POST',
      '/core/properties',
      input,
    ),
  createOwnership: (input: {
    personId: string;
    propertyId: string;
    ownershipPercentage: number;
    startsOn: string;
  }) =>
    mutate<CoreSnapshot['ownerships'][number]>(
      'POST',
      '/core/ownerships',
      input,
    ),
  createEmployment: (input: {
    personId: string;
    position: string;
    department: string;
    engagementType: 'EMPLOYEE' | 'PROFESSIONAL_FEE' | 'CONTRACTOR';
    startsOn: string;
  }) =>
    mutate<CoreSnapshot['employments'][number]>(
      'POST',
      '/core/employments',
      input,
    ),
  createBoardAppointment: (input: {
    personId: string;
    propertyId?: string;
    position: string;
    startsOn: string;
    endsOn?: string;
  }) =>
    mutate<CoreSnapshot['boardAppointments'][number]>(
      'POST',
      '/core/board-appointments',
      input,
    ),
  ownerServiceDirectory: () =>
    get<OwnerServiceDirectory>('/core/owner-service-directory'),
  ownerServiceOptions: () =>
    get<OwnerServiceOptions>('/owner-service/options'),
  ownerServiceOwners: (input: {
    page: number;
    pageSize: number;
    search?: string;
  }) =>
    get<PageResult<ServiceOwnerRecord>>(
      `/owner-service/owners?${new URLSearchParams({
        page: String(input.page),
        pageSize: String(input.pageSize),
        ...(input.search ? { search: input.search } : {}),
      })}`,
    ),
  ownerServiceIncidents: (input: {
    page: number;
    pageSize: number;
    search?: string;
    status?: ServiceIncidentStatus;
  }) =>
    get<PageResult<ServiceIncidentRecord>>(
      `/owner-service/incidents?${new URLSearchParams({
        page: String(input.page),
        pageSize: String(input.pageSize),
        ...(input.search ? { search: input.search } : {}),
        ...(input.status ? { status: input.status } : {}),
      })}`,
    ),
  assignServiceIncident: (
    id: string,
    input: { employmentId?: string; assignedName: string },
  ) =>
    mutate<ServiceIncidentRecord>(
      'PATCH',
      `/owner-service/incidents/${id}/assignment`,
      input,
    ),
  updateServiceIncidentStatus: (
    id: string,
    input: { status: ServiceIncidentStatus; note?: string },
  ) =>
    mutate<ServiceIncidentRecord>(
      'PATCH',
      `/owner-service/incidents/${id}/status`,
      input,
    ),
  ownerServiceAuthorizations: (input: {
    page: number;
    pageSize: number;
    search?: string;
    status?: ServiceAuthorizationStatus;
  }) =>
    get<PageResult<ServiceAuthorizationRecord>>(
      `/owner-service/authorizations?${new URLSearchParams({
        page: String(input.page),
        pageSize: String(input.pageSize),
        ...(input.search ? { search: input.search } : {}),
        ...(input.status ? { status: input.status } : {}),
      })}`,
    ),
  approveServiceAuthorization: (id: string) =>
    mutate<ServiceAuthorizationRecord>(
      'POST',
      `/owner-service/authorizations/${id}/approve`,
      {},
    ),
  rejectServiceAuthorization: (id: string, reason: string) =>
    mutate<ServiceAuthorizationRecord>(
      'POST',
      `/owner-service/authorizations/${id}/reject`,
      { reason },
    ),
  securityAccessEvents: () => get<AccessEventRecord[]>('/owner-service/security/access-events'),
  scanAuthorizationQr: (qrPayload: string, direction: 'ENTRY' | 'EXIT' = 'ENTRY') =>
    mutate<{ valid: boolean; authorization: ServiceAuthorizationRecord }>('POST', '/owner-service/security/scan', { qrPayload, direction }),
  confirmAuthorizationArrival: (qrPayload: string, direction: 'ENTRY' | 'EXIT' = 'ENTRY') =>
    mutate<{ valid: boolean; event: AccessEventRecord; authorization: ServiceAuthorizationRecord }>('POST', '/owner-service/security/scan/confirm', { qrPayload, direction }),
  registerSecurityAccess: (input: { subject: string; documentNumber?: string; direction: 'ENTRY' | 'EXIT'; notes?: string }) =>
    mutate<AccessEventRecord>('POST', '/owner-service/security/access-events', input),
  ownerServiceCommunications: (input: {
    page: number;
    pageSize: number;
    search?: string;
  }) =>
    get<PageResult<CommunicationRecord>>(
      `/owner-service/communications?${new URLSearchParams({
        page: String(input.page),
        pageSize: String(input.pageSize),
        ...(input.search ? { search: input.search } : {}),
      })}`,
    ),
  ownerServiceCommunication: (
    id: string,
    input: { page: number; pageSize: number; search?: string },
  ) =>
    get<CommunicationDetailRecord>(
      `/owner-service/communications/${id}?${new URLSearchParams({
        page: String(input.page),
        pageSize: String(input.pageSize),
        ...(input.search ? { search: input.search } : {}),
      })}`,
    ),
  publishServiceCommunication: (input: {
    title: string;
    body: string;
    audienceType: 'ALL' | 'SECTOR' | 'GROUP' | 'OWNER';
    sectorId?: string;
    propertyIds?: string[];
  }) =>
    mutate<CommunicationRecord>(
      'POST',
      '/owner-service/communications/publish',
      input,
    ),
  treasurySnapshot: () => get<TreasurySnapshot>('/treasury/snapshot'),
  createBankAccount: (input: {
    bankName: string;
    holder: string;
    holderRif: string;
    accountNumber: string;
    accountType: string;
    currency: 'VES' | 'USD' | 'EUR';
  }) =>
    mutate<TreasurySnapshot['bankAccounts'][number]>(
      'POST',
      '/treasury/bank-accounts',
      input,
    ),
  createPaymentMethod: (input: {
    type: 'BANK_TRANSFER' | 'MOBILE_PAYMENT' | 'CASH';
    label: string;
    currency: 'VES' | 'USD' | 'EUR';
    bankAccountId?: string;
    mobilePhone?: string;
    mobileDocument?: string;
    instructions?: string;
  }) =>
    mutate<TreasurySnapshot['paymentMethods'][number]>(
      'POST',
      '/treasury/payment-methods',
      input,
    ),
  updateBankAccount: (
    id: string,
    input: {
      bankName?: string;
      holder?: string;
      holderRif?: string;
      accountNumber?: string;
      accountType?: string;
      currency?: 'VES' | 'USD' | 'EUR';
    },
  ) =>
    mutate<TreasurySnapshot['bankAccounts'][number]>(
      'PATCH',
      `/treasury/bank-accounts/${id}`,
      input,
    ),
  updateProperty: (id: string, input: {
    kind?: 'APARTMENT' | 'TOWNHOUSE' | 'COMMERCIAL';
    code?: string;
    locationId?: string;
    maximumOccupancy?: number | null;
    braceletQuota?: number;
    parkingSpace?: string;
    parkingCapacity?: number | null;
  }) =>
    mutate<CoreSnapshot['properties'][number]>(
      'PATCH',
      `/core/properties/${id}`,
      input,
    ),
  deactivateProperty: (id: string) =>
    mutate<CoreSnapshot['properties'][number]>(
      'DELETE',
      `/core/properties/${id}`,
      {},
    ),
  deactivateBankAccount: (id: string) =>
    mutate<TreasurySnapshot['bankAccounts'][number]>('DELETE', `/treasury/bank-accounts/${id}`, {}),
  updatePaymentMethod: (
    id: string,
    input: {
      type?: 'BANK_TRANSFER' | 'MOBILE_PAYMENT' | 'CASH';
      label?: string;
      currency?: 'VES' | 'USD' | 'EUR';
      bankAccountId?: string;
      mobilePhone?: string;
      mobileDocument?: string;
      instructions?: string;
    },
  ) =>
    mutate<TreasurySnapshot['paymentMethods'][number]>(
      'PATCH',
      `/treasury/payment-methods/${id}`,
      input,
    ),
  deactivatePaymentMethod: (id: string) =>
    mutate<TreasurySnapshot['paymentMethods'][number]>('DELETE', `/treasury/payment-methods/${id}`, {}),
  billingSnapshot: () => get<BillingSnapshot>('/billing/snapshot'),
  accountingSnapshot: () => get<AccountingSnapshot>('/accounting/snapshot'),
  receivablesSnapshot: () => get<ReceivablesSnapshot>('/accounting/receivables'),
  payables: () => get<PayableRecord[]>('/billing/payables'),
  notifications: () => get<NotificationsSnapshot>('/notifications'),
  createPayableReminder: (payableId: string, input: { remindAt: string; message?: string }) =>
    mutate<PayableRecord['reminders'][number]>('POST', `/billing/payables/${payableId}/reminders`, input),
  cancelPayableReminder: (reminderId: string) =>
    mutate<PayableRecord['reminders'][number]>('POST', `/billing/payable-reminders/${reminderId}/cancel`, {}),
  createPayable: (input: {
    category: PayableRecord['category']; categoryLabel?: string; supplierName: string; supplierDocument?: string; vendorId?: string;
    description: string; invoiceNumber?: string; issueDate: string; dueDate: string; amount: number;
    currency: PayableRecord['currency']; notes?: string; expenseAccountId?: string; liabilityAccountId?: string;
  }) => mutate<PayableRecord>('POST', '/billing/payables', input),
  updatePayable: (id: string, input: Partial<{
    category: PayableRecord['category']; categoryLabel: string; supplierName: string; supplierDocument: string; vendorId: string;
    description: string; invoiceNumber: string; issueDate: string; dueDate: string; amount: number;
    currency: PayableRecord['currency']; notes: string; status: PayableRecord['status'];
  }>) => mutate<PayableRecord>('PATCH', `/billing/payables/${id}`, input),
  payPayable: (id: string, input: { amount: number; paidAt: string; paymentAccountId?: string; paymentReference?: string }) =>
    mutate<PayableRecord>('POST', `/billing/payables/${id}/pay`, input),
  createLedgerAccount: (input: {
    code: string;
    name: string;
    description?: string;
    type: 'ASSET' | 'LIABILITY' | 'EQUITY' | 'INCOME' | 'EXPENSE';
    currency?: 'VES' | 'USD' | 'EUR';
    parentId?: string;
    bankAccountId?: string;
    acceptsEntries?: boolean;
  }) =>
    mutate<AccountingSnapshot['ledgerAccounts'][number]>(
      'POST',
      '/accounting/accounts',
      input,
    ),
  updateLedgerAccount: (
    id: string,
    input: {
      code?: string;
      name?: string;
      description?: string;
      type?: 'ASSET' | 'LIABILITY' | 'EQUITY' | 'INCOME' | 'EXPENSE';
      currency?: 'VES' | 'USD' | 'EUR';
      parentId?: string;
      bankAccountId?: string;
      acceptsEntries?: boolean;
    },
  ) =>
    mutate<AccountingSnapshot['ledgerAccounts'][number]>(
      'PATCH',
      `/accounting/accounts/${id}`,
      input,
    ),
  createAccountingPeriod: (input: { periodKey: string; label: string }) =>
    mutate<AccountingSnapshot['accountingPeriods'][number]>(
      'POST',
      '/accounting/periods',
      input,
    ),
  createJournalEntry: (input: {
    accountingPeriodId: string;
    entryDate: string;
    description: string;
    source?: string;
    sourceId?: string;
    lines: Array<{
      accountId: string;
      description?: string;
      debit: number;
      credit: number;
    }>;
  }) =>
    mutate<AccountingSnapshot['journalEntries'][number]>(
      'POST',
      '/accounting/entries',
      input,
    ),
  postJournalEntry: (entryId: string) =>
    mutate<AccountingSnapshot['journalEntries'][number]>(
      'POST',
      `/accounting/entries/${entryId}/post`,
      {},
    ),
  reverseJournalEntry: (
    entryId: string,
    input: { accountingPeriodId: string; entryDate: string; reason: string },
  ) =>
    mutate<AccountingSnapshot['journalEntries'][number]>(
      'POST',
      `/accounting/entries/${entryId}/reverse`,
      input,
    ),
  closeAccountingPeriod: (periodId: string) =>
    mutate<AccountingSnapshot['accountingPeriods'][number]>(
      'POST',
      `/accounting/periods/${periodId}/close`,
      {},
    ),
  createExpenseCategory: (input: {
    code: string;
    name: string;
    description?: string;
  }) =>
    mutate<BillingSnapshot['expenseCategories'][number]>(
      'POST',
      '/billing/categories',
      input,
    ),
  createExpenseConcept: (
    categoryId: string,
    input: { code: string; name: string; description?: string; defaultExpenseAccountId?: string },
  ) =>
    mutate<ExpenseConceptRecord>(
      'POST',
      `/billing/categories/${categoryId}/concepts`,
      input,
    ),
  vendors: (search?: string) =>
    get<VendorRecord[]>(
      `/billing/vendors${search ? `?${new URLSearchParams({ search })}` : ''}`,
    ),
  createVendor: (input: {
    legalName: string;
    document: string;
    address?: string;
    phone?: string;
    email?: string;
  }) => mutate<VendorRecord>('POST', '/billing/vendors', input),
  expenseConcepts: (input: {
    page?: number;
    pageSize?: number;
    search?: string;
    categoryId?: string;
    status?: 'ACTIVE' | 'INACTIVE';
  }) =>
    get<PageResult<ExpenseConceptRecord>>(
      `/billing/concepts?${new URLSearchParams({
        page: String(input.page ?? 1),
        pageSize: String(input.pageSize ?? 20),
        ...(input.search ? { search: input.search } : {}),
        ...(input.categoryId ? { categoryId: input.categoryId } : {}),
        ...(input.status ? { status: input.status } : {}),
      })}`,
    ),
  updateExpenseCategory: (
    categoryId: string,
    input: {
      code?: string;
      name?: string;
      description?: string;
      status?: 'ACTIVE' | 'INACTIVE';
    },
  ) =>
    mutate<BillingSnapshot['expenseCategories'][number]>(
      'PATCH',
      `/billing/categories/${categoryId}`,
      input,
    ),
  updateExpenseConcept: (
    conceptId: string,
    input: {
      categoryId?: string;
      code?: string;
      name?: string;
      description?: string;
      status?: 'ACTIVE' | 'INACTIVE';
    },
  ) =>
    mutate<ExpenseConceptRecord>(
      'PATCH',
      `/billing/concepts/${conceptId}`,
      input,
    ),
  createBillingPeriod: (input: {
    periodKey: string;
    label: string;
  }) =>
    mutate<BillingSnapshot['billingPeriods'][number]>(
      'POST',
      '/billing/periods',
      input,
    ),
  officialExchangeRate: () =>
    get<OfficialExchangeRate>('/billing/exchange-rate/official'),
  createPeriodExpense: (
    periodId: string,
    input: {
      conceptId: string;
      description: string;
      amount: number;
      currency: 'VES' | 'USD' | 'EUR';
      allocationMethod: 'ALIQUOT' | 'FIXED';
      notes?: string;
      invoiceNumber?: string;
      beneficiaryName: string;
      beneficiaryDocument: string;
      beneficiaryPhone?: string;
      paymentSource: 'BANK_ACCOUNT' | 'CASH' | 'OTHER';
      bankAccountId?: string;
      paymentMethodId?: string;
      paymentReference: string;
      paidAt: string;
      expenseAccountId?: string;
      paymentAccountId: string;
    },
  ) =>
    mutate<BillingSnapshot['billingPeriods'][number]['expenses'][number]>(
      'POST',
      `/billing/periods/${periodId}/expenses`,
      input,
    ),
  prepareChargeNotice: (
    periodId: string,
    input: {
      receivableAccountId: string;
      billingIncomeAccountId: string;
      components: Array<{
        type: 'RESERVE_FUND' | 'PROVISION' | 'EXTRA_FEE' | 'EMERGENCY_FEE';
        label: string;
        amount: number;
        currency: 'VES' | 'USD';
        allocationMethod: 'ALIQUOT' | 'FIXED';
      }>;
    },
  ) =>
    mutate<NonNullable<BillingSnapshot['billingPeriods'][number]['chargeNotice']>>(
      'POST',
      `/billing/periods/${periodId}/charge-notice/prepare`,
      input,
    ),
  createOwnerPayment: (input: {
    propertyId: string;
    payerPersonId?: string;
    chargeNoticeAllocationId?: string;
    paymentMethodId?: string;
    bankAccountId?: string;
    receiptAccountId: string;
    receivableAccountId: string;
    advanceAccountId?: string;
    amount: number;
    currency: 'VES' | 'USD' | 'EUR';
    exchangeRate: number;
    reference: string;
    paidAt: string;
    notes?: string;
  }) =>
    mutate<BillingSnapshot['ownerPayments'][number]>(
      'POST',
      '/billing/owner-payments',
      input,
    ),
  issueChargeNotice: (noticeId: string) =>
    mutate<NonNullable<BillingSnapshot['billingPeriods'][number]['chargeNotice']>>(
      'POST',
      `/billing/charge-notices/${noticeId}/issue`,
      {},
    ),
  deleteBillingPeriod: (periodId: string, reason: string) =>
    mutate<{ id: string; periodKey: string; deleted: boolean }>(
      'POST',
      `/billing/periods/${periodId}/delete`,
      { reason },
    ),
  accessUsers: () => get<CommunityAccessRecord[]>('/core/access-users'),
  accessPersonnel: () =>
    get<AccessPersonnelRecord[]>('/core/access-users/personnel'),
  createAccessUser: (input: CreateCommunityAccessInput) =>
    mutate<{ access: CommunityAccessRecord; createdUser: boolean }>(
      'POST',
      '/core/access-users',
      input,
    ),
  updateAccessUser: (
    accessId: string,
    input: {
      roleCode: string;
      scopes: string[];
      workspaceCodes: string[];
      reason: string;
    },
  ) =>
    mutate<CommunityAccessRecord>(
      'PATCH',
      `/core/access-users/${accessId}`,
      input,
    ),
  revokeAccessUser: (accessId: string, reason: string) =>
    mutate<CommunityAccessRecord>(
      'POST',
      `/core/access-users/${accessId}/revoke`,
      { reason },
    ),
};
