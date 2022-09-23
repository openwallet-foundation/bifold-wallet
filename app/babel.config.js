const presets = ['module:metro-react-native-babel-preset']
const plugins = [
  [
    'react-native-reanimated/plugin',
    {
      globals: ['__scanCodes'],
    },
  ],
]

module.exports = {
  presets,
  plugins,
};