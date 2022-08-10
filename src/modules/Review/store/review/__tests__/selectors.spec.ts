/* eslint-disable jest/no-disabled-tests */
import { ReviewState } from 'src/modules/Review/store/review/types';
import { initialState } from 'src/modules/Review/store/review/slice';
import { AnnotationSettingsOption } from 'src/modules/Review/store/review/enums';
import {
  selectAllReviewFiles,
  selectAnnotationSettingsState,
} from 'src/modules/Review/store/review/selectors';
import { FileState } from 'src/modules/Common/store/files/types';
import { createFileState } from 'src/store/util/StateUtils';
import { mockFileList } from 'src/__test-utils/fixtures/files';
import { RootState } from 'src/store/rootReducer';

const mockFilesState: FileState = {
  files: {
    allIds: [1, 2, 3],
    byId: {
      1: createFileState(mockFileList[0]),
      2: createFileState(mockFileList[1]),
      3: createFileState(mockFileList[2]),
    },
    selectedIds: [0],
  },
};

const mockReviewState: ReviewState = {
  ...initialState,
  fileIds: [1, 2],
  hiddenAnnotationIds: [100, 200, 300],
  selectedAnnotationIds: [400, 500, 600],
  annotationSettings: {
    show: true,
    activeView: AnnotationSettingsOption.KEYPOINT,
    createNew: {
      text: 'new annotation',
      color: 'red',
    },
  },
  scrollToId: 'scroll_id',
};

const rootState: RootState = {
  fileReducer: mockFilesState,
  reviewSlice: mockReviewState,
} as RootState;

describe('Test Review selectors', () => {
  describe('selectAllReviewFiles selector', () => {
    test('when file ids are empty', () => {
      expect(
        selectAllReviewFiles({
          fileReducer: mockFilesState,
          reviewSlice: { ...mockReviewState, fileIds: [] } as ReviewState,
        } as RootState)
      ).toEqual([]);
    });

    test('when file ids are available', () => {
      const selectedFiles = selectAllReviewFiles({
        fileReducer: mockFilesState,
        reviewSlice: mockReviewState,
      } as RootState);
      expect(selectedFiles.map((file) => file.id)).toEqual([1, 2]);
    });

    test('when some files are not available in file reducer', () => {
      const selectedFiles = selectAllReviewFiles({
        fileReducer: mockFilesState,
        reviewSlice: {
          ...mockReviewState,
          fileIds: [1, 2, 5],
        } as ReviewState,
      } as RootState);
      expect(selectedFiles.map((file) => file.id)).toEqual([1, 2]);
    });
  });

  describe('selectAnnotationSettingsState selector', () => {
    test('get initial annotation settings', () => {
      const annotationSettings = selectAnnotationSettingsState(initialState);
      expect(annotationSettings.show).toEqual(false);
      expect(annotationSettings.createNew.text).toEqual(undefined);
      expect(annotationSettings.createNew.color).toEqual(undefined);
      expect(annotationSettings.activeView).toEqual(
        AnnotationSettingsOption.SHAPE
      );
    });

    test('open annotation settings without a create new', () => {
      const annotationSettings = selectAnnotationSettingsState({
        ...mockReviewState,
        annotationSettings: {
          ...mockReviewState.annotationSettings,
          createNew: {},
        },
      });
      expect(annotationSettings.show).toEqual(true);
      expect(annotationSettings.createNew).toEqual({});
      expect(annotationSettings.createNew.text).toEqual(undefined);
      expect(annotationSettings.createNew.color).toEqual(undefined);
      expect(annotationSettings.activeView).toEqual(
        AnnotationSettingsOption.KEYPOINT
      );
    });

    test('open annotation settings with a create new', () => {
      const annotationSettings = selectAnnotationSettingsState(mockReviewState);
      expect(annotationSettings.show).toEqual(true);
      expect(annotationSettings.createNew).not.toEqual({});
      expect(annotationSettings.createNew.text).toEqual('new annotation');
      expect(annotationSettings.createNew.color).toEqual('red');
      expect(annotationSettings.activeView).toEqual(
        AnnotationSettingsOption.KEYPOINT
      );
    });
  });
});
