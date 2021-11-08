import {
  createSelector,
  createSlice,
  PayloadAction,
  isFulfilled,
  isAnyOf,
  createAction,
} from '@reduxjs/toolkit';
import {
  Asset,
  FileGeoLocation,
  Label,
  Metadata,
} from '@cognite/cdf-sdk-singleton';
import isEqual from 'lodash-es/isEqual';
import { createSelectorCreator, defaultMemoize } from 'reselect';
import { DeleteFilesById } from 'src/store/thunks/Files/DeleteFilesById';
import { FetchFilesById } from 'src/store/thunks/Files/FetchFilesById';
import { UpdateFiles } from 'src/store/thunks/Files/UpdateFiles';
import { createFileInfo } from 'src/store/util/StateUtils';
import { clearFileState } from 'src/store/commonActions';
import { makeReducerSelectAllFilesWithFilter } from 'src/store/commonReducers';
import { SelectFilter } from 'src/modules/Common/types';

export type VisionAsset = Omit<
  Asset,
  'createdTime' | 'lastUpdatedTime' | 'sourceCreatedType'
> & { createdTime: number; lastUpdatedTime: number };

export type FileState = {
  id: number;
  createdTime: number;
  lastUpdatedTime: number;
  sourceCreatedTime?: number;
  mimeType?: string;
  name: string;
  source?: string;
  uploaded: boolean;
  uploadedTime?: number;
  labels?: Label[];
  metadata?: Metadata;
  linkedAnnotations: string[];
  assetIds?: number[];
  geoLocation?: FileGeoLocation;
};

export type State = {
  dataSetIds?: number[];
  extractExif?: boolean;
  files: {
    byId: Record<number, FileState>;
    allIds: number[];
    selectedIds: number[];
  };
};

const initialState: State = {
  dataSetIds: undefined,
  extractExif: true,
  // eslint-disable-next-line global-require
  // files: require('src/store/fakeFiles.json'),

  files: {
    byId: {},
    allIds: [],
    selectedIds: [],
  },
};

export const setSelectedAllFiles = createAction<{
  selectStatus: boolean;
  filter?: SelectFilter;
}>('setSelectedAllFiles');

const filesSlice = createSlice({
  name: 'filesSlice',
  initialState,
  /* eslint-disable no-param-reassign */
  reducers: {
    addFiles: {
      prepare: (files: FileState[]) => {
        return { payload: files };
      },
      reducer: (state, action: PayloadAction<FileState[]>) => {
        const files = action.payload;

        files.forEach((file) => {
          updateFileState(state, file);
        });
      },
    },
    setDataSetIds(state, action: PayloadAction<number[] | undefined>) {
      state.dataSetIds = action.payload;
    },
    setExtractExif(state, action: PayloadAction<boolean>) {
      state.extractExif = action.payload;
    },
    setFileSelectState: {
      prepare: (id: number, selected: boolean) => {
        return { payload: { fileId: id, selectState: selected } };
      },
      reducer: (
        state,
        action: PayloadAction<{ fileId: number; selectState: boolean }>
      ) => {
        const { fileId } = action.payload;
        if (fileId) {
          const alreadySelected = state.files.selectedIds.includes(fileId);
          if (alreadySelected) {
            const index = state.files.selectedIds.findIndex(
              (id) => id === fileId
            );
            state.files.selectedIds.splice(index, 1);
          } else {
            state.files.selectedIds.push(fileId);
          }
        }
      },
    },
    setSelectedFiles: {
      prepare: (id: number[]) => {
        return { payload: { fileIds: id } };
      },
      reducer: (state, action: PayloadAction<{ fileIds: number[] }>) => {
        const { fileIds } = action.payload;
        state.files.selectedIds = fileIds;
      },
    },
    clearState(state, action: PayloadAction<number[]>) {
      if (action.payload && action.payload.length) {
        action.payload.forEach((fileId) => {
          deleteFileById(state, fileId);
        });
      } else {
        clearFilesState(state);
      }
    },
  },
  extraReducers: (builder) => {
    builder.addCase(setSelectedAllFiles, makeReducerSelectAllFilesWithFilter());

    builder.addMatcher(
      isAnyOf(DeleteFilesById.fulfilled, clearFileState),
      (state, action) => {
        action.payload.forEach((fileId) => {
          deleteFileById(state, fileId);
          state.files.selectedIds = state.files.selectedIds.filter(
            (id) => id !== fileId
          );
        });
      }
    );

    builder.addMatcher(
      isFulfilled(FetchFilesById, UpdateFiles),
      (state, { payload }) => {
        payload.forEach((fileState) => {
          updateFileState(state, fileState);
        });
      }
    );
  },
});

export const {
  addFiles,
  setDataSetIds,
  setExtractExif,
  setFileSelectState,
  setSelectedFiles,
  clearState,
} = filesSlice.actions;

export default filesSlice.reducer;

export const selectAllSelectedIds = (state: State): number[] =>
  state.files.selectedIds;

export const selectAllFiles = createSelector(
  (state: State) => state.files.allIds,
  (state) => state.files.byId,
  (allIds, allFiles) => {
    return allIds.map((id) => createFileInfo(allFiles[id]));
  }
);

export const selectAllFilesSelected = createSelector(
  (state: State) => state.files.allIds,
  selectAllSelectedIds,
  (allIds, selectedFileIds) => {
    return (
      !!allIds.length && allIds.every((id) => selectedFileIds.includes(id))
    );
  }
);

const createDeepEqualSelector = createSelectorCreator(defaultMemoize, isEqual);

export const selectFileById = createDeepEqualSelector(
  (_: State, fileId: number) => fileId,
  (state) => state.files.byId,
  (fileId, files) => {
    const file = files[fileId];
    return file ? createFileInfo(file) : null;
  }
);

// state utility functions

const deleteFileById = (state: State, id: number) => {
  delete state.files.byId[id];
  state.files.allIds = Object.keys(state.files.byId).map((key) => +key);
};

const updateFileState = (state: State, file: FileState) => {
  const hasInState = !!state.files.byId[file.id];
  state.files.byId[file.id] = file;
  if (!hasInState) {
    state.files.allIds.push(file.id);
  }
};

const clearFilesState = (state: State) => {
  state.files.byId = {};
  state.files.allIds = [];
  state.files.selectedIds = [];
};
