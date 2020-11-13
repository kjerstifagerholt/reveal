import React, {
  useEffect,
  useRef,
  useState,
  useContext,
  useCallback,
} from 'react';
import {
  ResourceItem,
  ResourcePreviewProvider,
  SearchFilters,
  ResourceTypeTabs,
  SearchResults,
} from 'lib';
import ExplorationNavBar from 'app/containers/Exploration/ExplorationNavbar';
import { trackUsage, Timer, trackTimedUsage } from 'app/utils/Metrics';
import ResourceSelectionContext, {
  useResourceFilter,
  useQuery,
  useSelectedResource,
  useResourceEditable,
} from 'app/context/ResourceSelectionContext';
import { useDebounce } from 'use-debounce/lib';
import styled from 'styled-components';
import ResourcePreview from 'app/containers/Exploration/ResourcePreview';
import { lightGrey } from 'lib/utils/Colors';
import { useCurrentResourceType, useCurrentResourceId } from './hooks';
import FilterToggleButton from './FilterToggleButton';
import RedirectToFirstId from './RedirectToFirstId';

const Wrapper = styled.div`
  display: flex;
  flex-direction: row;
  width: 100%;
  height: calc(100% - 56px);
  background: #fff;
  overflow: hidden;
`;

function SearchPage() {
  const [
    currentResourceType,
    setCurrentResourceType,
  ] = useCurrentResourceType();
  const [activeId, openPreview] = useCurrentResourceId();
  const [showFilter, setShowFilter] = useState(false);
  const [query] = useQuery();
  const [debouncedQuery] = useDebounce(query, 100);

  const editable = useResourceEditable();

  const [cart, setCart] = useState<ResourceItem[]>([]);
  const {
    setOnSelectListener,
    setResourcesState,
    assetFilter,
    setAssetFilter,
    timeseriesFilter,
    setTimeseriesFilter,
    sequenceFilter,
    setSequenceFilter,
    eventFilter,
    setEventFilter,
    fileFilter,
    setFileFilter,
    mode,
  } = useContext(ResourceSelectionContext);

  const onSelectListener = useCallback((item: ResourceItem) => {
    setCart(currentCart => {
      const index = currentCart.findIndex(
        el => el.type === item.type && el.id === item.id
      );
      if (index > -1) {
        return currentCart.slice(0, index).concat(currentCart.slice(index + 1));
      }
      return currentCart.concat([item]);
    });
  }, []);

  useEffect(() => {
    setOnSelectListener(() => onSelectListener);
  }, [setOnSelectListener, onSelectListener]);

  useEffect(() => {
    setResourcesState(cart.map(el => ({ ...el, state: 'selected' })));
  }, [setResourcesState, cart]);

  const isSelected = useCallback(
    (item: ResourceItem) => {
      return cart.some(el => el.id === item.id && el.type === item.type);
    },
    [cart]
  );
  return (
    <ResourcePreviewProvider>
      <ResourceTypeTabs
        currentResourceType={currentResourceType}
        setCurrentResourceType={setCurrentResourceType}
      />
      <Wrapper>
        <RedirectToFirstId />
        <SearchFilters
          assetFilter={assetFilter}
          setAssetFilter={setAssetFilter}
          timeseriesFilter={timeseriesFilter}
          setTimeseriesFilter={setTimeseriesFilter}
          sequenceFilter={sequenceFilter}
          setSequenceFilter={setSequenceFilter}
          eventFilter={eventFilter}
          setEventFilter={setEventFilter}
          fileFilter={fileFilter}
          setFileFilter={setFileFilter}
          resourceType={currentResourceType}
          closeFilters={() => setShowFilter(false)}
          visible={showFilter}
        />
        <div style={{ width: 440 }}>
          <ExplorationNavBar
            beforeSearchInput={
              !showFilter ? (
                <FilterToggleButton
                  toggleOpen={() => setShowFilter(!showFilter)}
                />
              ) : undefined
            }
          />
          <SearchResultWrapper
            style={{
              marginRight: 16,
              paddingRight: 16,
              borderRight: `1px solid ${lightGrey}`,
            }}
          >
            <SearchResults
              query={debouncedQuery}
              assetFilter={assetFilter}
              timeseriesFilter={timeseriesFilter}
              sequenceFilter={sequenceFilter}
              eventFilter={eventFilter}
              fileFilter={fileFilter}
              resourceType={currentResourceType}
              allowEdit={editable}
              onClick={item => openPreview(item.id)}
              onSelect={onSelectListener}
              selectionMode={mode}
              isSelected={isSelected}
              activeIds={activeId ? [activeId] : []}
            />
          </SearchResultWrapper>
        </div>

        <div style={{ flex: 1 }}>
          <SearchResultWrapper>
            <ResourcePreview type={currentResourceType} />
          </SearchResultWrapper>
        </div>
      </Wrapper>
    </ResourcePreviewProvider>
  );
}

export const SearchResultsPage = () => {
  const [resourceType] = useCurrentResourceType();

  const [query] = useQuery();
  const filter = useResourceFilter(resourceType);
  const { selectedResource } = useSelectedResource();

  useEffect(() => {
    trackUsage('Exploration.ResourceType', { resourceType });
  }, [resourceType]);

  useEffect(() => {
    trackUsage('Exploration.Filter', { resourceType, filter });
  }, [resourceType, filter]);

  useEffect(() => {
    if (query) {
      trackUsage('Exploration.Query', { query });
    }
  }, [query]);

  const timer = useRef<Timer>();

  useEffect(() => {
    if (selectedResource) {
      trackUsage('Exploration.PreviewResource', selectedResource);
      if (timer.current) {
        timer.current.stop({
          type: selectedResource.type,
          id: selectedResource.id,
        });
      }
    } else {
      timer.current = trackTimedUsage('Exploration.SearchTime');
    }

    return () => timer.current?.stop();
  }, [selectedResource]);

  return <SearchPage />;
};

const SearchResultWrapper = styled.div`
  flex: 1 1 auto;
  display: flex;
  flex-direction: column;
  overflow: auto;
  height: 100%;
`;
