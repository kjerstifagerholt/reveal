import { createAsyncThunk, unwrapResult } from '@reduxjs/toolkit';
import { ThunkConfig } from 'src/store/rootReducer';
import {
  AnnotationStatus,
  AnnotationUtils,
  VisionAnnotation,
} from 'src/utils/AnnotationUtils';
import { VisionAPIType } from 'src/api/types';
import { SaveAnnotations } from 'src/store/thunks/SaveAnnotations';
import { UnsavedAnnotation } from 'src/api/annotation/types';
import { getUnsavedAnnotation } from 'src/api/utils';

export const CreateAnnotations = createAsyncThunk<
  VisionAnnotation[],
  { fileId: number; annotation: UnsavedAnnotation },
  ThunkConfig
>('CreateAnnotations', async (payload, { dispatch }) => {
  const { fileId, annotation } = payload;
  const unsavedAnnotations: UnsavedAnnotation[] = [
    getUnsavedAnnotation(
      annotation.text,
      VisionAPIType.ObjectDetection,
      fileId,
      annotation.region,
      AnnotationStatus.Verified,
      'user',
      annotation.data
    ),
  ];

  if (unsavedAnnotations.length) {
    const savedAnnotationResponse = await dispatch(
      SaveAnnotations(unsavedAnnotations)
    );
    const savedAnnotations = unwrapResult(savedAnnotationResponse);

    return AnnotationUtils.convertToVisionAnnotations(savedAnnotations);
  }

  return [];
});
