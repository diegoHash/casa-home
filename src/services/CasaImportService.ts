import type {
  ImportBatch,
  ImportTargetEntity,
  SaveImportMappingInput,
} from '../domain/imports';
import { authorizedRequest } from './CasaPlatformService';

export const CasaImportService = {
  async catalog(clientId: string) {
    const { data } = await authorizedRequest<ImportTargetEntity[]>({
      method: 'GET',
      url: `/platform/clients/${clientId}/imports/catalog`,
    });
    return data;
  },

  async list(clientId: string) {
    const { data } = await authorizedRequest<ImportBatch[]>({
      method: 'GET',
      url: `/platform/clients/${clientId}/imports`,
    });
    return data;
  },

  async scan(clientId: string, file: File, password = '') {
    const body = new FormData();
    body.append('file', file);
    if (password) body.append('password', password);
    const { data } = await authorizedRequest<ImportBatch>({
      method: 'POST',
      url: `/platform/clients/${clientId}/imports/scan`,
      data: body,
      timeout: 180_000,
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },

  async rescan(clientId: string, batchId: string, password = '') {
    const { data } = await authorizedRequest<ImportBatch>({
      method: 'POST',
      url: `/platform/clients/${clientId}/imports/${batchId}/rescan`,
      data: password ? { password } : {},
      timeout: 180_000,
    });
    return data;
  },

  async saveMapping(
    clientId: string,
    batchId: string,
    tableId: string,
    input: SaveImportMappingInput,
  ) {
    const { data } = await authorizedRequest<ImportBatch>({
      method: 'PUT',
      url: `/platform/clients/${clientId}/imports/${batchId}/tables/${tableId}/mapping`,
      data: input,
    });
    return data;
  },

  async remove(
    clientId: string,
    batchId: string,
    confirmation: string,
    reason: string,
  ) {
    await authorizedRequest({
      method: 'DELETE',
      url: `/platform/clients/${clientId}/imports/${batchId}`,
      data: { confirmation, reason },
    });
  },
};
