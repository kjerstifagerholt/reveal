import { Button, Chip, ChipGroup, Dropdown } from '@cognite/cogs.js';
import React from 'react';
import { useTranslation } from '../../hooks/useTranslation';

import { Filter } from './Filter';

export const SearchFilters = React.memo(() => {
  const { t } = useTranslation();

  return (
    <>
      <ChipGroup size="small" overflow={2}>
        <Chip type="neutral" label="Movie name starts with 'Harry Potter'" />
        <Chip type="neutral" label="Filter" />
        <Chip type="neutral" label="Filter" />
        <Chip type="neutral" label="Filter" />
      </ChipGroup>

      <Dropdown content={<Filter />}>
        <Button
          icon="Filter"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
        >
          {t('filter_button', 'Filters')}
        </Button>
      </Dropdown>
    </>
  );
});
