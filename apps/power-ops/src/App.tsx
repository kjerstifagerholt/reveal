import GlobalStyles from 'global-styles';
import { Route, Switch, Redirect } from 'react-router-dom';
import { Container, Logout } from '@cognite/react-container';
// UTILS
import sidecar from 'utils/sidecar';
// PROVIDERS
import { EventStreamProvider } from 'providers/eventStreamProvider';
// PAGES
import { PriceArea } from 'pages/PriceArea';
import { MenuBar } from 'components/Menubar/Menubar';
import { NotFoundPage } from 'pages/NotFound/NotFound';
import { Workflows, WorkflowSingle } from 'pages/Workflows';
import { Monitoring } from 'pages/Monitoring';
import { DayAheadMarket } from 'pages/DayAheadMarket';
import { WorkflowSchemasContainer } from 'pages/WorkflowSchemas';
import { PAGES } from 'types';

const App = () => (
  <Container sidecar={sidecar}>
    <>
      <GlobalStyles />
      <EventStreamProvider>
        <MenuBar />
        <Switch>
          <Route path={PAGES.LOGOUT} component={Logout} />
          <Route path={PAGES.MONITORING} component={Monitoring} />
          <Route path={PAGES.WORKFLOWS_SINGLE} component={WorkflowSingle} />
          <Route path={PAGES.WORKFLOWS} component={Workflows} />
          <Route path={PAGES.PRICE_AREA} component={PriceArea} />
          <Route path={PAGES.PORTFOLIO} component={DayAheadMarket} />
          <Route path={PAGES.DAY_AHEAD_MARKET} component={DayAheadMarket} />
          <Route
            path={PAGES.WORKFLOW_SCHEMAS}
            component={WorkflowSchemasContainer}
          />
          <Redirect from="" to={PAGES.DAY_AHEAD_MARKET} />
          <Redirect from="/" to={PAGES.DAY_AHEAD_MARKET} />
          <Route component={NotFoundPage} />
        </Switch>
      </EventStreamProvider>
    </>
  </Container>
);

export default App;
