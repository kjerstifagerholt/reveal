import { renderHook } from '@testing-library/react-hooks';
import { setupServer } from 'msw/node';

import { UMSUserProfilePreferences } from '@cognite/user-management-service-types';

import { getMockUserMe } from '__mocks/mockUmsMe';
import { testWrapper } from '__test-utils/renderer';
import { UserPrefferedUnit } from 'constants/units';

import {
  useUserPreferencesMeasurement,
  useUserPreferencesMeasurementByMeasurementEnum,
} from '../useUserPreferences';

const startServer = (options = {}) => {
  const networkMocks = setupServer(getMockUserMe(options));
  networkMocks.listen();
  return () => networkMocks.close();
};

describe('useUserPreferencesMeasurement hook', () => {
  const renderHookWithStore = async () => {
    const { result, waitForNextUpdate } = renderHook(
      () => useUserPreferencesMeasurement(),
      {
        wrapper: ({ children }) => testWrapper({ children }),
      }
    );
    await waitForNextUpdate();
    return result.current;
  };

  it('Get defaulted to ft when not response from react query', async () => {
    const closeServer = startServer({ measurement: undefined });
    expect(await renderHookWithStore()).toBe(UserPrefferedUnit.FEET);
    closeServer();
  });

  it('Return respective unit for unit returned from react query', async () => {
    const closeServer = startServer({ measurement: 'meter' });
    expect(await renderHookWithStore()).toBe(UserPrefferedUnit.METER);
    closeServer();
  });

  // -it.only('Return error when api return a unit that we do not supports', async () => {
  //   const closeServer = startServer({ measurement: 'millimeter' });
  //   expect(() => renderHookWithStore()).toThrowError(
  //     Error('Unit: milimeter, is not supported')
  //   );
  //   closeServer();
  // });
});

describe('useUserPreferencesMeasurementByMeasurementEnum hook', () => {
  const renderHookWithStore = async () => {
    const { result, waitForNextUpdate } = renderHook(
      () => useUserPreferencesMeasurementByMeasurementEnum(),
      {
        wrapper: ({ children }) => testWrapper({ children }),
      }
    );
    await waitForNextUpdate();
    return result.current;
  };

  it('Get defaulted to ft when not response from react query', async () => {
    const closeServer = startServer({ measurement: undefined });
    expect(await renderHookWithStore()).toBe(
      UMSUserProfilePreferences.MeasurementEnum.Feet
    );
    closeServer();
  });

  it('Return respective unit for unit returned from react query', async () => {
    const closeServer = startServer();
    expect(await renderHookWithStore()).toBe(
      UMSUserProfilePreferences.MeasurementEnum.Meter
    );
    closeServer();
  });
});
