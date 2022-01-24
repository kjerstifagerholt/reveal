import React, { useReducer } from 'react';
import { useSaveEquipment } from 'scarlet/hooks';

import { AppAction, AppActionType, AppState } from '.';
import { updateDataElementState } from './utils';

const equipmentInitialState = {
  unitName: '',
  equipmentName: '',
  pcms: { loading: true },
  documents: { loading: true },
  equipment: { loading: true },
  equipmentConfig: { loading: true },
  dataElementModal: undefined,
  saveState: { loading: false },
};

const initialState: AppState = {
  ...equipmentInitialState,
};

export const AppDispatchContext = React.createContext<
  React.Dispatch<AppAction>
>(() => null);
export const AppContext = React.createContext(initialState);

function reducer(state: AppState, action: AppAction) {
  switch (action.type) {
    case AppActionType.INIT_EQUIPMENT:
      return {
        ...state,
        unitName: action.unitName,
        equipmentName: action.equipmentName,
      };
    case AppActionType.SET_PCMS:
      return {
        ...state,
        pcms: action.pcms,
      };
    case AppActionType.SET_DOCUMENTS:
      return {
        ...state,
        documents: action.documents,
      };
    case AppActionType.SET_EQUIPMENT:
      return {
        ...state,
        equipment: action.equipment,
      };
    case AppActionType.SET_EQUIPMENT_CONFIG:
      return {
        ...state,
        equipmentConfig: action.config,
      };
    case AppActionType.SET_SAVE_SATE:
      return {
        ...state,
        saveState: action.saveState,
      };
    case AppActionType.UPDATE_DATA_ELEMENT_STATE: {
      const equipmentToSave = updateDataElementState(
        state.equipment.data!,
        action.dataElement,
        action.state,
        action.stateReason
      );

      return {
        ...state,
        saveState: {
          loading: true,
          data: equipmentToSave,
        },
      };
    }
    case AppActionType.CLEANUP_EQUIPMENT_DATA:
      return {
        ...state,
        ...equipmentInitialState,
      };
    case AppActionType.SHOW_DATA_ELEMENT_STATE_MODAL: {
      return {
        ...state,
        dataElementModal: {
          dataElement: action.dataElement,
          state: action.state,
        },
      };
    }
    case AppActionType.HIDE_DATA_ELEMENT_STATE_MODAL: {
      return {
        ...state,
        dataElementModal: undefined,
      };
    }
    case AppActionType.SET_EQUIPMENT_LIST:
      return {
        ...state,
        equipmentList: {
          unitName: action.unitName,
          equipments: action.equipments,
        },
      };
  }

  return state;
}

export const AppProvider: React.FC = (props) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  useSaveEquipment(
    state.unitName,
    state.equipmentName,
    state.saveState,
    dispatch
  );

  return (
    <AppContext.Provider value={state}>
      <AppDispatchContext.Provider value={dispatch} {...props} />
    </AppContext.Provider>
  );
};
