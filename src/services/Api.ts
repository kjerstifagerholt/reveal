import { SIDECAR } from 'utils/sidecar';
import {
  GenericResponseObject,
  RESTPackageFilter,
  RESTProject,
  Source,
} from '../typings/interfaces';

export type QueryParameters = {
  [property: string]: number | string | boolean | object | undefined;
};

export function buildQueryString(parameters: QueryParameters): string {
  const params = new URLSearchParams();
  Object.entries(parameters).forEach(([key, value]) => {
    if (value) params.set(key, value.toString());
  });
  return params.toString() || '';
}

class Api {
  private readonly headers: {
    'Access-Control-Allow-Origin': string;
    'Content-Type': string;
    Authorization: string;
  };

  private readonly baseURL: string;

  constructor(token: string) {
    this.headers = {
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    };
    this.baseURL = SIDECAR.cognuitApiBaseUrl;
  }

  private async get(url: string, parameters?: QueryParameters): Promise<any> {
    const urlWithStringQuery: string = `${url}?${buildQueryString(
      parameters || {}
    )}`;
    const response = await fetch(urlWithStringQuery, {
      method: 'GET',
      headers: this.headers,
    });
    if (!response.ok) {
      return [
        {
          error: true,
          status: response.status,
          statusText: response.statusText,
        },
      ];
    }
    return response.json();
  }

  private async post(url: string, data: any): Promise<any> {
    const response = await fetch(url, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      return [
        {
          error: true,
          status: response.status,
          statusText: response.statusText,
        },
      ];
    }
    return response.json();
  }

  public datatypes = {
    get: async (projectId: number | null = null): Promise<string[]> => {
      let queryParameters;
      if (projectId) queryParameters = { project_id: projectId };
      return this.get(`${this.baseURL}/datatypes`, queryParameters);
    },
  };

  public objects = {
    get: async (): Promise<GenericResponseObject[]> => {
      return this.get(`${this.baseURL}/objects`);
    },
    getSingleObject: async (
      objectId: number
    ): Promise<GenericResponseObject[]> => {
      return this.post(`${this.baseURL}/objects/byids`, [objectId]);
    },
    getDatatransfersForRevision: async (
      objectId: number,
      revision: string
    ): Promise<GenericResponseObject> => {
      return this.get(
        `${this.baseURL}/objects/${objectId}/revisions/${revision}/datatransfers`
      );
    },
  };

  public packages = {
    get: async (filter: RESTPackageFilter): Promise<any> => {
      return this.get(`${this.baseURL}/packages`, filter);
    },
  };

  public projects = {
    get: async (source: Source): Promise<GenericResponseObject[]> => {
      return this.get(`${this.baseURL}/sources/${source}/projects`);
    },
  };

  public sources = {
    get: async (): Promise<string[]> => {
      return this.get(`${this.baseURL}/sources`);
    },
    getHeartbeats: async (source: string, after: number): Promise<number[]> => {
      const queryParameters = { after };
      return this.get(
        `${this.baseURL}/sources/${source}/heartbeats`,
        queryParameters
      );
    },
    getProjects: async (source: string): Promise<RESTProject[]> => {
      return this.get(`${this.baseURL}/sources/${source}/projects`);
    },
    getRepositoryTree: async (
      source: string,
      projectExternalId: string
    ): Promise<any> => {
      return this.get(
        `${this.baseURL}/sources/${source}/projects/${projectExternalId}/tree`
      );
    },
  };

  public configurations = {
    get: async (): Promise<GenericResponseObject[]> => {
      return this.get(`${this.baseURL}/configurations`);
    },
    create: async (data: any): Promise<GenericResponseObject> => {
      return this.post(`${this.baseURL}/configurations`, data);
    },
  };

  public revisions = {
    get: async (objectId: string): Promise<GenericResponseObject[]> => {
      return this.get(`${this.baseURL}/objects/${objectId}/revisions`);
    },
    getSingleRevision: async (
      objectId: string,
      revisionId: string
    ): Promise<GenericResponseObject[]> => {
      return this.get(`
      ${this.baseURL}/objects/${objectId}/revisions/${revisionId}`);
    },
    getRevisionTranslations: async (
      objectId: string,
      revisionId: string
    ): Promise<GenericResponseObject[]> => {
      return this.get(`
      ${this.baseURL}/objects/${objectId}/revisions/${revisionId}/translations`);
    },
  };
}

export default Api;
