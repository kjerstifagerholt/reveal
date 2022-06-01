import { useWellInspectSelectedWellboreNames } from 'domain/wells/well/internal/transformers/useWellInspectSelectedWellboreNames';

import React, { useMemo } from 'react';

import { BackButton, BaseButton } from 'components/Buttons';
import { useSelectedSecondaryWellboreNamesWithoutNptData } from 'modules/wellSearch/selectors';

import { SelectedWellboreNavigatable } from '../types';

import {
  DetailsContainer,
  NavigationPanelContainer,
  WellboreName,
  WellName,
} from './elements';

export interface NavigationPanelData extends SelectedWellboreNavigatable {
  wellName: string;
}

interface Props {
  data: NavigationPanelData;
  onChangeSelectedWellbore?: (
    selectedWellbore: SelectedWellboreNavigatable
  ) => void;
  onCloseSelectedWellboreView: () => void;
  disableNavigation?: boolean;
}

export const NavigationPanel: React.FC<Props> = React.memo(
  ({
    data,
    onChangeSelectedWellbore,
    onCloseSelectedWellboreView,
    disableNavigation,
  }) => {
    const wellbores = useWellInspectSelectedWellboreNames();
    const wellboresWithoutNptData =
      useSelectedSecondaryWellboreNamesWithoutNptData();

    const { wellboreName, wellName, index } = data;

    const validIndices = useMemo(
      () =>
        [...Array(wellbores.length).keys()].filter((index) => {
          const wellboreName = wellbores[index];
          return !wellboresWithoutNptData.includes(wellboreName);
        }),
      [JSON.stringify(wellbores)]
    );
    const indexOfValidIndexes = validIndices.indexOf(index);
    const isFirstWellbore = indexOfValidIndexes === 0;
    const isLastWellbore = indexOfValidIndexes === validIndices.length - 1;

    const navigateToWellboreOfNthIndex = (index: number) => {
      if (onChangeSelectedWellbore) {
        onChangeSelectedWellbore({
          wellboreName: wellbores[index],
          index,
        });
      }
    };

    const handleNavigateToPreviousWellbore = () => {
      const previousIndex = validIndices[indexOfValidIndexes - 1];
      navigateToWellboreOfNthIndex(previousIndex);
    };

    const handleNavigateToNextWellbore = () => {
      const nextIndex = validIndices[indexOfValidIndexes + 1];
      navigateToWellboreOfNthIndex(nextIndex);
    };

    return (
      <NavigationPanelContainer>
        <BackButton onClick={onCloseSelectedWellboreView} />

        <DetailsContainer>
          <WellboreName>{wellboreName}</WellboreName>
          <WellName>{wellName}</WellName>
        </DetailsContainer>

        {!disableNavigation && (
          <>
            <BaseButton
              icon="ChevronLeft"
              type="secondary"
              onClick={handleNavigateToPreviousWellbore}
              disabled={isFirstWellbore}
              aria-label="previous-wellbore"
            />
            <BaseButton
              icon="ChevronRight"
              type="secondary"
              onClick={handleNavigateToNextWellbore}
              disabled={isLastWellbore}
              aria-label="next-wellbore"
            />
          </>
        )}
      </NavigationPanelContainer>
    );
  }
);
