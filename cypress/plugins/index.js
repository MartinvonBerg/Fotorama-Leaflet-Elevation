/// <reference types="cypress" />
// ***********************************************************
// This example plugins/index.js can be used to load plugins
//
// You can change the location of this file or turn off loading
// the plugins file with the 'pluginsFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/plugins-guide
// ***********************************************************

// This function is called when a project is opened or re-opened (e.g. due to
// the project's config changing)

/**
 * @type {Cypress.PluginConfig}
 */
// eslint-disable-next-line no-unused-vars
//module.exports = (on, config) => {
  // `on` is used to hook into various events Cypress emits
  // `config` is the resolved Cypress config
//}

// add brave to the available browsers
// sourve: https://github.com/cypress-io/cypress/issues/5848
// cypress/plugins/index.js
const { promises: { readdir } } = require('fs')

const getDirectories = async source =>
  (await readdir(source, { withFileTypes: true }))
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name)

const findBrowser = async () => {
  const browserPath =
    'C:/Program Files (x86)/BraveSoftware/Brave-Browser/Application'

  const version = (await getDirectories(browserPath))[0]

  const majorVersion = parseInt(version.split('.')[0])

  return {
    name: 'Brave',
    channel: 'stable',
    family: 'chromium',
    displayName: 'Brave',
    version,
    path: browserPath + '/brave.exe',
    majorVersion,
  }
}

module.exports = (on, config) => {
  return findBrowser().then((browser) => {
    return {
      browsers: config.browsers.concat(browser),
    }
  })
}

// Configure Lighthouse CLI
// source: https://applitools.com/blog/using-cypress-google-lighthouse-performance-testing/
// Because we want to run lighthouse inside the same browser as Cypress rather than opening a new one, the following code needs to be added in your plugins/index.js
/*
const { lighthouse, prepareAudit } = require('cypress-audit');

module.exports = (on, config) => {
  on('before:browser:launch', (browser = {}, launchOptions) => {
    prepareAudit(launchOptions);
  });

  on('task', {
    lighthouse: lighthouse(),
  });
};
*/

// Visual regression testing
// source: https://medium.com/norwich-node-user-group/visual-regression-testing-with-cypress-io-and-cypress-image-snapshot-99c520ccc595
const {
  addMatchImageSnapshotPlugin,
 } = require('cypress-image-snapshot/plugin');
 module.exports = (on, config) => {
   addMatchImageSnapshotPlugin(on, config);
 };