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
    })    
})