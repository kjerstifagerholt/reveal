import { getDefaultSidecar } from './getDefaultSidecar';

describe('getDefaultSidecar', () => {
  it('works for ew1', () => {
    expect(getDefaultSidecar({ prod: true, cluster: 'ew1' })).toEqual({
      appsApiBaseUrl: 'https://apps-api.cognite.ai',
      cdfApiBaseUrl: 'https://api.cognitedata.com',
      cdfCluster: '',
      commentServiceBaseUrl: 'https://comment-service.cognite.ai',
      userManagementServiceBaseUrl:
        'https://user-management-service.cognite.ai',
    });
  });

  it('works for ew1 + staging', () => {
    expect(getDefaultSidecar({ prod: false, cluster: 'ew1' })).toEqual({
      appsApiBaseUrl: 'https://apps-api.staging.cognite.ai',
      cdfApiBaseUrl: 'https://api.cognitedata.com',
      cdfCluster: '',
      commentServiceBaseUrl: 'https://comment-service.staging.cognite.ai',
      userManagementServiceBaseUrl:
        'https://user-management-service.staging.cognite.ai',
    });
  });

  it('works for bluefield', () => {
    expect(getDefaultSidecar({ prod: true, cluster: 'bluefield' })).toEqual({
      appsApiBaseUrl: 'https://apps-api.bluefield.cognite.ai',
      cdfApiBaseUrl: 'https://bluefield.cognitedata.com',
      cdfCluster: 'bluefield',
      commentServiceBaseUrl: 'https://comment-service.bluefield.cognite.ai',
      userManagementServiceBaseUrl:
        'https://user-management-service.bluefield.cognite.ai',
    });
  });

  it('works for bluefield staging', () => {
    expect(getDefaultSidecar({ prod: false, cluster: 'bluefield' })).toEqual({
      appsApiBaseUrl: 'https://apps-api.staging.bluefield.cognite.ai',
      cdfApiBaseUrl: 'https://bluefield.cognitedata.com',
      cdfCluster: 'bluefield',
      commentServiceBaseUrl:
        'https://comment-service.staging.bluefield.cognite.ai',
      userManagementServiceBaseUrl:
        'https://user-management-service.staging.bluefield.cognite.ai',
    });
  });

  it('works for bluefield with localComments', () => {
    expect(
      getDefaultSidecar({
        prod: false,
        cluster: 'bluefield',
        localComments: true,
      })
    ).toEqual({
      appsApiBaseUrl: 'https://apps-api.staging.bluefield.cognite.ai',
      cdfApiBaseUrl: 'https://bluefield.cognitedata.com',
      cdfCluster: 'bluefield',
      commentServiceBaseUrl: 'http://localhost:8300',
      userManagementServiceBaseUrl:
        'https://user-management-service.staging.bluefield.cognite.ai',
    });
  });
});
