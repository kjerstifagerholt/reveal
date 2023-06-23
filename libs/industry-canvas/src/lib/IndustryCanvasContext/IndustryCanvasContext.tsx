import { createContext, useCallback, useContext, useMemo } from 'react';

import { useFlag } from '@cognite/react-feature-flags';
import { useSDK } from '@cognite/sdk-provider';
import { IdsByType } from '@cognite/unified-file-viewer';

import { CommentsFeatureFlagKey, MetricEvent } from '../constants';
import { useCanvasArchiveMutation } from '../hooks/use-mutation/useCanvasArchiveMutation';
import { useCanvasCreateMutation } from '../hooks/use-mutation/useCanvasCreateMutation';
import { useCanvasSaveMutation } from '../hooks/use-mutation/useCanvasSaveMutation';
import { useDeleteCanvasIdsByTypeMutation } from '../hooks/use-mutation/useDeleteCanvasIdsByTypeMutation';
import { useGetCanvasByIdQuery } from '../hooks/use-query/useGetCanvasByIdQuery';
import { useListCanvases } from '../hooks/use-query/useListCanvases';
import { IndustryCanvasService } from '../services/IndustryCanvasService';
import {
  ContainerReference,
  IndustryCanvasState,
  SerializedCanvasDocument,
} from '../types';
import { useUserProfile } from '../UserProfileProvider';
import useMetrics from '../utils/tracking/useMetrics';
import { serializeCanvasState } from '../utils/utils';

import useCanvasLocking from './useCanvasLocking';
import useIndustryCanvasSearchParameters from './useIndustryCanvasSearchParameters';

export type IndustryCanvasContextType = {
  activeCanvas: SerializedCanvasDocument | undefined;
  canvases: SerializedCanvasDocument[];
  canvasService: IndustryCanvasService | undefined;
  saveCanvas: (canvas: SerializedCanvasDocument) => Promise<void>;
  createCanvas: (
    canvas: IndustryCanvasState
  ) => Promise<SerializedCanvasDocument>;
  archiveCanvas: (externalId: string) => Promise<void>;
  deleteCanvasIdsByType: ({
    ids,
    canvasExternalId,
  }: {
    ids: IdsByType;
    canvasExternalId: string;
  }) => Promise<void>;
  isCreatingCanvas: boolean;
  isSavingCanvas: boolean;
  isLoadingCanvas: boolean;
  isListingCanvases: boolean;
  isArchivingCanvas: boolean;
  initializeWithContainerReferences: ContainerReference[] | undefined;
  setCanvasId: (canvasId: string) => void;
  isCanvasLocked: boolean;
  createInitialCanvas: () => Promise<void>;
  hasConsumedInitializeWithContainerReferences: boolean;
  setHasConsumedInitializeWithContainerReferences: (
    nextHasConsumed: boolean
  ) => void;
  isCommentsEnabled: boolean;
};

export const IndustryCanvasContext = createContext<IndustryCanvasContextType>({
  activeCanvas: undefined,
  canvases: [],
  canvasService: undefined,
  saveCanvas: () => {
    throw new Error('saveCanvas called before initialisation');
  },
  createCanvas: () => {
    throw new Error('createCanvas called before initialisation');
  },
  archiveCanvas: () => {
    throw new Error('archiveCanvas called before initialisation');
  },
  setCanvasId: () => {
    throw new Error('setCanvasId called before initialisation');
  },
  deleteCanvasIdsByType: () => {
    throw new Error('deleteCanvasIdsByType called before initialisation');
  },
  isCreatingCanvas: false,
  isSavingCanvas: false,
  isLoadingCanvas: false,
  isListingCanvases: false,
  isArchivingCanvas: false,
  initializeWithContainerReferences: undefined,
  isCanvasLocked: false,
  createInitialCanvas: () => {
    throw new Error('createInitialCanvas called before initialisation');
  },
  hasConsumedInitializeWithContainerReferences: false,
  setHasConsumedInitializeWithContainerReferences: () => {
    throw new Error(
      'setHasConsumedInitializeWithContainerReferences called before initialisation'
    );
  },
  isCommentsEnabled: false,
});

type IndustryCanvasProviderProps = {
  children: React.ReactNode;
};
export const IndustryCanvasProvider: React.FC<IndustryCanvasProviderProps> = ({
  children,
}): JSX.Element => {
  const sdk = useSDK();
  const trackUsage = useMetrics();
  const { userProfile } = useUserProfile();
  const canvasService = useMemo(
    () => new IndustryCanvasService(sdk, userProfile),
    [sdk, userProfile]
  );

  const { isEnabled: isCommentsEnabled } = useFlag(CommentsFeatureFlagKey, {
    fallback: false,
  });

  const {
    canvasId,
    setCanvasId,
    initializeWithContainerReferences,
    hasConsumedInitializeWithContainerReferences,
    setHasConsumedInitializeWithContainerReferences,
  } = useIndustryCanvasSearchParameters();

  const { data: activeCanvas, isLoading: isLoadingCanvas } =
    useGetCanvasByIdQuery(canvasService, canvasId);
  const { mutateAsync: saveCanvas, isLoading: isSavingCanvas } =
    useCanvasSaveMutation(canvasService);
  const { mutateAsync: createCanvas, isLoading: isCreatingCanvas } =
    useCanvasCreateMutation(canvasService);
  const { mutateAsync: archiveCanvas, isLoading: isArchivingCanvas } =
    useCanvasArchiveMutation(canvasService);
  const { mutateAsync: deleteCanvasIdsByType } =
    useDeleteCanvasIdsByTypeMutation(canvasService);
  const {
    data: canvases,
    isLoading: isListingCanvases,
    refetch: refetchCanvases,
  } = useListCanvases(canvasService);

  const { isCanvasLocked } = useCanvasLocking(
    canvasId,
    canvasService,
    userProfile
  );

  const saveCanvasWrapper = useCallback(
    async (canvasDocument: SerializedCanvasDocument) => {
      if (isCanvasLocked) {
        return;
      }

      await saveCanvas(canvasDocument);
    },
    [saveCanvas, isCanvasLocked]
  );

  const createInitialCanvas = useCallback(async () => {
    if (canvasId === undefined && !isCreatingCanvas) {
      const initialCanvas = canvasService.makeEmptyCanvas();
      const createdCanvas = await createCanvas(initialCanvas);
      setCanvasId(createdCanvas.externalId);
      refetchCanvases();
    }
  }, [
    canvasId,
    isCreatingCanvas,
    canvasService,
    createCanvas,
    refetchCanvases,
    setCanvasId,
  ]);

  const createCanvasWrapper = useCallback(
    async (canvas: IndustryCanvasState) => {
      const newCanvas = await createCanvas({
        ...canvasService.makeEmptyCanvas(),
        data: serializeCanvasState(canvas),
      });
      refetchCanvases();
      trackUsage(MetricEvent.CANVAS_CREATED);
      return newCanvas;
    },
    [canvasService, createCanvas, refetchCanvases, trackUsage]
  );

  const archiveCanvasWrapper = useCallback(
    async (externalId: string) => {
      if (isCanvasLocked) {
        return;
      }

      await archiveCanvas(externalId);
      if (externalId === activeCanvas?.externalId) {
        const nextCanvas = canvases?.find(
          (canvas) => canvas.externalId !== externalId
        );
        setCanvasId(nextCanvas?.externalId, true);
      }
      await refetchCanvases();
      trackUsage(MetricEvent.CANVAS_ARCHIVED);
    },
    [
      activeCanvas,
      canvases,
      archiveCanvas,
      refetchCanvases,
      setCanvasId,
      isCanvasLocked,
      trackUsage,
    ]
  );

  const deleteCanvasIdsByTypeWrapper = useCallback(
    async ({
      ids,
      canvasExternalId,
    }: {
      ids: IdsByType;
      canvasExternalId: string;
    }) => {
      if (isCanvasLocked) {
        return;
      }

      if (ids.annotationIds.length === 0 && ids.containerIds.length === 0) {
        return;
      }
      return deleteCanvasIdsByType({ ids, canvasExternalId });
    },
    [deleteCanvasIdsByType, isCanvasLocked]
  );

  return (
    <IndustryCanvasContext.Provider
      value={{
        activeCanvas,
        canvases: canvases ?? [],
        canvasService,
        isCreatingCanvas,
        isSavingCanvas,
        isLoadingCanvas,
        isListingCanvases,
        isArchivingCanvas,
        createCanvas: createCanvasWrapper,
        saveCanvas: saveCanvasWrapper,
        archiveCanvas: archiveCanvasWrapper,
        setCanvasId,
        deleteCanvasIdsByType: deleteCanvasIdsByTypeWrapper,
        isCanvasLocked,
        createInitialCanvas,
        initializeWithContainerReferences,
        hasConsumedInitializeWithContainerReferences,
        setHasConsumedInitializeWithContainerReferences,
        isCommentsEnabled,
      }}
    >
      {children}
    </IndustryCanvasContext.Provider>
  );
};

export const useIndustryCanvasContext = (): IndustryCanvasContextType =>
  useContext(IndustryCanvasContext);
