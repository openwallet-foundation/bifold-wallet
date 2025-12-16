module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    [
      'module-resolver',
      {
        root: ['.'],
        extensions: ['.tsx', '.ts', '.js', '.jsx', '.json'],
      },
    ],
    '@babel/plugin-transform-export-namespace-from',
    // MUST be last:
    'react-native-reanimated/plugin',
  ],
}
