const presets = ['module:@react-native/babel-preset']
const plugins = [
  '@babel/plugin-transform-export-namespace-from',
  '@babel/plugin-transform-class-static-block',
  [
    'module-resolver',
    {
      root: ['.'],
      extensions: ['.tsx', '.ts', '.js', '.jsx', '.json'],
    },
  ],
]

if (process.env['ENV'] === 'prod') {
  plugins.push('transform-remove-console')
}

// react-native-worklets plugin must be listed last (moved out of reanimated in v4)
plugins.push('react-native-worklets/plugin')

module.exports = {
  presets,
  plugins,
}
