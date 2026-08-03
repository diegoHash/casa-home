import {
  emptyCoreState,
  type AuditEntry,
  type Community,
  type CoreState,
  type PropertyKind,
  type PropertyLocation,
} from '../domain/core';
import type { PlatformClient } from '../domain/superAdmin';

const STORAGE_KEY = 'casa_core_v1';

type LegacyProperty = {
  id: string;
  communityId: string;
  parentId?: string | null;
  locationId?: string | null;
  kind: string;
  code: string;
  name?: string;
  aliquot?: number | null;
  maximumOccupancy?: number | null;
  braceletQuota?: number;
  status?: 'active' | 'inactive';
};

function isPropertyKind(value: string): value is PropertyKind {
  return value === 'apartment' || value === 'townhouse' || value === 'commercial';
}

function parseState(value: string | null): CoreState {
  if (!value) return structuredClone(emptyCoreState);
  try {
    const parsed = JSON.parse(value) as Omit<Partial<CoreState>, 'properties'> & { properties?: LegacyProperty[] };
    const rawProperties = parsed.properties ?? [];
    const legacyLocations: PropertyLocation[] = rawProperties
      .filter(item => item.kind === 'building' || item.kind === 'tower')
      .map(item => ({
        id: item.id,
        communityId: item.communityId,
        kind: 'building',
        code: item.code,
        name: item.name || item.code,
        status: item.status ?? 'active',
      }));
    const explicitLocations = parsed.propertyLocations ?? [];
    const locationIds = new Set([...explicitLocations, ...legacyLocations].map(item => item.id));
    const properties = rawProperties
      .filter(item => isPropertyKind(item.kind))
      .map(item => ({
        id: item.id,
        communityId: item.communityId,
        locationId: item.locationId ?? (item.parentId && locationIds.has(item.parentId) ? item.parentId : null),
        kind: item.kind as PropertyKind,
        code: item.code,
        aliquot: item.aliquot ?? null,
        maximumOccupancy: item.maximumOccupancy ?? null,
        braceletQuota: item.braceletQuota ?? 0,
        status: item.status ?? 'active',
      }));
    const memberships = parsed.memberships ?? [];
    const boardAppointments = parsed.boardAppointments ?? [];
    const communityPeople = parsed.communityPeople?.length
      ? parsed.communityPeople
      : Array.from(
          new Map(
            [...memberships, ...boardAppointments].map(item => [
              `${item.communityId}:${item.personId}`,
              {
                id: `community_person_${item.communityId}_${item.personId}`,
                communityId: item.communityId,
                personId: item.personId,
                status: 'active' as const,
                registeredAt: new Date().toISOString(),
              },
            ]),
          ).values(),
        );
    const ownerships = parsed.ownerships?.length
      ? parsed.ownerships
      : memberships
          .filter(item => item.kind === 'owner')
          .flatMap(item => item.propertyIds.map(propertyId => ({
            id: `ownership_${item.id}_${propertyId}`,
            communityId: item.communityId,
            propertyId,
            personId: item.personId,
            ownershipPercentage: item.ownershipPercentage ?? 100,
            startsOn: '',
            endsOn: null,
            status: item.status === 'active' ? ('active' as const) : ('ended' as const),
          })));
    const employments = parsed.employments?.length
      ? parsed.employments
      : memberships
          .filter(item => item.kind === 'staff')
          .map(item => ({
            id: `employment_${item.id}`,
            communityId: item.communityId,
            personId: item.personId,
            position: item.title,
            department: item.department,
            engagementType: 'employee' as const,
            startsOn: '',
            endsOn: null,
            status: item.status === 'active' ? ('active' as const) : ('ended' as const),
          }));
    return {
      communities: (parsed.communities ?? []).map(item => ({
        ...item,
        clientId: item.clientId ?? null,
        licenseId: item.licenseId ?? null,
      })),
      bankAccounts: parsed.bankAccounts ?? [],
      paymentMethods: parsed.paymentMethods ?? [],
      propertyLocations: [...explicitLocations, ...legacyLocations.filter(item => !explicitLocations.some(current => current.id === item.id))],
      properties,
      propertyAliquotPeriods: parsed.propertyAliquotPeriods ?? properties.map(item => ({
        id: `aliquot_initial_${item.id}`,
        communityId: item.communityId,
        propertyId: item.id,
        aliquot: item.aliquot,
        startsOn: '',
        endsOn: null,
        reason: 'Valor inicial',
        status: 'active' as const,
      })),
      people: (parsed.people ?? []).map(item => ({
        ...item,
        contacts: item.contacts ?? [],
      })),
      communityPeople,
      ownerships,
      employments,
      memberships,
      boardAppointments,
      concessions: parsed.concessions ?? [],
      audit: parsed.audit ?? [],
    };
  } catch {
    return structuredClone(emptyCoreState);
  }
}

export function createCoreId(prefix: string) {
  return `${prefix}_${crypto.randomUUID()}`;
}

export function auditEntry(
  communityId: string | null,
  action: string,
  entity: string,
  detail: string,
  context: Pick<AuditEntry, 'reason' | 'before' | 'after'> = {},
): AuditEntry {
  return {
    id: createCoreId('audit'),
    communityId,
    action,
    entity,
    detail,
    actor: 'ROOT · Diego Sumoza',
    ...context,
    createdAt: new Date().toISOString(),
  };
}

function splitLocation(location: string) {
  const parts = location.split(',').map(item => item.trim()).filter(Boolean);
  return { city: parts[0] ?? '', state: parts.slice(1).join(', ') };
}

export function ensureCommunityForClient(client: PlatformClient): Community {
  const state = CoreRepository.load();
  const existing = state.communities.find(item => item.clientId === client.id);
  if (existing) return existing;
  const now = new Date().toISOString();
  const location = splitLocation(client.location);
  const community: Community = {
    id: `community_${client.id}`,
    clientId: client.id,
    licenseId: `license_${client.id}`,
    name: client.name,
    legalName: client.legalName,
    rif: client.rif,
    phone: client.contactPhone,
    email: client.contactEmail,
    address: '',
    state: location.state,
    city: location.city,
    postalCode: '',
    status: 'draft',
    administrationMode: 'board',
    administratorName: '',
    administratorRif: '',
    createdAt: now,
    updatedAt: now,
  };
  CoreRepository.save({
    ...state,
    communities: [community, ...state.communities],
    audit: [auditEntry(community.id, 'Creó', 'Comunidad vinculada', `${client.name} · alta integral de cliente`, {
      after: { clientId: client.id, licenseId: community.licenseId, status: community.status },
    }), ...state.audit],
  });
  return community;
}

export const CoreRepository = {
  load(): CoreState {
    return parseState(localStorage.getItem(STORAGE_KEY));
  },
  save(state: CoreState) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  },
};
