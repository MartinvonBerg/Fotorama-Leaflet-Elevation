// update screenshots with: >> npx cypress run --env updateSnapshots=true --spec "cypress\integration\site-tests\visual_spec.js"

const sizes = [
    //['iphone-6', 'landscape'],
    //'iphone-6',
    'ipad-2',
    //['ipad-2', 'landscape'],
    [1920, 1080],
    [1400, 2000] // höhe größer als der echte viewport geht nicht
];

const pages = [
    'https://www.berg-reise-foto.de/sitemap/',
    'https://www.berg-reise-foto.de/',
    'https://www.berg-reise-foto.de/tourenbericht-wanderung/kampenwand-panoramawanderung-im-chiemgau/?swcfpc=1'

];

describe('Visual regression tests', () => {
    sizes.forEach((size) => {
        pages.forEach((page) => {
        it(`Should match previous screenshot '${page} Page' When '${size}' resolution`, () => {
            cy.setResolution(size);
            cy.visit(page);
            cy.wait(1000)
            cy.matchImageSnapshot();
        });
        });
    });
});