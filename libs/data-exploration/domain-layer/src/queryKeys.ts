import { DocumentSortItem } from '@cognite/sdk/dist/src';

export const queryKeys = {
  all: ['cdf'] as const,
  // SEQUENCE
  sequence: () => [...queryKeys.all, 'sequence'] as const,
  sequencesMetadata: (filter?: any) =>
    [...queryKeys.sequence(), 'metadata', 'keys', filter] as const,
  listSequence: (input?: any[]) =>
    [...queryKeys.sequence(), ...(input || [])] as const,
  sequencesMetadataValues: (metadataKey: string, filter?: any) =>
    [
      ...queryKeys.sequence(),
      'metadata',
      'values',
      metadataKey,
      filter,
    ] as const,
  aggregateSequence: (input?: any[]) =>
    [...queryKeys.sequence(), ...(input || []), 'aggregate'] as const,

  // TIMESERIES
  timeseries: () => [...queryKeys.all, 'timeseries'] as const,
  listTimeseries: (input?: any[]) =>
    [...queryKeys.timeseries(), ...(input || [])] as const,
  timeseriesMetadata: () =>
    [...queryKeys.timeseries(), 'metadata', 'keys'] as const,
  aggregateTimeseries: (input?: any[]) =>
    [...queryKeys.timeseries(), ...(input || []), 'aggregate'] as const,
  timeseriesUniqueValues: (property: string, filter?: any) =>
    [...queryKeys.timeseries(), 'unique-values', property, filter] as const,

  // EVENTS
  events: () => [...queryKeys.all, 'events'] as const,
  eventsMetadataValues: (metadataKey: string, filter?: any) =>
    [...queryKeys.events(), 'metadata', 'values', metadataKey, filter] as const,
  eventsUniqueValues: (property: string, filter?: any) =>
    [...queryKeys.events(), 'unique-values', property, filter] as const,
  listEvents: (input?: any[]) =>
    [...queryKeys.events(), ...(input || [])] as const,
  aggregateEvents: (input?: any[]) =>
    [...queryKeys.events(), ...(input || []), 'aggregate'] as const,

  // ASSETS
  eventsMetadata: (filter?: any) =>
    [...queryKeys.assets(), 'metadata', 'keys', filter] as const,
  assets: () => [...queryKeys.all, 'assets'] as const,
  rootAsset: (assetId: number) =>
    [...queryKeys.assets(), assetId, 'rootParent'] as const,
  rootAssets: () => [...queryKeys.all, 'rootAssets'],
  assetChildren: (assetId: number) => [queryKeys.assets(), assetId, 'children'],
  listAssets: (input?: any[]) =>
    [...queryKeys.assets(), ...(input || [])] as const,
  aggregateAssets: (input?: any[]) =>
    [...queryKeys.assets(), ...(input || []), 'aggregate'] as const,
  retrieveAsset: (id: number) => [...queryKeys.assets(), 'asset', id] as const,
  assetsUniqueValues: (property: string, filter?: any) =>
    [...queryKeys.assets(), 'unique-values', property, filter] as const,
  assetsMetadata: (filter?: any) =>
    [...queryKeys.assets(), 'metadata', 'keys', filter] as const,
  assetsMetadataValues: (metadataKey: string, filter?: any) =>
    [...queryKeys.assets(), 'metadata', 'values', metadataKey, filter] as const,
  listBasicAssetMappings: (id: number) =>
    [...queryKeys.retrieveAsset(id), 'basic-mappings'] as const,
  listDetailedAssetMappings: (id: number) =>
    [...queryKeys.retrieveAsset(id), 'detailed-mappings'] as const,
  retrieveThreeDModel: (id: number) =>
    [...queryKeys.all, '3d-model', id] as const,
  retrieveThreeDRevision: (modelId: number, revisionId: number) =>
    [
      ...queryKeys.retrieveThreeDModel(modelId),
      'revision',
      revisionId,
    ] as const,

  // DOCUMENTS
  documents: () => [...queryKeys.all, 'documents'] as const,
  documentsSearch: (
    filter?: any,
    localLimit?: number,
    sort?: DocumentSortItem[]
  ) => [...queryKeys.documents(), 'search', filter, localLimit, sort] as const,
  documentsAggregate: () => [...queryKeys.documents(), 'aggregates'] as const,
  documentsAggregateCount: () =>
    [...queryKeys.documentsAggregate(), 'count'] as const,
  documentsAggregatesCountTotal: () =>
    [...queryKeys.documentsAggregateCount(), 'total'] as const,
  documentsAggregatesCountFiltered: (filters: any, query: string) =>
    [...queryKeys.documentsAggregateCount(), query, filters] as const,
  documentsTotalAggregates: (aggregate: any) =>
    [...queryKeys.documentsAggregate(), 'total', aggregate] as const,
  documentsFilteredAggregates: (filters: any, aggregates: any) =>
    [...queryKeys.documentsAggregate(), filters, aggregates] as const,

  documentsMetadata: () =>
    [...queryKeys.documents(), 'metadata', 'keys'] as const,
  documentsMetadataValues: (metadataKey: string) =>
    [...queryKeys.documents(), 'metadata', metadataKey, 'values'] as const,
} as const;
