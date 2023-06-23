import { createAsyncThunk } from '@reduxjs/toolkit';
import { setProcessFileIds } from '@vision/modules/Process/store/slice';
import {
  clearAnnotationState,
  clearFileState,
} from '@vision/store/commonActions';
import { ThunkConfig } from '@vision/store/rootReducer';
import { ToastUtils } from '@vision/utils/ToastUtils';

export const PopulateProcessFiles = createAsyncThunk<
  void,
  number[],
  ThunkConfig
>('PopulateProcessFiles', async (fileIds, { getState, dispatch }) => {
  const processState = getState().processSlice;
  const previousFileList = processState.fileIds;

  if (fileIds.length) {
    if (previousFileList.length) {
      ToastUtils.onFailure(
        'A contextualization session is in progress. Please finish the current session before starting a new session.'
      );
      throw new Error('Unfinished session in process page!');
    } else {
      dispatch(setProcessFileIds(fileIds));
    }
  } else {
    // if user just want to clear the states
    dispatch(setProcessFileIds([]));
    dispatch(clearFileState(previousFileList));
    dispatch(clearAnnotationState(previousFileList));
  }
});
