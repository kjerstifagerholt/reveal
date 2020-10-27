import React, { useContext, useState, useEffect } from 'react';
import queryString from 'query-string';
import { ResourceItem, ResourceType } from 'lib/types';
import {
  AssetFilterProps,
  TimeseriesFilter,
  FileFilterProps,
  EventFilter,
  SequenceFilter,
} from '@cognite/sdk';
import { useHistory } from 'react-router-dom';

export type ResourceSelectionMode = 'single' | 'multiple' | 'none';
export type ResourceItemState = ResourceItem & {
  state: 'disabled' | 'active' | 'selected';
};
export type OnSelectListener = (items: ResourceItem) => void;

export type ResourceSelectionObserver = {
  mode: ResourceSelectionMode;
  setMode: (newMode: ResourceSelectionMode) => void;
  allowEdit: boolean;
  setAllowEdit: (newMode: boolean) => void;
  resourcesState: ResourceItemState[];
  setResourcesState: React.Dispatch<React.SetStateAction<ResourceItemState[]>>;
  resourceTypes: ResourceType[];
  setResourceTypes: (newTypes: ResourceType[]) => void;
  assetFilter: AssetFilterProps;
  setAssetFilter: React.Dispatch<React.SetStateAction<AssetFilterProps>>;
  timeseriesFilter: TimeseriesFilter;
  setTimeseriesFilter: React.Dispatch<React.SetStateAction<TimeseriesFilter>>;
  fileFilter: FileFilterProps;
  setFileFilter: React.Dispatch<React.SetStateAction<FileFilterProps>>;
  eventFilter: EventFilter;
  setEventFilter: React.Dispatch<React.SetStateAction<EventFilter>>;
  sequenceFilter: SequenceFilter['filter'];
  setSequenceFilter: React.Dispatch<
    React.SetStateAction<SequenceFilter['filter']>
  >;
  onSelect: OnSelectListener;
  setOnSelectListener: React.Dispatch<React.SetStateAction<OnSelectListener>>;
  queryKey: string;
  selectedResource: ResourceItem | undefined;
  setSelectedResource: React.Dispatch<
    React.SetStateAction<ResourceItem | undefined>
  >;
};

export const ResourceSelectionContext = React.createContext({
  resourcesState: [] as ResourceItemState[],
} as ResourceSelectionObserver);
ResourceSelectionContext.displayName = 'ResourceSelectionContext';

export const useResourceTypes = () => {
  const observer = useContext(ResourceSelectionContext);
  return observer.resourceTypes;
};

export const useResourceMode = () => {
  const observer = useContext(ResourceSelectionContext);
  return { mode: observer.mode, setMode: observer.setMode };
};

export const useResourceEditable = () => {
  const observer = useContext(ResourceSelectionContext);
  return observer.allowEdit;
};

export const useQuery: () => [string, (q: string) => void] = () => {
  const history = useHistory();
  const key = useContext(ResourceSelectionContext).queryKey;
  const search = queryString.parse(history.location.search);
  const query = (search[key] || '') as string;

  const setQuery = (q?: string) =>
    history.push({
      pathname: history.location.pathname,
      search: queryString.stringify({
        ...search,
        [key]: q || undefined,
      }),
    });
  return [query, setQuery];
};

export const useSelectResource = () => {
  const observer = useContext(ResourceSelectionContext);
  return observer.onSelect;
};

export const useSetOnSelectResource = () => {
  const observer = useContext(ResourceSelectionContext);
  return observer.setOnSelectListener;
};

export const useResourcesState = () => {
  const observer = useContext(ResourceSelectionContext);
  return {
    resourcesState: observer.resourcesState,
    setResourcesState: observer.setResourcesState,
  };
};

export const useResourceFilter = (type: ResourceType) => {
  const observer = useContext(ResourceSelectionContext);
  switch (type) {
    case 'asset': {
      return observer.assetFilter;
    }
    case 'event': {
      return observer.eventFilter;
    }
    case 'file': {
      return observer.fileFilter;
    }
    case 'sequence': {
      return observer.sequenceFilter;
    }
    case 'timeSeries': {
      return observer.timeseriesFilter;
    }
    default:
      throw new Error('Unknown sdk type');
  }
};

export const useResourceFilters = () => {
  const observer = useContext(ResourceSelectionContext);
  return {
    assetFilter: observer.assetFilter,
    timeseriesFilter: observer.timeseriesFilter,
    eventFilter: observer.eventFilter,
    sequenceFilter: observer.sequenceFilter,
    fileFilter: observer.fileFilter,
  };
};

export const useSelectedResource = () => {
  const observer = useContext(ResourceSelectionContext);
  return {
    selectedResource: observer.selectedResource,
    setSelectedResource: observer.setSelectedResource,
  };
};

const defaultOnSelect = () => {};

export type ResourceSelectionProps = {
  /**
   * Allow users to have access to editing/creating utilities
   */
  allowEdit?: boolean;
  /**
   * Mode of the selection journey, defaults to 'none'
   */
  mode?: ResourceSelectionMode;
  /**
   * Allowed resource types, default is all resources
   */
  resourceTypes?: ResourceType[];
  /**
   * The initial asset filter
   */
  assetFilter?: AssetFilterProps;
  /**
   * The initial timeseries filter
   */
  timeseriesFilter?: TimeseriesFilter;
  /**
   * The initial file filter
   */
  fileFilter?: FileFilterProps;
  /**
   * The initial event filter
   */
  eventFilter?: EventFilter;
  /**
   * The initial sequence filter
   */
  sequenceFilter?: SequenceFilter['filter'];
  /**
   * Resources' states (disabled, selected, active etc.)
   */
  resourcesState?: ResourceItemState[];
  /**
   * The callback when a resource is selected
   */
  onSelect?: OnSelectListener;

  /**
   * The search param where the currrent query is stored. Default value is 'query'.
   */
  queryKey?: string;

  children?: React.ReactNode;
};

const defaultMode = 'none';

export const ResourceSelectionProvider = ({
  allowEdit: propsAllowEdit,
  mode: initialMode,
  resourceTypes: initialResourceTypes,
  assetFilter: initialAssetFilter,
  timeseriesFilter: initialTimeseriesFilter,
  fileFilter: initialFileFilter,
  eventFilter: initialEventFilter,
  sequenceFilter: initialSequenceFilter,
  resourcesState: initialResourcesState,
  onSelect: initialOnSelect,
  queryKey = 'query',
  children,
}: ResourceSelectionProps) => {
  const [allowEdit, setAllowEdit] = useState<boolean>(propsAllowEdit || false);
  const [mode, setMode] = useState<ResourceSelectionMode>(
    initialMode || defaultMode
  );
  const [onSelect, setOnSelectListener] = useState<OnSelectListener>(
    () => initialOnSelect || defaultOnSelect
  );
  const [resourcesState, setResourcesState] = useState<ResourceItemState[]>(
    initialResourcesState || []
  );
  const [resourceTypes, setResourceTypes] = useState<ResourceType[]>(
    initialResourceTypes || ['asset', 'file', 'event', 'sequence', 'timeSeries']
  );
  const [assetFilter, setAssetFilter] = useState<AssetFilterProps>(
    initialAssetFilter || {}
  );
  const [timeseriesFilter, setTimeseriesFilter] = useState<TimeseriesFilter>(
    initialTimeseriesFilter || {}
  );
  const [fileFilter, setFileFilter] = useState<FileFilterProps>(
    initialFileFilter || {}
  );
  const [eventFilter, setEventFilter] = useState<EventFilter>(
    initialEventFilter || {}
  );
  const [sequenceFilter, setSequenceFilter] = useState<
    SequenceFilter['filter']
  >(initialSequenceFilter || {});
  const [selectedResource, setSelectedResource] = useState<ResourceItem>();

  useEffect(() => {
    if (initialResourcesState) {
      setResourcesState(initialResourcesState);
    }
  }, [initialResourcesState]);

  useEffect(() => {
    if (initialResourceTypes) {
      setResourceTypes(initialResourceTypes);
    }
  }, [initialResourceTypes]);

  useEffect(() => {
    if (initialMode) {
      setMode(initialMode);
    }
  }, [initialMode]);

  useEffect(() => {
    if (initialOnSelect) {
      setOnSelectListener(() => initialOnSelect);
    }
  }, [initialOnSelect]);

  return (
    <ResourceSelectionContext.Provider
      value={{
        allowEdit,
        setAllowEdit,
        mode,
        setMode,
        resourceTypes,
        setResourceTypes,
        assetFilter,
        setAssetFilter,
        timeseriesFilter,
        setTimeseriesFilter,
        fileFilter,
        setFileFilter,
        eventFilter,
        setEventFilter,
        sequenceFilter,
        setSequenceFilter,
        resourcesState,
        setResourcesState,
        onSelect,
        setOnSelectListener,
        queryKey,
        selectedResource,
        setSelectedResource,
      }}
    >
      {children}
    </ResourceSelectionContext.Provider>
  );
};
export default ResourceSelectionContext;
