import { combineReducers } from '@reduxjs/toolkit';
import './commonActions';
import fileReducer from 'src/modules/Common/store/files/slice';
import commonReducer from 'src/modules/Common/store/commonSlice';
import annotationReducer from 'src/modules/Common/store/annotationSlice';
import annotationLabelReducer from 'src/modules/Review/store/annotationLabelSlice';
import fileDetailsSlice from 'src/modules/FileDetails/fileDetailsSlice';
import explorerReducer from 'src/modules/Explorer/store/explorerSlice';
import processSlice from 'src/modules/Process/processSlice';
import reviewSlice from 'src/modules/Review/store/reviewSlice';

const rootReducer = combineReducers({
  fileReducer,
  commonReducer,
  processSlice,
  reviewSlice,
  fileDetailsSlice,
  annotationReducer,
  explorerReducer,
  annotationLabelReducer,
});

export type RootState = ReturnType<typeof rootReducer>;
export type ThunkConfig = { state: RootState };

export default rootReducer;
