import { ASSET_NAME } from '../support/constant';
import {
  ASSET_LIST_ALIAS,
  interceptAssetList,
} from '../support/interceptions/interceptions';

describe('Assets', () => {
  before(() => {
    cy.fusionLogin();
    cy.navigateToExplorer();
  });

  beforeEach(() => {
    interceptAssetList();
  });

  it('should click the assets tab and go to list view ', () => {
    cy.goToTab('Assets');
    cy.wait(`@${ASSET_LIST_ALIAS}`);
    cy.clickIconButton('List');
  });

  it('should sort asset results', () => {
    cy.log('sorting colomn: Name');
    cy.getTableById('asset-search-results').clickSortColoumn('Name');
    cy.wait(`@${ASSET_LIST_ALIAS}`).shouldSortAscending('name');

    cy.getTableById('asset-search-results').clickSortColoumn('Name');
    cy.wait(`@${ASSET_LIST_ALIAS}`).shouldSortDescending('name');

    cy.tableShouldBeVisible('asset-search-results').selectColumn(`Description`);

    cy.log('sorting colomn: Description');
    cy.getTableById('asset-search-results').clickSortColoumn('Description');
    cy.wait(`@${ASSET_LIST_ALIAS}`).shouldSortAscending('description');

    cy.getTableById('asset-search-results').clickSortColoumn('Description');
    cy.wait(`@${ASSET_LIST_ALIAS}`).shouldSortDescending('description');
  });

  it('should navigate to the detail view', () => {
    cy.clickIconButton('Asset hierarchy');
    cy.performSearch(ASSET_NAME);

    cy.getTableById('asset-tree-table')
      .contains(ASSET_NAME)
      .should('be.visible')
      .click();
  });

  it('should navigate between the detail view tabs', () => {
    cy.log('should contain All resources tab details');
    cy.findAllByTestId('asset-detail').goToTab('All resources');
    cy.findAllByTestId('asset-summary').should('be.visible');
    cy.findAllByTestId('timeseries-summary').should('be.visible');
    cy.findAllByTestId('document-summary').should('be.visible');
    cy.findAllByTestId('event-summary').should('be.visible');
    cy.findAllByTestId('sequence-summary')
      .scrollIntoView()
      .should('be.visible');

    // Scrolling back to top
    cy.findAllByTestId('asset-detail').scrollIntoView();

    cy.log('should navigate to Hierarchy tab');
    cy.findAllByTestId('asset-detail').goToTab('Hierarchy');
    cy.tableShouldBeVisible('asset-details-tree-table');

    cy.log('should navigate to Assets tab');
    cy.findAllByTestId('asset-detail').goToTab('Assets');
    cy.tableShouldBeVisible('asset-linked-search-results');

    cy.log('should navigate to Time series tab');
    cy.findAllByTestId('asset-detail').goToTab('Time series');
    cy.tableShouldBeVisible('timeseries-linked-search-results');

    cy.log('should navigate to Files tab');
    cy.findAllByTestId('asset-detail').goToTab('Files');
    cy.findAllByTestId('file-grouping-table').should('be.visible');

    cy.log('should navigate to Events tab');
    cy.findAllByTestId('asset-detail').goToTab('Events');
    cy.tableShouldBeVisible('event-linked-search-results');

    cy.log('should navigate to Sequence tab');
    cy.findAllByTestId('asset-detail').goToTab('Sequence');
    cy.tableShouldBeVisible('sequence-linked-search-results');

    cy.log('close asset detail view');
    cy.clickIconButton('Close');

    cy.clearSearchInput();
  });
});
