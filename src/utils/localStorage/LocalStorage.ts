import { ExplorerState } from 'src/modules/Explorer/types';
import { explorerReducerInitialState } from 'src/modules/Explorer/store/slice';
import {
  processReducerInitialState,
  ProcessReducerState,
} from 'src/modules/Process/store/slice';
import {
  initialState as annotationLabelReducerInitialState,
  AnnotationLabelReducerState,
} from 'src/modules/Review/store/annotationLabel/slice';
import {
  reviewReducerInitialState,
  ReviewReducerState,
} from 'src/modules/Review/store/reviewSlice';
import { RootState } from 'src/store/rootReducer';
import sdk from '@cognite/cdf-sdk-singleton';
import { validatePersistedState } from 'src/utils/localStorage/validatePersistedState';

// To invalidate stored state when braking changes are added to the state
// bump up the version
export const APP_STATE_VERSION = 1;

export const loadState = (): Partial<RootState> | undefined => {
  try {
    const serializedState = localStorage.getItem('state');
    if (serializedState) {
      const { stateMeta, ...persistedState } = JSON.parse(
        serializedState
      ) as OfflineState;
      if (
        validatePersistedState(stateMeta.project, stateMeta.appStateVersion)
      ) {
        return {
          annotationLabelReducer: {
            ...annotationLabelReducerInitialState,
            ...persistedState.annotationLabelReducer,
          },
          reviewSlice: {
            ...reviewReducerInitialState,
            ...persistedState.reviewSlice,
          },
          explorerReducer: {
            ...explorerReducerInitialState,
            ...persistedState.explorerSlice,
          },
          processSlice: {
            ...processReducerInitialState,
            ...persistedState.processSlice,
          },
        };
      }
    }
    return {
      annotationLabelReducer: {
        ...annotationLabelReducerInitialState,
      },
      reviewSlice: {
        ...reviewReducerInitialState,
      },
      explorerReducer: {
        ...explorerReducerInitialState,
      },
      processSlice: {
        ...processReducerInitialState,
      },
    };
  } catch (err) {
    return undefined;
  }
};

export const saveState = (state: any): void => {
  try {
    const serializedState = JSON.stringify(getOfflineState(state));
    localStorage.setItem('state', serializedState);
  } catch (err) {
    console.error('Localstorage state error', err);
  }
};

export type OfflineState = {
  annotationLabelReducer: Pick<
    AnnotationLabelReducerState,
    'predefinedAnnotations'
  >;
  reviewSlice: Pick<ReviewReducerState, 'fileIds'>;
  explorerSlice: Pick<
    ExplorerState,
    'filter' | 'query' | 'sortMeta' | 'focusedFileId'
  >;
  processSlice: Pick<
    ProcessReducerState,
    | 'fileIds'
    | 'jobs'
    | 'files'
    | 'selectedDetectionModels'
    | 'availableDetectionModels'
  >;
  stateMeta: {
    project: string;
    appStateVersion: number;
  };
};

const getOfflineState = (state: RootState): OfflineState => {
  const offState: OfflineState = {
    annotationLabelReducer: {
      predefinedAnnotations: state.annotationLabelReducer.predefinedAnnotations,
    },
    reviewSlice: {
      fileIds: state.reviewSlice.fileIds,
    },
    explorerSlice: {
      filter: state.explorerReducer.filter,
      query: state.explorerReducer.query,
      sortMeta: state.explorerReducer.sortMeta,
      focusedFileId: state.explorerReducer.focusedFileId,
    },
    processSlice: {
      fileIds: state.processSlice.fileIds,
      jobs: state.processSlice.jobs,
      files: state.processSlice.files,
      selectedDetectionModels: state.processSlice.selectedDetectionModels,
      availableDetectionModels: state.processSlice.availableDetectionModels,
    },
    stateMeta: {
      project: sdk.project,
      appStateVersion: APP_STATE_VERSION,
    },
  };
  return offState;
};
