import React from 'react';
import { Route } from 'react-router-dom';
import { EXTRACTION_PIPELINES_PATH } from 'utils/baseURL';

const LazyIntegrations = React.lazy(
  () =>
    import(
      '../pages/Integrations/Integrations'
      /* webpackChunkName: "pnid_integrations" */
    )
);
const LazyIntegration = React.lazy(
  () =>
    import(
      '../pages/Integration/IntegrationPage'
      /* webpackChunkName: "pnid_integration" */
    )
);

const LazyCreateIntegrationCreateRoot = React.lazy(
  () =>
    import(
      '../pages/create/Create'
      /* webpackChunkName: "pnid_integration_create_create_routes" */
    )
);
interface IntegrationsRoute {
  name: string;
  path: string;
  exact?: boolean;
  component: React.LazyExoticComponent<React.FunctionComponent>;
}
export type RouterParams = { id: string };
export const EXT_PIPE_PATH = `extpipe`;
export const HEALTH_PATH: Readonly<string> = 'health';

export const CREATE_EXT_PIPE_PAGE_PATH = `/${EXTRACTION_PIPELINES_PATH}/create`;
export const EXT_PIPES_OVERVIEW_PAGE_PATH = `/${EXTRACTION_PIPELINES_PATH}`;

export const routingConfig: IntegrationsRoute[] = [
  {
    name: 'Integrations',
    path: `/:tenant${EXT_PIPES_OVERVIEW_PAGE_PATH}`,
    exact: true,
    component: LazyIntegrations,
  },
  {
    name: 'Create integration - create',
    path: `/:tenant${CREATE_EXT_PIPE_PAGE_PATH}`,
    component: LazyCreateIntegrationCreateRoot,
  },
  {
    name: 'Integration',
    path: `/:tenant/${EXTRACTION_PIPELINES_PATH}/${EXT_PIPE_PATH}/:id`,
    exact: false,
    component: LazyIntegration,
  },
];

export const Routes = () => {
  return (
    <>
      {routingConfig.map(({ path, name, component, exact }) => {
        return (
          <Route exact={exact} key={name} path={path} component={component} />
        );
      })}
    </>
  );
};
