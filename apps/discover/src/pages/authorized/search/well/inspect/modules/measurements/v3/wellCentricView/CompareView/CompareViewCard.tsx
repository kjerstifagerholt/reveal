import React, { useState } from 'react';

import head from 'lodash/head';

import { BaseButton } from 'components/buttons';
import {
  MeasurementChartDataV3 as MeasurementChartData,
  MeasurementTypeV3 as MeasurementType,
} from 'modules/wellSearch/types';
import { ChartV2 } from 'pages/authorized/search/well/inspect/modules/common/ChartV2';
import CurveColorCode from 'pages/authorized/search/well/inspect/modules/common/ChartV2/CurveColorCode';
import { FlexColumn, FlexRow } from 'styles/layout';

import { filterByChartType, filterByMainChartType } from '../../utils';

import {
  CardWrapper,
  CurveName,
  Footer,
  LegendsHolder,
  WellboreName,
} from './elements';

type AxisNames = {
  x: string;
  y: string;
  x2?: string;
};

type Props = {
  title: string;
  chartData: MeasurementChartData[];
  axisNames: AxisNames;
};

const FOOTER_MIN_HEIGHT = 32;

export const CompareViewCard: React.FC<Props> = ({
  title,
  chartData,
  axisNames,
}) => {
  const [showAll, setShowAll] = useState<boolean>(false);
  const legendsHolderRef = React.useRef<HTMLDivElement>(null);
  const displayShowAll =
    (legendsHolderRef?.current?.scrollHeight || 0) > FOOTER_MIN_HEIGHT;
  const fitChart = head(filterByChartType(chartData, [MeasurementType.FIT]));
  const lotChart = head(filterByChartType(chartData, [MeasurementType.LOT]));

  const renderfitOrLotChart = (
    curveName: string,
    fitChart: MeasurementChartData
  ) => {
    if (!fitChart || !fitChart.customdata) return null;
    const [, wellboreName] = fitChart.customdata as string[];
    return (
      <FlexRow key={`${curveName.toLowerCase()}-${wellboreName}`}>
        <CurveColorCode line={fitChart.line} marker={fitChart.marker} />
        <FlexColumn>
          <CurveName>{curveName}</CurveName>
          <WellboreName>{wellboreName}</WellboreName>
        </FlexColumn>
      </FlexRow>
    );
  };

  return (
    <CardWrapper>
      <ChartV2
        data={chartData}
        axisNames={axisNames}
        axisAutorange={{
          y: 'reversed',
        }}
        title={title}
        autosize
      />
      <Footer>
        <LegendsHolder expanded={showAll} ref={legendsHolderRef}>
          {filterByMainChartType(chartData).map((row) => {
            const customdata = row.customdata as string[];
            const [curveName, wellboreName] = customdata as string[];
            return (
              <FlexRow key={`${curveName}-${wellboreName}`}>
                <CurveColorCode line={row.line} marker={row.marker} />
                <FlexColumn>
                  <CurveName>{curveName}</CurveName>
                  <WellboreName>{wellboreName}</WellboreName>
                </FlexColumn>
              </FlexRow>
            );
          })}

          {fitChart && renderfitOrLotChart('FIT', fitChart)}

          {lotChart && renderfitOrLotChart('LOT', lotChart)}
        </LegendsHolder>

        <BaseButton
          hidden={!displayShowAll}
          type="ghost"
          size="small"
          icon={showAll ? 'ChevronUp' : 'ChevronDown'}
          text={showAll ? 'Hide all' : 'Show all'}
          aria-label={showAll ? 'Hide all' : 'Show all'}
          onClick={() => setShowAll(!showAll)}
        />
      </Footer>
    </CardWrapper>
  );
};

export default CompareViewCard;
