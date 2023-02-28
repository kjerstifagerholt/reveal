import { jestPreviewConfigure } from 'jest-preview';
import '@cognite/cogs.js/dist/cogs.css';
import '@testing-library/jest-dom';
import noop from 'lodash/noop';

window.URL.createObjectURL = noop;

jestPreviewConfigure({ autoPreview: true });

jest.mock('@cognite/cdf-sdk-singleton', () => ({
  getUserInformation: jest.fn().mockResolvedValue({ displayName: 'test-user' }),
}));
