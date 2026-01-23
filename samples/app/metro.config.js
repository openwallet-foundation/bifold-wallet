/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable @typescript-eslint/no-var-requires */
// eslint-disable-next-line import/no-extraneous-dependencies
const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config')
const path = require('path')
const escape = require('escape-string-regexp')

const exclusionList = (additionalExclusions = []) => {
  const defaults = [/\/__tests__\/.*/]

  const escapeRegExp = (pattern) => {
    if (pattern instanceof RegExp) {
      return pattern.source.replace(/\/|\\\//g, `\\${path.sep}`)
    }
    if (typeof pattern === 'string') {
      const escaped = pattern.replace(/[\-\[\]\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&')
      return escaped.replaceAll('/', `\\${path.sep}`)
    }
    throw new Error(`Expected exclusionList to be called with RegExp or string, got: ${typeof pattern}`)
  }

  return new RegExp(`(${additionalExclusions.concat(defaults).map(escapeRegExp).join('|')})$`)
}

const packageDirs = [
  path.resolve(__dirname, '../../packages/core'),
  path.resolve(__dirname, '../../packages/oca'),
  path.resolve(__dirname, '../../packages/verifier'),
]

const watchFolders = [...packageDirs]

const extraExclusionList = []
const extraNodeModules = {}

for (const packageDir of packageDirs) {
  const pak = require(path.join(packageDir, 'package.json'))
  const modules = Object.keys({
    ...pak.peerDependencies,
    ...pak.devDependencies,
  })
  extraExclusionList.push(...modules.map((m) => path.join(packageDir, 'node_modules', m)))

  modules.reduce((acc, name) => {
    acc[name] = path.join(__dirname, 'node_modules', name)
    return acc
  }, extraNodeModules)
}

const defaultConfig = getDefaultConfig(__dirname)
const {
  resolver: { sourceExts, assetExts },
} = defaultConfig

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const combinedWatchFolders = Array.from(new Set([...(defaultConfig.watchFolders || []), ...watchFolders]))

const config = mergeConfig(defaultConfig, {
  transformer: {
    ...defaultConfig.transformer,
    babelTransformerPath: require.resolve('react-native-svg-transformer'),
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: true,
      },
    }),
  },
  resolver: {
    ...defaultConfig.resolver,
    blockList: exclusionList(extraExclusionList.map((m) => new RegExp(`^${escape(m)}[/\\\\].*$`))),
    extraNodeModules: {
      ...(defaultConfig.resolver.extraNodeModules || {}),
      ...extraNodeModules,
    },
    tslib: path.join(__dirname, 'node_modules/tslib'),
    assetExts: assetExts.filter((ext) => ext !== 'svg'),
    sourceExts: [...sourceExts, 'svg', 'cjs'],
    unstable_enablePackageExports: true,
    unstable_conditionNames: ['react-native', 'require', 'browser'],
  },
  watchFolders: combinedWatchFolders,
})

module.exports = config
