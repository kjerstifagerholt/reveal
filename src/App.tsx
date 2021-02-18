import React from 'react';
import { Switch, Route } from 'react-router-dom';
import { Container } from '@cognite/react-container';

import GlobalStyles from 'global-styles';

import Home from 'pages/Home';
import Configurations from './pages/Configurations';
import DataTransfers from './pages/DataTransfers';
import Status from './pages/Status';
import { Content, Layout, Main } from './elements';
import MainHeader from './components/Organisms/MainHeader';
import New from './pages/Configurations/New';
import { ApiProvider } from './contexts/ApiContext';
import { APIErrorProvider } from './contexts/APIErrorContext';

const App = () => (
  <>
    <GlobalStyles />
    <Container disableTranslations>
      <ApiProvider>
        <APIErrorProvider>
          <Layout>
            <Main>
              <MainHeader />
              <Content>
                <Switch>
                  <Route exact path="/">
                    <Home />
                  </Route>
                  <Route exact path="/configurations">
                    <Configurations />
                  </Route>
                  <Route exact path="/configurations/new/:type">
                    <New />
                  </Route>
                  <Route exact path="/data-transfers">
                    <DataTransfers />
                  </Route>
                  <Route exact path="/status">
                    <Status />
                  </Route>
                </Switch>
              </Content>
            </Main>
          </Layout>
        </APIErrorProvider>
      </ApiProvider>
    </Container>
  </>
);

export default App;
