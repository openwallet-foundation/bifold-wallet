const presets = ['module:@react-native/babel-preset']
const plugins = [
  [
    'module-resolver',
    {
      root: ['.'],
      extensions: ['.tsx', 'ts'],
    },
  ],
]

if (process.env['ENV'] === 'prod') {
  plugins.push('transform-remove-console')
}

// react-native-reanimated plugin must be listed last
plugins.push('react-native-reanimated/plugin')

module.exports = {
  presets,
  plugins,
}
