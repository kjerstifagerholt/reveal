import React from 'react';
import ReactDOM from 'react-dom';
import { MemoryRouter } from 'react-router';
import { CogFunction, Call } from 'types/Types';

import { render, screen, fireEvent } from '@testing-library/react';

import { sleep } from 'helpers';
import TestWrapper from 'utils/TestWrapper';
import sdk from '@cognite/cdf-sdk-singleton';

import Functions from './Functions';

jest.mock('@cognite/cdf-utilities', () => ({
  PageTitle: () => null,
  getProject: jest.fn().mockReturnValue('mockProject'),
}));

jest.mock('@cognite/react-feature-flags', () => ({
  useFlag: jest.fn(),
}));

const mockFunction = ({
  name: 'testFunc',
  id: 1,
  createdTime: new Date(),
  owner: 'somebody@cognite.com',
  description: 'some description',
  status: 'Ready',
  externalId: 'externalid',
} as unknown) as CogFunction;
const mockCall = ({
  id: 100,
  startTime: new Date(),
  endTime: new Date(),
  status: 'Completed',
} as unknown) as Call;
const mockFunction2 = ({
  fileId: 1,
  name: 'secondFunc',
  id: 2,
  createdTime: new Date(),
  owner: 'somebody@cognite.com',
  description: 'some description',
  status: 'Ready',
} as unknown) as CogFunction;

jest.mock('@cognite/cdf-sdk-singleton', () => {
  return {
    get: jest.fn(() =>
      Promise.resolve({
        data: { items: [mockFunction, mockFunction2] },
      })
    ),
    post: jest.fn(() => mockCall),
  };
});
const mockedSdk = sdk as jest.Mocked<typeof sdk>;

const wrap = (node: React.ReactNode) =>
  render(<TestWrapper>{node}</TestWrapper>);

describe('Functions', () => {
  it('renders without crashing', () => {
    expect(() => {
      const div = document.createElement('div');
      ReactDOM.render(
        <MemoryRouter>
          <Functions />
        </MemoryRouter>,
        div
      );
      ReactDOM.unmountComponentAtNode(div);
    }).not.toThrow();
  });

  it('should load functions and calls upon mount', async () => {
    const useEffect = jest.spyOn(React, 'useEffect');
    wrap(<Functions />);

    await sleep(100);

    expect(useEffect).toHaveBeenCalled();
    expect(mockedSdk.get).toHaveBeenCalled();

    expect(mockedSdk.get).toHaveBeenCalledWith(
      '/api/playground/projects/mockProject/functions'
    );
  });

  it('should refresh functions when button is clicked', async () => {
    wrap(<Functions />);
    await sleep(100);

    mockedSdk.get.mockClear();
    expect(sdk.get).not.toHaveBeenCalledWith(
      '/api/playground/projects/mockProject/functions'
    );

    await sleep(100);

    const refreshButton = screen.getByRole('button', {
      name: /refresh/i,
    });

    fireEvent.click(refreshButton);
    expect(refreshButton).toBeDefined();

    expect(sdk.get).toHaveBeenCalledWith(
      '/api/playground/projects/mockProject/functions'
    );
  });

  it('should update functions shown if search field is filled', async () => {
    const { container } = wrap(<Functions />);
    expect(await screen.findAllByText('testFunc')).toHaveLength(1);

    const functionsDisplayed = container.getElementsByClassName(
      'ant-collapse-item'
    );

    expect(functionsDisplayed.length).toBe(2);
    const search = screen.getByPlaceholderText(
      'Search by name, external id, or owner'
    );
    fireEvent.change(search, { target: { value: 'second' } });
    const functionsDisplayedAfterSearch = container.getElementsByClassName(
      'ant-collapse-item'
    );

    mockedSdk.get.mockClear();
    expect(functionsDisplayedAfterSearch).toHaveLength(1);
  });

  it('search field is case insensitive', async () => {
    const { container } = wrap(<Functions />);

    expect(await screen.findAllByText('testFunc')).toHaveLength(1);

    const functionsDisplayed = container.getElementsByClassName(
      'ant-collapse-item'
    );
    expect(functionsDisplayed.length).toBe(2);
    const search = screen.getByPlaceholderText(
      'Search by name, external id, or owner'
    );
    fireEvent.change(search, { target: { value: 'SECOND' } });
    const functionsDisplayedAfterSearch = container.getElementsByClassName(
      'ant-collapse-item'
    );

    expect(functionsDisplayedAfterSearch).toHaveLength(1);
  });
});
