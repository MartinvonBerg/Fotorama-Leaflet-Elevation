describe('Test Click Tourenbericht', () => {
    it('clicks the first tourenbericht', () => {
      cy.visit('https://www.berg-reise-foto.de/')
  
      // Should be on a new URL which includes the correct text
      cy.get('div.rps-blog-cart.slick-slide.slick-current.slick-active').click() //#post-72 > div > div.entry-content > div.rps-wrapper > div > div > div > div.rps-blog-cart.slick-slide.slick-current.slick-active
      cy.url().should('include', 'tourenbericht-wanderung/kampenwand-panoramawanderung-im-chiemgau/')
    })
})
   
describe('Test Click Fotorama and Map', () => {
  it('clicks through fotorama and map', () => {
      cy.get('.fotorama__nav__shaft>.fotorama__nav__frame').each(($el, index, $list) => {
        // $el is a wrapped jQuery element
        console.log('index:', index)
        if (index === 0) {
            console.log($el)        
        }
        if (index > 0) {
          // wrap this element so we can
          // use cypress commands on it
          console.log($el)
          cy.wait(200)
          cy.wrap($el).click()
        }
      })

      cy.get('.fotorama__arr--next').click()
      cy.get('.fotorama__arr--prev').click()

      cy.get('.fotorama__fullscreen-icon').click()
      cy.wait(200)
      cy.get('body').type('{esc}')

      cy.get('.leaflet-top.leaflet-left>img').click()

      cy.get('.leaflet-top.leaflet-left>.leaflet-control-zoom>.leaflet-control-zoom-in').click()
      cy.wait(200)
      cy.get('.leaflet-top.leaflet-left>.leaflet-control-zoom>.leaflet-control-zoom-out').click()
      cy.wait(200)
      cy.get('.leaflet-top.leaflet-left>.leaflet-bar>.leaflet-control-zoom-fullscreen').click()
      cy.wait(200)
      cy.get('.leaflet-top.leaflet-left>.leaflet-bar>.leaflet-control-zoom-fullscreen').click()
      
      cy.get('.leaflet-top.leaflet-left>img').click()

      cy.get('.legend-item.legend-altitude>rect').click()
      cy.get('.legend-item.legend-altitude>text').click()
    })
})

describe('Test Click different Tourenbericht', () => {
  it('clicks the first tourenbericht', () => {
    cy.visit('https://www.berg-reise-foto.de/tourenbericht-skitour/skitour-hochalm-berchtesgadener-alpen/')

   
  })
})

describe('Test Click Fotorama and Map', () => {
  it('clicks through fotorama and map', () => {
      cy.get('.fotorama__nav__shaft>.fotorama__nav__frame').each(($el, index, $list) => {
        // $el is a wrapped jQuery element
        console.log('index:', index)
        if (index === 0) {
            console.log($el)        
        }
        if (index > 0) {
          // wrap this element so we can
          // use cypress commands on it
          console.log($el)
          cy.wait(200)
          cy.wrap($el).click()
        }
      })

      cy.get('.fotorama__arr--next').click()
      cy.get('.fotorama__arr--prev').click()

      cy.get('.fotorama__fullscreen-icon').click()
      cy.wait(200)
      cy.get('body').type('{esc}')

      cy.get('.leaflet-top.leaflet-left>img').click()

      cy.get('.leaflet-top.leaflet-left>.leaflet-control-zoom>.leaflet-control-zoom-in').click()
      cy.wait(200)
      cy.get('.leaflet-top.leaflet-left>.leaflet-control-zoom>.leaflet-control-zoom-out').click()
      cy.wait(200)
      cy.get('.leaflet-top.leaflet-left>.leaflet-bar>.leaflet-control-zoom-fullscreen').click()
      cy.wait(200)
      cy.get('.leaflet-top.leaflet-left>.leaflet-bar>.leaflet-control-zoom-fullscreen').click()
      
      cy.get('.leaflet-top.leaflet-left>img').click()

      cy.get('.legend-item.legend-altitude>rect').click()
      cy.get('.legend-item.legend-altitude>text').click()
    })
})
