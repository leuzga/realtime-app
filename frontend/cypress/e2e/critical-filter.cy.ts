describe('Filter Nodes by Critical Status', () => {
  it('should filter nodes to show only CRITICAL status', () => {
    // Verify initial state shows all nodes
    cy.contains('All Nodes').should('be.visible');

    // Click CRITICAL tab
    cy.contains('CRITICAL').click();

    // Verify CRITICAL tab is selected
    cy.contains('CRITICAL').should('have.css', 'border-bottom').and('not.equal', 'none');

    // Verify only CRITICAL badges are displayed
    cy.get('[style*="background"]').filter((index, el) => {
      return el.textContent.includes('CRITICAL');
    }).should('have.length.greaterThan', 0);

    // Verify non-CRITICAL nodes are not shown
    cy.get('body').should('not.contain', '✓ OK');
  });

  it('should display telemetry data for selected node', () => {
    // Navigate to CRITICAL tab
    cy.contains('CRITICAL').click();

    // Find first CRITICAL node
    cy.get('div').filter((index, el) => {
      return el.textContent.includes('CRITICAL');
    }).first().click();

    // Verify node chart appears
    cy.contains('CPU Load', { timeout: 5000 }).should('be.visible');
    cy.contains('Memory Usage').should('be.visible');
    cy.contains('Latency').should('be.visible');

    // Verify chart renders
    cy.get('svg').should('have.length.greaterThan', 0);
  });

  it('should show critical alert count in badge', () => {
    // Find CRITICAL tab badge with count
    cy.contains('CRITICAL')
      .parent()
      .should('contain', '(')
      .and('contain', ')');

    // Badge should have numeric count
    cy.contains('CRITICAL').then(($el) => {
      if (!$el) return;
      const text = $el.text();
      const match = text.match(/\((\d+)\)/);
      expect(match).to.exist;
      if (match) {
        expect(parseInt(match[1])).to.be.greaterThan(0);
      }
    });
  });
});
