import { useEffect, useRef, useState } from 'react';

import styled from 'styled-components';

import { Button, Colors, Body, Flex, InputExp } from '@cognite/cogs.js';
import { AnnotationModel } from '@cognite/sdk/dist/src';

import { FLOATING_ELEMENT_MARGIN } from '../../../pages/ContextualizeEditor/constants';
import { useAnnotationModelsWithAsset } from '../hooks/useAnnotationModelsWithAsset';
import { setHoveredAnnotationId } from '../useContextualizeThreeDViewerStore';

type AnnotationsCardProps = {
  annotations: AnnotationModel[] | null;
  onDeleteAnnotation: (annotation: AnnotationModel) => void;
  onZoomToAnnotation: (annotationId: number) => void;
};

export const AnnotationsCard = ({
  annotations,
  onDeleteAnnotation,
  onZoomToAnnotation,
}: AnnotationsCardProps) => {
  const divRef = useRef<HTMLDivElement>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchValue, setSearchValue] = useState('');

  const { data: annotationsWithAssets } =
    useAnnotationModelsWithAsset(annotations);

  const stopPropagation = (event: Event): void => {
    event.stopPropagation();
  };

  // This is taken from: https://github.com/cognitedata/reveal/blob/master/react-components/src/higher-order-components/withSuppressRevealEvents.tsx
  // TODO: Investigate if we can use the exported withSuppressRevealEvents higher-order component instead.
  useEffect(() => {
    if (divRef.current === null) return;

    const div = divRef.current;

    div.addEventListener('pointerdown', stopPropagation);
    div.addEventListener('pointermove', stopPropagation);
    div.addEventListener('wheel', stopPropagation);
    div.addEventListener('keydown', stopPropagation);

    return () => {
      div.removeEventListener('pointerdown', stopPropagation);
      div.removeEventListener('pointermove', stopPropagation);
      div.removeEventListener('wheel', stopPropagation);
      div.removeEventListener('keydown', stopPropagation);
    };

    // This useEffect doesn't have a dependency array since I didn't manage to get it to work with one.
    // TODO: Investigate a better approach.
  });

  const filteredAnnotationsWithAssets = annotationsWithAssets?.filter(
    ({ asset, annotation }) =>
      asset?.name.toLowerCase().includes(searchValue.toLowerCase()) ||
      asset?.id.toString().includes(searchValue) ||
      annotation.id.toString().includes(searchValue)
  );

  const shouldShowAnnotationList =
    isExpanded && filteredAnnotationsWithAssets !== undefined;

  return (
    <div
      ref={divRef}
      style={{
        position: 'absolute',
        top: FLOATING_ELEMENT_MARGIN,
        right: FLOATING_ELEMENT_MARGIN,
        backgroundColor: 'white',
        border: '1px solid #d9d9d9',
        borderRadius: '8px',
        padding: '8px 8px 0px 8px',
        width: isExpanded ? '280px' : 'auto',
      }}
    >
      <StyledAnnotationCardHeader
        justifyContent="space-between"
        alignItems="center"
      >
        <StyledBody size="x-small">Annotations</StyledBody>
        <Flex alignItems="center">
          <StyledCount>
            <StyledDiv>{annotationsWithAssets?.length ?? 0}</StyledDiv>
          </StyledCount>
          <Button
            type="ghost"
            size="small"
            icon={isExpanded ? 'ChevronDown' : 'ChevronRight'}
            aria-label="Expand/collapse side panel"
            onClick={() => {
              setIsExpanded(!isExpanded);
            }}
          />
        </Flex>
      </StyledAnnotationCardHeader>

      {shouldShowAnnotationList && (
        <AnnotationListContainer>
          <InputExp
            fullWidth
            placeholder="Search annotations"
            value={searchValue}
            onChange={(event) => setSearchValue(event.target.value)}
          />

          {filteredAnnotationsWithAssets.map(({ annotation, asset }) => (
            <StyledAnnotationListItem
              key={annotation.id}
              justifyContent="space-between"
              alignItems="center"
              onClick={() => onZoomToAnnotation(annotation.id)}
              onMouseEnter={() => {
                setHoveredAnnotationId(annotation.id);
              }}
              onMouseLeave={() => {
                setHoveredAnnotationId(null);
              }}
            >
              <span>{asset?.name ?? `Annotation ID: ${annotation.id}`}</span>
              <Button
                type="ghost"
                size="small"
                icon="Delete"
                aria-label="Delete annotation"
                onClick={() => onDeleteAnnotation(annotation)}
              />
            </StyledAnnotationListItem>
          ))}
        </AnnotationListContainer>
      )}
    </div>
  );
};

const StyledAnnotationCardHeader = styled(Flex)`
  padding-bottom: 8px;
  gap: 6px;
`;

const StyledAnnotationListItem = styled(Flex)`
  padding: 4px 0 4px 0;

  cursor: pointer;
  :hover {
    background-color: ${Colors['decorative--grayscale--300']};
  }
`;

const StyledBody = styled(Body)`
  font-weight: 500;
`;

const StyledDiv = styled.div`
  display: flex;
  justify-content: center;
`;

const StyledCount = styled.div`
  margin-right: 0.5rem;
  border-radius: 3px;
  height: 21px;
  min-width: 25px;
  padding: 0 0.3rem 0 0.3rem;
  background-color: ${Colors['border--interactive--disabled']};
`;

const AnnotationListContainer = styled.div`
  border-top: 1px solid #d9d9d9;
  padding-bottom: 8px;

  max-height: 300px;
  overflow-y: auto;
  overflow-x: hidden;

  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }
  ::-webkit-scrollbar-track {
    -webkit-box-shadow: inset 0 0 1px var(--cogs-surface--interactive--pressed);
    border-radius: 8px;
    background-color: var(--cogs-surface--misc-code--medium);
  }
  ::-webkit-scrollbar-thumb {
    border-radius: 8px;
    background-color: var(--cogs-surface--status-undefined--muted--pressed);
  }
  ::-webkit-scrollbar-thumb:hover {
    border-radius: 8px;
    background-color: var(--cogs-surface--misc-backdrop);
  }
`;
