import { AnnotationStatus } from 'src/utils/AnnotationUtilsV1/AnnotationUtilsV1';
import { Detail, Icon, SegmentedControl, Tooltip } from '@cognite/cogs.js';
import { AnnotationActionMenuExtended } from 'src/modules/Common/Components/AnnotationActionMenu/AnnotationActionMenuExtended';
import React from 'react';
import styled from 'styled-components';
import { AnnotationTableRowProps } from 'src/modules/Review/types';
import { pushMetric } from 'src/utils/pushMetric';
import { createLink } from '@cognite/cdf-utilities';
import { Link } from 'react-router-dom';
import { getAnnotationLabelOrText } from 'src/modules/Common/Utils/AnnotationUtils/AnnotationUtils';
import { Status } from 'src/api/annotation/types';
import { isImageAssetLinkData } from 'src/modules/Common/types/typeGuards';
import { AnnotationTableRowAttribute } from './AnnotationTableRowAttribute';

/**
 * @todo: Fix keypoint color [VIS-869]
 * @todo: Fix attributes [VIS-868]
 */
export const AnnotationTableRow = ({
  annotation,
  onSelect,
  onDelete,
  onVisibilityChange,
  onApprove,
  showColorCircle,
}: AnnotationTableRowProps) => {
  return (
    <StyledRow
      key={annotation.annotation.id}
      onClick={() => onSelect(annotation.annotation.id, !annotation.selected)}
    >
      {showColorCircle && (
        <ColorCircleContainer>
          {/* <ColorCircle color={annotation.color} /> */}
          <ColorCircle color="red" />
        </ColorCircleContainer>
      )}
      <AnnotationLabelContainer>
        <AnnotationLbl>
          <Tooltip
            className="lbl-tooltip"
            content={getAnnotationLabelOrText(annotation.annotation)}
          >
            <> {`${getAnnotationLabelOrText(annotation.annotation)}`}</>
          </Tooltip>
        </AnnotationLbl>
      </AnnotationLabelContainer>
      {isImageAssetLinkData(annotation.annotation) && (
        <Link
          to={createLink(`/explore/asset/${annotation.annotation.assetRef.id}`)}
          target="_blank"
          style={{ display: 'flex', alignItems: 'center' }}
        >
          <Icon
            type="ExternalLink"
            style={{
              color: 'red',
              // color: annotation.color,
            }}
          />
        </Link>
      )}
      <ShowHideIconContainer>
        {!annotation.show ? (
          <Icon
            type="EyeHide"
            style={{ color: '#595959' }}
            onClick={() => {
              onVisibilityChange(annotation.annotation.id);
            }}
          />
        ) : undefined}
      </ShowHideIconContainer>
      {
        // annotation.annotation.attributes !== undefined ||
        annotation.annotation?.confidence !== undefined && (
          <AttributesIconContainer>
            <Detail style={{ color: '#595959' }}>
              <Tooltip
                content={
                  <AnnotationTableRowAttribute reviewAnnotation={annotation} />
                }
              >
                <Icon type="Info" />
              </Tooltip>
            </Detail>
          </AttributesIconContainer>
        )
      }
      <ApproveBtnContainer onClick={(evt) => evt.stopPropagation()}>
        <StyledSegmentedControl
          status={annotation.annotation.status}
          className="approvalButton"
          currentKey={
            // eslint-disable-next-line no-nested-ternary
            annotation.annotation.status === Status.Approved
              ? 'verified'
              : annotation.annotation.status === Status.Rejected
              ? 'rejected'
              : undefined
          }
          onButtonClicked={(key) => {
            if (key === 'verified') {
              pushMetric('Vision.Review.Annotation.Verified');
              onApprove(annotation.annotation.id, AnnotationStatus.Verified);
            }
            if (key === 'rejected') {
              pushMetric('Vision.Review.Annotation.Rejected');
              onApprove(annotation.annotation.id, AnnotationStatus.Rejected);
            }
          }}
        >
          <SegmentedControl.Button
            type="primary"
            size="small"
            key="verified"
            aria-label="verify annotation"
            className="approveButton"
          >
            TRUE
          </SegmentedControl.Button>
          <SegmentedControl.Button
            type="primary"
            size="small"
            key="rejected"
            aria-label="reject annotation"
            className="rejectButton"
          >
            FALSE
          </SegmentedControl.Button>
        </StyledSegmentedControl>
      </ApproveBtnContainer>
      <ActionMenuContainer
        onClick={(evt) => evt.stopPropagation()}
        aria-hidden="true"
      >
        <AnnotationActionMenuExtended
          showPolygon={annotation.show}
          disableShowPolygon={annotation.annotation.status === Status.Rejected}
          handleVisibility={() => {
            onVisibilityChange(annotation.annotation.id);
          }}
          handleAnnotationDelete={() => {
            onDelete(annotation.annotation.id);
          }}
        />
      </ActionMenuContainer>
    </StyledRow>
  );
};

const StyledRow = styled.div`
  display: flex;
  width: 100%;
  gap: 12px;
  border-radius: 5px;
  overflow: hidden;
  justify-content: center;
  align-items: center;
`;
type Color = {
  color: string;
};
const ColorCircleContainer = styled.div`
  padding: 8px 6px;
  display: flex;
  align-items: center;
  justify-content: center;
`;
const ColorCircle = styled.span<Color>`
  height: 10px;
  width: 10px;
  background-color: ${(props) => props.color};
  border-radius: 50%;
`;

const ApproveBtnContainer = styled.div`
  flex: 0 1 70px;
`;

const AnnotationLabelContainer = styled.div`
  flex: 1 1 150px;
  overflow: hidden;

  & span {
    width: 100%;
    height: 100%;
  }
`;

type AnnotationLabelOpts = {
  color?: string;
};
const AnnotationLbl = styled.div<AnnotationLabelOpts>`
  width: 100%;
  height: 100%;
  font-weight: 400;
  font-size: 12px;
  line-height: 16px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  color: ${(props) => props.color || 'inherit'};
`;

const ShowHideIconContainer = styled.div`
  display: flex;
  align-items: center;
  flex: 0 1 36px;
  justify-content: center;
`;

const AttributesIconContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: start;
`;

const ActionMenuContainer = styled.div`
  flex: 0 1 30px;
`;

const StyledSegmentedControl = styled(SegmentedControl)<{ status: string }>`
  line-height: 16px;
  .cogs-btn.cogs-btn {
    width: 22px;
    height: 20px;
    padding: 8px 16px;
  }
  button {
    font-weight: 500;
    font-size: 8px;
    line-height: 14px;
    border-radius: 4px;
  }

  & > span.elevated {
    border-radius: initial;
    box-shadow: none;
  }
  .approveButton {
    background: ${(props) =>
      props.status === AnnotationStatus.Verified
        ? '#ffffff'
        : 'var(--cogs-color-action-secondary)'};
  }
  .approveButton:hover {
    color: ${(props) =>
      props.status !== AnnotationStatus.Verified ? '#059b85' : 'unset'};
    background: ${(props) =>
      props.status !== AnnotationStatus.Verified ? '#d9d9d9' : '#6FCF97'};
  }

  .rejectButton {
    background: ${(props) =>
      props.status === AnnotationStatus.Rejected
        ? '#ffffff'
        : 'var(--cogs-color-action-secondary)'};
  }
  .rejectButton:hover {
    color: ${(props) =>
      props.status !== AnnotationStatus.Rejected ? '#eb5757' : 'unset'};
    background: ${(props) =>
      props.status !== AnnotationStatus.Rejected ? '#d9d9d9' : '#FFCFCF'};
  }
`;
