import { QueryClient, QueryClientProvider } from 'react-query';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from 'src/store/rootReducer';
import { hideFileMetadataPreview } from 'src/modules/Process/processSlice';
import { FileDetails } from 'src/modules/FileDetails/Containers/FileDetails';
import React from 'react';
import styled from 'styled-components';

const Container = styled.div`
  width: 400px;
  border: 1px solid #d9d9d9;
  box-sizing: content-box;
  flex-shrink: 0;
  height: 100%;
  overflow: auto;
`;

export const ProcessFileDetailsContainer = () => {
  const queryClient = new QueryClient();
  const dispatch = useDispatch();
  const fileId = useSelector(
    ({ processSlice }: RootState) => processSlice.selectedFileId
  );
  const showFileDetails = useSelector(
    ({ processSlice }: RootState) => processSlice.showFileMetadataDrawer
  );
  const onClose = () => {
    dispatch(hideFileMetadataPreview());
  };
  if (showFileDetails) {
    return (
      <Container>
        <QueryClientProvider client={queryClient}>
          <FileDetails fileId={fileId} onClose={onClose} />
        </QueryClientProvider>
      </Container>
    );
  }
  return null;
};
