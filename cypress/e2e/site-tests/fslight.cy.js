/* global assert */
describe('Check some performance metrics', () => {  
    let imgs = []
    it('get all images on page', () => {
        cy.visit('https://www.berg-reise-foto.de/ausbau-citroen-berlingo-zum-micro-campingmobil/')
        cy.get('img').each(($el, index, $list) => {
            // $el is a wrapped jQuery element
                    
            let parent = Cypress.$($el).parent()

            // class wp-image-[number] should be in class
            let imgclass = $el[0].classList.value;
            let classfound = imgclass.indexOf('wp-image-')
            let imgsrc = ''

            if ( classfound > -1) {
                if ('currentSrc' in $el[0]) imgsrc = $el[0].currentSrc
                if ('value' in $el[0].attributes.src ) imgsrc = $el[0].attributes.src.value
            }
            
            let found = imgsrc.indexOf('webp')

            if ( (parent[0].localName === 'a') && ( found > 2 ) ) { 
                expect('data-fslightbox' in parent[0].attributes).to.eq(true)
            }
            
          })
        /* ==== Generated with Cypress Studio ==== */
        cy.get('.thumbnail > a > .attachment-post-thumbnail').click();
        cy.get('.uagb-toc__title > svg').scrollIntoView();
        cy.get('.uagb-toc__title > svg').click();
        cy.get('.uagb-toc__title > svg').click();
         
        cy.get('.wp-image-6764').scrollIntoView();
        cy.get('.wp-image-6764').click();
        cy.wait(500);
        //cy.get('div').should('have.class','fslightbox-toolbar-button ').and('have.title','Close').click();
        
        cy.get('[title="Close"] > svg > .fslightbox-svg-path').click(); //<div class="fslightbox-toolbar-button fslightbox-flex-centered" title="Close">
        //cy.get('#scroll > span').click();
        /* ==== End Cypress Studio ==== */
    })    
})