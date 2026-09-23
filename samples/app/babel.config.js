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
    // @owf/mdoc (via credo 0.7 openid4vc) ships static class blocks
    '@babel/plugin-transform-class-static-block',
    // MUST be last:
    'react-native-worklets/plugin',
  ],
}
