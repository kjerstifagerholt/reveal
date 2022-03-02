import '@testing-library/jest-dom/extend-expect';
import '@testing-library/jest-dom';
import isUndefined from 'lodash/isUndefined';

import * as mocks from '@cognite/metrics/dist/mocks';

import { configureLocalStorageMock } from '__test-utils/mockLocalstorage';

export const TEST_PROJECT = 'testProject';

// console.warn = jest.fn();

jest.mock('@cognite/metrics', () => mocks);
jest.setTimeout(3000);

jest.mock('react-i18next', () => {
  const { ...rest } = jest.requireActual('react-i18next');

  return {
    ...rest,
    useTranslation: () => ({ t: (key: string) => key }),
  };
});
jest.mock('@cognite/react-i18n', () => {
  return {
    useTranslation: () => ({ t: (key: string) => key }),
  };
});

configureLocalStorageMock();

if (isUndefined(window.URL.createObjectURL)) {
  Object.defineProperty(window.URL, 'createObjectURL', { value: jest.fn() });
}
