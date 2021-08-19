import GlobalStyles from 'global-styles';
import { Switch, Redirect, Route } from 'react-router-dom';
import { Container, Logout } from '@cognite/react-container';
import sidecar from 'utils/sidecar';
import Info from 'pages/Info';
import Home from 'pages/Home';
import CogniteSDK from 'pages/CogniteSDK';
import Intercom from 'pages/Intercom';
import Comments from 'pages/Comments';
import { MenuBar, PAGES } from 'pages/Menubar';
import NotFoundPage from 'pages/Error404';

const App = () => (
  <Container sidecar={sidecar}>
    <>
      <GlobalStyles />
      <MenuBar />

      <Switch>
        <Route path={PAGES.HOME} render={() => <Home />} />
        <Route path={PAGES.INFO} render={() => <Info />} />
        <Route path={PAGES.SDK} render={() => <CogniteSDK />} />
        <Route path={PAGES.INTERCOM} render={() => <Intercom />} />
        <Route path={PAGES.LOGOUT} render={() => <Logout />} />
        <Route path={PAGES.COMMENTS} render={() => <Comments />} />
        <Redirect from="" to={PAGES.HOME} />
        <Redirect from="/" to={PAGES.HOME} />
        <Route render={() => <NotFoundPage />} />
      </Switch>
    </>
  </Container>
);

export default App;
