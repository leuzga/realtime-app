// Cypress E2E support file
// Add global commands and configurations

beforeEach(() => {
  // Visit dashboard before each test
  cy.visit('/');
  // Wait for WebSocket connection
  cy.contains('Live', { timeout: 5000 }).should('exist');
});
