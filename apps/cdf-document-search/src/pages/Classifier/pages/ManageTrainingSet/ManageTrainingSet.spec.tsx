import { screen } from '@testing-library/react';
import React from 'react';
import { testRender } from 'apps/cdf-document-search/src/utils/test/render';
import {
  mockClassifierName,
  mockProject,
} from 'apps/cdf-document-search/src/__mocks__/sdk';
import { ManageTrainingSets } from './ManageTrainingSet';

jest.mock('react-router-dom', () => ({
  useParams: () => ({
    project: mockProject,
    classifierName: mockClassifierName,
  }),
  useLocation: () => ({ search: '' }),
  useNavigate: () => undefined,
}));

describe('page:ManageTrainingSet', () => {
  it('works', () => {
    testRender(<ManageTrainingSets Widget={jest.fn()} />);

    expect(screen.getByTestId('add-labels').getAttribute('aria-disabled')).toBe(
      'false'
    );
  });
});
