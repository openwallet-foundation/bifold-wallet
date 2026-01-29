module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    [
      'module-resolver',
      {
        root: ['.'],
        extensions: ['.tsx', '.ts', '.js', '.jsx', '.json', '.mjs'],
      },
    ],
    '@babel/plugin-transform-export-namespace-from',
    // MUST be last:
    'react-native-reanimated/plugin',
  ],
}
