const presets = ['module:metro-react-native-babel-preset']
const plugins = [
  [
    'module-resolver',
    {
      root: ['.'],
      extensions: ['.tsx', 'ts'],
      alias: {
        crypto: "react-native-quick-crypto",
        stream: "stream-browserify",
        buffer: "@craftzdog/react-native-buffer"
      }
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
