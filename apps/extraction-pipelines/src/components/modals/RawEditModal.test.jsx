import { fireEvent, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { QueryClient } from 'react-query';
import { sdkv3 } from '@cognite/cdf-sdk-singleton';
import { RawEditModal, RawEditModalView } from 'components/modals/RawEditModal';
import {
  databaseListMock,
  getMockResponse,
  mockDataSetResponse,
} from 'utils/mockResponse';
import { renderWithReQueryCacheSelectedExtpipeContext } from 'utils/test/render';
import { render } from 'utils/test';
import {
  CDF_ENV_GREENFIELD,
  ORIGIN_DEV,
  PROJECT_ITERA_INT_GREEN,
} from 'utils/baseURL';
import { DetailFieldNames } from 'model/Extpipe';
import { useRawDBAndTables } from 'hooks/useRawDBAndTables';

jest.mock('hooks/useRawDBAndTables', () => {
  return {
    useRawDBAndTables: jest.fn(),
  };
});
describe('RawEditModal', () => {
  const mockData = databaseListMock;
  let wrapper = null;
  let client;
  const extpipe = getMockResponse()[0];
  const dataSetMock = mockDataSetResponse()[0];
  const cancelMock = jest.fn();
  beforeEach(() => {
    jest.resetAllMocks();
    client = new QueryClient();
    wrapper = renderWithReQueryCacheSelectedExtpipeContext(
      client,
      PROJECT_ITERA_INT_GREEN,
      CDF_ENV_GREENFIELD,
      ORIGIN_DEV,
      extpipe
    );
  });
  afterEach(() => {
    wrapper = null;
  });

  test('Should call onSave with the new table as param', async () => {
    const close = jest.fn();
    const onSave = jest.fn();
    render(
      <RawEditModalView
        close={close}
        onSave={onSave}
        initial={[]}
        databases={[
          {
            database: { name: 'Good db' },
            tables: [{ name: 'Table A' }, { name: 'Table B' }],
          },
        ]}
      />
    );

    fireEvent.change(screen.getByRole('textbox'), {
      target: { value: 'Table A' },
    });

    screen.getByText('Good db • Table A').click();

    screen.getByText('Add new table').click();

    screen.getByText('Confirm').click();

    expect(onSave).toHaveBeenCalledWith([
      {
        dbName: 'Good db',
        tableName: 'Table A',
      },
    ]);
  });

  test.skip('Renders stored raw tables', async () => {
    useRawDBAndTables.mockReturnValue({ isLoading: false, data: mockData });
    sdkv3.get.mockResolvedValue({ data: extpipe });
    sdkv3.datasets.retrieve.mockResolvedValue([dataSetMock]);

    render(<RawEditModal visible onCancel={cancelMock} />, {
      wrapper: wrapper.wrapper,
    });
    expect(screen.getByText(DetailFieldNames.RAW_TABLE)).toBeInTheDocument();
    const storedDb = extpipe.rawTables[0].dbName;
    await waitFor(() => {
      expect(screen.getByText(storedDb)).toBeInTheDocument();
    });
    // eslint-disable-next-line no-unused-expressions
    extpipe?.rawTables?.forEach(({ dbName, tableName }) => {
      expect(screen.getByText(dbName)).toBeInTheDocument();
      expect(screen.getByText(tableName)).toBeInTheDocument();
    });
  });
});
