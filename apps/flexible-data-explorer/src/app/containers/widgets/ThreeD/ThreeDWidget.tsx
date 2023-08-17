import { useParams } from 'react-router-dom';

import { isEmpty } from 'lodash';

import { RevealContainer } from '@cognite/reveal-react-components';
import { useSDK } from '@cognite/sdk-provider';

import { Button } from '../../../components/buttons/Button';
import { BaseWidgetProps, Widget } from '../../../components/widget/Widget';
import {
  defaultRevealColor,
  defaultViewerOptions,
} from '../../../constants/threeD';
import { useViewModeParams } from '../../../hooks/useParams';
import { useProjectConfig } from '../../../hooks/useProjectConfig';
import { useInstanceThreeDEntryQuery } from '../../../services/instances/generic/hooks/useInstanceThreeD';
import { RevealContent } from '../../ThreeD/containers/RevealContent';

export type ThreeDWidgetProps = BaseWidgetProps;

export const ThreeDWidget: React.FC<ThreeDWidgetProps> = () => {
  const sdk = useSDK();
  const [, setViewMode] = useViewModeParams();
  const { externalId, instanceSpace } = useParams();

  const { data, status, isFetched } = useInstanceThreeDEntryQuery();

  const projectConfigs = useProjectConfig();

  const modelIdentifiers = projectConfigs?.threeDResources;

  if (!modelIdentifiers || (isFetched && isEmpty(data.items))) {
    return null;
  }

  return (
    <Widget rows={6} columns={4}>
      <Widget.Header title="3D">
        <Button.InternalRedirect
          onClick={() => {
            setViewMode('3d');
          }}
        />
      </Widget.Header>

      <Widget.Body state={status}>
        <RevealContainer
          sdk={sdk}
          color={defaultRevealColor}
          viewerOptions={defaultViewerOptions}
        >
          <RevealContent
            modelIdentifiers={modelIdentifiers}
            fitCamera="instance"
            externalId={externalId}
            instanceSpace={instanceSpace}
            hideToolbar
          />
        </RevealContainer>
      </Widget.Body>
    </Widget>
  );
};
