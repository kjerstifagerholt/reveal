import { useCallback } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

export const useNavigation = () => {
  const navigate = useNavigate();
  const { search, pathname } = useLocation(); // <-- current location being accessed
  const params = useParams();

  // For migration: if we're located at the route, keep the route
  // TODO: Better way to use navigate function to do this?
  const basename = pathname.startsWith('/explore') ? '/explore' : '';

  const toSearchPage = useCallback(
    (query?: string) => {
      navigate({
        pathname: `${basename}/search`,
        search: `?searchQuery=${query}`,
      });
    },
    [basename, navigate]
  );

  const toListPage = useCallback(
    (dataType: string) => {
      navigate({
        pathname: `${basename}/list/${dataType}`,
        // search: `?searchQuery=${query}`,
      });
    },
    [basename, navigate]
  );

  const toHomePage = useCallback(
    (space: string, dataModel: string, version: string) => {
      navigate({
        pathname: `${basename}/${dataModel}/${space}/${version}`,
      });
    },
    [basename, navigate]
  );

  const toInstancePage = useCallback(
    (
      dataType: string,
      instanceSpace: string | undefined,
      externalId: string
    ) => {
      const { space, dataModel, version } = params;
      navigate({
        pathname: `${basename}/${dataModel}/${space}/${version}/${dataType}/${instanceSpace}/${externalId}`,
        search,
      });
    },
    [basename, navigate, params, search]
  );

  const toTimeseriesPage = useCallback(
    (externalId: string | number) => {
      const { space, dataModel, version } = params;
      navigate({
        pathname: `${basename}/${dataModel}/${space}/${version}/timeseries/${externalId}`,
        search,
      });
    },
    [basename, navigate, params, search]
  );

  const toLandingPage = useCallback(() => {
    navigate('/');
  }, [navigate]);

  const goBack = useCallback(() => {
    navigate('..');
  }, [navigate]);

  return {
    toLandingPage,
    toSearchPage,
    toListPage,
    toHomePage,

    toInstancePage,
    toTimeseriesPage,
    goBack,
  };
};
