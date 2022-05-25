describe('My First Test', () => {
    it('clicks the content "type"', () => {
      cy.visit('https://www.berg-reise-foto.de/')
  
      //cy.get('.slick-next').click()
      //cy.get('.slick-prev').click()

      // Should be on a new URL which includes '/commands/actions'
      cy.get('div.rps-blog-cart.slick-slide.slick-current.slick-active').click() //#post-72 > div > div.entry-content > div.rps-wrapper > div > div > div > div.rps-blog-cart.slick-slide.slick-current.slick-active
      cy.url().should('include', 'tourenbericht-wanderung/kampenwand-panoramawanderung-im-chiemgau/')

      //let caption = cy.get('.fotorama__caption__wrap').
      //console.log(caption)
      //let html = document.getElementsByClassName('.fotorama__caption__wrap')[0].innerHTML
      //console.log(html)
      //cy.pause() fotorama__nav__shaft fotorama__grab

      //cy.get('#f0-1 > div').click()
      //cy.get('#f0-2 > div').click()

      cy.get('.fotorama__nav__shaft>.fotorama__nav__frame').each(($el, index, $list) => {
        // $el is a wrapped jQuery element
        console.log('index:', index)
        if (index === 0) {
            console.log($el)        
        }
        if (index < 0) {
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
      

      //cy.get('.leaflet-top.leaflet-right').click()
      /*
      cy.get('.leafmap').dragMapFromCenter({
        // Go 1/6 of map container width to the right (negative direction)
        xMoveFactor: -1 / 6,
        // Go 1/3 of map container height to the top (positive direction)
        yMoveFactor: 1 / 3
      })
      cy.wait(200)
      
      cy.get('.leafmap').hoverMapSelector({
        // Go 1/6 of map container width to the right (negative direction)
        xMoveFactor: 0.0,
        // Go 1/3 of map container height to the top (positive direction)
        yMoveFactor: -0.0
      })
      cy.wait(200)      
      */
      cy.get('.leaflet-top.leaflet-left>img').click()

      cy.get('.legend-item.legend-altitude>rect').click()
      cy.get('.legend-item.legend-altitude>text').click()


     
    })
  })