import {
  Body,
  Col,
  Row,
  Icon,
  Label,
  OptionType,
  Select,
  Title,
  Button,
} from '@cognite/cogs.js';
import { PopupUIElementContainer } from 'src/modules/Review/Components/ReactImageAnnotateWrapper/TitleContainer';
import React from 'react';
import { ColorBadge } from 'src/modules/Review/Components/ColorBadge/ColorBadge';
import styled from 'styled-components';

export type BodyContainerMode = 'point' | 'shape';

export const BodyContainer = ({
  isKeypointMode,
  color,
  isSavedAnnotation,
  labelOption,
  keypointLabel,
  labelOptions,
  onSelectLabel,
  onOpenAnnotationSettings,
}: {
  isKeypointMode: boolean;
  color: string;
  isSavedAnnotation: boolean;
  labelOption: OptionType<string>;
  keypointLabel: string;
  labelOptions?: OptionType<string>[];
  onSelectLabel: (label: Required<OptionType<string>>) => void;
  onOpenAnnotationSettings: () => void;
}) => {
  const renderEmptyAnnotationMessage = () => {
    return (
      <Row
        cols={10}
        style={{
          background: '#6E85FC0F',
          borderRadius: '8px',
          alignItems: 'flex-start',
          padding: '5px',
        }}
      >
        <StyledCol span={1}>
          <Icon type="InfoFilled" style={{ color: '#4A67FB' }} />
        </StyledCol>

        <StyledCol span={9}>
          <Title level={5}>No existing annotations</Title>
          <Body level={2} style={{ paddingBottom: '15px', paddingTop: '8px' }}>
            Create a pre-defined list of annotations in Annotation Settings
          </Body>
          <Button type="tertiary" onClick={onOpenAnnotationSettings}>
            Create annotations
          </Button>
        </StyledCol>
      </Row>
    );
  };

  if (isKeypointMode) {
    if (isSavedAnnotation) {
      return (
        <>
          <Col span={2}>
            <PopupUIElementContainer title="Collection">
              <StyledLabel>{labelOption.label}</StyledLabel>
            </PopupUIElementContainer>
          </Col>
          <Col span={3}>
            <PopupUIElementContainer title="Label">
              <StyledLabel>{keypointLabel}</StyledLabel>
            </PopupUIElementContainer>
          </Col>
        </>
      );
    }
    if (labelOptions && labelOptions.length) {
      return (
        <>
          <Col span={3}>
            <PopupUIElementContainer title="Collection">
              <Select
                closeMenuOnSelect
                value={labelOption}
                onChange={onSelectLabel}
                options={labelOptions}
              />
            </PopupUIElementContainer>
          </Col>
        </>
      );
    }
    return <Col span={5}>{renderEmptyAnnotationMessage()}</Col>;
  }
  if (labelOptions && labelOptions.length) {
    return (
      <>
        <Col span={1}>
          <PopupUIElementContainer title="Color">
            <ColorBadge color={color} />
          </PopupUIElementContainer>
        </Col>
        <Col span={4}>
          <PopupUIElementContainer title="Label">
            <Select
              closeMenuOnSelect
              value={labelOption}
              onChange={onSelectLabel}
              options={labelOptions}
            />
          </PopupUIElementContainer>
        </Col>
      </>
    );
  }
  return <Col span={5}>{renderEmptyAnnotationMessage()}</Col>;
};

const StyledLabel = styled(Label)`
  width: 100%;
`;

const StyledCol = styled(Col)`
  padding: 5px;
  padding-left: '14px';
`;
