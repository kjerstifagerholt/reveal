import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

import { getProject } from '@cognite/cdf-utilities';
import { FlagProvider } from '@cognite/react-feature-flags';

import { AuthContainer } from './AuthContainer';
import { MainRouter } from './pages/router';
import GlobalStyles from './styles';
import { setupMixpanel } from './utils/config';

setupMixpanel();

const queryClient = new QueryClient();

const App = () => {
  const appName = 'cdf-document-search';
  const projectName = getProject();

  const flagProviderApiToken = 'v2Qyg7YqvhyAMCRMbDmy1qA6SuG8YCBE';

  if (!projectName) {
    throw new Error('CDF Project is missing');
  }

  return (
    <FlagProvider
      apiToken={flagProviderApiToken}
      appName={appName}
      projectName={projectName}
    >
      {/* If styles are broken please check: .rescripts#PrefixWrap( */}
      <QueryClientProvider client={queryClient}>
        <GlobalStyles>
          <AuthContainer>
            <MainRouter />
          </AuthContainer>
        </GlobalStyles>
        <ReactQueryDevtools />
      </QueryClientProvider>
    </FlagProvider>
  );
};

export default App;
