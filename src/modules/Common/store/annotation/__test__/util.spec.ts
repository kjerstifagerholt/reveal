import { initialState } from 'src/modules/Common/store/annotation/slice';
import {
  clearStates,
  repopulateAnnotationState,
  updateAnnotations,
} from 'src/modules/Common/store/annotation/util';
import {
  VisionAnnotation,
  VisionAnnotationDataType,
} from 'src/modules/Common/types';
import { getDummyImageObjectDetectionBoundingBoxAnnotation } from 'src/modules/Common/store/annotation/__test__/getDummyAnnotations';

const mockState = {
  ...initialState,
  files: {
    byId: {
      '10': [1, 2],
      '20': [3, 4, 5],
      '30': [6],
      '40': [],
    },
  },
  annotations: {
    byId: {
      '1': getDummyImageObjectDetectionBoundingBoxAnnotation({
        id: 1,
        annotatedResourceId: 10,
      }),
      '2': getDummyImageObjectDetectionBoundingBoxAnnotation({
        id: 2,
        annotatedResourceId: 10,
      }),
      '3': getDummyImageObjectDetectionBoundingBoxAnnotation({
        id: 3,
        annotatedResourceId: 20,
      }),
      '4': getDummyImageObjectDetectionBoundingBoxAnnotation({
        id: 4,
        annotatedResourceId: 20,
      }),
      '5': getDummyImageObjectDetectionBoundingBoxAnnotation({
        id: 5,
        annotatedResourceId: 20,
      }),
      '6': getDummyImageObjectDetectionBoundingBoxAnnotation({
        id: 6,
        annotatedResourceId: 30,
      }),
    },
  },
};

describe('Test annotation utils', () => {
  describe('Test clearStates fn', () => {
    test('when clear cache is true', () => {
      const annotationState = { ...mockState };
      clearStates(annotationState, [], true);
      expect(annotationState).toStrictEqual(initialState);
    });

    describe('when clear cache is false', () => {
      test('for single file id', () => {
        const annotationState = { ...mockState };
        const clearCache = false;

        const fileIds = [10];
        clearStates(annotationState, fileIds, clearCache);
        expect(annotationState.files.byId[10]).toStrictEqual(undefined);

        expect(annotationState.annotations.byId[1]).toStrictEqual(undefined);
        expect(annotationState.annotations.byId[2]).toStrictEqual(undefined);
      });

      test('for multiple file ids', () => {
        const annotationState = { ...mockState };
        const clearCache = false;

        const fileIds = [20, 30];
        clearStates(annotationState, fileIds, clearCache);
        expect(annotationState.files.byId[20]).toStrictEqual(undefined);
        expect(annotationState.files.byId[30]).toStrictEqual(undefined);

        expect(annotationState.annotations.byId[3]).toStrictEqual(undefined);
        expect(annotationState.annotations.byId[4]).toStrictEqual(undefined);
        expect(annotationState.annotations.byId[5]).toStrictEqual(undefined);
        expect(annotationState.annotations.byId[6]).toStrictEqual(undefined);
      });
    });
  });

  describe('Test repopulateAnnotationState fn', () => {
    test('when no annotations to update', () => {
      const annotationState = { ...mockState };
      repopulateAnnotationState(annotationState, []);
      expect(annotationState).toStrictEqual(mockState);
    });

    test('with new payload', () => {
      const newAnnotations: VisionAnnotation<VisionAnnotationDataType>[] = [
        getDummyImageObjectDetectionBoundingBoxAnnotation({
          id: 7,
          annotatedResourceId: 10,
        }),
        getDummyImageObjectDetectionBoundingBoxAnnotation({
          id: 8,
          annotatedResourceId: 10,
        }),
      ];
      const annotationState = { ...mockState };
      repopulateAnnotationState(annotationState, newAnnotations);

      expect(annotationState.annotations.byId).toStrictEqual({
        '7': getDummyImageObjectDetectionBoundingBoxAnnotation({
          id: 7,
          annotatedResourceId: 10,
        }),
        '8': getDummyImageObjectDetectionBoundingBoxAnnotation({
          id: 8,
          annotatedResourceId: 10,
        }),
      });

      expect(annotationState.files.byId[10]).toStrictEqual([7, 8]);
    });
  });

  describe('Test updateAnnotations fn', () => {
    test('when no annotations to update', () => {
      const annotationState = { ...mockState };
      updateAnnotations(mockState, []);
      expect(annotationState).toStrictEqual(mockState);
    });

    test('with new payload', () => {
      const annotationState = { ...mockState };
      const newAnnotations: VisionAnnotation<VisionAnnotationDataType>[] = [
        getDummyImageObjectDetectionBoundingBoxAnnotation({
          id: 7,
          annotatedResourceId: 10,
        }),
        getDummyImageObjectDetectionBoundingBoxAnnotation({
          id: 8,
          annotatedResourceId: 10,
        }),
      ];
      updateAnnotations(annotationState, newAnnotations);

      expect(annotationState.annotations.byId).toStrictEqual({
        '7': getDummyImageObjectDetectionBoundingBoxAnnotation({
          id: 7,
          annotatedResourceId: 10,
        }),
        '8': getDummyImageObjectDetectionBoundingBoxAnnotation({
          id: 8,
          annotatedResourceId: 10,
        }),
      });

      expect(annotationState.files.byId[10]).toStrictEqual([7, 8]);
    });
  });
});
