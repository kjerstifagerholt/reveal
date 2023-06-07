import React from 'react';

import { GeneralDetails, TimeDisplay } from '@data-exploration/components';
import noop from 'lodash/noop';

import { Asset } from '@cognite/sdk';

import { useDetailedMappingsByAssetIdQuery } from '@data-exploration-lib/domain-layer';

type Props = {
  asset: Asset;
  onClickRootAsset?: (rootAssetId: number) => void;
};

export const AssetInfo = ({ asset, onClickRootAsset = noop }: Props) => {
  const { data: mappings, isFetched } = useDetailedMappingsByAssetIdQuery(
    asset.id
  );

  const onClickHandler = (rootAsset: Asset) => {
    if (asset.id !== rootAsset.id) {
      onClickRootAsset(rootAsset.id);
    }
  };

  return (
    <GeneralDetails>
      <GeneralDetails.RootAssetItem
        assetId={asset.id}
        onClick={onClickHandler}
      />

      <GeneralDetails.Item
        key={`name-${asset.name}`}
        name="Name"
        value={asset.name}
        copyable
      />
      <GeneralDetails.Item
        name="Description"
        value={asset.description}
        copyable
      />
      <GeneralDetails.Item
        key={`id-${asset.id}`}
        name="ID"
        value={asset.id}
        copyable
      />
      <GeneralDetails.Item
        name="External ID"
        key={`externalId-${asset.externalId}`}
        value={asset.externalId}
        copyable
      />
      <GeneralDetails.DataSetItem id={asset.id} type="asset" />
      <GeneralDetails.Item
        name="Created at"
        value={<TimeDisplay value={asset.createdTime} />}
      />
      <GeneralDetails.Item
        name="Updated at"
        value={<TimeDisplay value={asset.lastUpdatedTime} />}
      />
      {isFetched && !!mappings?.length && (
        <GeneralDetails.ThreeDModelItem
          assetId={asset.id}
          mappings={mappings}
        />
      )}
      <GeneralDetails.LabelsItem
        labels={asset.labels?.map((label) => label.externalId)}
      />
      <GeneralDetails.Item
        name="Source"
        key={`source-${asset.source}`}
        value={asset.source}
        copyable
      />
    </GeneralDetails>
  );
};
