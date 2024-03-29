describe('Test Click Tourenbericht', () => {
    it('clicks the first tourenbericht', () => {
      cy.visit('https://www.berg-reise-foto.de/tourenbericht-skitour/skitour-auf-den-sextner-stein-in-sudtirol/')
  
      // Should be on a new URL which includes the correct text
      cy.get('div.rps-blog-cart.slick-slide.slick-current.slick-active').click() //#post-72 > div > div.entry-content > div.rps-wrapper > div > div > div > div.rps-blog-cart.slick-slide.slick-current.slick-active
      cy.url().should('include', 'tourenbericht-skitour/skitour-auf-den-sextner-stein-in-sudtirol/')
    })
})

describe('Test Click on Fotorama and on Map', () => {
  it('clicks through fotorama and map', () => {
      cy.get('.fotorama__nav__shaft>.fotorama__nav__frame').each(($el, index, $list) => {
        // $el is a wrapped jQuery element
        //console.log('index:', index)
        if (index === 0) {
            console.log($el)        
        }
        if (index > 0) {
          // wrap this element so we can
          // use cypress commands on it
          //console.log($el)
          cy.wait(1000)
          cy.wrap($el).click()
        }
      })

      cy.get('.fotorama__arr--next').click()
      cy.get('.fotorama__arr--prev').click()

      if (Cypress.browser.name != 'firefox') {
        cy.get('.fotorama__fullscreen-icon').click()
        cy.wait(200)
        cy.get('body').type('{esc}')
      }

      cy.get('.leaflet-top.leaflet-left>img').click()

      cy.get('.leaflet-top.leaflet-left>.leaflet-control-zoom>.leaflet-control-zoom-in').click()
      cy.wait(200)
      cy.get('.leaflet-top.leaflet-left>.leaflet-control-zoom>.leaflet-control-zoom-out').click()
      cy.wait(200)
      // Ignore test if Cypress is running via Firefox.
      // This test is not recorded to the Cypress Dashboard
      
      cy.get('.leaflet-top.leaflet-left>.leaflet-bar>.leaflet-control-zoom-fullscreen').click()
      cy.wait(200)
      cy.get('.leaflet-top.leaflet-left>.leaflet-bar>.leaflet-control-zoom-fullscreen').click()
            
      cy.get('.leaflet-top.leaflet-left>img').click()

      cy.get('.legend-item.legend-altitude>rect').click()
      cy.get('.legend-item.legend-altitude>text').click()

      //click on fotorama markers
      cy.log('Clicking in Map Markers')
      for (let index = 0; index < 30; index++) {  
        cy.clickOnMarker()
      }
      
    })
})
