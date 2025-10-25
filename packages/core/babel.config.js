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

// For Jest, transform ES modules to CommonJS
if (process.env.NODE_ENV === 'test') {
  plugins.push('babel-plugin-transform-es2015-modules-commonjs')
}

module.exports = {
  presets,
  plugins,
}
