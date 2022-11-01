import React from 'react';
import { Tooltip } from '@cognite/cogs.js';
import { LabelDefinition } from '@cognite/sdk';
import { Select } from 'components';
import { ResourceType } from 'types';
import { useList } from '@cognite/sdk-react-query-hooks';
import { FilterFacetTitle } from '../FilterFacetTitle';
import { OptionValue } from '../types';
import { isArray } from 'lodash';

export const LabelFilterV2 = ({
  resourceType,
  value,
  setValue,
}: {
  resourceType: ResourceType;
  value: OptionValue<string>[] | undefined;
  setValue: (newValue: OptionValue<string>[] | undefined) => void;
}) => {
  const allowLabels = resourceType === 'asset' || resourceType === 'file';
  const { data: labels = [], isError } = useList<LabelDefinition>(
    'labels',
    { filter: {}, limit: 1000 },
    undefined,
    true
  );

  // const currentLabels = (value || [])
  //   .map(({ value }) => labels.find(el => el.externalId === value))
  //   .filter(el => !!el) as LabelDefinition[];

  const setLabel = (newValue?: OptionValue<string>[]) => {
    const newFilters = newValue && newValue.length > 0 ? newValue : undefined;
    setValue(newFilters);
  };

  return (
    <Tooltip
      interactive
      disabled={!isError}
      content="Error fetching labels, please make sure you have labelsAcl:READ"
    >
      <>
        <FilterFacetTitle>Labels</FilterFacetTitle>
        <Select
          options={labels.map(el => ({
            label: el.name,
            value: el.externalId,
          }))}
          cogsTheme="grey"
          isDisabled={isError || !allowLabels}
          onChange={newValue => {
            if (isArray(newValue)) {
              setLabel(newValue ? newValue : undefined);
            }
          }}
          value={value}
          isMulti
          isSearchable
          isClearable
        />
      </>
    </Tooltip>
  );
};
