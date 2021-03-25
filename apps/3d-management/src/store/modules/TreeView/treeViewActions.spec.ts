import { fetchInitialNodes } from 'src/store/modules/TreeView/treeViewActions';
import { setupServer } from 'msw/node';
import { mswHandlers } from 'src/pages/RevisionDetails/components/ToolbarTreeView/__testUtils__/mswHandlers';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import {
  fixtureModelId,
  fixtureRevisionId,
} from 'src/pages/RevisionDetails/components/ToolbarTreeView/__testUtils__/fixtures/fixtureConsts';
import { getInitialState } from 'src/store/modules/TreeView/treeViewReducer';
import {
  InitialFetch,
  InitialFetchOk,
  TreeViewState,
} from 'src/store/modules/TreeView/types';
import { RootState } from 'src/store';
import { CustomDataNode } from 'src/pages/RevisionDetails/components/TreeView/types';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

const server = setupServer(...mswHandlers);

const getState = (
  treeViewParts: Partial<TreeViewState> = {}
): Pick<RootState, 'treeView'> => {
  return {
    treeView: Object.assign(
      getInitialState(),
      { revisionId: fixtureRevisionId, modelId: fixtureModelId },
      treeViewParts
    ),
  };
};

describe('treeViewActions test cases', () => {
  beforeAll(() => server.listen());

  // Reset any runtime request handlers we may add during the tests.
  afterEach(() => server.resetHandlers());

  afterAll(() => server.close());

  test('Nodes must be sorted by title', async () => {
    const store = mockStore(getState());

    const expectedActionTypes: [
      InitialFetch['type'],
      InitialFetchOk['type']
    ] = ['treeView/initialFetch', 'treeView/initialFetchOk'];

    await store.dispatch(fetchInitialNodes(fixtureModelId, fixtureRevisionId));
    const actualActions = store.getActions() as [InitialFetch, InitialFetchOk];

    expect(actualActions.map(({ type }) => type)).toEqual(expectedActionTypes);

    // nodes are sorted by node name
    expect(
      actualActions[1].payload[0].children!.reduce(
        (acc: Array<string>, node: CustomDataNode) => {
          if (!('cursor' in node)) {
            acc.push(node.meta.name);
          }
          return acc;
        },
        []
      )
    ).toEqual(['Camera', 'Cube', 'Light']);

    // todo: check sort after expandArbitraryNode for non-existing node (it's fetched and placed correctly)
    //       check sort after loadSiblings (Load more...)
  });
});
