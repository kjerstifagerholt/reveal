import React, { useState } from 'react';
import styled from 'styled-components';
import {
  ResourceSelectionProvider,
  ResourceItemState,
} from 'context/ResourceSelectionContext';
import { action } from '@storybook/addon-actions';
import { text } from '@storybook/addon-knobs';
import { TimeseriesTable } from './TimeseriesTable';
import { timeseries } from './timeseries';

export default {
  title: 'Molecules/TimeseriesTable',
  component: TimeseriesTable,
  decorators: [(storyFn: any) => <Wrapper>{storyFn()}</Wrapper>],
};

export const Example = () => {
  return (
    <TimeseriesTable
      timeseries={timeseries}
      onTimeseriesClicked={action('onTimeseriesClicked')}
      query={text('query', '')}
    />
  );
};
export const ExampleSingleSelect = () => {
  return (
    <ResourceSelectionProvider mode="single">
      <TimeseriesTable
        timeseries={timeseries}
        onTimeseriesClicked={action('onTimeseriesClicked')}
        query={text('query', '')}
      />
    </ResourceSelectionProvider>
  );
};

const Wrapper = ({ children }: { children: React.ReactNode }) => {
  const [selection, setSelection] = useState<ResourceItemState[]>([
    { id: 1635401930580505, type: 'timeSeries', state: 'selected' },
  ]);

  const onSelect = newItem => {
    const index = selection.findIndex(
      el => el.id === newItem.id && el.type === newItem.type
    );
    if (index !== -1) {
      setSelection(
        selection.slice(0, index).concat(selection.slice(index + 1))
      );
    } else {
      setSelection(selection.concat([{ ...newItem, state: 'selected' }]));
    }
  };
  return (
    <ResourceSelectionProvider
      mode="none"
      resourcesState={selection}
      onSelect={onSelect}
    >
      <Container>{children}</Container>
    </ResourceSelectionProvider>
  );
};

const Container = styled.div`
  padding: 20px;
  width: 100%;
  height: 600px;
  background: grey;
  display: flex;
  position: relative;

  && > * {
    background: #fff;
  }
`;
