import {
  CogniteInternalId,
  ExternalId,
  IdEither,
  InternalId,
} from '@cognite/sdk';
import { AnnotationRegion } from 'src/api/vision/detectionModels/types';
import { Keypoint } from 'src/modules/Review/types';
import { AnnotationStatus } from 'src/utils/AnnotationUtils';

// Constants
export enum RegionShape {
  Points = 'points',
  Rectangle = 'rectangle',
  Polygon = 'polygon',
}

export enum Status {
  Suggested = 'suggested',
  Approved = 'approved',
  Rejected = 'rejected',
}

// Primitives
type Label = {
  label: string;
};

type Confidence = {
  confidence: number;
};

export type Point = {
  x: number;
  y: number;
};

export type BoundingBox = {
  xMin: number;
  yMin: number;
  xMax: number;
  yMax: number;
};

export type Polygon = {
  vertices: Point[];
};

export type TextRegion = {
  textRegion: BoundingBox;
};

export type ImageKeypoint = Label &
  Partial<Confidence> & {
    point: Point;
  };

export type Timestamp = number;

export interface AnnotatedResourceId {
  annotatedResourceId: CogniteInternalId;
}

// Data field Types

// Image types
export type ImageClassification = Label & Partial<Confidence>;

export type ImageObjectDetectionBoundingBox = Label &
  Partial<Confidence> & {
    boundingBox: BoundingBox;
  };

export type ImageObjectDetectionPolygon = Label &
  Partial<Confidence> & {
    polygon: Polygon;
  };

export type ImageExtractedText = TextRegion &
  Partial<Confidence> & {
    extractedText: string;
  };

export type ImageAssetLink = TextRegion &
  Partial<Confidence> & {
    text: string;
    assetRef: InternalId & Partial<ExternalId>;
  };

export type ImageKeypointCollection = Label &
  Partial<Confidence> & {
    keypoints: ImageKeypoint[];
  };

// Annotation API V2 types todo: remove this and import correct type from @cognite/sdk when v2 becomes available

export type ImageObjectDetection =
  | ImageObjectDetectionBoundingBox
  | ImageObjectDetectionPolygon;

export type CDFAnnotationDataType = ImageClassification | ImageObjectDetection;

export type CDFImageObjectDetectionTypeName = 'images.ObjectDetection';
export type CDFImageClassificationTypeName = 'images.Classification';

export type CDFAnnotationStatus =
  | `${Status.Suggested}`
  | `${Status.Approved}`
  | `${Status.Rejected}`;

export type CDFAnnotationType<Type> = Type extends ImageObjectDetection
  ? CDFImageObjectDetectionTypeName
  : Type extends ImageClassification
  ? CDFImageClassificationTypeName
  : never;

export type CDFAnnotationV2<Type> = AnnotatedResourceId & {
  createdTime: Timestamp;
  lastUpdatedTime: Timestamp;
  annotatedResourceType: 'file';
  status: CDFAnnotationStatus;
  annotationType: CDFAnnotationType<Type>;
  data: Type;
};

// Annotation API types
export type AnnotationTypeV1 =
  | 'vision/ocr'
  | 'vision/tagdetection'
  | 'vision/objectdetection'
  | 'vision/custommodel'
  | 'user_defined'
  | 'CDF_ANNOTATION_TEMPLATE';

export type AnnotationSourceV1 = 'context_api' | 'user';

export type AnnotationMetadataV1 = {
  keypoint?: boolean;
  keypoints?: Keypoint[];
  color?: string;
  confidence?: number;
};

interface CDFBaseAnnotationV1 {
  text: string;
  data?: AnnotationMetadataV1;
  region?: AnnotationRegion;
  annotatedResourceId: number;
  annotatedResourceExternalId?: string;
  annotatedResourceType: 'file';
  annotationType: AnnotationTypeV1;
  source: AnnotationSourceV1;
  status: AnnotationStatus;
  id: number;
  createdTime: number;
  lastUpdatedTime: number;
}

export interface CDFLinkedAnnotationV1 extends CDFBaseAnnotationV1 {
  linkedResourceId?: number;
  linkedResourceExternalId?: string;
  linkedResourceType?: 'asset' | 'file';
}

export type CDFAnnotationV1 = CDFLinkedAnnotationV1;

export interface AnnotationListRequest {
  limit?: number;
  cursor?: string;
  filter?: Partial<
    Pick<
      CDFLinkedAnnotationV1,
      | 'linkedResourceType'
      | 'annotatedResourceType'
      | 'annotationType'
      | 'source'
      | 'text'
    >
  > & { annotatedResourceIds?: IdEither[]; linkedResourceIds: IdEither[] };
}

export type UnsavedAnnotation = Omit<
  CDFAnnotationV1,
  'id' | 'createdTime' | 'lastUpdatedTime' | 'status'
> & {
  data?: { useCache?: boolean; threshold?: number };
  status?: AnnotationStatus;
};

export interface AnnotationCreateRequest {
  items: UnsavedAnnotation[];
}

type annotationUpdateField<T> = { set: any } | { setNull: true } | T;
export interface AnnotationUpdateRequest {
  items: {
    id: number;
    update: {
      text?: annotationUpdateField<string>;
      status?: annotationUpdateField<AnnotationStatus>;
      region?: annotationUpdateField<AnnotationRegion>;
      data?: annotationUpdateField<AnnotationMetadataV1>;
    };
  }[];
}
