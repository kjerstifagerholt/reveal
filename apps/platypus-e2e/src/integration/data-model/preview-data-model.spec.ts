describe('Data Model Page - Existing Solution Preview', () => {
  beforeEach(() => cy.visit('/platypus/solutions/new-schema/latest/data'));

  it('should render page', () => {
    cy.getBySel('page-title').contains('Data model');

    // Should render the versions select
    cy.getBySel('schema-version-select').should('be.visible');

    // Should render toolbar and the edit schema button
    cy.getBySel('edit-schema-btn').should('be.visible');
  });

  it('should render the code editor', () => {
    // Should render the code editor
    cy.get('[aria-label="Code editor"]').click();
    cy.get('.monaco-editor textarea:first').should('be.visible');
  });

  it('should fill the code editor with text', () => {
    // This should come imported from the mock package
    const expectedSchema =
      '\ntype Person @template {\n  firstName: String\n  lastName: String\n  email: String\n  age: Long\n}\n\ntype Product @template {\n  name: String\n  price: Float\n  image: String\n  description: String\n}\n\ntype Category @template {\n  name: String\n  products: [Product]\n}\n\n';

    cy.get('[aria-label="Code editor"]').click();
    cy.get('.monaco-editor textarea:first').should('be.visible');
    cy.getBySel('edit-schema-btn').should('be.visible').click();
    cy.get('.monaco-editor textarea:first')
      .type('{selectAll}')
      .should('have.value', expectedSchema);
  });

  it('should render the visualizer with mock data', () => {
    // Should render the visualizer
    cy.get('div#Person.node').should('be.visible');
    cy.get('div#Category.node').should('be.visible');
  });

  it('should create new type in UI Editor', () => {
    cy.get('button[aria-label="UI editor"]').click();
    cy.getBySel('edit-schema-btn').should('be.visible').click();
    cy.get('button[aria-label="Add type"]').click();

    cy.get('input[name="typeName"]')
      .should('be.visible')
      .type('NewEquipmentType');
    cy.get('button[data-cy="modal-ok-button"]').click();
    cy.contains('NewEquipmentType').should('be.visible');
  });

  it('should enter the type in UI editor and add new field & see changes in visualizer', () => {
    cy.get('[aria-label="UI editor"]').click();
    cy.contains('Person').click();
    cy.get('h5').contains('Person').should('be.visible');
    cy.getBySel('edit-schema-btn').should('be.visible').click();
    cy.get('button[aria-label="Add field"').click();
    cy.getBySel('schema-type-field').last().type('phone');
    cy.getBySel('checkbox-field-required').last().click();
    // checks if visualizer updated with edited value
    cy.get('div#Person')
      .should('be.visible')
      .children()
      .last()
      .should('contain', 'phone')
      .and('contain', 'String')
      .and('contain', '!');
  });
  it('should delete field inside type and see changes in visualizer', () => {
    cy.get('[aria-label="UI editor"]').click();
    cy.contains('Person').click();
    cy.get('h5').contains('Person').should('be.visible');
    // should delete field "firstName"
    cy.getBySel('edit-schema-btn').should('be.visible').click();
    cy.get('button[aria-label="Delete field"').first().click();
    cy.get('div#Person')
      .find('[data-cy="visualizer-type-field"]')
      .first()
      .should('not.contain', 'firstName');
  });
});
