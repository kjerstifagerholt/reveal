import React from 'react';
import { Button } from '@cognite/cogs.js';

export type LoadMoreProps = {
  hasNextPage?: boolean;
  isLoadingMore?: boolean;
  fetchMore?: Function;
  text?: string;
};

export const LoadMore: React.FC<LoadMoreProps> = ({
  hasNextPage = false,
  isLoadingMore = false,
  text = 'Load More',
  fetchMore = () => {},
  ...rest
}) => {
  if (!hasNextPage) {
    return null;
  }

  return (
    <Button
      type="secondary"
      loading={isLoadingMore}
      onClick={() => fetchMore()}
      {...rest}
    >
      {text}
    </Button>
  );
};
