import React, { useEffect, useState } from 'react';
import { AutoComplete } from '@cognite/cogs.js';
import sdk from 'services/CogniteSDK';
import { StorableNode, ConfigPanelComponentProps } from '../types';

type FunctionData = {
  timeSeriesExternalId: string;
};

export const effect = async (funcData: FunctionData) => {
  if (!funcData.timeSeriesExternalId) {
    throw new Error('No external id given in config');
  }
  const datapoints = await sdk.datapoints.retrieve({
    items: [{ externalId: funcData.timeSeriesExternalId }],
  });
  return {
    datapoints: datapoints[0].datapoints,
  };
};

export const effectId = 'DATAPOINTS';

export const configPanel = ({
  node,
  onUpdateNode,
}: ConfigPanelComponentProps) => {
  const [inputValue, setInputValue] = useState<string>('');
  const { functionData } = node;
  useEffect(() => {
    if (functionData.timeSeriesExternalId) {
      sdk.timeseries
        .retrieve([{ externalId: functionData.timeSeriesExternalId }])
        .then((timeseries) => {
          setInputValue(timeseries[0]?.name || '');
        });
    }
  }, [functionData.timeSeriesExternalId]);

  const loadOptions = (
    input: string,
    callback: (options: { value?: string; label?: string }[]) => void
  ) => {
    sdk.timeseries
      .search({
        filter: {
          isString: false,
        },
        search: {
          query: input,
        },
      })
      .then((results) => {
        callback(
          results.map((result) => ({
            value: result.externalId,
            label: result.name,
          }))
        );
      });
  };

  return (
    <div>
      <h4>CDF Timeseries</h4>
      <AutoComplete
        mode="async"
        theme="dark"
        loadOptions={loadOptions}
        onChange={(nextValue: { value: string; label: string }) => {
          onUpdateNode({
            functionData: {
              timeSeriesExternalId: nextValue.value,
            },
          });
        }}
        value={{ value: functionData.timeSeriesExternalId, label: inputValue }}
      />
    </div>
  );
};

export const node = {
  title: 'CDF Datapoints',
  subtitle: 'DATAPOINTS',
  color: '#FC2574',
  icon: 'Function',
  inputPins: [],
  outputPins: [
    {
      id: 'datapoints',
      title: 'Datapoints',
      type: 'TIMESERIES',
    },
  ],
  functionEffectReference: effectId,
  functionData: {
    timeSeriesExternalId: undefined,
  },
} as StorableNode;
