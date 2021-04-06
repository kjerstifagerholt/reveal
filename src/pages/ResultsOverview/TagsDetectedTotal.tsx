import React from 'react';
import { FileInfo } from '@cognite/sdk';
import { Badge, Body } from '@cognite/cogs.js';
import { Spin, Popover } from 'antd';
import {
  getPnIdAnnotationCategories,
  selectAnnotationColor,
} from 'utils/AnnotationUtils';
import { Flex } from 'components/Common';
import { useAnnotations } from '@cognite/data-exploration';
import { convertEventsToAnnotations } from '@cognite/annotations';
import { stubAnnotation } from './utils';

type Props = { file: FileInfo };

export default function TagsDetectedTotal({ file }: Props): JSX.Element {
  const { data: annotations, isFetched } = useAnnotations(file.id);

  if (!isFetched) {
    return <Spin size="small" />;
  }

  const annotationDetails = getPnIdAnnotationCategories(
    convertEventsToAnnotations(annotations)
  );

  const {
    Asset: { count: assetCount },
    File: { count: fileCount },
    Unclassified: { count: unclassifiedCount },
  } = annotationDetails;

  const totalTagsPopover = Object.keys(annotationDetails).map((key) => {
    const { count, items } = annotationDetails[key];
    return (
      <Flex key={key} column style={{ marginBottom: '12px' }}>
        <Flex style={{ marginBottom: '4px', fontWeight: 'bold' }}>
          {count} {key} Linked Tags
        </Flex>
        {Object.keys(items).map((subKey) => (
          <Flex
            align
            key={subKey}
            style={{ justifyContent: 'space-between', marginBottom: '4px' }}
          >
            <Body level={2}>{subKey}</Body>
            <Body level={2}>
              <Badge
                background={selectAnnotationColor(items[subKey][0])}
                size={14}
                text={`${items[subKey].length}`}
              />
            </Body>
          </Flex>
        ))}
      </Flex>
    );
  });

  return (
    <Popover
      title="Total Detected Linked Tags"
      placement="bottomLeft"
      content={totalTagsPopover}
    >
      <Flex row>
        <Body level={2} style={{ marginRight: '8px' }}>
          <Badge
            background={selectAnnotationColor({
              resourceType: 'file',
              ...stubAnnotation,
            })}
            size={14}
            text={`${fileCount}`}
          />{' '}
          File tags
        </Body>
        <Body level={2} style={{ marginRight: '8px' }}>
          <Badge
            background={selectAnnotationColor({
              resourceType: 'asset',
              ...stubAnnotation,
            })}
            size={14}
            text={`${assetCount}`}
          />{' '}
          Asset tags
        </Body>
        <Body level={2}>
          <Badge
            background={selectAnnotationColor({
              ...stubAnnotation,
            })}
            size={14}
            text={`${unclassifiedCount}`}
          />{' '}
          Unclassified tags
        </Body>
      </Flex>
    </Popover>
  );
}
