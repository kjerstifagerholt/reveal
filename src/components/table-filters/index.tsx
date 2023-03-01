import React, { PropsWithChildren, useEffect, useState } from 'react';
import styled from 'styled-components';
import {
  Body,
  Button,
  Checkbox,
  Colors,
  Flex,
  Icon,
  Menu,
} from '@cognite/cogs.js';
import { Dropdown, Input, Select } from 'antd';
import { useTranslation } from 'common/i18n';
import { getContainer } from 'utils/shared';
import {
  useSearchParamState,
  useUpdateSearchParamState,
} from 'hooks/useSearchParamState';
import useDebounce from 'hooks/useDebounce';
import AppliedFilters from 'components/applied-filters';
import { trackUsage } from 'utils';

const GOVERNANCE_STATUSES = ['governed', 'ungoverned', 'not-defined'] as const;
export type GovernanceStatus = typeof GOVERNANCE_STATUSES[number];

type TableFilterProps = {
  filteredCount?: number;
  labelOptions: string[];
  totalCount?: number;
};

const TableFilter = ({
  filteredCount,
  labelOptions,
  totalCount,
}: PropsWithChildren<TableFilterProps>): JSX.Element => {
  const { t } = useTranslation();

  const searchFilter = useSearchParamState<string>('search');
  const labelFilter = useSearchParamState<string[]>('labels');
  const governanceFilter =
    useSearchParamState<GovernanceStatus[]>('governance');

  const { updateSearchParamState } = useUpdateSearchParamState<{
    labels?: string[];
    governance?: GovernanceStatus[];
    search?: string;
  }>();

  const [isVisible, setIsVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState<string | undefined>(
    searchFilter
  );
  const debouncedSearchQuery = useDebounce(searchQuery);

  useEffect(() => {
    updateSearchParamState({ search: debouncedSearchQuery });
  }, [debouncedSearchQuery, updateSearchParamState]);

  const [tempSelectedLabels, setTempSelectedLabels] = useState<
    string[] | undefined
  >(labelFilter);
  const [tempGovernanceStatus, setTempGovernanceStatus] = useState<
    GovernanceStatus[] | undefined
  >(governanceFilter);

  const handleApply = () => {
    updateSearchParamState({
      governance: tempGovernanceStatus,
      labels: tempSelectedLabels,
    });
    trackUsage({
      e: 'data.sets.filter',
      governance: tempGovernanceStatus,
      labels: tempSelectedLabels,
    });
    setIsVisible(false);
  };

  const handleClear = () => {
    setTempGovernanceStatus(undefined);
    setTempSelectedLabels(undefined);
    updateSearchParamState({
      governance: undefined,
      labels: undefined,
    });
    setIsVisible(false);
  };

  const handleClearLabelFilter = () => {
    setTempSelectedLabels(undefined);
    updateSearchParamState({
      labels: undefined,
    });
  };

  const handleClearGovernanceFilter = () => {
    setTempGovernanceStatus(undefined);
    updateSearchParamState({
      governance: undefined,
    });
  };

  const handleSelectedLabelChange = (updatedValue: string[]) => {
    setTempSelectedLabels(updatedValue.length ? updatedValue : undefined);
  };

  const handleGovernanceStatusChange = (
    name: GovernanceStatus,
    updatedValue: boolean
  ) => {
    if (updatedValue) {
      setTempGovernanceStatus(
        (prevStatus) => prevStatus?.concat(name) ?? [name]
      );
    } else {
      setTempGovernanceStatus((prevStatus) =>
        prevStatus?.filter((status) => status !== name)
      );
    }
  };

  return (
    <Flex direction="column" gap={8}>
      <Flex alignItems="center" gap={8}>
        <StyledInputContainer>
          <Input
            prefix={<Icon type="Search" />}
            placeholder={t('search-by-name-description-or-label')}
            onChange={(e) => {
              const searchText = e.target.value;
              setSearchQuery(searchText);
              trackUsage({ e: 'data.sets.filter', searchText });
            }}
            value={searchQuery}
            allowClear
          />
        </StyledInputContainer>
        <Dropdown
          destroyPopupOnHide
          getPopupContainer={getContainer}
          overlay={
            <StyledMenu>
              <Flex gap={8} direction="column">
                <StyledMenuTitle>
                  <Body level={2} strong>
                    {t('filter-by')}
                  </Body>
                  <Button type="ghost" size="small" onClick={handleClear}>
                    {t('clear-filters')}
                  </Button>
                </StyledMenuTitle>
                <Flex gap={8} direction="column">
                  <StyledMenuContent>
                    <StyledSectionWrapper>
                      <Flex direction="column" gap={8}>
                        <Body level="3" strong>
                          {t('label_one')}
                        </Body>
                        <StyledCheckboxWrapper>
                          {GOVERNANCE_STATUSES.map((governanceStatus) => (
                            <Checkbox
                              checked={tempGovernanceStatus?.includes(
                                governanceStatus
                              )}
                              name={governanceStatus}
                              onChange={(e, nextState) =>
                                handleGovernanceStatusChange(
                                  governanceStatus,
                                  nextState as boolean
                                )
                              }
                            >
                              <Body level={2}>{t(governanceStatus)}</Body>
                            </Checkbox>
                          ))}
                        </StyledCheckboxWrapper>
                      </Flex>
                    </StyledSectionWrapper>
                    <StyledSectionWrapper>
                      <Flex direction="column" gap={8}>
                        <Body level="3" strong>
                          {t('label_one')}
                        </Body>
                        <Select<string[]>
                          allowClear
                          getPopupContainer={getContainer}
                          mode="multiple"
                          onChange={handleSelectedLabelChange}
                          options={labelOptions.map((label) => ({
                            label,
                            value: label,
                          }))}
                          value={tempSelectedLabels}
                          menuItemSelectedIcon={
                            <Icon
                              css={{ verticalAlign: 'middle' }}
                              type="Checkmark"
                            />
                          }
                          suffixIcon={<Icon type="ChevronDown" />}
                          placeholder={t('select-label')}
                        />
                      </Flex>
                    </StyledSectionWrapper>
                  </StyledMenuContent>
                  <Button type="primary" onClick={handleApply}>
                    {t('apply')}
                  </Button>
                </Flex>
              </Flex>
            </StyledMenu>
          }
          trigger={['click']}
          placement="bottomLeft"
          visible={isVisible}
          onVisibleChange={setIsVisible}
        >
          <Button icon="Filter" type="secondary" toggled={isVisible}>
            {t('filter')}
          </Button>
        </Dropdown>
        {filteredCount !== undefined && totalCount !== undefined && (
          <StyledItemCount level={2}>
            {totalCount > filteredCount
              ? t('filtered-data-set-count', {
                  filteredCount: filteredCount,
                  count: totalCount,
                })
              : t('data-set-count', {
                  count: totalCount,
                })}
          </StyledItemCount>
        )}
      </Flex>
      <AppliedFilters
        items={[
          ...(!!labelFilter?.length
            ? [
                {
                  key: 'labels',
                  label: t('label-with-colon', {
                    labels: labelFilter?.join(', '),
                  }),
                  onClick: handleClearLabelFilter,
                },
              ]
            : []),
          ...(!!governanceFilter?.length
            ? [
                {
                  key: 'governance',
                  label: t('governance-status-with-colon', {
                    statuses: governanceFilter?.join(', '),
                  }),
                  onClick: handleClearGovernanceFilter,
                },
              ]
            : []),
        ]}
        onClear={handleClear}
      />
    </Flex>
  );
};

const StyledMenu = styled(Menu)`
  &&& {
    padding: 16px;
    min-width: 300px;
    max-width: 300px;
  }
`;

const StyledMenuTitle = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const StyledMenuContent = styled.div`
  background-color: ${Colors['surface--medium']};
  border-radius: 6px;
  padding: 12px;
`;

const StyledInputContainer = styled.div`
  width: 312px;
`;

const StyledSectionWrapper = styled.div`
  :not(:last-child) {
    padding-bottom: 12px;
    border-bottom: 1px solid ${Colors['border--interactive--default']};
    margin-bottom: 12px;
  }
`;

const StyledCheckboxWrapper = styled(Flex)`
  flex-direction: column;
  gap: 16px;
  margin-top: 10px;
`;

export const StyledItemCount = styled(Body)`
  color: ${Colors['text-icon--muted']};
`;

export default TableFilter;
