export type ImportBatchStatus =
  | 'SCANNING'
  | 'SCANNED'
  | 'MAPPING'
  | 'MAPPED'
  | 'VALIDATING'
  | 'READY'
  | 'IMPORTING'
  | 'IMPORTED'
  | 'FAILED';

export type ImportMappingStatus = 'UNMAPPED' | 'DRAFT' | 'COMPLETE' | 'IGNORED';

export interface ImportColumn {
  name: string;
  sourceType: string;
  nullable: boolean;
  sampleValues: unknown[];
}

export interface ImportColumnMapping {
  id: string;
  sourceColumn: string;
  targetField: string;
  transform: string | null;
  required: boolean;
}

export interface ImportTable {
  id: string;
  sourceName: string;
  rowCount: number;
  columns: ImportColumn[];
  sampleRows: Array<Record<string, unknown>>;
  mappingStatus: ImportMappingStatus;
  targetEntity: string | null;
  notes: string | null;
  columnMappings: ImportColumnMapping[];
}

export interface ImportBatch {
  id: string;
  sourceType: 'MDB' | 'CSV';
  originalName: string;
  byteSize: string;
  checksumSha256: string;
  status: ImportBatchStatus;
  tableCount: number;
  rowCount: number;
  errorMessage: string | null;
  scannedAt: string | null;
  createdAt: string;
  tables: ImportTable[];
}

export interface ImportTargetField {
  key: string;
  label: string;
  required: boolean;
}

export interface ImportTargetEntity {
  key: string;
  label: string;
  description: string;
  fields: ImportTargetField[];
}

export interface SaveImportMappingInput {
  targetEntity: string;
  notes?: string;
  mode: 'complete' | 'ignore';
  columns: Array<{
    sourceColumn: string;
    targetField: string;
    transform?: string;
    required: boolean;
  }>;
}
