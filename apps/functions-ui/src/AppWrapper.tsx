import { useEffect } from 'react';

import { QueryClientProvider } from '@tanstack/react-query';

import { I18nWrapper } from '@cognite/cdf-i18n-utils';
import sdk, { loginAndAuthIfNeeded } from '@cognite/cdf-sdk-singleton';
import { AuthContainer } from '@cognite/cdf-utilities';
import cogsStyles from '@cognite/cogs.js/dist/cogs.css';

import './set-public-path';

import App from './app/App';
import { translations } from './app/common';
import { queryClient } from './app/queryClient';
import GlobalStyles from './GlobalStyles';

export const AppWrapper = () => {
  const projectName = 'functions-ui';

  useEffect(() => {
    cogsStyles.use();
    return () => {
      cogsStyles.unuse();
    };
  }, []);

  return (
    <GlobalStyles>
      <I18nWrapper translations={translations} defaultNamespace={projectName}>
        <QueryClientProvider client={queryClient}>
          <AuthContainer
            title="Cognite Functions"
            sdk={sdk}
            login={loginAndAuthIfNeeded}
          >
            <App />
          </AuthContainer>
        </QueryClientProvider>
      </I18nWrapper>
    </GlobalStyles>
  );
};
