import React from 'react';
import axios from 'axios';
import { CommentResponse, CommentTarget } from '@cognite/comment-service-types';
import { getAuthHeaders } from '@cognite/react-container';
import { MessageType } from '@cognite/cogs.js';

interface Props {
  serviceUrl: string;
  target: CommentTarget;
}

export const useFetchComments = ({ target, serviceUrl }: Props) => {
  const headers = getAuthHeaders({ useIdToken: true });
  const [fetchedComments, setFetchComments] = React.useState<CommentResponse[]>(
    []
  );

  React.useEffect(() => {
    axios
      .post<{ items: CommentResponse[] }>(
        `${serviceUrl}/comment/list`,
        {
          filter: { target, scope: ['fas-demo'] },
        },
        { headers }
      )
      .then((result) => {
        setFetchComments(result.data.items);
      });
  }, [serviceUrl]);

  return {
    comments: fetchedComments ? fetchedComments.map(normalizeComment) : [],
  };
};

const normalizeComment = (comment: CommentResponse): MessageType => {
  return {
    // @ts-expect-error will be there soon:
    id: comment.id,
    // eslint-disable-next-line no-underscore-dangle
    user: comment._owner || 'Unknown',
    timestamp: Number(new Date(comment.lastUpdatedTime || '')),
    text: comment.comment,
    // hide?: boolean,
    // isUnread?: boolean,
  };
};
