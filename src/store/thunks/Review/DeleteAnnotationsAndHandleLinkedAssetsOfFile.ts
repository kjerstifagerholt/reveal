import { createAsyncThunk } from '@reduxjs/toolkit';
import { ThunkConfig } from 'src/store/rootReducer';
import { DeleteAnnotations } from 'src/store/thunks/Annotation/DeleteAnnotations';
import { ToastUtils } from 'src/utils/ToastUtils';
import { filterAssetIdsLinkedToGivenFile } from 'src/api/utils/filterAssetIdsLinkedToGivenFile';
import { removeAssetIdsFromFile } from 'src/store/util/removeAssetIdsFromFile';
import { groupAnnotationsByFile } from 'src/api/utils/groupAnnotationsByFile';
import { InternalId } from '@cognite/sdk';
import { ImageAssetLink, Status } from 'src/api/annotation/types';
import { isImageAssetLinkData } from 'src/modules/Common/types/typeGuards';
import { VisionAnnotation } from 'src/modules/Common/types';

/**
 * Deletes annotations, if assetRef annotations are also available remove asset links from files with user consent
 *
 * ## Example
 * ```typescript
 *   dispatch(
 *     DeleteAnnotationsAndHandleLinkedAssetsOfFile({
 *       annotationIds: [{ id: 1 }],
 *       showWarnings: true,
 *     })
 *   );
 * ```
 */
export const DeleteAnnotationsAndHandleLinkedAssetsOfFile = createAsyncThunk<
  void,
  {
    annotationIds: InternalId[];
    showWarnings: boolean;
  },
  ThunkConfig
>(
  'DeleteAnnotationsAndRemoveLinkedAssets',
  async ({ annotationIds, showWarnings }, { getState, dispatch }) => {
    const annotations = annotationIds.map(
      ({ id }) => getState().annotationReducer.annotations.byId[id]
    );
    const verifiedAssetRefAnnotations = annotations.filter(
      (ann) => isImageAssetLinkData(ann) && ann.status === Status.Approved
    );

    const savedAnnotationIds = annotations
      .filter((ann) => !!ann.lastUpdatedTime)
      .map((ann) => ({ id: ann.id }));

    if (savedAnnotationIds && savedAnnotationIds.length) {
      dispatch(DeleteAnnotations(savedAnnotationIds));
    }

    if (verifiedAssetRefAnnotations.length) {
      // group assetRefAnnotations by file id
      const fileAnnotationMap = groupAnnotationsByFile(
        verifiedAssetRefAnnotations
      ) as Map<number, VisionAnnotation<ImageAssetLink>[]>; // HACK: cast to asset link since we already have checked this using isImageAssetLinkData

      // remove linked assets for each file
      await Promise.all(
        Array.from(fileAnnotationMap).map(
          async ([fileId, fileAssetRefAnnotations]) => {
            const assetIdsLinkedToFile = await filterAssetIdsLinkedToGivenFile(
              fileAssetRefAnnotations.map((ann) => ann.assetRef.id),
              fileId
            );

            if (assetIdsLinkedToFile.length) {
              if (showWarnings) {
                ToastUtils.onWarn(
                  'Rejecting detected asset tag',
                  'Do you want to remove the link between the file and the asset as well?',
                  () => {
                    removeAssetIdsFromFile(
                      fileId,
                      assetIdsLinkedToFile,
                      dispatch
                    );
                  },
                  'Remove asset link'
                );
              } else {
                await removeAssetIdsFromFile(
                  fileId,
                  assetIdsLinkedToFile,
                  dispatch
                );
              }
            }
          }
        )
      );
    }
  }
);
