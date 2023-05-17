// dieses skript funktioniert, aber das Ergebnis weicht deutlich von manuellem Test ab.
// Das ist nutzlos.
describe('Lighthouse', () => {
  it('should run performance audits using custom thresholds', () => {
        cy.visit('https://www.berg-reise-foto.de');
  
        const customThresholds = {
          performance: 20,
          accessibility: 50,
          seo: 70,
          "best-practices": 45,
          'first-contentful-paint': 20000,
          'largest-contentful-paint': 30000,
          'cumulative-layout-shift': 1,
          'total-blocking-time': 5000,
        };
  
        const desktopConfig = {
          formFactor: 'desktop',
          screenEmulation: { disabled: true },
        };
  
        cy.lighthouse(customThresholds, desktopConfig);
      });
});