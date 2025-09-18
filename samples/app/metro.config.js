/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable @typescript-eslint/no-var-requires */
// eslint-disable-next-line import/no-extraneous-dependencies
const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config')
const escape = require('escape-string-regexp')
const exclusionList = require('metro-config/src/defaults/exclusionList')
const path = require('path')

const packageDirs = [
  path.resolve(__dirname, '../../packages/core'),
  path.resolve(__dirname, '../../packages/oca'),
  path.resolve(__dirname, '../../packages/verifier'),
]

const watchFolders = [...packageDirs]

const extraExclusionlist = []
const extraNodeModules = {}

for (const packageDir of packageDirs) {
  const pak = require(path.join(packageDir, 'package.json'))
  const modules = Object.keys({
    ...pak.peerDependencies,
    ...pak.devDependencies,
  })
  extraExclusionlist.push(...modules.map((m) => path.join(packageDir, 'node_modules', m)))

  modules.reduce((acc, name) => {
    acc[name] = path.join(__dirname, 'node_modules', name)
    return acc
  }, extraNodeModules)
}

const {
  resolver: { sourceExts, assetExts },
} = getDefaultConfig()

/**
 * Metro configuration
 * https://facebook.github.io/metro/docs/configuration
 *
 * @type {import('metro-config').MetroConfig}
 */
const config = {
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
    blacklistRE: exclusionList(extraExclusionlist.map((m) => new RegExp(`^${escape(m)}\\/.*$`))),
    extraNodeModules: extraNodeModules,
    tslib: path.join(__dirname, 'node_modules/tslib'),
    assetExts: assetExts.filter((ext) => ext !== 'svg'),
    sourceExts: [...sourceExts, 'svg', 'cjs'],
    unstable_enablePackageExports: true,
    unstable_conditionNames: ['react-native', 'browser', 'import', 'require'],
  },
  watchFolders,
}

module.exports = mergeConfig(getDefaultConfig(__dirname), config)
