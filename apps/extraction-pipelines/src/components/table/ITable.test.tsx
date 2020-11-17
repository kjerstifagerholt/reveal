import React from 'react';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import ITable from './ITable';
import { getMockResponse } from '../../utils/mockResponse';
import { getIntegrationTableCol } from './IntegrationTableCol';
import { renderWithSelectedIntegrationContext } from '../../utils/test/render';

describe('<ITable/>', () => {
  const cols = getIntegrationTableCol();
  const mockIntegration = getMockResponse()[0];
  test('Render without errors', () => {
    renderWithSelectedIntegrationContext(
      <ITable data={getMockResponse()} columns={cols} />,
      { initIntegration: mockIntegration }
    );
    const colsWithHeaders = cols.filter((col) => col.Header);
    colsWithHeaders.forEach(({ Header }) => {
      const header = screen.getByText(Header);
      expect(header).toBeInTheDocument();
    });
  });

  test('render and interact with row selection', () => {
    renderWithSelectedIntegrationContext(
      <ITable data={getMockResponse()} columns={cols} />,
      { initIntegration: mockIntegration }
    );
    const sapLabel = screen.getByLabelText(getMockResponse()[1].name);
    fireEvent.click(sapLabel);
    expect((sapLabel as HTMLInputElement).checked).toEqual(true);
    const azureLabel = screen.getByLabelText(getMockResponse()[0].name);
    fireEvent.click(azureLabel);
    expect((azureLabel as HTMLInputElement).checked).toEqual(true);
    expect((sapLabel as HTMLInputElement).checked).toEqual(false);
  });

  test('render and interact with sort on header: Name', () => {
    renderWithSelectedIntegrationContext(
      <ITable data={getMockResponse()} columns={cols} />,
      { initIntegration: mockIntegration }
    );
    const nameHeader = screen.getByText(/name/i);
    const body = screen.getAllByRole('row');
    const firsRowContent = body[1].textContent;
    expect(firsRowContent).toContain('Azure Integration');
    fireEvent.click(nameHeader); // to filter acending
    fireEvent.click(nameHeader); // to filter decending
    const body2 = screen.getAllByRole('row');
    const firstRowContentAfterClick = body2[1].textContent;
    expect(firstRowContentAfterClick).not.toContain('Azure Integration');
    expect(firsRowContent).not.toEqual(firstRowContentAfterClick);
  });

  test('render and interact with global filter', async () => {
    renderWithSelectedIntegrationContext(
      <ITable data={getMockResponse()} columns={cols} />,
      { initIntegration: mockIntegration }
    );
    const searchInput = screen.getByPlaceholderText(/records/i);

    // should filter the sap integration
    fireEvent.change(searchInput, { target: { value: 'sap' } });
    await waitFor(() => {
      const resultRows = screen.getAllByRole('row');
      expect(resultRows.length).toEqual(2);
      // row[0] is the header
      expect(resultRows[1].textContent?.toLowerCase().includes('sap')).toEqual(
        true
      );
    });

    // clear search should show all rows
    fireEvent.change(searchInput, { target: { value: '' } });
    await waitFor(() => {
      const resultRows = screen.getAllByRole('row');
      expect(resultRows.length).toEqual(getMockResponse().length + 1);
    });

    // should filter based name column
    const searchString = 'birger';
    fireEvent.change(searchInput, { target: { value: searchString } });
    await waitFor(() => {
      const resultRows = screen.getAllByRole('row');
      expect(resultRows.length).toEqual(2);
      // row[0] is the header
      expect(
        resultRows[1].textContent?.toLowerCase().includes(searchString)
      ).toEqual(true);
    });

    // should filter from created by col
    const searchJacek = 'jacek';
    fireEvent.change(searchInput, { target: { value: searchJacek } });
    await waitFor(() => {
      const resultRows = screen.getAllByRole('row');
      expect(resultRows.length).toEqual(4);
      // row[0] is the header
      // created by displays only initials but the the search looks in the name of the users.
      expect(resultRows[1].textContent?.toLowerCase().includes('j')).toEqual(
        true
      );
    });
  });

  test('render and interact with filter on status', () => {
    renderWithSelectedIntegrationContext(
      <ITable data={getMockResponse()} columns={cols} />,
      { initIntegration: mockIntegration }
    );
    const nameHeader = screen.getByText(/status/i);
    fireEvent.click(nameHeader); // open status menu

    const statusFailMenuItem = screen.getByTestId(
      'status-marker-status-menu-fail'
    );
    const statusOKMenuItem = screen.getByTestId('status-marker-status-menu-ok');
    const statusAllMenuItem = screen.getByTestId('status-menu-all');
    expect(statusAllMenuItem).toBeInTheDocument();
    expect(statusOKMenuItem).toBeInTheDocument();
    expect(statusFailMenuItem).toBeInTheDocument();

    // click ok
    fireEvent.click(statusOKMenuItem);
    const bodyOK = screen.getAllByRole('row');
    expect(bodyOK.length).toEqual(2);
    const firsRowContent = bodyOK[1].textContent;
    expect(firsRowContent.toLowerCase().includes('ok')).toEqual(true);

    // click fail
    fireEvent.click(statusFailMenuItem);
    const bodyFail = screen.getAllByRole('row');
    expect(bodyFail.length).toEqual(4); // 3 fail + header
    const firsRowFail = bodyFail[1].textContent;
    expect(firsRowFail.toLowerCase().includes('fail')).toEqual(true);

    // click all
    fireEvent.click(statusAllMenuItem);
    const bodyAll = screen.getAllByRole('row');
    expect(bodyAll.length).toEqual(6); // 5 rows + header
  });
});
