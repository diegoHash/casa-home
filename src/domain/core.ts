export type CommunityStatus = 'draft' | 'active' | 'inactive';
export type AdministrationMode = 'board' | 'internal' | 'external';
export type PropertyKind = 'apartment' | 'townhouse' | 'commercial' | 'house' | 'quinta' | 'penthouse';
export type PropertyLocationKind = 'building' | 'shopping-center';
export type MembershipKind = 'owner' | 'resident' | 'representative' | 'staff';

export interface Community {
  id: string;
  clientId: string | null;
  licenseId: string | null;
  name: string;
  legalName: string;
  rif: string;
  phone: string;
  email: string;
  address: string;
  state: string;
  city: string;
  postalCode: string;
  status: CommunityStatus;
  administrationMode: AdministrationMode;
  administratorName: string;
  administratorRif: string;
  createdAt: string;
  updatedAt: string;
}

export interface BankAccount {
  id: string;
  communityId: string;
  bankName: string;
  holder: string;
  holderRif: string;
  accountNumber: string;
  accountType: 'corriente' | 'ahorro' | 'custodia' | 'otra';
  currency: 'VES' | 'USD' | 'EUR' | 'Otra';
  active: boolean;
}

export interface PaymentMethod {
  id: string;
  communityId: string;
  type: 'bank-transfer' | 'mobile-payment' | 'cash';
  label: string;
  currency: 'VES' | 'USD' | 'EUR';
  bankAccountId: string | null;
  mobilePhone: string;
  mobileDocument: string;
  instructions: string;
  active: boolean;
}

export interface PropertyLocation {
  id: string;
  communityId: string;
  kind: PropertyLocationKind;
  code: string;
  name: string;
  status: 'active' | 'inactive';
}

export interface PropertyUnit {
  id: string;
  communityId: string;
  locationId: string | null;
  kind: PropertyKind;
  code: string;
  aliquot: number | null;
  maximumOccupancy: number | null;
  braceletQuota: number;
  status: 'active' | 'inactive';
}

export interface PropertyAliquotPeriod {
  id: string;
  communityId: string;
  propertyId: string;
  aliquot: number | null;
  startsOn: string;
  endsOn: string | null;
  reason: string;
  status: 'active' | 'ended';
}

export interface Person {
  id: string;
  firstName: string;
  lastName: string;
  documentType: 'V' | 'E' | 'J' | 'P';
  documentNumber: string;
  phone: string;
  email: string;
  createdAt: string;
  contacts: PersonContact[];
}

export interface PersonContact {
  id: string;
  type: 'PHONE' | 'EMAIL' | 'WHATSAPP' | 'OTHER';
  label: string;
  value: string;
}

export interface CommunityPerson {
  id: string;
  communityId: string;
  personId: string;
  status: 'active' | 'inactive';
  registeredAt: string;
}

export interface Ownership {
  id: string;
  communityId: string;
  propertyId: string;
  personId: string;
  ownershipPercentage: number;
  startsOn: string;
  endsOn: string | null;
  endReason?: string;
  status: 'active' | 'ended';
}

export interface Employment {
  id: string;
  communityId: string;
  personId: string;
  position: string;
  department: string;
  engagementType: 'employee' | 'professional-fee' | 'contractor';
  startsOn: string;
  endsOn: string | null;
  endReason?: string;
  status: 'active' | 'ended';
}

export interface CommunityMembership {
  id: string;
  communityId: string;
  personId: string;
  kind: MembershipKind;
  propertyIds: string[];
  title: string;
  department: string;
  ownershipPercentage: number | null;
  status: 'active' | 'inactive';
}

export interface BoardAppointment {
  id: string;
  communityId: string;
  personId: string;
  propertyId: string | null;
  position: string;
  startsOn: string;
  endsOn: string;
  endReason?: string;
  status: 'active' | 'ended';
}

export interface Concession {
  id: string;
  communityId: string;
  code: string;
  name: string;
  holderName: string;
  holderDocument: string;
  locationDescription: string;
  monthlyAmount: number;
  currency: 'VES' | 'USD';
  startsOn: string;
  endsOn: string | null;
  endReason?: string;
  status: 'active' | 'ended';
}

export interface AuditEntry {
  id: string;
  communityId: string | null;
  action: string;
  entity: string;
  detail: string;
  actor?: string;
  reason?: string;
  before?: Record<string, unknown> | null;
  after?: Record<string, unknown> | null;
  createdAt: string;
}

export interface CoreState {
  communities: Community[];
  bankAccounts: BankAccount[];
  paymentMethods: PaymentMethod[];
  propertyLocations: PropertyLocation[];
  properties: PropertyUnit[];
  propertyAliquotPeriods: PropertyAliquotPeriod[];
  people: Person[];
  communityPeople: CommunityPerson[];
  ownerships: Ownership[];
  employments: Employment[];
  memberships: CommunityMembership[];
  boardAppointments: BoardAppointment[];
  concessions: Concession[];
  audit: AuditEntry[];
}

export const emptyCoreState: CoreState = {
  communities: [],
  bankAccounts: [],
  paymentMethods: [],
  propertyLocations: [],
  properties: [],
  propertyAliquotPeriods: [],
  people: [],
  communityPeople: [],
  ownerships: [],
  employments: [],
  memberships: [],
  boardAppointments: [],
  concessions: [],
  audit: [],
};

export const propertyKindLabels: Record<PropertyKind, string> = {
  apartment: 'Apartamento',
  townhouse: 'Townhouse',
  commercial: 'Local comercial',
  house: 'Casa',
  quinta: 'Quinta',
  penthouse: 'Penthouse',
};

export const propertyLocationKindLabels: Record<PropertyLocationKind, string> = {
  building: 'Edificio',
  'shopping-center': 'Centro comercial',
};

export const membershipKindLabels: Record<MembershipKind, string> = {
  owner: 'Propietario',
  resident: 'Residente',
  representative: 'Representante',
  staff: 'Personal',
};
