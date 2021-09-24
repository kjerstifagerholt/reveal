import { Label, Metadata } from '@cognite/cdf-sdk-singleton';
import {
  createSlice,
  isFulfilled,
  isRejected,
  PayloadAction,
} from '@reduxjs/toolkit';
import { CDFStatusModes } from 'src/modules/Common/Components/CDFStatus/CDFStatus';
import { DeleteAnnotations } from 'src/store/thunks/Annotation/DeleteAnnotations';
import { RetrieveAnnotations } from 'src/store/thunks/Annotation/RetrieveAnnotations';
import { SaveAnnotations } from 'src/store/thunks/Annotation/SaveAnnotations';
import { SaveAnnotationTemplates } from 'src/store/thunks/Annotation/SaveAnnotationTemplates';
import { UpdateAnnotations } from 'src/store/thunks/Annotation/UpdateAnnotations';
import { UpdateFiles } from 'src/store/thunks/Files/UpdateFiles';
import { ToastUtils } from 'src/utils/ToastUtils';

export type BulkEditTempState = {
  metadata?: Metadata;
  keepOriginalMetadata?: Boolean;
  labels?: Label[];
};

export type State = {
  showFileDownloadModal: boolean;
  showBulkEditModal: boolean;
  bulkEditTemp: BulkEditTempState;
  saveState: {
    mode: CDFStatusModes;
    time?: number;
  };
};

const initialState: State = {
  showFileDownloadModal: false,
  showBulkEditModal: false,
  bulkEditTemp: {},
  saveState: {
    mode: 'saved' as CDFStatusModes,
    time: new Date().getTime(),
  },
};

const commonSlice = createSlice({
  name: 'commonSlice',
  initialState,
  /* eslint-disable no-param-reassign */
  reducers: {
    setFileDownloadModalVisibility(state, action: PayloadAction<boolean>) {
      state.showFileDownloadModal = action.payload;
    },
    setBulkEditModalVisibility(state, action: PayloadAction<boolean>) {
      state.showBulkEditModal = action.payload;
    },
    setBulkEditTemp(state, action: PayloadAction<BulkEditTempState>) {
      state.bulkEditTemp = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addMatcher(
      isFulfilled(
        SaveAnnotations,
        DeleteAnnotations,
        UpdateAnnotations,
        UpdateFiles
      ),
      (state) => {
        state.saveState.mode = 'timestamp';
        state.saveState.time = new Date().getTime();
      }
    );

    builder.addMatcher(
      isRejected(
        SaveAnnotations,
        RetrieveAnnotations,
        DeleteAnnotations,
        UpdateAnnotations,
        UpdateFiles,
        SaveAnnotationTemplates
      ),
      (state, { error }) => {
        if (error && error.message) {
          state.saveState.mode = 'error';
          state.saveState.time = new Date().getTime();
          ToastUtils.onFailure(
            `Failed to update Annotations, ${error?.message}`
          );
        }
      }
    );
  },
});

export const {
  setFileDownloadModalVisibility,
  setBulkEditModalVisibility,
  setBulkEditTemp,
} = commonSlice.actions;

export default commonSlice.reducer;

export const selectCDFState = (
  state: State
): {
  mode: CDFStatusModes;
  time?: number | undefined;
} => {
  const cdfSaveStatus = state.saveState;
  return cdfSaveStatus;
};
