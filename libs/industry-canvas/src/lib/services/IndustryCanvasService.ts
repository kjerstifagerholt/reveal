import { omit } from 'lodash';
import { v4 as uuid } from 'uuid';

import type { CogniteClient } from '@cognite/sdk';
import { IdsByType } from '@cognite/unified-file-viewer';

import { UserProfile } from '../hooks/use-query/useUserProfile';
import { Comment, CanvasMetadata, SerializedCanvasDocument } from '../types';
import { FDMClient, gql } from '../utils/FDMClient';

import {
  getAnnotationOrContainerExternalId,
  getSerializedCanvasStateFromFDMCanvasState,
  upsertCanvas,
} from './dataModelUtils';
import { FDMCanvasState } from './types';

export const DEFAULT_CANVAS_NAME = 'Untitled canvas';

export enum ModelNames {
  CANVAS = 'Canvas',
  CONTAINER_REFERENCE = 'ContainerReference',
  CANVAS_ANNOTATION = 'CanvasAnnotation',
}

type PageInfo = {
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  startCursor?: string;
  endCursor: string;
};

// NOTE: We manually omit createdTime from our Canvas type, since it's supplied
// by FDM and we can't update it manually
const omitCreatedTimeFromSerializedCanvas = (
  canvas: SerializedCanvasDocument
): Omit<SerializedCanvasDocument, 'createdTime'> =>
  omit(canvas, ['createdTime']);

export class IndustryCanvasService {
  // TODO(marvin): switch over to using 'cdf_industrial_canvas' once the system data models are working
  public static readonly SYSTEM_SPACE = 'IndustrialCanvasLocalSpaceV1';
  public static readonly SYSTEM_SPACE_VERSION = 'v1';
  // TODO(marvin): use different instance space from system space once system data models are working again
  public static readonly INSTANCE_SPACE = IndustryCanvasService.SYSTEM_SPACE;
  public static readonly DATA_MODEL_EXTERNAL_ID = 'IndustrialCanvas';
  private readonly LIST_LIMIT = 1000; // The max number of items to retrieve in one list request

  // Comment stuff. TODO: the comment data model should probably live in the system space for the canvas data model
  public static readonly COMMENT_SYSTEM_SPACE = 'IndustryCanvasComments';
  public static readonly COMMENT_INSTANCE_SPACE =
    IndustryCanvasService.SYSTEM_SPACE;
  public static readonly COMMENT_INSTANCE_SPACE_VERSION = 'v1';
  public static readonly COMMENT_DATA_MODEL_EXTERNAL_ID =
    'IndustryCanvasComments';

  private fdmClient: FDMClient;
  private fdmClientForComments: FDMClient;
  private cogniteClient: CogniteClient;
  private userProfile: UserProfile;

  public constructor(client: CogniteClient, userProfile: UserProfile) {
    this.cogniteClient = client;
    this.fdmClient = new FDMClient(client, {
      systemSpace: IndustryCanvasService.SYSTEM_SPACE,
      systemSpaceVersion: IndustryCanvasService.SYSTEM_SPACE_VERSION,
      instanceSpace: IndustryCanvasService.INSTANCE_SPACE,
    });
    this.fdmClientForComments = new FDMClient(client, {
      systemSpace: IndustryCanvasService.COMMENT_INSTANCE_SPACE,
      systemSpaceVersion: IndustryCanvasService.COMMENT_INSTANCE_SPACE_VERSION,
      instanceSpace: IndustryCanvasService.COMMENT_INSTANCE_SPACE,
    });
    this.userProfile = userProfile;
  }

  public async getCanvasById(
    canvasId: string
  ): Promise<SerializedCanvasDocument> {
    const res = await this.fdmClient.graphQL<{
      canvases: {
        items: (Omit<SerializedCanvasDocument, 'data'> & FDMCanvasState)[];
      };
    }>(
      // TODO(DEGR-2457): add support for paginating through containerReferences and canvasAnnotations
      gql`
        query GetCanvasById($filter: _List${ModelNames.CANVAS}Filter) {
          canvases: listCanvas(filter: $filter) {
            items {
              externalId
              name
              isArchived
              createdTime
              createdBy
              updatedAt
              updatedBy
              containerReferences (first: ${this.LIST_LIMIT}) {
                items {
                  id
                  containerReferenceType
                  resourceId
                  resourceSubId
                  label
                  properties
                  width
                  height
                  maxWidth
                  maxHeight
                  x
                  y
                }
              }
              canvasAnnotations (first: ${this.LIST_LIMIT}) {
                items {
                  id
                  annotationType
                  containerId
                  isSelectable
                  isDraggable
                  isResizable
                  properties
                }
              }
            }
          }
        }
      `,
      IndustryCanvasService.DATA_MODEL_EXTERNAL_ID,
      { filter: { externalId: { eq: canvasId } } }
    );
    if (res.canvases.items.length === 0) {
      throw new Error(`Couldn't find canvas with id ${canvasId}`);
    }

    const fdmCanvas = res.canvases.items[0];
    return {
      ...omit(fdmCanvas, ['canvasAnnotations', 'containerReferences']),
      data: getSerializedCanvasStateFromFDMCanvasState({
        containerReferences: fdmCanvas.containerReferences,
        canvasAnnotations: fdmCanvas.canvasAnnotations,
      }),
    };
  }

  public async getCanvasMetadataById(
    canvasId: string
  ): Promise<CanvasMetadata> {
    const res = await this.fdmClient.graphQL<{
      canvases: {
        items: CanvasMetadata[];
      };
    }>(
      gql`
        query GetCanvasById($filter: _List${ModelNames.CANVAS}Filter) {
          canvases: listCanvas(filter: $filter) {
            items {
              externalId
              name
              isArchived
              createdTime
              createdBy
              updatedAt
              updatedBy
            }
          }
        }
      `,
      IndustryCanvasService.DATA_MODEL_EXTERNAL_ID,
      { filter: { externalId: { eq: canvasId } } }
    );
    if (res.canvases.items.length === 0) {
      throw new Error(`Couldn't find canvas with id ${canvasId}`);
    }

    return res.canvases.items[0];
  }

  private async getPaginatedCanvasData(
    cursor: string | undefined = undefined,
    paginatedData: SerializedCanvasDocument[] = [],
    limit: number = this.LIST_LIMIT
  ): Promise<SerializedCanvasDocument[]> {
    // TODO: Check this. Data is fetching. How is serialisation happening here? We don't want to hydrate the configs.
    const res = await this.fdmClient.graphQL<{
      canvases: { items: SerializedCanvasDocument[]; pageInfo: PageInfo };
    }>(
      gql`
        query ListCanvases($filter: _List${ModelNames.CANVAS}Filter) {
          canvases: list${ModelNames.CANVAS}(
            filter: $filter,
            first: ${limit},
            after: ${cursor === undefined ? null : `"${cursor}"`},
            sort: { updatedAt: DESC }
          ) {
            items {
              externalId
              name
              createdTime
              createdBy
              updatedAt
              updatedBy
            }
            pageInfo {
              startCursor
              hasPreviousPage
              hasNextPage
              endCursor
            }
          }
        }
      `,
      IndustryCanvasService.DATA_MODEL_EXTERNAL_ID,
      {
        filter: {
          or: [{ isArchived: { eq: false } }, { isArchived: { isNull: true } }],
        },
      }
    );
    const { items, pageInfo } = res.canvases;

    paginatedData.push(...items);
    if (pageInfo.hasNextPage) {
      return await this.getPaginatedCanvasData(
        pageInfo.endCursor,
        paginatedData,
        limit
      );
    }

    return paginatedData;
  }

  public async listCanvases(): Promise<SerializedCanvasDocument[]> {
    return this.getPaginatedCanvasData();
  }
  private async getPaginatedComments(
    cursor: string | undefined = undefined,
    paginatedData: Comment[] = [],
    limit: number = this.LIST_LIMIT
  ): Promise<Comment[]> {
    // TODO: Check this. Data is fetching. How is serialisation happening here? We don't want to hydrate the configs.
    const res = await this.fdmClientForComments.graphQL<{
      comments: { items: Comment[]; pageInfo: PageInfo };
    }>(
      gql`
        query ListCanvases($filter: _ListCommentFilter) {
          comments: listComment(
            filter: $filter,
            first: ${limit},
            after: ${cursor === undefined ? null : `"${cursor}"`}
          ) {
            items {
              text
              author
              thread {
                externalId
              }
              canvas {
                externalId
              }
              x
              y
              externalId
              createdTime
              lastUpdatedTime
            }
            pageInfo {
              startCursor
              hasPreviousPage
              hasNextPage
              endCursor
            }
          }
        }
      `,
      IndustryCanvasService.COMMENT_DATA_MODEL_EXTERNAL_ID,
      {
        filter: {
          and: [
            {
              canvas: {
                and: [
                  {
                    or: [
                      { isArchived: { eq: false } },
                      { isArchived: { isNull: true } },
                    ],
                  },
                ],
              },
            },
          ],
        },
      }
    );
    const { items, pageInfo } = res.comments;

    paginatedData.push(
      ...items.map((el) => ({
        ...el,
        createdTime: new Date(el.createdTime),
        lastUpdatedTime: new Date(el.lastUpdatedTime),
        subComments: [],
      }))
    );
    if (pageInfo.hasNextPage) {
      return await this.getPaginatedComments(
        pageInfo.startCursor,
        paginatedData,
        limit
      );
    }

    return paginatedData;
  }

  public async listComments(): Promise<Comment[]> {
    return this.getPaginatedComments();
  }

  public async saveCanvas(
    canvas: SerializedCanvasDocument
  ): Promise<SerializedCanvasDocument> {
    const updatedCanvas: SerializedCanvasDocument = {
      ...canvas,
      updatedBy: this.userProfile.userIdentifier,
      updatedAt: new Date().toISOString(),
    };
    await upsertCanvas(
      this.fdmClient,
      omitCreatedTimeFromSerializedCanvas(updatedCanvas)
    );
    // This will induce an error because timestamps for instance will be incorrect
    return updatedCanvas;
  }
  public async saveComment(
    comment: Omit<Comment, 'lastUpdatedTime' | 'createdTime' | 'subComments'>
  ): Promise<Comment> {
    await this.fdmClientForComments.upsertNodes([
      {
        modelName: 'Comment',
        ...comment,
        ...(comment.thread
          ? {
              thread: {
                externalId: comment.thread.externalId,
                space: IndustryCanvasService.COMMENT_INSTANCE_SPACE,
              },
            }
          : null),
        ...(comment.canvas
          ? {
              canvas: {
                externalId: comment.canvas.externalId,
                space: IndustryCanvasService.COMMENT_INSTANCE_SPACE,
              },
            }
          : null),
      },
    ]);
    // This will induce an error because timestamps for instance will be incorrect
    return {
      ...comment,
      createdTime: new Date(),
      lastUpdatedTime: new Date(),
      subComments: [],
    };
  }

  public async archiveCanvas(canvas: SerializedCanvasDocument): Promise<void> {
    await this.fdmClient.upsertNodes([
      {
        modelName: ModelNames.CANVAS,
        ...omit(canvas, ['data', 'createdTime']),
        isArchived: true,
      },
    ]);
  }

  public async createCanvas(
    canvas: SerializedCanvasDocument
  ): Promise<SerializedCanvasDocument> {
    return await upsertCanvas(
      this.fdmClient,
      omitCreatedTimeFromSerializedCanvas(canvas)
    );
  }

  public async deleteCanvasById(canvasId: string): Promise<void> {
    await this.fdmClient.deleteNodes(canvasId);
  }

  public async deleteCommentByIds(commentIds: string[]): Promise<void> {
    await this.fdmClientForComments.deleteNodes(commentIds);
  }

  public async deleteCanvasIdsByType(
    ids: IdsByType,
    canvasId: string
  ): Promise<void> {
    await this.fdmClient.deleteNodes(
      [...ids.annotationIds, ...ids.containerIds].map((id) =>
        getAnnotationOrContainerExternalId(id, canvasId)
      )
    );
  }

  public makeEmptyCanvas = (): SerializedCanvasDocument => {
    return {
      externalId: uuid(),
      name: DEFAULT_CANVAS_NAME,
      createdTime: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      updatedBy: this.userProfile.userIdentifier,
      createdBy: this.userProfile.userIdentifier,
      data: {
        containerReferences: [],
        canvasAnnotations: [],
      },
    };
  };
}
