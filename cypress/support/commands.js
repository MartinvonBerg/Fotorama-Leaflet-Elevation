// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })

// # cy.get('#map-canvas').dragMapFromCenter({ xMoveFactor: 0.25, yMoveFactor: -0.5 })
//
// Allows dragging a Leaflet map by the given amounts. A factor of 1 means the map
// will be dragged the whole width of the map canvas in X direction and the whole
// height of the map canvas in Y direction.
// source: https://stackoverflow.com/questions/60987787/test-dragging-a-leaflet-map-in-cypress
Cypress.Commands.add(
    'dragMapFromCenter',
    { prevSubject: 'element' },
    (element, { xMoveFactor, yMoveFactor }) => {
      // Get the raw HTML element from jQuery wrapper
      const canvas = element.get(0);
      const rect = canvas.getBoundingClientRect();
      const center = {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2
      };
      
      // Start dragging from the center of the map
      cy.log('mousedown', {
        clientX: center.x,
        clientY: center.y
      });
      canvas.dispatchEvent(
        new MouseEvent('mousedown', {
          clientX: center.x,
          clientY: center.y
        })
      );
  
      // Let Leaflet know the mouse has started to move. The diff between
      // mousedown and mousemove event needs to be large enough so that Leaflet
      // will really think the mouse is moving and not that it was a click where
      // the mouse moved just a tiny amount.
      cy.log('mousemove', {
        clientX: center.x,
        clientY: center.y + 5
      });
      canvas.dispatchEvent(
        new MouseEvent('mousemove', {
          clientX: center.x,
          clientY: center.y + 5,
          bubbles: true
        })
      );
  
      // After Leaflet knows mouse is moving, we move the mouse as depicted by the options.
      cy.log('mousemove', {
        clientX: center.x + rect.width * xMoveFactor,
        clientY: center.y + rect.height * yMoveFactor
      });
      canvas.dispatchEvent(
        new MouseEvent('mousemove', {
          clientX: center.x + rect.width * xMoveFactor,
          clientY: center.y + rect.height * yMoveFactor,
          bubbles: true
        })
      );
  
      // Now when we "release" the mouse, Leaflet will fire a "dragend" event and
      // the search should register that the drag has stopped and run callbacks.
      cy.log('mouseup', {
        clientX: center.x + rect.width * xMoveFactor,
        clientY: center.y + rect.height * yMoveFactor
      });
      requestAnimationFrame(() => {
        canvas.dispatchEvent(
          new MouseEvent('mouseup', {
            clientX: center.x + rect.width * xMoveFactor,
            clientY: center.y + rect.height * yMoveFactor,
            bubbles: true
          })
        );
      });
    }
);

Cypress.Commands.add(
'hoverMapSelector',
{ prevSubject: 'element' },
(element, { xMoveFactor, yMoveFactor }) => {
  // Get the raw HTML element from jQuery wrapper
  const canvas = element.get(0);
  const rect = canvas.getBoundingClientRect();
  const center = {
    x: rect.left + rect.width / 2,
    y: rect.top + rect.height / 2
  };
  
  // Let Leaflet know the mouse has started to move. The diff between
  // mousedown and mousemove event needs to be large enough so that Leaflet
  // will really think the mouse is moving and not that it was a click where
  // the mouse moved just a tiny amount.
   // After Leaflet knows mouse is moving, we move the mouse as depicted by the options.
   canvas.dispatchEvent(
    new MouseEvent('mousemove', {
      clientX: center.x,
      clientY: center.y,
      bubbles: true
    })
  );
   cy.log('mousemove', {
    clientX: center.x + rect.width * xMoveFactor,
    clientY: center.y + rect.height * yMoveFactor
  });
  canvas.dispatchEvent(
    new MouseEvent('mousemove', {
      clientX: center.x + rect.width * xMoveFactor,
      clientY: center.y + rect.height * yMoveFactor,
      bubbles: true
    })
  );
  canvas.dispatchEvent(
    new MouseEvent('rightclick'));
}
);

// Click on a marker in the leaflet marker pane to open the next image in fotorama
// It works only for the first marker in the list of childNodes, which is updated on every click.
Cypress.Commands.add( 'clickOnMarker', () => {
  cy.get('.leaflet-pane.leaflet-marker-pane.leaflet-zoom-hide').each(($el) => {
    let nodes = $el[0].childNodes;
    let k = 0
    
    nodes.forEach( element => {
      if (k === 0) {
        cy.wait(100)
        element.focus()
        cy.wait(100)
        element.click()
        cy.wait(1000)
      k += 1
      }
    }
    );
  })
});
