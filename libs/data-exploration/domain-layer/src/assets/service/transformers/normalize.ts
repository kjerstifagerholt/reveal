import { Asset } from '@cognite/sdk';
import { InternalAssetData } from '@data-exploration-lib/domain-layer';

export const normalizeAssets = (assets: Asset[]): InternalAssetData[] => {
  return assets.map((asset) => ({
    id: asset.id,
    rootId: asset.rootId,
    parentExternalId: asset.parentExternalId,
    lastUpdatedTime: asset.lastUpdatedTime,
    createdTime: asset.createdTime,
    externalId: asset.externalId,
    name: asset.name,
    parentId: asset.parentId,
    description: asset.description,
    dataSetId: asset.dataSetId,
    metadata: asset.metadata,
    source: asset.source,
    labels: asset.labels,
    aggregates: asset.aggregates,
    labelsFlattened: asset.labels
      ? asset.labels.map((label) => label.externalId)
      : undefined,
  }));
};
