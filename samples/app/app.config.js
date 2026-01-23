/* eslint-disable @typescript-eslint/no-var-requires */
const appJson = require('./app.json')
const pkg = require('./package.json')

module.exports = {
  expo: {
    name: appJson.displayName || appJson.name || 'Bifold',
    slug: 'aries-bifold',
    version: pkg.version,
    platforms: ['ios', 'android'],
  },
}
