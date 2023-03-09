/* eslint no-console: 0 */
import '@testing-library/jest-dom';
import { configure } from 'enzyme';
import Adapter from '@wojtekmaj/enzyme-adapter-react-17';
import 'regenerator-runtime/runtime';

configure({ adapter: new Adapter() });

jest.mock('mixpanel-browser', () => {
  return {
    'data-exploration': {
      add_group: jest.fn(),
      identify: jest.fn(),
    },
  };
});
jest.mock('@data-exploration-app/utils/Metrics', () => ({
  trackUsage: jest.fn(),
}));

jest.mock('@cognite/unified-file-viewer', () => {
  return {
    ToolType: {
      RECTANGLE: 'rectangle',
      SELECT: 'select',
      ELLIPSE: 'ellipse',
      POLYLINE: 'polyline',
      LINE: 'line',
      TEXT: 'text',
      IMAGE: 'image',
      PAN: 'pan',
    },
  };
});

jest.mock('@cognite/cdf-utilities', () => ({
  createLink: jest.fn(),
}));
jest.mock('@cognite/sdk-provider', () => {
  return {
    useSDK: jest.fn(),
  };
});
