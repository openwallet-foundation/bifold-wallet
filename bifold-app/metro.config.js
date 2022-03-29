/* eslint-disable import/order */
/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable @typescript-eslint/no-var-requires */
const escape = require('escape-string-regexp')
const blacklist = require('metro-config/src/defaults/exclusionList')
const path = require('path')

const pak = require('../package.json')

// react-native >= 0.57

const modules = Object.keys({
  ...pak.peerDependencies,
})

const watchFolders = [path.resolve(__dirname, '..'), path.resolve(__dirname)]

const { getDefaultConfig } = require('metro-config')
module.exports = (async () => {
  const {
    resolver: { sourceExts, assetExts },
  } = await getDefaultConfig()
  const metroConfig = {
    projectRoot: __dirname,
    /*resetCache: true,*/
    transformer: {
      babelTransformerPath: require.resolve('react-native-svg-transformer'),
      getTransformOptions: async () => ({
        transform: {
          experimentalImportSupport: false,
          inlineRequires: true,
        },
      }),
    },
    resolver: {
      blacklistRE: blacklist(
        modules.map((m) => new RegExp(`^${escape(path.join(__dirname, '../', 'node_modules', m))}\\/.*$`))
      ),
      extraNodeModules: modules.reduce((acc, name) => {
        acc[name] = path.join(__dirname, 'node_modules', name)
        return acc
      }, {}),
      assetExts: assetExts.filter((ext) => ext !== 'svg'),
      sourceExts: [...sourceExts, 'svg'],
    },
    watchFolders,
  }
  // eslint-disable-next-line no-console
  console.dir(metroConfig)
  return metroConfig
})()
