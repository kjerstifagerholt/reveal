import '@testing-library/jest-dom/extend-expect';

import { renderComponent } from '@data-exploration-components/__test-utils/renderer';

import { screen } from '@testing-library/react';

import { FilterEmptyState, FilterEmptyStateProps } from '../FilterEmptyState';

describe('NestedFilter/FilterEmptyState', () => {
  const testInit = (props: FilterEmptyStateProps = {}) => {
    return renderComponent(FilterEmptyState, props);
  };

  it('should show default empty state text', () => {
    testInit();
    expect(screen.getByText('No options')).toBeTruthy();
  });

  it('should show passed empty state text', () => {
    const text = 'Custom empty state text';
    testInit({ text });
    expect(screen.getByText(text)).toBeTruthy();
  });
});
