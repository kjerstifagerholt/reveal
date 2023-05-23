import { Button, Chip, ChipGroup } from '@cognite/cogs.js';
import React from 'react';
import { useTranslation } from '../../hooks/useTranslation';

export const SearchFilters = React.memo(() => {
  const { t } = useTranslation();

  return (
    <>
      <ChipGroup size="small" overflow={2}>
        <Chip type="neutral" label="Movie starts with 'P'" />
        <Chip type="neutral" label="Filter" />
        <Chip type="neutral" label="Filter" />
        <Chip type="neutral" label="Filter" />
      </ChipGroup>

      <Button
        icon="Filter"
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        {t('filter_button', 'Filters')}
      </Button>
    </>
  );
});
