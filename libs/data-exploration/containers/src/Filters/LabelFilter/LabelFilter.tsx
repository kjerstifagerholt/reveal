import { Tooltip } from '@cognite/cogs.js';
import { useAssetsUniqueValuesByProperty } from '@data-exploration-lib/domain-layer';
import { BaseMultiSelectFilterProps } from '../types';
import { MultiSelectFilter } from '../MultiSelectFilter';
import { InternalAssetFilters } from '@data-exploration-lib/core';
import { useState } from 'react';

interface Props<TFilter> extends BaseMultiSelectFilterProps<TFilter> {
  options: { label?: string; value: string }[];
}

export const LabelFilter = <TFilter,>({
  options,
  onChange,
  value,
  addNilOption,
  onInputChange,
  error,
  loading,
}: Props<TFilter>) => {
  const handleChange = (
    newValue: {
      label: string;
      value: string;
    }[]
  ) => {
    const newFilters = newValue && newValue.length > 0 ? newValue : undefined;
    onChange?.(newFilters);
  };

  if (loading) {
    return null;
  }

  return (
    <Tooltip
      interactive
      disabled={!error}
      content="Error fetching labels, please make sure you have labelsAcl:READ"
    >
      <>
        <MultiSelectFilter<string>
          label="Labels"
          options={options}
          onChange={(_, newValue) => handleChange(newValue)}
          value={value}
          onInputChange={onInputChange}
          isMulti
          isSearchable
          isClearable
          addNilOption={addNilOption}
        />
      </>
    </Tooltip>
  );
};

const AssetLabelFilter = (
  props: BaseMultiSelectFilterProps<InternalAssetFilters>
) => {
  const [query, setQuery] = useState<string | undefined>(undefined);

  const {
    data: labels = [],
    isLoading,
    isError,
  } = useAssetsUniqueValuesByProperty('labels', query);

  const options = labels.map((label) => ({
    label: String(label.value),
    value: String(label.value),
  }));

  return (
    <LabelFilter
      {...props}
      onInputChange={(value) => setQuery(value)}
      error={isError}
      loading={isLoading}
      options={options}
    />
  );
};

LabelFilter.Asset = AssetLabelFilter;
