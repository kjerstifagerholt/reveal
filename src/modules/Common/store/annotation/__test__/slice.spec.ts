/* eslint-disable jest/no-disabled-tests */

import reducer, {
  initialState,
} from 'src/modules/Common/store/annotation/slice';
import { AnnotationState } from 'src/modules/Common/store/annotation/types';
import { clearAnnotationState } from 'src/store/commonActions';
import { CreateAnnotations } from 'src/store/thunks/Annotation/CreateAnnotations';
import { DeleteAnnotations } from 'src/store/thunks/Annotation/DeleteAnnotations';
import { RetrieveAnnotationsV1 } from 'src/store/thunks/Annotation/RetrieveAnnotationsV1';
import { UpdateAnnotations } from 'src/store/thunks/Annotation/UpdateAnnotations';
import { DeleteFilesById } from 'src/store/thunks/Files/DeleteFilesById';
import { VisionJobUpdate } from 'src/store/thunks/Process/VisionJobUpdate';
import { getDummyImageObjectDetectionBoundingBoxAnnotation } from 'src/__test-utils/getDummyAnnotations';

describe('Test annotation reducer', () => {
  test('should return the initial state', () => {
    expect(reducer(undefined, { type: undefined })).toEqual(initialState);
  });

  describe('Test RetrieveAnnotationsV1.fulfilled action', () => {
    test('should clear entire state when clear cache is true and response is empty', () => {
      const previousState: AnnotationState = {
        files: {
          byId: {
            '10': [1, 2],
          },
        },
        annotations: {
          byId: {
            '1': getDummyImageObjectDetectionBoundingBoxAnnotation({ id: 1 }),
            '2': getDummyImageObjectDetectionBoundingBoxAnnotation({ id: 2 }),
          },
        },
      };
      const action = {
        type: RetrieveAnnotationsV1.fulfilled.type,
        meta: {
          arg: {
            fileIds: [],
            clearCache: true,
          },
        },
        payload: [],
      };

      expect(reducer(previousState, action)).toEqual(initialState);
    });

    test('should clear only specified fileIds when clear cache is false and response is empty', () => {
      const previousState = {
        files: {
          byId: {
            '10': [1],
            '20': [2],
          },
        },
        annotations: {
          byId: {
            '1': getDummyImageObjectDetectionBoundingBoxAnnotation({ id: 1 }),
            '2': getDummyImageObjectDetectionBoundingBoxAnnotation({ id: 2 }),
          },
        },
      };

      const action = {
        type: RetrieveAnnotationsV1.fulfilled.type,
        meta: {
          arg: {
            fileIds: [10],
            clearCache: false,
          },
        },
        payload: [],
      };

      expect(reducer(previousState, action)).toEqual({
        files: {
          byId: { '20': [2] },
        },
        annotations: {
          byId: {
            '2': getDummyImageObjectDetectionBoundingBoxAnnotation({ id: 2 }),
          },
        },
      });
    });

    test('should keep state unchanged if nonexistent fileIds are provided', () => {
      const previousState = {
        files: {
          byId: {
            '10': [1],
          },
        },
        annotations: {
          byId: {
            '1': getDummyImageObjectDetectionBoundingBoxAnnotation({ id: 1 }),
          },
        },
      };

      const action = {
        type: RetrieveAnnotationsV1.pending.type,
        meta: {
          arg: {
            fileIds: [30],
            clearCache: false,
          },
        },
        payload: [],
      };

      expect(reducer(previousState, action)).toEqual(previousState);
    });

    /**
     * ToDo (VIS-794):
     * ideally payload should contain data of the new annotation type
     * even unable to test with a payload of old type annotation data generated by getDummyAnnotationV1
     * as type validation of validBoundingBox is failing for those generated annotations.
     * Skipping this test until the new thunk created
     */
    test.skip('should populate state', () => {
      const previousState = {
        files: {
          byId: {
            '10': [1],
            '20': [],
          },
        },
        annotations: {
          byId: {
            '1': getDummyImageObjectDetectionBoundingBoxAnnotation({
              id: 1,
              annotatedResourceId: 10,
            }),
          },
        },
      };

      const action = {
        type: RetrieveAnnotationsV1.fulfilled.type,
        meta: {
          arg: {
            fileIds: [10, 20, 30],
            clearCache: false,
          },
        },
        payload: [
          getDummyImageObjectDetectionBoundingBoxAnnotation({
            id: 1,
            annotatedResourceId: 10,
          }), // existing annotation and file
          getDummyImageObjectDetectionBoundingBoxAnnotation({
            id: 2,
            annotatedResourceId: 10,
          }), // new annotation for existing file with annotation
          getDummyImageObjectDetectionBoundingBoxAnnotation({
            id: 3,
            annotatedResourceId: 20,
          }), // new annotation for existing file without annotation
          getDummyImageObjectDetectionBoundingBoxAnnotation({
            id: 4,
            annotatedResourceId: 30,
          }), // new file and annotation
        ],
      };

      expect(reducer(previousState, action)).toEqual({
        files: {
          byId: {
            '10': [1, 2], // should add only new annotation to existing file
            '20': [3], // should add new annotation to existing file, previously without annotations
            '30': [4], // should add new file and annotation
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
              annotatedResourceId: 30,
            }),
          },
        },
      });
    });
  });

  describe('Test DeleteAnnotations.fulfilled action', () => {
    test('should not change state for nonexistent annotation id', () => {
      const previousState = {
        files: {
          byId: {
            '10': [1],
          },
        },
        annotations: {
          byId: {
            '1': getDummyImageObjectDetectionBoundingBoxAnnotation({ id: 1 }),
          },
        },
      };

      const action = {
        type: DeleteAnnotations.fulfilled.type,
        payload: [3], // annotation ids to delete
      };

      expect(reducer(previousState, action)).toEqual(previousState);
    });

    test('should clean entire state since all annotation ids in state given in payload', () => {
      const previousState = {
        files: {
          byId: {
            '10': [1, 2],
          },
        },
        annotations: {
          byId: {
            '1': getDummyImageObjectDetectionBoundingBoxAnnotation({ id: 1 }),
            '2': getDummyImageObjectDetectionBoundingBoxAnnotation({ id: 1 }),
          },
        },
      };

      const action = {
        type: DeleteAnnotations.fulfilled.type,
        payload: [1, 2], // annotation ids to delete
      };

      expect(reducer(previousState, action)).toEqual(initialState);
    });

    test('should only remove annotations with specified ids', () => {
      const previousState = {
        files: {
          byId: {
            '10': [1, 2],
          },
        },
        annotations: {
          byId: {
            '1': getDummyImageObjectDetectionBoundingBoxAnnotation({ id: 1 }),
            '2': getDummyImageObjectDetectionBoundingBoxAnnotation({ id: 2 }),
          },
        },
      };

      const action = {
        type: DeleteAnnotations.fulfilled.type,
        payload: [2], // annotation ids to delete
      };

      expect(reducer(previousState, action)).toEqual({
        files: {
          byId: {
            '10': [1],
          },
        },
        annotations: {
          byId: {
            '1': getDummyImageObjectDetectionBoundingBoxAnnotation({ id: 1 }),
          },
        },
      });
    });

    test('should delete annotation with non existing file id', () => {
      const previousState = {
        files: {
          byId: {
            '20': [1], // annotation.annotatedResourceId ('10') not in sync with state.files.byId ('20')
          },
        },
        annotations: {
          byId: {
            '1': getDummyImageObjectDetectionBoundingBoxAnnotation({
              id: 1,
              annotatedResourceId: 10,
            }),
          },
        },
      };

      const action = {
        type: DeleteAnnotations.fulfilled.type,
        payload: [1], // annotation ids to delete
      };

      expect(reducer(previousState, action)).toEqual({
        // TODO: is this behavior desired?
        files: {
          byId: {
            '20': [1],
          },
        },
        annotations: {
          byId: {},
        },
      });
    });
  });

  describe('Test populator actions', () => {
    // TODO: same test as for RetrieveAnnotationsV1.fulfilled, should be removed after refactoring
    const actionTypes = [
      CreateAnnotations.fulfilled.type,
      VisionJobUpdate.fulfilled.type,
      UpdateAnnotations.fulfilled.type,
    ];

    /**
     * ToDo (VIS-794):
     * ideally payload should contain data of the new annotation type
     * even unable to test with a payload of old type annotation data generated by getDummyAnnotationV1
     * as type validation of validBoundingBox is failing for those generated annotations.
     * Skipping this test until the new thunk created
     */
    test.skip('should populate state', () => {
      actionTypes.forEach((actionType) => {
        const previousState = {
          files: {
            byId: {
              '10': [1],
              '20': [],
            },
          },
          annotations: {
            byId: {
              '1': getDummyImageObjectDetectionBoundingBoxAnnotation({
                id: 1,
                annotatedResourceId: 10,
              }),
            },
          },
        };

        const action = {
          type: actionType,
          payload: [
            getDummyImageObjectDetectionBoundingBoxAnnotation({
              id: 1,
              annotatedResourceId: 10,
            }), // existing annotation and file
            getDummyImageObjectDetectionBoundingBoxAnnotation({
              id: 2,
              annotatedResourceId: 10,
            }), // new annotation for existing file with annotation
            getDummyImageObjectDetectionBoundingBoxAnnotation({
              id: 3,
              annotatedResourceId: 20,
            }), // new annotation for existing file without annotation
            getDummyImageObjectDetectionBoundingBoxAnnotation({
              id: 4,
              annotatedResourceId: 30,
            }), // new file and annotation
          ],
        };

        expect(reducer(previousState, action)).toEqual({
          files: {
            byId: {
              '10': [1, 2], // should add only new annotation to existing file
              '20': [3], // should add new annotation to existing file, previously without annotations
              '30': [4], // should add new file and annotation
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
                annotatedResourceId: 30,
              }),
            },
          },
        });
      });
    });
  });

  describe('Test delete actions based on file ids', () => {
    const actionTypes = [
      DeleteFilesById.fulfilled.type,
      clearAnnotationState.type,
    ];
    test('should delete file and corresponding annotations from state', () => {
      actionTypes.forEach((actionType) => {
        const action = {
          type: actionType,
          payload: [20], // file id to delete
        };

        const previousState = {
          files: {
            byId: {
              '10': [1],
              '20': [2],
            },
          },
          annotations: {
            byId: {
              '1': getDummyImageObjectDetectionBoundingBoxAnnotation({ id: 1 }),
              '2': getDummyImageObjectDetectionBoundingBoxAnnotation({ id: 2 }),
            },
          },
        };

        expect(reducer(previousState, action)).toEqual({
          files: {
            byId: {
              '10': [1],
            },
          },
          annotations: {
            byId: {
              '1': getDummyImageObjectDetectionBoundingBoxAnnotation({ id: 1 }),
            },
          },
        });
      });
    });
  });
});
