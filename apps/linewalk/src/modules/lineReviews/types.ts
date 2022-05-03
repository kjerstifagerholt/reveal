import { PDFDocumentProxy } from 'pdfjs-dist/types/display/api';

import { Discrepancy } from '../../components/LineReviewViewer/LineReviewViewer';

export type BoundingBox = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type Annotation = {
  id: string;
  type: string;
  boundingBox: BoundingBox;
  svgPaths: { svgCommands: string }[];
  nearestAssetExternalIds: [];
  lineNumbers: string[];
  labelIds?: string[];
  text?: string;
};

export type LineReviewAnnotationStatus = 'UNCHECKED' | 'CHECKED';
export type DateTime = number;
export type Comment = {
  text: string;
  user: {
    name: string;
  };
};

export type DocumentConnection = [string, string]; // List of annotation ids to connect

export enum DocumentType {
  PID = 'p&id',
  ISO = 'iso',
}

export type Link = {
  from: {
    documentId: string;
    annotationId: string;
  };
  to: {
    documentId: string;
    annotationId: string;
  };
};

export type WorkspaceDocument = {
  pdfExternalId: string;
  type: DocumentType;
  pdf: PDFDocumentProxy;
};

export type ParsedDocument = {
  externalId: string;
  pdfExternalId: string;
  type: 'p&id' | 'iso';
  linking: Link[];
  viewBox: BoundingBox;
  annotations: Annotation[];
};

export enum LineReviewStatus {
  OPEN = 'OPEN',
  REVIEWED = 'REVIEWED',
  COMPLETED = 'COMPLETED',
}

// Text annotation needs target document as well as the bounding box
export type TextAnnotation = {
  id: string;
  text: string;
  boundingBox: BoundingBox;
  fontSize?: number;
  fill?: string;
  targetExternalId: string;
};

export type LineReviewState = {
  discrepancies: Discrepancy[];
  textAnnotations?: TextAnnotation[];
};

export type LineReview = {
  id: string;
  name: string;
  system: string;
  textAnnotations?: TextAnnotation[];
  assignee: string;
  // All lines need to be manually reviewed at this stage, so a lack of discrepancies does not
  // mean that the review is complete.
  status: LineReviewStatus;
  comment?: string;
  pdfExternalIds: string[];
  unit: string;
} & LineReviewState;

export enum AnnotationType {
  FILE_CONNECTION = 'fileConnection',
}
