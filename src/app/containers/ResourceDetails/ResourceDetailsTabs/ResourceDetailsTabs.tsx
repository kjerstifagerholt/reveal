import React, { useContext } from 'react';
import styled from 'styled-components';
import {
  Tabs,
  TabPaneProps,
  useRelatedResourceCounts,
  ResourceType,
  ResourceItem,
  getTitle,
} from '@cognite/data-exploration';
import { Badge, Colors } from '@cognite/cogs.js';
import { useHistory } from 'react-router-dom';
import { createLink } from '@cognite/cdf-utilities';
import ResourceSelectionContext from 'app/context/ResourceSelectionContext';
import { RelatedResources } from 'app/containers/ResourceDetails/RelatedResources/RelatedResources';

type ResouceDetailsTabsProps = {
  parentResource: ResourceItem;
  tab: string;
  additionalTabs?: React.ReactElement<TabPaneProps>[];
  excludedTypes?: ResourceType[];
  onTabChange: (tab: string) => void;
  style?: React.CSSProperties;
};

const defaultRelationshipTabs: ResourceType[] = [
  'asset',
  'file',
  'timeSeries',
  'event',
  'sequence',
];

const ResourceDetailTabContent = ({
  resource,
  type,
}: {
  resource: ResourceItem;
  type: ResourceType;
}) => {
  const history = useHistory();

  const { mode, onSelect, resourcesState } = useContext(
    ResourceSelectionContext
  );

  const isSelected = (item: ResourceItem) => {
    return resourcesState.some(
      el =>
        el.state === 'selected' && el.id === item.id && el.type === item.type
    );
  };

  return (
    <RelatedResources
      type={type}
      parentResource={resource}
      onItemClicked={(id: number) => {
        history.push(createLink(`/explore/${type}/${id}`));
      }}
      selectionMode={mode}
      onSelect={onSelect}
      isSelected={isSelected}
    />
  );
};

export const ResourceDetailsTabs = ({
  parentResource,
  tab,
  additionalTabs = [],
  excludedTypes = [],
  onTabChange,
  style = { paddingLeft: '16px' },
}: ResouceDetailsTabsProps) => {
  const { counts } = useRelatedResourceCounts(parentResource);

  const filteredTabs = defaultRelationshipTabs.filter(
    type => !excludedTypes.includes(type)
  );

  let assetCount = counts.asset || '0';
  if (parentResource.type === 'asset') {
    const assetCountWithoutSeparator = assetCount.split(',').join('');
    let parsedAssetCount = parseInt(assetCountWithoutSeparator, 10);
    parsedAssetCount = Number.isNaN(parsedAssetCount) ? 0 : parsedAssetCount;
    parsedAssetCount =
      parentResource.type === 'asset'
        ? Math.max(parsedAssetCount - 1, 0)
        : parsedAssetCount;
    assetCount = parsedAssetCount
      .toString()
      .replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }

  const relationshipTabs = filteredTabs.map(key => (
    <Tabs.Pane
      key={key}
      title={
        <>
          <TabTitle>{getTitle(key)}</TabTitle>
          <Badge
            text={key === 'asset' ? assetCount : counts[key]!}
            background={Colors['greyscale-grey3'].hex()}
          />
        </>
      }
    >
      <ResourceDetailTabContent
        resource={parentResource}
        type={key as ResourceType}
      />
    </Tabs.Pane>
  ));
  const tabs = [...additionalTabs, ...relationshipTabs];

  return (
    <Tabs tab={tab} onTabChange={onTabChange} style={style}>
      {tabs}
    </Tabs>
  );
};

export const TabTitle = styled.span`
  font-size: 14px;
  font-weight: 600;
`;
