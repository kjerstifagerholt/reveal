/* eslint-disable no-underscore-dangle */
import { SidecarConfig, getDefaultSidecar, CDFCluster } from '@cognite/sidecar';

// # -------------------------------------
// #
// #
// #
// # ONLY CHANGE THESE THINGS: (affects localhost only)
// #
// #
const PROD = false;
// examples: bluefield, greenfield, ew1, bp-northeurope, azure-dev, bp
// NOTE: leave on 'azure-dev' for testing in the PR's since that is the only place we have the FAKEIdp currently for this project:
// const CLUSTER: CDFCluster = 'azure-dev';
const CLUSTER: CDFCluster = 'greenfield'; // Have to set it to greenfield or login will redirect back to select project and not proceed
const LOCAL_COMMENTS_API = false;
// #
// #
// #
// # -------------------------------------

const getAadApplicationId = (cluster: string) => {
  const ids: Record<string, string> = {
    // these are all staging ids:
    greenfield: '6a0cb56e-fbfc-444c-8639-80bf80c9c083', // <- infield-oidc-test
    bluefield: '245a8a64-4142-4226-86fa-63d590de14c9', // <- react-demo
    'azure-dev': '5a262178-942b-4c8f-ac15-f96642b73b56', // <- react-demo
    ew1: 'd584f014-5fa9-4b0b-953d-cc4837d093f3', // <- react-demo
  };

  const aadApplicationId = ids[cluster] || '';

  return {
    aadApplicationId,
  };
};

// We are overwriting the window.__cogniteSidecar object because the tenant-selector
// reads from this variable, so when you test on localhost, it (TSA) will not access via this file
// but via the window.__cogniteSidecar global
// now that this var is updated, all should work as expected.
(window as any).__cogniteSidecar = {
  ...getDefaultSidecar({
    prod: PROD,
    cluster: CLUSTER,
    localServices: LOCAL_COMMENTS_API ? ['comment-service'] : [],
  }),
  ...getAadApplicationId(CLUSTER),
  __sidecarFormatVersion: 1,
  // to be used only locally as a sidecar placeholder
  // when deployed with FAS the values below are partly overriden
  applicationId: 'infield2',
  applicationName: 'InField 2.0',
  docsSiteBaseUrl: 'https://docs.cognite.com',
  nomaApiBaseUrl: 'https://noma.development.cognite.ai',
  locize: {
    keySeparator: false,
    projectId: '1ee63b21-27c7-44ad-891f-4bd9af378b72', // <- move this to release-configs
    version: 'Production', // <- move this to release-configs
  },
  availableClusters: [
    {
      label: 'Multi customer environments',
      options: [{ value: '', label: 'Europe 1 (Google)', legacyAuth: true }],
    },
    {
      label: 'Single customer environments',
      options: [
        { value: 'bp-northeurope', label: 'BP North Europe' },
        { value: 'omv', label: 'OMV', legacyAuth: true },
        { value: 'pgs', label: 'PGS', legacyAuth: true },
        { value: 'power-no', label: 'Power NO (Google)', legacyAuth: true },
      ],
    },
    {
      label: 'Staging environments',
      options: [
        { value: 'greenfield', label: 'greenfield', legacyAuth: true },
        { value: 'bluefield', label: 'bluefield' },
        { value: 'azure-dev', label: 'azure-dev' },
      ],
    },
  ],
  disableIntercom: true,
  enableUserManagement: true,
  ...((window as any).__cogniteSidecar || {}),
} as SidecarConfig;

export default (window as any).__cogniteSidecar;
