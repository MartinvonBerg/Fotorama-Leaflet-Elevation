import { defineConfig } from 'cypress'

export default defineConfig({
  viewportWidth: 1200,
  viewportHeight: 1200,
  scrollBehavior: false,
  video: false,
  e2e: {
    // We've imported your old cypress plugins here.
    // You may want to clean this up later by importing these.
    setupNodeEvents(on, config) {
      return require('./cypress/plugins/index.js')(on, config)
    },
    experimentalStudio: true
  },
})
