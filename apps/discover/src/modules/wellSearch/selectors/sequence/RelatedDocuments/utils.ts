import chunk from 'lodash/chunk';
import isEmpty from 'lodash/isEmpty';
import { SavedSearchContent } from 'services/savedSearches';

import { DocumentsFilter } from '@cognite/sdk-playground';

import { TableResults } from 'components/tablev3';
import {
  AggregateNames,
  DocumentResultFacets,
  DocumentsFacets,
  DocumentType,
} from 'modules/documentSearch/types';

// return an numbers list of selected wellbore ids
export const getSelectedWellboreIds = (
  selectedWellboreIds: TableResults
): number[] => {
  return Object.keys(selectedWellboreIds).reduce(
    (result: number[], key) =>
      selectedWellboreIds[key] ? [...result, Number(key)] : result,
    []
  );
};

export const formatAssetIdsFilter = (
  selectedWellboreIds: string[] | number[],
  v3Enabled: boolean,
  limit = 100
): { filters: DocumentsFilter }[] => {
  let key = 'assetExternalIds';

  if (!v3Enabled) {
    key = 'assetIds';
  }

  if (isEmpty(selectedWellboreIds)) {
    return [];
  }

  const batchSelectedWellboreIds = chunk<string | number>(
    selectedWellboreIds,
    limit
  );

  return batchSelectedWellboreIds.map((wellboreIds) => {
    return {
      filters: {
        [key]: {
          containsAny: wellboreIds,
        },
      },
    };
  });
};

export const filterBySelectedWellboreIds = (
  wellBoreIds: number[],
  allDocuments: DocumentType[]
) => {
  const documents: DocumentType[] = [];
  wellBoreIds.forEach((wellbore) => {
    allDocuments.forEach((document) => {
      if (document.doc.assetIds?.includes(wellbore)) {
        documents.push(document);
      }
    });
  });
  return documents;
};

export const getFilterQuery = (searchOption?: SavedSearchContent) => ({
  phrase: searchOption?.query || '',
  geoFilter: [],
  facets: {
    filetype: searchOption?.filters.documents?.facets.filetype || [],
    labels: searchOption?.filters.documents?.facets.labels || [],
    lastcreated: searchOption?.filters.documents?.facets.lastcreated || [],
    lastmodified: searchOption?.filters.documents?.facets.lastmodified || [],
    location: searchOption?.filters.documents?.facets.location || [],
    pageCount: searchOption?.filters.documents?.facets.pageCount || [],
  },
});

export const getMergedFacets = (
  staticFacets: DocumentResultFacets,
  dynamicFacets: DocumentResultFacets,
  filterFacets: DocumentsFacets
) => {
  return (Object.keys(staticFacets) as AggregateNames[]).reduce(
    (newFacets, field) => {
      const options = staticFacets[field];
      const newOptio = options.map((option) => {
        const newFacet = dynamicFacets[field].find(
          (dynamicFacet) => dynamicFacet.key === option.key
        );
        if (newFacet) {
          let selectedOptions: string[] = [];
          if (field === 'filetype' || field === 'location') {
            selectedOptions = filterFacets[field];
          } else if (field === 'labels') {
            selectedOptions = filterFacets[field].map((row) => row.externalId);
          }
          return {
            ...option,
            count: newFacet.count,
            selected: selectedOptions.includes(option.key),
          };
        }
        return { ...option, count: 0 };
      });
      return {
        ...newFacets,
        [field]: newOptio,
      };
    },
    { ...staticFacets }
  );
};
