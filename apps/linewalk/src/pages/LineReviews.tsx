import {
  OptionType,
  Select,
  Table,
  TextInput,
  Tooltip,
  Icon,
  Loader,
} from '@cognite/cogs.js';
import capitalize from 'lodash/capitalize';
import withoutFileExtension from 'components/LineReviewViewer/withoutFileExtension';
import StatusTag from 'components/StatusTag';
import * as H from 'history';
import { LineReview, LineReviewStatus } from 'modules/lineReviews/types';
import useLineReviews from 'modules/lineReviews/useLineReviews';
import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router';
import styled from 'styled-components';
import qs from 'query-string';

import { LineReviewsWrapper, LoaderContainer } from './elements';
import Statistic from './Statistic';
import * as Styled from './styled';

type LineReviewTableProps = {
  onRowClick: (lineReview: LineReview) => void;
  lineReviews: LineReview[];
};

const FiltersContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  > * {
    margin-right: 8px;
  }
  padding-bottom: 16px;
`;

const FilterContainer = styled.div`
  width: 300px;
`;

const StyledTableWrapper = styled.div`
  tr {
    cursor: pointer;
  }
`;

const StatusCell = ({ value }: { value: string }) => (
  <StatusTag status={value as LineReviewStatus} />
);

const AssigneeCell = ({ value }: { value: { name: string }[] }) =>
  value ? (
    <span style={{ fontWeight: 'bold' }}>{value}</span>
  ) : (
    <span style={{ fontStyle: 'italic', opacity: 0.7 }}>None</span>
  );

const shamefulIsIso = (name: string) => !name.includes('MF');

const shamefulIsPid = (name: string) => name.includes('MF');

const IsoCell = ({
  value: documents,
}: {
  value: LineReview['pdfExternalIds'];
}) => {
  return (
    <FileCell
      value={documents
        .map((name) => withoutFileExtension(name))
        .filter(shamefulIsIso)}
    />
  );
};

const PidCell = ({
  value: documents,
}: {
  value: LineReview['pdfExternalIds'];
}) => {
  return (
    <FileCell
      value={documents
        .map((name) => withoutFileExtension(name))
        .filter(shamefulIsPid)}
    />
  );
};

type BadgeProps = {
  label: string;
};

const StyledBadgeContainer = styled.span`
  color: #4a67fb;
  border: 1px solid #4a67fb;
  box-sizing: border-box;
  border-radius: 4px;
  font-family: Inter;
  font-style: normal;
  font-weight: 600;
  font-size: 10px;
  line-height: 16px;
  /* identical to box height, or 160% */

  letter-spacing: 0.4px;
  text-transform: uppercase;
  font-feature-settings: 'cpsp' on, 'ss04' on;
`;

const Badge: React.FC<BadgeProps> = ({ label }) => (
  <StyledBadgeContainer>{label}</StyledBadgeContainer>
);

const FileCell = ({
  value: documentExternalIds,
}: {
  value: LineReview['pdfExternalIds'];
}) => {
  if (documentExternalIds.length === 0) {
    return <div>N/A</div>;
  }

  return (
    <>
      {documentExternalIds.slice(0, 2).map((externalId, index, slicedArray) => (
        <React.Fragment key={externalId}>
          <span>
            {externalId}
            &nbsp;
          </span>
          {index < slicedArray.length - 1 && <br />}
        </React.Fragment>
      ))}
      {documentExternalIds.length > 1 && (
        <Tooltip
          content={documentExternalIds.map((documentExternalId) => (
            <div key={documentExternalId}>{documentExternalId}</div>
          ))}
        >
          <Badge label={`+${documentExternalIds.length}`} />
        </Tooltip>
      )}
    </>
  );
};

type CommentCellProps = {
  value: string;
};

const CommentCell: React.FC<CommentCellProps> = ({ value }) => {
  if (value === undefined || value === '') {
    return <div />;
  }

  return (
    <Tooltip content={value}>
      <Icon type="Comment" style={{ color: '#4A67FB' }} />
    </Tooltip>
  );
};

const LineReviewTable: React.FC<LineReviewTableProps> = ({
  lineReviews,
  onRowClick,
}) => {
  return (
    <StyledTableWrapper>
      <Table
        columns={[
          {
            Header: 'Name',
            accessor: 'name',
          },
          {
            Header: 'Status',
            accessor: 'status',
            Cell: StatusCell,
          },
          {
            id: 'iso',
            Header: 'ISO',
            accessor: 'pdfExternalIds',
            Cell: IsoCell,
          },
          {
            id: 'pid',
            Header: 'PID',
            accessor: 'pdfExternalIds',
            Cell: PidCell,
          },
          {
            Header: 'Assignee',
            accessor: 'assignee',
            Cell: AssigneeCell,
          },
          {
            Header: 'Comment',
            accessor: 'comment',
            Cell: CommentCell,
          },
        ]}
        dataSource={lineReviews}
        onRowClick={(row) => onRowClick(row.original)}
      />
    </StyledTableWrapper>
  );
};

type SearchQueryParams = {
  status?: string;
  assignee?: string;
  search?: string;
};

const DEFAULT_STATUS_OPTION = {
  label: 'All',
  value: '',
};

const DEFAULT_ASSIGNEE_OPTION = {
  label: 'All',
  value: '',
};

const getInitialStatus = (
  maybeStatusValue: string | undefined,
  possibleStatusOptions: OptionType<string>[]
): OptionType<string> => {
  if (maybeStatusValue === undefined) {
    return DEFAULT_STATUS_OPTION;
  }

  const foundStatusOption = possibleStatusOptions.find(
    (option) => option.value === maybeStatusValue
  );
  if (!foundStatusOption) {
    return DEFAULT_STATUS_OPTION;
  }

  return foundStatusOption;
};

const getInitialAssignee = (
  maybeAssigneeValue: string | undefined,
  assigneeOptions: OptionType<string>[]
): OptionType<string> => {
  if (maybeAssigneeValue === undefined) {
    return DEFAULT_ASSIGNEE_OPTION;
  }

  const foundAssigneeOption = assigneeOptions.find(
    (option) => option.value === maybeAssigneeValue
  );
  if (!foundAssigneeOption) {
    return DEFAULT_ASSIGNEE_OPTION;
  }

  return {
    label: maybeAssigneeValue,
    value: maybeAssigneeValue,
  };
};

const useFilters = (
  history: H.History<unknown>,
  isLoading: boolean,
  statuses: string[],
  assignees: string[]
) => {
  const searchQueryParams: SearchQueryParams = qs.parse(
    history.location.search
  );
  const [search, setSearch] = useState<string>(searchQueryParams.search || '');

  const statusOptions = [
    DEFAULT_STATUS_OPTION,
    ...statuses.map((status) => ({
      label: capitalize(status),
      value: status,
    })),
  ];

  const assigneeOptions: OptionType<string>[] = [
    DEFAULT_ASSIGNEE_OPTION,
    ...assignees.map((a) => ({ label: a, value: a })),
  ];

  const [status, setStatus] = useState<
    OptionType<LineReviewStatus> | OptionType<string>
  >(DEFAULT_STATUS_OPTION);
  const [assignee, setAssignee] = useState<OptionType<string>>(
    getInitialAssignee(searchQueryParams.assignee, assigneeOptions)
  );

  // Update the filters on load
  useEffect(() => {
    if (!isLoading) {
      setStatus(getInitialStatus(searchQueryParams.status, statusOptions));
      setAssignee(
        getInitialAssignee(searchQueryParams.assignee, assigneeOptions)
      );
    }
  }, [isLoading]);

  // Update the search query when filters change
  useEffect(() => {
    if (!isLoading) {
      history.replace({
        ...history.location,
        search: qs.stringify(
          {
            search,
            status: status.value,
            assignee: assignee.value,
          },
          { skipEmptyString: true, skipNull: true }
        ),
      });
    }
  }, [search, status, assignee]);

  return {
    search,
    setSearch,
    status,
    setStatus,
    assignee,
    setAssignee,
    statusOptions,
    assigneeOptions,
  };
};

const LineReviews = () => {
  const history = useHistory();

  const { isLoading, lineReviews, assignees, statuses } = useLineReviews();

  const {
    search,
    setSearch,
    assignee,
    setAssignee,
    status,
    setStatus,
    statusOptions,
    assigneeOptions,
  } = useFilters(history, isLoading, statuses, assignees);

  const filteredLineReviews = lineReviews
    .filter(
      (lineReview) =>
        search.length === 0 ||
        lineReview.name.toLowerCase().includes(search.toLowerCase())
    )
    .filter(
      (lineReview) =>
        status.value!.length === 0 || status.value === lineReview.status
    )
    .filter(
      (lineReview) =>
        assignee.value!.length === 0 || assignee.value === lineReview.assignee
    );

  if (isLoading) {
    return (
      <LoaderContainer>
        <Loader infoTitle="Loading..." darkMode={false} />
      </LoaderContainer>
    );
  }

  return (
    <LineReviewsWrapper>
      <Styled.StatisticsContainer>
        <Statistic
          number={lineReviews.length}
          title="Assigned Lines"
          body={`out of ${lineReviews.length} ISOs for Unit 03`}
        />
        <Statistic
          number={
            lineReviews.filter(
              (lineReview) => lineReview.status === LineReviewStatus.REVIEWED
            ).length
          }
          title="Under Review"
          body="Forwarded for onsite or remote check"
        />
        <Statistic
          number={
            lineReviews.filter(
              (lineReview) => lineReview.status === LineReviewStatus.COMPLETED
            ).length
          }
          title="Completed"
          body="Checked and validate onsite"
        />
      </Styled.StatisticsContainer>

      <div style={{ padding: 62 }}>
        <FiltersContainer>
          <FilterContainer>
            <TextInput
              // className="filter-input"
              placeholder="Search"
              icon="Search"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
              }}
              fullWidth
            />
          </FilterContainer>

          <FilterContainer>
            <Select
              title="Status"
              value={status}
              onChange={setStatus}
              options={statusOptions}
            />
          </FilterContainer>

          <FilterContainer>
            <Select
              title="Assignee"
              value={assignee}
              onChange={setAssignee}
              options={assigneeOptions}
            />
          </FilterContainer>
        </FiltersContainer>
        <LineReviewTable
          lineReviews={filteredLineReviews}
          onRowClick={(lineReview) => {
            history.push(`/LineReview/${lineReview.id}`);
          }}
        />
      </div>
    </LineReviewsWrapper>
  );
};

export default LineReviews;
