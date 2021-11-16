import React, { FC } from 'react';

import { useClassifierActions } from 'machines/classifier/hooks/useClassifierActions';
import { classifierConfig } from 'configs';
import { Page } from 'components/page/Page';
import { ClassifierState } from 'machines/classifier/types';
import { Loader } from '@cognite/cogs.js';
import useValidatePipelineName from 'hooks/useValidatePipelineName';
import { BottomNavigation } from './components/navigations/BottomNavigation';
import { Step } from './components/step';
import { ClassifierRouter } from './pages';

const ClassifierPage: FC = () => {
  const [isLoading] = useValidatePipelineName();

  const { steps } = classifierConfig();
  const { nextPage, previousPage } = useClassifierActions();

  const renderStepsWidget = () => {
    return Object.keys(steps).map((step, index) => (
      <Step
        key={step}
        step={step as Exclude<ClassifierState, 'complete'>}
        index={index}
      />
    ));
  };

  if (isLoading) {
    return <Loader darkMode />;
  }

  return (
    <Page
      Widget={renderStepsWidget()}
      BottomNavigation={
        <BottomNavigation onBackClick={previousPage} onNextClick={nextPage} />
      }
    >
      <ClassifierRouter />
    </Page>
  );
};

export default ClassifierPage;
