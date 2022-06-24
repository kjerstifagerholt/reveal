import isEmpty from 'lodash-es/isEmpty';
import isFinite from 'lodash-es/isFinite';
import {
  UnsavedVisionAnnotation,
  VisionAnnotation,
  VisionAnnotationDataType,
} from 'src/modules/Common/types';
import {
  isImageAssetLinkData,
  isImageClassificationData,
  isImageExtractedTextData,
  isImageKeypointCollectionData,
  isImageObjectDetectionBoundingBoxData,
  isImageObjectDetectionData,
  isImageObjectDetectionPolygonData,
  isImageObjectDetectionPolylineData,
} from 'src/modules/Common/types/typeGuards';
import { getAnnotationLabelOrText } from 'src/modules/Common/Utils/AnnotationUtils/AnnotationUtils';
import {
  AnnotatorBaseRegion,
  AnnotatorBoxRegion,
  AnnotatorLineRegion,
  AnnotatorPointRegion,
  AnnotatorPolygonRegion,
  AnnotatorRegion,
  AnnotatorRegionType,
  isAnnotatorBoxRegion,
  isAnnotatorLineRegion,
  isAnnotatorPointRegion,
  isAnnotatorPolygonRegion,
} from 'src/modules/Review/Components/ReactImageAnnotateWrapper/types';
import {
  CDFAnnotationTypeEnum,
  ImageAssetLink,
  ImageExtractedText,
  ImageKeypointCollection,
  ImageObjectDetection,
  ImageObjectDetectionBoundingBox,
  ImageObjectDetectionPolygon,
  ImageObjectDetectionPolyline,
  Status,
} from 'src/api/annotation/types';
import {
  ReviewKeypoint,
  TempKeypointCollection,
  TurnKeypointType,
  VisionReviewAnnotation,
} from 'src/modules/Review/types';
import { convertTempKeypointCollectionToVisionReviewImageKeypointCollection } from 'src/modules/Review/store/review/utils';
import { AnnotationChangeById } from '@cognite/sdk-playground';

/**
 * Converts array of VisionAnnotations to Array of AnnotatorRegions
 * @param reviewAnnotations
 */
export const convertVisionReviewAnnotationsToRegions = (
  reviewAnnotations: VisionReviewAnnotation<VisionAnnotationDataType>[]
): AnnotatorRegion[] => {
  const regions = reviewAnnotations
    .map((reviewAnnotation) =>
      convertVisionReviewAnnotationToRegions(reviewAnnotation)
    )
    .flat();

  return regions;
};

/**
 * Converts single VisionAnnotation to an Array of AnnotatorRegions
 * @param reviewAnnotation
 */
export const convertVisionReviewAnnotationToRegions = (
  reviewAnnotation: VisionReviewAnnotation<VisionAnnotationDataType>
): AnnotatorRegion[] => {
  const regions: AnnotatorRegion[] = [];
  const { annotation } = reviewAnnotation;

  if (
    !annotation ||
    !isFinite(annotation.id) ||
    !annotation.annotationType ||
    !annotation.status ||
    !getAnnotationLabelOrText(annotation)
  ) {
    console.error(
      'ReactImageAnnotateWrapper: fields id or annotationType or status is missing in annotation',
      JSON.stringify(annotation)
    );
    return regions;
  }

  const baseRegionData: AnnotatorBaseRegion = {
    id: annotation.id,
    annotationMeta: reviewAnnotation,
    highlighted: !!reviewAnnotation.selected,
    editingLabels: !!reviewAnnotation.selected,
    tags: [],
    annotationType: annotation.annotationType,
    annotationLabelOrText: getAnnotationLabelOrText(annotation),
    status: annotation.status,
    color: reviewAnnotation.color,
    cls: '',
    locked: false,
    visible: !!reviewAnnotation.show,
  };
  if (isImageClassificationData(annotation)) {
    // no regions for classification
  } else if (isImageAssetLinkData(annotation)) {
    regions.push({
      ...{
        type: AnnotatorRegionType.BoxRegion,
        x: annotation.textRegion.xMin,
        y: annotation.textRegion.yMin,
        w: annotation.textRegion.xMax - annotation.textRegion.xMin,
        h: annotation.textRegion.yMax - annotation.textRegion.yMin,
      },
      ...baseRegionData,
    } as AnnotatorBoxRegion);
  } else if (isImageExtractedTextData(annotation)) {
    regions.push({
      ...{
        type: AnnotatorRegionType.BoxRegion,
        x: annotation.textRegion.xMin,
        y: annotation.textRegion.yMin,
        w: annotation.textRegion.xMax - annotation.textRegion.xMin,
        h: annotation.textRegion.yMax - annotation.textRegion.yMin,
      },
      ...baseRegionData,
    } as AnnotatorBoxRegion);
  } else if (isImageObjectDetectionBoundingBoxData(annotation)) {
    regions.push({
      ...{
        type: AnnotatorRegionType.BoxRegion,
        x: (annotation as ImageObjectDetectionBoundingBox).boundingBox.xMin, // todo: update typescript version > 4.4 and remove these casts
        y: (annotation as ImageObjectDetectionBoundingBox).boundingBox.yMin,
        w:
          (annotation as ImageObjectDetectionBoundingBox).boundingBox.xMax -
          (annotation as ImageObjectDetectionBoundingBox).boundingBox.xMin,
        h:
          (annotation as ImageObjectDetectionBoundingBox).boundingBox.yMax -
          (annotation as ImageObjectDetectionBoundingBox).boundingBox.yMin,
      },
      ...baseRegionData,
    } as AnnotatorBoxRegion);
  } else if (isImageObjectDetectionPolygonData(annotation)) {
    regions.push({
      ...{
        type: AnnotatorRegionType.PolygonRegion,
        points: (
          annotation as ImageObjectDetectionPolygon
        ).polygon.vertices.map((pt) => [pt.x, pt.y]), // todo: update typescript version > 4.4 and remove these casts
      },
      ...baseRegionData,
    } as AnnotatorPolygonRegion);
  } else if (isImageObjectDetectionPolylineData(annotation)) {
    console.error(
      'ReactImageAnnotateWrapper: Polyline cannot be visualized correctly by this viewer'
    );
    regions.push({
      ...{
        type: AnnotatorRegionType.LineRegion,
        x1: (annotation as ImageObjectDetectionPolyline).polyline.vertices[0].x, // todo: update typescript version > 4.4 and remove these casts
        y1: (annotation as ImageObjectDetectionPolyline).polyline.vertices[0].y,
        x2: (annotation as ImageObjectDetectionPolyline).polyline.vertices[1].x,
        y2: (annotation as ImageObjectDetectionPolyline).polyline.vertices[1].y,
      },
      ...baseRegionData,
    } as AnnotatorLineRegion);
  } else if (isImageKeypointCollectionData(annotation)) {
    if (
      // todo: update typescript version > 4.4 and remove these casts
      !(
        annotation as TurnKeypointType<
          VisionAnnotation<ImageKeypointCollection>
        >
      ).keypoints ||
      !(
        annotation as TurnKeypointType<
          VisionAnnotation<ImageKeypointCollection>
        >
      ).keypoints.length
    ) {
      console.error(
        'ReactImageAnnotateWrapper: keypoints not found in annotation'
      );
      return regions;
    }
    (
      annotation as TurnKeypointType<VisionAnnotation<ImageKeypointCollection>>
    ).keypoints.forEach((keypoint) => {
      regions.push({
        ...{
          type: AnnotatorRegionType.PointRegion,
          x: keypoint.keypoint.point.x,
          y: keypoint.keypoint.point.y,
        },
        ...baseRegionData,
        id: keypoint.id,
        editingLabels: keypoint.selected,
        highlighted: !!reviewAnnotation.selected || keypoint.selected,
        tags: [],
        parentAnnotationId: (
          annotation as VisionAnnotation<ImageKeypointCollection>
        ).id,
        keypointLabel: keypoint.keypoint.label,
        keypointConfidence: keypoint.keypoint.confidence,
      } as AnnotatorPointRegion);
    });
  } else {
    console.error('ReactImageAnnotateWrapper: Unknown Annotation type');
  }
  return regions;
};

export const getVisionAnnotationDataFromRegion = (
  region: AnnotatorRegion
): VisionAnnotationDataType | ReviewKeypoint | {} => {
  const labelOrText = region.annotationLabelOrText;
  let data: VisionAnnotationDataType | ReviewKeypoint | {} = {};
  if (isAnnotatorBoxRegion(region)) {
    switch (region.annotationType) {
      case CDFAnnotationTypeEnum.ImagesAssetLink: {
        data = {
          text: labelOrText,
          textRegion: {
            xMin: region.x,
            yMin: region.y,
            xMax: region.x + region.w,
            yMax: region.y + region.h,
          },
          assetRef: (region.annotationMeta.annotation as ImageAssetLink)
            .assetRef,
        } as ImageAssetLink;
        break;
      }
      case CDFAnnotationTypeEnum.ImagesTextRegion: {
        data = {
          text: labelOrText,
          textRegion: {
            xMin: region.x,
            yMin: region.y,
            xMax: region.x + region.w,
            yMax: region.y + region.h,
          },
        } as ImageExtractedText;
        break;
      }
      default: {
        data = {
          label: labelOrText,
          boundingBox: {
            xMin: region.x,
            yMin: region.y,
            xMax: region.x + region.w,
            yMax: region.y + region.h,
          },
        } as ImageObjectDetectionBoundingBox;
      }
    }
  }
  if (isAnnotatorPolygonRegion(region)) {
    data = {
      label: labelOrText,
      polygon: {
        vertices: region.points.map((point) => ({
          x: point[0],
          y: point[1],
        })),
      },
    } as ImageObjectDetectionPolygon;
  }
  if (isAnnotatorLineRegion(region)) {
    data = {
      label: labelOrText,
      polyline: {
        vertices: [
          { x: region.x1, y: region.y1 },
          { x: region.x2, y: region.y2 },
        ],
      },
    } as ImageObjectDetectionPolyline;
  }
  if (isAnnotatorPointRegion(region)) {
    const { keypointLabel } = region;
    data = {
      id: String(region.id),
      keypoint: {
        label: keypointLabel,
        point: { x: region.x, y: region.y },
        confidence: region.keypointConfidence,
      },
      selected: region.editingLabels,
    } as ReviewKeypoint;
  }
  return data;
};

/**
 * Converts annotator region to UnsavedVision annotation
 *
 * This converts a region to Unsaved Vision Object Detection annotations for annotation creation
 * This does not accept AnnotatorPointRegions since single region is not enough to create an UnsavedVisionImageKeypointCollection
 * This does not accept regions that were converted from an existing annotation
 *
 * Also this only provides annotation for ImageObjectDetection type since currently app only creates such annotations
 * @param region
 */
export const convertRegionToUnsavedVisionAnnotation = (
  region: AnnotatorRegion
): Omit<
  UnsavedVisionAnnotation<ImageObjectDetection>,
  'annotatedResourceId'
> | null => {
  if (
    region.annotationMeta &&
    region.annotationMeta.annotation.lastUpdatedTime
  ) {
    console.error(
      'Cannot convert region, This region was converted from an existing annotation',
      JSON.stringify(region)
    );
    return null;
  }

  const data = getVisionAnnotationDataFromRegion(region);

  if (isEmpty(data)) {
    console.error(
      'Cannot convert region, Vision Annotation data not found',
      JSON.stringify(region)
    );
    return null;
  }

  if (!isImageObjectDetectionData(data as ImageObjectDetection)) {
    console.error(
      'Cannot convert region, convertRegionToUnsavedVisionAnnotation can only be used to create Unsaved Object detection annotations',
      JSON.stringify(region)
    );
    return null;
  }

  return {
    data: {
      ...data,
      confidence: 1,
    },
    annotationType: CDFAnnotationTypeEnum.ImagesObjectDetection,
    status: Status.Approved,
  } as Omit<
    UnsavedVisionAnnotation<ImageObjectDetection>,
    'annotatedResourceId'
  >;
};

export const convertTempKeypointCollectionToRegions = (
  tempKeypointCollection: TempKeypointCollection | null
): AnnotatorRegion[] => {
  const visionReviewImageKeypointCollection =
    convertTempKeypointCollectionToVisionReviewImageKeypointCollection(
      tempKeypointCollection
    );

  if (visionReviewImageKeypointCollection) {
    return convertVisionReviewAnnotationToRegions(
      visionReviewImageKeypointCollection
    );
  }
  return [];
};

export const convertAnnotatorRegionToAnnotationChangeProperties = (
  region: AnnotatorRegion
): AnnotationChangeById | null => {
  if (
    !region.annotationMeta ||
    !region.annotationMeta.annotation.lastUpdatedTime
  ) {
    // if the annotation wasn't saved atleast once
    return null;
  }
  if (isAnnotatorPointRegion(region)) {
    return convertAnnotatorPointRegionToAnnotationChangeProperties(region);
  }
  const annotationData = getVisionAnnotationDataFromRegion(region);

  return {
    id: +region.id,
    update: {
      data: { set: annotationData },
    },
  };
};

// todo: add test cases VIS-891
export const convertAnnotatorPointRegionToAnnotationChangeProperties = (
  region: AnnotatorPointRegion
): AnnotationChangeById | null => {
  if (
    !isAnnotatorPointRegion(region) ||
    !(region.annotationMeta && region.parentAnnotationId)
  ) {
    return null;
  }
  const annotationKeypoints: Record<
    string,
    {
      confidence?: number;
      point: { x: number; y: number };
    }
  > = {};
  (
    region.annotationMeta as VisionReviewAnnotation<ImageKeypointCollection>
  ).annotation.keypoints.forEach(({ keypoint }) => {
    annotationKeypoints[keypoint.label] = {
      confidence: keypoint.confidence,
      point: keypoint.point,
    };
  });
  return {
    id: region.parentAnnotationId,
    update: {
      data: {
        set: {
          label: region.annotationLabelOrText,
          confidence: 1,
          keypoints: {
            ...annotationKeypoints,
            [region.keypointLabel]: {
              confidence: region.keypointConfidence,
              point: { x: region.x, y: region.y },
            },
          },
        },
      },
    },
  };
};
