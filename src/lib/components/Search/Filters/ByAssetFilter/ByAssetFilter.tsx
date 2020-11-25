import React from 'react';
import { Title } from '@cognite/cogs.js';
import { Asset } from '@cognite/sdk';
import { AssetSelect } from 'lib/containers/Assets';

export const ByAssetFilter = ({
  value,
  setValue,
  title = 'Asset',
}: {
  value: number[] | undefined;
  setValue: (newValue: number[] | undefined) => void;
  title?: string;
}) => {
  const setFilterByAsset = (assets: Asset[] | undefined) => {
    setValue(assets ? assets.map(el => el.id) : undefined);
  };

  return (
    <>
      <Title
        level={4}
        style={{ marginBottom: 5, marginTop: 10 }}
        className="title"
      >
        {title}
      </Title>
      <AssetSelect
        isMulti
        selectedAssetIds={value}
        onAssetSelected={setFilterByAsset}
      />
    </>
  );
};
