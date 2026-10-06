describe('Infinite Scroll and Load More', () => {
  it('should display initial 24 nodes', () => {
    // Count initial node cards
    cy.get('div').filter((index, el) => {
      return el.textContent.includes('CPU:');
    }).should('have.length', 24);
  });

  it('should show Load More button when more nodes exist', () => {
    // Verify Load More button exists
    cy.contains('button', 'Load 24 More').should('be.visible');

    // Button should show current count
    cy.contains('Load 24 More').should('contain', '24 of');
  });

  it('should load more nodes on Load More click', () => {
    // Get initial count
    let initialCount = 0;
    cy.get('div').filter((index, el) => {
      return el.textContent.includes('CPU:');
    }).then(($nodes) => {
      initialCount = $nodes.length;
    });

    // Click Load More button
    cy.contains('button', 'Load 24 More').click();

    // Wait for new nodes to load
    cy.wait(500);

    // Verify node count increased
    cy.get('div').filter((index, el) => {
      return el.textContent.includes('CPU:');
    }).should('have.length.greaterThan', initialCount);
  });

  it('should load more nodes on scroll near bottom', () => {
    // Get initial count
    let initialCount = 0;
    cy.get('div').filter((index, el) => {
      return el.textContent.includes('CPU:');
    }).then(($nodes) => {
      initialCount = $nodes.length;
    });

    // Scroll to near bottom of container (within 200px)
    cy.get('div').filter((index, el) => {
      const style = window.getComputedStyle(el);
      return style.height === '600px' && style.overflowY === 'auto';
    }).first().scrollTo('bottom', { duration: 500 });

    // Wait for auto-load
    cy.wait(1000);

    // Verify node count increased
    cy.get('div').filter((index, el) => {
      return el.textContent.includes('CPU:');
    }).should('have.length.greaterThan', initialCount);
  });

  it('should show Back to Top button after scrolling down', () => {
    // Back to Top should not be visible initially
    cy.contains('button', 'Back to Top').should('not.exist');

    // Scroll down container
    cy.get('div').filter((index, el) => {
      const style = window.getComputedStyle(el);
      return style.height === '600px' && style.overflowY === 'auto';
    }).first().scrollTo(0, 400, { duration: 500 });

    // Back to Top button should appear
    cy.contains('button', 'Back to Top').should('be.visible');

    // Click Back to Top
    cy.contains('button', 'Back to Top').click();

    // Should scroll back to top
    cy.get('div').filter((index, el) => {
      const style = window.getComputedStyle(el);
      return style.height === '600px' && style.overflowY === 'auto';
    }).first().should('have.scrollTop', 0);
  });
});
