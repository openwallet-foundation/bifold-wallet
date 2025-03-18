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

module.exports = {
  presets,
  plugins,
}
