import { sdkv3 } from '@cognite/cdf-sdk-singleton';
import { QueryCache } from 'react-query';
import { fireEvent, screen } from '@testing-library/react';
import { renderHook } from '@testing-library/react-hooks';
import { act } from 'react-dom/test-utils';
import React from 'react';
import { useIntegrations } from '../../hooks/useIntegrations';
import { getMockResponse } from '../../utils/mockResponse';
import {
  CDF_ENV_GREENFIELD,
  ORIGIN_DEV,
  PROJECT_ITERA_INT_GREEN,
  renderWithReactQueryCacheProvider,
  renderWithSelectedIntegrationContext,
} from '../../utils/test/render';
import IntegrationsTable from './IntegrationsTable';

describe('IntegrationsTable', () => {
  test('Render table with out fail', async () => {
    sdkv3.get.mockResolvedValue({ data: { items: getMockResponse() } });
    const queryCache = new QueryCache();
    const wrapper = renderWithReactQueryCacheProvider(
      queryCache,
      PROJECT_ITERA_INT_GREEN,
      ORIGIN_DEV,
      CDF_ENV_GREENFIELD
    );
    renderWithSelectedIntegrationContext(
      <IntegrationsTable tableData={getMockResponse()} />,
      {
        wrapper,
        initIntegration: null,
      }
    );
    await act(async () => {
      const { waitFor } = renderHook(() => useIntegrations(), {
        wrapper,
      });
      await waitFor(() => {
        const sidePanelHeading = screen.getByRole('table');
        expect(sidePanelHeading).toBeInTheDocument();
      });
    });
  });
  test('Open FailMessageModal', async () => {
    const mockData = getMockResponse();
    sdkv3.get.mockResolvedValue({ data: { items: mockData } });
    const queryCache = new QueryCache();
    const wrapper = renderWithReactQueryCacheProvider(
      queryCache,
      PROJECT_ITERA_INT_GREEN,
      ORIGIN_DEV,
      CDF_ENV_GREENFIELD
    );
    renderWithSelectedIntegrationContext(
      <IntegrationsTable tableData={mockData} />,
      {
        wrapper,
        initIntegration: null,
      }
    );

    const failStatusButtons = screen.getAllByText('FAIL');

    fireEvent.click(failStatusButtons[0]);

    const modal = screen.getByText('Fail message');
    expect(modal).toBeInTheDocument();

    const name = screen.getByTestId('details-name').textContent;
    expect(name).toBe('SAP Integration');

    const externalId = screen.getByText(/dataIntegration0002/i);
    expect(externalId).toBeInTheDocument();

    const closeBtn = screen.getByText('Close');
    fireEvent.click(closeBtn);
    expect(modal).not.toBeInTheDocument();
  });
});
