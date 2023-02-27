import { Icon, Title, Tooltip } from '@cognite/cogs.js';
import { useTranslation } from 'common';
import {
  QuickMatchSteps,
  useQuickMatchContext,
} from 'context/QuickMatchContext';

export default function QuickMatchTitle() {
  const { t } = useTranslation();
  const { step } = useQuickMatchContext();

  const titles: Record<QuickMatchSteps, string> = {
    sourceSelect: t('title-select-entities'),
    targetSelect: t('title-select-assets'),
    modelParams: t('title-configure-model'),
    viewModel: t('title-view-model-result'),
  };

  return (
    <Title level={4}>
      {titles[step]}
      <Tooltip content={t('select-data-tooltip')} placement="bottom">
        <Icon type="Info" />
      </Tooltip>
    </Title>
  );
}
