import { useSDK } from '@cognite/sdk-provider';
import { CogniteError } from '@cognite/sdk';
import {
  QueryKey,
  useQuery,
  useQueryClient,
  UseQueryOptions,
} from '@tanstack/react-query';
import { PropertyAggregate } from 'common/types';
import { SourceType, TargetType } from 'context/QuickMatchContext';
import { fetchProperties as fetchTSProperties } from './timeseries';
import { fetchProperties as fetchEventProperties } from './events';
import { fetchProperties as fetchAssetProperties } from './assets';

type T = SourceType | TargetType;

export const getAggregateKey = (t: T): QueryKey => ['aggregate', t];
export const useAggregateProperties = (
  t: T,
  options?: UseQueryOptions<PropertyAggregate[], CogniteError>
) => {
  const sdk = useSDK();
  const queryClient = useQueryClient();
  return useQuery(
    getAggregateKey(t),
    () => {
      switch (t) {
        case 'timeseries': {
          return fetchTSProperties(sdk, queryClient);
        }
        case 'assets': {
          return fetchAssetProperties(sdk, queryClient);
        }
        case 'events':
          return fetchEventProperties(sdk, queryClient);
        default: {
          return Promise.reject(`type: ${t} not implemented`);
        }
      }
    },
    options
  );
};
