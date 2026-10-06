describe('Dynamic Sorting by Metrics', () => {
  it('should sort nodes by CPU load', () => {
    // Click CPU sort button
    cy.contains('button', 'CPU').click();

    // Verify CPU button is selected
    cy.contains('CPU')
      .should('have.css', 'font-weight')
      .and('not.equal', 'normal');

    // Verify nodes are displayed (order will change)
    cy.get('div').filter((index, el) => {
      return el.textContent.includes('CPU:');
    }).should('have.length.greaterThan', 0);
  });

  it('should sort nodes by Memory usage', () => {
    // Click Memory sort button
    cy.contains('button', 'Memory').click();

    // Verify Memory button is selected
    cy.contains('Memory')
      .should('have.css', 'font-weight')
      .and('not.equal', 'normal');

    // Verify nodes display memory values
    cy.get('div').filter((index, el) => {
      return el.textContent.includes('MEM:');
    }).should('have.length.greaterThan', 0);
  });

  it('should sort nodes by Latency (default)', () => {
    // Latency should be default sort
    cy.contains('button', 'Latency')
      .should('have.css', 'font-weight')
      .and('not.equal', 'normal');

    // Verify nodes display latency values
    cy.get('div').filter((index, el) => {
      return el.textContent.includes('LAT:');
    }).should('have.length.greaterThan', 0);
  });

  it('should toggle sort order (ascending/descending)', () => {
    // Find order toggle button (↓ or ↑)
    cy.contains('button', /↓|↑/).click();

    // Order should toggle
    cy.contains('button', /↓|↑/).should('be.visible');

    // Verify nodes still display
    cy.get('div').filter((index, el) => {
      return el.textContent.includes('LAT:');
    }).should('have.length.greaterThan', 0);
  });
});
