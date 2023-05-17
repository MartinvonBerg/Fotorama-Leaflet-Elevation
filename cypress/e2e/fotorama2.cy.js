describe('Test Click Tourenbericht', () => {
    it('clicks the first tourenbericht', () => {
      cy.visit('https://www.berg-reise-foto.de/tourenbericht-wanderung/wanderung-cascate-del-marmorico-kalabrien/')
  
      cy.url().should('include', 'tourenbericht-wanderung/wanderung-cascate-del-marmorico-kalabrien/')
    })
})

describe('Test Click on Swiper Right Arrow', () => {
  it('clicks through swiper', () => {
    cy.visit('https://www.berg-reise-foto.de/tourenbericht-wanderung/wanderung-cascate-del-marmorico-kalabrien/')
    
    cy.window().then((win) => {
      cy.get('.thumb_inner').should("have.length", 1);

      let number = win.eval( 'document.getElementsByClassName("thumb_inner")[0].childElementCount' );
      cy.get('.thumb_inner').children().should("have.length", number)

      //cy.get('.thumb_inner').children().each(($el, index) => {
      for(let index=0;index<number; index++) {
        cy.log('Index: ', index)
        cy.get('.swiper-button-next').click();
        cy.wait(50)
      }
      //)

    });
  })
})


