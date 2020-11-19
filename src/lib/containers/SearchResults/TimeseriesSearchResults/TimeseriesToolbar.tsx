import React from 'react';
import { ButtonGroup } from 'lib/components';
import { SearchResultToolbar } from 'lib/containers';

export const TimeseriesToolbar = ({
  onViewChange,
  currentView = 'list',
  query,
  filter,
  count,
}: {
  onViewChange?: (view: string) => void;
  currentView?: string;
  query: string;
  count?: number;
  filter?: any;
}) => {
  return (
    <>
      <SearchResultToolbar
        api={query?.length > 0 ? 'search' : 'list'}
        type="files"
        filter={filter}
        count={count}
        query={query}
      >
        <ButtonGroup onButtonClicked={onViewChange} currentKey={currentView}>
          <ButtonGroup.Button key="list" icon="List" />
          <ButtonGroup.Button key="grid" icon="Grid" />
        </ButtonGroup>
      </SearchResultToolbar>
    </>
  );
};
