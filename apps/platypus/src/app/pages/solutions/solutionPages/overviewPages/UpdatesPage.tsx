import { PageToolbar } from '../../../../components/PageToolbar/PageToolbar';
import { PageContentLayout } from '../../../../components/Layouts/PageContentLayout';

export const UpdatesPage = () => {
  const renderHeader = () => {
    return <PageToolbar title="Updates" />;
  };
  return (
    <PageContentLayout>
      <PageContentLayout.Header>{renderHeader()}</PageContentLayout.Header>
      <PageContentLayout.Body>UPDATES (WIP...)</PageContentLayout.Body>
    </PageContentLayout>
  );
};
