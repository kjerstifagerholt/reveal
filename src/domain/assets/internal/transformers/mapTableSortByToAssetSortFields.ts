import { TableSortBy } from 'components/Table';
import { InternalSortBy } from 'domain/types';

export const mapTableSortByToAssetSortFields = (
  sortBy?: TableSortBy[]
): InternalSortBy[] | undefined => {
  if (!sortBy || sortBy.length === 0) return undefined;

  return sortBy.map(tableSort => {
    return {
      property: [tableSort.id],
      order: tableSort.desc ? 'desc' : 'asc',
    };
  });
};
