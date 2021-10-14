import { Row } from 'react-table';

import {
  DocumentsAggregate,
  DocumentsAggregatesResponse as DocumentsAggregatesSDKResponse,
  DocumentsFilter,
  DocumentsSearch,
  DocumentsSearchWrapper,
} from '@cognite/sdk-playground';
import { Geometry, GeoJson } from '@cognite/seismic-sdk-js';

// Document state

export interface DocumentState {
  currentDocumentQuery: DocumentQuery;
  result: DocumentResult;
  selectedDocumentIds: string[];
  hoveredDocumentId?: string;
  isSearching: boolean;
  isLoading: boolean;
  typeAheadResults: any[];
  selectedColumns: string[];
  previewedEntities: DocumentType[];
  isInitialized: boolean;
  errorMessage: string;
  displayInformationModal: boolean;
  viewMode: ViewMode;
  labels: Labels;
}
export interface Labels {
  [s: string]: string;
}

// other types:

export interface SearchHighlight {
  externalId?: string[];
  name?: string[];
  content?: string[];
}

export type DateRange = {
  min?: number;
  max?: number;
};

export interface Result {
  query: DocumentsSearch;
  filter: DocumentsFilter;
}

export interface DocumentResult {
  count: number;
  hits: DocumentType[];
  facets: DocumentResultFacets;
  aggregates?: DocumentsAggregate[];
}

export interface DocumentLabel {
  externalId: string;
}

export interface DocumentMetadata {
  id: string;
  filename: string;
  filepath: string;
  filetype: string;
  labels: DocumentLabel[];
  location: string;
  author: string;
  title?: string;
  creationdate: string;
  lastmodified: string;
  filesize?: number;
  topfolder: string;
  truncatedContent?: string;
  assetIds?: number[];
}

export interface DocumentHighlight {
  content: string[];
}

export interface DocumentType {
  // data state
  id: string;
  externalId?: string;
  doc: DocumentMetadata;
  highlight: DocumentHighlight;
  filepath?: string;
  title?: string;
  labels?: string[];
  filename?: string;
  geolocation: Geometry | null;

  // ui state
  selected?: boolean;
  duplicates?: DocumentType[];
  truncatedContent?: string;
}

export interface DocumentTypeDataModel extends DocumentType {
  // holds short format dates
  created: Date;
  modified: Date;
  size: string;
}

export interface QueryFacet {
  selected?: boolean;
  name: string;
  key: string;
}
export interface DocumentQueryFacet extends QueryFacet {
  count: number;
}

export type DocumentQueryFacetsNames =
  | 'labels'
  | 'location'
  | 'filetype'
  | 'lastcreated'
  | 'lastmodified';

// officialy facets for unstructured search
export type DocumentQueryFacets = Record<AggregateNames, DocumentQueryFacet[]>;

export type AggregateNames =
  | 'labels'
  | 'location'
  | 'filetype'
  | 'lastcreated'
  | 'lastUpdatedTime'; // this is the backup for lastmodified, incase its not set

export type DocumentResultFacets = Record<AggregateNames, DocumentQueryFacet[]>;

/**
 * This is the structure that we pass into document service. This should decouple app from api side.
 */
export interface SearchQueryFull {
  phrase: string;
  facets: DocumentsFacets;
  geoFilter: GeoJson[];
}

// we dont use most of these fields
// let's slowly transition to the above 'DocumentQueryNew'
// which only has fields that are used with CDF
export interface DocumentQuery {
  hasSearched: boolean; // <- needed, eventually move into query
  searchForSensitive: boolean;
}
export type ViewMode = 'card' | 'table';

export interface Column {
  field: string;
  name: string;
}

export interface AvailableColumn extends Column {
  selected?: boolean;
  disabled?: boolean;
}

/**
 * Document filters
 */

export interface DocumentsFacetLabels {
  externalId: string;
}

export interface DocumentsFacets {
  filetype: string[];
  labels: DocumentsFacetLabels[];
  lastmodified: string[];
  lastcreated: string[];
  location: string[];
}

export type DocumentFacet = keyof DocumentsFacets;

/**
 * Document Facet structure is not human friendly (Displayable)
 * This type is to store display able structure of a facet
 */
export interface FormattedFacet {
  facet: DocumentFacet;
  facetNameDisplayFormat: string;
  facetValueDisplayFormat: string;
}

export type DocumentsAggregatesResponse = DocumentsAggregatesSDKResponse<
  DocumentsSearchWrapper[]
>;

export type DocumentRowType = Row<DocumentTypeDataModel>;

export type CategoryResponse = {
  facets: DocumentQueryFacet[];
  total: number;
};

export enum DocumentFilterCategoryTitles {
  filetype = 'File Type',
  labels = 'Document Category',
  location = 'Source',
  lastmodified = 'Last Modified',
  lastcreated = 'Created',
}

export type FacetsCounts = {
  [key: string]: number;
};
