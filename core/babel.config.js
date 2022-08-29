const presets = ['module:metro-react-native-babel-preset']
const plugins = [
  [
    'module-resolver',
    {
      root: ['.'],
      extensions: ['.tsx', 'ts'],
    },
  ],
  [
    'react-native-reanimated/plugin',
    {
      globals: ['__scanCodes'],
    },
  ],
]

if (process.env['ENV'] === 'prod') {
  plugins.push('transform-remove-console')
}

module.exports = {
  presets,
  plugins,
}
