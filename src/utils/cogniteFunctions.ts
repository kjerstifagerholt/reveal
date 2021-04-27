import { useSDK } from '@cognite/sdk-provider';
import zipWith from 'lodash/zipWith';
import { CogniteClient, DoubleDatapoint } from '@cognite/sdk';
import {
  useMutation,
  useQuery,
  useQueryClient,
  UseQueryOptions,
} from 'react-query';
import { FunctionCallStatus } from 'reducers/charts/types';

type CogniteFunction = {
  id: number;
  externalId?: string;
  name: string;
  fileId: number;
  description?: string;
};

export interface FunctionCall {
  id: number;
  functionId: number;
  startTime?: number;
  endTime?: number;
  status: FunctionCallStatus;
}

export const useFunctionCall = (
  functionId: number,
  callId: number,
  queryOpts?: UseQueryOptions<FunctionCall>
) => {
  const sdk = useSDK();
  return useQuery<FunctionCall>(
    ['functions', functionId, 'call', callId],
    () =>
      sdk
        .get(
          `/api/playground/projects/${sdk.project}/functions/${functionId}/calls/${callId}`
        )
        .then((r) => r.data),
    { ...queryOpts, retry: 1, retryDelay: 1000 }
  );
};

export const functionResponseKey = (functionId: number, callId: number) => [
  'functions',
  functionId,
  'call',
  callId,
  'response',
];
export const useFunctionReponse = (
  functionId: number,
  callId: number,
  opts?: UseQueryOptions<string | null | undefined>
) => {
  const sdk = useSDK();
  return useQuery<string | null | undefined>(
    functionResponseKey(functionId, callId),
    () =>
      sdk
        .get(
          `/api/playground/projects/${sdk.project}/functions/${functionId}/calls/${callId}/response`
        )
        .then((r) => r.data.response),
    { ...opts, retry: 1, retryDelay: 1000 }
  );
};

export const useCallFunction = (externalId: string) => {
  const sdk = useSDK();
  const cache = useQueryClient();
  return useMutation(async ({ data }: { data: any }) => {
    const functions = await cache.fetchQuery<CogniteFunction[]>(
      ['functions'],
      () =>
        sdk
          .get(`/api/playground/projects/${sdk.project}/functions`)
          .then((r) => r.data?.items)
    );

    const fn = functions.find((f) => f.externalId === externalId);
    if (!fn) {
      return Promise.reject(
        new Error(`Could not find function '${externalId}'`)
      );
    }

    const call = await cache.fetchQuery<{ id: number }>(
      ['functions', 'calls', fn.id, data],
      () =>
        sdk
          .post(
            `/api/playground/projects/${sdk.project}/functions/${fn.id}/call`,
            { data: { data } }
          )
          .then((r) => r.data)
    );

    return {
      functionId: fn.id,
      callId: call.id,
    };
  });
};

export const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export const transformSimpleCalcResult = ({
  value,
  timestamp,
}: {
  value?: number[];
  timestamp?: number[];
}) =>
  value?.length && timestamp?.length
    ? zipWith(value, timestamp, (v, t) => ({
        value: v,
        timestamp: new Date(t),
      }))
    : ([] as DoubleDatapoint[]);

export async function getFunctionResponseWhenDone(
  sdk: CogniteClient,
  fnId: number,
  callId: number
) {
  type FunctionCall = {
    status: 'Running' | 'Completed' | 'Failed' | 'Timeout';
  };
  let status: FunctionCall = await sdk
    .get(
      `/api/playground/projects/${sdk.project}/functions/${fnId}/calls/${callId}`
    )
    .then((r) => r.data);

  while (!['Failed', 'Completed', 'Timeout'].includes(status?.status)) {
    // eslint-disable-next-line no-await-in-loop
    await sleep(1000);
    // eslint-disable-next-line no-await-in-loop
    status = await sdk
      .get(
        `/api/playground/projects/${sdk.project}/functions/${fnId}/calls/${callId}`
      )
      .then((r) => r.data);
  }
  const response = await sdk
    .get(
      `/api/playground/projects/${sdk.project}/functions/${fnId}/calls/${callId}/response`
    )
    .then((r) => r.data.response);

  return response;
}
