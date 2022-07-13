import { PriceAreaWithData, TableColumn } from 'types';
import { calculateScenarioProduction, roundWithDec } from 'utils/utils';
import { DatapointAggregates, Datapoints, DoubleDatapoint } from '@cognite/sdk';
import { PriceArea, CalculatedProduction } from '@cognite/power-ops-api-types';

export function getActiveColumns(
  activeTab: string,
  priceArea: PriceArea
): TableColumn[] {
  let columns: TableColumn[] = [];

  // If on total tab, one column for each Scenario
  if (activeTab === 'total') {
    columns = priceArea?.priceScenarios.map((scenario, index) => {
      const header: TableColumn = {
        Header: scenario.name,
        id: scenario.externalId,
        accessor: `scenario-${index}`,
        columns: [
          {
            Header: 'Matrix',
            accessor: `calc-${index}`,
          },
          {
            Header: 'Shop',
            accessor: `shop-${index}`,
          },
        ],
        disableSortBy: true,
      };
      return header;
    });
  } else {
    // If on Scenario tab, filter by specific scenario
    const index = priceArea?.priceScenarios.findIndex(
      (scenario) => scenario.externalId === activeTab
    );
    columns = priceArea?.priceScenarios
      .filter((scenario) => scenario.externalId === activeTab)
      .flatMap((scenario) => {
        // First column is Total Volume
        const totalColumn: TableColumn = {
          Header: 'Total Volume',
          id: scenario.externalId,
          accessor: `scenario-${index}`,
          columns: [
            {
              Header: 'Matrix',
              accessor: `calc-${index}`,
            },
            {
              Header: 'Shop',
              accessor: `shop-${index}`,
            },
          ],
          disableSortBy: true,
        };
        // The following columns are for each plant
        const plantColumns: TableColumn[] = scenario.plantProduction
          .sort((plantA, plantB) =>
            plantA.plantName.localeCompare(plantB.plantName)
          )
          .map((plant, plantIndex) => {
            return {
              Header: priceArea?.plants.find(
                (specificPlant) => specificPlant.name === plant.plantName
              )?.name,
              id: `plant-${plantIndex}`,
              accessor: `plant-${plantIndex}`,
              columns: [
                {
                  Header: 'Matrix',
                  accessor: `calc-plant-${plantIndex}`,
                },
                {
                  Header: 'Shop',
                  accessor: `shop-plant-${plantIndex}`,
                },
              ],
              disableSortBy: true,
            };
          });
        return [totalColumn, ...plantColumns];
      });
  }

  // Add hour column in to front of array
  const totalColumns = [
    {
      Header: ' ',
      disableSortBy: true,
      sticky: 'left',
      columns: [
        {
          Header: 'Hour',
          accessor: 'hour',
        },
      ],
    },

    ...columns,
  ];
  return totalColumns;
}

export const getFormattedProductionColumn = (
  datapoints: DoubleDatapoint[] | CalculatedProduction[],
  accessor: string
): { [accesor: string]: string }[] => {
  const formatedData: { [accesor: string]: string }[] = Array(24).fill({
    [accessor]: undefined,
  });
  datapoints.forEach((point) => {
    const hour = point.timestamp.getHours();
    formatedData[hour] = {
      [accessor]: roundWithDec(point.value, 1),
    };
  });
  return formatedData || [];
};

export const calculateProduction = async (
  activeTab: string,
  activeScenarioIndex: number,
  priceTimeseries: DatapointAggregates[] | Datapoints[],
  priceArea: PriceAreaWithData
): Promise<{ [accessor: string]: string }[][]> => {
  let calcProductionData: { [accessor: string]: string }[][];
  if (activeTab === 'total') {
    calcProductionData = priceTimeseries.map((scenarioPricePerHour, index) => {
      const accessor = `calc-${index}`;
      const calulatedProduction = calculateScenarioProduction(
        scenarioPricePerHour.datapoints as DoubleDatapoint[],
        priceArea.totalMatrixWithData
      );
      return getFormattedProductionColumn(calulatedProduction, accessor);
    });
  } else {
    // Calculate Plant Columns
    calcProductionData = priceArea.plantMatrixesWithData
      ? priceArea.plantMatrixesWithData
          .sort((plantA, plantB) =>
            plantA.plantName.localeCompare(plantB.plantName)
          )
          .map((plantMatrix, index) => {
            const accessor = `calc-plant-${index}`;

            const calulatedProduction = calculateScenarioProduction(
              priceTimeseries[0].datapoints as DoubleDatapoint[],
              plantMatrix.matrixWithData
            );
            return getFormattedProductionColumn(calulatedProduction, accessor);
          })
      : [];

    // Calculate Total Column
    const [calcTotalProductionData] = priceTimeseries
      ? priceTimeseries.map((scenarioPricePerHour) => {
          const accessor = `calc-${activeScenarioIndex}`;
          const calulatedProduction = calculateScenarioProduction(
            scenarioPricePerHour.datapoints as DoubleDatapoint[],
            priceArea.totalMatrixWithData
          );
          return getFormattedProductionColumn(calulatedProduction, accessor);
        })
      : [];

    // Append total prod uction column first
    calcProductionData = [calcTotalProductionData, ...calcProductionData];
  }
  return calcProductionData;
};
