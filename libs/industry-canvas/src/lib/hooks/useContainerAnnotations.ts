import { useCallback, useMemo } from 'react';

import {
  getExtendedAnnotationsFromAnnotationsApi,
  getStyledAnnotationFromAnnotation,
} from '@cognite/data-exploration';

import { ExtendedAnnotation } from '@data-exploration-lib/core';

import { MetricEvent } from '../constants';
import {
  setInteractionState,
  useIndustrialCanvasStore,
} from '../state/useIndustrialCanvasStore';
import { IndustryCanvasContainerConfig } from '../types';
import useMetrics from '../utils/tracking/useMetrics';

import { useAnnotationsMultiple } from './useAnnotationsMultiple';

type useContainerAnnotationsParams = {
  containers: IndustryCanvasContainerConfig[];
};

export const useContainerAnnotations = ({
  containers,
}: useContainerAnnotationsParams): ExtendedAnnotation[] => {
  const trackUsage = useMetrics();
  const { data: annotationsApiAnnotationsByContainerId } =
    useAnnotationsMultiple(containers);
  const { hoverId, clickedContainerAnnotationId } = useIndustrialCanvasStore(
    (state) => ({
      hoverId: state.interactionState.hoverId,
      clickedContainerAnnotationId:
        state.interactionState.clickedContainerAnnotationId,
    })
  );

  const onClick = useCallback(
    (annotation: ExtendedAnnotation) => {
      setInteractionState((prevInteractionState) => {
        const wasAlreadyClicked =
          prevInteractionState.clickedContainerAnnotationId === annotation.id;
        trackUsage(MetricEvent.CONTAINER_ANNOTATION_CLICKED, {
          annotatedResourceType: annotation.metadata.annotationType,
          wasAlreadyClicked,
        });
        return {
          clickedContainerId: undefined,
          hoverId: undefined,
          clickedContainerAnnotationId: wasAlreadyClicked
            ? undefined
            : annotation.id,
        };
      });
    },
    [trackUsage]
  );

  const onMouseOver = useCallback((annotation: ExtendedAnnotation) => {
    setInteractionState((prevInteractionState) => ({
      ...prevInteractionState,
      hoverId: annotation.id,
    }));
  }, []);

  const onMouseOut = useCallback(() => {
    setInteractionState((prevInteractionState) => ({
      ...prevInteractionState,
      hoverId: undefined,
    }));
  }, []);

  return useMemo(() => {
    if (annotationsApiAnnotationsByContainerId === undefined) {
      return [];
    }

    const extendedAnnotations = Object.entries(
      annotationsApiAnnotationsByContainerId
    )
      .flatMap(([containerId, annotationsForContainerConfig]) =>
        getExtendedAnnotationsFromAnnotationsApi(
          annotationsForContainerConfig,
          containerId
        )
      )
      .map((annotation) => {
        const isSelected = clickedContainerAnnotationId === annotation.id;
        const isOnHover = hoverId === String(annotation.id);
        return getStyledAnnotationFromAnnotation(
          annotation,
          isSelected,
          false,
          isOnHover
        );
      })
      .map(
        (annotation) =>
          ({
            ...annotation,
            onClick: (e, annotation: ExtendedAnnotation) => {
              e.cancelBubble = true;
              if (onClick) {
                onClick(annotation);
              }
            },
            onMouseOver: (e, annotation: ExtendedAnnotation) => {
              e.cancelBubble = true;
              if (onMouseOver) {
                onMouseOver(annotation);
              }
            },
            onMouseOut: (e) => {
              e.cancelBubble = true;
              if (onMouseOut) {
                onMouseOut();
              }
            },
          } as ExtendedAnnotation)
      );

    return extendedAnnotations;
  }, [
    onClick,
    clickedContainerAnnotationId,
    hoverId,
    annotationsApiAnnotationsByContainerId,
    containers,
  ]);
};
