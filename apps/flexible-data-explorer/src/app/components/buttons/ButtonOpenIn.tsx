import { Button } from '@cognite/cogs.js';

import { useTranslation } from '../../hooks/useTranslation';

export const ButtonOpenIn = ({ loading }: { loading?: boolean }) => {
  const { t } = useTranslation();

  return (
    <Button
      icon="ChevronDown"
      iconPlacement="right"
      type="tertiary"
      disabled={loading}
    >
      {t('GENERAL_OPEN_IN')}...
    </Button>
  );
};
