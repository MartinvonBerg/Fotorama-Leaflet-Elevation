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
