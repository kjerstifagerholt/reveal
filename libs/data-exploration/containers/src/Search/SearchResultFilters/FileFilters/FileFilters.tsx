import { FilterProps, SPECIFIC_INFO_CONTENT } from '@data-exploration-lib/core';
import { BaseFilterCollapse } from '@data-exploration/components'; //??
import { TempMultiSelectFix } from '../elements';
import {
  AuthorFilter,
  LabelFilter,
  MetadataFilter,
  SourceFilter,
  TypeFilter,
} from '../../../Filters';

export interface FileFilterProps extends FilterProps {
  enableDocumentLabelsFilter?: boolean;
}

// INFO: FileFilters is for documents.
export const FileFilters: React.FC<FileFilterProps> = ({
  enableDocumentLabelsFilter,
  query,
  filter,
  onFilterChange,
  onResetFilterClick,
  ...rest
}) => {
  const documentFilter = filter.document;
  const isResetButtonVisible = Boolean(
    documentFilter.labels ||
      documentFilter.metadata ||
      documentFilter.type ||
      documentFilter.author ||
      documentFilter.source
  );
  return (
    <BaseFilterCollapse.Panel
      title="Files"
      hideResetButton={!isResetButtonVisible}
      infoContent={SPECIFIC_INFO_CONTENT}
      onResetClick={() => onResetFilterClick('document')}
      {...rest}
    >
      <TempMultiSelectFix>
        {enableDocumentLabelsFilter && (
          <LabelFilter.File
            query={query}
            filter={documentFilter}
            value={documentFilter.labels}
            onChange={(newFilters) =>
              onFilterChange('document', { labels: newFilters })
            }
          />
        )}

        <TypeFilter.File
          query={query}
          filter={documentFilter}
          value={documentFilter.type}
          onChange={(newFilters) =>
            onFilterChange('document', { type: newFilters })
          }
        />

        <AuthorFilter.File
          query={query}
          filter={documentFilter}
          value={documentFilter.author}
          onChange={(newFilters) =>
            onFilterChange('document', { author: newFilters })
          }
        />

        <SourceFilter.File
          query={query}
          filter={documentFilter}
          value={documentFilter.source}
          onChange={(newSources) =>
            onFilterChange('document', {
              source: newSources,
            })
          }
        />

        <MetadataFilter.Files
          query={query}
          filter={documentFilter}
          values={documentFilter.metadata}
          onChange={(newMetadata) => {
            onFilterChange('document', {
              metadata: newMetadata,
            });
          }}
        />
      </TempMultiSelectFix>
    </BaseFilterCollapse.Panel>
  );
};
