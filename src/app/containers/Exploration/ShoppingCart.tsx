import React, { useMemo } from 'react';
import styled from 'styled-components';
import {
  Icon,
  Colors,
  Button,
  Dropdown,
  Menu,
  Overline,
} from '@cognite/cogs.js';
import { ListItem, SpacedRow } from 'lib/components';
import copy from 'copy-to-clipboard';
import { useTenant, useEnv } from 'lib/hooks/CustomHooks';
import { ResourceItem, ResourceType } from 'lib/types';
import { useCdfItems } from '@cognite/sdk-react-query-hooks';
import {
  FileInfo,
  Asset,
  Timeseries,
  CogniteEvent,
  Sequence,
} from '@cognite/sdk';
import {
  useCollections,
  Collection,
  useUpdateCollections,
} from 'lib/hooks/CollectionsHooks';

export const ShoppingCartPreview = ({
  cart,
  setCart,
}: {
  cart: ResourceItem[];
  setCart: (cart: ResourceItem[]) => void;
}) => {
  const assetIds = cart
    .filter(el => el.type === 'asset')
    .map(({ id }) => ({ id }));
  const { data: assets = [] } = useCdfItems<Asset>('assets', assetIds);

  const fileIds = cart
    .filter(el => el.type === 'file')
    .map(({ id }) => ({ id }));
  const { data: files = [] } = useCdfItems<FileInfo>('files', fileIds);

  const eventIds = cart
    .filter(el => el.type === 'event')
    .map(({ id }) => ({ id }));
  const { data: events = [] } = useCdfItems<CogniteEvent>('events', eventIds);

  const timeseriesIds = cart
    .filter(el => el.type === 'timeSeries')
    .map(({ id }) => ({ id }));
  const { data: timeseries = [] } = useCdfItems<Timeseries>(
    'timeseries',
    timeseriesIds
  );

  const sequenceIds = cart
    .filter(el => el.type === 'sequence')
    .map(({ id }) => ({ id }));
  const { data: sequences = [] } = useCdfItems<Sequence>(
    'sequences',
    sequenceIds
  );

  const tenant = useTenant();
  const env = useEnv();

  const { data: collections } = useCollections();
  const [updateCollections] = useUpdateCollections();

  const [
    assetCollections,
    fileCollections,
    eventCollections,
    tsCollections,
    sequenceCollections,
  ] = useMemo(() => {
    return (collections || []).reduce(
      (prev, el) => {
        switch (el.type) {
          case 'asset':
            prev[0].push(el);
            break;
          case 'file':
            prev[1].push(el);
            break;
          case 'event':
            prev[2].push(el);
            break;
          case 'timeSeries':
            prev[3].push(el);
            break;
          case 'sequence':
            prev[4].push(el);
            break;
        }
        return prev;
      },
      [[], [], [], [], []] as Collection[][]
    );
  }, [collections]);

  const onDeleteClicked = (item: { id: number }) => {
    setCart(cart.filter(el => el.id !== item.id));
  };

  const renderDeleteItemButton = (item: { id: number }) => (
    <Icon
      style={{
        alignSelf: 'center',
        color: Colors.danger.hex(),
      }}
      type="Delete"
      onClick={() => onDeleteClicked(item)}
    />
  );

  const addToCollection = (
    collection: Collection,
    currentItems: { id: number }[]
  ) => {
    updateCollections([
      {
        id: collection.id,
        update: {
          operationBody: {
            items: collection.operationBody.items.concat(
              currentItems
                .filter(
                  asset =>
                    !collection.operationBody.items.some(
                      (item: any) => item.id === asset.id
                    )
                )
                .map(({ id }) => ({ id }))
            ),
          },
        },
      },
    ]);
  };

  const collectionContainsItems = (
    collection: Collection,
    items: { id: number }[]
  ) =>
    items.every(item =>
      collection.operationBody.items.some((el: any) => el.id === item.id)
    );

  const generateButton = (type: ResourceType) => {
    let renderedCollections;
    let currentItems: { id: number }[];
    switch (type) {
      case 'asset':
        renderedCollections = assetCollections;
        currentItems = assets;
        break;
      case 'file':
        renderedCollections = fileCollections;
        currentItems = files;
        break;
      case 'event':
        renderedCollections = eventCollections;
        currentItems = events;
        break;
      case 'timeSeries':
        renderedCollections = tsCollections;
        currentItems = timeseries;
        break;
      case 'sequence':
        renderedCollections = sequenceCollections;
        currentItems = sequences;
        break;
    }
    return (
      <Dropdown
        content={
          <Menu>
            <Menu.Header>
              <Overline level={2}>COLLECTIONS</Overline>
              {renderedCollections.map(collection => {
                const containsItems = collectionContainsItems(
                  collection,
                  currentItems
                );
                return (
                  <Menu.Item
                    key={collection.id}
                    disabled={containsItems}
                    onClick={() => addToCollection(collection, currentItems)}
                  >
                    <CollectionItem>
                      {collection.name}
                      {containsItems && <Icon type="Check" />}
                    </CollectionItem>
                  </Menu.Item>
                );
              })}
            </Menu.Header>
          </Menu>
        }
      >
        <Button size="small" variant="ghost">
          Add to
        </Button>
      </Dropdown>
    );
  };

  return (
    <div style={{ width: 300, position: 'relative' }}>
      <div style={{ height: '400px', overflowY: 'auto' }}>
        {assets.length > 0 && (
          <ResourceTypeSection>
            <SpacedRow>
              <ResourceTypeHeader level={2} style={{ marginBottom: 8 }}>
                Assets
              </ResourceTypeHeader>
              <div className="spacer" />
              {generateButton('asset')}
            </SpacedRow>
            {assets.map(asset => (
              <ListItem
                key={asset.id}
                bordered
                title={
                  <div style={{ display: 'inline-flex', alignItems: 'center' }}>
                    <Icon
                      style={{
                        alignSelf: 'center',
                        marginRight: '4px',
                      }}
                      type="DataStudio"
                    />
                    <span>{asset ? asset.name : 'Loading'}</span>
                  </div>
                }
              >
                {renderDeleteItemButton(asset)}
              </ListItem>
            ))}
          </ResourceTypeSection>
        )}
        {timeseries.length > 0 && (
          <ResourceTypeSection>
            <SpacedRow>
              <ResourceTypeHeader level={2} style={{ marginBottom: 8 }}>
                Time series
              </ResourceTypeHeader>
              <div className="spacer" />
              {generateButton('timeSeries')}
            </SpacedRow>
            {timeseries.map(ts => (
              <ListItem
                key={ts.id}
                bordered
                title={
                  <div style={{ display: 'inline-flex', alignItems: 'center' }}>
                    <Icon
                      style={{
                        alignSelf: 'center',
                        marginRight: '4px',
                      }}
                      type="Timeseries"
                    />
                    <span>{ts ? ts.name : 'Loading...'}</span>
                  </div>
                }
              >
                {renderDeleteItemButton(ts)}
              </ListItem>
            ))}
          </ResourceTypeSection>
        )}
        {files.length > 0 && (
          <ResourceTypeSection>
            <SpacedRow>
              <ResourceTypeHeader level={2} style={{ marginBottom: 8 }}>
                Files
              </ResourceTypeHeader>
              <div className="spacer" />
              {generateButton('file')}
            </SpacedRow>
            {files.map(file => (
              <ListItem
                key={file.id}
                bordered
                title={
                  <div style={{ display: 'inline-flex', alignItems: 'center' }}>
                    <Icon
                      style={{
                        alignSelf: 'center',
                        marginRight: '4px',
                      }}
                      type="Document"
                    />
                    <span>{file ? file.name : 'Loading...'}</span>
                  </div>
                }
              >
                {renderDeleteItemButton(file)}
              </ListItem>
            ))}
          </ResourceTypeSection>
        )}
        {events.length > 0 && (
          <ResourceTypeSection>
            <SpacedRow>
              <ResourceTypeHeader level={2} style={{ marginBottom: 8 }}>
                Events
              </ResourceTypeHeader>
              <div className="spacer" />
              {generateButton('event')}
            </SpacedRow>
            {events.map(event => (
              <ListItem
                key={event.id}
                bordered
                title={
                  <div style={{ display: 'inline-flex', alignItems: 'center' }}>
                    <Icon
                      style={{
                        alignSelf: 'center',
                        marginRight: '4px',
                      }}
                      type="Events"
                    />
                    <span>{event ? event.id : 'Loading'}</span>
                  </div>
                }
              >
                {renderDeleteItemButton(event)}
              </ListItem>
            ))}
          </ResourceTypeSection>
        )}
        {sequences.length > 0 && (
          <ResourceTypeSection>
            <SpacedRow>
              <ResourceTypeHeader level={2} style={{ marginBottom: 8 }}>
                Sequences
              </ResourceTypeHeader>
              <div className="spacer" />
              {generateButton('sequence')}
            </SpacedRow>
            {sequences.map(sequence => (
              <ListItem
                key={sequence.id}
                bordered
                title={
                  <div style={{ display: 'inline-flex', alignItems: 'center' }}>
                    <Icon
                      style={{
                        alignSelf: 'center',
                        marginRight: '4px',
                      }}
                      type="Duplicate"
                    />
                    <span>{sequence ? sequence.name : 'Loading'}</span>
                  </div>
                }
              >
                {renderDeleteItemButton(sequence)}
              </ListItem>
            ))}
          </ResourceTypeSection>
        )}
      </div>
      <div style={{ width: '100%', display: 'flex', alignItems: 'center' }}>
        <Button
          style={{ flex: 1 }}
          type="primary"
          onClick={() => {
            const dataStr = `data:text/json;charset=utf-8,${encodeURIComponent(
              JSON.stringify(cart)
            )}`;
            const dlAnchorElem = document.createElement('a');
            dlAnchorElem.setAttribute('href', dataStr);
            dlAnchorElem.setAttribute('download', 'resources.json');
            dlAnchorElem.click();
          }}
        >
          Download JSON
        </Button>
        <Dropdown
          content={
            <Menu>
              <Menu.Item
                onClick={() => {
                  const urls = [];
                  if (assets.length > 0) {
                    urls.push(
                      `Assets?$filter=${assets
                        .map(item => `(Id eq ${item.id})`)
                        .join(' or ')}`
                    );
                  }
                  if (timeseries.length > 0) {
                    urls.push(
                      `Timeseries?$filter=${timeseries
                        .map(item => `(Id eq ${item.id})`)
                        .join(' or ')}`
                    );
                  }
                  if (files.length > 0) {
                    urls.push(
                      `Files?$filter=${files
                        .map(item => `(Id eq ${item.id})`)
                        .join(' or ')}`
                    );
                  }
                  copy(
                    JSON.stringify(
                      urls.map(
                        el =>
                          `https://${
                            env || 'api'
                          }.cognitedata.com/odata/v1/projects/${tenant}/${el}`
                      )
                    )
                  );
                }}
              >
                <Icon type="Copy" />
                Copy OData Queries
              </Menu.Item>
            </Menu>
          }
        >
          <Button variant="ghost" icon="VerticalEllipsis" />
        </Dropdown>
      </div>
    </div>
  );
};

const CollectionItem = styled.div`
  justify-content: space-between;
  width: 100%;
  display: flex;
`;

const ResourceTypeHeader = styled(Overline)`
  margin-top: 8px;
`;

const ResourceTypeSection = styled(Overline)`
  margin-bottom: 8px;
`;

// https://api.cognitedata.com/odata/v1/projects/contextualization/Assets?$filter=(Id eq 51865490571) or (Id eq 52579923080)
