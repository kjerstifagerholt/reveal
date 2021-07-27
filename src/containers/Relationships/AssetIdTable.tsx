import React from 'react';
import { ResourceItem, convertResourceType } from 'types';
import { useCdfItem, useCdfItems } from '@cognite/sdk-react-query-hooks';
import { Asset } from '@cognite/sdk';
import { AssetTable } from 'containers';
import { SelectableItemsProps } from 'CommonProps';

export const AssetIdTable = ({
  resource,
  onItemClicked,
  ...props
}: {
  resource: ResourceItem;
  onItemClicked: (id: number) => void;
} & SelectableItemsProps) => {
  const { data: item, isFetched: isItemFetched } = useCdfItem(
    convertResourceType(resource.type),
    { id: resource.id },
    { enabled: !!resource?.externalId }
  );

  const assetIds: number[] =
    (item as any).assetIds || [(item as any).assetId] || [];

  const { data: assets } = useCdfItems<Asset>(
    'assets',
    assetIds.map(id => ({ id })),
    false,
    { enabled: isItemFetched && !!assetIds && assetIds.length > 0 }
  );

  return (
    <AssetTable
      data={assets}
      onRowClick={el => onItemClicked(el.id)}
      {...props}
    />
  );
};
