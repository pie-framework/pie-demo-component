
describe('Load assets', () => {
  
  it('should add scripts for from pie-cloud builds', () => {
    cy.visit('/cypress/fixtures/loadAssets.html');
    cy.get('head > script[id ="pie-multiple-choice"] ').should('exist')  
  })

})