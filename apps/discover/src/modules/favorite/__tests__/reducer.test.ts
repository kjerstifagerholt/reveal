import favoriteReducer, {
  hideCreateFavoriteModal,
  setItemsToAddAfterFavoriteIsCreated,
  showCreateFavoriteModal,
} from '../reducer';

describe('favourite reducer', () => {
  const getInitialState: any = () => {
    const initialState = {
      isCreateModalVisible: false,
      viewMode: 1,
    };
    return { initialState };
  };

  test(`should open create modal`, () => {
    const { initialState } = getInitialState();
    const state = favoriteReducer(initialState, showCreateFavoriteModal());
    expect(state.isCreateModalVisible).toBeTruthy();
  });

  test(`should hide create modal`, () => {
    const { initialState } = getInitialState();
    const state = favoriteReducer(initialState, hideCreateFavoriteModal());
    expect(state.isCreateModalVisible).toBeFalsy();
  });

  test(`should set items to add after creation correctly`, () => {
    const { initialState } = getInitialState();
    const state = favoriteReducer(
      initialState,
      setItemsToAddAfterFavoriteIsCreated({
        documentIds: [1],
        wells: { 1: [] },
      })
    );
    expect(state.itemsToAddAfterFavoriteCreation).toEqual({
      documentIds: [1],
      wells: { 1: [] },
    });
  });

  test(`should set items to add after creation to undefined`, () => {
    const initialState = { ...getInitialState(), lastCreatedSetId: '1234' };
    const state = favoriteReducer(
      initialState,
      setItemsToAddAfterFavoriteIsCreated(undefined)
    );
    expect(state.itemsToAddAfterFavoriteCreation).toBeUndefined();
  });
});
