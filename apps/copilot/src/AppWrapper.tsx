import { loginAndAuthIfNeeded } from '@cognite/cdf-sdk-singleton';
import { AuthWrapper, getEnv, getProject } from '@cognite/cdf-utilities';
import cogsStyles from '@cognite/cogs.js/dist/cogs.css';

import './set-public-path';
import { useEffect } from 'react';
import { I18nWrapper } from '@cognite/cdf-i18n-utils';
import App from './app/App';
import GlobalStyles from './GlobalStyles';

import { translations } from './app/common';

export const AppWrapper = () => {
  const projectName = 'copilot';
  const project = getProject();
  const env = getEnv();

  useEffect(() => {
    cogsStyles.use();
    return () => {
      cogsStyles.unuse();
    };
  }, []);

  return (
    <GlobalStyles>
      <I18nWrapper translations={translations} defaultNamespace={projectName}>
        <AuthWrapper login={() => loginAndAuthIfNeeded(project, env)}>
          <App />
        </AuthWrapper>
      </I18nWrapper>
    </GlobalStyles>
  );
};
