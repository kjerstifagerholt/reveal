import 'domain/wells/__mocks/setupWellsMockSDK';
import { getMockNPTV3 } from 'domain/wells/npt/service/__fixtures/getMockNPTV3';
import { getMockNPTListPost } from 'domain/wells/npt/service/__mocks/getMockNPTListPost';

import { setupServer } from 'msw/node';

import { renderHookWithStore } from '__test-utils/renderer';

import {
  DEFAULT_NPT_COLOR,
  UNKNOWN_NPT_CODE,
  UNKNOWN_NPT_DETAIL_CODE,
} from '../../constants';
import { useNptEventsQuery } from '../useNptEventsQuery';

const mockServer = setupServer(getMockNPTListPost());

describe('useAllNptCursorsQuery', () => {
  beforeAll(() => mockServer.listen());
  afterAll(() => mockServer.close());

  it('should return expected result with input', async () => {
    const wellboreIds = [getMockNPTV3().wellboreMatchingId];

    const { result, waitForNextUpdate } = renderHookWithStore(() =>
      useNptEventsQuery({ wellboreIds })
    );

    await waitForNextUpdate();

    expect(result.current.data).toMatchObject([
      {
        ...getMockNPTV3(),
        nptCode: UNKNOWN_NPT_CODE,
        nptCodeDetail: UNKNOWN_NPT_DETAIL_CODE,
        nptCodeColor: DEFAULT_NPT_COLOR,
      },
    ]);
  });
});
