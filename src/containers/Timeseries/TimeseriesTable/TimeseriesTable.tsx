import { Timeseries } from '@cognite/sdk';
import React, { useEffect, useMemo, useState } from 'react';
import { DateRangeProps, RelationshipLabels } from 'types';
import { Table, TableProps } from 'components/Table/Table';
import { TIME_SELECT } from 'containers';
import { TimeseriesChart } from '..';
import { Body } from '@cognite/cogs.js';
import { ColumnDef } from '@tanstack/react-table';
import { useGetHiddenColumns } from 'hooks';
import { RootAsset } from 'components/RootAsset';
import isEmpty from 'lodash/isEmpty';

export type TimeseriesWithRelationshipLabels = Timeseries & RelationshipLabels;

export interface TimeseriesTableProps
  extends Omit<TableProps<TimeseriesWithRelationshipLabels>, 'columns'>,
    RelationshipLabels,
    DateRangeProps {
  hideEmptyData?: boolean;
}

const visibleColumns = ['name', 'description', 'data', 'lastUpdatedTime'];

export const TimeseriesTable = ({
  dateRange: dateRangeProp,
  hideEmptyData = false,
  ...props
}: TimeseriesTableProps) => {
  const { data, ...rest } = props;

  const [dateRange, setDateRange] = useState(
    dateRangeProp || TIME_SELECT['1Y'].getTime()
  );
  const [emptyTimeseriesMap, setEmptyTimeseriesMap] = useState<
    Record<number, boolean>
  >({});

  useEffect(() => {
    if (dateRangeProp) {
      setDateRange(dateRangeProp);
    }
  }, [dateRangeProp]);

  useEffect(() => {
    const emptyTimeseriesMap = data.reduce(
      (emptyTimeseriesMap, { id }) => ({
        ...emptyTimeseriesMap,
        [id]: false,
      }),
      {} as Record<number, boolean>
    );
    setEmptyTimeseriesMap(emptyTimeseriesMap);
  }, [data]);

  const columns = useMemo(() => {
    const sparkLineColumn: ColumnDef<Timeseries & { data: any }> = {
      header: 'Preview',
      accessorKey: 'data',
      size: 400,
      enableSorting: false,
      cell: ({ row }) => {
        const timeseries = row.original;
        if (timeseries.isString) {
          return <Body level={2}>N/A for string time series</Body>;
        }
        return (
          <TimeseriesChart
            height={100}
            showSmallerTicks
            timeseriesId={timeseries.id}
            numberOfPoints={100}
            showAxis="horizontal"
            timeOptions={[]}
            showContextGraph={false}
            showPoints={false}
            enableTooltip={false}
            showGridLine="none"
            minRowTicks={2}
            enableTooltipPreview
            dateRange={dateRange}
            onDateRangeChange={() => {}}
            onDataFetched={data =>
              setEmptyTimeseriesMap(emptyTimeseriesMap => ({
                ...emptyTimeseriesMap,
                [timeseries.id]: isEmpty(data?.datapoints),
              }))
            }
          />
        );
      },
    };
    return [
      { ...Table.Columns.name, enableHiding: false },
      Table.Columns.description,
      {
        ...Table.Columns.unit,
        enableSorting: false,
      },
      sparkLineColumn,
      Table.Columns.lastUpdatedTime,
      Table.Columns.created,
      {
        ...Table.Columns.id,
        enableSorting: false,
      },
      {
        ...Table.Columns.isString,
        enableSorting: false,
      },
      {
        ...Table.Columns.isStep,
        enableSorting: false,
      },
      {
        ...Table.Columns.dataSet,
        enableSorting: false,
      },
      {
        ...Table.Columns.rootAsset,
        accessorKey: 'assetId',
        cell: ({ getValue }) => <RootAsset assetId={getValue<number>()} />,
        enableSorting: false,
      },
    ] as ColumnDef<Timeseries>[];
  }, [dateRange]);

  const hiddenColumns = useGetHiddenColumns(columns, visibleColumns);

  const timeseriesWithDatapoints = useMemo(() => {
    return data.filter(({ id }) => !emptyTimeseriesMap[id]);
  }, [data, emptyTimeseriesMap]);

  return (
    <Table
      columns={columns}
      data={hideEmptyData ? timeseriesWithDatapoints : data}
      hiddenColumns={hiddenColumns}
      {...rest}
    />
  );
};
