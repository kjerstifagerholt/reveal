import React, { useState } from 'react';
import { FileFilterProps, FileInfo } from '@cognite/sdk';
import { FileGridPreview, FileTable } from 'lib/containers/Files';
import {
  SelectableItemsProps,
  TableStateProps,
  DateRangeProps,
} from 'lib/CommonProps';
import { GridTable } from 'lib/components';
import { ResultTableLoader } from 'lib/containers/ResultTableLoader';
import { RelatedResourceType } from 'lib/hooks/RelatedResourcesHooks';
import { ResourceItem } from 'lib/types';
import { FileToolbar } from './FileToolbar';

export const FileSearchResults = ({
  query = '',
  filter = {},
  showRelatedResources = false,
  relatedResourceType,
  parentResource,
  count,
  allowEdit = false,
  onClick,
  ...extraProps
}: {
  query?: string;
  items?: FileInfo[];
  filter?: FileFilterProps;
  showRelatedResources?: boolean;
  relatedResourceType?: RelatedResourceType;
  parentResource?: ResourceItem;
  count?: number;
  allowEdit?: boolean;
  onClick: (item: FileInfo) => void;
} & SelectableItemsProps &
  TableStateProps &
  DateRangeProps) => {
  const [currentView, setCurrentView] = useState<string>('list');

  return (
    <>
      <FileToolbar
        query={query}
        filter={filter}
        onFileClicked={file => {
          onClick(file);
          return true;
        }}
        currentView={currentView}
        onViewChange={setCurrentView}
        allowEdit={allowEdit}
        count={count}
      />
      <ResultTableLoader<FileInfo>
        type="file"
        mode={showRelatedResources ? 'relatedResources' : 'search'}
        filter={filter}
        query={query}
        parentResource={parentResource}
        relatedResourceType={relatedResourceType}
        {...extraProps}
      >
        {props =>
          currentView === 'grid' ? (
            <GridTable
              {...props}
              onEndReached={() => props.onEndReached!({ distanceFromEnd: 0 })}
              onItemClicked={file => onClick(file)}
              {...extraProps}
              renderCell={cellProps => <FileGridPreview {...cellProps} />}
            />
          ) : (
            <FileTable
              {...props}
              onRowClick={file => {
                onClick(file);
                return true;
              }}
            />
          )
        }
      </ResultTableLoader>
    </>
  );
};
