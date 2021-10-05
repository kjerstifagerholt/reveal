import { FileInfo } from '@cognite/cdf-sdk-singleton';
import { Button, Tooltip } from '@cognite/cogs.js';
import { unwrapResult } from '@reduxjs/toolkit';
import React, { ReactText, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { UnsavedAnnotation } from 'src/api/annotation/types';
import { Annotation } from 'src/api/types';
import { CollectionSettingsModal } from 'src/modules/Review/Components/CollectionSettingsModal/CollectionSettingsModal';
import { KeyboardShortcutModal } from 'src/modules/Review/Components/KeyboardShortcutModal/KeyboardShortcutModal';
import { ReactImageAnnotateWrapper } from 'src/modules/Review/Components/ReactImageAnnotateWrapper/ReactImageAnnotateWrapper';
import {
  currentCollection,
  deleteCurrentCollection,
  nextKeyPoint,
  nextShape,
} from 'src/modules/Review/store/annotationLabelSlice';
import {
  showCollectionSettingsModel,
  VisibleAnnotation,
} from 'src/modules/Review/store/reviewSlice';
import { AnnotationTableItem } from 'src/modules/Review/types';
import { AppDispatch } from 'src/store';
import { deselectAllSelectionsReviewPage } from 'src/store/commonActions';
import { RootState } from 'src/store/rootReducer';
import { CreateAnnotations } from 'src/store/thunks/Annotation/CreateAnnotations';
import { UpdateAnnotations } from 'src/store/thunks/Annotation/UpdateAnnotations';
import { DeleteAnnotationsAndHandleLinkedAssetsOfFile } from 'src/store/thunks/Review/DeleteAnnotationsAndHandleLinkedAssetsOfFile';
import { pushMetric } from 'src/utils/pushMetric';
import styled from 'styled-components';

export const ImagePreview = ({
  file,
  onEditMode,
  annotations,
  isLoading,
  scrollIntoView,
}: {
  file: FileInfo;
  onEditMode: (editMode: boolean) => void;
  annotations: VisibleAnnotation[];
  isLoading: (status: boolean) => void;
  scrollIntoView: (id: ReactText) => void;
}) => {
  const dispatch: AppDispatch = useDispatch();
  const [showKeyboardShortcutModal, setShowKeyboardShortcutModal] =
    useState(false);

  const definedCollection = useSelector(
    ({ annotationLabelReducer }: RootState) =>
      annotationLabelReducer.predefinedCollections
  );

  const currentShape = useSelector(({ annotationLabelReducer }: RootState) =>
    nextShape(annotationLabelReducer)
  );

  const nextPoint = useSelector(({ annotationLabelReducer }: RootState) =>
    nextKeyPoint(annotationLabelReducer)
  );

  const currentKeypointCollection = useSelector(
    ({ annotationLabelReducer }: RootState) =>
      currentCollection(annotationLabelReducer)
  );

  const showCollectionSettingsModal = useSelector(
    ({ reviewSlice }: RootState) => reviewSlice.showCollectionSettings
  );

  useEffect(() => {
    if (currentKeypointCollection) {
      scrollIntoView(currentKeypointCollection.id);
    }
  }, [currentKeypointCollection]);

  const handleCreateAnnotation = async (annotation: UnsavedAnnotation) => {
    pushMetric('Vision.Review.CreateAnnotation');

    if (annotation?.region?.shape === 'rectangle') {
      pushMetric('Vision.Review.CreateAnnotation.Rectangle');
    }
    if (annotation?.region?.shape === 'points') {
      pushMetric('Vision.Review.CreateAnnotation.Points');
    }
    if (annotation?.region?.shape === 'polygon') {
      pushMetric('Vision.Review.CreateAnnotation.Polygon');
    }
    const res = await dispatch(
      CreateAnnotations({ fileId: file.id, annotation })
    );
    const createdAnnotations = unwrapResult(res);

    if (createdAnnotations.length && createdAnnotations[0].id) {
      scrollIntoView(createdAnnotations[0].id);
    }
  };

  const handleModifyAnnotation = async (annotation: Annotation) => {
    dispatch(deselectAllSelectionsReviewPage());
    await dispatch(UpdateAnnotations([annotation]));
  };

  const handleDeleteAnnotation = (annotation: Annotation) => {
    dispatch(
      DeleteAnnotationsAndHandleLinkedAssetsOfFile({
        annotationIds: [annotation.id],
        showWarnings: true,
      })
    );
  };

  const handleInEditMode = (mode: boolean) => {
    onEditMode(mode);
  };

  const onFocus = (annotation: AnnotationTableItem) => {
    scrollIntoView(annotation.id);
  };

  const onSelectTool = () => {
    dispatch(deleteCurrentCollection());
    dispatch(deselectAllSelectionsReviewPage());
  };

  const onOpenCollectionSettings = () => {
    dispatch(showCollectionSettingsModel(true));
  };

  const onOpenKeyboardShortcuts = () => {
    setShowKeyboardShortcutModal(true);
  };

  return (
    <Container>
      <ReactImageAnnotateWrapper
        fileInfo={file}
        annotations={annotations}
        onCreateAnnotation={handleCreateAnnotation}
        onUpdateAnnotation={handleModifyAnnotation}
        onDeleteAnnotation={handleDeleteAnnotation}
        handleInEditMode={handleInEditMode}
        collection={definedCollection}
        currentShape={currentShape}
        nextKeyPoint={nextPoint}
        currentCollection={currentKeypointCollection}
        isLoading={isLoading}
        onSelectTool={onSelectTool}
        focusIntoView={onFocus}
      />
      <ExtraToolbar>
        <Tooltip
          content={
            <span data-testid="text-content">
              Open keyboard shortcuts legend
            </span>
          }
        >
          <ExtraToolItem
            type="ghost"
            icon="ExternalLink"
            aria-label="keyboard shortcuts"
            onClick={onOpenKeyboardShortcuts}
            toggled={showKeyboardShortcutModal}
          />
        </Tooltip>
        <Tooltip
          content={<span data-testid="text-content">Collection settings</span>}
        >
          <ExtraToolItem
            type="ghost"
            icon="Settings"
            aria-label="open collection settings"
            onClick={onOpenCollectionSettings}
            toggled={showCollectionSettingsModal}
          />
        </Tooltip>
      </ExtraToolbar>
      <CollectionSettingsModal
        showModal={showCollectionSettingsModal}
        onCancel={() => dispatch(showCollectionSettingsModel(false))}
      />
      <KeyboardShortcutModal
        showModal={showKeyboardShortcutModal}
        onCancel={() => setShowKeyboardShortcutModal(false)}
      />
    </Container>
  );
};

const Container = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
`;

const ExtraToolbar = styled.div`
  position: absolute;
  bottom: 10px;
  width: 50px;
  display: grid;
`;

const ExtraToolItem = styled(Button)`
  height: 50px;
  width: 50px;
  border-radius: 50px;
`;
