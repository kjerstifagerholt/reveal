import {
  ASSET_NAME,
  TIMESERIES_NAME,
  FILE_NAME,
  EVENT_ID,
  SEQUENCE_NAME,
  NO_RESULTS_TEXT,
} from '../support/constant';
import {
  ASSET_LIST_ALIAS,
  interceptAssetList,
  interceptTimeseriesList,
  TIMESERIES_LIST_ALIAS,
} from '../support/interceptions/interceptions';

describe('Search function - Exact match', () => {
  before(() => {
    cy.fusionLogin();
    cy.navigateToExplora();
  });

  it('Disable fuzzy search & enable "Name" parameter', () => {
    cy.clickButton('Config');
    cy.fuzzySearchDisable();
    cy.includeSearchParameter('common-column-checkbox-Name');
    cy.clickButton('Save');
  });

  it('Should be able to search assets by name', () => {
    interceptAssetList();
    cy.goToTab('Assets');
    cy.wait(`@${ASSET_LIST_ALIAS}`);
    cy.performSearch(ASSET_NAME);

    cy.get('[id="asset-tree-table"]').contains(ASSET_NAME).should('be.visible');
    cy.findAllByText('Exact match: Name').should('be.visible');
    cy.clearSearchInput();
  });

  it('Should be able to search time series by name', () => {
    interceptTimeseriesList();
    cy.goToTab('Time series');
    cy.wait(`@${TIMESERIES_LIST_ALIAS}`);
    cy.performSearch(TIMESERIES_NAME);

    cy.get('[id="timeseries-search-results"]')
      .contains(TIMESERIES_NAME)
      .should('be.visible');
  });

  it('Should be able to search files by name', () => {
    cy.goToTab('Files');
    cy.performSearch(FILE_NAME);

    cy.get('[id="documents-search-results"]')
      .contains(FILE_NAME)
      .should('be.visible');
  });

  it('Should be able to search events by id', () => {
    cy.goToTab('Events');
    cy.columnSelection(`id`);
    cy.performSearch(EVENT_ID);

    cy.get('[id="event-search-results"]')
      .contains(EVENT_ID)
      .should('be.visible');
    cy.findAllByText('Exact match: ID').should('be.visible');
  });

  it('Should be able to search sequence by name', () => {
    cy.goToTab('Sequence');
    cy.performSearch(SEQUENCE_NAME);

    cy.get('[id="sequence-search-results"]')
      .contains(SEQUENCE_NAME)
      .should('be.visible');
  });
});

describe('Search Parameters', () => {
  beforeEach(() => {
    cy.fusionLogin();
    cy.navigateToExplora();
  });

  it('exclude asset name parameter and check results', () => {
    cy.clickButton('Config');

    cy.log('uncheck asset name parameter');
    cy.excludeSearchParameter('modal-checkbox-asset-name');

    cy.log('save changes');
    cy.clickButton('Save');

    interceptAssetList();
    cy.goToTab('Assets');
    cy.wait(`@${ASSET_LIST_ALIAS}`);
    cy.performSearch(ASSET_NAME);

    cy.log('no result text should display');
    cy.findAllByText(NO_RESULTS_TEXT).should('be.visible');
  });

  it(`uncheck common parameter "Name" and check results`, () => {
    cy.clickButton('Config');

    cy.log('uncheck "Name" parameter from common field');
    cy.excludeSearchParameter('common-column-checkbox-Name');

    cy.log('save changes');
    cy.clickButton('Save');

    cy.log('perform time series search by name');
    cy.goToTab('Assets');
    cy.performSearch(ASSET_NAME);

    cy.log('no result text should display');
    cy.findAllByText(NO_RESULTS_TEXT).should('be.visible');

    cy.log('perform files search by name');
    cy.goToTab('Sequence');
    cy.performSearch(SEQUENCE_NAME);

    cy.log('no result text should display');
    cy.findAllByText(NO_RESULTS_TEXT).should('be.visible');
  });
});
